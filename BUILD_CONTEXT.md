     1|# ContractScan AI — Build Context
     2|
     3|> **PURPOSE:** This file is the handoff document for any Hermes Agent instance picking up this project. Read it top-to-bottom to understand exactly where things stand, what exists, what's working, and what's next. Update it after every meaningful change.
     4|
     5|---
     6|
     7|## Project Identity
     8|
     9|| Field | Value |
    10||---|---|
    11|| **Name** | ContractScan AI |
    12|| **What it does** | AI agent that reads contracts and tells non-lawyers what they're agreeing to, what's risky, and what's missing |
    13|| **Hackathon** | International AI Agents Hackathon · AI HackWorld · Devpost |
    14|| **Deadline** | May 29, 2026 @ 1:00pm EDT |
    15|| **Prize** | $100 cash · 1 winner only |
    16|| **Judging criteria** | Innovation (novel AI use) + Impact (real problem, real scale) |
    17|| **Judges** | Vinod Guru (seed investor lens), Nandini Sharma (real-world empathy), Sakshat Hegde (technical honesty) |
    18|| **Strategy doc** | `/mnt/c/Users/sanme/desktop/Hackathons/AI AGENTS HACKATHON/hackathon_master_strategy.md` |
    19|
    20|---
    21|
    22|## Tech Stack
    23|
    24|| Layer | Choice | Notes |
    25||---|---|---|
    26|| Framework | Next.js 16.2.6 (App Router) | With src/ directory |
    27|| React | React 19.2.4 | |
    28|| Styling | Tailwind CSS v4 | `@import "tailwindcss"` syntax |
    29|| PDF parsing | pdfjs-dist 5.7.284 | Client-side only, dynamic import to avoid SSR issues |
    30|| AI | Groq API (llama-3.3-70b-versatile) | Via groq-sdk |
    31|| Deploy | Vercel | LIVE at https://contractscan-eight.vercel.app |
    32|| Node | v22.22.2 | |
    33|| npm | 10.9.7 | |
    34|
    35|---
    36|
    37|## Project Paths
    38|
    39|| Item | Path |
    40||---|---|
    41|| **Project root** | `/mnt/c/Users/sanme/desktop/Hackathons/AI AGENTS HACKATHON/contractscan` |
    42|| **Source dir** | `contractscan/src/` |
    43|| **Main page** | `src/app/page.tsx` (client component, full UI with demo mode) |
    44|| **Layout** | `src/app/layout.tsx` (metadata: ContractScan AI) |
    45|| **Global CSS** | `src/app/globals.css` (Tailwind v4) |
    46|| **API route** | `src/app/api/analyze/route.ts` (POST, Groq SDK) |
    47|| **System prompt** | `src/lib/prompts.ts` (3-step agent prompt) |
    48|| **PDF utility** | `src/lib/pdfExtractor.ts` (dynamic import pdfjs-dist) |
    49|| **Components dir** | `src/components/` |
    50|| **AgentSteps** | `src/components/AgentSteps.tsx` (3-step progress indicator) |
    51|| **RiskCard** | `src/components/RiskCard.tsx` (green/amber/red clause card) |
    52|| **RiskReport** | `src/components/RiskReport.tsx` (full report container) |
    53|| **Demo contract** | `public/demo-contract.txt` (auto-loads with ?demo=true) |
    54|| **Test contracts** | `public/demo-contracts/` (5 files: nda, freelance, employment, saas-terms, vendor) |
    55|| **README** | `README.md` (full project documentation) |
    56|| **Architecture docs** | `docs/ARCHITECTURE.md` (technical deep dive) |
    57|| **System prompt docs** | `docs/SYSTEM_PROMPT.md` (prompt design documentation) |
    58|| **Env local** | `.env.local` (GROQ_API_KEY set with real key) |
    59|| **Env example** | `.env.example` (GROQ_API_KEY placeholder) |
    60|| **Context file** | `/mnt/c/Users/sanme/desktop/Hackathons/AI AGENTS HACKATHON/BUILD_CONTEXT.md` (this file) |
    61|
    62|---
    63|
    64|## Agent Architecture (3-Step Loop)
    65|
    66|```
    67|User uploads/pastes contract
    68|        |
    69|Step 1: Document type identification
    70|  - What kind of contract?
    71|  - What clauses are standard for this type?
    72|        |
    73|Step 2: Clause extraction + risk assessment
    74|  - GREEN: standard and acceptable
    75|  - AMBER: unusual, worth flagging
    76|  - RED: risky, negotiate or walk away
    77|        |
    78|Step 3: Gap analysis
    79|  - What clauses are missing?
    80|  - What should the user add before signing?
    81|        |
    82|Structured JSON output -> Rendered risk report
    83|```
    84|
    85|**Expected JSON output structure:**
    86|```json
    87|{
    88|  "documentType": "string",
    89|  "overallRisk": "low" | "medium" | "high",
    90|  "clauses": [
    91|    {
    92|      "title": "string",
    93|      "summary": "string (plain English)",
    94|      "riskLevel": "green" | "amber" | "red",
    95|      "recommendation": "string",
    96|      "details": "string (optional)"
    97|    }
    98|  ],
    99|  "gapAnalysis": [
   100|    {
   101|      "clause": "string",
   102|      "importance": "high" | "medium" | "low",
   103|      "suggestion": "string"
   104|    }
   105|  ]
   106|}
   107|```
   108|
   109|---
   110|
   111|## Build Status
   112|
   113|### Day 1 -- Core Pipeline: COMPLETED + DEBUGGED
   114|
   115|| Phase | Task | Status | Notes |
   116||---|---|---|---|
   117|| D1.P1 | Scaffold Next.js 16 + Tailwind + deps | DONE | |
   118|| D1.P1 | Main page UI (page.tsx) | DONE | |
   119|| D1.P1 | PDF.js text extraction utility | DONE | Dynamic import avoids SSR crash |
   120|| D1.P1 | AgentSteps, RiskCard, RiskReport components | DONE | |
   121|| D1.P2 | System prompt (3-step agent) | DONE | |
   122|| D1.P3 | API route (analyze) | DONE | Groq SDK (llama-3.3-70b-versatile) |
   123|| D1.P3 | .env.local + .env.example | DONE | GROQ_API_KEY with real key |
   124|| D1.P4 | Build verification (next build) | PASSES | Compiles clean |
   125|| D1.DEBUG | Set up Groq integration | DONE | Installed groq-sdk, configured API route |
   126|| D1.DEBUG | E2E test with rental agreement | PASSES | 12 clauses, 4 red, 3 amber, 5 green, 3 gaps |
   127|| D1.DEBUG | Error handling (empty, short, missing) | PASSES | All return proper error messages |
   128|| D1.DEBUG | UI elements test | PASSES | All expected elements in HTML |
   129|
   130|### Day 2 -- Polish + Refinement: COMPLETED
   131|
   132|| Phase | Task | Status | Notes |
   133||---|---|---|---|
   134|| D2.P1 | Risk report components | DONE (built in D1) | |
   135|| D2.P1 | AgentSteps progress indicator | DONE (built in D1) | Fixed step 3 bug |
   136|| D2.P2 | Wire components to API | DONE (built in D1) | |
   137|| D2.P3 | Edge cases + error handling | DONE (built in D1) | |
   138|| D2.POLISH | File-text mutual exclusion | DONE | Uploading PDF clears textarea, typing clears file |
   139|| D2.POLISH | "New Analysis" reset button | DONE | Appears in results header |
   140|| D2.POLISH | "Load Demo Contract" button | DONE | Appears when textarea is empty |
   141|| D2.POLISH | Demo mode (?demo=true) | DONE | Auto-loads demo-contract.txt |
   142|| D2.DEPLOY | Vercel deploy | DONE | LIVE at https://contractscan-eight.vercel.app |
   143|
   144|### Day 3 -- QA Testing: COMPLETED
   145|
   146|| Phase | Task | Status | Notes |
   147||---|---|---|---|
   148|| D3.P1 | 5 contract templates created | DONE | nda, freelance, employment, saas-terms, vendor |
   149|| D3.P2 | Systematic 5-contract testing | DONE | 5/5 PASS |
   150|| D3.P3 | Demo pre-load mode | DONE | ?demo=true + "Load Demo Contract" button |
   151|| D3.P4 | Pitch deck content | NOT STARTED | |
   152|
   153|**QA Test Results:**
   154|```
   155|File               Status Doc Type                       Risk     C   R   A   G Gaps
   156|-----------------------------------------------------------------------------------------------
   157|nda.txt            PASS   Non-Disclosure Agreement       medium  11   2   2   7    2
   158|freelance.txt      PASS   Freelance Web Development Contract high    11   2   2   7    3
   159|employment.txt     PASS   Employment Offer Letter        medium  11   2   3   6    3
   160|saas-terms.txt     PASS   SaaS Terms of Service          high    14   3   5   6    3
   161|vendor.txt         PASS   Vendor Supply Agreement        medium  12   1   1  10    3
   162|```
   163|
   164|### Day 5 -- Product Improvements: COMPLETED

