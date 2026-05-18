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
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
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
      className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
      style={{ borderLeftWidth: 4, borderLeftColor: borderColorMap[riskLevel] }}
    >
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeStyles[riskLevel]}`}>
            {badgeLabels[riskLevel]}
          </span>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">{title}</h3>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{summary}</p>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic">{recommendation}</p>

        {suggestedRewrite && isFlagged && (
          <div className="mt-3">
            <button
              onClick={() => setRewriteExpanded(!rewriteExpanded)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 focus:outline-none inline-flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {rewriteExpanded ? 'Hide suggested rewrite ▲' : 'Show suggested rewrite ▼'}
            </button>
            {rewriteExpanded && (
              <div className="mt-2 p-3 bg-blue-50 dark:bg-emerald-900/20 border border-blue-100 dark:border-emerald-800 rounded text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {suggestedRewrite}
              </div>
            )}
          </div>
        )}

        {details && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-xs text-blue-600 dark:text-blue-400 dark:hover:text-gray-200 hover:text-blue-800 focus:outline-none"
          >
            {expanded ? 'Hide details ▲' : 'Show details ▼'}
          </button>
        )}

        {details && expanded && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-slate-700 rounded text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {details}
          </div>
        )}
      </div>
    </div>
  );
}
