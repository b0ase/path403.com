/**
 * $402 Transfers API
 *
 * GET - List user's transfers
 * POST - Request transfer to another user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - List transfers
export async function GET(req: NextRequest) {
  try {
    const userHandle = req.cookies.get('b0ase_user_handle')?.value;

    if (!userHandle) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const supabase = await createClient();

    // Get transfers where user is sender or receiver
    const { data: transfers, error } = await supabase
      .from('transfer_requests')
      .select(`
        id,
        token_id,
        from_handle,
        to_handle,
        quantity,
        status,
        requires_re_registration,
        on_chain_tx_id,
        requested_at,
        completed_at,
        token:path402_tokens!inner (
          id,
          dollar_address,
          title
        )
      `)
      .or(`from_handle.eq.${userHandle},to_handle.eq.${userHandle}`)
      .order('requested_at', { ascending: false });

    if (error) {
      console.error('[Transfers] Query error:', error);
      return NextResponse.json({ error: 'Failed to fetch transfers' }, { status: 500 });
    }

    return NextResponse.json({
      transfers: transfers?.map(t => ({
        id: t.id,
        tokenId: t.token_id,
        tokenAddress: (t.token as any).dollar_address,
        tokenName: (t.token as any).title,
        fromHandle: t.from_handle,
        toHandle: t.to_handle,
        quantity: t.quantity,
        status: t.status,
        requiresReRegistration: t.requires_re_registration,
        onChainTxId: t.on_chain_tx_id,
        requestedAt: t.requested_at,
        completedAt: t.completed_at,
        direction: t.from_handle === userHandle ? 'outgoing' : 'incoming',
      })) || [],
    });
  } catch (error) {
    console.error('[Transfers] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Request transfer
export async function POST(req: NextRequest) {
  try {
    const userHandle = req.cookies.get('b0ase_user_handle')?.value;

    if (!userHandle) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { tokenId, toHandle, quantity } = body;

    // Validate required fields
    if (!tokenId || !toHandle || !quantity) {
      return NextResponse.json({
        error: 'Missing required fields: tokenId, toHandle, quantity',
      }, { status: 400 });
    }

    if (quantity < 1) {
      return NextResponse.json({
        error: 'Quantity must be at least 1',
      }, { status: 400 });
    }

    if (toHandle === userHandle) {
      return NextResponse.json({
        error: 'Cannot transfer to yourself',
      }, { status: 400 });
    }

    const supabase = await createClient();

    // Get sender's holding
    const { data: senderHolding } = await supabase
      .from('path402_holdings')
      .select('id, quantity, registered, withdrawn')
      .eq('token_id', tokenId)
      .eq('user_handle', userHandle)
      .single();

    if (!senderHolding) {
      return NextResponse.json({ error: 'You do not hold this token' }, { status: 404 });
    }

    if (senderHolding.withdrawn) {
      return NextResponse.json({ error: 'Holding already withdrawn to chain' }, { status: 400 });
    }

    if (senderHolding.quantity < quantity) {
      return NextResponse.json({
        error: `Insufficient balance. You have ${senderHolding.quantity} tokens`,
      }, { status: 400 });
    }

    // Check for pending transfers
    const { data: pendingTransfers } = await supabase
      .from('transfer_requests')
      .select('id, quantity')
      .eq('holding_id', senderHolding.id)
      .eq('status', 'pending');

    const pendingAmount = pendingTransfers?.reduce((sum, t) => sum + t.quantity, 0) || 0;
    const availableQuantity = senderHolding.quantity - pendingAmount;

    if (quantity > availableQuantity) {
      return NextResponse.json({
        error: `Only ${availableQuantity} tokens available (${pendingAmount} pending transfer)`,
      }, { status: 400 });
    }

    // Get token info to check if it confers equity rights
    const { data: token } = await supabase
      .from('path402_tokens')
      .select('id, confers_dividends, confers_voting')
      .eq('id', tokenId)
      .single();

    // Determine if re-registration is required
    const requiresReRegistration =
      senderHolding.registered &&
      (token?.confers_dividends || token?.confers_voting);

    // Create transfer request
    const { data: transfer, error } = await supabase
      .from('transfer_requests')
      .insert({
        holding_id: senderHolding.id,
        from_handle: userHandle,
        to_handle: toHandle,
        token_id: tokenId,
        quantity,
        status: 'pending',
        requires_re_registration: requiresReRegistration,
        requested_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[Transfers] Create error:', error);
      return NextResponse.json({ error: 'Failed to create transfer request' }, { status: 500 });
    }

    // Auto-complete the transfer (in production, this might require approval)
    // Deduct from sender
    await supabase
      .from('path402_holdings')
      .update({
        quantity: senderHolding.quantity - quantity,
      })
      .eq('id', senderHolding.id);

    // Get or create receiver's holding
    const { data: receiverHolding } = await supabase
      .from('path402_holdings')
      .select('id, quantity')
      .eq('token_id', tokenId)
      .eq('user_handle', toHandle)
      .single();

    if (receiverHolding) {
      // Update existing holding
      await supabase
        .from('path402_holdings')
        .update({
          quantity: receiverHolding.quantity + quantity,
          last_acquired_at: new Date().toISOString(),
        })
        .eq('id', receiverHolding.id);
    } else {
      // Create new holding (unregistered by default)
      await supabase
        .from('path402_holdings')
        .insert({
          token_id: tokenId,
          user_handle: toHandle,
          quantity,
          total_acquired: quantity,
          total_spent_sats: 0,
          first_acquired_at: new Date().toISOString(),
          last_acquired_at: new Date().toISOString(),
          registered: false,
        });
    }

    // Mark transfer as completed
    await supabase
      .from('transfer_requests')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', transfer.id);

    return NextResponse.json({
      success: true,
      transfer: {
        id: transfer.id,
        toHandle,
        quantity,
        requiresReRegistration,
      },
      message: requiresReRegistration
        ? `${quantity} tokens transferred to ${toHandle}. Recipient must complete KYC to receive dividend/voting rights.`
        : `${quantity} tokens transferred to ${toHandle}.`,
    });
  } catch (error) {
    console.error('[Transfers] POST Error:', error);
    return NextResponse.json({ error: 'Failed to create transfer' }, { status: 500 });
  }
}