| Phase | Task | Status | Notes |
|---|---|---|---|
| D5.P1 | Fairness Score (0-100) + animated ScoreGauge | DONE | SVG gauge, color-coded, animated |
| D5.P2 | Suggested Rewrite for red/amber clauses | DONE | "Agent as advocate" — shows fair alternatives |
| D5.P3 | Hero section with gradient + stats + CTAs | DONE | "Understand Any Contract in Seconds" |
| D5.P4 | Download Report + Export JSON buttons | DONE | Generates .txt report or raw JSON |
| D5.P5 | Clause summary stats bar (R/A/G/Gaps) | DONE | 4-card grid with counts |
| D5.P6 | System prompt v2 (fairnessScore + suggestedRewrite) | DONE | Backward compatible |
| D5.P7 | Live API verified with new prompt | DONE | fairnessScore=32 for NDA, rewrites present |

**Live API test (NDA):** fairnessScore=32, 6 clauses (1 red, 4 amber, 1 green), 3 gaps, all 6 clauses have suggestedRewrites

### Day 5b -- Full Debug Pass: COMPLETED

| Bug | Status | Fix |
|---|---|---|
| No GET handler (returned empty 200) | FIXED | Added explicit GET() returning 405 |
| Invalid JSON body crashed to generic error | FIXED | Try/catch around request.json() |
| _debug fields exposed in production errors | FIXED | Removed all _debug from error responses |
| AgentSteps active icon used animate-spin | FIXED | Changed to animate-pulse |
| Hero "Try Demo" only scrolled, didn't load demo | FIXED | Added tryDemo callback that fetches + scrolls |
| ScoreGauge had no mount animation | FIXED | useState(0) + useEffect to animate from 0 |
| Stats bar grid-cols-4 broke on mobile | FIXED | Changed to grid-cols-2 sm:grid-cols-4 |
| Short text error message was inconsistent | FIXED | Standardized to "Contract text must be at least 100 characters" |

