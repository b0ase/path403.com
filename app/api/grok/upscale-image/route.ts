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
    const { image_url, scale_factor, enhance_quality } = body;

    if (!image_url) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // Create Grok client and upscale image
    const grokClient = createGrokClient();
    const result = await grokClient.upscaleImage({
      image_url,
      scale_factor,
      enhance_quality,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to upscale image' },
        { status: 500 }
      );
    }

    // Log usage to database
    try {
      await supabase
        .from('automation_usage')
        .insert({
          user_id: user.id,
          automation_type: 'upscaling',
          prompt: `Upscale image: ${image_url}`,
          credits_used: result.credits_used || 1,
          result_url: result.data?.url,
          metadata: {
            original_image_url: image_url,
            scale_factor,
            enhance_quality,
            processing_time: result.processing_time,
          },
        });
    } catch (dbError) {
      console.error('Failed to log usage:', dbError);
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      credits_used: result.credits_used,
    });

  } catch (error) {
    console.error('Upscale image API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}