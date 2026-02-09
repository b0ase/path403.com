import { handCashConnect } from '@/lib/handcash';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
        return NextResponse.json({ authenticated: false });
    }

    try {
        const account = handCashConnect.getAccountFromAuthToken(authToken);
        const { publicProfile } = await account.profile.getCurrentProfile();
        
        return NextResponse.json({
            authenticated: true,
            user: {
                id: publicProfile.id,
                handle: publicProfile.handle,
                displayName: publicProfile.displayName,
                avatarUrl: publicProfile.avatarUrl
            }
        });
    } catch (error: any) {
        console.error('Profile fetch error:', error);
        return NextResponse.json({ authenticated: false, error: 'Session expired' }, { status: 401 });
    }
}