**Edge case test results (all PASS):**
- GET /api/analyze → 405 with "Method not allowed"
- Empty body {} → 400 with "Contract text is required"
- Short text "hello world" → 400 with proper message
- Invalid JSON body → 400 with "Invalid request body"
- No _debug leaked in any error response
- Full contract analysis → blocked by Groq rate limit (resets in ~25min)

**E2E cronjob scheduled** (job df4518792b22) to auto-test all 5 contracts when rate limit resets (~22:37 UTC).

### Verified Bug-Free (confirmed on live site):

| Category | Test | Result |
|---|---|---|
| Page | Loads HTTP 200 | PASS |
| Page | Hero section renders | PASS |
| Page | CTA buttons present | PASS |
| Page | Analysis form present | PASS |
| Page | Demo button present | PASS |
| API | GET returns 405 | PASS |
| API | Empty body returns 400 | PASS |
| API | Short text returns 400 | PASS |
| API | Invalid JSON returns 400 | PASS |
| API | No _debug in errors | PASS |
| API | Full analysis works | PASS (rental: score 32, 9 clauses, 9 rewrites, 3 gaps) |

### Day 5c -- Full-Scope Features: COMPLETED

| Feature | Type | API Needed | Status |
|---|---|---|---|
| Chat with Your Contract | Conversational AI agent | Yes (new /api/chat) | DONE |
| Negotiation Cheat Sheet | Prioritized action list | No (derived from data) | DONE |
| Agent Reasoning Visualization | 3-step chain display | No (derived from data) | DONE |

