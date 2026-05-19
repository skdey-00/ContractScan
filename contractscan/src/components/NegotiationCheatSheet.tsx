'use client';

import React, { useState, useMemo } from 'react';

// ── Types (mirrors AnalysisResult from RiskReport) ──────────────────────────
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

// ── Action item derived from analysis ───────────────────────────────────────
interface ActionItem {
  action: string;
  priority: 'Critical' | 'Important' | 'Add This' | 'Consider Adding';
  original: string;
  suggestedRewrite?: string;
}

// ── Priority config ─────────────────────────────────────────────────────────
type Priority = ActionItem['priority'];

const PRIORITY_ORDER: Record<Priority, number> = {
  Critical: 0,
  Important: 1,
  'Add This': 2,
  'Consider Adding': 3,
};

const PRIORITY_BADGE_STYLES: Record<Priority, string> = {
  Critical: 'bg-red-950/30 text-red-400',
  Important: 'bg-amber-950/30 text-amber-400',
  'Add This': 'bg-blue-950/30 text-blue-400',
  'Consider Adding': 'bg-zinc-800 text-zinc-300',
};
const PRIORITY_BORDER_COLORS: Record<Priority, string> = {
  Critical: '#ef4444',
  Important: '#f59e0b',
  'Add This': '#3b82f6',
  'Consider Adding': '#9ca3af',
};

// ── Component ───────────────────────────────────────────────────────────────
export default function NegotiationCheatSheet({ result }: { result: any }) {
  const [expanded, setExpanded] = useState(true); // starts EXPANDED

  // Build prioritized action list
  const actionItems = useMemo(() => {
    if (!result || typeof result !== 'object') return [];

    const clauses: Clause[] = Array.isArray(result.clauses) ? result.clauses : [];
    const gaps: GapItem[] = Array.isArray(result.gapAnalysis) ? result.gapAnalysis : [];

    const items: ActionItem[] = [];

    // RED clauses → Critical
    clauses
      .filter((c) => c.riskLevel === 'red')
      .forEach((c) => {
        items.push({
          action: c.recommendation,
          priority: 'Critical',
          original: `${c.title} — ${c.summary}`,
          suggestedRewrite: c.suggestedRewrite,
        });
      });

    // AMBER clauses → Important
    clauses
      .filter((c) => c.riskLevel === 'amber')
      .forEach((c) => {
        items.push({
          action: c.recommendation,
          priority: 'Important',
          original: `${c.title} — ${c.summary}`,
          suggestedRewrite: c.suggestedRewrite,
        });
      });

    // HIGH importance gaps → Add This
    gaps
      .filter((g) => g.importance?.toLowerCase() === 'high')
      .forEach((g) => {
        items.push({
          action: g.suggestion,
          priority: 'Add This',
          original: `Missing: ${g.clause}`,
        });
      });

    // MEDIUM importance gaps → Consider Adding
    gaps
      .filter((g) => g.importance?.toLowerCase() === 'medium')
      .forEach((g) => {
        items.push({
          action: g.suggestion,
          priority: 'Consider Adding',
          original: `Missing: ${g.clause}`,
        });
      });

    // Sort by priority order (already grouped, but sort for safety)
    items.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

    return items;
  }, [result]);

  // ── Empty state ──────────────────────────────────────────────────────────
  if (actionItems.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-zinc-900/50 dark:bg-zinc-900/50 rounded-xl shadow-sm border border-zinc-800 dark:border-zinc-700 overflow-hidden">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-800 dark:hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-zinc-200 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h2 className="text-lg font-bold text-white dark:text-zinc-100">Negotiation Cheat Sheet</h2>
            </div>
            <span className="text-sm text-zinc-500 dark:text-zinc-500">No items to negotiate</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-zinc-900/50 dark:bg-zinc-900/50 rounded-xl shadow-sm border border-zinc-800 dark:border-zinc-700 overflow-hidden">
        {/* ── Collapsible header ─────────────────────────────────────────── */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-800 dark:hover:bg-zinc-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-zinc-200 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h2 className="text-lg font-bold text-white dark:text-zinc-100">Negotiation Cheat Sheet</h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-400 bg-zinc-800 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
              {actionItems.length} {actionItems.length === 1 ? 'item' : 'items'} to negotiate
            </span>
            {/* Chevron */}
            <svg
              className={`w-5 h-5 text-zinc-500 dark:text-zinc-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* ── Action items list ───────────────────────────────────────────── */}
        {expanded && (
          <div className="px-5 pb-5 space-y-3">
            {actionItems.map((item, index) => (
              <div
                key={index}
                className="rounded-lg bg-zinc-900/30 dark:bg-zinc-800 border border-zinc-800 dark:border-zinc-600 overflow-hidden"
                style={{ borderLeftWidth: 4, borderLeftColor: PRIORITY_BORDER_COLORS[item.priority] }}
              >
                <div className="p-4">
                  {/* Number + Badge + Action */}
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-900/50 dark:bg-zinc-600 border border-zinc-800 dark:border-zinc-500 flex items-center justify-center text-xs font-bold text-zinc-400 dark:text-zinc-300">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_BADGE_STYLES[item.priority]}`}
                        >
                          {item.priority}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-white dark:text-zinc-100 leading-snug">
                        {item.action}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 leading-relaxed">
                        {item.original}
                      </p>

                      {/* Suggested rewrite */}
                      {item.suggestedRewrite && (
                        <div className="mt-2 p-2.5 bg-green-950/30 dark:bg-emerald-900/20 border border-green-900/50 dark:border-emerald-800 rounded-lg">
                          <p className="text-xs font-semibold text-green-400 dark:text-green-400 mb-1">Suggested wording</p>
                          <p className="text-xs text-zinc-200 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                            {item.suggestedRewrite}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
