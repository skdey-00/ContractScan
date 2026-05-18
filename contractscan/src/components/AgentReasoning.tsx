'use client';

import React, { useState } from 'react';

/* ── Types (mirrors AnalysisResult from RiskReport) ────────────── */
interface Clause {
  title: string;
  summary: string;
  riskLevel: 'green' | 'amber' | 'red';
  recommendation: string;
  suggestedRewrite?: string;
  details?: string;
}

interface GapItem {
  clause: string;
  importance: string;
  suggestion: string;
}

interface AnalysisResult {
  documentType?: string;
  clauses?: Clause[];
  gapAnalysis?: GapItem[];
  overallRisk?: 'low' | 'medium' | 'high';
  fairnessScore?: number;
  _rawOutput?: string;
}

/* ── Badge helpers ─────────────────────────────────────────────── */
const riskBadgeStyles: Record<string, string> = {
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
};

const riskBadgeLabels: Record<string, string> = {
  green: 'Low Risk',
  amber: 'Caution',
  red: 'High Risk',
};

const overallRiskBadge: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

const overallRiskLabel: Record<string, string> = {
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
};

const importanceBadge: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-green-100 text-green-700',
};

/* ── Chevron icon ──────────────────────────────────────────────── */
function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

/* ── Document icon (Step 1) ────────────────────────────────────── */
function DocumentIcon() {
  return (
    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  );
}

/* ── Stacked bar chart (Step 2) ────────────────────────────────── */
function StackedBar({ red, amber, green }: { red: number; amber: number; green: number }) {
  const total = red + amber + green;
  if (total === 0) return null;

  const pct = (n: number) => `${(n / total) * 100}%`;

  return (
    <div className="flex rounded-full overflow-hidden h-3 w-full max-w-md bg-gray-100 dark:bg-gray-700">
      {red > 0 && (
        <div className="bg-red-500 h-full transition-all duration-500" style={{ width: pct(red) }} title={`${red} High Risk`} />
      )}
      {amber > 0 && (
        <div className="bg-amber-400 h-full transition-all duration-500" style={{ width: pct(amber) }} title={`${amber} Caution`} />
      )}
      {green > 0 && (
        <div className="bg-green-500 h-full transition-all duration-500" style={{ width: pct(green) }} title={`${green} Low Risk`} />
      )}
    </div>
  );
}

/* ── Step number circle ────────────────────────────────────────── */
function StepCircle({ number }: { number: number }) {
  return (
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
      {number}
    </div>
  );
}

/* ── Clause row (expandable) ───────────────────────────────────── */
function ClauseRow({ clause }: { clause: Clause }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 py-1.5 text-left group"
      >
        <span
          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap ${riskBadgeStyles[clause.riskLevel]}`}
        >
          {riskBadgeLabels[clause.riskLevel]}
        </span>
        <span className="text-sm text-gray-800 dark:text-gray-200 group-hover:text-blue-600 transition-colors truncate">
          {clause.title}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 dark:text-gray-500 ml-auto flex-shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed pl-2 pb-2">
          {clause.summary}
        </p>
      )}
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────── */
export default function AgentReasoning({ result }: { result: any }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!result || typeof result !== 'object') return null;

  const data = result as AnalysisResult;
  const clauses = data.clauses ?? [];
  const gaps = data.gapAnalysis ?? [];
  const docType = data.documentType || 'Unknown';
  const risk = data.overallRisk || 'medium';

  // Count risk levels
  const redCount = clauses.filter((c) => c.riskLevel === 'red').length;
  const amberCount = clauses.filter((c) => c.riskLevel === 'amber').length;
  const greenCount = clauses.filter((c) => c.riskLevel === 'green').length;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 overflow-hidden">
      {/* ── Collapsible header ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          How the Agent Analyzed This
        </span>
        <ChevronDown open={isOpen} />
      </button>

      {/* ── Reasoning chain ── */}
      {isOpen && (
        <div className="px-5 pb-5 pt-1 space-y-0">
          {/* ──── Step 1: Document Classification ──── */}
          <div className="flex gap-4">
            {/* Left column: circle + connector */}
            <div className="flex flex-col items-center">
              <StepCircle number={1} />
              <div className="w-0.5 flex-1 bg-blue-400 my-1" />
            </div>

            {/* Right column: content card */}
            <div className="flex-1 pb-5">
              <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Document Classification
                </h4>
                <div className="flex items-center gap-2 mb-2">
                  <DocumentIcon />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{docType}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${overallRiskBadge[risk]}`}
                  >
                    {overallRiskLabel[risk]}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Identified as <strong>{docType}</strong> with{' '}
                  <strong>{overallRiskLabel[risk]}</strong> overall risk.
                </p>
              </div>
            </div>
          </div>

          {/* ──── Step 2: Clause Extraction & Risk Assessment ──── */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <StepCircle number={2} />
              <div className="w-0.5 flex-1 bg-blue-400 dark:bg-gray-600 my-1" />
            </div>

            <div className="flex-1 pb-5">
              <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Clause Extraction &amp; Risk Assessment
                </h4>

                {/* Summary text */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Extracted <strong>{clauses.length}</strong> clauses:{' '}
                  <span className="text-red-600 font-semibold">{redCount}</span> high risk,{' '}
                  <span className="text-amber-600 font-semibold">{amberCount}</span> caution,{' '}
                  <span className="text-green-600 font-semibold">{greenCount}</span> low risk.
                </p>

                {/* Stacked bar */}
                <StackedBar red={redCount} amber={amberCount} green={greenCount} />

                {/* Legend */}
                <div className="flex gap-4 mt-2 mb-3">
                  <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                    High Risk ({redCount})
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                    Caution ({amberCount})
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                    Low Risk ({greenCount})
                  </span>
                </div>

                {/* Clause list */}
                {clauses.length > 0 && (
                  <div className="divide-y divide-gray-100 dark:divide-gray-600">
                    {clauses.map((clause, i) => (
                      <ClauseRow key={i} clause={clause} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ──── Step 3: Gap Analysis ──── */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <StepCircle number={3} />
            </div>

            <div className="flex-1">
              <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Gap Analysis
                </h4>

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Identified <strong>{gaps.length}</strong> missing standard
                  {gaps.length === 1 ? ' clause' : ' clauses'}.
                </p>

                {gaps.length > 0 ? (
                  <ul className="space-y-2">
                    {gaps.map((gap, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span
                          className={`mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                            importanceBadge[gap.importance?.toLowerCase()] || 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {gap.importance || '—'}
                        </span>
                        <div>
                          <span className="text-gray-800 dark:text-gray-200 font-medium text-xs">
                            {gap.clause}
                          </span>
                          {gap.suggestion && (
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                              {gap.suggestion}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                    No missing clauses detected.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
