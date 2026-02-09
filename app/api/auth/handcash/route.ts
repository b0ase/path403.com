import { handCashConnect } from '@/lib/handcash';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const returnTo = url.searchParams.get('returnTo') || '/user/account';

        // Use the request origin to build callback URL
        // This allows both localhost and production to work
        const origin = url.origin;
        const callbackUrl = `${origin}/api/auth/handcash/callback`;

        // For HandCash, we need to use a registered callback URL
        // In production, HandCash only accepts pre-registered URLs
        // ALWAYS use non-www canonical URL in production to match HandCash registration
        const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('192.168');
        const productionCallbackUrl = 'https://b0ase.com/api/auth/handcash/callback';
        const baseUrl = isLocalhost ? callbackUrl : (process.env.NEXT_PUBLIC_HANDCASH_REDIRECT_URL || productionCallbackUrl);

        console.log('[HandCash] isLocalhost check:', { isLocalhost, origin, callbackUrl, baseUrl });

        console.log('[HandCash] Initiating redirect...');
        console.log('[HandCash] Request origin:', origin);
        console.log('[HandCash] Configured NEXT_PUBLIC_HANDCASH_REDIRECT_URL:', process.env.NEXT_PUBLIC_HANDCASH_REDIRECT_URL || 'NOT SET');
        console.log('[HandCash] Calculated callbackUrl:', callbackUrl);
        console.log('[HandCash] Using baseUrl:', baseUrl);
        console.log('[HandCash] returnTo:', returnTo);
        console.log('[HandCash] App ID:', process.env.HANDCASH_APP_ID);

        if (!handCashConnect) throw new Error('HandCash service not initialized');

        const redirectUrl = handCashConnect.getRedirectionUrl({
            referrerUrl: baseUrl,
            permissions: ['PAY', 'USER_PUBLIC_PROFILE'] as any
        });

        console.log('[HandCash] Generated redirect URL:', redirectUrl);
        console.log('[HandCash] Redirect URL host:', new URL(redirectUrl).host);
        const response = NextResponse.redirect(redirectUrl);

        // Store the FULL return URL (not just path) so callback knows where to go
        // This is critical for cross-origin scenarios (localhost -> production callback)
        const fullReturnUrl = returnTo.startsWith('http') ? returnTo : `${origin}${returnTo}`;
        response.cookies.set('kintsugi_auth_return', fullReturnUrl, {
            path: '/',
            maxAge: 300,
            sameSite: 'lax'
        });

        return response;
    } catch (error) {
        console.error('❌ HandCash Redirect Error:', error);
        return NextResponse.json({
            error: 'Failed to initiate HandCash login',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