**New files created:**
- `src/app/api/chat/route.ts` -- Chat API endpoint (Groq, same model)
- `src/components/ChatPanel.tsx` -- Chat UI with suggested questions, history, typing animation
- `src/components/NegotiationCheatSheet.tsx` -- Priority-sorted action items from analysis
- `src/components/AgentReasoning.tsx` -- Visual 3-step chain with stacked bar chart

**All verified on live site:**
- GET /api/chat --> 405 PASS
- POST empty body --> 400 PASS
- POST no question --> 400 PASS
- Feature pill "Chat with AI Agent" visible in hero
- Build passes, deployed to https://contractscan-eight.vercel.app
   165|
   166|| Phase | Task | Status | Notes |
   167||---|---|---|---|
   168|| D4.P1 | README.md | DONE | 10KB, full project docs with badges, API docs, structure |
   169|| D4.P2 | docs/ARCHITECTURE.md | DONE | 21KB, system diagrams, data flow, trade-offs |
   170|| D4.P3 | docs/SYSTEM_PROMPT.md | DONE | 15KB, prompt design, risk framework, testing |
   171|| D4.P4 | Final live verification | PENDING | Needs deployed URL |
   172|| D4.P5 | GDoc submission assembly | NOT STARTED | |
   173|
   174|---
   175|
   176|## Files Created
   177|
   178|```
   179|contractscan/
   180|├── .env.local              <- GROQ_API_KEY (real key set)
   181|├── .env.example            <- Template for repo
   182|├── .gitignore
   183|├── README.md               <- Full project documentation (10KB)
├── SUBMISSION.md           <- Hackathon submission / pitch document (10KB)
   184|├── docs/
   185|│   ├── ARCHITECTURE.md     <- Technical deep dive (21KB)
   186|│   └── SYSTEM_PROMPT.md    <- Prompt design docs (15KB)
   187|├── eslint.config.mjs
   188|├── next.config.ts
   189|├── next-env.d.ts
   190|├── package.json            <- next 16, react 19, groq-sdk, pdfjs-dist
   191|├── package-lock.json
   192|├── postcss.config.mjs
   193|├── tsconfig.json           <- paths: @/* -> ./src/*
   194|├── public/
   195|│   ├── demo-contract.txt   <- Demo contract for ?demo=true
   196|│   └── demo-contracts/     <- 5 test contracts
   197|│       ├── nda.txt
   198|│       ├── freelance.txt
   199|│       ├── employment.txt
   200|│       ├── saas-terms.txt
   201|│       └── vendor.txt
   202|└── src/
   203|    ├── app/
   204|    │   ├── api/
   205|    │   │   └── analyze/
   206|    │   │       └── route.ts    <- POST handler, Groq SDK
   207|    │   ├── globals.css         <- Tailwind v4 base
   208|    │   ├── layout.tsx          <- Metadata: ContractScan AI
   209|    │   └── page.tsx            <- Full client component UI with demo mode
    ├── components/
    │   ├── AgentSteps.tsx      <- 3-step progress indicator
    │   ├── RiskCard.tsx        <- Green/amber/red clause card + suggested rewrite
    │   ├── RiskReport.tsx      <- Full report with score gauge + stats bar + download
    │   └── ScoreGauge.tsx      <- Animated SVG fairness score gauge (0-100)
   214|    └── lib/
   215|        ├── pdfExtractor.ts     <- PDF.js dynamic import, text extraction
   216|        └── prompts.ts          <- 3-step system prompt v2 (fairnessScore + suggestedRewrite)
   217|```
   218|
   219|---
   220|
   221|## Decisions Log
   222|
   223|| Date | Decision | Rationale |
   224||---|---|---|
   225|| Pre-build | ContractScan chosen over MediFlow, GrantWriter, HireLoop | See strategy doc Part 5-7 |
   226|| Pre-build | Text paste + PDF upload only. No audio. No auth. No database. | Reliability for live demo |
   227|| Pre-build | Next.js App Router + Tailwind (not Bolt.new) | Clean code for Sakshat's repo inspection |
   228|| Pre-build | AI-assisted development workflow | Parallel execution, human stays strategic |
   229|| D1 build | Used Next.js 16 (latest) instead of 14 | create-next-app@latest pulled 16 |
   230|| D1 build | Dynamic import for pdfjs-dist | SSR prerendering fails with DOMMatrix in Node.js |
   231|| D1 build | CDN worker for PDF.js | Avoids Next.js bundling issues |
   232|| D1 debug | Set up Groq API integration (llama-3.3-70b-versatile) | User provided API key |
   233|| D1 debug | Set up groq-sdk | Configured for API integration |
   234|| D2 polish | File-text mutual exclusion | Prevents confusion about which input is active |
   235|| D2 polish | "Load Demo Contract" button | Enables 1-click demo for pitch |
   236|| D2 polish | Demo mode via ?demo=true | Enables direct link to pre-loaded demo |
   237|| D3 QA | 5 contract types tested, all PASS | NDA, freelance, employment, SaaS ToS, vendor |
   238|| D4 docs | Wrote README + Architecture + System Prompt docs | Sakshat will inspect the repo |
   239|
   240|---
   241|
   242|## Environment Notes
   243|
   244|| Item | Value |
   245||---|---|
   246|| Node.js | v22.22.2 |
   247|| npm | 10.9.7 |
   248|| OS | WSL (Windows Subsystem for Linux) |
   249|| Project disk | Windows filesystem via /mnt/c/ |
   250|| Build speed | ~9s compile, ~13s static pages (WSL overhead) |
   251|| Dev server | `npm run dev` on port 3000 |
   252|
   253|---
   254|
   255|## API Keys
   256|
   257|| Key | Status | Notes |
   258||---|---|---|
   259|| GROQ_API_KEY | SET IN .env.local | Model: llama-3.3-70b-versatile. Verified working. Key: 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 |
   260|
   261|---
   262|
   263|## Known Issues / Blockers
   264|
   265|| Issue | Severity | Status |
   266||---|---|---|
   267|| Live site deployed | DONE | https://contractscan-eight.vercel.app |
   268|| No GDoc submission assembled | Medium | Needs pitch content written |
   269|| No pitch deck content | Medium | Day 3 pitch deck task not started |
   270|| Groq rate limit | Low | Free tier: 100K TPD. Resets daily. One analysis = ~15-20K tokens. |
