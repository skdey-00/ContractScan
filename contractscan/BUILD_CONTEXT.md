# ContractScan AI - Build Context

## Project Overview
AI-powered contract analysis tool for the AI Agents Hackathon. Uses a multi-agent pipeline built on Groq (Llama 3.3 70B) to analyze contracts for risks, gaps, and negotiation strategies.

## Live URL
https://contractscan-eight.vercel.app

## GitHub
https://github.com/skdey-00/ContractScan

## Architecture

### Multi-Agent Pipeline (6 Agents)
| # | Agent | File | Purpose | Trigger |
|---|---|---|---|---|
| 1 | Document Classifier | `src/lib/agents/classifier.ts` | Classifies doc type, identifies expected clauses & parties | Always |
| 2 | Clause Analyzer | `src/lib/agents/extractor.ts` | Extracts & rates every clause (green/amber/red) | Always |
| 3 | Gap Finder | `src/lib/agents/gapFinder.ts` | Compares expected vs found clauses, identifies gaps | Always |
| 4 | Self-Critique | `src/lib/agents/critic.ts` | Reviews extraction quality, finds missed clauses | Conditional (few clauses, all green, or dense-but-sparse) |
| 5 | Negotiation Simulator | `src/lib/agents/negotiator.ts` | Role-plays both sides of negotiation | On-demand (user button) |
| 6 | Clause Rewriter | `src/lib/agents/rewriter.ts` | Rewrites unfair clauses into fair alternatives | On-demand (user button) |

### Orchestrator
`src/lib/agents/orchestrator.ts` chains agents 1→2→4(conditional)→3 and assembles the result.

### API Routes
| Route | Method | Purpose |
|---|---|---|
| `/api/analyze` | POST | Full multi-agent pipeline analysis |
| `/api/chat` | POST | Chat with contract context |
| `/api/negotiate` | POST | On-demand negotiation simulation |
| `/api/rewrite` | POST | On-demand clause rewriting |

### Frontend Components
| Component | Purpose |
|---|---|
| `AgentPipeline.tsx` | Real-time agent execution visualization (simulated during load, actual data on complete) |
| `RiskReport.tsx` | Score gauge, clause cards, gap analysis, downloads |
| `NegotiationSim.tsx` | Collapsible negotiation simulator panel |
| `RewrittenContract.tsx` | Side-by-side original vs rewritten clauses |
| `NegotiationCheatSheet.tsx` | Prioritized action items from risks & gaps |
| `AgentReasoning.tsx` | 3-step reasoning chain visualization |
| `ChatPanel.tsx` | Collapsible chat with suggestion chips |

## Data Format

### API Response (from orchestrator)
```json
{
  "documentType": "string",
  "overallRisk": "low|medium|high",
  "fairnessScore": 0-100,
  "clauses": [
    { "title": "str", "summary": "str", "riskLevel": "green|amber|red",
      "recommendation": "str", "suggestedRewrite": "str?", "details": "str?" }
  ],
  "gapAnalysis": [
    { "clause": "str", "importance": "high|medium|low", "suggestion": "str" }
  ],
  "_pipeline": {
    "agents": [
      { "name": "Document Classifier", "status": "done|error|skipped",
        "duration": 1200, "output": "str" }
    ],
    "totalDuration": 5700,
    "critiqueTriggered": true,
    "critiqueReason": "str"
  }
}
```

## Token Budget (Groq Free Tier: 100K TPD)
| Scenario | Tokens | Runs/Day |
|---|---|---|
| Demo (cached) | 0 | Unlimited |
| Quick analysis (agents 1+2+3) | ~6K | ~16 |
| Full + critique (1+2+3+4) | ~8K | ~12 |
| + Negotiation (on demand) | +3K | Per trigger |
| + Rewrite (on demand) | +2K | Per trigger |

## Tech Stack
- Next.js 16 (Turbopack)
- TypeScript
- Groq SDK (llama-3.3-70b-versatile)
- Tailwind CSS (dark zinc theme)
- Vercel (auto-deploy from GitHub main)

## Judges
- Sakshat (technical)
- Vinod (business)
- Nandini (impact)
