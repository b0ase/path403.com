/**
 * POST /api/invest/order/complete
 * Complete an investment order (verify payment + transfer tokens)
 *
 * Requires admin authentication or the investor's wallet to be set
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  completeInvestment,
  getInvestmentOrder,
  transferTokensToInvestor,
} from '@/lib/investor-flow';
import { getPrisma } from '@/lib/prisma';

const completeSchema = z.object({
  orderId: z.string().uuid(),
  investorWallet: z.string().optional(), // Can be provided if not set on order
  skipVerification: z.boolean().optional(), // For manual verification (admin only)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, investorWallet, skipVerification } = completeSchema.parse(body);

    // Get order
    let order = await getInvestmentOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if already completed
    if (order.status === 'completed') {
      return NextResponse.json({
        success: true,
        message: 'Order already completed',
        order: {
          id: order.id,
          status: order.status,
          transferTxid: order.transferTxid,
        },
      });
    }

    // Update investor wallet if provided
    if (investorWallet && !order.investorWallet) {
      const prisma = getPrisma();
      await prisma.investor_orders.update({
        where: { id: orderId },
        data: { investor_wallet: investorWallet },
      });
      order = { ...order, investorWallet };
    }

    // Ensure we have a wallet address
    if (!order.investorWallet) {
      return NextResponse.json(
        { error: 'Investor wallet address required' },
        { status: 400 }
      );
    }

    // If skipVerification, just transfer (admin manual confirmation)
    if (skipVerification) {
      // TODO: Add admin auth check here
      const prisma = getPrisma();
      await prisma.investor_orders.update({
        where: { id: orderId },
        data: { status: 'confirmed' },
      });

      const transfer = await transferTokensToInvestor(orderId);
      if (!transfer.success) {
        return NextResponse.json(
          { error: transfer.error || 'Transfer failed' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Tokens transferred (manual verification)',
        transferTxid: transfer.txid,
      });
    }

    // Complete the full flow (verify + transfer)
    const result = await completeInvestment(orderId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Completion failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Investment completed successfully',
      order: result.order ? {
        id: result.order.id,
        tokenSymbol: result.order.tokenSymbol,
        tokenAmount: result.order.tokenAmount,
        status: 'completed',
      } : undefined,
      transferTxid: result.transferTxid,
      viewTransaction: result.transferTxid
        ? `https://whatsonchain.com/tx/${result.transferTxid}`
        : undefined,
    });
  } catch (error) {
    console.error('[invest/order/complete] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Completion failed' },
      { status: 500 }
    );
  }
}
