import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { handCashConnect } from '@/lib/handcash';
import { getPrisma } from '@/lib/prisma';

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

        // Remove Yours wallet addresses from user account
        await prisma.user.update({
            where: { id: user.id },
            data: {
                yoursWalletBsvAddress: null,
                yoursWalletOrdAddress: null,
                yoursWalletIdentityAddress: null,
                yoursWalletConnectedAt: null,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Yours wallet disconnect error:', error);
        return NextResponse.json(
            { error: 'Failed to disconnect Yours wallet' },
            { status: 500 }
        );
    }
}
