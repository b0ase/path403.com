import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/investors/auth';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const markSentSchema = z.object({
  purchaseId: z.string().uuid(),
  txid: z.string().optional(), // User can optionally provide for their records
});

/**
 * POST /api/investors/purchase/mark-sent
 *
 * User marks that they've sent their crypto/wire payment.
 * This notifies admin to check and confirm.
 * NO automatic verification - admin confirms manually.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const authContext = await getAuthenticatedUser();
    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { unifiedUser } = authContext;

    // 2. Validate request
    const body = await request.json();
    const validation = markSentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid request',
        details: validation.error.issues,
      }, { status: 400 });
    }

    const { purchaseId, txid } = validation.data;

    const supabase = await createClient();

    // 3. Get the purchase (must belong to this user)
    const { data: purchase, error: fetchError } = await supabase
      .from('token_purchases')
      .select('*, venture_tokens(ticker, name)')
      .eq('id', purchaseId)
      .eq('user_id', unifiedUser.id)
      .single();

    if (fetchError || !purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    if (purchase.status === 'completed') {
      return NextResponse.json({
        error: 'Purchase already completed',
        tokenAmount: purchase.token_amount,
        tokenTicker: purchase.venture_tokens.ticker,
      }, { status: 400 });
    }

    if (purchase.status === 'cancelled') {
      return NextResponse.json({ error: 'Purchase was cancelled' }, { status: 400 });
    }

    // 4. Update purchase status to "confirmed" (meaning user says they sent it)
    const { error: updateError } = await supabase
      .from('token_purchases')
      .update({
        status: 'confirmed', // User confirmed they sent - awaiting admin verification
        crypto_txid: txid || purchase.crypto_txid,
        notes: `${purchase.notes || ''}\nUser marked as sent at ${new Date().toISOString()}${txid ? ` (txid: ${txid})` : ''}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', purchaseId);

    if (updateError) {
      console.error('[purchase/mark-sent] Failed to update purchase:', updateError);
      return NextResponse.json({ error: 'Failed to update purchase' }, { status: 500 });
    }

    // TODO: Send notification to admin (email, Slack, etc.)
    console.log(`[purchase/mark-sent] User ${unifiedUser.id} marked purchase ${purchaseId} as sent`);

    return NextResponse.json({
      success: true,
      message: 'Payment marked as sent. We\'ll verify and allocate your tokens shortly.',
      purchase: {
        id: purchaseId,
        status: 'confirmed',
        tokenAmount: purchase.token_amount,
        tokenTicker: purchase.venture_tokens.ticker,
        paymentMethod: purchase.payment_method,
      },
      nextSteps: [
        'We\'ll check for your payment in our treasury.',
        'Once confirmed, your tokens will be credited to your account.',
        'This usually takes a few hours for crypto, 1-2 days for wire.',
        'You\'ll receive an email when your tokens are allocated.',
      ],
    });

  } catch (error) {
    console.error('[purchase/mark-sent] Error:', error);
    return NextResponse.json({
      error: 'Failed to mark payment as sent',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * GET /api/investors/purchase/mark-sent
 *
 * Get user's pending purchases
 */
export async function GET(request: NextRequest) {
  try {
    const authContext = await getAuthenticatedUser();
    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { unifiedUser } = authContext;
    const { searchParams } = new URL(request.url);
    const purchaseId = searchParams.get('purchaseId');

    const supabase = await createClient();

    if (purchaseId) {
      // Get specific purchase
      const { data: purchase, error } = await supabase
        .from('token_purchases')
        .select('*, venture_tokens(ticker, name)')
        .eq('id', purchaseId)
        .eq('user_id', unifiedUser.id)
        .single();

      if (error || !purchase) {
        return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
      }

      return NextResponse.json({ purchase });
    }

    // Get all user's purchases
    const { data: purchases, error } = await supabase
      .from('token_purchases')
      .select('*, venture_tokens(ticker, name)')
      .eq('user_id', unifiedUser.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[purchase/mark-sent] Failed to fetch purchases:', error);
      return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 });
    }

    return NextResponse.json({
      purchases: purchases || [],
    });
  } catch (error) {
    console.error('[purchase/mark-sent] GET Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch purchases',
    }, { status: 500 });
  }
}
