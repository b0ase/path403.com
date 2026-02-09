import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Cron endpoint to expire pending treasury purchases
 *
 * This runs periodically (e.g., every 5 minutes) to:
 * 1. Find purchases that have expired but are still 'pending'
 * 2. Mark them as 'expired'
 * 3. Log the expiration
 */
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret for security (Vercel sets this header)
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Allow in development, require secret in production
    if (process.env.NODE_ENV === 'production' && cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Find expired pending purchases
    const { data: expiredPurchases, error: fetchError } = await supabase
      .from('treasury_purchases')
      .select('id, token_amount, recipient_address, payment_currency, created_at')
      .eq('status', 'pending')
      .lt('expires_at', new Date().toISOString());

    if (fetchError) {
      console.error('[cron/expire-purchases] Fetch error:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!expiredPurchases || expiredPurchases.length === 0) {
      return NextResponse.json({
        message: 'No expired purchases to process',
        expired: 0
      });
    }

    console.log(`[cron/expire-purchases] Expiring ${expiredPurchases.length} purchases`);

    // Update all expired purchases
    const { error: updateError } = await supabase
      .from('treasury_purchases')
      .update({ status: 'expired' })
      .eq('status', 'pending')
      .lt('expires_at', new Date().toISOString());

    if (updateError) {
      console.error('[cron/expire-purchases] Update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Log expirations
    const auditLogs = expiredPurchases.map(p => ({
      purchase_id: p.id,
      action: 'expired',
      details: {
        token_amount: p.token_amount,
        recipient: p.recipient_address,
        currency: p.payment_currency
      }
    }));

    await supabase.from('treasury_audit_log').insert(auditLogs);

    return NextResponse.json({
      message: `Expired ${expiredPurchases.length} pending purchases`,
      expired: expiredPurchases.length,
      purchases: expiredPurchases.map(p => ({
        id: p.id,
        tokenAmount: p.token_amount,
        createdAt: p.created_at
      }))
    });

  } catch (error) {
    console.error('[cron/expire-purchases] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal error'
    }, { status: 500 });
  }
}

// Also handle POST for manual triggers
export async function POST(req: NextRequest) {
  return GET(req);
}
