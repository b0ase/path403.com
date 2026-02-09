import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

// Create a new staking agreement
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const body = await request.json();
    const {
      stakerName,
      stakerEmail,
      stakerHandcash,
      projectSlug,
      tokenSymbol,
      stakeAmount,
      stakeValueUsd,
      lockPeriodDays,
      rewardRatePercent,
    } = body;

    // Validate required fields
    if (!tokenSymbol || !stakeAmount) {
      return NextResponse.json({ error: 'Token symbol and stake amount required' }, { status: 400 });
    }

    // Check authentication (optional - can stake without account)
    const { data: { user } } = await supabase.auth.getUser();

    // Calculate unlock date
    const unlockDate = lockPeriodDays > 0
      ? new Date(Date.now() + lockPeriodDays * 24 * 60 * 60 * 1000)
      : null;

    // Generate agreement hash
    const agreementContent = JSON.stringify({
      staker: stakerHandcash || stakerEmail || user?.id,
      token: tokenSymbol,
      amount: stakeAmount,
      lockDays: lockPeriodDays,
      rewardRate: rewardRatePercent,
      timestamp: Date.now(),
    });
    const agreementHash = crypto.createHash('sha256').update(agreementContent).digest('hex');

    // Create staking agreement
    const { data: agreement, error } = await supabase
      .from('staking_agreements')
      .insert({
        staker_user_id: user?.id || null,
        staker_handcash: stakerHandcash,
        staker_name: stakerName,
        staker_email: stakerEmail,
        project_slug: projectSlug,
        token_symbol: tokenSymbol,
        stake_amount: stakeAmount,
        stake_value_usd: stakeValueUsd,
        lock_period_days: lockPeriodDays || 0,
        unlock_date: unlockDate,
        reward_rate_percent: rewardRatePercent || 0,
        agreement_hash: agreementHash,
        status: 'active',
        signed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating staking agreement:', error);
      return NextResponse.json({ error: 'Failed to create agreement' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      agreement,
      agreementHash,
      message: `Staked ${stakeAmount} ${tokenSymbol} tokens`,
    });
  } catch (error: any) {
    console.error('Staking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get staking agreements
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const handcash = searchParams.get('handcash');
    const projectSlug = searchParams.get('project');
    const tokenSymbol = searchParams.get('token');

    let query = supabase
      .from('staking_agreements')
      .select('*')
      .order('created_at', { ascending: false });

    if (handcash) {
      query = query.eq('staker_handcash', handcash);
    }
    if (projectSlug) {
      query = query.eq('project_slug', projectSlug);
    }
    if (tokenSymbol) {
      query = query.eq('token_symbol', tokenSymbol);
    }

    const { data: agreements, error } = await query;

    if (error) {
      console.error('Error fetching agreements:', error);
      return NextResponse.json({ error: 'Failed to fetch agreements' }, { status: 500 });
    }

    // Calculate totals
    const totalStaked = agreements?.reduce((sum, a) => sum + Number(a.stake_amount), 0) || 0;
    const totalRewards = agreements?.reduce((sum, a) => sum + Number(a.rewards_earned), 0) || 0;

    return NextResponse.json({
      success: true,
      agreements: agreements || [],
      totals: {
        staked: totalStaked,
        rewards: totalRewards,
        count: agreements?.length || 0,
      },
    });
  } catch (error: any) {
    console.error('Get staking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Unstake tokens
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const agreementId = searchParams.get('id');

    if (!agreementId) {
      return NextResponse.json({ error: 'Agreement ID required' }, { status: 400 });
    }

    // Get the agreement
    const { data: agreement, error: fetchError } = await supabase
      .from('staking_agreements')
      .select('*')
      .eq('id', agreementId)
      .single();

    if (fetchError || !agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });
    }

    // Check if locked
    if (agreement.unlock_date && new Date(agreement.unlock_date) > new Date()) {
      return NextResponse.json({
        error: 'Tokens are still locked',
        unlockDate: agreement.unlock_date,
      }, { status: 400 });
    }

    // Update agreement status
    const { error: updateError } = await supabase
      .from('staking_agreements')
      .update({
        status: 'unstaked',
        unstaked_at: new Date().toISOString(),
      })
      .eq('id', agreementId);

    if (updateError) {
      console.error('Error unstaking:', updateError);
      return NextResponse.json({ error: 'Failed to unstake' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      tokensReturned: agreement.stake_amount,
      rewardsEarned: agreement.rewards_earned,
      message: 'Successfully unstaked tokens',
    });
  } catch (error: any) {
    console.error('Unstake error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
