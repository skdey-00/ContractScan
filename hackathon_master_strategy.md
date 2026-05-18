# Hackathon Master Strategy Document
**International AI Agents Hackathon · AI HackWorld · Devpost**
**Deadline: May 29, 2026 @ 1:00pm EDT**

> This is the single source of truth for everything — verified facts, judge intelligence, strategic projections, idea evaluations, risk analysis, build plan, and pitch language. Read top to bottom once. Reference specific sections during build week.

---

## Part 1 — Hackathon Intelligence (Verified Facts)

### Basic Details

| Field | Detail |
|---|---|
| Name | International AI Agents Hackathon |
| Host | AI HackWorld (via Devpost) |
| URL | https://ai-agents-hackathon1.devpost.com |
| Deadline | May 29, 2026 @ 1:00pm EDT |
| Prize | $100 cash · 1 winner only |
| Theme | Workflow automation for an industry using AI agents |
| Eligibility | Students only · All countries |
| Registered participants | 46 (as of research date) |
| Tools allowed | Any vibe coding app — fully open |
| Submission format | GDoc/GDrive containing: live link + pitch deck + GitHub repo |

### Judging Criteria

Only two criteria. Nothing else matters.

1. **Innovation** — Is the idea novel? Does it use AI in a way that hasn't been done before?
2. **Impact** — Does it solve a real problem for real people at meaningful scale?

Every decision in this document — what to build, how to pitch, what to cut — runs through these two filters.

### Why 46 Participants Is Significant

This is a global student hackathon with a cash prize and only 46 registered participants. For context, major hackathons like HackMIT or MLH events draw thousands. This pool is tiny. The bar is not "be the best submission out of a thousand" — it is "be the most credible, polished, working submission in a small pool." A clean tool with a rehearsed pitch and a live demo almost certainly wins. This is not a situation requiring a moonshot — it requires solid execution.

---

## Part 2 — Judge Intelligence

### Judge 1 — Vinod Guru · Founder, BetterFuture

**Background:** Runs BetterFuture, a startup accelerator focused on early-stage founders. Background in startup ecosystem building, mentorship, and fundraising pipelines.

**How he evaluates:** Like a seed investor, not a hackathon judge. He is mentally asking: is this a real market? Who is the paying customer? What does the unit economics look like? Can this scale beyond a demo? He has seen hundreds of pitches. He knows the difference between a student project and a business.

**What impresses him:**
- Market size stated in real numbers (TAM, ARR ceiling, penetration scenarios)
- A clear paying customer ("freelancers pay ₹299 per scan" not "users will love it")
- Startup vocabulary used correctly — not performatively
- Evidence that the builder understands the competitive landscape

**What bores him:**
- Feature lists without a business model
- "We'll monetize later"
- Impressive tech with no identified user

**Strategic implication:** Vinod is the swing judge. Win him and you win the hackathon. Every pitch element should have one eye on how a seed investor would hear it.

---

### Judge 2 — Nandini Sharma · KHAQH

**Background:** Affiliated with KHAQH — inferred to be a healthcare or enterprise organisation. Domain expert background, not primarily a technical evaluator.

**How she evaluates:** She validates whether the problem is real and whether the solution is something actual humans could use. She is thinking about the end user — is this accessible? Would a non-technical person trust this? Does it solve something that genuinely matters or is it a solution looking for a problem?

**What impresses her:**
- Genuine user empathy — the builder clearly understands who suffers from this problem
- A clean, non-intimidating interface that a layperson could operate
- Real-world deployability — could this go live at an actual organisation tomorrow?
- Social impact framing — who benefits and how concretely?

**What bores her:**
- Over-engineered demos that require explaining to understand
- Tools that only make sense to technical users
- Problems that are niche or contrived

**Strategic implication:** She is the "real world" validator. If she nods during the demo, you have cleared the impact criterion. The demo moment needs to be immediately legible — she should feel the problem before you explain it.

---

### Judge 3 — Sakshat Hegde · No listed affiliation

**Background:** No company affiliation listed publicly. Inferred role: technical or generalist judge evaluating implementation quality and honesty of scope.

**How he evaluates:** He looks at whether the thing actually works, not just whether the pitch is polished. He will notice if the demo is smoke and mirrors. He will respect a tool that does one thing correctly over a tool that claims ten things and executes none of them cleanly.

**What impresses him:**
- A live demo that works without explanation or apology
- Real API calls, real output, honest implementation
- Code that is clean and readable (will check the GitHub)
- Scope that matches the build — no overclaiming

**What bores him:**
- Pre-rendered fake outputs passed off as live
- A polished UI wrapping a broken backend
- Features that are "coming soon" in a hackathon submission

