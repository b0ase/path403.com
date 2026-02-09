/**
 * POST /api/bwriter/credit-first-token
 *
 * Credits 1 free $bWriter token to user on first HandCash auth
 * Optionally charges $0.01 immediately
 *
 * Request body:
 * {
 *   autoCharge?: boolean  // If true, also charge $0.01 via bitcoin-corp API
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   alreadyCredited: boolean,
 *   freeCredited: boolean,
 *   paidCharged: boolean,
 *   balance: number,
 *   tier001PurchasedAt: string | null,
 *   error?: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/investors/auth';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const authContext = await getAuthenticatedUser();
    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { unifiedUser } = authContext;
    const supabase = await createClient();

    // 2. Parse request body
    const body = await request.json();
    const autoCharge = body.autoCharge ?? false;

    // 3. Get or create user_bwriter_balance record
    let { data: balance, error: balanceError } = await supabase
      .from('user_bwriter_balance')
      .select('*')
      .eq('user_id', unifiedUser.id)
      .eq('platform', 'b0ase')
      .single();

    // If record doesn't exist, create one
    if (balanceError?.code === 'PGRST116') {
      const { data: newBalance, error: createError } = await supabase
        .from('user_bwriter_balance')
        .insert({
          user_id: unifiedUser.id,
          platform: 'b0ase',
          balance: 0,
          total_earned: 0,
          total_purchased: 0,
          total_withdrawn: 0,
          total_staked_ever: 0,
          first_token_credited: false,
        })
        .select()
        .single();

      if (createError) {
        console.error('[credit-first-token] Failed to create balance record:', createError);
        return NextResponse.json(
          { error: 'Failed to initialize balance' },
          { status: 500 }
        );
      }

      balance = newBalance;
    } else if (balanceError) {
      console.error('[credit-first-token] Error fetching balance:', balanceError);
      return NextResponse.json(
        { error: 'Failed to fetch balance' },
        { status: 500 }
      );
    }

    // 4. Check if user already received first token
    if (balance?.first_token_credited) {
      return NextResponse.json({
        success: true,
        alreadyCredited: true,
        balance: balance.balance || 0,
        tier001PurchasedAt: balance.tier_001_purchased_at,
      });
    }

    // 5. Credit 1 free token (always do this)
    const newBalance = (balance?.balance || 0) + 1;
    const newTotalEarned = (balance?.total_earned || 0) + 1;

    const { data: updatedBalance, error: updateError } = await supabase
      .from('user_bwriter_balance')
      .update({
        balance: newBalance,
        total_earned: newTotalEarned,
        first_token_credited: true,
        first_token_credited_at: new Date().toISOString(),
      })
      .eq('user_id', unifiedUser.id)
      .eq('platform', 'b0ase')
      .select()
      .single();

    if (updateError) {
      console.error('[credit-first-token] Failed to update balance:', updateError);
      return NextResponse.json(
        { error: 'Failed to credit token' },
        { status: 500 }
      );
    }

    let paidCharged = false;
    let chargeError: string | null = null;
    let tier001PurchasedAt: string | null = null;

    // 6. If autoCharge is true, attempt to charge $0.01
    if (autoCharge) {
      try {
        const chargeResponse = await fetch('/api/investors/purchase/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: 0.01,
            currency: 'USD',
            tokenTicker: '$bWriter',
            paymentMethod: 'handcash',
          }),
          // Pass along auth context by using internal fetch
          // Note: This is server-side so auth headers should be attached automatically
        });

        const chargeResult = await chargeResponse.json();

        if (chargeResponse.ok && chargeResult.success) {
          paidCharged = true;
          // Add 1 token for the purchase (deduct from free token balance, user gets 1 free + 1 paid = 2)
          const finalBalance = newBalance + 1;
          const finalTotalPurchased = (balance?.total_purchased || 0) + 1;

          // Update with purchased tier timestamp
          const now = new Date().toISOString();
          const { data: chargedBalance, error: chargeUpdateError } = await supabase
            .from('user_bwriter_balance')
            .update({
              balance: finalBalance,
              total_purchased: finalTotalPurchased,
              tier_001_purchased_at: now,
            })
            .eq('user_id', unifiedUser.id)
            .eq('platform', 'b0ase')
            .select()
            .single();

          if (!chargeUpdateError) {
            tier001PurchasedAt = now;
            return NextResponse.json({
              success: true,
              alreadyCredited: false,
              freeCredited: true,
              paidCharged: true,
              balance: chargedBalance.balance,
              tier001PurchasedAt: chargedBalance.tier_001_purchased_at,
            });
          }
        } else {
          // Charge failed - log but don't fail the entire request
          chargeError = chargeResult.error || 'Payment charge failed';
          console.error('[credit-first-token] Charge failed:', chargeError);
        }
      } catch (err) {
        chargeError = err instanceof Error ? err.message : 'Charge request failed';
        console.error('[credit-first-token] Charge error:', chargeError);
      }
    }

    // 7. Return response
    // If charge failed, still return success for free token but indicate charge failed
    return NextResponse.json({
      success: !chargeError, // success only if charge succeeded (if attempted)
      alreadyCredited: false,
      freeCredited: true,
      paidCharged,
      balance: updatedBalance.balance,
      tier001PurchasedAt,
      error: chargeError || undefined,
    });
  } catch (err) {
    console.error('[credit-first-token] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
