import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { rewriteContract } from '@/lib/agents/rewriter';

const groq = new Groq(); // Uses GROQ_API_KEY from env

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

    const { contractText, clauses } = body;

    // Validate required fields
    if (!contractText || typeof contractText !== 'string') {
      return NextResponse.json(
        { error: 'Contract text is required and must be a string.' },
        { status: 400 },
      );
    }

    if (!Array.isArray(clauses)) {
      return NextResponse.json(
        { error: 'Clauses must be provided as an array.' },
        { status: 400 },
      );
    }

    // Run the rewrite agent
    const result = await rewriteContract(groq, contractText, clauses);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred.';

    console.error('[/api/rewrite] Error:', error);

    // Handle rate limit errors gracefully
    if (
      message.includes('rate limit') ||
      message.includes('429') ||
      message.includes('overloaded') ||
      message.includes('capacity')
    ) {
      return NextResponse.json(
        { error: 'The service is currently busy. Please try again in a moment.' },
        { status: 503 },
      );
    }

    // Handle API key errors gracefully
    if (
      message.includes('API key') ||
      message.includes('authentication') ||
      message.includes('401') ||
      message.includes('Invalid API Key')
    ) {
      return NextResponse.json(
        { error: 'Service configuration error. Please try again later.' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: 'Contract rewrite failed. Please try again.' },
      { status: 500 },
    );
  }
}
