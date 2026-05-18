'use client';

import React, { useState, useEffect } from 'react';

interface AgentStepsProps {
  isLoading: boolean;
  currentStep?: number;
}

const steps = [
  'Identifying document type',
  'Assessing clause risks',
  'Running gap analysis',
];

export default function AgentSteps({ isLoading, currentStep }: AgentStepsProps) {
  const [autoStep, setAutoStep] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setAutoStep(0);
      return;
    }

    // Only use auto-timer if currentStep is not provided
    if (currentStep !== undefined) return;

    setAutoStep(0);

    const t1 = setTimeout(() => setAutoStep(1), 5000);
    const t2 = setTimeout(() => setAutoStep(2), 12000);
    // After all steps complete, stay on step 2 (the last real step)

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isLoading, currentStep]);

  const activeStep = currentStep !== undefined ? currentStep : autoStep;

  if (!isLoading) {
    return (
      <div className="flex items-start justify-between gap-4 w-full max-w-2xl mx-auto py-6">
        {steps.map((label, i) => (
          <div key={i} className="flex flex-col items-center flex-1">
            <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center">
              <span className="text-xs text-gray-400">{i + 1}</span>
            </div>
            <p className="mt-2 text-xs text-gray-400 text-center leading-tight">{label}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-4 w-full max-w-2xl mx-auto py-6">
      {steps.map((label, i) => {
        const isComplete = i < activeStep;
        const isActive = i === activeStep;

        return (
          <div key={i} className="flex flex-col items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                isComplete
                  ? 'border-green-500 bg-green-500'
                  : isActive
                  ? 'border-blue-500 bg-blue-50 animate-pulse'
                  : 'border-gray-300 bg-gray-100'
              }`}
            >
              {isComplete ? (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : isActive ? (
                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              ) : (
                <span className="text-xs text-gray-400">{i + 1}</span>
              )}
            </div>
            <p
              className={`mt-2 text-xs text-center leading-tight ${
                isComplete ? 'text-green-600' : isActive ? 'text-blue-600 font-medium' : 'text-gray-400'
              }`}
            >
              {label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
