# ContractScan AI — Hackathon Submission

> **Project:** ContractScan AI
> **Hackathon:** International AI Agents Hackathon — AI HackWorld — Devpost
> **Team:** Solo
> **Live Demo:** https://contractscan-eight.vercel.app
> **Source Code:** [GitHub repo link]

---

## What Is ContractScan AI?

Every person in this room has signed something they didn't fully read. A lease agreement. A freelance contract. A job offer letter. You scan it, you sign it, and you hope for the best — because lawyers charge ₹5,000-15,000 per hour, and you can't afford one for every document.

ContractScan AI is an AI agent that reads any contract and tells a non-lawyer three things:
1. **What they're agreeing to** — every clause explained in plain English
2. **What's risky** — colour-coded green, amber, and red flags on each clause
3. **What's missing** — gaps in the contract that could leave them exposed

It runs a three-step reasoning loop (identify → assess → gap analysis) and delivers a structured risk report in seconds.

---

## How It Works — The Agent Architecture

ContractScan is not a chatbot. It's a **three-step reasoning agent** that runs sequentially, where each step's output feeds into the next:

```
┌─────────────────────────────────────────────────────────────┐
│                    STEP 1: IDENTIFY                         │
│  "What kind of contract is this? What clauses should it     │
│   have?"                                                    │
│  → Determines document type and expected clause categories  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    STEP 2: ASSESS                           │
│  "For each clause, is it standard, unusual, or dangerous?"  │
│  → Green (standard) / Amber (unusual) / Red (dangerous)    │
│  → Plain-English explanation of each clause                 │
│  → Actionable recommendation for each flagged clause        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    STEP 3: GAP ANALYSIS                     │
│  "What's missing that should be there?"                     │
│  → Clauses absent from this contract type                   │
│  → Importance rating (high/medium/low)                      │
│  → Suggested wording for each gap                           │
└─────────────────────────────────────────────────────────────┘
```

This isn't a single prompt that dumps text. The three steps create a **reasoning chain** — Step 1 tells the agent what to look for, Step 2 evaluates what it finds, and Step 3 checks what's absent. Each step makes the next one more accurate.

---

## Live Demo

**URL:** https://contractscan-eight.vercel.app

### How to Demo (60 seconds)

1. **Open the site** — the clean interface shows a text area and a "Load Demo Contract" button
2. **Click "Load Demo Contract"** — a realistic rental agreement pre-fills the text area
3. **Click "Analyse Contract"** — the three-step agent progress indicator lights up:
   - "Identifying document type..." → "Assessing clause risks..." → "Running gap analysis..."
4. **The risk report appears** — colour-coded cards showing every clause with:
   - 🟢 Green: standard, acceptable clauses
   - 🟡 Amber: unusual clauses worth flagging
   - 🔴 Red: dangerous clauses requiring negotiation
5. **Gap analysis section** shows what's missing (dispute resolution, force majeure, etc.)

### Key Red Flags the Agent Catches in the Demo

| Clause | Risk | Why It's Dangerous |
|--------|------|-------------------|
| Rent Escalation | 🔴 RED | Landlord can increase rent 20%/year with only 7 days notice, no dispute rights |
| Termination | 🔴 RED | Landlord can terminate anytime with 15 days notice; tenant cannot terminate early |
| Default | 🔴 RED | Landlord can re-enter without court order after 10 days; belongings can be disposed |
| Maintenance | 🔴 RED | Tenant pays ALL repairs including structural — typically the landlord's responsibility |

---

## Technical Architecture

```
Browser (React 19 + Tailwind CSS)
  │
  ├── PDF Upload → pdfjs-dist (client-side text extraction)
  ├── Text Paste → direct input
  │
  └── POST /api/analyze
        │
        ▼
  API Route (Next.js Serverless Function)
    │
    ├── System Prompt: 3-step agent instruction
    ├── Model: llama-3.3-70b-versatile via Groq API
    ├── Output: Structured JSON (clauses + gaps)
    │
    └── Response → Risk Cards (green/amber/red) + Gap Analysis
```

