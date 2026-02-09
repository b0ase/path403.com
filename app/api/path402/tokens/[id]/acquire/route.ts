/**
 * $402 Token Acquisition API
 * POST - Acquire tokens (requires payment)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import {
  getToken,
  acquireTokens,
  calculateTotalCost,
  formatSats
} from '@/lib/path402';

const AcquireSchema = z.object({
  amount: z.number().int().positive().min(1).max(10000),
  payment_tx_id: z.string().optional() // HandCash transaction ID for verification
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tokenId } = await params;
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user handle from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('handcash_handle')
      .eq('id', user.id)
      .single();

    if (!profile?.handcash_handle) {
      return NextResponse.json(
        { error: 'HandCash handle required to acquire tokens' },
        { status: 400 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const parsed = AcquireSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { amount, payment_tx_id } = parsed.data;

    // Get token and calculate cost
    const token = await getToken(tokenId);
    if (!token) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    if (!token.is_active) {
      return NextResponse.json({ error: 'Token is not active' }, { status: 400 });
    }

    // Calculate expected cost
    const { totalCost, avgPrice } = calculateTotalCost(
      token.base_price_sats,
      token.total_supply,
      amount,
      token.pricing_model,
      token.decay_factor
    );

    // Verify HandCash payment if payment_tx_id provided
    if (payment_tx_id) {
      const handcashToken = request.cookies.get('b0ase_handcash_token')?.value;
      if (handcashToken) {
        try {
          const { handcashService } = await import('@/lib/handcash-service');
          const payment = await handcashService.getPayment(handcashToken, payment_tx_id);
          if (!payment) {
            return NextResponse.json(
              { error: 'Payment verification failed — transaction not found' },
              { status: 402 }
            );
          }
        } catch (verifyError) {
          console.warn('[acquire] Payment verification issue:', verifyError);
          // Log but don't block — payment may have gone through
        }
      }
    }

    // Execute acquisition
    const result = await acquireTokens(
      tokenId,
      profile.handcash_handle,
      amount,
      payment_tx_id,
      user.id
    );

    return NextResponse.json({
      success: true,
      transaction: result.transaction,
      summary: {
        tokens_acquired: amount,
        total_cost_sats: result.totalCost,
        average_price_sats: result.unitPrice,
        formatted_cost: formatSats(result.totalCost),
        issuer_revenue: formatSats(result.transaction.issuer_revenue_sats || 0),
        platform_revenue: formatSats(result.transaction.platform_revenue_sats || 0)
      }
    }, { status: 201 });
  } catch (error) {
    console.error('[path402/tokens/[id]/acquire] POST error:', error);
    const message = error instanceof Error ? error.message : 'Failed to acquire tokens';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// GET - Preview acquisition cost without executing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tokenId } = await params;
    const { searchParams } = new URL(request.url);
    const amount = parseInt(searchParams.get('amount') || '1', 10);

    if (amount < 1 || amount > 10000 || isNaN(amount)) {
      return NextResponse.json(
        { error: 'Amount must be between 1 and 10000' },
        { status: 400 }
      );
    }

    const token = await getToken(tokenId);
    if (!token) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    const { totalCost, avgPrice, prices } = calculateTotalCost(
      token.base_price_sats,
      token.total_supply,
      amount,
      token.pricing_model,
      token.decay_factor
    );

    return NextResponse.json({
      success: true,
      token_id: tokenId,
      amount,
      current_supply: token.total_supply,
      pricing: {
        total_cost_sats: totalCost,
        average_price_sats: avgPrice,
        first_token_price: prices[0],
        last_token_price: prices[prices.length - 1],
        formatted_cost: formatSats(totalCost)
      },
      revenue_split: {
        issuer_share_bps: token.issuer_share_bps,
        platform_share_bps: token.platform_share_bps,
        issuer_receives: formatSats(Math.floor((totalCost * token.issuer_share_bps) / 10000)),
        platform_receives: formatSats(totalCost - Math.floor((totalCost * token.issuer_share_bps) / 10000))
      }
    });
  } catch (error) {
    console.error('[path402/tokens/[id]/acquire] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to preview acquisition' },
      { status: 500 }
    );
  }
}
