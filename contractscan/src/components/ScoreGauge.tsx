'use client';

import React, { useState, useEffect } from 'react';

interface ScoreGaugeProps {
  score: number; // 0–100
}

function getScoreColor(score: number): { stroke: string; text: string; bg: string } {
  if (score >= 70) return { stroke: '#22c55e', text: 'text-green-400', bg: 'bg-green-950/40' };
  if (score >= 40) return { stroke: '#f59e0b', text: 'text-amber-400', bg: 'bg-amber-950/40' };
  return { stroke: '#ef4444', text: 'text-red-400', bg: 'bg-red-950/40' };
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 30) return 'Poor';
  return 'Dangerous';
}

export default function ScoreGauge({ score }: ScoreGaugeProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const colors = getScoreColor(clamped);
  const label = getScoreLabel(clamped);

  // Animate from 0 to target on mount
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDisplayScore(clamped), 50);
    return () => clearTimeout(timer);
  }, [clamped]);

  // SVG arc parameters
  const radius = 58;
  const strokeWidth = 10;
  const centre = 70;
  const circumference = Math.PI * radius; // half-circle
  const progress = (displayScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <svg
          width={centre * 2}
          height={centre + 10}
          viewBox={`0 0 ${centre * 2} ${centre + 10}`}
          className="overflow-visible"
        >
          {/* Background arc */}
          <path
            d={`M ${centre - radius} ${centre} A ${radius} ${radius} 0 0 1 ${centre + radius} ${centre}`}
            fill="none"
            stroke="#3f3f46"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d={`M ${centre - radius} ${centre} A ${radius} ${radius} 0 0 1 ${centre + radius} ${centre}`}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference - progress}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Score text centred inside the arc */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className={`text-3xl font-bold ${colors.text}`}>{displayScore}</span>
          <span className="text-xs text-zinc-500 -mt-1">/ 100</span>
        </div>
      </div>
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
        {label}
      </span>
    </div>
  );
}
