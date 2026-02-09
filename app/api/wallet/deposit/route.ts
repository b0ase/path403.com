import { NextRequest, NextResponse } from 'next/server';
import { handcashService } from '@/lib/handcash-service';
import { getPrisma } from '@/lib/prisma';

// Conversion rate - in production, fetch from exchange API
const SATS_PER_USD = 2500; // Approximate, should be dynamic

export async function POST(request: NextRequest) {
  try {
    const authToken = request.cookies.get('handcash_auth_token')?.value;
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, currency = 'USD' } = await request.json();

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Validate amount limits
    if (amount > 10000) {
      return NextResponse.json({ error: 'Amount exceeds maximum limit' }, { status: 400 });
    }

    const profile = await handcashService.getUserProfile(authToken);
    const prisma = getPrisma();

    const user = await prisma.user.findUnique({
      where: { handcashHandle: profile.handle }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Convert amount to sats based on currency
    let amountSats: number;
    if (currency === 'USD') {
      amountSats = Math.floor(amount * SATS_PER_USD);
    } else if (currency === 'SATS' || currency === 'SAT') {
      amountSats = Math.floor(amount);
    } else {
      return NextResponse.json({ error: 'Unsupported currency' }, { status: 400 });
    }

    if (amountSats <= 0) {
      return NextResponse.json({ error: 'Amount too small' }, { status: 400 });
    }

    // Generate a unique transaction ID
    const transactionId = `dep_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Perform DB transaction
    const result = await prisma.$transaction(async (tx) => {
      // Credit User
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          clearingBalanceSats: { increment: amountSats }
        }
      });

      // Log Transaction
      await tx.ledgerTransaction.create({
        data: {
          userId: user.id,
          type: 'DEPOSIT',
          amountSats: amountSats,
          balanceAfter: updatedUser.clearingBalanceSats,
          referenceId: transactionId,
          description: `Deposit of ${amount} ${currency} (${amountSats} sats)`,
        }
      });

      return updatedUser;
    });

    return NextResponse.json({
      success: true,
      balance: result.clearingBalanceSats.toString(),
      transactionId,
      amountSats
    });

  } catch (error: any) {
    console.error('Deposit Error:', error);
    return NextResponse.json({ error: error.message || 'Deposit failed' }, { status: 500 });
  }
}
