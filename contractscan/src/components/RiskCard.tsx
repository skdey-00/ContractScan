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
  const [expanded, setExpanded] = useState(false);
  const [rewriteExpanded, setRewriteExpanded] = useState(false);

  const isFlagged = riskLevel === 'red' || riskLevel === 'amber';

  return (
    <div
      className="bg-zinc-900/50 rounded-lg shadow-lg shadow-black/20 border border-zinc-800 overflow-hidden"
      style={{ borderLeftWidth: 4, borderLeftColor: borderColorMap[riskLevel] }}
    >
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeStyles[riskLevel]}`}>
            {badgeLabels[riskLevel]}
          </span>
          <h3 className="font-bold text-white text-sm">{title}</h3>
        </div>

        <p className="text-sm text-zinc-300 leading-relaxed">{summary}</p>

        <p className="mt-2 text-sm text-zinc-400 italic">{recommendation}</p>

        {suggestedRewrite && isFlagged && (
          <div className="mt-3">
            <button
              onClick={() => setRewriteExpanded(!rewriteExpanded)}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 focus:outline-none inline-flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {rewriteExpanded ? 'Hide suggested rewrite ▲' : 'Show suggested rewrite ▼'}
            </button>
            {rewriteExpanded && (
              <div className="mt-2 p-3 bg-blue-950/30 border border-blue-900/50 rounded text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                {suggestedRewrite}
              </div>
            )}
          </div>
        )}

        {details && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-xs text-blue-400 hover:text-zinc-200 focus:outline-none"
          >
            {expanded ? 'Hide details ▲' : 'Show details ▼'}
          </button>
        )}

        {details && expanded && (
          <div className="mt-2 p-3 bg-zinc-900/30 rounded text-sm text-zinc-300 leading-relaxed">
            {details}
          </div>
        )}
      </div>
    </div>
  );
}
