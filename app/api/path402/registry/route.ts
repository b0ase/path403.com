/**
 * $402 Registry API - Public Cap Table
 *
 * GET - List all registered members and their holdings of equity-class tokens
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);

    const token = searchParams.get('token'); // Filter by specific token
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query for registered holdings of dividend/voting tokens
    let query = supabase
      .from('path402_holdings')
      .select(`
        id,
        user_handle,
        position,
        quantity,
        acquired_at,
        serving_revenue_sats,
        token:path402_tokens!inner (
          id,
          dollar_address,
          title,
          confers_dividends,
          confers_voting
        )
      `)
      .eq('registered', true)
      .eq('withdrawn', false)
      .order('acquired_at', { ascending: true })
      .range(offset, offset + limit - 1);

    // Filter to only equity-class tokens
    query = query.or('token.confers_dividends.eq.true,token.confers_voting.eq.true');

    if (token) {
      query = query.eq('token.dollar_address', token);
    }

    const { data: holdings, error, count } = await query;

    if (error) {
      console.error('[Registry] Query error:', error);
      return NextResponse.json({ error: 'Failed to fetch registry' }, { status: 500 });
    }

    // Get dividend totals for each holding
    const holdingIds = holdings?.map(h => h.id) || [];

    let dividendTotals: Record<string, number> = {};
    if (holdingIds.length > 0) {
      const { data: dividends } = await supabase
        .from('dividend_payments')
        .select('holding_id, amount_sats')
        .in('holding_id', holdingIds)
        .eq('payment_status', 'paid');

      if (dividends) {
        dividendTotals = dividends.reduce((acc, d) => {
          acc[d.holding_id] = (acc[d.holding_id] || 0) + d.amount_sats;
          return acc;
        }, {} as Record<string, number>);
      }
    }

    // Format registry entries
    const registry = holdings?.map(h => ({
      member: h.user_handle,
      token: (h.token as any).dollar_address,
      tokenName: (h.token as any).title,
      position: h.position,
      quantity: h.quantity,
      acquiredAt: h.acquired_at,
      dividendsReceived: dividendTotals[h.id] || 0,
      servingRevenue: h.serving_revenue_sats,
      rights: {
        dividends: (h.token as any).confers_dividends,
        voting: (h.token as any).confers_voting,
      },
    })) || [];

    // Get summary stats
    const uniqueMembers = new Set(registry.map(r => r.member)).size;
    const uniqueTokens = new Set(registry.map(r => r.token)).size;
    const totalDividendsPaid = Object.values(dividendTotals).reduce((a, b) => a + b, 0);

    return NextResponse.json({
      registry,
      summary: {
        totalEntries: registry.length,
        uniqueMembers,
        uniqueTokens,
        totalDividendsPaid,
      },
      pagination: {
        limit,
        offset,
        hasMore: registry.length === limit,
      },
    });
  } catch (error) {
    console.error('[Registry] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
