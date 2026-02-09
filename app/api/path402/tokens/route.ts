/**
 * $402 Tokens API
 * GET - List all tokens with prices
 * POST - Create new token (issuer only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { listTokens, createToken } from '@/lib/path402';

const CreateTokenSchema = z.object({
  token_id: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  base_price_sats: z.number().int().positive().optional().default(500),
  pricing_model: z.enum(['sqrt_decay', 'fixed', 'linear']).optional().default('sqrt_decay'),
  decay_factor: z.number().positive().optional().default(1.0),
  max_supply: z.number().int().positive().optional(),
  issuer_share_bps: z.number().int().min(0).max(10000).optional().default(7000),
  platform_share_bps: z.number().int().min(0).max(10000).optional().default(3000),
  content_type: z.enum(['blog', 'api', 'membership', 'media', 'custom']).optional(),
  access_url: z.string().max(500).optional(),
  icon_url: z.string().url().optional()
});

export async function GET() {
  try {
    const tokens = await listTokens();

    return NextResponse.json({
      success: true,
      tokens,
      count: tokens.length
    });
  } catch (error) {
    console.error('[path402/tokens] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to list tokens' },
      { status: 500 }
    );
  }
}

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
        { error: 'HandCash handle required to create tokens' },
        { status: 400 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const parsed = CreateTokenSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Validate shares total 100%
    const issuerShare = parsed.data.issuer_share_bps || 7000;
    const platformShare = parsed.data.platform_share_bps || 3000;
    if (issuerShare + platformShare !== 10000) {
      return NextResponse.json(
        { error: 'Issuer and platform shares must total 10000 (100%)' },
        { status: 400 }
      );
    }

    // Create token
    const token = await createToken(profile.handcash_handle, parsed.data);

    return NextResponse.json({
      success: true,
      token
    }, { status: 201 });
  } catch (error) {
    console.error('[path402/tokens] POST error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create token';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
