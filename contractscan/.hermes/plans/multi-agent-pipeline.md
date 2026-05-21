# ContractScan AI -- Multi-Agent Pipeline Build Plan

## Goal
Transform ContractScan from a single-prompt API wrapper into a real multi-agent system with orchestrator, conditional execution, self-critique, and negotiation simulation.

## Constraint: Groq free tier = 100K TPD (~16 quick analyses, ~12 full analyses)
Strategy: Conditional agents + on-demand expensive features + cached demo

---

## Phase 1: Agent Pipeline Foundation [DO FIRST]
- [ ] 1.1 Create `src/lib/agents/` directory structure
- [ ] 1.2 Build `src/lib/agents/classifier.ts` -- Agent 1: classify doc type, expected clauses
- [ ] 1.3 Build `src/lib/agents/extractor.ts` -- Agent 2: extract + rate clauses
- [ ] 1.4 Build `src/lib/agents/gapFinder.ts` -- Agent 3: find missing clauses
- [ ] 1.5 Build `src/lib/agents/critic.ts` -- Agent 4: self-critique (conditional)
- [ ] 1.6 Build `src/lib/agents/orchestrator.ts` -- decides which agents run, chains them
- [ ] 1.7 Rewrite `src/app/api/analyze/route.ts` -- uses orchestrator instead of single call
- [ ] 1.8 Pre-compute demo result for multi-agent pipeline (save tokens)

## Phase 2: Agent Pipeline UI
- [ ] 2.1 Build `src/components/AgentPipeline.tsx` -- real-time agent execution visualization
- [ ] 2.2 Replace `AgentSteps.tsx` with `AgentPipeline.tsx` in page.tsx
- [ ] 2.3 Show agent-by-agent results as they stream in (each agent card expands when done)

## Phase 3: On-Demand Agents (separate endpoints)
- [ ] 3.1 Build `src/app/api/negotiate/route.ts` -- negotiation simulator agent
- [ ] 3.2 Build `src/lib/agents/negotiator.ts` -- Agent 5: simulate negotiation
- [ ] 3.3 Build `src/components/NegotiationSim.tsx` -- negotiation UI panel
- [ ] 3.4 Build `src/app/api/rewrite/route.ts` -- contract rewriter agent
- [ ] 3.5 Build `src/lib/agents/rewriter.ts` -- Agent 6: rewrite unfair clauses
- [ ] 3.6 Build `src/components/RewrittenContract.tsx` -- side-by-side rewrite view

## Phase 4: Polish & Deploy
- [ ] 4.1 Verify build passes
- [ ] 4.2 Test full pipeline with demo contract
- [ ] 4.3 Push to GitHub, auto-deploy to Vercel
- [ ] 4.4 Update BUILD_CONTEXT.md

## Token Budget per Scenario
| Scenario | Tokens | Notes |
|---|---|---|
| Demo (cached) | 0 | Unlimited |
| Quick analysis (agents 1+2+3) | ~6K | ~16/day |
| Full + critique (1+2+3+4) | ~8K | ~12/day |
| + Negotiation (on demand) | +3K | Per trigger |
| + Rewrite (on demand) | +2K | Per trigger |
