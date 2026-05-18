'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import AgentSteps from '@/components/AgentSteps';
import RiskReport from '@/components/RiskReport';
import { extractTextFromPDF } from '@/lib/pdfExtractor';

// ── Hero / Landing Section ────────────────────────────────────────
function Hero({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-white">
      {/* Decorative background shapes */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[40rem] w-[40rem] rounded-full bg-blue-300/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <div className="flex flex-col items-center text-center gap-8">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide backdrop-blur-sm border border-white/10">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            AI-Powered Contract Intelligence
          </span>

          {/* Headline */}
          <h2 className="max-w-3xl text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            Understand Any Contract{' '}
            <span className="bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
              in Seconds
            </span>
          </h2>

          {/* Subtitle */}
          <p className="max-w-2xl text-lg sm:text-xl text-blue-100 leading-relaxed">
            Upload a contract and get instant, plain-English risk analysis.
            No legal jargon. No hourly fees. Just clarity.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <button
              onClick={onGetStarted}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-blue-700 shadow-lg shadow-blue-900/30 transition-transform hover:scale-105 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
              Upload Your Contract
            </button>
            <button
              onClick={onGetStarted}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Try Demo
            </button>
          </div>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-blue-200">
            {[
              { icon: '🔒', label: 'Private & Secure' },
              { icon: '⚡', label: 'Instant Results' },
              { icon: '📊', label: 'Risk Scoring' },
              { icon: '🧠', label: 'Plain English' },
            ].map((f) => (
              <span
                key={f.label}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm border border-white/10"
              >
                <span>{f.icon}</span> {f.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave separator */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg
          className="relative block w-full h-12 sm:h-16"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
        >
          <path
            d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    </section>
  );
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [demoLoaded, setDemoLoaded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const scrollToMain = useCallback(() => {
    mainRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // ── Demo mode: pre-load contract from ?demo=true ──────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === 'true' && !demoLoaded) {
      fetch('/demo-contract.txt')
        .then((r) => r.text())
        .then((t) => {
          setText(t);
          setDemoLoaded(true);
        })
        .catch(() => {
          // Silently fail — user can still paste manually
        });
    }
  }, [demoLoaded]);

  const hasInput = !!(file || text.trim());

  // ── File handling ──────────────────────────────────────────────────
  const acceptFile = useCallback((f: File) => {
    if (f.type !== 'application/pdf') {
      setError('Only PDF files are accepted. Please upload a .pdf file.');
      return;
    }
    setFile(f);
    setText(''); // Clear textarea when PDF is uploaded
    setResult(null);
    setError(null);
  }, []);

  // ── Reset everything ────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setFile(null);
    setText('');
    setResult(null);
    setError(null);
  }, []);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) acceptFile(f);
    },
    [acceptFile],
  );

  // ── Drag‑and‑drop ─────────────────────────────────────────────────
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) acceptFile(f);
    },
    [acceptFile],
  );

  // ── Analyse ────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      let contractText = text.trim();

      // If a PDF was uploaded, extract its text
      if (file) {
        contractText = await extractTextFromPDF(file);
      }

      if (!contractText) {
        setError('No contract text to analyse. Please upload a PDF or paste text.');
        setIsLoading(false);
        return;
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: contractText }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `Request failed with status ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while analysing the contract.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="border-b border-gray-200 bg-white relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex items-center gap-3">
          {/* Logo / Icon */}
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg">
            CS
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">ContractScan AI</h1>
            <p className="text-sm text-gray-500">AI‑powered contract analysis for non‑lawyers</p>
          </div>
        </div>
      </header>

      {/* ── Hero / Landing Section ────────────────────────────────── */}
      <Hero onGetStarted={scrollToMain} />

      {/* ── Main content ───────────────────────────────────────────── */}
      <main ref={mainRef} className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── LEFT: Input panel ──────────────────────────────────── */}
          <section className="flex flex-col gap-6">
            {/* Drop zone */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed
                px-6 py-10 cursor-pointer transition-colors
                ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : file
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Icon */}
              <svg
                className="mb-3 h-10 w-10 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                />
              </svg>

              {file ? (
                <>
                  <p className="text-sm font-medium text-green-700">{file.name}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB &middot; Click or drop to replace
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-700">Drop PDF here or click to upload</p>
                  <p className="mt-1 text-xs text-gray-500">PDF files only</p>
                </>
              )}
            </div>

            {/* Textarea */}
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (e.target.value.trim() && file) {
                  setFile(null); // Clear file when user starts typing
                }
                setResult(null);
                setError(null);
              }}
              placeholder="Or paste contract text here..."
              className="min-h-[200px] w-full resize-y rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            {/* Analyse button */}
            <div className="flex gap-3">
              <button
                onClick={handleAnalyze}
                disabled={!hasInput || isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Analysing...
                  </>
                ) : (
                  'Analyse Contract'
                )}
              </button>
              {!text && !file && (
                <button
                  onClick={() => {
                    fetch('/demo-contract.txt')
                      .then((r) => r.text())
                      .then((t) => setText(t))
                      .catch(() => {});
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  Load Demo Contract
                </button>
              )}
            </div>

            {/* Agent steps (progress indicator) */}
            <AgentSteps isLoading={isLoading} />
          </section>

          {/* ── RIGHT: Output / results panel ──────────────────────── */}
          <section className="flex flex-col">
            {/* Error */}
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <span className="font-medium">Error:</span> {error}
              </div>
            )}

            {/* Loading spinner */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
                <svg
                  className="h-12 w-12 animate-spin text-blue-600"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <p className="text-sm font-medium text-gray-600">Analysing your contract…</p>
              </div>
            )}

            {/* Results */}
            {!isLoading && result && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-700">Analysis Complete</h2>
                  <button
                    onClick={handleReset}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    New Analysis
                  </button>
                </div>
                <RiskReport result={result} />
              </div>
            )}

            {/* Empty / placeholder state */}
            {!isLoading && !result && !error && (
              <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-24 text-center">
                <svg
                  className="h-16 w-16 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-sm text-gray-500">
                  Upload a contract or paste text to get started
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        ContractScan AI &mdash; for educational purposes only. Not legal advice.
      </footer>
    </div>
  );
}