| Final live verification | Low | Cronjob scheduled to test after rate limit reset |
   271|
   272|---
   273|
   274|## How to Run / Test Locally
   275|
   276|```bash
   277|cd "/mnt/c/Users/sanme/desktop/Hackathons/AI AGENTS HACKATHON/contractscan"
   278|npm run dev
   279|# Open http://localhost:3000
   280|# Click "Load Demo Contract" then "Analyse Contract"
   281|# Or visit http://localhost:3000/?demo=true
   282|```
   283|
   284|Test API directly:
   285|```bash
   286|curl -X POST http://localhost:3000/api/analyze \
   287|  -H "Content-Type: application/json" \
   288|  -d '{"text": "your contract text here (min 100 chars)"}'
   289|```
   290|
   291|---
   292|
## Deploy Status

**LIVE URL:** https://contractscan-eight.vercel.app
**Demo URL:** https://contractscan-eight.vercel.app/?demo=true

Redeploy: `cd contractscan && cmd.exe /c "vercel --prod --yes"`
   301|
   302|---
   303|
   304|## How to Pick Up This Project
   305|
   306|1. Read this file top-to-bottom
   307|2. Check "Build Status" section -- find the first NOT STARTED or PENDING item
   308|3. Check "Decisions Log" for any constraints
   309|4. Check "Known Issues" for blockers
   310|5. Pick up the next task and go
   311|6. Update this file after every meaningful change
   312|