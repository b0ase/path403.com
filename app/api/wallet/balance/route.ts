import { NextRequest, NextResponse } from 'next/server';
import { handcashService } from '@/lib/handcash-service';
import { getPrisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
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

    return NextResponse.json({ 
        balanceSats: user.clearingBalanceSats.toString(),
        handle: user.handcashHandle,
        address: user.yoursWalletBsvAddress // Useful info
    });

  } catch (error: any) {
    console.error('Balance Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
