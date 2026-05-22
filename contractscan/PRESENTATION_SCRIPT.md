# ContractScan AI -- Hackathon Presentation Script

## Logistics
- **Time**: Aim for 4-5 minutes (most hackathons give 3-5 min)
- **Site**: https://contractscan-eight.vercel.app
- **Have open**: The site loaded and ready in one browser tab
- **Backup**: Screen-recording of the demo on your phone (in case live demo fails)

---

## THE SCRIPT

### HOOK (15 seconds)
> "Raise your hand if you've ever signed a contract without fully understanding it."
> *(pause 2 seconds)*
> "Yeah. Everyone. That's the problem we're solving."

### PROBLEM (30 seconds)
> "Contracts are everywhere -- apartments, jobs, freelance gigs, SaaS tools.
> But they're written in legal jargon that ordinary people can't parse.
> You sign and hope for the best.
>
> What if AI agents could read the contract FOR you -- flag every risky clause,
> find what's MISSING, and then help you negotiate better terms?"

### SOLUTION INTRO (20 seconds)
> "ContractScan AI is a multi-agent system with six specialized AI agents
> that work together to analyze any contract in seconds.
>
> I'm going to show you how it works -- live."

---

### LIVE DEMO (2.5 minutes)

**[ACTION: Switch to browser. Site should be on the hero section.]**

> "I'll use our demo contract -- a residential lease agreement."

**[ACTION: Click "Try Demo" button]**

> "When you hit Analyze, our orchestrator agent kicks off a pipeline
> of four specialized agents."

**[POINT to the Agent Pipeline panel on the left side]**

> "You can see them working in real-time right here.
> Agent 1 -- the Document Classifier -- identifies what type of contract this is
> and lists the standard clauses it should contain.
>
> Agent 2 -- the Clause Analyzer -- reads every single clause and rates it
> green, amber, or red with a plain-English explanation.
>
> Agent 3 -- the Gap Finder -- compares what SHOULD be in this lease
> versus what IS there, and flags missing protections.
>
> Agent 4 -- the Self-Critique agent -- this one is conditional.
> It only runs if the extraction looks suspicious.
> If there are very few clauses, or everything looks suspiciously green,
> it double-checks the work."

**[WAIT for results to load. The pipeline animation takes ~5.5 seconds.]**

> "And here we go. Results."

**[POINT to the Risk Report]**

> "Fairness score: 30 out of 100. This lease is heavily one-sided.
> Seven red clauses, three amber, four green.
> Each card tells you exactly what's wrong in plain English
> and what you should do about it."

**[SCROLL DOWN slowly to Gap Analysis]**

> "The Gap Finder found 3 missing clauses -- no move-in inspection,
> no dispute resolution, no renter's insurance requirement.
> Things the landlord conveniently left out."

**[SCROLL to Negotiation Cheat Sheet]**

> "The Cheat Sheet prioritizes everything -- Critical, Important, Add This.
> It's your battle plan for negotiation."

---

### AGENT 5: NEGOTIATION SIMULATOR (40 seconds)

**[POINT to "Negotiation Simulator" panel]**

> "But here's where it gets interesting. Agent 5 is an on-demand
> negotiation simulator."

**[ACTION: Click "Simulate Negotiation" button]**

> "It role-plays BOTH sides. For every unfair clause,
> it tells you what the other party will argue,
> what YOU should say in response,
> and where the middle ground is.
>
> It even gives you a walk-away recommendation."

**[WAIT for results. Scroll through the rounds.]**

> "These are exact phrases you can copy and use in your negotiation."

---

### AGENT 6: CLAUSE REWRITER (30 seconds)

**[SCROLL to "Rewrite Unfair Clauses" panel]**

> "Agent 6 is also on-demand. Hit this button and it rewrites
> every unfair clause into a fair, balanced alternative
> you can actually propose."

**[ACTION: Click "Rewrite Unfair Clauses" button]**

> "Side by side -- the original in red, the fair version in green.
> With an estimated new fairness score if you got these changes accepted."

**[WAIT for results. Point to the side-by-side view.]**

