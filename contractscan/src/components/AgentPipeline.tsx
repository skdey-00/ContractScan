'use client';

import React, { useState, useEffect, useRef } from 'react';

interface PipelineAgent {
  name: string;
  status: 'waiting' | 'running' | 'done' | 'error' | 'skipped';
  duration?: number;
  output?: string;
}

interface PipelineData {
  agents: {
    name: string;
    status: string;
    duration: number;
    output: string;
  }[];
  totalDuration: number;
  critiqueTriggered: boolean;
  critiqueReason: string | null;
}

interface AgentPipelineProps {
  isLoading: boolean;
  result: any;
}

// Agent definitions for simulation
const SIM_AGENTS: PipelineAgent[] = [
  { name: 'Document Classifier', status: 'waiting' },
  { name: 'Clause Analyzer', status: 'waiting' },
  { name: 'Gap Finder', status: 'waiting' },
  { name: 'Self-Critique', status: 'waiting' },
];

// Timeline: each entry is [agentIndex, delayMs, newStatus]
const SIM_TIMELINE: [number, number, PipelineAgent['status']][] = [
  [0, 0, 'running'],
  [0, 1500, 'done'],
  [1, 1500, 'running'],
  [1, 4000, 'done'],
  [2, 4000, 'running'],
  [2, 5000, 'done'],
  [3, 5200, 'running'],  // simulate "evaluating need for review" pause
  [3, 6200, 'done'],
];

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// Status icon components
function StatusIcon({ status }: { status: PipelineAgent['status'] }) {
  switch (status) {
    case 'done':
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30">
          <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    case 'running':
      return (
        <div className="relative flex h-7 w-7 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
          <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/15 border border-blue-500/40">
            <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
          </div>
        </div>
      );
    case 'error':
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/15 border border-red-500/30">
          <svg className="h-3.5 w-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      );
    case 'skipped':
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-700/40 border border-zinc-700/60">
          <svg className="h-3.5 w-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
      );
    default: // waiting
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700/50">
          <div className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
        </div>
      );
  }
}

// Connecting line between agents
function Connector({ status }: { status: 'active' | 'done' | 'idle' }) {
  return (
    <div className="ml-[13px] w-0.5 h-5 -my-0.5 relative">
      <div
        className={`absolute inset-0 rounded-full ${
          status === 'done'
            ? 'bg-emerald-500/30'
            : status === 'active'
            ? 'bg-blue-500/30'
            : 'bg-zinc-800'
        }`}
      />
    </div>
  );
}

