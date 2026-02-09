import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Token settings
const TOTAL_SUPPLY = 100_000_000;
const TOKEN_PRICE_USD = 0.024;

/**
 * GET /api/investors/cap-table/stats
 *
 * Get aggregate cap table statistics.
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get verified investor count
    const { count: verifiedCount } = await supabase
      .from('cap_table_shareholders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('kyc_status', 'approved');

    // Get total investment amount
    const { data: investmentData } = await supabase
      .from('cap_table_shareholders')
      .select('investment_amount')
      .eq('status', 'active')
      .eq('kyc_status', 'approved')
      .not('investment_amount', 'is', null);

    const totalRaised = (investmentData || []).reduce((sum, row) => {
      return sum + parseFloat(row.investment_amount || '0');
    }, 0);

    // Get total tokens allocated
    const { data: tokenData } = await supabase
      .from('cap_table_shareholders')
      .select('token_balance')
      .eq('status', 'active')
      .gt('token_balance', 0);

    const totalAllocated = (tokenData || []).reduce((sum, row) => {
      return sum + parseFloat(row.token_balance || '0');
    }, 0);

    // Get cap_table_settings if available
    const { data: settings } = await supabase
      .from('cap_table_settings')
      .select('total_supply, circulating_supply, last_valuation')
      .limit(1)
      .single();

    return NextResponse.json({
      totalRaised,
      verifiedInvestors: verifiedCount || 0,
      totalSupply: settings?.total_supply ? parseFloat(settings.total_supply) : TOTAL_SUPPLY,
      circulatingSupply: settings?.circulating_supply ? parseFloat(settings.circulating_supply) : totalAllocated,
      currentPrice: TOKEN_PRICE_USD,
      lastValuation: settings?.last_valuation ? parseFloat(settings.last_valuation) : totalRaised,
      totalAllocated,
      allocationPercentage: ((totalAllocated / TOTAL_SUPPLY) * 100).toFixed(2),
    });
  } catch (error) {
    console.error('[cap-table/stats] Error:', error);
    return NextResponse.json({
      totalRaised: 0,
      verifiedInvestors: 0,
      totalSupply: TOTAL_SUPPLY,
      currentPrice: TOKEN_PRICE_USD,
    });
  }
}
