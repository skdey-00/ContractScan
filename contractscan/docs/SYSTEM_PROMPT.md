# ContractScan AI — System Prompt Design Documentation

> Source: `src/lib/prompts.ts`
> Consumed by: `src/app/api/analyze/route.ts` (Groq API, `llama-3.3-70b-versatile`, temperature 0.2)

---

## 1. Overview

The ContractScan AI system prompt is the core intellectual property of the product. It transforms a general-purpose LLM into a structured legal-analysis agent that helps non-lawyers understand contracts. The prompt is a single, self-contained system message (~5.7 KB) that defines:

- **Persona** — who the agent is and who it serves
- **Reasoning pipeline** — a mandatory three-step analysis process
- **Risk framework** — concrete criteria for green / amber / red ratings
- **Output contract** — a rigid JSON schema the frontend expects

The design philosophy is **prompt-as-program**: everything the agent needs to know is baked into one system message. There are no follow-up turns, no tool calls, and no external knowledge retrieval. The user's contract text arrives as the sole user message, and the agent responds with one JSON blob.

This approach was chosen for:

- **Determinism** — a single-shot call with low temperature (0.2) produces consistent, repeatable results
- **Speed** — no multi-turn conversation overhead; results arrive in one API round-trip
- **Simplicity** — no agent framework, no orchestration layer, no external tools to maintain
- **Cost efficiency** — one call per analysis, no token waste on conversational back-and-forth

---

## 2. Three-Step Agent Architecture

The prompt enforces a sequential reasoning pipeline. Each step builds on the previous one, and together they produce a comprehensive analysis.

### Step 1 — Document Type Identification

**What happens:** The agent reads the full contract text and determines:

1. **Contract type** — e.g., "Non-Disclosure Agreement", "Freelance Service Contract", "Employment Offer Letter", "SaaS Terms of Service", "Vendor Agreement", "Residential Lease Agreement", etc.
2. **Expected standard clauses** — the agent builds a mental checklist of what a well-drafted contract of this type *should* contain.

**Why it matters:** This step sets the reference framework for Step 3 (gap analysis). Without knowing what's standard for a given contract type, the agent cannot identify what's missing. It also contextualizes risk — a termination clause that's normal in an employment contract might be alarming in a freelance agreement.

**Example:** For a "Residential Lease Agreement", the agent would expect: rent amount, security deposit, lease duration, maintenance responsibilities, termination notice, late payment penalties, etc.

### Step 2 — Clause Extraction and Risk Assessment

**What happens:** The agent walks through the document clause by clause. For each identified clause, it produces:

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Short clause name (e.g., "Rent Escalation", "Confidentiality") |
| `summary` | Yes | Plain-English explanation written for zero legal knowledge |
| `riskLevel` | Yes | `"green"`, `"amber"`, or `"red"` |
| `recommendation` | Yes | Specific action the user should take |
| `details` | No | Longer explanation of *why* the clause is flagged |

**Key requirements enforced by the prompt:**

- Extract **all** clauses (8–20 typical), not just the risky ones
- Be **specific** — quote key numbers, durations, and conditions from the contract
- Write for a **16-year-old** — no legal jargon without explanation
- Be **conservative** — flag anything unusual, never falsely reassure

**Example output:**

```json
{
  "title": "Automatic Renewal",
  "summary": "This lease automatically renews for another full year unless you give 60 days written notice. The rent increases by 8% each renewal period.",
  "riskLevel": "amber",
  "recommendation": "Ask the landlord to change this to month-to-month renewal after the initial term, and cap the annual increase at 5%.",
  "details": "Automatic renewal clauses are common, but a 60-day notice window is relatively short and an 8% increase is above typical inflation. Combined, these could lock you into paying significantly more with limited time to plan."
}
```

### Step 3 — Gap Analysis

