import { handCashConnect } from '@/lib/handcash';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    // Demo mode check
    if (!handCashConnect) {
        return NextResponse.json({
            user: {
                id: 'demo-user',
                handle: 'demo',
                displayName: 'Demo User',
                avatarUrl: null
            },
            demoMode: true
        });
    }

    const cookieStore = await cookies();
    const authToken = cookieStore.get('b0ase_auth_token')?.value;

    if (!authToken) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const account = handCashConnect.getAccountFromAuthToken(authToken);
        const { publicProfile } = await account.profile.getCurrentProfile();

        return NextResponse.json({
            user: {
                id: publicProfile.id,
                handle: publicProfile.handle,
                displayName: publicProfile.displayName,
                avatarUrl: publicProfile.avatarUrl
            }
        });
    } catch (error: any) {
        console.error('Profile fetch error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch profile' }, { status: 500 });
    }
}
