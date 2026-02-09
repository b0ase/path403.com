import { NextRequest, NextResponse } from 'next/server';
import { transferTokens, getToken } from '@/lib/tokens';

/**
 * POST /api/tokens/transfer
 *
 * Transfer tokens to another user
 */
export async function POST(request: NextRequest) {
  try {
    const fromHandle = request.headers.get('x-wallet-handle');
    const provider = request.headers.get('x-wallet-provider');

    if (!fromHandle || !provider) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { token_address, amount, to_handle, to_address } = body;

    if (!token_address) {
      return NextResponse.json({ error: 'token_address is required' }, { status: 400 });
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'amount must be positive' }, { status: 400 });
    }

    if (!to_handle && !to_address) {
      return NextResponse.json({ error: 'to_handle or to_address is required' }, { status: 400 });
    }

    // Verify token exists
    const token = await getToken(token_address);
    if (!token) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    // Cannot transfer to yourself
    const recipient = to_handle || to_address;
    if (recipient === fromHandle) {
      return NextResponse.json({ error: 'Cannot transfer to yourself' }, { status: 400 });
    }

    const result = await transferTokens(
      token_address,
      fromHandle,
      recipient,
      parseInt(amount)
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      transferred: amount,
      token_address,
      from: fromHandle,
      to: recipient,
    });
  } catch (error) {
    console.error('[/api/tokens/transfer POST] Error:', error);
    return NextResponse.json({ error: 'Failed to transfer tokens' }, { status: 500 });
  }
}
