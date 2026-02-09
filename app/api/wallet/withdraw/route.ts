import { NextRequest, NextResponse } from 'next/server';
import { handcashService } from '@/lib/handcash-service';
import { getPrisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const prisma = getPrisma();
  try {
    const authToken = request.cookies.get('handcash_auth_token')?.value;
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await handcashService.getUserProfile(authToken);
    const user = await prisma.user.findUnique({ where: { handcashHandle: profile.handle } });
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { amountSats } = await request.json();
    if (!amountSats || amountSats <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const withdrawAmount = BigInt(amountSats);

    // 1. Optimistic Lock / Compare-And-Swap
    // We try to decrement ONLY if they have enough balance.
    // Note: Prisma 5/6 doesn't support `.update({ where: { ..., balance: { gte: amount } } })` directly for increment/decrement easily returning doc.
    // Instead we use `updateMany` to ensure the condition, then fetch.
    
    // Better Pattern: Interactive Transaction
    let paymentResult;
    
    // Step 1: Secure funds (Debit)
    // We do this BEFORE sending money to avoid double-spend race conditions.
    const result = await prisma.$transaction(async (tx) => {
        const currentUser = await tx.user.findUnique({ where: { id: user.id } });
        if (!currentUser || currentUser.clearingBalanceSats < withdrawAmount) {
            throw new Error('Insufficient Funds');
        }

        const updated = await tx.user.update({
            where: { id: user.id },
            data: { clearingBalanceSats: { decrement: withdrawAmount } }
        });
        
        return updated;
    });

    // Step 2: Send Money (External Side Effect)
    try {
        const houseAuthToken = process.env.HOUSE_AUTH_TOKEN;
        if (!houseAuthToken) throw new Error('System Config Error');

        // Convert Sats to BSV (HandCash API typically takes BSV amount for currencyCode='BSV')
        const amountBSV = Number(withdrawAmount) / 100000000;

        paymentResult = await handcashService.sendPayment(houseAuthToken, {
            destination: profile.handle,
            amount: amountBSV,
            currency: 'BSV',
            description: 'Withdrawal from b0ase.com Clearing House'
        });
    } catch (paymentError: any) {
        // Step 3 (Rollback): Payment Failed, Refund the user
        console.error('Withdrawal Payment Failed - Refunding:', paymentError);
        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { clearingBalanceSats: { increment: withdrawAmount } }
            }),
            prisma.ledgerTransaction.create({
                data: {
                    userId: user.id,
                    type: 'WITHDRAWAL_FAILED_REFUND',
                    amountSats: withdrawAmount,
                    balanceAfter: (await prisma.user.findUnique({where:{id:user.id}}))?.clearingBalanceSats || 0,
                    description: `Refund validation failure: ${paymentError.message}`
                }
            })
        ]);
        throw new Error(`Payment Network Failed: ${paymentError.message}`);
    }

    // Step 4: Log Success (Audit)
    await prisma.ledgerTransaction.create({
        data: {
            userId: user.id,
            type: 'WITHDRAWAL',
            amountSats: withdrawAmount,
            balanceAfter: result.clearingBalanceSats,
            referenceId: paymentResult.transactionId,
            description: `Withdrawal to ${profile.handle}`
        }
    });

    return NextResponse.json({ success: true, balance: result.clearingBalanceSats.toString(), txId: paymentResult.transactionId });

  } catch (error: any) {
    console.error('Withdrawal Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
