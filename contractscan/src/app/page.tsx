'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import AgentSteps from '@/components/AgentSteps';
import RiskReport from '@/components/RiskReport';
import NegotiationCheatSheet from '@/components/NegotiationCheatSheet';
import AgentReasoning from '@/components/AgentReasoning';
import ChatPanel from '@/components/ChatPanel';
import ThemeToggle from '@/components/ThemeToggle';
import ContractComparison from '@/components/ContractComparison';
import ShareableReport, { decodeShareableData } from '@/components/ShareableReport';
import { extractTextFromPDF } from '@/lib/pdfExtractor';

// ── Back to Top ──────────────────────────────────────────────
function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!visible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-zinc-300 shadow-lg transition-all hover:bg-zinc-700 hover:text-white"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}

// ── Logo ─────────────────────────────────────────────────────
function Logo({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="28" rx="6" fill="#3b82f6" />
      <path d="M8 9h12M8 14h10M8 19h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 17l2 2-2 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Hero ─────────────────────────────────────────────────────
function Hero({ onGetStarted, onTryDemo }: { onGetStarted: () => void; onTryDemo: () => void }) {
  return (
    <section className="relative overflow-hidden">
      {/* Background effects */}
      <div className="dot-grid absolute inset-0" />
      <div className="radial-glow absolute inset-0 pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-6 pt-28 pb-20 text-center">
        {/* Badge */}
        <div className="animate-fade-in-up mb-8 inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 px-4 py-1.5 text-xs font-medium text-zinc-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
          </span>
          AI-Powered Contract Intelligence
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in-up delay-75 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
          Don&apos;t Sign
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
            Blind.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-in-up delay-150 mx-auto mt-6 max-w-xl text-lg text-zinc-400 leading-relaxed">
          AI agents that read, analyze, and flag risks in any contract.
          Get a fairness score, clause-by-clause breakdown, and negotiation-ready rewrites.
        </p>

        {/* CTAs */}
        <div className="animate-fade-in-up delay-200 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="group relative inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3" />
            </svg>
            Analyze a Contract
          </button>
          <button
            onClick={onTryDemo}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-8 py-3.5 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
          >
            Try Demo
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

// ── Feature Card ─────────────────────────────────────────────
function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10 text-blue-400 group-hover:bg-blue-600/20">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{desc}</p>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────
export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [demoLoaded, setDemoLoaded] = useState(false);
  const [isDemoText, setIsDemoText] = useState(false);
  const [analyzedText, setAnalyzedText] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const scrollToMain = useCallback(() => {
    mainRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const tryDemo = useCallback(() => {
    fetch('/demo-contract.txt')
      .then((r) => r.text())
      .then((t) => {
        setText(t); setIsDemoText(true);
        setTimeout(() => mainRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      })
      .catch(() => {});
  }, []);

  // Demo mode
  useEffect(() => {
    const sharedData = decodeShareableData();
    if (sharedData) { setResult(sharedData); setAnalyzedText(''); return; }
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === 'true' && !demoLoaded) {
      fetch('/demo-contract.txt')
        .then((r) => r.text())
        .then((t) => { setText(t); setDemoLoaded(true); setIsDemoText(true); })
        .catch(() => {});
    }
  }, [demoLoaded]);

  const hasInput = !!(file || text.trim());

  const acceptFile = useCallback((f: File) => {
    if (f.type !== 'application/pdf') { setError('Only PDF files are accepted.'); return; }
    setFile(f); setText(''); setResult(null); setError(null); setIsDemoText(false);
  }, []);

  const handleReset = useCallback(() => {
    setFile(null); setText(''); setResult(null); setError(null); setAnalyzedText('');
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) acceptFile(f);
  }, [acceptFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0]; if (f) acceptFile(f);
  }, [acceptFile]);

  const handleAnalyze = async () => {
    setError(null); setResult(null); setIsLoading(true);
    try {
      let contractText = text.trim();
      if (file) contractText = await extractTextFromPDF(file);
      if (!contractText) {
        setError('No contract text to analyse. Upload a PDF or paste text.');
        setIsLoading(false); return;
      }

      // Use cached result for demo contract (works offline / rate-limited)
      if (isDemoText && !file) {
        await new Promise(r => setTimeout(r, 1500)); // simulate processing
        const cached = await fetch('/demo-result.json').then(r => r.json());
        setResult(cached); setAnalyzedText(contractText);
        setIsLoading(false); return;
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: contractText }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `Request failed (${res.status})`);
      }
      const data = await res.json();
      setResult(data); setAnalyzedText(contractText);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally { setIsLoading(false); }
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 dark:bg-zinc-950 text-zinc-100 dark:text-zinc-100">

      {/* ── Header ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 glass">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-8 flex-shrink-0" />
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white leading-none">ContractScan</h1>
              <p className="text-[10px] text-zinc-500 tracking-wide uppercase">AI Contract Analysis</p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 ml-8">
            <a href="#how-it-works" className="text-xs text-zinc-400 hover:text-white transition-colors">Features</a>
            <a href="#tool" className="text-xs text-zinc-400 hover:text-white transition-colors">Try It</a>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <Hero onGetStarted={scrollToMain} onTryDemo={tryDemo} />

      {/* ── Features Grid ───────────────────────────────────── */}
      <section id="how-it-works" className="border-t border-zinc-800/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">How It Works</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
              Three agents. One report. Zero surprises.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeatureCard
              icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 01-1.59.659H9.06a2.25 2.25 0 01-1.591-.659L5 14.5m14 0V5.846a2.25 2.25 0 00-1.272-2.03l-5.25-2.361a2.25 2.25 0 00-1.956 0L5.772 3.816A2.25 2.25 0 004.5 5.846V14.5" /></svg>}
              title="Document Intelligence"
              desc="Agent 1 identifies the contract type, structure, and key parties automatically."
            />
            <FeatureCard
              icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>}
              title="Risk Assessment"
              desc="Agent 2 flags every clause as red, amber, or green with plain-English explanations."
            />
            <FeatureCard
              icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" /></svg>}
              title="Gap Analysis"
              desc="Agent 3 spots missing protections, vague language, and one-sided terms you might miss."
            />
            <FeatureCard
              icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>}
              title="Chat with Contract"
              desc="Ask questions about your contract and get instant, sourced answers from the AI."
            />
          </div>
        </div>
      </section>

      {/* ── Main Tool ───────────────────────────────────────── */}
      <section id="tool" ref={mainRef} className="border-t border-zinc-800/60">
        <div className="mx-auto max-w-6xl px-6 py-16">
          {/* Section header */}
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">Contract Analysis Tool</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">Upload or paste your contract</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* ── LEFT: Input ──────────────────────────────────── */}
            <div className="flex flex-col gap-5">

              {/* Drop zone */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed
                  px-6 py-12 cursor-pointer transition-all duration-200
                  ${
                    isDragging
                      ? 'border-blue-500 bg-blue-950/30'
                      : file
                        ? 'border-emerald-500/50 bg-emerald-950/20'
                        : 'border-zinc-700 bg-zinc-900/30 hover:border-zinc-600 hover:bg-zinc-900/60'
                  }
                `}
              >
                <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" />

                {file ? (
                  <>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                      <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-emerald-400">{file.name}</p>
                    <p className="mt-1 text-xs text-zinc-500">{(file.size / 1024).toFixed(1)} KB &middot; Click to replace</p>
                  </>
                ) : (
                  <>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
                      <svg className="h-6 w-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-zinc-300">Drop PDF here or click to upload</p>
                    <p className="mt-1 text-xs text-zinc-500">PDF files only</p>
                  </>
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-zinc-800" />
                <span className="text-xs text-zinc-600 uppercase tracking-wider">or paste text</span>
                <div className="flex-1 border-t border-zinc-800" />
              </div>

              {/* Textarea */}
              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setIsDemoText(false);
                  if (e.target.value.trim() && file) setFile(null);
                  setResult(null); setError(null);
                }}
                placeholder="Paste contract text here..."
                className="min-h-[180px] w-full resize-y rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/20 font-mono leading-relaxed"
              />

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAnalyze}
                  disabled={!hasInput || isLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Analysing...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                      </svg>
                      Analyse Contract
                    </>
                  )}
                </button>
                {!text && !file && (
                  <button
                    onClick={() => {
                      fetch('/demo-contract.txt')
                        .then((r) => r.text())
                        .then((t) => { setText(t); setIsDemoText(true); })
                        .catch(() => {});
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/40 px-5 py-3 text-sm font-medium text-zinc-400 transition-all hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-200"
                  >
                    Load Demo
                  </button>
                )}
              </div>

              {/* Agent Steps */}
              <AgentSteps isLoading={isLoading} />
            </div>

            {/* ── RIGHT: Results ───────────────────────────────── */}
            <div className="flex flex-col">

              {/* Error */}
              {error && (
                <div className="mb-4 rounded-xl border border-red-900/50 bg-red-950/30 px-5 py-4 text-sm text-red-300 border-l-4 border-l-red-500">
                  <span className="font-semibold text-red-400">Error:</span> {error}
                </div>
              )}

              {/* Loading */}
              {isLoading && (
                <div className="animate-fade-in-up flex flex-col items-center justify-center gap-5 py-28 text-center">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full border-2 border-zinc-700 border-t-blue-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-8 w-8 rounded-full border-2 border-zinc-800 border-b-blue-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-300">Analysing your contract</p>
                    <p className="mt-1 text-xs text-zinc-500">Three agents are working in parallel...</p>
                  </div>
                </div>
              )}

              {/* Results */}
              {!isLoading && result && (
                <div className="animate-fade-in-up space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                      <h2 className="text-sm font-semibold text-zinc-200">Analysis Complete</h2>
                    </div>
                    <button
                      onClick={handleReset}
                      className="text-xs text-zinc-500 hover:text-zinc-200 font-medium transition-colors"
                    >
                      New Analysis
                    </button>
                  </div>
                  <div className="animate-fade-in-up delay-75"><RiskReport result={result} contractText={analyzedText} /></div>
                  <div className="animate-fade-in-up delay-150"><ShareableReport result={result} /></div>
                  <div className="animate-fade-in-up delay-200"><NegotiationCheatSheet result={result} /></div>
                  <div className="animate-fade-in-up delay-300"><AgentReasoning result={result} /></div>
                  {analyzedText && (
                    <div className="animate-fade-in-up delay-300"><ChatPanel contractText={analyzedText} analysisContext={result} /></div>
                  )}
                  <div className="animate-fade-in-up delay-500"><ContractComparison /></div>
                </div>
              )}

              {result && <BackToTop />}

              {/* Empty state */}
              {!isLoading && !result && !error && (
                <div className="flex flex-col items-center justify-center gap-5 rounded-xl border border-zinc-800 bg-zinc-900/20 px-6 py-28 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50">
                    <svg className="h-8 w-8 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-400">No contract analysed yet</p>
                    <p className="mt-1 text-xs text-zinc-600">Upload a PDF or paste text to get started</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800/60">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo className="h-6 w-6" />
            <span className="text-sm font-semibold text-zinc-400">ContractScan AI</span>
          </div>
          <p className="text-xs text-zinc-600">
            For educational purposes only. This is not legal advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
