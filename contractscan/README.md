<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Groq-llama--3.3--70b-F55036?logo=groq" alt="Groq" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

<h1 align="center">ContractScan AI</h1>

<p align="center">
  <strong>AI-powered contract risk analysis for non-lawyers.</strong><br/>
  Drop a PDF or paste contract text. Get a colour-coded risk report in seconds.
</p>

---

## Screenshot

> **TODO:** Add a screenshot of the app here. Drop an image into `public/screenshot.png` and reference it:
>
> `<img src="public/screenshot.png" alt="ContractScan AI screenshot" width="700" />`

---

## What It Does

ContractScan AI analyses contracts and legal documents using a 3-step AI agent built on top of Groq's ultra-fast LLM inference. It is designed for people who sign contracts but can't afford a lawyer to review every clause.

Given any contract text (uploaded PDF or pasted text), it:

1. **Identifies the document type** — NDA, employment offer, freelance contract, lease, SaaS terms, vendor agreement, etc.
2. **Extracts and assesses every clause** — each clause gets a risk rating (green / amber / red) with a plain-English summary and actionable recommendation.
3. **Runs a gap analysis** — flags important clauses that are missing from the contract but should be there.

The result is a structured risk report you can read and act on without any legal knowledge.

---

## How It Works — The 3-Step Agent

```
┌──────────────────────────────────────────────────────────┐
│                   ContractScan AI Agent                   │
│                  (Single LLM call, 3 steps)               │
│                                                          │
│  Step 1 ─ Document Type Identification                   │
│    → "What kind of contract is this?"                    │
│    → Build a mental model of expected standard clauses    │
│                                                          │
│  Step 2 ─ Clause-by-Clause Risk Assessment               │
│    → Extract every clause                                │
│    → Rate each green / amber / red                       │
│    → Write plain-English summary + recommendation        │
│                                                          │
│  Step 3 ─ Gap Analysis                                   │
│    → Compare found clauses vs. expected standard clauses  │
│    → Flag what is MISSING and how important it is         │
│                                                          │
│  Output ─ Structured JSON risk report                    │
└──────────────────────────────────────────────────────────┘
```

The agent runs as a single Groq API call with a carefully engineered system prompt (see `src/lib/prompts.ts`). This keeps latency low (typically 5-15 seconds for a full contract) while producing structured, parseable JSON output.

---

## Tech Stack

| Layer           | Technology                    |
| --------------- | ----------------------------- |
| Framework       | Next.js 16 (App Router)       |
| UI              | React 19 + Tailwind CSS v4    |
| Language        | TypeScript 5                  |
| AI / LLM        | Groq API (`llama-3.3-70b-versatile`) |
| PDF Parsing     | pdfjs-dist (client-side)      |
| Deployment      | Vercel (recommended)          |

---

## Getting Started

### Prerequisites