**Strategic implication:** The GitHub repo and live link matter more for Sakshat than for the other two. Keep the README honest. Make the live link work from any device without setup.

---

## Part 3 — Strategic Projections & Assumptions

*These are reasoned inferences, not verified facts. They are the strategic reads that shape every decision below.*

### Projection 1 — Vinod is the deciding vote
Of the three judges, Vinod has the clearest evaluation framework (startup investor lens) and the most defined opinion of what "good" looks like. Nandini validates impact. Sakshat validates execution. But Vinod determines whether the idea has real-world gravity. An idea that wins him likely wins the room.

**Implication:** Lead with the problem and the market, not the technology. The technology is proof — it is not the pitch.

### Projection 2 — Low participation = execution wins
With 46 participants, many submissions will likely be incomplete, poorly documented, or not deployable. A working live link, a clean GitHub, and a rehearsed 2-minute demo already puts you in the top tier statistically. The floor to win is lower than it appears.

**Implication:** Polish and reliability matter more than ambition. A simple tool that works perfectly beats a complex tool with rough edges.

### Projection 3 — "AI Agents" framing is mandatory, not optional
The hackathon is named "International AI Agents Hackathon." This is not cosmetic. Judges are expecting submissions that demonstrate agentic AI patterns — autonomous multi-step reasoning, not single-prompt generation. A tool that sends one API call to Claude and formats the response is not an agent. A tool that runs a reasoning loop, makes intermediate decisions, and produces structured output is.

**Implication:** Whatever is built must have at least two distinct reasoning steps that chain together. The system prompt architecture matters. This needs to be explainable in the pitch as an agent loop, not a prompt.

### Projection 4 — Audio is a liability, not an asset
The original MediFlow idea used voice as the core input (Whisper API → Claude). The compelling demo was a doctor speaking Hindi and a discharge summary appearing. But the pipeline has three independent failure points: browser MediaRecorder permissions, Whisper API format/latency, Claude API response. In a live demo environment with unfamiliar wifi and unfamiliar hardware, any one of these can silently fail. A failed demo is unrecoverable in a 2-minute pitch window.

**Implication:** Input must be text or file upload. Output can be rich and impressive. The fragility lives at the input layer.

### Projection 5 — MediFlow was the right category, wrong execution risk
The MediFlow concept (healthcare, India, Hinglish, clinical documentation) scored extremely well on both Innovation and Impact. The problem is real, the audience is large, and the demo was visceral. The reason it was set aside is purely execution risk — not idea quality. If audio reliability could be guaranteed (e.g., pre-recorded clip played as input, same pipeline), MediFlow would still be the strongest idea. The pivot to ContractScan retains the "this solves a real Indian problem at scale" energy while eliminating the fragile input layer.

### Projection 6 — The demo moment is the pitch
Judges at hackathons do not read slide decks carefully. They watch demos. The moment the output appears on screen — the risk report, the grant proposal, the evaluation scorecard — is the moment the idea either lands or doesn't. Everything before that moment is setup. Everything after is detail. The demo needs to be under 60 seconds and require zero explanation to understand.

---

## Part 4 — Why MediFlow Was Shelved (Full Reasoning)

MediFlow AI was the first idea developed. It deserves a full record of why it was strong and why it was set aside.

### What made it strong

- **Innovation:** First-of-kind for the Indian healthcare context. No EHR bridges Hinglish to structured clinical English.
- **Impact:** 1.3M doctors × 2 hours saved = 2.6 billion doctor-hours returned to patient care annually.
- **Judge fit:** Nandini (KHAQH, likely healthcare adjacent) would have felt this problem professionally. Vinod would see the SaaS model: ₹999/month × 70,000 clinics × 10% penetration = ₹70 crore ARR.
- **Demo:** Doctor speaks Hindi, discharge summary appears. Visceral. Unforgettable.

### What killed it

The audio pipeline: Browser MediaRecorder → Whisper API → Claude API is three chained integrations. Each carries its own failure mode.

| Integration | Failure mode |
|---|---|
| Browser MediaRecorder | Microphone permissions denied, format unsupported, blob handling errors |
| Whisper API | CORS issues, wrong audio format (Whisper is strict), API latency spikes |
| Claude API | Response timeout, JSON parse error, network drop |

Any single failure silently kills the demo. There is no graceful recovery when you are speaking Hindi into a laptop and nothing appears. Three-layer fallbacks (live mic → uploaded file → static fixture) were designed but add complexity and still do not eliminate the risk.

**The verdict:** Brilliant idea, wrong execution environment. If this were a 72-hour in-person hackathon with controlled wifi and a rehearsed environment, MediFlow would be the play. For a remote submission with a live demo link and unknown demo conditions, it is too fragile.

---

## Part 5 — Idea Shortlist (Post-Pivot)

