/**
 * POST /api/invest/order
 * Create a new investment order
 *
 * GET /api/invest/order?id=xxx
 * Get order status
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createInvestmentOrder,
  getInvestmentOrder,
  calculateInvestmentPrice,
  PaymentChain,
} from '@/lib/investor-flow';
import { DEPLOYED_TOKENS, getPaymentAddresses } from '@/lib/boase-treasury';

const createOrderSchema = z.object({
  investorEmail: z.string().email(),
  investorWallet: z.string().optional(),
  tokenSymbol: z.string(),
  tokenAmount: z.number().positive(),
  paymentChain: z.enum(['bsv', 'eth', 'sol']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createOrderSchema.parse(body);

    // Validate token exists
    if (!DEPLOYED_TOKENS[validated.tokenSymbol]) {
      return NextResponse.json(
        { error: `Token ${validated.tokenSymbol} not available` },
        { status: 400 }
      );
    }

    // Check payment address is configured
    const addresses = getPaymentAddresses();
    const paymentAddress = validated.paymentChain === 'bsv' ? addresses.bsv
      : validated.paymentChain === 'eth' ? addresses.eth
      : addresses.sol;

    if (!paymentAddress) {
      return NextResponse.json(
        { error: `${validated.paymentChain.toUpperCase()} payments not configured` },
        { status: 400 }
      );
    }

    // Create order
    const order = await createInvestmentOrder({
      investorEmail: validated.investorEmail,
      investorWallet: validated.investorWallet,
      tokenSymbol: validated.tokenSymbol,
      tokenAmount: validated.tokenAmount,
      paymentChain: validated.paymentChain as PaymentChain,
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        tokenSymbol: order.tokenSymbol,
        tokenAmount: order.tokenAmount,
        totalPriceGbp: order.totalPriceGbp,
        payment: {
          chain: order.paymentChain,
          address: order.paymentAddress,
          amount: order.paymentAmountCrypto,
          currency: order.paymentCurrency,
        },
        status: order.status,
        expiresAt: order.expiresAt,
      },
    });
  } catch (error) {
    console.error('[invest/order] Create error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      // Return available tokens and pricing
      const tokens = Object.entries(DEPLOYED_TOKENS).map(([symbol, info]) => ({
        symbol,
        name: info.name,
        available: true,
        marketUrl: info.marketUrl,
      }));

      const pricing = await calculateInvestmentPrice('KINTSUGI', 1000000, 'bsv');

      return NextResponse.json({
        tokens,
        examplePricing: {
          tokenSymbol: 'KINTSUGI',
          tokenAmount: 1000000,
          ...pricing,
        },
        paymentMethods: ['bsv', 'eth', 'sol'],
      });
    }

    const order = await getInvestmentOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        tokenSymbol: order.tokenSymbol,
        tokenAmount: order.tokenAmount,
        totalPriceGbp: order.totalPriceGbp,
        payment: {
          chain: order.paymentChain,
          address: order.paymentAddress,
          amount: order.paymentAmountCrypto,
          currency: order.paymentCurrency,
          txid: order.paymentTxid,
        },
        transfer: {
          txid: order.transferTxid,
        },
        status: order.status,
        createdAt: order.createdAt,
        expiresAt: order.expiresAt,
      },
    });
  } catch (error) {
    console.error('[invest/order] Get error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get order' },
      { status: 500 }
    );
  }
}
