import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAIClient } from '@/lib/google-ai/client';
import type { NanoBananaVideoRequest } from '@/lib/google-ai/client';

export async function POST(request: NextRequest) {
  try {
    const body: NanoBananaVideoRequest = await request.json();

    // Validate request
    if (!body.prompt || body.prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Get Google AI client
    const client = getGoogleAIClient();

    // Generate video using Nano Banana
    const result = await client.generateVideo({
      prompt: body.prompt,
      duration: body.duration || 6,
      aspectRatio: body.aspectRatio || '9:16',
    });

    if (!result.success || !result.data) {
      console.error('🍌 Nano Banana Generation Failure:', result.error);
      return NextResponse.json(
        {
          error: result.error || 'Video generation failed',
          success: false
        },
        { status: 500 }
      );
    }

    // TODO: Log to Supabase automation_usage table
    // Similar to how Grok API logs usage

    return NextResponse.json({
      success: true,
      video: result.data,
      processing_time: result.processing_time,
    });
  } catch (error: any) {
    console.error('Generate video API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
