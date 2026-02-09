import { NextRequest, NextResponse } from 'next/server';
import { getHistory, TxType } from '@/lib/tokens';

/**
 * GET /api/tokens/history
 *
 * Get transaction history for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const holderHandle = request.headers.get('x-wallet-handle');
    const provider = request.headers.get('x-wallet-provider');

    if (!holderHandle || !provider) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const token_address = searchParams.get('token') || undefined;
    const tx_type = searchParams.get('type') as TxType | undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;

    const transactions = await getHistory(holderHandle, {
      token_address,
      tx_type,
      limit,
    });

    return NextResponse.json({
      transactions,
      count: transactions.length,
      limit,
    });
  } catch (error) {
    console.error('[/api/tokens/history GET] Error:', error);
    return NextResponse.json({ error: 'Failed to get history' }, { status: 500 });
  }
}
