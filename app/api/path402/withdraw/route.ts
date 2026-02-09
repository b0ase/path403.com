/**
 * POST /api/path402/withdraw
 *
 * Withdraw tokens to a BSV ordinals address.
 * Executes the on-chain transfer immediately (no pending queue).
 *
 * Requires:
 * - HandCash auth (for identity)
 * - BSV ordinals destination address
 * - Token ID and amount
 *
 * Safety limits:
 * - Max 10,000 tokens per withdrawal
 * - Must have sufficient balance
 * - Token must have on-chain BSV-21 backing (bsv21_token_id set)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { handcashService } from '@/lib/handcash-service';
import { createAdminClient } from '@/lib/supabase/admin';
import { getToken } from '@/lib/path402/tokens';
import { getHolding, debitTokens } from '@/lib/path402/holdings';
import { transferTokens } from '@/lib/bsv-tokens';

const MAX_WITHDRAWAL = 10000;

const WithdrawSchema = z.object({
  token_id: z.string().min(1),
  amount: z.number().int().positive().max(MAX_WITHDRAWAL),
  destination_address: z.string().min(25).max(100) // BSV address
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate via HandCash
    const authToken = request.cookies.get('b0ase_handcash_token')?.value;
    if (!authToken) {
      return NextResponse.json(
        { error: 'HandCash authentication required' },
        { status: 401 }
      );
    }

    let userHandle: string;
    try {
      const profile = await handcashService.getUserProfile(authToken);
      userHandle = profile.handle;
    } catch {
      return NextResponse.json(
        { error: 'HandCash session expired' },
        { status: 401 }
      );
    }

    // 2. Parse and validate
    const body = await request.json();
    const parsed = WithdrawSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { token_id, amount, destination_address } = parsed.data;

    // 3. Check token exists and has on-chain backing
    const token = await getToken(token_id);
    if (!token) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    // Check on-chain tracking columns exist
    const supabase = createAdminClient();
    const { data: tokenRow } = await supabase
      .from('path402_tokens')
      .select('bsv21_token_id, current_utxo, on_chain_balance')
      .eq('token_id', token_id)
      .single();

    if (!tokenRow?.bsv21_token_id) {
      return NextResponse.json(
        { error: 'Token does not have on-chain BSV-21 backing. Withdrawal not available.' },
        { status: 400 }
      );
    }

    if (tokenRow.on_chain_balance < amount) {
      return NextResponse.json(
        { error: `Insufficient on-chain balance. Platform holds ${tokenRow.on_chain_balance} tokens on-chain.` },
        { status: 400 }
      );
    }

    // 4. Check user balance
    const holding = await getHolding(token_id, userHandle);
    if (!holding || holding.balance < amount) {
      return NextResponse.json(
        { error: `Insufficient balance. You have ${holding?.balance || 0} tokens.` },
        { status: 400 }
      );
    }

    // 5. Execute on-chain transfer
    const privateKeyWIF = process.env.BOASE_TREASURY_PRIVATE_KEY;
    const treasuryAddress = process.env.BOASE_TREASURY_ORD_ADDRESS;

    if (!privateKeyWIF || !treasuryAddress) {
      return NextResponse.json(
        { error: 'On-chain withdrawals temporarily unavailable' },
        { status: 503 }
      );
    }

    let txResult;
    try {
      txResult = await transferTokens(
        privateKeyWIF,
        tokenRow.bsv21_token_id,
        BigInt(amount),
        destination_address,
        treasuryAddress // change goes back to treasury
      );
    } catch (transferError) {
      console.error('[withdraw] On-chain transfer failed:', transferError);
      return NextResponse.json(
        { error: `On-chain transfer failed: ${transferError instanceof Error ? transferError.message : 'Unknown error'}` },
        { status: 500 }
      );
    }

    // 6. Debit user's holding
    await debitTokens(token_id, userHandle, amount);

    // 7. Update on-chain tracking
    await supabase
      .from('path402_tokens')
      .update({
        on_chain_balance: tokenRow.on_chain_balance - amount,
        current_utxo: txResult.changeOutpoint || tokenRow.current_utxo,
        updated_at: new Date().toISOString()
      })
      .eq('token_id', token_id);

    // 8. Record withdrawal transaction
    await supabase
      .from('path402_transactions')
      .insert({
        token_id,
        buyer_handle: userHandle,
        seller_handle: null,
        amount,
        price_sats: 0,
        unit_price_sats: 0,
        issuer_revenue_sats: 0,
        platform_revenue_sats: 0,
        tx_type: 'transfer',
        handcash_tx_id: null,
        metadata: {
          withdrawal: true,
          destination_address,
          on_chain_txid: txResult.txid,
          recipient_outpoint: txResult.recipientOutpoint,
          change_outpoint: txResult.changeOutpoint
        }
      });

    return NextResponse.json({
      success: true,
      withdrawal: {
        token_id,
        amount,
        destination_address,
        txid: txResult.txid,
        recipient_outpoint: txResult.recipientOutpoint,
        explorer_url: `https://whatsonchain.com/tx/${txResult.txid}`
      }
    }, { status: 200 });

  } catch (error) {
    console.error('[withdraw] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Withdrawal failed' },
      { status: 500 }
    );
  }
}