**Tech Stack:**
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Groq API (llama-3.3-70b-versatile) — sub-5s inference
- pdfjs-dist — client-side PDF parsing
- Deployed on Vercel (serverless)

**Why this stack:**
- **Groq** instead of OpenAI/Anthropic: 10x faster inference (sub-5s vs 30-60s), free tier sufficient for demo
- **Client-side PDF parsing**: no file upload to server, no storage costs, instant extraction
- **Single API endpoint**: the entire 3-step agent runs in one LLM call for speed and reliability
- **Serverless on Vercel**: zero infrastructure, auto-scaling, free tier

---

## Innovation

**What makes this an "AI Agent" and not just "AI wrapped around an API"?**

1. **Sequential reasoning loop**: The three steps (identify → assess → gap analysis) form a reasoning chain where each step's output makes the next step more accurate. This is a single-pass agent architecture — not a multi-turn conversation.

2. **Self-calibrating assessment**: Step 1 determines the document type, which automatically calibrates what counts as "green", "amber", or "red" in Step 2. An NDA's "standard" is different from a lease's "standard" — the agent knows this.

3. **Gap detection via negative space**: Step 3 doesn't just evaluate what's present — it evaluates what's ABSENT. This requires the agent to maintain a mental model of what a complete contract should contain, then compare against what's actually there.

4. **Structured output, not chat**: The agent returns machine-parseable JSON, not free text. This means the output can drive UI components, feed into downstream workflows, or be stored and compared over time.

---

## Impact

### The Problem

- **India**: ~1.2 crore residential lease agreements signed annually. ~80% of tenants never consult a lawyer before signing.
- **Freelancers**: India has ~1.5 crore freelancers. Most sign client contracts without legal review.
- **First-time employees**: Fresh graduates signing offer letters with non-compete clauses, IP assignment traps, and probation gotchas.
- **Small businesses**: Signing vendor agreements, SaaS terms, and NDAs without understanding the implications.

### The Scale

The legal tech market in India alone is projected at ₹180 crore ARR by 2027. Globally, the contract lifecycle management market is $3.3 billion and growing at 13% CAGR. ContractScan addresses the bottom of this market — the millions of people who can't afford legal review for everyday contracts.

### Real-World Use Cases

1. **College students** signing their first rental lease — catches one-sided termination, excessive deposits, privacy violations
2. **Freelance developers** signing client contracts — catches scope creep clauses, IP grabs, payment withholding terms
3. **Startup founders** signing NDAs — catches indefinite confidentiality, non-solicit traps, overbroad definitions
4. **Job seekers** reviewing offer letters — catches broad non-competes, IP ownership over personal projects, unfair probation terms

---

## What I Built (7-Day Timeline)

| Day | What Got Done |
|-----|--------------|
| Day 1 | Full pipeline: Next.js scaffold, PDF.js extraction, 3-step system prompt, Groq API integration, UI components, build verified |
| Day 2 | Polish: file/text mutual exclusion, "New Analysis" reset, "Load Demo Contract" button, demo mode (?demo=true), Vercel deployment |
| Day 3 | QA: 5 realistic contract templates (NDA, freelance, employment, SaaS ToS, vendor agreement), all 5 tested and passing |
| Day 4 | Documentation: README.md (10KB), docs/ARCHITECTURE.md (21KB), docs/SYSTEM_PROMPT.md (15KB), this submission document |

---

## What's Next (Post-Hackathon Roadmap)

1. **Multi-document comparison** — upload two versions of a contract and the agent tells you what changed
2. **Plain-English rewrite** — for each flagged clause, generate a fair alternative the user can propose
3. **Contract scoring** — a single 0-100 score for contract fairness, with category breakdowns
4. **Batch analysis** — upload a folder of contracts and rank them by risk
5. **Mobile-first redesign** — most users will scan and sign on their phone
6. **Regional language support** — Hindi, Tamil, Bengali contract analysis for tier-2/3 India

---

## Links

- **Live Demo:** https://contractscan-eight.vercel.app
- **Demo with pre-loaded contract:** https://contractscan-eight.vercel.app/?demo=true
- **Source Code:** [GitHub repo link]

---

*"Every signature should be an informed one."*
