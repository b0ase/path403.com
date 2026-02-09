import { NextRequest, NextResponse } from 'next/server';
import { getHoldings, getToken, calculatePrice, PricingModel, calculateROI } from '@/lib/tokens';

/**
 * GET /api/tokens/holdings
 *
 * Get all token holdings for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const holderHandle = request.headers.get('x-wallet-handle');
    const provider = request.headers.get('x-wallet-provider');

    if (!holderHandle || !provider) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const holdings = await getHoldings(holderHandle);

    // Enrich with current values
    const enrichedHoldings = await Promise.all(
      holdings.map(async (holding) => {
        const token = await getToken(holding.token_address);
        if (!token) return null;

        const currentPrice = calculatePrice(
          token.pricing_model as PricingModel,
          token.base_price_sats,
          token.treasury_balance
        );
        const currentValue = holding.balance * currentPrice;
        const roi = calculateROI(holding.total_spent_sats, currentValue, 0);

        return {
          ...holding,
          token: {
            address: token.address,
            name: token.name,
            current_price_sats: currentPrice,
          },
          current_value_sats: currentValue,
          unrealized_pnl_sats: roi.unrealizedPnl,
          unrealized_pnl_percent: roi.unrealizedPnlPercent,
        };
      })
    );

    const validHoldings = enrichedHoldings.filter(h => h !== null);

    const totalValue = validHoldings.reduce((sum, h) => sum + (h?.current_value_sats || 0), 0);
    const totalCost = validHoldings.reduce((sum, h) => sum + (h?.total_spent_sats || 0), 0);

    return NextResponse.json({
      holdings: validHoldings,
      summary: {
        total_value_sats: totalValue,
        total_cost_sats: totalCost,
        net_pnl_sats: totalValue - totalCost,
        net_pnl_percent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
      },
    });
  } catch (error) {
    console.error('[/api/tokens/holdings GET] Error:', error);
    return NextResponse.json({ error: 'Failed to get holdings' }, { status: 500 });
  }
}
