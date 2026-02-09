import { NextRequest, NextResponse } from 'next/server';
import { getHolder } from '@/lib/store';
import { supabase, isDbConnected } from '@/lib/supabase';
import { sendBsvPayment } from '@/lib/bsv-send';

// POST /api/stake/claim - Claim pending dividends
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

    if (!isDbConnected() || !supabase) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    // Get pending claims
    const { data: pendingClaims } = await supabase
      .from('dividend_claims')
      .select('id, claim_amount_sats')
      .eq('holder_id', holder.id)
      .eq('status', 'pending');

    if (!pendingClaims || pendingClaims.length === 0) {
      return NextResponse.json({ error: 'No pending dividends to claim' }, { status: 400 });
    }

    const totalAmount = pendingClaims.reduce((sum, c) => sum + c.claim_amount_sats, 0);

    // Get user's wallet address for payout
    const { data: wallet } = await supabase
      .from('user_wallets')
      .select('address')
      .eq('handle', handle)
      .single();

    if (!wallet) {
      return NextResponse.json({
        error: 'Wallet not found',
        details: 'Derive your ordinals address first to receive dividends.',
      }, { status: 404 });
    }

    const treasuryKey = process.env.TREASURY_PRIVATE_KEY;
    if (!treasuryKey) {
      return NextResponse.json({
        error: 'Treasury not configured',
        details: 'Missing TREASURY_PRIVATE_KEY',
      }, { status: 500 });
    }

    const payoutResult = await sendBsvPayment({
      toAddress: wallet.address,
      amountSats: totalAmount,
      privateKeyWIF: treasuryKey,
    });

    // Mark all claims as claimed
    const claimIds = pendingClaims.map(c => c.id);
    const { error: updateError } = await supabase
      .from('dividend_claims')
      .update({
        status: 'claimed',
        claimed_at: new Date().toISOString(),
        claim_tx_id: payoutResult.txId,
      })
      .in('id', claimIds);

    if (updateError) {
      console.error('Failed to update claims:', updateError);
      return NextResponse.json({ error: 'Claim failed' }, { status: 500 });
    }

    // Update holder's total dividends
    await supabase
      .from('path402_holders')
      .update({
        total_dividends: holder.totalDividends + totalAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', holder.id);

    return NextResponse.json({
      success: true,
      claimedAmount: totalAmount,
      claimCount: claimIds.length,
      destinationAddress: wallet.address,
      message: `Successfully claimed ${totalAmount.toLocaleString()} sats in dividends`,
      txId: payoutResult.txId,
      note: 'Dividends paid on-chain.',
    });
  } catch (error) {
    console.error('Error claiming dividends:', error);
    return NextResponse.json({
      error: 'Claim failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// GET /api/stake/claim - Check pending dividends
export async function GET(request: NextRequest) {
  try {
    const handle = request.headers.get('x-wallet-handle');

    if (!handle) {
      return NextResponse.json({ error: 'Handle required' }, { status: 400 });
    }

    const holder = await getHolder(undefined, handle);
    if (!holder) {
      return NextResponse.json({
        pendingAmount: 0,
        stakedBalance: 0,
        message: 'No tokens held',
      });
    }

    if (!isDbConnected() || !supabase) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    // Get pending claims
    const { data: pendingClaims } = await supabase
      .from('dividend_claims')
      .select('claim_amount_sats')
      .eq('holder_id', holder.id)
      .eq('status', 'pending');

    const pendingAmount = (pendingClaims || []).reduce(
      (sum, c) => sum + c.claim_amount_sats,
      0
    );

    return NextResponse.json({
      pendingAmount,
      stakedBalance: holder.stakedBalance,
      totalDividends: holder.totalDividends,
      canClaim: pendingAmount > 0,
    });
  } catch (error) {
    console.error('Error checking dividends:', error);
    return NextResponse.json({ error: 'Failed to check dividends' }, { status: 500 });
  }
}
