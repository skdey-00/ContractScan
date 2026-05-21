'use client';

import React, { useState } from 'react';

interface NegotiationRound {
  clause: string;
  riskLevel: string;
  theirArgument: string;
  yourCounter: string;
  middleGround: string;
}

interface NegotiationResult {
  strategy: string;
  rounds: NegotiationRound[];
  keyPhrases: string[];
  walkAway: boolean;
  walkAwayReason: string;
}

interface NegotiationSimProps {
  contractText: string;
  analysisResult: any;
}

/* ── Animated negotiation scene ──────────────────────────── */
function NegotiationLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-4">
      <div className="flex items-center gap-6">
        {/* Left party */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-red-900/60 flex items-center justify-center text-red-300 text-lg font-bold animate-pulse">
            O
          </div>
          <span className="text-[10px] text-zinc-500">Other Side</span>
        </div>
        {/* Table / exchange animation */}
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="inline-block w-3 h-3 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="inline-block w-3 h-3 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '300ms' }} />
          <span className="inline-block w-3 h-3 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '450ms' }} />
        </div>
        {/* Right party (user) */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-blue-900/60 flex items-center justify-center text-blue-300 text-lg font-bold animate-pulse">
            Y
          </div>
          <span className="text-[10px] text-zinc-500">You</span>
        </div>
      </div>
      <p className="text-sm text-zinc-400 animate-pulse">Simulating negotiation rounds...</p>
    </div>
  );
}

/* ── Single negotiation round (collapsible) ─────────────── */
function RoundCard({ round, index }: { round: NegotiationRound; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);

  const riskBadge =
    round.riskLevel === 'red'
      ? 'bg-red-900/40 text-red-400'
      : 'bg-amber-900/40 text-amber-400';

  const riskLabel = round.riskLevel === 'red' ? 'High Risk' : 'Caution';

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
          <span className="text-sm font-semibold text-white">{round.clause}</span>
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
          {/* Two-column: their argument vs your counter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Their argument */}
            <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-red-400 mb-1.5">
                Their Argument
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed">{round.theirArgument}</p>
            </div>
            {/* Your counter */}
            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-400 mb-1.5">
                Your Counter
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed">{round.yourCounter}</p>
            </div>
          </div>
          {/* Middle ground */}
          <div className="bg-amber-950/20 border border-amber-900/30 rounded-lg p-3">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-amber-400 mb-1.5">
              Middle Ground
            </p>
            <p className="text-sm text-zinc-300 leading-relaxed">{round.middleGround}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────── */
export default function NegotiationSim({ contractText, analysisResult }: NegotiationSimProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState<NegotiationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleSimulate = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractText, analysisResult }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `Request failed with status ${res.status}`);
      }

      const data: NegotiationResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Negotiation simulation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyPhrase = (phrase: string, idx: number) => {
    navigator.clipboard.writeText(phrase).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-zinc-200">Negotiation Simulator</span>
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
                Simulate a negotiation for every flagged clause. See what the other side would argue and how to counter.
              </p>
              <button
                onClick={handleSimulate}
                className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Simulate Negotiation
              </button>
            </div>
          )}

          {/* Loading state */}
          {isLoading && <NegotiationLoader />}

          {/* Error state */}
          {error && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={handleSimulate}
                className="mt-3 text-xs font-semibold text-blue-400 hover:text-blue-300"
              >
                Try again
              </button>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="p-4 space-y-4">
              {/* Strategy card */}
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-purple-400 mb-2">
                  Negotiation Strategy
                </p>
                <p className="text-sm text-zinc-200 leading-relaxed">{result.strategy}</p>
              </div>

              {/* Rounds */}
              {result.rounds.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-zinc-400">
                    Negotiation Rounds ({result.rounds.length})
                  </p>
                  {result.rounds.map((round, i) => (
                    <RoundCard key={i} round={round} index={i} />
                  ))}
                </div>
              ) : (
                <div className="bg-green-950/20 border border-green-900/30 rounded-lg p-4 text-center">
                  <p className="text-sm text-green-400">
                    No high-risk clauses found — nothing to negotiate!
                  </p>
                </div>
              )}

              {/* Key phrases */}
              {result.keyPhrases.length > 0 && (
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-blue-400 mb-3">
                    Key Phrases to Use
                  </p>
                  <div className="space-y-2">
                    {result.keyPhrases.map((phrase, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 group"
                      >
                        <span className="text-[10px] font-mono text-zinc-600 mt-0.5 shrink-0">{i + 1}.</span>
                        <p className="text-sm text-zinc-300 leading-relaxed flex-1">{phrase}</p>
                        <button
                          onClick={() => copyPhrase(phrase, i)}
                          className="shrink-0 text-zinc-600 hover:text-zinc-300 transition-colors mt-0.5"
                          title="Copy"
                        >
                          {copiedIdx === i ? (
                            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Walk-away verdict */}
              <div
                className={`rounded-lg border p-4 ${
                  result.walkAway
                    ? 'bg-red-950/20 border-red-900/30'
                    : 'bg-green-950/20 border-green-900/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      result.walkAway ? 'bg-red-500' : 'bg-green-500'
                    }`}
                  />
                  <p
                    className={`text-xs font-bold uppercase tracking-wider ${
                      result.walkAway ? 'text-red-400' : 'text-green-400'
                    }`}
                  >
                    {result.walkAway ? 'Consider Walking Away' : 'Safe to Negotiate'}
                  </p>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">{result.walkAwayReason}</p>
              </div>

              {/* Re-run button */}
              <div className="flex justify-center pt-1">
                <button
                  onClick={() => { setResult(null); setError(null); }}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Re-run simulation
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
