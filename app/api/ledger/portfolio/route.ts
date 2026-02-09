/**
 * GET /api/ledger/portfolio
 *
 * Get user's token portfolio with balances and values.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ledger } from '@/lib/ledger-payments';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    // Get user from session or query param
    const session = await getServerSession();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Get portfolio
    const portfolio = await ledger.getPortfolio(userId);

    return NextResponse.json({
      success: true,
      portfolio: {
        userId: portfolio.userId,
        totalValueUsd: portfolio.totalValueUsd,
        totalValueGbp: portfolio.totalValueGbp,
        lastUpdated: portfolio.lastUpdated,
        holdings: portfolio.balances.map((b) => ({
          ticker: b.ticker,
          balance: b.balance.toString(),
          availableBalance: b.availableBalance.toString(),
          totalPurchased: b.totalPurchased.toString(),
          totalReceived: b.totalReceived.toString(),
          totalSent: b.totalSent.toString(),
          averageBuyPrice: b.averageBuyPrice,
          totalInvestedUsd: b.totalInvestedUsd,
        })),
      },
    });
  } catch (error: any) {
    console.error('[Portfolio Error]', error);

    return NextResponse.json(
      {
        error: error.message || 'Failed to get portfolio',
        code: error.code || 'PORTFOLIO_ERROR',
      },
      { status: 500 }
    );
  }
}
