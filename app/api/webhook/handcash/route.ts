import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const signature = req.headers.get('x-handcash-signature');
        const secret = process.env.HANDCASH_WEBHOOK_SECRET;

        if (!secret) {
            console.error('❌ HANDCASH_WEBHOOK_SECRET is not configured');
            return NextResponse.json({ error: 'Webhook secret missing' }, { status: 500 });
        }

        if (!signature) {
            console.warn('⚠️ Missing x-handcash-signature header');
            return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
        }

        // Get raw body for validation
        const rawBody = await req.text();
        if (!rawBody) return NextResponse.json({ error: 'Empty body' }, { status: 400 });
        
        // Validate HMAC signature
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(rawBody)
            .digest('hex');

        if (signature !== expectedSignature) {
            console.warn('⚠️ Invalid HandCash signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const payload = JSON.parse(rawBody);
        const { event, data } = payload;
        
        if (event !== 'payment') {
            return NextResponse.json({ success: true, message: 'Ignoring non-payment event' });
        }

        const {
            transactionId,
            amount, // USD amount
            currency,
            payerHandle,
            attachment,
            note
        } = data;

        let theme = 'default';
        if (attachment && typeof attachment === 'object' && attachment.theme) {
            theme = attachment.theme;
        } else if (note && note.toLowerCase().includes('theme:')) {
             theme = note.split('theme:')[1].trim().split(' ')[0];
        }

        const prisma = getPrisma();

        // 1. Find or Create User
        let user = await prisma.user.findUnique({
            where: { handcashHandle: payerHandle }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    id: crypto.randomUUID(),
                    handcashHandle: payerHandle,
                    tokens: 0,
                    totalPaid: 0
                }
            });
        }

        // 2. Perform Atomic Updates
        await prisma.$transaction(async (tx) => {
            const amountCents = Math.round(amount * 100);
            
            await tx.user.update({
                where: { id: user!.id },
                data: { totalPaid: { increment: amountCents } }
            });

            const tokensToGrant = Math.floor(amount * 100); 

            await tx.userToken.upsert({
                where: { userId_theme: { userId: user!.id, theme } },
                update: { balance: { increment: tokensToGrant } },
                create: {
                    userId: user!.id,
                    theme,
                    ticker: `$${theme.toUpperCase()}`,
                    balance: tokensToGrant
                }
            });

            await tx.transaction.create({
                data: {
                    id: transactionId,
                    type: 'PURCHASE',
                    amount: BigInt(amountCents),
                    userId: user!.id,
                    currency: currency || 'USD',
                    theme
                }
            });

            await tx.globalStats.updateMany({
                where: { id: 1 },
                data: { totalPresses: { increment: tokensToGrant } }
            });

            const themedSupply = await tx.themedTokenSupply.findUnique({
                where: { id: theme }
            });

            if (themedSupply) {
                await tx.themedTokenSupply.update({
                    where: { id: theme },
                    data: {
                        tokensSold: { increment: BigInt(tokensToGrant) },
                        tokensRemaining: { decrement: BigInt(tokensToGrant) },
                        treasuryBalance: { increment: amount }
                    }
                });
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('❌ Webhook processing error:', error);
        return NextResponse.json({ error: 'Internal processing error' }, { status: 500 });
    }
}