### Constraints Applied to All Ideas

| Constraint | Rationale |
|---|---|
| No live audio input | Three independent failure points. Eliminated category. |
| No user authentication | Adds 4–6 hours of build time with zero demo value |
| No database / persistence | Session state is sufficient for a hackathon demo |
| Text or file input only | Deterministic, reliable, zero hardware dependency |
| Must feel agentic | Multi-step reasoning loop, not a single prompt |
| Must be deployable on Vercel | Live link required in submission |
| Must be buildable with Claude Code | Solo builder with AI coding agents |

---

### Idea 1 — ContractScan AI ⭐ Recommended

#### One-line pitch
> An AI agent that reads any business contract, lease, or legal document and tells a non-lawyer exactly what they're agreeing to, what clauses are risky, and what's missing — in plain English.

#### The problem
Founders, freelancers, tenants, and small business owners sign contracts they don't understand every single day. Lawyers in India cost ₹5,000–₹15,000 per hour. Most people just sign and hope. There is no accessible middle ground between "hire a lawyer" and "sign blind."

This is not a niche problem:
- Every business signs vendor agreements, NDAs, SaaS terms, employment contracts
- Every tenant signs a lease
- Every freelancer signs a client contract
- None of them have a lawyer on call
- India has 60M+ MSMEs — none of them have in-house legal

#### The agent loop

```
User uploads or pastes contract (PDF or raw text)
        ↓
PDF.js extracts raw text (client-side, no backend)
        ↓
Claude Agent — Step 1: Document type identification
  - What kind of contract is this?
  - What are the standard clauses expected for this type?
        ↓
Claude Agent — Step 2: Clause extraction and risk assessment
  - Autonomously identifies all clause types
  - GREEN: standard and acceptable
  - AMBER: unusual, worth flagging
  - RED: risky, negotiate this or walk away
        ↓
Claude Agent — Step 3: Gap analysis
  - What clauses are missing for this contract type?
  - What should the user ask to add before signing?
        ↓
Structured JSON output
        ↓
Rendered risk report — colour-coded cards, plain-English summaries
```

Three distinct reasoning steps. Each uses the output of the previous. That is an agent loop.

#### Scores

| Criterion | Score | Reasoning |
|---|---|---|
| Innovation | 9/10 | Legal NLP for non-lawyers at this structured output level is genuinely novel |
| Impact | 9/10 | Universal pain point — every person who signs anything is the user |
| Build risk | Low | No audio, no auth, one primary API chain, PDF.js is mature |
| Demo safety | Very high | Paste text → output appears. Zero live dependencies. |
| Startup potential | Very high | LegalZoom does $500M/yr. Legal tech is a proven category. |
| Build time estimate | 2–3 days | With Claude Code as build agent |

#### Judge-specific resonance

**Vinod Guru:** LegalZoom, Rocket Lawyer, Ironclad, SpotDraft — legal tech is a proven $10B+ global market. This is the AI-native version built for India's 60M MSMEs who cannot access traditional legal services. SaaS at ₹299/document or ₹999/month subscription. At 1% penetration of India's MSME market using it once a month: ₹180 crore ARR. The wedge is contract review. The roadmap is clause generation, negotiation suggestions, e-signature — a full legal workflow OS for businesses that cannot afford a lawyer.

**Nandini Sharma:** Imagine a first-generation entrepreneur in tier-2 India signing a distributor agreement with a larger company. They have no lawyer. They have no idea what "indemnification" or "limitation of liability" means. They are about to sign away rights they did not know they had. This tool gives them what was previously only available to people who could afford counsel. That is genuine, immediate, democratising impact.

**Sakshat Hegde:** PDF parsing via PDF.js is real implementation — not a text input trick. Structured JSON extraction via Claude is a real API call with a real system prompt. The risk report UI is real React state rendered from that JSON. The GitHub repo will show all of this clearly. No smoke and mirrors.

#### Tech stack

| Layer | Tool | Notes |
|---|---|---|
| UI scaffold | Next.js + Tailwind (Claude Code) | Clean, inspectable code — no Bolt.new visual noise |
| PDF parsing | PDF.js (client-side) | Mature library, no backend needed, runs in browser |
| AI agent | Claude API (claude-sonnet-4-20250514) | Three-step structured extraction, JSON output mode |
| Output rendering | JSON → React state | Colour-coded risk cards, expandable clause detail |
| Export | Optional — copy to clipboard or jsPDF | Not essential for demo |
| Deploy | Vercel | One-click deploy, live link in minutes |
| Orchestrator | Hermes Agent | Central brain: delegates tasks, runs parallel subagents, tests, verifies |
| Coding agent | Claude Code (via Hermes delegate_task) | All code generation, file creation, integration work |
| Research/testing | Hermes browser + web tools | Live link testing, contract sample research, API verification |

