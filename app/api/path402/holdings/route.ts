/**
 * $402 Holdings API
 * GET - Get user's token holdings
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserHoldings, getUserTransactions, formatSats } from '@/lib/path402';

export async function GET(request: NextRequest) {
  try {
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
      return NextResponse.json({
        success: true,
        holdings: [],
        total_value_sats: 0,
        formatted_value: '0 sats'
      });
    }

    const handle = profile.handcash_handle;

    // Get holdings
    const holdings = await getUserHoldings(handle);

    // Calculate total value
    const totalValueSats = holdings.reduce((sum, h) => sum + h.current_value_sats, 0);
    const totalSpentSats = holdings.reduce((sum, h) => sum + h.total_spent_sats, 0);

    // Get recent transactions
    const { searchParams } = new URL(request.url);
    const includeHistory = searchParams.get('include_history') === 'true';
    const transactions = includeHistory ? await getUserTransactions(handle, 20) : [];

    return NextResponse.json({
      success: true,
      holder: handle,
      holdings: holdings.map(h => ({
        token_id: h.token_id,
        token_name: h.token?.name || h.token_id,
        token_description: h.token?.description,
        content_type: h.token?.content_type,
        access_url: h.token?.access_url,
        balance: h.balance,
        total_acquired: h.total_acquired,
        total_spent_sats: h.total_spent_sats,
        current_value_sats: h.current_value_sats,
        formatted_value: formatSats(h.current_value_sats),
        first_acquired: h.first_acquired_at,
        last_acquired: h.last_acquired_at
      })),
      summary: {
        total_tokens: holdings.length,
        total_balance: holdings.reduce((sum, h) => sum + h.balance, 0),
        total_value_sats: totalValueSats,
        total_spent_sats: totalSpentSats,
        formatted_value: formatSats(totalValueSats),
        formatted_spent: formatSats(totalSpentSats)
      },
      recent_transactions: includeHistory ? transactions : undefined
    });
  } catch (error) {
    console.error('[path402/holdings] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to get holdings' },
      { status: 500 }
    );
  }
}
