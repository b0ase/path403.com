/**
 * POST /api/twitter/tokenize
 *
 * Tokenize the authenticated user's Twitter account as a $402 token.
 * Requires: HandCash auth (for payment receiving) + Twitter connected.
 *
 * This is a KEY business endpoint — every call creates a new tradeable
 * token and a new business relationship.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { tokenizeTwitterAccount, getTwitterIdentity } from '@/lib/twitter/tokenize';

export async function POST(request: NextRequest) {
  try {
    // Require HandCash auth (needed for payment receiving)
    const handcashHandle = request.cookies.get('b0ase_user_handle')?.value;
    if (!handcashHandle) {
      return NextResponse.json(
        { error: 'HandCash login required. Connect your HandCash wallet first.' },
        { status: 401 }
      );
    }

    // Find the user's unified ID from HandCash
    const supabase = createAdminClient();
    const { data: identity } = await supabase
      .from('user_identities')
      .select('unified_user_id')
      .eq('provider', 'handcash')
      .eq('provider_user_id', handcashHandle)
      .single();

    if (!identity) {
      return NextResponse.json(
        { error: 'User account not found. Please log in again.' },
        { status: 401 }
      );
    }

    // Check if they have Twitter connected
    const twitterProfile = await getTwitterIdentity(identity.unified_user_id);
    if (!twitterProfile) {
      return NextResponse.json(
        { error: 'Twitter not connected. Link your Twitter account first.' },
        { status: 400 }
      );
    }

    // Parse optional body params
    let basePriceSats: number | undefined;
    let description: string | undefined;
    try {
      const body = await request.json();
      basePriceSats = body.base_price_sats;
      description = body.description;
    } catch {
      // No body or invalid JSON — use defaults
    }

    // Tokenize!
    const result = await tokenizeTwitterAccount(
      twitterProfile,
      handcashHandle,
      { basePriceSats, description },
    );

    return NextResponse.json({
      success: true,
      ...result,
      message: result.isNew
        ? `@${twitterProfile.username} has been tokenized! Your MoneyButton is live.`
        : `@${twitterProfile.username} is already tokenized.`,
    });
  } catch (error) {
    console.error('[twitter/tokenize] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to tokenize Twitter account' },
      { status: 500 }
    );
  }
}
