'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPanelProps {
  contractText: string;
  analysisContext: any;
}

function generateSuggestions(analysisContext: any): string[] {
  const suggestions: string[] = [];

  if (analysisContext?.clauses?.length > 0) {
    const hasRed = analysisContext.clauses.some((c: any) => c.riskLevel === 'red');
    if (hasRed) {
      suggestions.push('What are the biggest risks in this contract?');
    }
    const termination = analysisContext.clauses.find((c: any) =>
      c.title?.toLowerCase().includes('terminat')
    );
    if (termination) {
      suggestions.push('Is the termination clause fair?');
    }
  }

  if (analysisContext?.gapAnalysis?.length > 0) {
    suggestions.push('What should I negotiate first?');
  }

  if (analysisContext?.documentType) {
    const dtype = analysisContext.documentType.toLowerCase();
    if (dtype.includes('lease') || dtype.includes('rent')) {
      suggestions.push('Can the landlord evict me without notice?');
    }
  }

  // Fill remaining slots with general suggestions
  const defaults = [
    'What are the biggest risks in this contract?',
    'What should I negotiate first?',
    'Is the termination clause fair?',
    'Are there any hidden fees or penalties?',
  ];

  for (const d of defaults) {
    if (suggestions.length >= 4) break;
    if (!suggestions.includes(d)) {
      suggestions.push(d);
    }
  }

  return suggestions.slice(0, 4);
}

// Typing animation dots
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <span className="inline-block w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="inline-block w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="inline-block w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

export default function ChatPanel({ contractText, analysisContext }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = generateSuggestions(analysisContext);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractText,
          question: trimmed,
          analysisContext,
          chatHistory: updatedMessages.slice(0, -1), // All previous messages (excluding current)
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `Request failed with status ${res.status}`);
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = { role: 'assistant', content: data.answer };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Sorry, I couldn't process that. ${err.message || 'Please try again.'}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, contractText, analysisContext]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleSuggestionClick = (question: string) => {
    sendMessage(question);
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-6">
      {/* Collapsible header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-3.5 shadow-sm transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-800">Chat with Your Contract</span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
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
        <div className="mt-2 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Suggested questions */}
          {messages.length === 0 && !isLoading && (
            <div className="px-4 pt-4 pb-2">
              <p className="text-xs font-medium text-gray-500 mb-2">Suggested questions</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(q)}
                    className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages area */}
          <div className="max-h-64 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && !isLoading && (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-gray-400">Ask a question about your contract</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-xl">
                  <TypingDots />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div className="border-t border-gray-100 px-4 py-3 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your contract..."
              disabled={isLoading}
              className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              maxLength={500}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim()}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