---

#### Hermes Agent Integration — How This Project Gets Built

> Hermes is the orchestrator. You (the human) make strategic decisions. Claude Code subagents write the code. Hermes coordinates everything, tests the output, catches problems early, and keeps the build on schedule.

### Hermes Roles in This Build

**1. Task Orchestrator (delegate_task)**
Hermes spawns focused subagents for each coding task. Each subagent gets its own terminal, its own context, and returns only the final result. Multiple tasks run in parallel when they don't depend on each other.

**2. Strategic Advisor (direct conversation)**
You talk to Hermes about prompt design, pitch language, feature prioritisation, and scope decisions. Hermes reasons about judge psychology, market sizing, and what to cut vs. keep.

**3. Live Tester (browser + terminal)**
After every deploy, Hermes opens the live Vercel URL in the browser, tests the upload flow, verifies the output, and screenshots the result. No "it works on my machine" — Hermes checks the actual live link.

**4. Code Reviewer (file tools + terminal)**
Hermes reads every file Claude Code produces, checks for common issues (hardcoded keys, missing error handling, broken imports), and patches problems before they compound.

**5. Automated Watchdog (cronjob)**
Scheduled jobs that run health checks on the live deployment, verify the API key still works, and alert you if anything breaks between build sessions.

### Agent Architecture Per Task

| Task | Agent | Method | Parallel? |
|---|---|---|---|
| Project scaffolding (Next.js + Tailwind) | Claude Code subagent | Hermes → delegate_task | Yes (with PDF.js setup) |
| PDF.js integration | Claude Code subagent | Hermes → delegate_task | Yes (with scaffolding) |
| Claude API route + system prompt | Hermes directly | Hermes writes prompt, Claude Code wires route | No (prompt first, then wire) |
| Risk report UI components | Claude Code subagent | Hermes → delegate_task | Yes (card component + gap analysis in parallel) |
| Loading states + step indicators | Claude Code subagent | Hermes → delegate_task | Yes (with error handling) |
| Error handling + edge cases | Claude Code subagent | Hermes → delegate_task | Yes (with loading states) |
| Vercel deployment + env setup | Hermes + terminal | Hermes runs vercel deploy directly | No |
| Live link testing | Hermes browser | browser_navigate + browser_vision | No |
| System prompt iteration | Hermes directly | In-conversation prompt design + testing | No |
| GitHub repo polish + README | Hermes file tools | write_file + patch for README, .env.example, docs/ | Yes (with pitch deck) |
| Pitch deck content | Hermes directly | Drafts each slide in conversation | No |
| Contract sample research | Hermes web tools | web_search for real contract templates | Yes (with pitch deck) |
| Mobile/responsive testing | Hermes browser | browser_vision on deployed link | No |
| Demo recording | Manual (you) | OBS or Loom — no agent does this | No |

---

#### Build plan — day by day (Hermes-orchestrated)

**Day 1 — Core Pipeline (the hard day)**

*Goal: Text goes in → JSON risk report comes out. End-to-end. Nothing else matters today.*

**Phase 1 — Parallel Scaffold (Hermes delegates 2 tasks simultaneously):**
- **Subagent A:** "Scaffold a Next.js 14 app with Tailwind CSS at `/mnt/c/Users/sanme/desktop/Hackathons/AI AGENTS HACKATHON/contractscan`. App Router. Create: a home page with a file upload zone (drag-and-drop, PDF only), a text paste textarea, an 'Analyse Contract' button, and a placeholder results panel. Clean component structure. No filler content."
- **Subagent B:** "Set up PDF.js integration in the same Next.js project. Create a utility file `lib/pdfExtractor.ts` that takes a File object, extracts all text content using PDF.js, and returns it as a string. Client-side only. Test it exports correctly."

*Wait for both. Hermes reviews the generated files and patches any issues.*

**Phase 2 — System Prompt (Hermes + you, no subagent):**
- You and Hermes iterate on the three-step Claude system prompt directly in conversation
- Hermes drafts v1, you critique, Hermes revises
- Test the prompt manually: paste a real contract into the Claude console (or Hermes runs it via terminal curl), evaluate the JSON output quality
- Iterate until the output is structured, accurate, and has genuine risk differentiation (green/amber/red that actually makes sense)
- **This is the core IP. Do not delegate this. Budget 2+ hours.**

**Phase 3 — API Route Wiring (Hermes delegates):**
- **Subagent C:** "Create a Next.js API route at `app/api/analyze/route.ts`. It receives `{ text: string }` in POST body, sends it to the Claude API with the system prompt stored in `lib/prompts.ts`, parses the JSON response, and returns structured risk data. Handle malformed JSON gracefully — if Claude returns non-JSON, return the raw text as a fallback field. Use the Anthropic SDK."

