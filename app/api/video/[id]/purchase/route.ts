import { NextRequest, NextResponse } from 'next/server';
import { handcashService } from '@/lib/handcash-service';
import { getPrisma } from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const prisma = getPrisma();
  const { id: videoId } = await params;

  try {
    const authToken = request.cookies.get('handcash_auth_token')?.value;
    if (!authToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const profile = await handcashService.getUserProfile(authToken);
    const user = await prisma.user.findUnique({ where: { handcashHandle: profile.handle } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { action, amountShares } = await request.json(); 
    // action: 'BUY_SHARE', 'PENNY_UP_FRONT'
    // amountShares: integer (for BUY_SHARE)

    if (action === 'BUY_SHARE') {
        const SHARE_PRICE_SATS = 1000; // Example: 1000 sats (~$1 depending on rate) per share. Configurable?
        
        // MVP: Fixed Price for now. Real world: Bonding curve or Order book.
        const totalCost = BigInt(amountShares) * BigInt(SHARE_PRICE_SATS);

        const result = await prisma.$transaction(async (tx) => {
            // 1. Debit Buyer
            const buyer = await tx.user.update({
                where: { id: user.id },
                data: { clearingBalanceSats: { decrement: totalCost } }
            });
            if (buyer.clearingBalanceSats < 0) throw new Error('Insufficient Funds');

            // 2. Credit/Create Share Record
            // Check if user already has shares
            const existingShare = await tx.videoShare.findUnique({
                where: { videoId_userId: { videoId, userId: user.id } }
            });

            if (existingShare) {
                await tx.videoShare.update({
                    where: { id: existingShare.id },
                    data: { shares: { increment: amountShares } }
                });
            } else {
                await tx.videoShare.create({
                    data: {
                        videoId,
                        userId: user.id,
                        shares: amountShares
                    }
                });
            }

            // 3. Log Audit
            await tx.ledgerTransaction.create({
                data: {
                    userId: user.id,
                    type: 'SPEND_BUY_SHARE',
                    amountSats: totalCost,
                    balanceAfter: buyer.clearingBalanceSats,
                    referenceId: videoId,
                    description: `Bought ${amountShares} shares of video ${videoId}`
                }
            });

            return buyer;
        });

        return NextResponse.json({ success: true, balance: result.clearingBalanceSats.toString() });
    }
    
    // Future: PENNY_UP_FRONT implementation

    return NextResponse.json({ error: 'Invalid Action' }, { status: 400 });

  } catch (error: any) {
    if (error.code === 'P2025') { // Prisma Record Not Found (or Validation) usually
         return NextResponse.json({ error: 'Insufficient Funds or Video Not Found' }, { status: 400 });
    }
    console.error('Purchase Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
