# Architecture — ContractScan AI

> Technical deep dive into the system design, data flow, and engineering decisions behind ContractScan AI.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [System Diagram](#system-diagram)
3. [Data Flow](#data-flow)
4. [Component Architecture](#component-architecture)
5. [API Design Decisions](#api-design-decisions)
6. [Prompt Engineering Approach](#prompt-engineering-approach)
7. [Error Handling Strategy](#error-handling-strategy)
8. [Trade-offs Made](#trade-offs-made)

---

## System Overview

ContractScan AI is a single-page Next.js application with one serverless API route. There is no database, no authentication, and no persistent storage. The entire system is stateless — each analysis is a standalone request/response cycle.

The core intelligence lives in a carefully crafted system prompt that instructs the Groq-hosted Llama 3.3 70B model to perform a 3-step reasoning process and return structured JSON.

```
Browser (React SPA)
    │
    │  User uploads PDF or pastes text
    │
    ├─ If PDF: pdfjs-dist extracts text (client-side)
    │
    ▼
POST /api/analyze  { text: "..." }
    │
    │  Server validates input
    │  Calls Groq API with system prompt
    │  Parses JSON from LLM response
    │
    ▼
JSON response → RiskReport component renders cards
```

---

## System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BROWSER (Client)                            │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  page.tsx (Main UI)                                          │  │
│  │                                                               │  │
│  │  ┌─────────────┐    ┌──────────────┐    ┌──────────────────┐  │  │
│  │  │  PDF Upload  │    │  Text Area   │    │  Analyse Button  │  │  │
│  │  │  (drag-drop) │    │  (paste)     │    │                  │  │  │
│  │  └──────┬───────┘    └──────┬───────┘    └────────┬─────────┘  │  │
│  │         │                   │                      │            │  │
│  │         ▼                   │                      │            │  │
│  │  ┌──────────────┐           │                      │            │  │
│  │  │ pdfExtractor  │           │                      │            │  │
│  │  │ (pdfjs-dist)  │           │                      │            │  │
│  │  └──────┬───────┘           │                      │            │  │
│  │         │  extracted text   │  pasted text          │            │  │
│  │         └───────────────────┴──────────────────────┘            │  │
│  │                             │                                   │  │
│  │                             ▼                                   │  │
│  │                    POST /api/analyze                            │  │
│  │                    { text: "..." }                              │  │
│  │                             │                                   │  │
│  │                             ▼                                   │  │
│  │  ┌─────────────┐   ┌────────────────┐   ┌──────────────────┐   │  │
│  │  │ AgentSteps  │   │  RiskReport    │   │    RiskCard      │   │  │
│  │  │ (progress)  │   │  (container)   │   │  (per clause)    │   │  │
│  │  └─────────────┘   └────────────────┘   └──────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │  HTTP POST (JSON)
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS SERVER (API Route)                       │
│                                                                     │
│  src/app/api/analyze/route.ts                                       │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  1. Validate input (type, length 100-200K chars)            │    │
│  │  2. Build messages array with SYSTEM_PROMPT + user text     │    │
│  │  3. Call Groq SDK → llama-3.3-70b-versatile (temp=0.2)     │    │
│  │  4. Strip markdown fences if present                        │    │
│  │  5. Parse JSON response                                     │    │
│  │  6. Validate structure (documentType, clauses, gapAnalysis) │    │
│  │  7. Return JSON to client                                   │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  src/lib/prompts.ts — 3-step agent system prompt (~5.7 KB)         │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │  Groq SDK (HTTPS)
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     GROQ CLOUD API                                  │
│                                                                     │
│  Model: llama-3.3-70b-versatile                                    │
│  Max tokens: 8192                                                   │
│  Temperature: 0.2                                                   │
│                                                                     │
│  Receives system prompt + contract text                             │
│  Returns structured JSON risk analysis                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Happy Path (end-to-end)

```
1. User action
   ├─ PDF: File dragged/clicked → pdfExtractor.ts converts to text
   └─ Text: Pasted directly into textarea

2. Frontend sends POST /api/analyze { text }

3. API route validates:
   ├─ text exists and is a string          → 400 if not
   ├─ length >= 100 chars                  → 400 if not
   └─ length <= 200,000 chars              → 400 if not

4. API route calls Groq:
   groq.chat.completions.create({
     model: 'llama-3.3-70b-versatile',
     max_tokens: 8192,
     temperature: 0.2,
     messages: [
       { role: 'system', content: SYSTEM_PROMPT },
       { role: 'user',   content: "Analyze this contract:\n\n{text}" }
     ]
   })

5. Response processing:
   ├─ Strip markdown code fences (```json ... ```)
   ├─ JSON.parse() the result
   ├─ Validate: has documentType OR clauses OR gapAnalysis
   └─ Return parsed JSON (200)

6. Frontend receives JSON:
   ├─ RiskReport component renders header (doc type + overall risk badge)
   ├─ Clauses sorted by severity (red → amber → green)
   ├─ Each clause rendered as a RiskCard with coloured left border
   └─ Gap analysis rendered as a warning list
```

### Fallback Path (JSON parse failure)

If the LLM returns malformed JSON (rare but possible):

```
5b. JSON.parse() throws
    ├─ Return fallback response:
    │   {
    │     documentType: "Raw Analysis",
    │     overallRisk: "medium",
    │     clauses: [],
    │     gapAnalysis: [],
    │     _rawOutput: "<raw LLM text>"
    │   }
    └─ Frontend RiskReport detects empty clauses + _rawOutput
        and renders raw JSON in a <pre> block
```

---

## Component Architecture

### Frontend Components

```
page.tsx (Root — client component)
├── State: file, text, isLoading, error, result, demoLoaded
├── Effects: ?demo=true URL param detection
│
├── Input Panel (left column)
│   ├── Drop Zone (drag-drop PDF upload)
│   ├── Textarea (paste contract text)
│   ├── Analyse Button (+ Load Demo Contract button)
│   └── AgentSteps (3-step progress indicator)
│
└── Output Panel (right column)
    ├── Error Banner (conditional)
    ├── Loading Spinner (conditional)
    ├── RiskReport (conditional — the main result)
    │   ├── Header (document type + overall risk badge)
    │   ├── Clause Cards (sorted red → green)
    │   │   └── RiskCard × N
    │   │       ├── Badge (Low Risk / Caution / High Risk)
    │   │       ├── Title + Summary
    │   │       ├── Recommendation
    │   │       └── Expandable Details section
    │   └── Gap Analysis Section
    │       └── Gap items (icon + clause + importance + suggestion)
    └── Empty State (placeholder when no analysis yet)
```

### Key Component Interfaces

**RiskCard props:**
```typescript
interface RiskCardProps {
  title: string;
  summary: string;
  riskLevel: 'green' | 'amber' | 'red';
  recommendation: string;
  details?: string;
}
```

**RiskReport receives the full API response:**
```typescript
interface AnalysisResult {
  documentType?: string;
  overallRisk?: 'low' | 'medium' | 'high';
  clauses?: Clause[];
  gapAnalysis?: GapItem[];
}
```

**AgentSteps:**
- Accepts `isLoading` and optional `currentStep` props
- When `currentStep` is not provided (current behaviour), auto-advances through steps on a timer (5s, 12s) to simulate progress during the API call
- Three steps: "Identifying document type" → "Assessing clause risks" → "Running gap analysis"

### Backend Module Map

```
src/app/api/analyze/route.ts
├── Imports: Groq SDK, SYSTEM_PROMPT
├── POST handler:
│   ├── Input validation (type, min/max length)
│   ├── Groq API call
│   ├── Response parsing (markdown fence stripping, JSON.parse)
│   ├── Structure validation
│   └── Error classification (auth, rate limit, generic)
│
src/lib/prompts.ts
└── SYSTEM_PROMPT (exported constant, ~5.7 KB)
    ├── Role definition
    ├── Step 1 — Document Type Identification
    ├── Step 2 — Clause Extraction & Risk Assessment
    │   └── Risk Assessment Guidelines (red/amber/green criteria)
    ├── Step 3 — Gap Analysis
    ├── Overall Risk Rating rules
    ├── JSON output format specification
    └── Important rules (6 constraints)

src/lib/pdfExtractor.ts
└── extractTextFromPDF(file: File): Promise<string>
    ├── Dynamic import of pdfjs-dist (avoids SSR issues)
    ├── CDN-hosted worker (pdf.worker.min.mjs)
    ├── Page-by-page text extraction
    └── Error wrapping with descriptive messages
```

---

## API Design Decisions

### Why a single API endpoint?

The analysis is non-interactive — the user provides input and gets a result. There is no conversational loop, no streaming, and no intermediate state that the backend needs to expose. A single `POST /api/analyze` endpoint keeps the architecture simple and avoids unnecessary complexity.

### Why server-side LLM call (not client-side)?

1. **API key security** — The Groq API key lives in server-side environment variables and never reaches the browser.
2. **CORS / SDK compatibility** — The Groq Node.js SDK is designed for server environments.
3. **Error handling** — Server-side code can classify errors (auth, rate limit, timeout) and return appropriate HTTP status codes.

### Why client-side PDF extraction?

PDF text extraction is done in the browser using `pdfjs-dist` before sending the text to the API. This avoids:

- Uploading potentially large binary files to the server
- Server-side PDF parsing dependencies (which can be problematic in serverless environments)
- The need for file storage or multipart form handling

The trade-off is that complex PDFs (scanned images, unusual encodings) may not extract cleanly. The textarea fallback allows users to paste text directly when PDF extraction fails.

### Why temperature 0.2?

Contract analysis requires consistency and precision. A low temperature reduces creative variation in the output, making the JSON structure more reliable and the risk assessments more reproducible. It is not set to 0 to retain some flexibility in handling unusual contract types.

### Why max_tokens 8192?

A thorough analysis of a complex contract can produce 10-20 clauses plus gap analysis, each with summaries and recommendations. 8192 tokens provides enough headroom for detailed output while staying within reasonable response time and cost bounds.

---

## Prompt Engineering Approach

The system prompt in `src/lib/prompts.ts` is the core intellectual property of the application. It is ~5.7 KB of carefully structured instructions.

### Structure

The prompt follows a strict hierarchical organisation:

1. **Role definition** — "You are ContractScan AI — an expert legal analysis agent"
2. **Three sequential steps** — each with clear input/output expectations
3. **Risk assessment guidelines** — explicit criteria for red / amber / green
4. **Output format specification** — exact JSON schema with field descriptions
5. **Hard rules** — 6 constraints that prevent common LLM failure modes

### Key Design Principles

**Explicit risk criteria** — The prompt doesn't just say "assess risk". It lists specific conditions that should trigger each risk level. This reduces subjectivity and makes the output more consistent across runs:

- Red: one-sided power, unlimited liability, hidden clauses, broad non-competes
- Amber: unusual but not harmful, vague terms, one-sided jurisdiction
- Green: standard, balanced, clear

**Plain-English mandate** — The prompt explicitly requires that summaries be understandable by "someone with zero legal knowledge" and later "a 16-year-old". This prevents the model from falling back on legal jargon.

**JSON-only output** — The prompt ends with a strong instruction: "You MUST return ONLY valid JSON. No markdown, no code fences, no commentary before or after the JSON." Despite this, the API route still handles markdown code fences as a fallback, because LLMs occasionally wrap JSON in ` ```json ``` ` blocks.

**Conservative stance** — The prompt instructs the model to "never reassure the user that something is fine when it might not be" and to "flag anything unusual". This bias toward caution is intentional for a tool aimed at non-lawyers.

### Single-call vs. Multi-call Architecture

The current design runs all 3 steps in a single LLM call. This was chosen because:

- **Lower latency** — One API round-trip vs. three sequential calls
- **Simpler error handling** — One call to manage, not a chain
- **Better context** — The model sees the full contract context throughout all 3 steps

The trade-off is that the 3-step progress indicator on the frontend is simulated (timer-based) rather than reflecting actual LLM progress. A streaming or multi-call architecture would provide real progress but at the cost of significantly higher complexity.

---

## Error Handling Strategy

Errors are handled at three levels:

### 1. Input Validation (API Route)

```
Missing text        → 400 { error: "Contract text is required." }
Too short (<100)    → 400 { error: "The document is too short..." }
Too long (>200K)    → 400 { error: "The document is too long..." }
```

These are fast, synchronous checks that fail before any LLM call is made.

### 2. LLM Response Failures (API Route)

```
Empty response      → 500 { error: "No response from AI..." }
Malformed JSON      → 200 with fallback structure (documentType: "Raw Analysis")
Missing fields      → 200 with fallback structure
```

The JSON parse failure path is intentionally a 200 (not 500) because the analysis may still be useful even if the structure is imperfect. The `_rawOutput` field carries the raw LLM text so the user sees something.

### 3. Groq API Errors (API Route)

Errors from the Groq SDK are classified by message content:

```
"API key" / "authentication" / "401"  → 500 (config error — support message)
"rate limit" / "429" / "overloaded"   → 503 (service busy — retry message)
Everything else                        → 500 (generic error with message)
```

### 4. Frontend Error Handling

- Network errors from `fetch()` are caught and displayed in a red banner
- Non-OK HTTP responses extract the `error` field from the JSON body
- The `finally` block always sets `isLoading = false` to prevent UI stuck states
- PDF extraction errors throw descriptive messages that surface in the same error banner

### 5. PDF Extraction Errors

`pdfExtractor.ts` wraps all errors with the filename:

```
Error: Failed to extract text from PDF "contract.pdf": <original error>
```

This gives the user enough context to understand what went wrong.

---

## Trade-offs Made

### Intentional Trade-offs

| Decision | Benefit | Cost | Rationale |
|----------|---------|------|-----------|
| **Single LLM call** (3 steps in 1) | Low latency, simple architecture | Simulated progress indicator | Speed and simplicity matter more for a hackathon demo |
| **Client-side PDF extraction** | No file upload, no server storage, no multipart handling | Complex/scanned PDFs may fail | Textarea paste fallback covers edge cases |
| **No database** | Zero infrastructure, instant deploy | No history, no persistence | The app is a point-in-time analysis tool |
| **No authentication** | Zero friction to try | No usage limits or user accounts | Open access aligns with educational purpose |
| **Groq + Llama 3.3 70B** | Fast inference, good quality, free tier available | Vendor lock-in, model-specific prompt tuning | Speed is critical for UX; model can be swapped |
| **Temperature 0.2** | Consistent, reproducible analyses | Less creative edge-case handling | Consistency matters more for legal analysis |
| **Simulated progress steps** | Visual feedback during the wait | Not reflecting actual LLM progress | Real progress would require streaming architecture |
| **Markdown fence stripping** | Handles common LLM output quirk | Extra parsing step | Pragmatic defence against a known LLM behaviour |
| **Sorted clauses (red first)** | Most important risks seen first | User might miss green clauses at bottom | Attention should focus on problems first |

### Known Limitations

1. **No PDF image/scanned text support** — `pdfjs-dist` extracts text layers only. Scanned PDFs produce empty text.
2. **Token limit** — Very long contracts (approaching 200K characters) may produce truncated analyses due to the 8192 max_tokens output limit.
3. **Single language output** — The prompt asks for English output even for non-English contracts. Quality may degrade for non-English inputs.
4. **No streaming** — The user sees nothing until the full response arrives. A streaming architecture would improve perceived performance.
5. **Rate limit sensitivity** — Groq's free tier has strict rate limits. Rapid successive analyses will hit 429 errors.
6. **Progress is fake** — The 3-step indicator advances on a timer, not based on actual LLM progress.
