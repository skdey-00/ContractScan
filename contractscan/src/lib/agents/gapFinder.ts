import Groq from 'groq-sdk';

export interface GapItem {
  clause: string;
  importance: 'high' | 'medium' | 'low';
  suggestion: string;
}

export interface GapResult {
  gapAnalysis: GapItem[];
}

const GAP_FINDER_PROMPT = `You are a legal gap-analysis specialist. You will receive two lists of clause names and a document type. Your job is to identify which standard clauses are MISSING from the found list.

Return ONLY valid JSON — no markdown, no code fences, no commentary.

JSON structure:
{
  "gapAnalysis": [
    {
      "clause": "string — name of the missing standard clause",
      "importance": "high" | "medium" | "low",
      "suggestion": "string — what the user should ask to add, in plain English"
    }
  ]
}

Rules:
- Only include clauses that are genuinely missing or so thin they are effectively absent.
- Rate importance based on how critical the clause is for this document type.
- "high" importance: clauses that protect fundamental rights (dispute resolution, termination, liability cap, force majeure, IP ownership, confidentiality for NDAs, etc.)
- "medium" importance: clauses that are standard but less critical (notices, amendments, severability, entire agreement, etc.)
- "low" importance: nice-to-have clauses (counterparts, headings, waiver, etc.)
- If no clauses are missing, return an empty array: { "gapAnalysis": [] }
- Return ONLY the JSON object.`;

export async function findGaps(
  groq: Groq,
  expectedClauses: string[],
  foundClauseTitles: string[],
  documentType: string,
): Promise<GapResult> {
  const userContent = `Document type: ${documentType}

Expected standard clauses for this type:
${expectedClauses.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Clauses actually found in the document:
${foundClauseTitles.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Compare the two lists and identify which expected clauses are MISSING or effectively absent.`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 2048,
    temperature: 0.2,
    messages: [
      { role: 'system', content: GAP_FINDER_PROMPT },
      { role: 'user', content: userContent },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error('Gap finder returned empty response');

  let jsonStr = raw.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr
      .replace(/^```(?:json)?\s*\n?/, '')
      .replace(/\n?```\s*$/, '');
  }

  const parsed = JSON.parse(jsonStr) as GapResult;

  // Normalise
  parsed.gapAnalysis = (parsed.gapAnalysis ?? []).map((g: any) => ({
    clause: String(g.clause ?? 'Unknown'),
    importance: normalizeImportance(g.importance),
    suggestion: String(g.suggestion ?? ''),
  }));

  return parsed;
}

function normalizeImportance(v: any): 'high' | 'medium' | 'low' {
  const s = String(v ?? '').toLowerCase();
  if (s === 'high' || s === 'critical') return 'high';
  if (s === 'medium' || s === 'moderate') return 'medium';
  return 'low';
}
