/**
 * GET /api/user/token-portfolio
 *
 * Returns user's complete token portfolio including:
 * - Tokens held in account
 * - Tokens staked/registered with KYC
 * - Tokens withdrawn as bearer certificates
 *
 * Used by user account page to show token holdings breakdown
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/investors/auth';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication
    const authContext = await getAuthenticatedUser();
    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { unifiedUser } = authContext;
    const supabase = await createClient();

    // 2. Fetch user's token balances (only tokens they own)
    const { data: tokenBalances, error: balancesError } = await supabase
      .from('user_token_balances')
      .select(`
        *,
        venture_token:token_id (
          id,
          ticker,
          name,
          description,
          price_usd,
          blockchain,
          is_deployed,
          portfolio_slug
        )
      `)
      .eq('user_id', unifiedUser.id)
      .gt('balance', 0);

    if (balancesError) {
      console.error('[token-portfolio] Error fetching balances:', balancesError);
      return NextResponse.json(
        { error: 'Failed to fetch token balances' },
        { status: 500 }
      );
    }

    // 3. For each token, fetch member registry (staked/KYC registered amounts)
    const tokenPortfolio = await Promise.all(
      (tokenBalances || []).map(async (balance) => {
        const { data: registrations } = await supabase
          .from('token_member_registry')
          .select('allocation_tokens, status')
          .eq('token_symbol', balance.venture_token?.ticker || '')
          .eq('user_id', unifiedUser.id);

        const stakedTokens = registrations?.reduce(
          (sum, reg) => sum + (reg.allocation_tokens || 0),
          0
        ) || 0;

        return {
          tokenId: balance.token_id,
          ticker: balance.venture_token?.ticker,
          name: balance.venture_token?.name,
          description: balance.venture_token?.description,
          blockchain: balance.venture_token?.blockchain,
          isDeployed: balance.venture_token?.is_deployed,
          priceUsd: Number(balance.venture_token?.price_usd || 0),

          // Holdings breakdown
          inAccount: Number(balance.balance || 0),
          staked: stakedTokens,
          asBearer: Number(balance.total_withdrawn || 0),
          totalOwned: Number(balance.total_purchased || 0),

          // Investment history
          totalPurchased: Number(balance.total_purchased || 0),
          totalInvestedUsd: Number(balance.total_invested_usd || 0),
          averageBuyPrice: Number(balance.average_buy_price || 0),

          // Breakdown
          breakdown: {
            inAccount: Number(balance.balance || 0),
            staked: stakedTokens,
            asBearer: Number(balance.total_withdrawn || 0),
          }
        };
      })
    );

    return NextResponse.json({
      portfolio: tokenPortfolio,
      summary: {
        totalTokenTypes: tokenPortfolio.length,
        totalInAccount: tokenPortfolio.reduce((sum, t) => sum + t.inAccount, 0),
        totalStaked: tokenPortfolio.reduce((sum, t) => sum + t.staked, 0),
        totalAsBearer: tokenPortfolio.reduce((sum, t) => sum + t.asBearer, 0),
        totalUsdValue: tokenPortfolio.reduce((sum, t) => sum + (t.inAccount * t.priceUsd), 0),
      }
    });
  } catch (error) {
    console.error('[token-portfolio] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch token portfolio',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
