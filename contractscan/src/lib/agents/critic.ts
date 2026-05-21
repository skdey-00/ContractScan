import Groq from 'groq-sdk';
import type { Clause } from './extractor';

export interface CritiqueResult {
  needsReanalysis: boolean;
  missedClauses: Clause[];
  critiqueNotes: string;
}

const CRITIC_PROMPT = `You are a legal analysis quality reviewer. You will receive a contract text and a list of clauses that were already extracted. Your job is to check whether the extraction missed anything important.

Return ONLY valid JSON — no markdown, no code fences, no commentary.

JSON structure:
{
  "needsReanalysis": boolean,
  "missedClauses": [
    {
      "title": "string",
      "summary": "string — plain English explanation",
      "riskLevel": "green" | "amber" | "red",
      "recommendation": "string — what to do",
      "suggestedRewrite": "string — fair alternative wording"
    }
  ],
  "critiqueNotes": "string — brief summary of what was missed or why the extraction was good"
}

Rules:
- Set needsReanalysis to true ONLY if you find genuinely missed clauses that are risky (red/amber).
- Look for: buried clauses in dense text, hidden penalties, one-sided terms that were labelled green, important clauses that were skipped entirely.
- Do NOT duplicate clauses that were already found. Only add genuinely NEW ones.
- If the extraction looks thorough, set needsReanalysis to false and return an empty missedClauses array.
- Return ONLY the JSON object.`;

export async function critiqueAnalysis(
  groq: Groq,
  contractText: string,
  clauses: Clause[],
  documentType: string,
): Promise<CritiqueResult> {
  const clausesSummary = clauses
    .map(
      (c, i) =>
        `${i + 1}. [${c.riskLevel}] ${c.title}: ${c.summary.slice(0, 120)}...`,
    )
    .join('\n');

  const userContent = `Document type: ${documentType}

Previously extracted clauses (${clauses.length} total):
${clausesSummary}

Full contract text:
${contractText}`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 2048,
    temperature: 0.3,
    messages: [
      { role: 'system', content: CRITIC_PROMPT },
      { role: 'user', content: userContent },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error('Critic returned empty response');

  let jsonStr = raw.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr
      .replace(/^```(?:json)?\s*\n?/, '')
      .replace(/\n?```\s*$/, '');
  }

  const parsed = JSON.parse(jsonStr) as CritiqueResult;

  // Normalise
  parsed.needsReanalysis = Boolean(parsed.needsReanalysis);
  parsed.missedClauses = (parsed.missedClauses ?? []).map((c: any) => ({
    title: String(c.title ?? 'Untitled Clause'),
    summary: String(c.summary ?? ''),
    riskLevel: normalizeRisk(c.riskLevel),
    recommendation: String(c.recommendation ?? ''),
    suggestedRewrite: c.suggestedRewrite ? String(c.suggestedRewrite) : undefined,
    details: c.details ? String(c.details) : undefined,
  }));
  parsed.critiqueNotes = String(parsed.critiqueNotes ?? '');

  return parsed;
}

function normalizeRisk(v: any): 'green' | 'amber' | 'red' {
  const s = String(v ?? '').toLowerCase();
  if (s === 'red' || s === 'high') return 'red';
  if (s === 'amber' || s === 'yellow' || s === 'medium' || s === 'caution') return 'amber';
  return 'green';
}