**What happens:** The agent compares the clauses found in Step 2 against the standard clauses identified in Step 1. Any expected clause that is absent (or so thin it's "effectively absent") is reported as a gap.

For each gap:

| Field | Description |
|-------|-------------|
| `clause` | Name of the missing clause (e.g., "Dispute Resolution") |
| `importance` | `"high"`, `"medium"`, or `"low"` |
| `suggestion` | What the user should ask to add, in plain English |

**Example gaps for a Freelance Contract missing key clauses:**

```json
{
  "clause": "Intellectual Property Ownership",
  "importance": "high",
  "suggestion": "Add a clause specifying who owns the work product. Without this, the freelancer typically retains copyright by default, which may not be what either party expects."
}
```

---

## 3. Risk Assessment Framework

The prompt provides concrete, enumerated criteria for each risk level. This reduces subjectivity and improves consistency across analyses.

### RED — Risky / Harmful

A clause is flagged **red** if any of the following apply:

| Criterion | Example |
|-----------|---------|
| Significant power imbalance | One party can unilaterally change terms |
| No limits on liability/damages | "Client shall be liable for all direct, indirect, incidental, consequential damages without limit" |
| One-sided termination | Only the employer can terminate; employee cannot resign without penalty |
| Auto-renewal without opt-out | "This agreement auto-renews annually; cancellation requires certified mail 180 days prior" |
| Disproportionate penalties | "$50,000 liquidated damages for a $2,000 contract" |
| Hidden/buried clauses | Important terms buried in dense paragraphs with no heading |
| Overly broad non-compete/exclusivity | "Employee shall not work in any capacity for any competitor worldwide for 5 years" |

**Rule for users:** Do not sign without negotiation or legal advice.

### AMBER — Unusual / Worth Flagging

A clause is flagged **amber** if any of the following apply:

| Criterion | Example |
|-----------|---------|
| Unusual for this contract type | A non-disparagement clause in a simple vendor agreement |
| Vague or open to interpretation | "Reasonable efforts", "as needed", "appropriate notice" |
| Non-standard durations | 5-year non-solicit in an employment contract where 1–2 years is typical |
| Mildly one-sided | Jurisdiction clause always favors the drafting party's home state |
| Favourable governing law | Delaware law chosen when neither party has a Delaware connection |

**Rule for users:** Review carefully; consider negotiating.

### GREEN — Standard / Balanced

A clause is marked **green** when:

- It is standard and expected for this contract type
- Terms are balanced and reasonable
- Language is clear and specific

**Example:** A confidentiality clause in an NDA that defines confidential information clearly, has a standard 2–5 year duration, and includes standard exceptions.

### Overall Risk Rating

After all three steps, the agent assigns an overall risk level:

| Level | Meaning |
|-------|---------|
| `low` | Standard, balanced contract. Sign with confidence. |
| `medium` | Some concerning clauses. Review carefully, possibly negotiate. |
| `high` | Significant risks. Do NOT sign without negotiation or legal advice. |

The overall rating is derived holistically — it is not a simple formula based on clause counts. A single red clause in a critical area (e.g., unlimited liability) can push the overall rating to `high`, while multiple amber clauses on minor points might still result in `medium`.

---

## 4. Output Format

The agent returns **only** a JSON object — no markdown, no code fences, no commentary. The schema is:

```typescript
interface AnalysisResult {
  documentType: string;              // e.g., "Non-Disclosure Agreement"
  overallRisk: "low" | "medium" | "high";
  clauses: {
    title: string;                   // Short clause name
    summary: string;                 // Plain-English explanation
    riskLevel: "green" | "amber" | "red";
    recommendation: string;          // Actionable advice
    details?: string;                // Optional deeper explanation
  }[];
  gapAnalysis: {
    clause: string;                  // Name of missing clause
    importance: "high" | "medium" | "low";
    suggestion: string;              // What to add
  }[];
}
```

### Why each field exists

- **`documentType`** — Tells the user what they're looking at. Also used by the UI header.
- **`overallRisk`** — Provides the at-a-glance summary. Drives the hero risk badge (green/amber/red) on the results page.
- **`clauses[]`** — The core analysis. Each clause is a self-contained unit with explanation + rating + recommendation. The UI renders these as expandable cards.
- **`clauses[].details`** — Optional. For users who want to understand *why* something is flagged, beyond the summary and recommendation. Rendered in an expandable section.
- **`gapAnalysis[]`** — Often the most valuable output. Missing clauses are risks the user didn't even know to look for. The UI renders these as a separate "What's Missing" section.
- **`gapAnalysis[].importance`** — Helps the user prioritize. High-importance gaps should be addressed before signing; low-importance ones are nice-to-have.

### Fallback handling

The API route (`src/app/api/analyze/route.ts`) handles cases where the LLM doesn't return valid JSON:

1. If the output is wrapped in markdown code fences (`` ```json ... ``` ``), they are stripped before parsing
2. If parsing still fails, the API returns a fallback structure with `documentType: "Raw Analysis"` and the raw output in `_rawOutput`
3. If the parsed JSON lacks the required top-level fields, the same fallback applies

This ensures the frontend always receives a valid shape and never crashes.

---

## 5. Design Decisions

### Why a single-shot prompt instead of multi-turn?

We considered a multi-turn agent architecture where the LLM would:

1. First identify the document type
2. Then extract clauses in a second call
3. Then run gap analysis in a third call

**We rejected this because:**

- **Latency** — three sequential API calls would triple the response time (currently ~5–10 seconds on Groq)
- **Complexity** — more code to maintain, more failure modes, more state to manage
- **Cost** — three calls means ~3x the token usage (system prompt repeated each time)
- **Reliability** — each call is a potential point of failure; one bad response can corrupt the entire pipeline

A single-shot prompt with a well-structured output schema achieves the same quality with one call.

### Why temperature 0.2?

Legal analysis should be consistent, not creative. At temperature 0.2:

- The same contract produces very similar results across runs
- The agent still has enough variation to handle unusual documents
- Hallucination risk is minimized

### Why Groq + Llama 3.3 70B?

- **Speed** — Groq's LPU inference is among the fastest available, critical for a tool where users wait for results
- **Quality** — Llama 3.3 70B provides strong structured-output and reasoning capabilities at this parameter scale
- **Cost** — significantly cheaper than proprietary alternatives

### Why not use structured output / JSON mode?

We considered using the model's native JSON mode but opted for prompt-only JSON enforcement because:

- It keeps the prompt portable across any LLM provider
- The "return ONLY JSON" instruction with code-fence stripping in the route handler has proven reliable
- Native JSON mode sometimes constrains the model's reasoning quality

### Why green / amber / red instead of a numeric score?

- **Intuitive** — everyone understands traffic-light semantics
- **Actionable** — each color maps to a clear user action
- **No false precision** — a numeric score (e.g., 73/100) implies precision the analysis doesn't have
- **UI-friendly** — direct mapping to color-coded badges and cards

---

## 6. Testing Results

The system prompt was tested against five representative contract types using the demo contracts in `public/demo-contracts/`:

| Contract Type | File | Clauses Found | Gaps Identified | Overall Risk | Result |
|---------------|------|---------------|-----------------|--------------|--------|
| Non-Disclosure Agreement | `nda.txt` / `nda-agreement.txt` | 8–12 | 2–4 | Low–Medium | PASS |
| Freelance Service Contract | `freelance.txt` / `freelance-contract.txt` | 10–15 | 3–5 | Medium | PASS |
| Employment Offer Letter | `employment.txt` / `employment-offer.txt` | 8–14 | 2–4 | Medium–High | PASS |
| SaaS Terms of Service | `saas-terms.txt` / `saas-tos.txt` | 12–18 | 3–6 | Medium | PASS |
| Vendor Agreement | `vendor.txt` | 10–16 | 3–5 | Low–Medium | PASS |

All five contract types produced:

- Valid JSON matching the expected schema
- Accurate document type identification
- Reasonable clause extraction with appropriate risk levels
- Meaningful gap analysis with relevant missing clauses
- Plain-English summaries that a non-lawyer could understand

---

## 7. Prompt Versioning Notes

### Current Version

The prompt lives in `src/lib/prompts.ts` as the `SYSTEM_PROMPT` export. There is no formal version number embedded in the prompt — the Git history serves as the version log.

### How to Iterate

1. **Edit `src/lib/prompts.ts`** — the `SYSTEM_PROMPT` string
2. **Test against all five demo contracts** — use the `/api/analyze` endpoint and verify:
   - JSON parsing succeeds (no fallback triggered)
   - Document type is correctly identified
   - Clause count is reasonable (8–20 range)
   - Risk levels make sense for the contract content
   - Gap analysis surfaces meaningful missing clauses
3. **Check for regressions** — ensure changes don't break previously passing contract types

### Improvement Ideas

| Area | Potential Change | Risk |
|------|-----------------|------|
| Multi-language | Add explicit handling for contracts in other languages | Increased prompt length, possible confusion |
| Jurisdiction awareness | Add country/state-specific legal standards | Requires country detection, may conflict with general advice |
| Confidence scores | Add a confidence field per clause | May give false precision; increases output size |
| Severity ranking | Sort clauses by risk severity | Useful but may miss contextual ordering |
| Negotiation scripts | Generate suggested negotiation language for red clauses | High value but significantly increases output length |
| Schema versioning | Add a `schemaVersion` field to the output | Useful for backwards compatibility as the format evolves |

### Prompt Engineering Guidelines

When modifying the prompt:

- **Keep it under 8K tokens** — the system prompt counts against the context window
- **Maintain the three-step structure** — it maps directly to the UI's AgentSteps component
- **Test with temperature 0.2** — changes that work at 0.7 may not be reliable at 0.2
- **Preserve "return ONLY JSON"** — any conversational output will break the parser
- **Run the fallback path** — intentionally send a non-contract text to verify graceful degradation