**Phase 4 — End-to-End Verification (Hermes directly):**
- Hermes runs the dev server, opens it in browser, pastes a real contract, and verifies the full pipeline
- If it works: Day 1 is a win. Move to Day 2.
- If it doesn't: Hermes reads the error, patches it, retries. **Non-negotiable: pipeline must work before you sleep.**
- If stuck after 3 hours: cut PDF parsing, text-paste only. No shame in it.

---

**Day 2 — Output UI + Visual Agent Steps (parallel build day)**

*Goal: The output looks impressive. The agent's three steps are visible. Edge cases handled.*

**Phase 1 — Parallel Component Build (Hermes delegates 2 tasks simultaneously):**
- **Subagent D:** "Build React components for the risk report. Create: `RiskCard.tsx` (accepts a clause object with title, summary, risk level, recommendation — renders green/amber/red card with expandable detail), `RiskReport.tsx` (maps over clause array, renders RiskCards sorted by risk level — red first), `GapAnalysis.tsx` (renders missing clauses as a checklist below the risk cards). Use Tailwind. Animations optional but nice."
- **Subagent E:** "Build the agent step indicator. Create `AgentSteps.tsx` — a horizontal progress bar that shows three steps: 'Identifying document type...', 'Assessing clause risks...', 'Running gap analysis...'. Each step shows as pending/active/complete with a spinner for active state. The component receives which step is currently running. This makes the agent loop visible to the user during the 15-20 second API call."

*Wait for both. Hermes reviews, patches, integrates into the main page.*

**Phase 2 — Wire Components to API Response (Hermes delegates):**
- **Subagent F:** "Wire the home page: on 'Analyse Contract' click → show AgentSteps with step 1 active → call the /api/analyze route → update AgentSteps as response streams → parse JSON → render RiskReport and GapAnalysis components. Handle loading state, error state (show friendly message, not a stack trace), and empty input state (disable button until text is present)."

**Phase 3 — Edge Cases + Error Handling (Hermes delegates):**
- **Subagent G:** "Add edge case handling: (1) if PDF extraction returns empty or garbled text, show 'Could not extract text from this PDF. Please paste the contract text instead.' (2) if the API returns a non-JSON fallback, render it as a plain text summary. (3) if the API call times out after 30 seconds, show 'Analysis is taking longer than expected. Please try again.' (4) if the contract text is under 100 characters, show 'This document is too short to analyze. Please provide the full contract text.'"

**Phase 4 — Deploy + Live Test (Hermes directly):**
- Hermes deploys to Vercel via terminal
- Hermes opens the live URL in browser
- Hermes pastes a contract, tests the full flow on the live deployment
- Hermes takes a screenshot via browser_vision to verify the UI renders correctly
- **Hermes tests from a mobile viewport** (browser screenshot with mobile dimensions)
- Any issues found: Hermes patches and redeploys

---

**Day 3 — Multi-Contract Testing + Demo Prep (Hermes as QA + strategist)**

*Goal: The tool works on 5 real contract types. The demo is bulletproof. Pitch is ready.*

**Phase 1 — Contract Sample Research (Hermes web tools):**
- Hermes searches for and downloads 5 real contract templates: rental agreement, NDA, freelance contract, SaaS terms of service, employment offer letter
- Hermes saves them in `/docs/demo-contracts/` for testing

**Phase 2 — Systematic Testing (Hermes execute_code):**
- Hermes writes a Python test script that sends each of the 5 contracts to the live API and evaluates:
  - Does it return valid JSON?
  - Does it correctly identify the document type?
  - Does it produce at least one red clause?
  - Does it produce a non-empty gap analysis?
  - Are the plain-English summaries actually readable?
- Results are printed as a pass/fail table
- Any failures: Hermes iterates on the system prompt or patches the parsing logic

**Phase 3 — Demo Pre-Load (Hermes delegates):**
- **Subagent H:** "Add demo mode to the app. If the URL has `?demo=true` or a 'Load Demo' button is clicked, pre-fill the text area with the rental agreement contract. This way the demo starts with the contract already loaded — no fumbling with copy-paste during the pitch."

**Phase 4 — Pitch Deck Content (Hermes + you):**
- Hermes drafts all 5 slides:
  1. **Problem** — "Every person has signed a contract they didn't read" + stat
  2. **Solution** — ContractScan screenshot + "Three-step reasoning agent"
  3. **Demo** — Screenshot of a real risk report with the red clause highlighted
  4. **Tech** — Architecture diagram: PDF.js → Claude Agent (3 steps) → Risk Report
  5. **Market** — ₹180 crore ARR for Vinod, 60M MSMEs, roadmap