- **Node.js** 18.17 or later
- **npm** (or pnpm / yarn)
- A **Groq API key** — get one free at [console.groq.com](https://console.groq.com/)

### Install

```bash
git clone <your-repo-url> contractscan
cd contractscan
npm install
```

### Environment Setup

Create a `.env.local` file in the project root:

```env
GROQ_API_KEY=gsk_your_api_key_here
```

> The Groq SDK reads this variable automatically. Never commit this file to version control.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Mode

Try the app instantly without preparing a contract:

- **URL flag:** Visit [http://localhost:3000/?demo=true](http://localhost:3000/?demo=true) — a sample contract auto-loads into the text area.
- **Button:** Click the "Load Demo Contract" button on the main page.

The demo contract is served from `public/demo-contract.txt`.

---

## API Documentation

### `POST /api/analyze`

Analyse a contract and return a structured risk report.

**Request:**

```json
{
  "text": "FULL CONTRACT TEXT HERE..."
}
```

| Field  | Type   | Required | Description                          |
| ------ | ------ | -------- | ------------------------------------ |
| `text` | string | Yes      | Full contract text (100–200,000 chars) |

**Response (200):**

```json
{
  "documentType": "Non-Disclosure Agreement",
  "overallRisk": "medium",
  "clauses": [
    {
      "title": "Non-Compete Scope",
      "summary": "This clause prevents you from working...",
      "riskLevel": "red",
      "recommendation": "Ask to narrow the scope...",
      "details": "Optional longer explanation..."
    }
  ],
  "gapAnalysis": [
    {
      "clause": "Dispute Resolution",
      "importance": "high",
      "suggestion": "Add a mediation clause before..."
    }
  ]
}
```

**Response fields:**

| Field           | Type     | Description                                    |
| --------------- | -------- | ---------------------------------------------- |
| `documentType`  | string   | Identified contract type                       |
| `overallRisk`   | string   | `"low"` / `"medium"` / `"high"`               |
| `clauses`       | array    | List of clause analyses (see below)            |
| `gapAnalysis`   | array    | List of missing clauses (see below)            |
| `_rawOutput`    | string   | (Fallback only) Raw LLM output if JSON parse fails |

**Clause object:**

| Field            | Type   | Description                            |
| ---------------- | ------ | -------------------------------------- |
| `title`          | string | Short clause name                      |
| `summary`        | string | Plain-English explanation              |
| `riskLevel`      | string | `"green"` / `"amber"` / `"red"`       |
| `recommendation` | string | What the user should do                |
| `details`        | string | (Optional) Longer explanation          |

**Gap analysis object:**

| Field         | Type   | Description                        |
| ------------- | ------ | ---------------------------------- |
| `clause`      | string | Name of the missing clause         |
| `importance`  | string | `"high"` / `"medium"` / `"low"`   |
| `suggestion`  | string | What to add, in plain English      |

**Error responses:**

| Status | When                                   |
| ------ | -------------------------------------- |
| 400    | Missing text, text too short (<100) or too long (>200K) |
| 500    | API key error or internal server error |
| 503    | Groq rate limit hit                   |

---

## Project Structure

```
contractscan/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main UI — drag-drop, text paste, results
│   │   └── api/
│   │       └── analyze/
│   │           └── route.ts      # POST /api/analyze — Groq SDK endpoint
│   ├── components/
│   │   ├── AgentSteps.tsx        # 3-step progress indicator
│   │   ├── RiskCard.tsx          # Green / amber / red clause card
│   │   └── RiskReport.tsx        # Full report container + gap analysis
│   └── lib/
│       ├── prompts.ts            # 3-step system prompt (core IP)
│       └── pdfExtractor.ts       # Client-side PDF.js text extraction
├── public/
│   ├── demo-contract.txt         # Demo contract for ?demo=true
│   └── demo-contracts/           # 5+ test contracts for QA
│       ├── nda-agreement.txt
│       ├── freelance-contract.txt
│       ├── employment-offer.txt
│       ├── saas-tos.txt
│       ├── lease-agreement.txt
│       └── vendor.txt
├── docs/
│   └── ARCHITECTURE.md           # Technical deep dive
├── qa_test.py                    # Automated QA test (5 contracts)
├── package.json
├── tsconfig.json
├── next.config.ts
└── .env.local                    # GROQ_API_KEY (not committed)
```

---

## Testing

### Automated QA Script

A Python script tests the API against 5 demo contracts:

```bash
# Start the dev server first
npm run dev

# In another terminal, run the QA test
python3 qa_test.py
```

The script:
- Sends each of the 5 demo contracts to `POST /api/analyze`
- Validates the JSON response structure
- Checks that each contract produces at least one red-flagged clause
- Prints a summary table with pass/fail results

### Manual Testing

1. Start the dev server (`npm run dev`)
2. Visit `http://localhost:3000/?demo=true`
3. Click "Analyse Contract"
4. Verify the risk report renders with coloured cards

---

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in [vercel.com/new](https://vercel.com/new)
3. Add the `GROQ_API_KEY` environment variable in the Vercel dashboard
4. Deploy — Vercel auto-detects Next.js

### Other Platforms

ContractScan is a standard Next.js app. You can deploy it anywhere that supports Node.js:

```bash
npm run build
npm run start
```

Set the `GROQ_API_KEY` environment variable on your hosting platform.

---

## Disclaimer

ContractScan AI is for **educational and informational purposes only**. It does not constitute legal advice and should not be used as a substitute for professional legal counsel. Always consult a qualified attorney for important contract decisions.

---

## License

MIT
