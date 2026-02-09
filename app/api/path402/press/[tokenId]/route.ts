/**
 * POST /api/path402/press/[tokenId]
 *
 * MoneyButton press endpoint.
 * Charges $0.01 via HandCash, credits 1 token, distributes dividends.
 *
 * Requires: HandCash auth token (from cookie or header)
 *
 * GET - Preview press (show current price, supply, what you'd get)
 * POST - Execute press (charge, credit, distribute)
 */

import { NextRequest, NextResponse } from 'next/server';
import { processPress } from '@/lib/path402/press';
import { getToken } from '@/lib/path402/tokens';
import { getHolding } from '@/lib/path402/holdings';
import { calculatePrice, formatSats } from '@/lib/path402/pricing';
import { handcashService } from '@/lib/handcash-service';

/**
 * Get HandCash auth token from request.
 * Checks cookie first (set during HandCash OAuth callback),
 * then Authorization header as fallback.
 */
function getHandCashToken(request: NextRequest): string | null {
  // Cookie set by HandCash OAuth callback
  const cookieToken = request.cookies.get('b0ase_handcash_token')?.value;
  if (cookieToken) return cookieToken;

  // Authorization header fallback
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
}

/**
 * GET - Preview what a press would do
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId } = await params;

    const token = await getToken(tokenId);
    if (!token) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    const currentPrice = calculatePrice(
      token.base_price_sats,
      token.total_supply,
      token.pricing_model,
      token.decay_factor
    );

    const nextPrice = calculatePrice(
      token.base_price_sats,
      token.total_supply + 1,
      token.pricing_model,
      token.decay_factor
    );

    // Check if user is authenticated and show their balance
    const authToken = getHandCashToken(request);
    let userBalance = 0;
    let userHandle: string | null = null;

    if (authToken) {
      try {
        const profile = await handcashService.getUserProfile(authToken);
        userHandle = profile.handle;
        const holding = await getHolding(tokenId, profile.handle);
        userBalance = holding?.balance || 0;
      } catch {
        // Not authenticated or token expired — that's fine for preview
      }
    }

    return NextResponse.json({
      token_id: tokenId,
      name: token.name,
      press_price_usd: 0.01,
      current_supply: token.total_supply,
      max_supply: token.max_supply,
      tokens_remaining: token.max_supply ? token.max_supply - token.total_supply : null,
      current_price_sats: currentPrice,
      next_price_sats: nextPrice,
      formatted_price: formatSats(currentPrice),
      tokens_per_press: 1,
      revenue_split: {
        issuer_bps: token.issuer_share_bps,
        platform_bps: token.platform_share_bps
      },
      user: userHandle ? {
        handle: userHandle,
        balance: userBalance
      } : null
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=30'
      }
    });
  } catch (error) {
    console.error('[press] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to preview press' },
      { status: 500 }
    );
  }
}

/**
 * POST - Execute a MoneyButton press
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId } = await params;

    // Require HandCash auth
    const authToken = getHandCashToken(request);
    if (!authToken) {
      return NextResponse.json(
        { error: 'HandCash authentication required. Sign in first.' },
        { status: 401 }
      );
    }

    // Get user profile from HandCash
    let userHandle: string;
    try {
      const profile = await handcashService.getUserProfile(authToken);
      userHandle = profile.handle;
    } catch (error) {
      return NextResponse.json(
        { error: 'HandCash session expired. Please sign in again.' },
        { status: 401 }
      );
    }

    // Execute the press
    const result = await processPress(tokenId, authToken, userHandle);

    return NextResponse.json({
      success: true,
      press: {
        tokens_awarded: result.tokensAwarded,
        unit_price_sats: result.unitPriceSats,
        total_cost_sats: result.totalCostSats,
        formatted_cost: formatSats(result.totalCostSats),
        handcash_tx_id: result.handcashTxId,
        dividends_distributed_sats: result.dividendsDistributed
      },
      transaction: result.transaction
    }, { status: 201 });

  } catch (error) {
    console.error('[press] POST error:', error);
    const message = error instanceof Error ? error.message : 'Press failed';

    // Determine appropriate status code
    let status = 500;
    if (message.includes('not found')) status = 404;
    if (message.includes('not active') || message.includes('sold out')) status = 400;
    if (message.includes('HandCash payment failed')) status = 402; // Payment Required — fitting!

    return NextResponse.json({ error: message }, { status });
  }
}
