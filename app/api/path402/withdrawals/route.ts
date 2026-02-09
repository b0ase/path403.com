/**
 * $402 Withdrawals API
 *
 * GET - List user's withdrawals
 * POST - Request withdrawal to on-chain
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - List withdrawals
export async function GET(req: NextRequest) {
  try {
    const userHandle = req.cookies.get('b0ase_user_handle')?.value;

    if (!userHandle) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const supabase = await createClient();

    let query = supabase
      .from('withdrawals')
      .select(`
        id,
        token_id,
        quantity,
        destination_address,
        chain,
        status,
        on_chain_tx_id,
        fee_sats,
        requested_at,
        processed_at,
        notes,
        token:path402_tokens!inner (
          id,
          dollar_address,
          title
        )
      `)
      .eq('user_handle', userHandle)
      .order('requested_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: withdrawals, error } = await query;

    if (error) {
      console.error('[Withdrawals] Query error:', error);
      return NextResponse.json({ error: 'Failed to fetch withdrawals' }, { status: 500 });
    }

    return NextResponse.json({
      withdrawals: withdrawals?.map(w => ({
        id: w.id,
        tokenId: w.token_id,
        tokenAddress: (w.token as any).dollar_address,
        tokenName: (w.token as any).title,
        quantity: w.quantity,
        destinationAddress: w.destination_address,
        chain: w.chain,
        status: w.status,
        onChainTxId: w.on_chain_tx_id,
        feeSats: w.fee_sats,
        requestedAt: w.requested_at,
        processedAt: w.processed_at,
        notes: w.notes,
      })) || [],
    });
  } catch (error) {
    console.error('[Withdrawals] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Request withdrawal
export async function POST(req: NextRequest) {
  try {
    const userHandle = req.cookies.get('b0ase_user_handle')?.value;

    if (!userHandle) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { tokenId, quantity, destinationAddress, chain } = body;

    // Validate required fields
    if (!tokenId || !quantity || !destinationAddress || !chain) {
      return NextResponse.json({
        error: 'Missing required fields: tokenId, quantity, destinationAddress, chain',
      }, { status: 400 });
    }

    if (!['bsv', 'eth', 'sol'].includes(chain)) {
      return NextResponse.json({
        error: 'Invalid chain. Must be: bsv, eth, or sol',
      }, { status: 400 });
    }

    if (quantity < 1) {
      return NextResponse.json({
        error: 'Quantity must be at least 1',
      }, { status: 400 });
    }

    const supabase = await createClient();

    // Check user is KYC verified
    const { data: user } = await supabase
      .from('unified_users')
      .select('id, kyc_status')
      .eq('primary_handle', userHandle)
      .single();

    if (!user || user.kyc_status !== 'verified') {
      return NextResponse.json({
        error: 'KYC verification required for withdrawals',
        kycStatus: user?.kyc_status || 'none',
      }, { status: 403 });
    }

    // Get user's holding
    const { data: holding } = await supabase
      .from('path402_holdings')
      .select('id, quantity, registered, withdrawn')
      .eq('token_id', tokenId)
      .eq('user_handle', userHandle)
      .single();

    if (!holding) {
      return NextResponse.json({ error: 'You do not hold this token' }, { status: 404 });
    }

    if (holding.withdrawn) {
      return NextResponse.json({ error: 'Holding already withdrawn' }, { status: 400 });
    }

    if (holding.quantity < quantity) {
      return NextResponse.json({
        error: `Insufficient balance. You have ${holding.quantity} tokens`,
      }, { status: 400 });
    }

    // Check for pending withdrawals
    const { data: pendingWithdrawals } = await supabase
      .from('withdrawals')
      .select('id, quantity')
      .eq('holding_id', holding.id)
      .in('status', ['pending', 'processing']);

    const pendingAmount = pendingWithdrawals?.reduce((sum, w) => sum + w.quantity, 0) || 0;
    const availableQuantity = holding.quantity - pendingAmount;

    if (quantity > availableQuantity) {
      return NextResponse.json({
        error: `Only ${availableQuantity} tokens available (${pendingAmount} pending withdrawal)`,
      }, { status: 400 });
    }

    // Calculate withdrawal fee (0.1% or minimum 10 sats)
    const feeSats = Math.max(10, Math.floor(quantity * 0.001));

    // Create withdrawal request
    const { data: withdrawal, error } = await supabase
      .from('withdrawals')
      .insert({
        holding_id: holding.id,
        user_handle: userHandle,
        token_id: tokenId,
        quantity,
        destination_address: destinationAddress,
        chain,
        status: 'pending',
        fee_sats: feeSats,
        requested_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[Withdrawals] Create error:', error);
      return NextResponse.json({ error: 'Failed to create withdrawal request' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      withdrawal: {
        id: withdrawal.id,
        quantity,
        destinationAddress,
        chain,
        feeSats,
        status: 'pending',
      },
      message: `Withdrawal request created. ${quantity} tokens will be sent to ${destinationAddress} on ${chain.toUpperCase()}`,
    });
  } catch (error) {
    console.error('[Withdrawals] POST Error:', error);
    return NextResponse.json({ error: 'Failed to create withdrawal' }, { status: 500 });
  }
}
