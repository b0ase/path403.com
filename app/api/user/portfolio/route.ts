import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { handCashConnect } from '@/lib/handcash';
import { getPrisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const prisma = getPrisma();
        const cookieStore = await cookies();
        const authToken = cookieStore.get('auth_token')?.value;

        if (!authToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const account = handCashConnect.getAccountFromAuthToken(authToken);
        const { publicProfile } = await account.profile.getCurrentProfile();

        const user = await prisma.user.findUnique({
            where: { handcashHandle: publicProfile.handle },
            include: {
                projectTokenBalances: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
        }

        return NextResponse.json({ 
            balances: user.projectTokenBalances,
            yoursWalletAddress: user.yoursWalletOrdAddress
        });

    } catch (error) {
        console.error('Portfolio fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
