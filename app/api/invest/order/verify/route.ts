/**
 * POST /api/invest/order/verify
 * Verify payment for an investment order
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyPayment, getInvestmentOrder } from '@/lib/investor-flow';

const verifySchema = z.object({
  orderId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = verifySchema.parse(body);

    const order = await getInvestmentOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'completed' || order.status === 'tokens_sent') {
      return NextResponse.json({
        success: true,
        verified: true,
        status: order.status,
        message: 'Order already completed',
      });
    }

    if (order.status === 'expired') {
      return NextResponse.json({
        success: false,
        verified: false,
        status: 'expired',
        message: 'Order has expired',
      });
    }

    const verification = await verifyPayment(orderId);

    return NextResponse.json({
      success: true,
      verified: verification.verified,
      payment: {
        txid: verification.txid,
        amountReceived: verification.amountReceived,
        confirmations: verification.confirmations,
        expected: order.paymentAmountCrypto,
        currency: order.paymentCurrency,
      },
      status: verification.verified ? 'payment_detected' : 'pending',
    });
  } catch (error) {
    console.error('[invest/order/verify] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Verification failed' },
      { status: 500 }
    );
  }
}
