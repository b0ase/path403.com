import { NextRequest, NextResponse } from 'next/server';
import { getHolder, stakeTokens, unstakeTokens } from '@/lib/store';
import { supabase, isDbConnected } from '@/lib/supabase';
import { verifySignatureOwnership, SIGN_MESSAGES } from '@/lib/address-derivation';

// GET /api/stake - Get staking info and message to sign
export async function GET(request: NextRequest) {
  const handle = request.headers.get('x-wallet-handle');

  if (!handle) {
    return NextResponse.json({ error: 'Handle required' }, { status: 400 });
  }

  const holder = await getHolder(undefined, handle);
  if (!holder) {
    return NextResponse.json({ error: 'No tokens held' }, { status: 400 });
  }

  // Check if user has a wallet
  let walletAddress: string | null = null;
  if (isDbConnected() && supabase) {
    const { data: wallet } = await supabase
      .from('user_wallets')
      .select('address')
      .eq('handle', handle)
      .single();
    walletAddress = wallet?.address || null;
  }

  // Get active stakes
  let activeStakes: Array<{ id: string; amount: number; stakedAt: string }> = [];
  if (isDbConnected() && supabase && walletAddress) {
    const { data: wallet } = await supabase
      .from('user_wallets')
      .select('id')
      .eq('handle', handle)
      .single();

    if (wallet) {
      const { data: stakes } = await supabase
        .from('stakes')
        .select('id, amount, staked_at')
        .eq('wallet_id', wallet.id)
        .eq('status', 'active');

      activeStakes = (stakes || []).map(s => ({
        id: s.id,
        amount: s.amount,
        stakedAt: s.staked_at,
      }));
    }
  }

  const availableBalance = holder.balance - holder.stakedBalance;

  return NextResponse.json({
    balance: holder.balance,
    stakedBalance: holder.stakedBalance,
    availableBalance,
    walletAddress,
    activeStakes,
    stakingRequirements: {
      signature: true,
      kyc: true,
      kycFields: ['name', 'email', 'jurisdiction'],
    },
    benefits: [
      'Dividends from facilitator revenue',
      'Voting rights on protocol decisions',
      'Listing on public cap table',
    ],
  });
}

