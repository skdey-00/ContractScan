import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { SYSTEM_PROMPT } from '@/lib/prompts';

const groq = new Groq(); // Uses GROQ_API_KEY from env

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Contract text is required.' },
        { status: 400 },
      );
    }

    if (text.trim().length < 100) {
      return NextResponse.json(
        { error: 'The document is too short to analyze. Please provide the full contract text.' },
        { status: 400 },
      );
    }

    if (text.trim().length > 200000) {
      return NextResponse.json(
        { error: 'The document is too long. Please provide a contract under 200,000 characters.' },
        { status: 400 },
      );
    }

    const chatCompletion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 8192,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `Analyze this contract:\n\n${text}`,
        },
      ],
    });

    const rawOutput = chatCompletion.choices[0]?.message?.content?.trim();

    if (!rawOutput) {
      return NextResponse.json(
        { error: 'No response from AI. Please try again.' },
        { status: 500 },
      );
    }

    // Try to parse as JSON
    let parsed: any;
    try {
      // Handle potential markdown code fences wrapping the JSON
      let jsonStr = rawOutput;
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr
          .replace(/^```(?:json)?\s*\n?/, '')
          .replace(/\n?```\s*$/, '');
      }
      parsed = JSON.parse(jsonStr);
    } catch {
      // If the AI didn't return valid JSON, return the raw text as a fallback
      return NextResponse.json({
        documentType: 'Raw Analysis',
        overallRisk: 'medium',
        clauses: [],
        gapAnalysis: [],
        _rawOutput: rawOutput,
      });
    }

    // Validate the structure has the minimum required fields
    if (!parsed.documentType && !parsed.clauses && !parsed.gapAnalysis) {
      return NextResponse.json({
        documentType: 'Raw Analysis',
        overallRisk: parsed.overallRisk || 'medium',
        clauses: [],
        gapAnalysis: [],
        _rawOutput: rawOutput,
      });
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred.';

    console.error('[/api/analyze] Error:', error);

    // Handle rate limit or API key errors gracefully
    if (message.includes('API key') || message.includes('authentication') || message.includes('401') || message.includes('Invalid API Key')) {
      return NextResponse.json(
        { error: 'API configuration error. Please contact support.' },
        { status: 500 },
      );
    }

    if (message.includes('rate limit') || message.includes('429') || message.includes('overloaded') || message.includes('capacity')) {
      return NextResponse.json(
        { error: 'The service is currently busy. Please try again in a moment.' },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: `Analysis failed. Please try again.` },
      { status: 500 },
    );
  }
}
