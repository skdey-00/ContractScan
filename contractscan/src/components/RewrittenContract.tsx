'use client';

import React, { useState } from 'react';

interface ClauseRewrite {
  originalClause: string;
  riskLevel: string;
  originalText: string;
  rewrittenText: string;
  keyChanges: string[];
}

interface RewriteResult {
  rewrites: ClauseRewrite[];
  summary: string;
  newFairnessScore: number;
}

interface RewrittenContractProps {
  contractText: string;
  clauses: any[];
}

/* ── Animated rewrite scene ──────────────────────────── */
function RewriteLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-4">
      <div className="flex items-center gap-4">
        {/* Before */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-red-900/60 flex items-center justify-center text-red-300 text-sm font-bold animate-pulse">
            Old
          </div>
          <span className="text-[10px] text-zinc-500">Unfair</span>
        </div>
        {/* Arrow animation */}
        <div className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '120ms' }} />
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '240ms' }} />
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-300 animate-bounce" style={{ animationDelay: '360ms' }} />
        </div>
        {/* After */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-emerald-900/60 flex items-center justify-center text-emerald-300 text-sm font-bold animate-pulse">
            New
          </div>
          <span className="text-[10px] text-zinc-500">Fair</span>
        </div>
      </div>
      <p className="text-sm text-zinc-400 animate-pulse">Rewriting unfair clauses...</p>
    </div>
  );
}

