'use client';

import React, { useState, useCallback } from 'react';
import ScoreGauge from './ScoreGauge';

interface Clause {
  title: string;
  summary: string;
  riskLevel: 'green' | 'amber' | 'red';
  recommendation: string;
  suggestedRewrite?: string;
}

interface AnalysisResult {
  documentType?: string;
  clauses?: Clause[];
  gapAnalysis?: { clause: string; importance: string; suggestion: string }[];
  overallRisk?: 'low' | 'medium' | 'high';
  fairnessScore?: number;
}

function fuzzyMatch(a: string, b: string): boolean {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const na = normalize(a);
  const nb = normalize(b);
  return na === nb || na.includes(nb) || nb.includes(na);
}

function getRiskWeight(r: string): number {
  return r === 'red' ? 0 : r === 'amber' ? 1 : 2;
}

const riskColors: Record<string, string> = {
  red: 'bg-red-950/30 text-red-400',
  amber: 'bg-amber-950/30 text-amber-400',
  green: 'bg-green-950/30 text-green-400',
};

export default function ContractComparison() {
  const [expanded, setExpanded] = useState(false);
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [result1, setResult1] = useState<AnalysisResult | null>(null);
  const [result2, setResult2] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState<0 | 1 | 2>(0);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (text: string, slot: 1 | 2) => {
    if (text.trim().length < 100) {
      setError('Contract text must be at least 100 characters.');
      return;
    }
    setAnalyzing(slot);
    setError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      if (slot === 1) setResult1(data);
      else setResult2(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAnalyzing(0);
    }
  }, []);

  // Build comparison data
  const comparison = (() => {
    if (!result1?.clauses || !result2?.clauses) return null;

    const clauses1 = result1.clauses;
    const clauses2 = result2.clauses;

    // Match clauses by title
    const matched: Array<{
      c1: Clause | null;
      c2: Clause | null;
      status: 'same' | 'improved' | 'worsened' | 'new' | 'removed';
    }> = [];

    const used2 = new Set<number>();

    for (const c1 of clauses1) {
      let found = false;
      for (let j = 0; j < clauses2.length; j++) {
        if (!used2.has(j) && fuzzyMatch(c1.title, clauses2[j].title)) {
          const c2 = clauses2[j];
          const w1 = getRiskWeight(c1.riskLevel);
          const w2 = getRiskWeight(c2.riskLevel);
          matched.push({
            c1,
            c2,
            status: w2 > w1 ? 'improved' : w2 < w1 ? 'worsened' : 'same',
          });
          used2.add(j);
          found = true;
          break;
        }
      }
      if (!found) {
        matched.push({ c1, c2: null, status: 'removed' });
      }
    }
    for (let j = 0; j < clauses2.length; j++) {
      if (!used2.has(j)) {
        matched.push({ c1: null, c2: clauses2[j], status: 'new' });
      }
    }

    // Gaps comparison
    const gaps1 = result1.gapAnalysis || [];
    const gaps2 = result2.gapAnalysis || [];
    const gapsResolved = gaps1.filter(
      (g1) => !gaps2.some((g2) => fuzzyMatch(g1.clause, g2.clause))
    );
    const gapsNew = gaps2.filter(
      (g2) => !gaps1.some((g1) => fuzzyMatch(g1.clause, g2.clause))
    );
    const gapsStill = gaps2.filter((g2) =>
      gaps1.some((g1) => fuzzyMatch(g1.clause, g2.clause))
    );

    return { matched, gapsResolved, gapsNew, gapsStill };
  })();

  const scoreDiff = result1?.fairnessScore != null && result2?.fairnessScore != null
    ? result2.fairnessScore - result1.fairnessScore
    : null;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between rounded-xl bg-zinc-900/50 dark:bg-zinc-900/50 border border-zinc-800 dark:border-zinc-700 px-5 py-3 shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-sm font-semibold text-zinc-200 dark:text-zinc-300">Compare Two Versions</span>
        </div>
        <svg
          className={`w-4 h-4 text-zinc-500 dark:text-zinc-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-3 space-y-4">
          <p className="text-xs text-zinc-400 dark:text-zinc-400 px-1">
            Paste the original and revised contract below. Analyze each, then see what changed.
          </p>

          {/* Two text areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-300 dark:text-zinc-400">Original Contract</label>
              <textarea
                value={text1}
                onChange={(e) => setText1(e.target.value)}
                placeholder="Paste original contract text..."
                className="min-h-[120px] w-full resize-y rounded-lg border border-zinc-700 dark:border-zinc-600 bg-zinc-900/30 dark:bg-zinc-800 px-3 py-2 text-xs text-white dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={() => analyze(text1, 1)}
                disabled={analyzing !== 0 || text1.trim().length < 100}
                className="w-full rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                {analyzing === 1 ? 'Analyzing...' : result1 ? 'Re-analyze Original' : 'Analyze Original'}
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-300 dark:text-zinc-400">Revised Contract</label>
              <textarea
                value={text2}
                onChange={(e) => setText2(e.target.value)}
                placeholder="Paste revised contract text..."
                className="min-h-[120px] w-full resize-y rounded-lg border border-zinc-700 dark:border-zinc-600 bg-zinc-900/30 dark:bg-zinc-800 px-3 py-2 text-xs text-white dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={() => analyze(text2, 2)}
                disabled={analyzing !== 0 || text2.trim().length < 100}
                className="w-full rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                {analyzing === 2 ? 'Analyzing...' : result2 ? 'Re-analyze Revised' : 'Analyze Revised'}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-xs text-red-400">{error}</div>
          )}

          {/* Comparison Results */}
          {comparison && (
            <div className="space-y-4 pt-2">
              {/* Score Comparison */}
              <div className="rounded-xl border border-zinc-800 dark:border-zinc-700 bg-zinc-900/50 dark:bg-zinc-900/50 p-4 shadow-sm">
                <h4 className="text-xs font-semibold text-zinc-300 dark:text-zinc-400 uppercase tracking-wide mb-3">Score Comparison</h4>
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-1">Original</p>
                    {result1?.fairnessScore != null && <ScoreGauge score={result1.fairnessScore} />}
                  </div>
                  {scoreDiff != null && (
                    <div className="text-center">
                      <span className={`text-2xl font-bold ${scoreDiff > 0 ? 'text-green-500' : scoreDiff < 0 ? 'text-red-500' : 'text-zinc-500'}`}>
                        {scoreDiff > 0 ? '+' : ''}{scoreDiff}
                      </span>
                      <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">points</p>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-1">Revised</p>
                    {result2?.fairnessScore != null && <ScoreGauge score={result2.fairnessScore} />}
                  </div>
                </div>
              </div>

              {/* Clause Diff */}
              <div className="rounded-xl border border-zinc-800 dark:border-zinc-700 bg-zinc-900/50 dark:bg-zinc-900/50 p-4 shadow-sm">
                <h4 className="text-xs font-semibold text-zinc-300 dark:text-zinc-400 uppercase tracking-wide mb-3">Clause Changes</h4>
                <div className="space-y-2">
                  {comparison.matched.map((m, i) => {
                    const bgClass =
                      m.status === 'improved' ? 'bg-green-950/30 border-green-900/50' :
                      m.status === 'worsened' ? 'bg-red-950/30 border-red-900/50' :
                      m.status === 'new' ? 'bg-blue-950/30 border-blue-900/50' :
                      m.status === 'removed' ? 'bg-zinc-900/30 border-zinc-800' :
                      'bg-zinc-900/50 border-zinc-800';

                    const statusLabel =
                      m.status === 'improved' ? 'Improved' :
                      m.status === 'worsened' ? 'Worsened' :
                      m.status === 'new' ? 'NEW' :
                      m.status === 'removed' ? 'REMOVED' :
                      'Unchanged';

                    const statusBadge =
                      m.status === 'improved' ? 'bg-green-950/30 text-green-400' :
                      m.status === 'worsened' ? 'bg-red-950/30 text-red-400' :
                      m.status === 'new' ? 'bg-blue-950/30 text-blue-400' :
                      m.status === 'removed' ? 'bg-zinc-700 text-zinc-300' :
                      'bg-zinc-800 text-zinc-500';

                    const title = m.c2?.title || m.c1?.title || 'Unknown';

                    return (
                      <div key={i} className={`rounded-lg border px-3 py-2 flex items-center justify-between gap-2 ${bgClass}`}>
                        <span className="text-xs font-medium text-zinc-200 dark:text-zinc-200 truncate flex-1">
                          {m.status === 'removed' ? <s>{title}</s> : title}
                        </span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {m.c1 && (
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${riskColors[m.c1.riskLevel]}`}>
                              {m.c1.riskLevel}
                            </span>
                          )}
                          {m.c1 && m.c2 && (
                            <svg className="w-3 h-3 text-zinc-500 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                          {m.c2 && (
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${riskColors[m.c2.riskLevel]}`}>
                              {m.c2.riskLevel}
                            </span>
                          )}
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${statusBadge}`}>
                            {statusLabel}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Gaps Comparison */}
              {(comparison.gapsResolved.length > 0 || comparison.gapsNew.length > 0) && (
                <div className="rounded-xl border border-zinc-800 dark:border-zinc-700 bg-zinc-900/50 dark:bg-zinc-900/50 p-4 shadow-sm">
                  <h4 className="text-xs font-semibold text-zinc-300 dark:text-zinc-400 uppercase tracking-wide mb-3">Gap Changes</h4>
                  <div className="space-y-2">
                    {comparison.gapsResolved.map((g, i) => (
                      <div key={`res-${i}`} className="rounded-lg border border-green-900/50 bg-green-950/30 px-3 py-2 flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-950/30 text-green-400">Resolved</span>
                        <span className="text-xs text-zinc-200 dark:text-zinc-300">{g.clause}</span>
                      </div>
                    ))}
                    {comparison.gapsNew.map((g, i) => (
                      <div key={`new-${i}`} className="rounded-lg border border-amber-900/50 bg-amber-950/30 px-3 py-2 flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950/30 text-amber-400">New Gap</span>
                        <span className="text-xs text-zinc-200 dark:text-zinc-300">{g.clause}</span>
                      </div>
                    ))}
                    {comparison.gapsStill.map((g, i) => (
                      <div key={`still-${i}`} className="rounded-lg border border-zinc-800 dark:border-zinc-600 bg-zinc-900/30 dark:bg-zinc-800 px-3 py-2 flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-700 dark:bg-zinc-600 text-zinc-300 dark:text-zinc-300">Still Missing</span>
                        <span className="text-xs text-zinc-200 dark:text-zinc-300">{g.clause}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
