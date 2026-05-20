# ContractScan AI — Demo Guide

AI-powered contract analysis platform with a 3-agent architecture (Identify → Assess → Gap Analysis). Built for the AI Agents Hackathon.

Live at: **https://contractscan-eight.vercel.app**

---

## Quick Demo (2 minutes)

### Step 1: Landing Page
Open https://contractscan-eight.vercel.app. You'll see the dark-themed landing page with the "Don't Sign Blind." hero section and the "How It Works" feature cards explaining the 3-agent pipeline.

### Step 2: Load Demo Contract
Click the **"Try Demo"** button in the hero, OR scroll down to the tool and click **"Load Demo"**. A residential lease agreement will populate the text area. This demo works offline and bypasses the API rate limit — it uses a cached result so it always works.

### Step 3: Analyze
Click **"Analyse Contract"**. The agent steps will animate through:
1. **Document Intelligence** — identifies the contract type
2. **Risk Assessment** — flags every clause as red/amber/green
3. **Gap Analysis** — spots missing protections

After ~1.5 seconds the full analysis appears on the right panel.

### Step 4: Explore the Results
- **Fairness Score** — animated gauge showing 30/100 (this lease is heavily one-sided)
- **Clause Breakdown** — 14 clauses sorted by risk (7 red, 3 amber, 4 green), each with a plain-English explanation and a suggested rewrite
- **Missing Protections** — 3 gaps identified (no move-in inspection, no dispute resolution, no renter's insurance)
- **Negotiation Cheat Sheet** — prioritized action items derived from the analysis
- **Agent Reasoning** — transparent chain-of-thought showing how each agent reached its conclusions
- **Chat with Contract** — ask follow-up questions about the contract in natural language
- **Compare Two Versions** — upload or paste a second version of a contract and get a side-by-side diff
- **Share Report** — generate a shareable URL with the full analysis encoded

### Step 5: Dark/Light Toggle
Click the sun/moon icon in the header to toggle themes.

---

## Chrome Extension Demo (3 minutes)

### Setup (one-time, 30 seconds)
1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top-right)
3. Click **"Load unpacked"**
4. Navigate to the `chrome-extension/` folder inside this project and select it
5. The ContractScan AI icon appears in your extensions bar

### Demo
1. Open any website with legal/contract text. Good examples:
   - https://www.apple.com/legal/internet-services/itunes/dev/stdevstandard/ (Apple Developer Agreement)
   - https://twitter.com/en/tos (Twitter/X Terms of Service)
   - https://www.netflix.com/termsofuse (Netflix Terms of Use)
   - Or any DocuSign/Google Docs/PDF viewer with a contract
2. **Select a large chunk of contract text** (at least a paragraph — 100+ characters)
3. **Right-click** and choose **"Analyze with ContractScan"**
4. The Chrome side panel slides open from the right
5. Shows loading spinner, then the full analysis:
   - Document type detection
   - Fairness score with color coding
   - Risk breakdown (red/amber/green counts)
   - Clause-by-clause cards sorted by risk level
   - Suggested rewrites for unfair clauses
   - Missing protections / gap analysis
6. Click "Open full analysis at ContractScan AI" to jump to the web app

### Note on Rate Limits
The extension calls the same Groq API as the web app. The free tier allows ~100K tokens/day. If you hit the limit during demo, the web app's "Load Demo" button always works because it uses a cached result. Wait a few hours for the rate limit to reset for live analysis.

---

## Custom Contract Demo

### Paste Your Own Contract
1. Scroll to the tool section
2. Paste any contract text (100+ characters) into the text area
3. Click "Analyse Contract"
4. The 3 agents will process it and return a full analysis

### Upload a PDF
1. Drag and drop a PDF file onto the drop zone, or click to browse
2. The text is extracted client-side using pdfjs-dist (no server processing)
3. Click "Analyse Contract"

---

## Architecture Overview

```
User Input (text/PDF)
       |
       v
  [Agent 1: Document Intelligence]
    - Identifies document type
    - Extracts key parties and structure
       |
       v
  [Agent 2: Risk Assessment]
    - Flags every clause as red/amber/green
    - Generates plain-English risk explanations
    - Suggests fair rewrites for unfair clauses
       |
       v
  [Agent 3: Gap Analysis]
    - Identifies missing protections
    - Recommends clauses to add
    - Highlights one-sided terms
       |
       v
  Full Analysis Report
    - Fairness score (0-100)
    - Clause-by-clause breakdown
    - Negotiation cheat sheet
    - Agent reasoning visualization
    - Chat follow-up questions
    - Comparison with other versions
    - Shareable report link
```

---

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS v4, TypeScript
- **AI:** Groq API (llama-3.3-70b-versatile) — 3-step agent pipeline
- **PDF Parsing:** pdfjs-dist (client-side extraction)
- **Deployment:** Vercel (serverless functions for API routes)
- **Chrome Extension:** Manifest V3, Side Panel API, Context Menus API

---

## Project Structure

```
contractscan/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main landing page + tool
│   │   ├── layout.tsx            # Root layout with dark theme
│   │   ├── globals.css           # Tailwind + custom animations
│   │   └── api/
│   │       ├── analyze/route.ts  # Main analysis API (3 agents)
│   │       └── chat/route.ts     # Chat follow-up API
│   ├── components/
│   │   ├── AgentSteps.tsx        # 3-step pipeline visualization
│   │   ├── RiskReport.tsx        # Full analysis report
│   │   ├── RiskCard.tsx          # Individual clause card
│   │   ├── ScoreGauge.tsx        # Animated fairness score
│   │   ├── NegotiationCheatSheet.tsx
│   │   ├── AgentReasoning.tsx    # Chain-of-thought display
│   │   ├── ChatPanel.tsx         # Conversational Q&A
│   │   ├── ContractComparison.tsx # Side-by-side diff
│   │   ├── ShareableReport.tsx   # URL sharing
│   │   └── ThemeToggle.tsx       # Dark/light toggle
│   └── lib/
│       └── pdfExtractor.ts       # Client-side PDF text extraction
├── chrome-extension/
│   ├── manifest.json             # Manifest V3 config
│   ├── background.js             # Service worker (context menu + API)
│   ├── content.js                # Content script (page detection)
│   ├── sidepanel.html/css/js     # Side panel analysis UI
│   └── icons/                    # Extension icons
├── public/
│   ├── demo-contract.txt         # Demo rental agreement text
│   ├── demo-result.json          # Cached analysis (works offline)
│   └── demo-contracts/           # Additional test contracts
│       ├── nda.txt
│       ├── employment.txt
│       ├── freelance.txt
│       ├── saas-terms.txt
│       └── vendor.txt
└── SUBMISSION.md                 # Hackathon submission document
```

---

## Judges Quick Reference

| What to show | Time | Where |
|---|---|---|
| Landing page + hero | 15s | https://contractscan-eight.vercel.app |
| Demo analysis (always works) | 30s | Click "Try Demo" → "Analyse Contract" |
| Clause breakdown + rewrites | 30s | Scroll through results on right panel |
| Chat with contract | 20s | Type a question in the chat panel |
| Chrome extension | 60s | Right-click on any ToS page |
| Compare two versions | 30s | Expand "Compare Two Versions" section |
| Shareable link | 10s | Click share button, open in new tab |

---

*Built for the AI Agents Hackathon. Every signature should be an informed one.*