/* ── Single clause rewrite card ──────────────────────── */
function RewriteCard({ rewrite, index }: { rewrite: ClauseRewrite; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);

  const riskBadge =
    rewrite.riskLevel === 'red'
      ? 'bg-red-900/40 text-red-400'
      : 'bg-amber-900/40 text-amber-400';

  const riskLabel = rewrite.riskLevel === 'red' ? 'High Risk' : 'Caution';

  return (
    <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-zinc-800/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-600">#{index + 1}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${riskBadge}`}>
            {riskLabel}
          </span>
          <span className="text-sm font-semibold text-white">{rewrite.originalClause}</span>
        </div>
        <svg
          className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Side-by-side: original vs rewritten */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Original (red/amber toned) */}
            <div className={`border rounded-lg p-3 ${
              rewrite.riskLevel === 'red'
                ? 'bg-red-950/20 border-red-900/30'
                : 'bg-amber-950/20 border-amber-900/30'
            }`}>
              <p className={`text-[10px] uppercase tracking-wider font-semibold mb-1.5 ${
                rewrite.riskLevel === 'red' ? 'text-red-400' : 'text-amber-400'
              }`}>
                Original Clause
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed">{rewrite.originalText}</p>
            </div>
            {/* Rewritten (green toned) */}
            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-400 mb-1.5">
                Fair Rewrite
              </p>
              <p className="text-sm text-zinc-200 leading-relaxed">{rewrite.rewrittenText}</p>
            </div>
          </div>

          {/* Key changes */}
          {rewrite.keyChanges.length > 0 && (
            <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-blue-400 mb-2">
                Key Changes
              </p>
              <ul className="space-y-1.5">
                {rewrite.keyChanges.map((change, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <svg
                      className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-zinc-300 leading-relaxed">{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Score comparison card ───────────────────────────── */
function ScoreCard({ originalScore, newScore }: { originalScore: number; newScore: number }) {
  const diff = newScore - originalScore;
  const isPositive = diff > 0;

  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
      <p className="text-[10px] uppercase tracking-wider font-semibold text-blue-400 mb-3">
        Fairness Score Improvement
      </p>
      <div className="flex items-center justify-center gap-6">
        {/* Old score */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-2 border-red-500/50 flex items-center justify-center">
            <span className="text-xl font-bold text-red-400">{originalScore}</span>
          </div>
          <span className="text-[10px] text-zinc-500 mt-1.5">Before</span>
        </div>
        {/* Arrow */}
        <div className="flex flex-col items-center">
          <svg
            className="w-6 h-6 text-zinc-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <span
            className={`text-xs font-bold mt-1 ${
              isPositive ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {isPositive ? '+' : ''}
            {diff}
          </span>
        </div>
        {/* New score */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-2 border-emerald-500/50 flex items-center justify-center">
            <span className="text-xl font-bold text-emerald-400">{newScore}</span>
          </div>
          <span className="text-[10px] text-zinc-500 mt-1.5">After</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────── */
export default function RewrittenContract({ contractText, clauses }: RewrittenContractProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState<RewriteResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Estimate an original fairness score from the clauses
  const originalScore = (() => {
    if (!clauses || clauses.length === 0) return 75;
    const redCount = clauses.filter((c: any) => c.riskLevel === 'red').length;
    const amberCount = clauses.filter((c: any) => c.riskLevel === 'amber').length;
    const greenCount = clauses.filter((c: any) => c.riskLevel === 'green').length;
    const total = redCount + amberCount + greenCount || 1;
    const score = Math.round(
      ((greenCount * 100 + amberCount * 60 + redCount * 25) / total),
    );
    return Math.min(75, Math.max(10, score));
  })();

  const handleRewrite = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractText, clauses }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `Request failed with status ${res.status}`);
      }

      const data: RewriteResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Contract rewrite failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyRewritten = () => {
    if (!result) return;

    // Build a text summary of all rewrites
    const text = result.rewrites
      .map(
        (r, i) =>
          `--- ${r.originalClause} (${r.riskLevel.toUpperCase()}) ---\n` +
          `Original: ${r.originalText}\n` +
          `Rewrite: ${r.rewrittenText}\n` +
          `Changes: ${r.keyChanges.join('; ')}`,
      )
      .join('\n\n');

    const fullText =
      `CONTRACT REWRITE SUMMARY\n` +
      `${result.summary}\n\n` +
      `Estimated new fairness score: ${result.newFairnessScore}/100\n\n` +
      `--- CLAUSE REWRITES ---\n\n` +
      text;

    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-6">
      {/* Collapsible header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-3.5 shadow-sm transition-colors hover:bg-zinc-800"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-zinc-200">Rewrite Unfair Clauses</span>
        </div>
        <svg
          className={`w-5 h-5 text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expandable panel */}
      {isOpen && (
        <div className="mt-2 rounded-xl border border-zinc-800 bg-zinc-900/50 shadow-sm overflow-hidden">
          {/* Trigger button or loading */}
          {!result && !isLoading && !error && (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <p className="text-sm text-zinc-400 mb-4 text-center">
                Get fair, balanced rewrites for every flagged clause. See what changed and why.
              </p>
              <button
                onClick={handleRewrite}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Rewrite Unfair Clauses
              </button>
            </div>
          )}

          {/* Loading state */}
          {isLoading && <RewriteLoader />}

          {/* Error state */}
          {error && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={handleRewrite}
                className="mt-3 text-xs font-semibold text-blue-400 hover:text-blue-300"
              >
                Try again
              </button>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="p-4 space-y-4">
              {/* No rewrites needed */}
              {result.rewrites.length === 0 ? (
                <div className="bg-green-950/20 border border-green-900/30 rounded-lg p-4 text-center">
                  <p className="text-sm text-green-400">
                    No unfair clauses found — the contract is already balanced!
                  </p>
                </div>
              ) : (
                <>
                  {/* Summary */}
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-400 mb-2">
                      Rewrite Summary
                    </p>
                    <p className="text-sm text-zinc-200 leading-relaxed">{result.summary}</p>
                  </div>

                  {/* Score comparison */}
                  <ScoreCard
                    originalScore={originalScore}
                    newScore={result.newFairnessScore}
                  />

                  {/* Rewritten clauses */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-zinc-400">
                      Rewritten Clauses ({result.rewrites.length})
                    </p>
                    {result.rewrites.map((rewrite, i) => (
                      <RewriteCard key={i} rewrite={rewrite} index={i} />
                    ))}
                  </div>

                  {/* Copy button */}
                  <div className="flex justify-center pt-1">
                    <button
                      onClick={handleCopyRewritten}
                      className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/60 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
                    >
                      {copied ? (
                        <>
                          <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-green-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy Rewritten Contract
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}

              {/* Re-run button */}
              <div className="flex justify-center pt-1">
                <button
                  onClick={() => {
                    setResult(null);
                    setError(null);
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Re-run rewrite
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
