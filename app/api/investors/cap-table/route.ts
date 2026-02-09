import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/investors/cap-table
 *
 * Get public cap table data.
 * Returns verified shareholders sorted by token balance.
 */
export async function GET(request: NextRequest) {
  try {
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20', 10);
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0', 10);

    const supabase = await createClient();

    const { data: shareholders, error } = await supabase
      .from('cap_table_shareholders')
      .select(`
        id,
        full_name,
        token_balance,
        ownership_percentage,
        kyc_status,
        investment_date,
        accredited_investor,
        shareholder_type,
        status
      `)
      .eq('status', 'active')
      .eq('kyc_status', 'approved')
      .gt('token_balance', 0)
      .order('token_balance', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[cap-table] Fetch error:', error);
      return NextResponse.json({
        error: 'Failed to fetch cap table',
        message: error.message,
      }, { status: 500 });
    }

    // Get total count
    const { count } = await supabase
      .from('cap_table_shareholders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('kyc_status', 'approved')
      .gt('token_balance', 0);

    return NextResponse.json({
      shareholders: shareholders || [],
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('[cap-table] Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch cap table',
    }, { status: 500 });
  }
}
