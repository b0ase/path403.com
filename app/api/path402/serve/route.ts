/**
 * $402 Serve API
 * POST - Record token usage/serve event
 * GET - Get serve history
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { recordServe, checkAccess, getUserServes, getServeStats } from '@/lib/path402';

const ServeSchema = z.object({
  token_id: z.string().min(1),
  resource_path: z.string().min(1),
  consume_tokens: z.boolean().optional().default(false),
  tokens_to_consume: z.number().int().positive().optional().default(1)
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user handle from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('handcash_handle')
      .eq('id', user.id)
      .single();

    if (!profile?.handcash_handle) {
      return NextResponse.json(
        { error: 'HandCash handle required' },
        { status: 400 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const parsed = ServeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { token_id, resource_path, consume_tokens, tokens_to_consume } = parsed.data;

    // Get request metadata
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Record the serve
    const result = await recordServe(token_id, profile.handcash_handle, resource_path, {
      consumeTokens: consume_tokens,
      tokensToConsume: tokens_to_consume,
      ipAddress: ip,
      userAgent: userAgent
    });

    if (!result.allowed) {
      return NextResponse.json({
        success: false,
        allowed: false,
        reason: result.reason
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      allowed: true,
      serve_id: result.serve?.id,
      tokens_consumed: result.serve?.tokens_consumed || 0,
      tokens_remaining: result.tokensRemaining
    });
  } catch (error) {
    console.error('[path402/serve] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to record serve' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check what type of query
    const tokenId = searchParams.get('token_id');
    const action = searchParams.get('action'); // 'check', 'history', or 'stats'

    // Get user handle from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('handcash_handle')
      .eq('id', user.id)
      .single();

    const handle = profile?.handcash_handle;

    // Quick access check
    if (action === 'check' && tokenId && handle) {
      const result = await checkAccess(tokenId, handle);
      return NextResponse.json({
        success: true,
        token_id: tokenId,
        has_access: result.hasAccess,
        balance: result.balance
      });
    }

    // Get serve stats for a token
    if (action === 'stats' && tokenId) {
      const stats = await getServeStats(tokenId);
      return NextResponse.json({
        success: true,
        token_id: tokenId,
        stats
      });
    }

    // Default: get user's serve history
    if (!handle) {
      return NextResponse.json({
        success: true,
        serves: []
      });
    }

    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const serves = await getUserServes(handle, Math.min(limit, 100));

    return NextResponse.json({
      success: true,
      holder: handle,
      serves,
      count: serves.length
    });
  } catch (error) {
    console.error('[path402/serve] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to get serve data' },
      { status: 500 }
    );
  }
}
