import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { handCashConnect } from '@/lib/handcash';
import { getPrisma } from '@/lib/prisma';
// import { P2PKH } from '@bsv/sdk'; 

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

        const { tokenName, amount, destinationAddress } = await req.json();

        if (!tokenName || !amount || !destinationAddress) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Check User Balance in DB
        const user = await prisma.user.findUnique({
            where: { handcashHandle: publicProfile.handle },
            include: {
                projectTokenBalances: true 
            }
        });

        if (!user) {
             return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 2. Validate Balance
        // const balance = user.projectTokenBalances.find(b => b.tokenSymbol === tokenName);
        // if (!balance || balance.amount < amount) ...

        // 3. Initiate On-Chain Transfer using Platform Keys
        // const txId = await transferToken(tokenName, amount, destinationAddress);

        // 4. Deduct Balance in DB
        // await prisma.balance.update(...)

        console.log(`[Withdrawal] ${publicProfile.handle} withdrew ${amount} ${tokenName} to ${destinationAddress}`);

        return NextResponse.json({ success: true, txId: 'placeholder_txid' });

    } catch (error) {
        console.error('Withdrawal error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
