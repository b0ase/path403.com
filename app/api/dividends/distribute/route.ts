import { NextRequest, NextResponse } from 'next/server';
import { supabase, isDbConnected } from '@/lib/supabase';

// POST /api/dividends/distribute - Trigger dividend distribution (admin only)
export async function POST(request: NextRequest) {
  try {
    // Simple admin check - in production use proper auth
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { poolAmount } = body;

    if (!poolAmount || poolAmount <= 0) {
      return NextResponse.json({ error: 'Invalid pool amount' }, { status: 400 });
    }

    if (!isDbConnected() || !supabase) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    // Get all active stakes
    const { data: activeStakes, error: stakesError } = await supabase
      .from('stakes')
      .select('id, holder_id, amount')
      .eq('status', 'active');

    if (stakesError || !activeStakes || activeStakes.length === 0) {
      return NextResponse.json({
        error: 'No active stakes found',
        details: 'Cannot distribute dividends when no tokens are staked.',
      }, { status: 400 });
    }

    // Calculate total staked
    const totalStaked = activeStakes.reduce((sum, s) => sum + s.amount, 0);

    if (totalStaked === 0) {
      return NextResponse.json({ error: 'No tokens staked' }, { status: 400 });
    }

    // Calculate per-token dividend
    const perTokenSats = poolAmount / totalStaked;

    // Create distribution record
    const { data: distribution, error: distError } = await supabase
      .from('dividend_distributions')
      .insert({
        total_pool_sats: poolAmount,
        total_staked_tokens: totalStaked,
        per_token_sats: perTokenSats,
        distributed_by: 'admin',
        status: 'distributed',
      })
      .select()
      .single();

    if (distError || !distribution) {
      console.error('Distribution creation failed:', distError);
      return NextResponse.json({ error: 'Distribution failed' }, { status: 500 });
    }

    // Create claims for each staker
    const claims = activeStakes.map(stake => ({
      distribution_id: distribution.id,
      holder_id: stake.holder_id,
      stake_id: stake.id,
      staked_amount: stake.amount,
      claim_amount_sats: Math.floor(stake.amount * perTokenSats),
      status: 'pending',
    }));

    const { error: claimsError } = await supabase
      .from('dividend_claims')
      .insert(claims);

    if (claimsError) {
      console.error('Claims creation failed:', claimsError);
      // Rollback distribution status
      await supabase
        .from('dividend_distributions')
        .update({ status: 'failed' })
        .eq('id', distribution.id);
      return NextResponse.json({ error: 'Claims creation failed' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      distributionId: distribution.id,
      poolAmount,
      totalStaked,
      perTokenSats,
      claimsCreated: claims.length,
      totalDistributed: claims.reduce((sum, c) => sum + c.claim_amount_sats, 0),
    });
  } catch (error) {
    console.error('Error distributing dividends:', error);
    return NextResponse.json({
      error: 'Distribution failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// GET /api/dividends/distribute - Get distribution history (admin)
export async function GET(request: NextRequest) {
  try {
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isDbConnected() || !supabase) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    const { data: distributions } = await supabase
      .from('dividend_distributions')
      .select('*')
      .order('distributed_at', { ascending: false })
      .limit(50);

    return NextResponse.json({
      distributions: distributions || [],
    });
  } catch (error) {
    console.error('Error fetching distributions:', error);
    return NextResponse.json({ error: 'Failed to fetch distributions' }, { status: 500 });
  }
}
