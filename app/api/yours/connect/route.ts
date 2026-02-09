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

        const { bsvAddress, ordAddress, identityAddress } = await req.json();

        if (!bsvAddress || !ordAddress || !identityAddress) {
            return NextResponse.json(
                { error: 'Missing wallet addresses' },
                { status: 400 }
            );
        }

        // Update user with Yours wallet addresses
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                yoursWalletBsvAddress: bsvAddress,
                yoursWalletOrdAddress: ordAddress,
                yoursWalletIdentityAddress: identityAddress,
                yoursWalletConnectedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            addresses: {
                bsvAddress: updatedUser.yoursWalletBsvAddress,
                ordAddress: updatedUser.yoursWalletOrdAddress,
                identityAddress: updatedUser.yoursWalletIdentityAddress,
            },
        });
    } catch (error) {
        console.error('Yours wallet connect error:', error);
        return NextResponse.json(
            { error: 'Failed to connect Yours wallet' },
            { status: 500 }
        );
    }
}
