import Groq from 'groq-sdk';
import type { ClassifyResult } from './classifier';

export interface Clause {
  title: string;
  summary: string;
  riskLevel: 'green' | 'amber' | 'red';
  recommendation: string;
  suggestedRewrite?: string;
  details?: string;
}

export interface ExtractResult {
  clauses: Clause[];
  overallRisk: 'low' | 'medium' | 'high';
  fairnessScore: number;
}

const EXTRACTOR_PROMPT = `You are ContractScan AI — an expert legal analysis agent. You extract and assess every clause in a contract for a non-lawyer user. Return ONLY valid JSON — no markdown, no code fences, no commentary.

The document has been pre-classified. Use the classification context to inform your analysis.

## YOUR TASK

Go through the document clause by clause. For EACH clause:

- **title**: Short clause name
- **summary**: WHY this clause is risky or fine. Be specific with numbers. Explain in plain English for a 16-year-old.
- **riskLevel**: "green" (standard/balanced), "amber" (unusual/one-sided, worth flagging), "red" (risky/heavily one-sided/potentially harmful)
- **recommendation**: What the user should DO. Be specific and actionable.
- **suggestedRewrite** (required for red/amber): Fair alternative contract language the user could propose. For green clauses, omit this field.
- **details** (required for ALL clauses): The exact original text from the contract, wrapped in quotes. This is what the contract actually says about this topic.

## RISK GUIDELINES

RED if: one party has significantly more power, no limits on liability/costs, one-sided termination, auto-renewal without opt-out, disproportionate penalties, hidden/buried clauses, overly broad non-compete/exclusivity.

AMBER if: unusual for this contract type, vague/open terms, atypical durations, mildly one-sided, jurisdiction favouring one party.

GREEN if: standard for this type, balanced, clear and specific.

## OVERALL RISK & FAIRNESS SCORE

After analysing all clauses, assign:

**overallRisk**: "low" | "medium" | "high"
- "low": standard, balanced contract. Can sign with confidence.
- "medium": some concerning clauses. Review carefully, negotiate.
- "high": significant risks. Do NOT sign without negotiation/legal advice.

**fairnessScore** (integer 0-100):
- 90-100: Exceptionally fair, both parties well-protected.
- 70-89: Mostly fair, minor concerns.
- 50-69: Noticeably one-sided.
- 30-49: Significantly unfair, multiple red flags.
- 0-29: Dangerous, heavily one-sided or predatory.

Scoring heuristics: start at 75. Subtract 8-15 per RED clause, 3-8 per AMBER. Add 2-5 for above-average GREEN. Subtract 3-10 per high-importance missing clause, 5-15 if termination heavily one-sided, 5-10 if no dispute resolution.

## OUTPUT FORMAT

{
  "clauses": [
    {
      "title": "string",
      "summary": "string",
      "riskLevel": "green" | "amber" | "red",
      "recommendation": "string",
      "suggestedRewrite": "string",
      "details": "string (the exact quoted text from the contract)"
    }
  ],
  "overallRisk": "low" | "medium" | "high",
  "fairnessScore": number (0-100)
}

## RULES
1. Extract ALL clauses (8-20 typical). Not just risky ones.
2. No legal jargon without explanation.
3. Be specific with numbers and conditions.
4. suggestedRewrite must contain actual contract language for red/amber.
5. Return ONLY the JSON object.`;

export async function extractClauses(
  groq: Groq,
  contractText: string,
  classifierOutput: ClassifyResult,
): Promise<ExtractResult> {
  const contextBlock = `DOCUMENT CLASSIFICATION:
- Type: ${classifierOutput.documentType}
- Expected clauses: ${classifierOutput.expectedClauses.join(', ')}
- Parties: ${classifierOutput.parties.join(', ')}
- Jurisdiction: ${classifierOutput.jurisdiction}`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 8192,
    temperature: 0.2,
    messages: [
      { role: 'system', content: EXTRACTOR_PROMPT },
      {
        role: 'user',
        content: `${contextBlock}\n\n---\n\nCONTRACT TEXT:\n\n${contractText}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error('Extractor returned empty response');

  let jsonStr = raw.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr
      .replace(/^```(?:json)?\s*\n?/, '')
      .replace(/\n?```\s*$/, '');
  }

  const parsed = JSON.parse(jsonStr) as ExtractResult;

  // Normalise risk levels
  parsed.clauses = (parsed.clauses ?? []).map((c: any) => ({
    title: String(c.title ?? 'Untitled Clause'),
    summary: String(c.summary ?? ''),
    riskLevel: normalizeRisk(c.riskLevel),
    recommendation: String(c.recommendation ?? ''),
    suggestedRewrite: c.suggestedRewrite ? String(c.suggestedRewrite) : undefined,
    details: c.details ? String(c.details) : undefined,
  }));

  parsed.overallRisk = normalizeOverallRisk(parsed.overallRisk);
  parsed.fairnessScore = clampScore(parsed.fairnessScore);

  return parsed;
}

function normalizeRisk(v: any): 'green' | 'amber' | 'red' {
  const s = String(v ?? '').toLowerCase();
  if (s === 'red' || s === 'high') return 'red';
  if (s === 'amber' || s === 'yellow' || s === 'medium' || s === 'caution') return 'amber';
  return 'green';
}

function normalizeOverallRisk(v: any): 'low' | 'medium' | 'high' {
  const s = String(v ?? '').toLowerCase();
  if (s === 'high') return 'high';
  if (s === 'medium' || s === 'moderate') return 'medium';
  return 'low';
}

function clampScore(v: any): number {
  const n = Number(v);
  if (Number.isNaN(n)) return 50;
  return Math.max(0, Math.min(100, Math.round(n)));
}
