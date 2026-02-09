import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { z } from 'zod';

const completeSchema = z.object({
  sessionId: z.string().min(1),
});

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY required');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
  });
}

// Token settings (would come from cap_table_settings in production)
const TOTAL_SUPPLY = 100_000_000;

/**
 * POST /api/investors/purchase/complete
 *
 * Complete a token purchase after successful payment.
 * Called from success page or webhook.
 *
 * Updates:
 * - cap_table_shareholders.token_balance
 * - cap_table_shareholders.ownership_percentage
 * - cap_table_shareholders.investment_amount
 * - cap_table_shareholders.investment_date
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = completeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid request',
        details: validation.error.errors,
      }, { status: 400 });
    }

    const { sessionId } = validation.data;

    // 1. Retrieve Stripe session
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({
        error: 'Payment not completed',
        paymentStatus: session.payment_status,
      }, { status: 400 });
    }

    // 2. Validate metadata
    const metadata = session.metadata || {};
    if (metadata.type !== 'investor_purchase') {
      return NextResponse.json({
        error: 'Invalid session type',
      }, { status: 400 });
    }

    const investorId = metadata.investor_id;
    const vaultAddress = metadata.vault_address;
    const tokenAmount = parseInt(metadata.token_amount || '0', 10);
    const usdAmount = parseFloat(metadata.usd_amount || '0');

    if (!investorId || !vaultAddress || !tokenAmount) {
      return NextResponse.json({
        error: 'Missing purchase metadata',
      }, { status: 400 });
    }

    // 3. Check if already processed (idempotency)
    const supabase = await createClient();

    // Check for existing transaction with this session ID
    const { data: existingTx } = await supabase
      .from('token_transactions')
      .select('id')
      .eq('transaction_hash', sessionId)
      .single();

    if (existingTx) {
      return NextResponse.json({
        success: true,
        message: 'Purchase already processed',
        alreadyProcessed: true,
      });
    }

    // 4. Get current shareholder data
    const { data: shareholder, error: fetchError } = await supabase
      .from('cap_table_shareholders')
      .select('*')
      .eq('id', investorId)
      .single();

    if (fetchError || !shareholder) {
      return NextResponse.json({
        error: 'Investor not found',
      }, { status: 404 });
    }

    // 5. Calculate new balances
    const currentBalance = parseFloat(shareholder.token_balance || '0');
    const newBalance = currentBalance + tokenAmount;
    const newOwnershipPercentage = (newBalance / TOTAL_SUPPLY) * 100;

    const currentInvestment = parseFloat(shareholder.investment_amount || '0');
    const newInvestmentAmount = currentInvestment + usdAmount;

    // 6. Update shareholder record
    const { error: updateError } = await supabase
      .from('cap_table_shareholders')
      .update({
        token_balance: newBalance,
        ownership_percentage: newOwnershipPercentage,
        investment_amount: newInvestmentAmount,
        investment_currency: 'USD',
        investment_date: shareholder.investment_date || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', investorId);

    if (updateError) {
      console.error('[purchase/complete] Update shareholder error:', updateError);
      return NextResponse.json({
        error: 'Failed to update shareholder record',
        message: updateError.message,
      }, { status: 500 });
    }

    // 7. Create transaction record
    const { error: txError } = await supabase
      .from('token_transactions')
      .insert({
        transaction_hash: sessionId, // Use Stripe session ID as unique identifier
        transaction_type: 'purchase',
        from_address: 'platform', // From platform reserve
        to_address: vaultAddress,
        to_shareholder_id: investorId,
        amount: tokenAmount,
        block_timestamp: new Date().toISOString(),
        notes: `Token purchase via Stripe. Session: ${sessionId}`,
      });

    if (txError) {
      console.error('[purchase/complete] Create transaction error:', txError);
      // Don't fail - shareholder already updated
    }

    return NextResponse.json({
      success: true,
      purchase: {
        tokenAmount,
        usdAmount,
        newBalance,
        ownershipPercentage: newOwnershipPercentage.toFixed(4),
        transactionId: sessionId,
      },
      message: `Successfully purchased ${tokenAmount.toLocaleString()} tokens`,
    });
  } catch (error) {
    console.error('[purchase/complete] Error:', error);
    return NextResponse.json({
      error: 'Failed to complete purchase',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * GET /api/investors/purchase/complete?session_id=xxx
 *
 * Check purchase status by session ID
 */
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({
        error: 'session_id parameter required',
      }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      sessionId,
      paymentStatus: session.payment_status,
      status: session.status,
      metadata: session.metadata,
      amountTotal: session.amount_total ? session.amount_total / 100 : null,
      currency: session.currency,
    });
  } catch (error) {
    console.error('[purchase/complete] GET Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch purchase status',
    }, { status: 500 });
  }
}
