import { NextRequest, NextResponse } from 'next/server';
import { supabase, isDbConnected } from '@/lib/supabase';
import { getHolder } from '@/lib/store';

// GET /api/dividends/pending - Get user's pending dividends
export async function GET(request: NextRequest) {
  try {
    const handle = request.headers.get('x-wallet-handle');

    if (!handle) {
      return NextResponse.json({ error: 'Handle required' }, { status: 400 });
    }

    const holder = await getHolder(undefined, handle);
    if (!holder) {
      return NextResponse.json({ error: 'No tokens held' }, { status: 400 });
    }

    if (!isDbConnected() || !supabase) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    // Get pending claims
    const { data: pendingClaims } = await supabase
      .from('dividend_claims')
      .select(`
        id,
        claim_amount_sats,
        staked_amount,
        dividend_distributions (
          distributed_at,
          per_token_sats
        )
      `)
      .eq('holder_id', holder.id)
      .eq('status', 'pending');

    const totalPending = (pendingClaims || []).reduce(
      (sum, c) => sum + c.claim_amount_sats,
      0
    );

    // Get claim history
    const { data: claimedHistory } = await supabase
      .from('dividend_claims')
      .select('claim_amount_sats, claimed_at')
      .eq('holder_id', holder.id)
      .eq('status', 'claimed')
      .order('claimed_at', { ascending: false })
      .limit(10);

    const totalClaimed = (claimedHistory || []).reduce(
      (sum, c) => sum + c.claim_amount_sats,
      0
    );

    return NextResponse.json({
      pendingAmount: totalPending,
      pendingClaims: pendingClaims || [],
      claimCount: (pendingClaims || []).length,
      totalClaimed,
      claimHistory: claimedHistory || [],
      stakedBalance: holder.stakedBalance,
    });
  } catch (error) {
    console.error('Error fetching pending dividends:', error);
    return NextResponse.json({
      error: 'Failed to fetch pending dividends',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
