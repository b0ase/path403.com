/**
 * $402 Token Details API
 * GET - Get token details with price schedule
 * PATCH - Update token (issuer only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { getToken, updateToken, getTokenPriceSchedule, getHolderCount, getTokenRevenue } from '@/lib/path402';

const UpdateTokenSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  content_type: z.enum(['blog', 'api', 'membership', 'media', 'custom']).optional(),
  access_url: z.string().max(500).optional(),
  icon_url: z.string().url().optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tokenId } = await params;

    const { token, schedule } = await getTokenPriceSchedule(tokenId);
    const holderCount = await getHolderCount(tokenId);
    const revenue = await getTokenRevenue(tokenId);

    return NextResponse.json({
      success: true,
      token,
      price_schedule: schedule,
      stats: {
        holder_count: holderCount,
        total_revenue_sats: revenue.totalSats,
        issuer_revenue_sats: revenue.issuerSats,
        platform_revenue_sats: revenue.platformSats
      }
    });
  } catch (error) {
    console.error('[path402/tokens/[id]] GET error:', error);
    const message = error instanceof Error ? error.message : 'Token not found';
    return NextResponse.json(
      { error: message },
      { status: 404 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tokenId } = await params;
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
    const parsed = UpdateTokenSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Update token (will verify ownership)
    const token = await updateToken(tokenId, profile.handcash_handle, parsed.data);

    return NextResponse.json({
      success: true,
      token
    });
  } catch (error) {
    console.error('[path402/tokens/[id]] PATCH error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update token';
    const status = message.includes('not found') ? 404 : message.includes('issuer') ? 403 : 500;
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
