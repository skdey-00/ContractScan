'use client';

import React, { useState } from 'react';

interface RiskCardProps {
  title: string;
  summary: string;
  riskLevel: 'green' | 'amber' | 'red';
  recommendation: string;
  suggestedRewrite?: string;
  details?: string;
}

const borderColorMap = {
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444',
};

const badgeStyles = {
  green: 'bg-green-900/40 text-green-400',
  amber: 'bg-amber-900/40 text-amber-400',
  red: 'bg-red-900/40 text-red-400',
};

const badgeLabels = {
  green: 'Low Risk',
  amber: 'Caution',
  red: 'High Risk',
};

export default function RiskCard({ title, summary, riskLevel, recommendation, suggestedRewrite, details }: RiskCardProps) {
  const [rewriteExpanded, setRewriteExpanded] = useState(riskLevel === 'red');

  const isFlagged = riskLevel === 'red' || riskLevel === 'amber';
  const isRed = riskLevel === 'red';

  return (
    <div
      className="bg-zinc-900/50 rounded-lg shadow-lg shadow-black/20 border border-zinc-800 overflow-hidden"
      style={{ borderLeftWidth: 4, borderLeftColor: borderColorMap[riskLevel] }}
    >
      <div className="p-4">
        {/* Header: badge + title */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeStyles[riskLevel]}`}>
            {badgeLabels[riskLevel]}
          </span>
          <h3 className="font-bold text-white text-sm">{title}</h3>
        </div>

        {/* GREEN CLAUSE: compact view */}
        {riskLevel === 'green' && (
          <div>
            <p className="text-sm text-zinc-400 leading-relaxed">{summary}</p>
          </div>
        )}

        {/* RED / AMBER CLAUSE: full breakdown */}
        {isFlagged && (
          <div className="space-y-3">

            {/* Section 1: What the contract says (original text) */}
            {details && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                  What the contract says
                </p>
                <div className="bg-zinc-950/60 border border-zinc-800 rounded-md px-3 py-2.5">
                  <p className="text-sm text-zinc-300 leading-relaxed italic font-mono">
                    {details.replace(/^Original text:\s*/i, '')}
                  </p>
                </div>
              </div>
            )}

            {/* Section 2: Why it's risky */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: isRed ? '#f87171' : '#fbbf24' }}
              >
                Why this is {isRed ? 'risky' : 'a concern'}
              </p>
              <p className="text-sm text-zinc-200 leading-relaxed">{summary}</p>
            </div>

            {/* Section 3: What to do */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 mb-1.5">
                What you should do
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed">{recommendation}</p>
            </div>

            {/* Section 4: Suggested rewrite (expanded by default for red) */}
            {suggestedRewrite && (
              <div>
                <button
                  onClick={() => setRewriteExpanded(!rewriteExpanded)}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 focus:outline-none inline-flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {rewriteExpanded ? 'Hide fair alternative' : 'Show fair alternative'}
                </button>
                {rewriteExpanded && (
                  <div className="mt-2 p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-md">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 mb-1.5">
                      Fair alternative wording
                    </p>
                    <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line">
                      {suggestedRewrite}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
