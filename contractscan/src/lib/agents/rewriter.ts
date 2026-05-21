import Groq from 'groq-sdk';
import { parseJsonFromLlm } from './classifier';

export interface ClauseRewrite {
  originalClause: string;
  riskLevel: string;
  originalText: string;
  rewrittenText: string;
  keyChanges: string[];
}

export interface RewriteResult {
  rewrites: ClauseRewrite[];
  summary: string;
  newFairnessScore: number;
}

const REWRITER_SYSTEM_PROMPT = `You are an expert contract rewriter. Your job is to take unfair or one-sided contract clauses and rewrite them into fair, balanced alternatives that protect BOTH parties equally.

Given a contract and a list of flagged clauses (red = high risk, amber = caution), you must:

1. For each flagged clause, produce a FAIR REWRITE that:
   - Balances the rights and obligations of both parties
   - Removes hidden traps, excessive liability, or one-sided terms
   - Maintains the legitimate business purpose of the clause
   - Uses clear, plain language where possible
2. Explain the KEY CHANGES made and why each change improves fairness.
3. Provide an overall SUMMARY of all rewrites.
4. Estimate a NEW FAIRNESS SCORE (0-100) the contract would receive after applying all rewrites.

Return ONLY valid JSON — no markdown, no code fences, no commentary outside the JSON.

JSON structure:
{
  "rewrites": [
    {
      "originalClause": "string — the title/subject of the flagged clause",
      "riskLevel": "string — red or amber",
      "originalText": "string — brief summary of what was wrong with the original clause",
      "rewrittenText": "string — the complete fair replacement clause text",
      "keyChanges": ["array of strings describing each change and why it was made"]
    }
  ],
  "summary": "string — 2-4 sentence overall summary of the rewrites and their impact",
  "newFairnessScore": number — estimated fairness score (0-100) after applying rewrites
}

Rules:
- Rewrite ONLY red and amber clauses — skip green ones.
- The rewritten clause must be a complete, standalone replacement paragraph that could be dropped into the contract.
- Be specific in keyChanges — explain WHAT changed and WHY.
- The newFairnessScore should be realistic. If the original was 35, a good rewrite might bring it to 65-80, not 100.
- Return ONLY the JSON object.`;

export async function rewriteContract(
  groq: Groq,
  contractText: string,
  clauses: any[],
): Promise<RewriteResult> {
  // Filter to only flagged clauses (red and amber)
  const flagged = clauses.filter(
    (c: any) => c.riskLevel === 'red' || c.riskLevel === 'amber',
  );

  if (flagged.length === 0) {
    return {
      rewrites: [],
      summary:
        'No unfair clauses were found. The contract appears to be balanced and fair.',
      newFairnessScore: 85,
    };
  }

  // Build a summary of the flagged clauses for the prompt
  const clausesSummary = flagged
    .map(
      (c: any, i: number) =>
        `${i + 1}. [${c.riskLevel.toUpperCase()}] ${c.title}: ${c.summary || c.explanation || 'Flagged as risky'}`,
    )
    .join('\n');

  // Build the original clause texts (if available)
  const clauseTexts = flagged
    .map(
      (c: any, i: number) =>
        `--- Clause ${i + 1}: ${c.title} (${c.riskLevel}) ---\n${c.originalText || c.text || c.excerpt || 'See contract text'}`,
    )
    .join('\n\n');

  const userMessage = `CONTRACT TEXT:
${contractText.slice(0, 6000)}

FLAGGED CLAUSES SUMMARY:
${clausesSummary}

ORIGINAL CLAUSE TEXTS:
${clauseTexts}

Rewrite each flagged clause above into a fair, balanced alternative. Return the JSON.`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 4096,
    temperature: 0.3,
    messages: [
      { role: 'system', content: REWRITER_SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error('Rewriter returned empty response');

  return parseJsonFromLlm<RewriteResult>(raw);
}