- You review and refine. You build the actual deck (Google Slides / Pitch).

**Phase 5 — Backup Demo Recording (Manual — you):**
- Record the full demo flow with OBS or Loom
- Upload to YouTube as unlisted
- Hermes adds the link to the GDoc submission draft

---

**Day 4 — Polish + Submission Assembly**

*Goal: Everything is clean, documented, and submitted early.*

**Phase 1 — GitHub Repo Polish (Hermes file tools):**
- Hermes writes a clean README.md: project description, screenshot, tech stack, how to run locally, .env setup, architecture overview
- Hermes creates `.env.example` with `ANTHROPIC_API_KEY=your_key_here`
- Hermes creates `docs/SYSTEM_PROMPT.md` documenting the three-step prompt (Sakshat will check this)
- Hermes creates `docs/ARCHITECTURE.md` with the agent loop diagram
- Hermes removes any node_modules, .env files, or build artifacts from git tracking

**Phase 2 — GDoc Submission Assembly (Hermes + you):**
- Hermes drafts the GDoc content: live link, GitHub link, pitch deck link, 2-paragraph project description
- You create the GDoc, paste the content, enable link sharing

**Phase 3 — Final Live Verification (Hermes browser):**
- Hermes opens the live Vercel link
- Tests the full flow: paste contract → analyse → verify output renders correctly
- Tests on mobile viewport
- Checks that the demo pre-load (`?demo=true`) works
- Screenshots the final state for the pitch deck
- Any issues: Hermes patches and redeploys immediately

**Phase 4 — Submission (you):**
- Submit on Devpost with all links
- **Submit at least 2 hours before deadline**
- Hermes is available for any last-minute patches

---

**Day 5–7 — Buffer (Hermes cronjob monitoring)**

*If everything went smoothly on Days 1-4, these are insurance days.*

**Automated Watchdog (Hermes cronjob):**
- Hermes sets up a cron job that pings the live Vercel URL every 6 hours
- If the site is down or returns an error, Hermes alerts you immediately
- If the Claude API key quota is running low, Hermes flags it
- This ensures the live link is alive when judges click it

**If Days 1-4 fell behind:**
- Use buffer days to complete whatever was missed
- Hermes re-runs the failed phase with a fresh subagent
- Hermes re-tests after every fix

#### Pitch language (memorise these lines)

**Opening:**
> "Every person in this room has signed a contract they did not fully read. Maybe a lease, a freelance agreement, a SaaS terms of service. Most people sign and hope. Lawyers cost ₹5,000 an hour. ContractScan gives you what you should have had before you signed."

**After the demo:**
> "What you just saw is not a summariser. It is an agent — it identified what type of contract this is, it reasoned about which clauses are standard and which are risky, and it identified what was missing before I should have signed. Three reasoning steps, thirty seconds."

**Close for Vinod:**
> "SaaS at ₹299 per scan or ₹999 per month unlimited. India has 60 million MSMEs. At 1% using it once a month, that is ₹180 crore ARR. The wedge is contract review. The roadmap is clause generation, negotiation coaching, and e-signature — a full legal workflow for businesses that cannot afford a lawyer."

#### Demo script (exactly what to do, in order)

1. Have the demo pre-loaded: rental agreement already pasted in the input field
2. Say the opening line above
3. Click "Analyse contract" — do not explain what is about to happen
4. Watch it process (15–20 seconds) — stay silent
5. Scroll through the output slowly — green clauses, amber clauses, red clause (rent escalation clause, flagged), gap analysis at bottom
6. Point at the red clause: *"That clause lets the landlord raise rent 20% annually with 7 days notice. Most people sign that."*
7. Say the close line above
8. Total time: under 90 seconds

---

### Idea 2 — GrantWriter AI (Backup)

#### One-line pitch
> An AI agent for NGOs, researchers, and startups that drafts grant applications from a short brief — structured, tailored, and in the language funders actually want to see.

#### The problem
Thousands of Indian NGOs and research institutions lose funding not because their work is bad — but because their grant writing is weak. A rural digital literacy NGO in Rajasthan does exceptional work but writes a proposal that reads like an internal memo. A well-resourced NGO in Delhi wins the same grant with better prose. Professional grant writers charge ₹50,000–₹2,00,000 per proposal. Most small NGOs cannot afford one.

#### The agent loop

```
User fills short brief form
  (org name, what you do, project goal, funder name, budget, timeline)
        ↓
Claude Agent — Step 1: Funder priority inference
  - Infers what this funder cares about from their name and sector
  - Adjusts emphasis, vocabulary, and framing accordingly
        ↓
Claude Agent — Step 2: Full proposal generation
  - Executive summary
  - Problem statement (with relevant statistics)
  - Project objectives (SMART format)
  - Implementation plan with milestones
  - Budget rationale
  - Impact metrics and evaluation methodology
        ↓
Formatted, downloadable proposal
```

