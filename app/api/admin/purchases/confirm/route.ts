import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/admin';
import { z } from 'zod';

const confirmSchema = z.object({
  purchaseId: z.string().uuid(),
  cryptoTxid: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * POST /api/admin/purchases/confirm
 *
 * Confirm a pending purchase and credit tokens to user's balance.
 * Only admins can confirm purchases.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = confirmSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid request',
        details: validation.error.issues,
      }, { status: 400 });
    }

    const { purchaseId, cryptoTxid, notes } = validation.data;

    // Get the purchase
    const { data: purchase, error: purchaseError } = await supabase
      .from('token_purchases')
      .select('*')
      .eq('id', purchaseId)
      .single();

    if (purchaseError || !purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    if (purchase.status !== 'pending') {
      return NextResponse.json({
        error: `Cannot confirm purchase with status: ${purchase.status}`,
      }, { status: 400 });
    }

    // Get the venture token to update availability
    const { data: ventureToken, error: tokenError } = await supabase
      .from('venture_tokens')
      .select('*')
      .eq('id', purchase.token_id)
      .single();

    if (tokenError || !ventureToken) {
      return NextResponse.json({ error: 'Venture token not found' }, { status: 404 });
    }

    const tokenAmount = BigInt(purchase.token_amount);
    const tokensAvailable = BigInt(ventureToken.tokens_available || 0);

    if (tokenAmount > tokensAvailable) {
      return NextResponse.json({
        error: `Insufficient tokens available. Requested: ${tokenAmount}, Available: ${tokensAvailable}`,
      }, { status: 400 });
    }

    // Get admin's unified_user_id for audit trail
    const { data: adminIdentity } = await supabase
      .from('user_identities')
      .select('unified_user_id')
      .eq('provider', 'supabase')
      .eq('provider_user_id', user.id)
      .limit(1);

    const adminUnifiedId = adminIdentity?.[0]?.unified_user_id;

    // Start transaction by updating in sequence

    // 1. Update or create user token balance
    const { data: existingBalance } = await supabase
      .from('user_token_balances')
      .select('*')
      .eq('user_id', purchase.user_id)
      .eq('token_id', purchase.token_id)
      .single();

    if (existingBalance) {
      // Update existing balance
      const newBalance = BigInt(existingBalance.balance) + tokenAmount;
      const newTotalPurchased = BigInt(existingBalance.total_purchased) + tokenAmount;
      const newTotalInvested = parseFloat(existingBalance.total_invested_usd || '0') + parseFloat(purchase.usd_amount);

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
        console.error('[admin/purchases/confirm] Failed to update balance:', updateBalanceError);
        return NextResponse.json({ error: 'Failed to credit tokens' }, { status: 500 });
      }
    } else {
      // Create new balance record
      const { error: createBalanceError } = await supabase
        .from('user_token_balances')
        .insert({
          user_id: purchase.user_id,
          token_id: purchase.token_id,
          balance: tokenAmount.toString(),
          total_purchased: tokenAmount.toString(),
          total_invested_usd: parseFloat(purchase.usd_amount),
        });

      if (createBalanceError) {
        console.error('[admin/purchases/confirm] Failed to create balance:', createBalanceError);
        return NextResponse.json({ error: 'Failed to credit tokens' }, { status: 500 });
      }
    }

    // 2. Update venture token availability
    const newAvailable = tokensAvailable - tokenAmount;
    const { error: updateTokenError } = await supabase
      .from('venture_tokens')
      .update({
        tokens_available: newAvailable.toString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', ventureToken.id);

    if (updateTokenError) {
      console.error('[admin/purchases/confirm] Failed to update token availability:', updateTokenError);
      // Note: Balance was already updated - this is a partial failure
      // In production, use proper transactions
    }

    // 3. Update purchase status
    const updateData: any = {
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      confirmed_by: adminUnifiedId,
      updated_at: new Date().toISOString(),
    };

    if (cryptoTxid) {
      updateData.crypto_txid = cryptoTxid;
    }

    if (notes) {
      updateData.notes = purchase.notes
        ? `${purchase.notes}\n[Admin] ${notes}`
        : `[Admin] ${notes}`;
    }

    const { error: updatePurchaseError } = await supabase
      .from('token_purchases')
      .update(updateData)
      .eq('id', purchaseId);

    if (updatePurchaseError) {
      console.error('[admin/purchases/confirm] Failed to update purchase:', updatePurchaseError);
      return NextResponse.json({ error: 'Failed to update purchase status' }, { status: 500 });
    }

    console.log(`[admin/purchases/confirm] Purchase ${purchaseId} confirmed by admin. Credited ${tokenAmount} tokens to user ${purchase.user_id}`);

    return NextResponse.json({
      success: true,
      message: `Confirmed purchase of ${tokenAmount.toLocaleString()} tokens`,
      purchase: {
        id: purchaseId,
        status: 'confirmed',
        tokenAmount: tokenAmount.toString(),
        userId: purchase.user_id,
      },
    });
  } catch (error) {
    console.error('[admin/purchases/confirm] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
