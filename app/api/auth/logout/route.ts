import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const cookieStore = await cookies();
    const supabase = await createClient();

    // Sign out from Supabase (server-side)
    await supabase.auth.signOut();

    // Create response to clear cookies - redirect to home (will show paywall if not logged in)
    const response = NextResponse.redirect(`${requestUrl.origin}/`);

    // Clear all application cookies
    const allCookies = cookieStore.getAll();

    // Domains to attempt clearing on
    const domains = [undefined, '.b0ase.com', 'b0ase.com', 'www.b0ase.com'];

    allCookies.forEach((cookie) => {
        // Clear on default domain
        response.cookies.set(cookie.name, '', {
            path: '/',
            expires: new Date(0),
        });

        // Aggressively try to clear on root/subdomains if in production
        if (process.env.NODE_ENV === 'production') {
            domains.forEach(domain => {
                response.cookies.set(cookie.name, '', {
                    path: '/',
                    domain: domain,
                    expires: new Date(0),
                });
            });
        }
    });

    // Explicitly clear alt auth cookies with matching options to how they were set
    const isProduction = process.env.NODE_ENV === 'production';

    // Clear b0ase_site_access with exact options it was set with
    response.cookies.set('b0ase_site_access', '', {
        path: '/',
        httpOnly: false,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 0,
        expires: new Date(0),
    });

    // Clear HandCash cookies with exact options
    const handcashCookieOptions = {
        path: '/',
        sameSite: 'lax' as const,
        secure: isProduction,
        httpOnly: false,
        maxAge: 0,
        expires: new Date(0),
    };

    response.cookies.set('b0ase_handcash_token', '', handcashCookieOptions);
    response.cookies.set('b0ase_user_handle', '', handcashCookieOptions);

    // Clear other auth cookies
    const otherAuthCookies = [
        'b0ase_token_access',
        'b0ase_access_token',
        'b0ase_twitter_user',
        'b0ase_wallet_provider',
        'b0ase_wallet_address',
        'kintsugi_auth_return',
        'handcash_auth_token'
    ];

    otherAuthCookies.forEach(cookieName => {
        response.cookies.set(cookieName, '', {
            path: '/',
            maxAge: 0,
            expires: new Date(0),
        });
    });

    console.log('[Auth] Logout complete - all cookies cleared');

    return response;
}
