import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';

// Account endpoint for getting user data
// Returns user token balance and profile info

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('auth_token')?.value;
        const userHandle = cookieStore.get('user_handle')?.value;

        if (!authToken || !userHandle) {
            return NextResponse.json({ 
                error: 'Not authenticated',
                user: null
            });
        }

        // Demo mode - return simulated user data
        // Full implementation queries User table via Prisma
        return NextResponse.json({
            user: {
                handle: userHandle,
                tokens: 0,
                totalPaid: 0,
                pendingDividends: 0
            }
        });

    } catch (error: unknown) {
        console.error('[account] Error:', error);
        const msg = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
