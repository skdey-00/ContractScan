import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq(); // Uses GROQ_API_KEY from env

const CHAT_SYSTEM_PROMPT = `You are ContractScan AI assistant. The user has already analyzed a contract. Answer their follow-up questions about it. Be concise, specific, reference actual clauses/numbers from the contract. If they ask about something not in the contract, say so. Never give formal legal advice. Always say 'This is not legal advice.' at the end.`;

// Only POST is allowed
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 },
  );
}

export async function POST(request: NextRequest) {
  try {
    // Parse body safely
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body. Please send valid JSON.' },
        { status: 400 },
      );
    }

    const { contractText, question, analysisContext, chatHistory } = body;

    // Validate required fields
    if (!contractText || typeof contractText !== 'string') {
      return NextResponse.json(
        { error: 'Contract text is required.' },
        { status: 400 },
      );
    }

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required.' },
        { status: 400 },
      );
    }

    if (question.trim().length > 500) {
      return NextResponse.json(
        { error: 'Question must be 500 characters or less.' },
        { status: 400 },
      );
    }

    // Build messages array
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: CHAT_SYSTEM_PROMPT,
      },
    ];

    // Add chat history if provided
    if (Array.isArray(chatHistory)) {
      for (const msg of chatHistory) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: String(msg.content) });
        }
      }
    }

    // Add the current user question with contract context
    const contractExcerpt = contractText.slice(0, 3000);
    messages.push({
      role: 'user',
      content: `Contract text for reference:\n${contractExcerpt}\n\nQuestion: ${question.trim()}`,
    });

    const chatCompletion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2048,
      temperature: 0.3,
      messages,
    });

    const rawOutput = chatCompletion.choices[0]?.message?.content?.trim();

    if (!rawOutput) {
      return NextResponse.json(
        { error: 'No response from AI. Please try again.' },
        { status: 500 },
      );
    }

    // Try to parse JSON from the response (handle code fences)
    let answer: string = rawOutput;
    try {
      let jsonStr = rawOutput;
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr
          .replace(/^```(?:json)?\s*\n?/, '')
          .replace(/\n?```\s*$/, '');
      }
      const parsed = JSON.parse(jsonStr);
      if (typeof parsed === 'object' && parsed.answer) {
        answer = parsed.answer;
      }
    } catch {
      // Not JSON — use raw text as answer
    }

    return NextResponse.json({ answer });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred.';

    console.error('[/api/chat] Error:', error);

    // Handle rate limit errors gracefully
    if (message.includes('rate limit') || message.includes('429') || message.includes('overloaded') || message.includes('capacity')) {
      return NextResponse.json(
        { error: 'The service is currently busy. Please try again in a moment.' },
        { status: 503 },
      );
    }

    // Handle API key errors gracefully
    if (message.includes('API key') || message.includes('authentication') || message.includes('401') || message.includes('Invalid API Key')) {
      return NextResponse.json(
        { error: 'Service configuration error. Please try again later.' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: 'Chat request failed. Please try again.' },
      { status: 500 },
    );
  }
}