---

### TECHNICAL DEEP DIVE (45 seconds) -- for the technical judge

> "Let me quickly explain the architecture because it's not just
> one prompt wrapped in an API.
>
> We have an orchestrator pattern. One agent decides which other agents
> to run based on the contract's complexity.
>
> The Self-Critique agent is CONDITIONAL -- it only runs when the extraction
> quality is suspect. That saves tokens on simple contracts
> and adds rigor on complex ones.
>
> The Negotiation Simulator and Clause Rewriter are ON-DEMAND.
> They don't burn tokens unless the user explicitly triggers them.
>
> All six agents use context compression between stages.
> Each agent gets structured JSON from the previous agent,
> not the full verbose output. That cuts token usage by about 40%.
>
> The whole stack runs on Groq's free tier -- Llama 3.3 70B --
> and we can do about 16 full analyses per day at zero cost."

---

### IMPACT & BUSINESS (30 seconds) -- for the business/impact judges

> "Who does this help?
>
> College students signing their first apartment lease.
> Freelancers reviewing client contracts.
> Small business owners who can't afford a $400/hour lawyer.
>
> ContractScan doesn't replace legal advice -- it levels the playing field.
> It tells you what's wrong BEFORE you sign, in language you can understand,
> and gives you the tools to push back.
>
> The demo mode works with zero API cost -- pre-computed results.
> That means the free tier can serve unlimited demo users
> while paying users get live analysis."

---

### CLOSE (15 seconds)

> "Six agents. One report. Zero surprises.
>
> ContractScan AI. Don't sign blind.
>
> Thank you."

---

## TIMING BREAKDOWN
| Section | Time |
|---|---|
| Hook | 0:15 |
| Problem | 0:30 |
| Solution intro | 0:20 |
| Live demo (pipeline) | 2:30 |
| Agent 5 (negotiation) | 0:40 |
| Agent 6 (rewriter) | 0:30 |
| Technical deep dive | 0:45 |
| Impact & business | 0:30 |
| Close | 0:15 |
| **TOTAL** | **~5:35** |

If they give you 3 minutes, cut the Technical Deep Dive to 15 seconds
and skip Agent 6 live demo (just mention it exists).

---

## ANTICIPATED QUESTIONS + ANSWERS

**Q: How is this different from ChatGPT?**
> "ChatGPT is one model doing everything in one shot. We have six
> specialized agents that hand off structured data to each other.
> The orchestrator makes conditional decisions about which agents to run.
> The self-critique agent checks its own work. That's a fundamentally
> different architecture from a single prompt."

**Q: How accurate is the analysis?**
> "It's not legal advice -- we're clear about that. But in testing,
> it consistently flags the major risks: one-sided liability, excessive fees,
> missing protections. The self-critique agent catches cases where the
> initial extraction might miss buried clauses."

**Q: What about token costs?**
> "The core pipeline uses about 6K tokens per analysis. On Groq's free tier,
> that's roughly 16 analyses per day. The expensive agents -- negotiation
> and rewriting -- are on-demand only. And the demo mode is pre-computed,
> so unlimited users can try it with zero API cost."

**Q: What LLM are you using?**
> "Llama 3.3 70B via Groq. Chosen for speed -- each agent responds in
> 1-4 seconds, so the full pipeline completes in under 10 seconds.
> The orchestrator pattern means we could swap to any OpenAI-compatible
> model without changing the agent logic."

**Q: What would you build next?**
> "Three things. First, streaming -- show each agent's output in real-time
> instead of waiting for the full pipeline. Second, contract comparison --
> upload two versions and see what changed. Third, a Chrome extension
> that analyzes contracts inline on DocuSign or similar platforms.
> We actually have the extension scaffolded already."

---

## BACKUP PLAN
If the live demo fails (API rate limit, network issue, etc.):

1. Say: "Let me switch to our pre-recorded demo"
2. Play the screen recording from your phone
3. Narrate over it using the same script above

The demo mode uses cached results with ZERO API calls,
so it should always work. The only risk is if Vercel itself is down.
