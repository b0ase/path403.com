/**
 * POST /api/ledger/purchase
 *
 * Purchase tokens with HandCash payment.
 *
 * Flow:
 * 1. User initiates purchase from frontend
 * 2. HandCash payment executes
 * 3. Ledger credits user's balance
 * 4. Returns transaction details
 */

import { NextRequest, NextResponse } from 'next/server';
import { purchaseWithHandCash } from '@/lib/ledger-payments';
import { getServerSession } from 'next-auth/next';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      tokenId,
      tokenAmount,
      usdAmount,
      buyerAuthToken,
    } = body;

    // Validate required fields
    if (!tokenId || !tokenAmount || !usdAmount || !buyerAuthToken) {
      return NextResponse.json(
        { error: 'Missing required fields: tokenId, tokenAmount, usdAmount, buyerAuthToken' },
        { status: 400 }
      );
    }

    // Get user from session (or use provided userId)
    const session = await getServerSession();
    const userId = body.userId || session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Calculate price per token
    const pricePerToken = usdAmount / tokenAmount;

    // Execute purchase with HandCash payment
    const result = await purchaseWithHandCash({
      userId,
      tokenId,
      tokenAmount: BigInt(tokenAmount),
      usdAmount,
      pricePerToken,
      buyerAuthToken,
      paymentMethod: 'handcash',
    });

    return NextResponse.json({
      success: true,
      transactionId: result.txid,
      purchaseId: result.purchaseId,
      message: `Successfully purchased ${tokenAmount} tokens for $${usdAmount}`,
    });
  } catch (error: any) {
    console.error('[Ledger Purchase Error]', error);

    return NextResponse.json(
      {
        error: error.message || 'Purchase failed',
        code: error.code || 'PURCHASE_ERROR',
      },
      { status: 500 }
    );
  }
}