#### Scores

| Criterion | Score | Reasoning |
|---|---|---|
| Innovation | 8/10 | Grant writing tools exist; funder-tailored agentic output is the novel layer |
| Impact | 9/10 | Direct social impact — better proposals = more funding for underfunded organisations |
| Build risk | Very low | Form input → Claude → formatted output. Simplest possible pipeline. |
| Demo safety | Very high | Fully deterministic, zero external dependencies beyond Claude API |
| Startup potential | High | Social sector SaaS, or CSR-funded tool for nonprofits |
| Build time estimate | 1–2 days | Fastest build of the three ideas |

#### When to choose GrantWriter over ContractScan
- If you want the absolute safest build (no PDF parsing)
- If you want the strongest emotional resonance with Nandini specifically
- If time is shorter than expected and you need to cut scope

#### Why ContractScan remains the stronger choice
- Innovation score is one point higher (legal AI is less explored than writing assistance)
- Broader audience (every person, not just NGOs and researchers)
- Stronger startup narrative for Vinod (legal tech is a proven category with clear comps)

---

### Idea 3 — HireLoop AI (Bold swing, highest ceiling)

#### One-line pitch
> An AI hiring agent: paste a job description → the agent builds a custom evaluation scorecard. Then paste any resume → the agent scores the candidate against that scorecard and gives a hire/no-hire recommendation with reasoning.

#### The problem
Small businesses and startups make expensive hiring mistakes not because they lack judgment — but because they evaluate candidates inconsistently. No rubric. No scorecard. Pure gut feel. The result is biased, inconsistent, and costly: average mis-hire costs 30–50% of annual salary.

#### The agent loop (the most explicitly agentic of the three)

```
Step 1 — JD Analysis
User pastes job description
        ↓
Claude Agent reasons about what an ideal candidate looks like
  - Generates 5 weighted evaluation criteria from the JD
  - Writes 5 role-specific screening questions
  - Produces a structured scorecard framework
  - Outputs the scorecard to the user for review
        ↓

Step 2 — Resume Evaluation (uses Step 1 output as context)
User pastes candidate resume
        ↓
Claude Agent evaluates the resume against the Step 1 scorecard
  - Scores each criterion 1–5 with evidence from the resume
  - Identifies gaps and missing signals
  - Produces hire / maybe / no-hire recommendation with full reasoning
        ↓

Structured evaluation card — shareable, printable
```

Step 2 explicitly takes Step 1's scorecard as its evaluation framework. This is the most architecturally agentic of the three ideas — the agent's earlier reasoning directly constrains its later reasoning.

#### Scores

| Criterion | Score | Reasoning |
|---|---|---|
| Innovation | 9/10 | Two-step chained reasoning pipeline — genuinely demonstrates agentic architecture |
| Impact | 8/10 | Universal (every company hires) but less emotionally immediate than contracts or grants |
| Build risk | Medium | Two Claude calls must chain correctly; resume text quality varies |
| Demo safety | High | Text input only — but both steps must execute cleanly live |
| Startup potential | Very high | Every company hires. Massive, universal TAM. |
| Build time estimate | 3–4 days | More complex state management for two-step flow |

#### The key risk and its mitigation
Resume PDFs vary enormously in formatting quality. A badly formatted resume (columns, tables, graphics) produces garbled text extraction, which produces a weak evaluation, which tanks the demo. **Mitigation: accept plain text paste only for resumes — explicitly no PDF upload for the resume step.** Frame this as a feature: "paste the plain text so nothing gets lost in formatting."

#### When to choose HireLoop
If you want the strongest possible "this is genuinely an AI agent" argument and are confident in Claude Code's ability to handle two sequential API calls with shared state. The ceiling is higher. The demo risk is also higher. Best if you have strong React state management comfort or are very confident in Claude Code directing that complexity.

---

## Part 6 — Head-to-Head Comparison

| | ContractScan AI | GrantWriter AI | HireLoop AI |
|---|---|---|---|
| Innovation | 9/10 | 8/10 | 9/10 |
| Impact | 9/10 | 9/10 | 8/10 |
| Build risk | Low | Very low | Medium |
| Demo safety | Very high | Very high | High |
| Startup angle (Vinod) | Strong | Moderate | Very strong |
| Emotional resonance (Nandini) | High | Very high | Moderate |
| Technical credibility (Sakshat) | High | Moderate | Very high |
| Audience breadth | Universal | NGOs/researchers | Businesses |
| Build time | 2–3 days | 1–2 days | 3–4 days |
| Recommended | ✅ Yes | Backup | Bold swing |

