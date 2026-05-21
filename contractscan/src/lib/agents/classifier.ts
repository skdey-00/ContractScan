import Groq from 'groq-sdk';

export interface ClassifyResult {
  documentType: string;
  expectedClauses: string[];
  parties: string[];
  jurisdiction: string;
}

const CLASSIFIER_PROMPT = `You are a legal document classifier. Analyze the contract text and return ONLY valid JSON — no markdown, no code fences, no commentary.

JSON structure:
{
  "documentType": "string — specific contract type (e.g. 'Residential Lease Agreement', 'Freelance Service Contract', 'SaaS Terms of Service')",
  "expectedClauses": ["array of standard clause names expected for this contract type"],
  "parties": ["array of party names/roles found in the document"],
  "jurisdiction": "string — governing law or jurisdiction if mentioned, otherwise 'Not specified'"
}

Rules:
- Be thorough with expectedClauses — list 10-20 standard clauses for this document type
- Identify actual party names from the text
- Return ONLY the JSON object.`;

export async function classifyDocument(
  groq: Groq,
  contractText: string,
): Promise<ClassifyResult> {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 1024,
    temperature: 0.1,
    messages: [
      { role: 'system', content: CLASSIFIER_PROMPT },
      { role: 'user', content: contractText },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error('Classifier returned empty response');

  return parseJsonFromLlm<ClassifyResult>(raw);
}

/** Strip markdown fences and parse JSON */
export function parseJsonFromLlm<T>(raw: string): T {
  let jsonStr = raw.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr
      .replace(/^```(?:json)?\s*\n?/, '')
      .replace(/\n?```\s*$/, '');
  }
  return JSON.parse(jsonStr) as T;
}