// POST /api/stake - Stake or unstake tokens
export async function POST(request: NextRequest) {
  try {
    const handle = request.headers.get('x-wallet-handle');
    const provider = request.headers.get('x-wallet-provider');

    if (!handle || provider !== 'handcash') {
      return NextResponse.json({ error: 'HandCash connection required' }, { status: 401 });
    }

    const holder = await getHolder(undefined, handle);
    if (!holder) {
      return NextResponse.json({ error: 'No tokens held' }, { status: 401 });
    }

    const body = await request.json();
    const { action, amount, signature, timestamp, kyc } = body;

    if (!action || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid action or amount' }, { status: 400 });
    }

    // Get user's wallet
    if (!isDbConnected() || !supabase) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    const { data: wallet } = await supabase
      .from('user_wallets')
      .select('id, address')
      .eq('handle', handle)
      .single();

    if (!wallet) {
      return NextResponse.json({
        error: 'Wallet not found',
        details: 'Derive your ordinals address first.',
      }, { status: 404 });
    }

    if (action === 'stake') {
      // Check balance
      const availableBalance = holder.balance - holder.stakedBalance;
      if (amount > availableBalance) {
        return NextResponse.json({
          error: 'Insufficient available balance',
          availableBalance,
        }, { status: 400 });
      }

      // Require signature
      if (!signature) {
        const ts = timestamp || new Date().toISOString();
        return NextResponse.json({
          error: 'Signature required',
          message: SIGN_MESSAGES.stake(amount, ts),
          timestamp: ts,
          kycRequired: true,
          kycFields: ['name', 'email', 'jurisdiction'],
        }, { status: 400 });
      }

      // Verify signature
      if (!verifySignatureOwnership(signature, handle, wallet.address)) {
        return NextResponse.json({
          error: 'Invalid signature',
          details: 'The signature does not match your wallet.',
        }, { status: 403 });
      }

      // Require KYC
      if (!kyc || !kyc.name || !kyc.email || !kyc.jurisdiction) {
        return NextResponse.json({
          error: 'KYC required',
          details: 'Staking requires name, email, and jurisdiction.',
          kycFields: ['name', 'email', 'jurisdiction'],
        }, { status: 400 });
      }

      // Create stake record
      const { data: stake, error: stakeError } = await supabase
        .from('stakes')
        .insert({
          wallet_id: wallet.id,
          holder_id: holder.id,
          amount,
          stake_signature: signature,
          kyc_name: kyc.name,
          kyc_email: kyc.email,
          kyc_jurisdiction: kyc.jurisdiction,
          kyc_completed_at: new Date().toISOString(),
          status: 'active',
        })
        .select()
        .single();

      if (stakeError || !stake) {
        console.error('Stake creation failed:', stakeError);
        return NextResponse.json({ error: 'Staking failed' }, { status: 500 });
      }

      // Create cap table entry
      await supabase.from('cap_table').insert({
        wallet_id: wallet.id,
        stake_id: stake.id,
        handle,
        tokens_staked: amount,
        kyc_name: kyc.name,
        is_public: true,
      });

      // Update holder staked balance (legacy store)
      await stakeTokens(holder.id, amount);

      return NextResponse.json({
        success: true,
        stakeId: stake.id,
        stakedAmount: amount,
        newStakedBalance: holder.stakedBalance + amount,
        capTableEntry: {
          handle,
          tokensStaked: amount,
          kycName: kyc.name,
        },
        benefits: [
          'You are now earning dividends',
          'You have voting rights',
          'You are listed on the public cap table',
        ],
      });
    } else if (action === 'unstake') {
      if (amount > holder.stakedBalance) {
        return NextResponse.json({
          error: 'Insufficient staked balance',
          stakedBalance: holder.stakedBalance,
        }, { status: 400 });
      }

      // Require signature for unstaking too
      if (!signature) {
        const ts = timestamp || new Date().toISOString();
        return NextResponse.json({
          error: 'Signature required',
          message: SIGN_MESSAGES.unstake(amount, ts),
          timestamp: ts,
        }, { status: 400 });
      }

      // Verify signature
      if (!verifySignatureOwnership(signature, handle, wallet.address)) {
        return NextResponse.json({
          error: 'Invalid signature',
          details: 'The signature does not match your wallet.',
        }, { status: 403 });
      }

      // Find active stakes to unstake (LIFO - most recent first)
      const { data: activeStakes } = await supabase
        .from('stakes')
        .select('id, amount')
        .eq('wallet_id', wallet.id)
        .eq('status', 'active')
        .order('staked_at', { ascending: false });

      let remaining = amount;
      const unstaked: string[] = [];

      for (const stake of activeStakes || []) {
        if (remaining <= 0) break;

        if (stake.amount <= remaining) {
          // Fully unstake this stake
          await supabase
            .from('stakes')
            .update({
              status: 'unstaked',
              unstaked_at: new Date().toISOString(),
            })
            .eq('id', stake.id);

          remaining -= stake.amount;
          unstaked.push(stake.id);
        } else {
          // Partially unstake - reduce amount
          await supabase
            .from('stakes')
            .update({ amount: stake.amount - remaining })
            .eq('id', stake.id);

          remaining = 0;
        }
      }

      // Update legacy store
      await unstakeTokens(holder.id, amount);

      // Note: User stays on cap table until tokens change hands
      // Cap table removal happens when new owner stakes

      return NextResponse.json({
        success: true,
        unstakedAmount: amount,
        newStakedBalance: holder.stakedBalance - amount,
        note: 'You remain on the cap table until tokens are staked by a new owner.',
        suspendedRights: ['dividends', 'voting'],
      });
    }

    return NextResponse.json({ error: 'Invalid action. Use "stake" or "unstake"' }, { status: 400 });
  } catch (error) {
    console.error('Error processing stake action:', error);
    return NextResponse.json({
      error: 'Stake action failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