---

## Part 7 — Final Recommendation & Rationale

**Build ContractScan AI. Pitch it with HireLoop's startup ambition.**

ContractScan wins on every constraint simultaneously:
- Lowest build risk of the credible ideas
- Highest demo safety (paste text, output appears, nothing can fail)
- Universal audience (every judge has signed a contract they didn't fully read)
- Strong startup narrative for Vinod (legal tech is a proven, large market)
- Real-world deployability for Nandini (first-gen entrepreneur in tier-2 India)
- Honest, real implementation for Sakshat (PDF parsing + chained Claude calls + JSON rendering)
- Genuinely agentic (three reasoning steps, not one prompt)

The pitch borrows HireLoop's framing energy: this is not a student project, it is the early version of a real business that solves a real problem at scale.

---

## Part 8 — Submission Checklist

- [ ] Live Vercel link — works from any device, any network, without setup
- [ ] GitHub repo — clean README, `.env.example`, Claude system prompt documented in `/docs`
- [ ] Pitch deck — 5 slides: Problem / Solution / Demo screenshot / Tech stack / Market
- [ ] GDoc — all three links in one public document, link-sharing turned on
- [ ] Backup screen recording of the demo — in case of any live link issue during judging
- [ ] Test the live link from a phone on mobile data, not just laptop on home wifi
- [ ] Submit at least 2 hours before the deadline — never cut it to the last minute

---

## Part 9 — Build Week Schedule (Hermes-Orchestrated)

| Day | Focus | Hermes Role | Key Subagents | Goal |
|---|---|---|---|---|
| Day 1 | Core pipeline | Orchestrator + strategist | A (scaffold), B (PDF.js), C (API route) | Parallel scaffold → prompt iteration → API wire → E2E verified |
| Day 2 | Output UI + deploy | Parallel delegator + live tester | D (risk cards), E (step indicator), F (wiring), G (edge cases) | All components built, wired, edge-cased, deployed, live-tested |
| Day 3 | QA + demo prep | QA engineer + pitch strategist | H (demo mode) | 5 contracts pass, demo pre-loaded, pitch deck drafted |
| Day 4 | Polish + submit | Code reviewer + doc writer | None (Hermes does it directly) | README, docs, GDoc assembled, final live verification, submitted |
| Days 5–7 | Buffer + monitoring | Automated watchdog (cronjob) | None | Cron pings live URL every 6h, alerts on failure, buffer for slipped work |

**Hermes invocation cheatsheet — copy-paste these when you start each day:**

Day 1 kickoff:
```
Hermes, start Day 1 of ContractScan build. Spawn subagents A and B in parallel:
A: scaffold Next.js 14 + Tailwind at contractscan/ with upload zone, paste area, analyse button, results placeholder
B: set up PDF.js text extraction utility
Then we iterate on the system prompt together.
```

Day 2 kickoff:
```
Hermes, start Day 2. Spawn subagents D and E in parallel:
D: build RiskCard, RiskReport, GapAnalysis components
E: build AgentSteps progress indicator
Then wire everything via subagent F and handle edge cases via G.
Deploy to Vercel and live-test when ready.
```

Day 3 kickoff:
```
Hermes, start Day 3. Research and download 5 real contract templates.
Write and run a test script against the live API for all 5.
Spawn subagent H for demo mode.
Then draft the 5 pitch deck slides.
```

Day 4 kickoff:
```
Hermes, start Day 4. Write README.md, .env.example, docs/SYSTEM_PROMPT.md, docs/ARCHITECTURE.md.
Do a final live browser test. Draft GDoc submission content.
```

**The non-negotiable rule:** If the core pipeline is not working end-to-end by the end of Day 1, cut scope immediately — not tomorrow, not after one more try. Drop PDF parsing, go to text paste only. The pipeline must work before anything else is built on top of it. Hermes will enforce this by running the E2E verification and reporting pass/fail.

---

## Part 10 — The One-Paragraph Brief

*Read this before every build session to reorient.*

You are building ContractScan AI — an AI agent that reads any contract and tells a non-lawyer what they're agreeing to, what's risky, and what's missing. The agent runs three reasoning steps: document type identification, clause-by-clause risk assessment, and gap analysis. Input is a pasted contract or uploaded PDF. Output is a structured risk report with colour-coded cards. The demo is pre-loaded with a rental agreement. The pitch opens with "every person in this room has signed something they didn't read" and closes with a ₹180 crore ARR market sizing for Vinod. The tool must be live on Vercel, documented on GitHub, and submitted in a GDoc before May 29 at 1:00pm EDT. 46 participants. Two criteria. One winner.

API key: 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