export default function AgentPipeline({ isLoading, result }: AgentPipelineProps) {
  const [simAgents, setSimAgents] = useState<PipelineAgent[]>(SIM_AGENTS.map(a => ({ ...a })));
  const [evaluatingReview, setEvaluatingReview] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const loadingIdRef = useRef(0);

  // Simulate pipeline progression during loading
  useEffect(() => {
    const currentLoadingId = ++loadingIdRef.current;

    // Clear previous timers
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    if (!isLoading) {
      setSimAgents(SIM_AGENTS.map(a => ({ ...a })));
      setEvaluatingReview(false);
      return;
    }

    // Reset agents to waiting
    setSimAgents(SIM_AGENTS.map(a => ({ ...a, status: 'waiting' as const })));
    setEvaluatingReview(false);

    // Schedule simulation events
    SIM_TIMELINE.forEach(([agentIdx, delay, newStatus]) => {
      const t = setTimeout(() => {
        // Only apply if this is still the current loading session
        if (loadingIdRef.current !== currentLoadingId) return;

        setSimAgents(prev => {
          const next = [...prev];
          next[agentIdx] = { ...next[agentIdx], status: newStatus };
          return next;
        });

        // Show "evaluating" state between agent 2 finishing and agent 3 starting
        if (agentIdx === 2 && newStatus === 'done') {
          setEvaluatingReview(true);
        }
        if (agentIdx === 3 && newStatus === 'running') {
          setEvaluatingReview(false);
        }
      }, delay);
      timersRef.current.push(t);
    });

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [isLoading]);

  // ── Determine what to render ──────────────────────────────────
  const pipeline: PipelineData | null = result?._pipeline ?? null;
  const showResults = !isLoading && result && pipeline;

  // If no loading and no pipeline data, show nothing
  if (!isLoading && !showResults) {
    return null;
  }

  // ── LOADING STATE: show simulated pipeline ────────────────────
  if (isLoading) {
    return (
      <div className="w-full mt-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-zinc-800/60 flex items-center gap-2">
            <div className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
            </div>
            <span className="text-xs font-semibold text-zinc-300">Multi-Agent Pipeline</span>
            <span className="text-[10px] text-zinc-500 ml-auto">Running...</span>
          </div>

          {/* Agent rows */}
          <div className="px-4 py-3 space-y-0">
            {simAgents.map((agent, i) => (
              <React.Fragment key={agent.name}>
                <div className="flex items-center gap-3 py-2">
                  <StatusIcon status={agent.status} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${
                          agent.status === 'running'
                            ? 'text-blue-300'
                            : agent.status === 'done'
                            ? 'text-zinc-300'
                            : 'text-zinc-500'
                        }`}
                      >
                        {agent.name}
                      </span>
                      {agent.status === 'done' && (
                        <span className="text-[10px] text-zinc-600 font-mono">done</span>
                      )}
                    </div>
                    {agent.status === 'running' && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-0.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500/50 rounded-full animate-pulse" style={{ width: '60%' }} />
                        </div>
                      </div>
                    )}
                  </div>
                  {agent.status === 'running' && (
                    <span className="text-[10px] text-blue-400/70 font-mono animate-pulse">processing</span>
                  )}
                </div>
                {i < simAgents.length - 1 && (
                  <Connector
                    status={
                      agent.status === 'done'
                        ? simAgents[i + 1].status === 'running' || simAgents[i + 1].status === 'done'
                          ? 'done'
                          : 'done'
                        : agent.status === 'running'
                        ? 'active'
                        : 'idle'
                    }
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Evaluating review banner */}
          {evaluatingReview && (
            <div className="mx-4 mb-3 px-3 py-2 rounded-lg bg-blue-950/30 border border-blue-500/20 flex items-center gap-2">
              <svg className="h-3.5 w-3.5 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-[11px] text-blue-300">Evaluating need for self-critique review...</span>
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-zinc-800/40 bg-zinc-900/40">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-500">4 agents queued</span>
              <span className="text-[10px] text-zinc-600">Awaiting results...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── RESULTS STATE: show actual pipeline data ──────────────────
  if (!pipeline) return null;
  const agents = pipeline.agents;
  const totalMs = pipeline.totalDuration;
  const critiqueTriggered = pipeline.critiqueTriggered;
  const critiqueReason = pipeline.critiqueReason;

  const completedAgents = agents.filter(a => a.status === 'done');
  const errorAgents = agents.filter(a => a.status === 'error');
  const skippedAgents = agents.filter(a => a.status === 'skipped');
  const activeAgentCount = agents.filter(a => a.status !== 'skipped').length;

  return (
    <div className="w-full mt-2">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-zinc-800/60 flex items-center gap-2">
          <div className="flex h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-semibold text-zinc-300">Pipeline Execution Trace</span>
          <span className="text-[10px] text-zinc-500 ml-auto font-mono">
            {activeAgentCount} agent{activeAgentCount !== 1 ? 's' : ''} in {formatDuration(totalMs)}
          </span>
        </div>

        {/* Agent rows */}
        <div className="px-4 py-3 space-y-0">
          {agents.map((agent, i) => {
            const agentStatus: PipelineAgent['status'] =
              agent.status === 'done' ? 'done' :
              agent.status === 'error' ? 'error' :
              agent.status === 'skipped' ? 'skipped' : 'done';

            return (
              <React.Fragment key={agent.name}>
                <div className="flex items-start gap-3 py-2">
                  <div className="mt-0.5">
                    <StatusIcon status={agentStatus} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-zinc-300">{agent.name}</span>
                      {agent.duration != null && (
                        <span className="text-[10px] text-zinc-600 font-mono">{formatDuration(agent.duration)}</span>
                      )}
                      {agentStatus === 'skipped' && (
                        <span className="text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">skipped</span>
                      )}
                    </div>
                    {agent.output && (
                      <p className="mt-0.5 text-[11px] text-zinc-500 leading-relaxed line-clamp-2">{agent.output}</p>
                    )}
                    {/* Critique badge */}
                    {agent.name === 'Self-Critique' && critiqueTriggered && agentStatus === 'done' && critiqueReason && (
                      <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5">
                        <svg className="h-3 w-3 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        <span className="text-[10px] text-amber-300 font-medium">Auto-triggered: {critiqueReason}</span>
                      </div>
                    )}
                  </div>
                </div>
                {i < agents.length - 1 && (
                  <Connector
                    status={
                      agentStatus === 'done' ? 'done' :
                      agentStatus === 'skipped' ? 'idle' :
                      'idle'
                    }
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Summary footer */}
        <div className="px-4 py-2.5 border-t border-zinc-800/40 bg-zinc-900/40">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-zinc-500">
                {completedAgents.length} completed
                {errorAgents.length > 0 && <span className="text-red-400/70"> · {errorAgents.length} error{errorAgents.length > 1 ? 's' : ''}</span>}
                {skippedAgents.length > 0 && <span className="text-zinc-600"> · {skippedAgents.length} skipped</span>}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {critiqueTriggered && (
                <span className="text-[10px] text-amber-400/70 flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                  Review triggered
                </span>
              )}
              <span className="text-[10px] text-zinc-600 font-mono">
                Total: {formatDuration(totalMs)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
