/**
 * $402 Dividend Process API
 *
 * POST - Process pending dividend payments (issuer only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: distributionId } = await params;
    const userHandle = req.cookies.get('b0ase_user_handle')?.value;

    if (!userHandle) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const supabase = await createClient();

    // Get distribution with token info
    const { data: distribution } = await supabase
      .from('dividend_distributions')
      .select(`
        id,
        token_id,
        status,
        initiated_by,
        token:path402_tokens!inner (
          issuer_handle
        )
      `)
      .eq('id', distributionId)
      .single();

    if (!distribution) {
      return NextResponse.json({ error: 'Distribution not found' }, { status: 404 });
    }

    if ((distribution.token as any).issuer_handle !== userHandle) {
      return NextResponse.json({ error: 'Only token issuer can process distributions' }, { status: 403 });
    }

    if (distribution.status !== 'pending') {
      return NextResponse.json({
        error: `Distribution already ${distribution.status}`,
        status: distribution.status,
      }, { status: 400 });
    }

    // Update distribution status to processing
    await supabase
      .from('dividend_distributions')
      .update({ status: 'processing' })
      .eq('id', distributionId);

    // Get pending payments
    const { data: payments } = await supabase
      .from('dividend_payments')
      .select('id, user_handle, amount_sats')
      .eq('distribution_id', distributionId)
      .eq('payment_status', 'pending');

    if (!payments || payments.length === 0) {
      return NextResponse.json({ error: 'No pending payments found' }, { status: 400 });
    }

    // Process each payment
    // In production, this would integrate with HandCash or other payment provider
    // For now, we mark them as paid (simulating the payment)
    let processed = 0;
    let failed = 0;

    for (const payment of payments) {
      try {
        // TODO: Integrate with HandCash Pay API
        // For now, just mark as paid
        await supabase
          .from('dividend_payments')
          .update({
            payment_status: 'paid',
            paid_at: new Date().toISOString(),
            payment_tx_id: `sim_${Date.now()}_${payment.id.slice(0, 8)}`,
          })
          .eq('id', payment.id);

        processed++;
      } catch (err) {
        console.error(`[Dividends] Payment failed for ${payment.user_handle}:`, err);
        await supabase
          .from('dividend_payments')
          .update({ payment_status: 'failed' })
          .eq('id', payment.id);
        failed++;
      }
    }

    // Update distribution status
    const finalStatus = failed === 0 ? 'completed' : (processed === 0 ? 'failed' : 'completed');
    await supabase
      .from('dividend_distributions')
      .update({
        status: finalStatus,
        completed_at: new Date().toISOString(),
      })
      .eq('id', distributionId);

    return NextResponse.json({
      success: true,
      distributionId,
      status: finalStatus,
      processed,
      failed,
      total: payments.length,
      message: failed === 0
        ? `All ${processed} payments processed successfully`
        : `${processed} payments processed, ${failed} failed`,
    });
  } catch (error) {
    console.error('[Dividends] Process Error:', error);
    return NextResponse.json({ error: 'Failed to process distribution' }, { status: 500 });
  }
}
