import { NextRequest, NextResponse } from 'next/server';
import { createGrokClient } from '@/lib/grok-api/client';
import { getSupabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const supabase = getSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { prompt, aspect_ratio, quality, style } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Create Grok client and generate image
    const grokClient = createGrokClient();
    const result = await grokClient.generateImage({
      prompt,
      aspect_ratio,
      quality,
      style,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate image' },
        { status: 500 }
      );
    }

    // Log usage to database (optional)
    try {
      await supabase
        .from('automation_usage')
        .insert({
          user_id: user.id,
          automation_type: 'text-to-image',
          prompt,
          credits_used: result.credits_used || 1,
          result_url: result.data?.url,
          metadata: {
            aspect_ratio,
            quality,
            style,
            processing_time: result.processing_time,
          },
        });
    } catch (dbError) {
      console.error('Failed to log usage:', dbError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      credits_used: result.credits_used,
    });

  } catch (error) {
    console.error('Generate image API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}