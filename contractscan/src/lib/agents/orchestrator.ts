import Groq from 'groq-sdk';
import { classifyDocument, parseJsonFromLlm } from './classifier';
import type { ClassifyResult } from './classifier';
import { extractClauses } from './extractor';
import type { Clause, ExtractResult } from './extractor';
import { findGaps } from './gapFinder';
import type { GapResult } from './gapFinder';
import { critiqueAnalysis } from './critic';
import type { CritiqueResult } from './critic';

/* ── Pipeline trace types ─────────────────────────────────────── */

interface AgentTrace {
  name: string;
  status: 'done' | 'error' | 'skipped';
  duration: number;
  output?: string;
  error?: string;
}

interface PipelineTrace {
  agents: AgentTrace[];
  totalDuration: number;
  critiqueTriggered: boolean;
  critiqueReason?: string;
}

export interface PipelineResult {
  documentType: string;
  overallRisk: 'low' | 'medium' | 'high';
  fairnessScore: number;
  clauses: Clause[];
  gapAnalysis: { clause: string; importance: 'high' | 'medium' | 'low'; suggestion: string }[];
  _pipeline: PipelineTrace;
}

/* ── Main orchestrator ────────────────────────────────────────── */

export async function runPipeline(contractText: string): Promise<PipelineResult> {
  const pipelineStart = Date.now();
  const groq = new Groq(); // auto-reads GROQ_API_KEY from env

  const agents: AgentTrace[] = [];
  let classifierOutput: ClassifyResult | null = null;
  let extractResult: ExtractResult | null = null;
  let gapResult: GapResult | null = null;
  let critiqueResult: CritiqueResult | null = null;
  let critiqueTriggered = false;
  let critiqueReason: string | undefined;

  /* ── Agent 1: Classifier ─────────────────────────────────────── */
  try {
    const start = Date.now();
    classifierOutput = await classifyDocument(groq, contractText);
    agents.push({
      name: 'Document Classifier',
      status: 'done',
      duration: Date.now() - start,
      output: `Identified as "${classifierOutput.documentType}" with ${classifierOutput.expectedClauses.length} expected clauses`,
    });
  } catch (err: any) {
    agents.push({
      name: 'Document Classifier',
      status: 'error',
      duration: 0,
      error: err?.message ?? String(err),
    });
    console.error('[orchestrator] Classifier failed:', err);
  }

  /* ── Agent 2: Extractor ──────────────────────────────────────── */
  try {
    const start = Date.now();
    if (!classifierOutput) {
      // Fallback classification so extractor can still run
      classifierOutput = {
        documentType: 'Unknown Contract',
        expectedClauses: [
          'Termination', 'Confidentiality', 'Liability', 'Payment Terms',
          'Dispute Resolution', 'Intellectual Property', 'Force Majeure',
          'Governing Law', 'Indemnification', 'Warranties',
        ],
        parties: [],
        jurisdiction: 'Not specified',
      };
    }
    extractResult = await extractClauses(groq, contractText, classifierOutput);
    agents.push({
      name: 'Clause Analyzer',
      status: 'done',
      duration: Date.now() - start,
      output: `Extracted ${extractResult.clauses.length} clauses (risk: ${extractResult.overallRisk}, fairness: ${extractResult.fairnessScore})`,
    });
  } catch (err: any) {
    agents.push({
      name: 'Clause Analyzer',
      status: 'error',
      duration: 0,
      error: err?.message ?? String(err),
    });
    console.error('[orchestrator] Extractor failed:', err);
  }

  /* ── Decide if critic should run ─────────────────────────────── */
  const clauses = extractResult?.clauses ?? [];
  const wordCount = contractText.trim().split(/\s+/).length;
  const allGreen = clauses.length > 0 && clauses.every((c) => c.riskLevel === 'green');
  const fewClauses = clauses.length < 5 && clauses.length > 0;
  const denseButSparse = wordCount > 2000 && clauses.length < 8;

  if (clauses.length > 0 && (fewClauses || allGreen || denseButSparse)) {
    critiqueTriggered = true;
    const reasons: string[] = [];
    if (fewClauses) reasons.push(`only ${clauses.length} clauses found`);
    if (allGreen) reasons.push('all clauses rated green (possible false negatives)');
    if (denseButSparse) reasons.push(`${wordCount} words but only ${clauses.length} clauses`);
    critiqueReason = reasons.join('; ');
  }

  /* ── Agent 4: Critic (conditional) ───────────────────────────── */
  if (critiqueTriggered && extractResult && classifierOutput) {
    try {
      const start = Date.now();
      critiqueResult = await critiqueAnalysis(
        groq,
        contractText,
        extractResult.clauses,
        classifierOutput.documentType,
      );
      agents.push({
        name: 'Self-Critique',
        status: 'done',
        duration: Date.now() - start,
        output: critiqueResult.needsReanalysis
          ? `Found ${critiqueResult.missedClauses.length} missed clauses: ${critiqueResult.critiqueNotes}`
          : `No issues found: ${critiqueResult.critiqueNotes}`,
      });

      // Merge missed clauses if critic found any
      if (critiqueResult.needsReanalysis && critiqueResult.missedClauses.length > 0) {
        extractResult.clauses.push(...critiqueResult.missedClauses);

        // Recalculate overallRisk and fairnessScore with new clauses
        extractResult.overallRisk = recalcOverallRisk(extractResult.clauses);
        extractResult.fairnessScore = recalcFairnessScore(
          extractResult.clauses,
          extractResult.fairnessScore,
        );
      }
    } catch (err: any) {
      agents.push({
        name: 'Self-Critique',
        status: 'error',
        duration: 0,
        error: err?.message ?? String(err),
      });
      console.error('[orchestrator] Critic failed:', err);
    }
  } else {
    agents.push({ name: 'Self-Critique', status: 'skipped', duration: 0 });
  }

  /* ── Agent 3: Gap Finder ─────────────────────────────────────── */
  try {
    const start = Date.now();
    const expectedClauses = classifierOutput?.expectedClauses ?? [];
    const foundTitles = (extractResult?.clauses ?? []).map((c) => c.title);
    const docType = classifierOutput?.documentType ?? 'Unknown Contract';

    if (expectedClauses.length > 0) {
      gapResult = await findGaps(groq, expectedClauses, foundTitles, docType);
      agents.push({
        name: 'Gap Finder',
        status: 'done',
        duration: Date.now() - start,
        output: `Found ${gapResult.gapAnalysis.length} gaps`,
      });
    } else {
      gapResult = { gapAnalysis: [] };
      agents.push({ name: 'Gap Finder', status: 'skipped', duration: 0 });
    }
  } catch (err: any) {
    agents.push({
      name: 'Gap Finder',
      status: 'error',
      duration: 0,
      error: err?.message ?? String(err),
    });
    console.error('[orchestrator] Gap finder failed:', err);
  }

  /* ── Assemble final result ───────────────────────────────────── */
  const totalDuration = Date.now() - pipelineStart;

  return {
    documentType: classifierOutput?.documentType ?? 'Unknown Contract',
    overallRisk: extractResult?.overallRisk ?? 'medium',
    fairnessScore: extractResult?.fairnessScore ?? 50,
    clauses: extractResult?.clauses ?? [],
    gapAnalysis: gapResult?.gapAnalysis ?? [],
    _pipeline: {
      agents,
      totalDuration,
      critiqueTriggered,
      critiqueReason,
    },
  };
}

/* ── Helpers ───────────────────────────────────────────────────── */

function recalcOverallRisk(clauses: Clause[]): 'low' | 'medium' | 'high' {
  const reds = clauses.filter((c) => c.riskLevel === 'red').length;
  const ambers = clauses.filter((c) => c.riskLevel === 'amber').length;
  if (reds >= 2 || (reds >= 1 && ambers >= 2)) return 'high';
  if (reds >= 1 || ambers >= 3) return 'medium';
  return 'low';
}

function recalcFairnessScore(clauses: Clause[], currentScore: number): number {
  // Simple heuristic: subtract for new red/amber clauses that were added by critic
  const reds = clauses.filter((c) => c.riskLevel === 'red').length;
  const ambers = clauses.filter((c) => c.riskLevel === 'amber').length;
  let score = 75;
  score -= reds * 10;
  score -= ambers * 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Re-export parseJsonFromLlm for use by other agents if needed
export { parseJsonFromLlm };
