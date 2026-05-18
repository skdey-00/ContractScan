'use client';

import React, { useState, useCallback } from 'react';

interface ShareableReportProps {
  result: any;
  contractText?: string;
}

export default function ShareableReport({ result, contractText = '' }: ShareableReportProps) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Link copied to clipboard!');

  const handleShare = useCallback(() => {
    try {
      // Encode result as base64 with unicode safety
      const jsonStr = JSON.stringify(result);
      const encoded = btoa(encodeURIComponent(jsonStr));
      const shareUrl = `${window.location.origin}${window.location.pathname}#data=${encoded}`;

      // Copy to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        setToastMessage('Link copied to clipboard!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }).catch(() => {
        // Fallback: select text in a temporary textarea
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setToastMessage('Link copied to clipboard!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      });
    } catch {
      setToastMessage('Failed to generate share link.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  }, [result]);

  return (
    <>
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        Share Report
      </button>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white shadow-lg">
            {toastMessage}
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Decode analysis result from the URL hash.
 * Call this from page.tsx on mount to check for shared report data.
 * Returns the parsed result object or null if no data found.
 */
export function decodeShareableData(): any | null {
  if (typeof window === 'undefined') return null;

  const hash = window.location.hash;
  if (!hash.startsWith('#data=')) return null;

  try {
    const encoded = hash.slice(6); // Remove '#data='
    const jsonStr = decodeURIComponent(atob(encoded));
    const parsed = JSON.parse(jsonStr);
    return parsed;
  } catch {
    return null;
  }
}
