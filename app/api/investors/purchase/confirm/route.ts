import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/investors/auth';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { isAdmin } from '@/lib/auth/admin';

const confirmSchema = z.object({
  purchaseId: z.string().uuid(),
  txid: z.string().optional(), // Optional - admin can record if they want
  notes: z.string().optional(),
});

/**
 * POST /api/investors/purchase/confirm
 *
 * Admin endpoint to confirm a pending purchase and credit tokens.
 * Used for wire transfers and crypto payments.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication - must be admin
    const authContext = await getAuthenticatedUser();
    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { unifiedUser } = authContext;

    // 2. Authorization - admin only
    const userIsAdmin = await isAdmin(unifiedUser.id);
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // 3. Validate request
    const body = await request.json();
    const validation = confirmSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid request',
        details: validation.error.issues,
      }, { status: 400 });
    }

    const { purchaseId, txid, notes } = validation.data;

    const supabase = await createClient();

    // 4. Get the purchase
    const { data: purchase, error: fetchError } = await supabase
      .from('token_purchases')
      .select('*, venture_tokens(*)')
      .eq('id', purchaseId)
      .single();

    if (fetchError || !purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    if (purchase.status === 'completed') {
      return NextResponse.json({ error: 'Purchase already completed' }, { status: 400 });
    }

    if (purchase.status === 'cancelled') {
      return NextResponse.json({ error: 'Purchase was cancelled' }, { status: 400 });
    }

    // 5. Update purchase status
    const { error: updateError } = await supabase
      .from('token_purchases')
      .update({
        status: 'completed',
        confirmed_at: new Date().toISOString(),
        confirmed_by: unifiedUser.id,
        crypto_txid: txid || purchase.crypto_txid,
        notes: notes ? `${purchase.notes || ''}\n${notes}` : purchase.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', purchaseId);

    if (updateError) {
      console.error('[purchase/confirm] Failed to update purchase:', updateError);
      return NextResponse.json({ error: 'Failed to update purchase' }, { status: 500 });
    }

    // 6. Credit user's token balance
    const { data: existingBalance, error: balanceError } = await supabase
      .from('user_token_balances')
      .select('*')
      .eq('user_id', purchase.user_id)
      .eq('token_id', purchase.token_id)
      .single();

    if (balanceError && balanceError.code !== 'PGRST116') {
      // PGRST116 = not found, which is fine
      console.error('[purchase/confirm] Error checking balance:', balanceError);
    }

    if (existingBalance) {
      // Update existing balance
      const newBalance = BigInt(existingBalance.balance) + BigInt(purchase.token_amount);
      const newTotalPurchased = BigInt(existingBalance.total_purchased) + BigInt(purchase.token_amount);
      const newTotalInvested = parseFloat(existingBalance.total_invested_usd) + parseFloat(purchase.usd_amount);

      const { error: updateBalanceError } = await supabase
        .from('user_token_balances')
        .update({
          balance: newBalance.toString(),
          total_purchased: newTotalPurchased.toString(),
          total_invested_usd: newTotalInvested,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingBalance.id);

      if (updateBalanceError) {
        console.error('[purchase/confirm] Failed to update balance:', updateBalanceError);
        return NextResponse.json({ error: 'Failed to credit tokens' }, { status: 500 });
      }
    } else {
      // Create new balance record
      const { error: insertBalanceError } = await supabase
        .from('user_token_balances')
        .insert({
          user_id: purchase.user_id,
          token_id: purchase.token_id,
          balance: purchase.token_amount,
          total_purchased: purchase.token_amount,
          total_invested_usd: purchase.usd_amount,
        });

      if (insertBalanceError) {
        console.error('[purchase/confirm] Failed to create balance:', insertBalanceError);
        return NextResponse.json({ error: 'Failed to credit tokens' }, { status: 500 });
      }
    }

    // 7. Update venture token stats
    const ventureToken = purchase.venture_tokens;
    const newTokensSold = BigInt(ventureToken.tokens_sold) + BigInt(purchase.token_amount);
    const newTokensAvailable = BigInt(ventureToken.tokens_available) - BigInt(purchase.token_amount);
    const newTreasuryBalance = parseFloat(ventureToken.treasury_balance) + parseFloat(purchase.usd_amount);

    await supabase
      .from('venture_tokens')
      .update({
        tokens_sold: newTokensSold.toString(),
        tokens_available: newTokensAvailable.toString(),
        treasury_balance: newTreasuryBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', purchase.token_id);

    // 8. Handle $bWriter token on-chain distribution
    if (ventureToken.ticker === '$bWriter' && process.env.BWRITER_TREASURY_PRIVATE_KEY) {
      try {
        // Get user's wallet address from profile
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('bsv_address')
          .eq('id', purchase.user_id)
          .single();

        if (!profileError && userProfile?.bsv_address) {
          // TODO: Implement $bWriter token on-chain distribution via HandCash
          // When BWRITER_TREASURY_PRIVATE_KEY is available:
          // 1. Sign transaction from treasury address
          // 2. Transfer tokens to user's BSV address
          // 3. Record inscription on-chain
          console.log(`[purchase/confirm] $bWriter distribution queued for user ${purchase.user_id} to address ${userProfile.bsv_address}`);
        }
      } catch (onChainError) {
        console.error('[purchase/confirm] $bWriter on-chain distribution error:', onChainError);
        // Don't fail the purchase - tokens are already credited in DB
      }
    }

    return NextResponse.json({
      success: true,
      message: `Confirmed ${purchase.token_amount} $${ventureToken.ticker} tokens for user`,
      purchase: {
        id: purchaseId,
        tokenAmount: purchase.token_amount,
        tokenTicker: ventureToken.ticker,
        usdAmount: purchase.usd_amount,
        confirmedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('[purchase/confirm] Error:', error);
    return NextResponse.json({
      error: 'Failed to confirm purchase',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * GET /api/investors/purchase/confirm
 *
 * Get pending purchases awaiting confirmation (admin view)
 */
export async function GET(request: NextRequest) {
  try {
    const authContext = await getAuthenticatedUser();
    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const userIsAdmin = await isAdmin(authContext.unifiedUser.id);
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const supabase = await createClient();

    const { data: purchases, error } = await supabase
      .from('token_purchases')
      .select('*, venture_tokens(ticker, name)')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[purchase/confirm] Failed to fetch purchases:', error);
      return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 });
    }

    return NextResponse.json({
      purchases: purchases || [],
      count: purchases?.length || 0,
    });
  } catch (error) {
    console.error('[purchase/confirm] GET Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch pending purchases',
    }, { status: 500 });
  }
}
