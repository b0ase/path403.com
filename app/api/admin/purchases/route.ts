import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/admin';

/**
 * GET /api/admin/purchases
 *
 * List all token purchases for admin review.
 * Query params:
 * - status: Filter by status (pending, confirmed, completed, cancelled)
 * - limit: Number of results (default 50)
 * - offset: Pagination offset
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '50', 10));
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build query with joins
    let query = supabase
      .from('token_purchases')
      .select(`
        id,
        user_id,
        token_id,
        token_amount,
        usd_amount,
        price_per_token,
        payment_method,
        payment_currency,
        payment_amount,
        stripe_session_id,
        stripe_payment_id,
        crypto_address,
        crypto_txid,
        status,
        confirmed_at,
        confirmed_by,
        notes,
        created_at,
        updated_at,
        venture_tokens (
          ticker,
          name
        ),
        unified_users (
          display_name,
          primary_email
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    const { data: purchases, error } = await query;

    if (error) {
      console.error('[admin/purchases] Query error:', error);
      return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 });
    }

    // Transform for response
    const transformedPurchases = (purchases || []).map((p: any) => ({
      id: p.id,
      user_id: p.user_id,
      user_email: p.unified_users?.primary_email,
      user_name: p.unified_users?.display_name,
      token_ticker: p.venture_tokens?.ticker,
      token_name: p.venture_tokens?.name,
      token_amount: p.token_amount?.toString(),
      usd_amount: p.usd_amount?.toString(),
      price_per_token: p.price_per_token?.toString(),
      payment_method: p.payment_method,
      payment_currency: p.payment_currency,
      payment_amount: p.payment_amount?.toString(),
      stripe_session_id: p.stripe_session_id,
      crypto_address: p.crypto_address,
      crypto_txid: p.crypto_txid,
      status: p.status,
      confirmed_at: p.confirmed_at,
      notes: p.notes,
      created_at: p.created_at,
    }));

    return NextResponse.json({
      purchases: transformedPurchases,
      total: transformedPurchases.length,
    });
  } catch (error) {
    console.error('[admin/purchases] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
