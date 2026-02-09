import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { handCashConnect } from '@/lib/handcash';
import { getPrisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export async function POST(req: NextRequest) {
    try {
        const prisma = getPrisma();
        const cookieStore = await cookies();
        const authToken = cookieStore.get('auth_token')?.value;

        if (!authToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const account = handCashConnect.getAccountFromAuthToken(authToken);
        const { publicProfile } = await account.profile.getCurrentProfile();

        // Get user from DB to get ID
        const user = await prisma.user.findUnique({
            where: { handcashHandle: publicProfile.handle },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { projectSlug } = await req.json();

        if (!projectSlug) {
            return NextResponse.json(
                { error: 'Missing project slug' },
                { status: 400 }
            );
        }
        
        const PRICE_PER_CLICK = new Decimal('0.01'); // $0.01 USD
        const TOKENS_PER_CLICK = new Decimal('1.0'); // Simple 1:1 for now
        
        // Create button click record
        const buttonClick = await prisma.buttonClick.create({
            data: {
                userId: user.id,
                projectSlug,
                amount: PRICE_PER_CLICK,
                tokensEarned: TOKENS_PER_CLICK,
            },
        });

        // Update or create token balance
        const tokenBalance = await prisma.projectTokenBalance.upsert({
            where: {
                userId_projectSlug: {
                    userId: user.id,
                    projectSlug,
                },
            },
            create: {
                userId: user.id,
                projectSlug,
                tokenSymbol: `$${projectSlug.toUpperCase()}`,
                balance: TOKENS_PER_CLICK,
            },
            update: {
                balance: {
                    increment: TOKENS_PER_CLICK,
                },
            },
        });

        return NextResponse.json({
            success: true,
            tokensEarned: TOKENS_PER_CLICK.toString(),
            newBalance: tokenBalance.balance.toString(),
            transactionId: buttonClick.id,
        });
    } catch (error) {
        console.error('Button click error:', error);
        return NextResponse.json(
            { error: 'Failed to process button click' },
            { status: 500 }
        );
    }
}
