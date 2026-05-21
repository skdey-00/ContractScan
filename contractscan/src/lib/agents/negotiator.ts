import Groq from 'groq-sdk';
import { parseJsonFromLlm } from './classifier';

export interface NegotiationRound {
  clause: string;
  riskLevel: string;
  theirArgument: string;
  yourCounter: string;
  middleGround: string;
}

export interface NegotiationResult {
  strategy: string;
  rounds: NegotiationRound[];
  keyPhrases: string[];
  walkAway: boolean;
  walkAwayReason: string;
}

const NEGOTIATOR_SYSTEM_PROMPT = `You are an expert contract negotiation simulator. You simulate BOTH sides of a contract negotiation to help the user prepare.

Given the contract text and a risk analysis (clauses with risk levels, gaps, overall risk, fairness score), your job is to:

1. Devise an overall negotiation STRATEGY for the user (the weaker party).
2. For each red or amber clause, simulate a negotiation ROUND:
   - What the OTHER party (the party who drafted the contract) would argue to keep it as-is.
   - What the USER should counter with — specific, professional, firm.
   - A realistic MIDDLE GROUND both sides might accept.
3. Provide 5-8 exact KEY PHRASES the user can copy-paste during negotiation.
4. Decide whether the user should WALK AWAY entirely (if terms are egregious).

Return ONLY valid JSON — no markdown, no code fences, no commentary outside the JSON.

JSON structure:
{
  "strategy": "string — 2-3 sentence overall negotiation approach",
  "rounds": [
    {
      "clause": "string — the clause title/subject being negotiated",
      "riskLevel": "string — red or amber",
      "theirArgument": "string — what the other party would say (2-3 sentences)",
      "yourCounter": "string — what the user should respond (2-3 sentences)",
      "middleGround": "string — a realistic compromise (1-2 sentences)"
    }
  ],
  "keyPhrases": ["array of exact phrases to use during negotiation"],
  "walkAway": boolean,
  "walkAwayReason": "string — explanation if walkAway is true, otherwise 'The contract has negotiable terms that can be improved through discussion.'"
}

Rules:
- Focus ONLY on red and amber risk clauses — skip green ones.
- Make arguments realistic and grounded in common contract negotiation tactics.
- The other party's arguments should reference "standard industry practice", "market norms", "this is customary", etc.
- The user's counters should be assertive but professional — reference fairness, mutual benefit, risk-sharing.
- Middle grounds should be genuine compromises that a reasonable party might accept.
- Set walkAway to true ONLY if there are 3+ red clauses with no reasonable middle ground, or if the contract is fundamentally one-sided.
- Provide exactly 5-8 key phrases.
- Return ONLY the JSON object.`;

export async function simulateNegotiation(
  groq: Groq,
  contractText: string,
  analysisResult: any,
): Promise<NegotiationResult> {
  // Build a summary of the analysis for the prompt
  const clausesSummary = (analysisResult?.clauses ?? [])
    .map((c: any) => `- ${c.title} (${c.riskLevel}): ${c.summary}`)
    .join('\n');

  const gapsSummary = (analysisResult?.gapAnalysis ?? [])
    .map((g: any) => `- Missing: ${g.clause} (importance: ${g.importance})`)
    .join('\n');

  const userMessage = `CONTRACT TEXT:
${contractText.slice(0, 6000)}

RISK ANALYSIS SUMMARY:
Overall Risk: ${analysisResult?.overallRisk ?? 'unknown'}
Fairness Score: ${analysisResult?.fairnessScore ?? 'N/A'}/100
Document Type: ${analysisResult?.documentType ?? 'Unknown'}

FLAGGED CLAUSES:
${clausesSummary || 'No clauses identified.'}

MISSING CLAUSES (GAPS):
${gapsSummary || 'No gaps identified.'}

Simulate the negotiation for every red and amber clause listed above. Return the JSON.`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 4096,
    temperature: 0.4,
    messages: [
      { role: 'system', content: NEGOTIATOR_SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error('Negotiator returned empty response');

  return parseJsonFromLlm<NegotiationResult>(raw);
}
