import { handCashConnect } from '@/lib/handcash';
import { createClient } from '@supabase/supabase-js';
import { resolveUnifiedUser } from '@/lib/auth/unified-identity';
import { NextRequest, NextResponse } from 'next/server';

// Create admin client for user management
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const authToken = searchParams.get('authToken') || searchParams.get('handcash_token');

  // Always use canonical URL (no www) for redirects
  const canonicalBase = process.env.NODE_ENV === 'production'
    ? 'https://b0ase.com'
    : request.nextUrl.origin;

  if (!authToken) {
    return NextResponse.redirect(new URL('/?error=no_auth_token', canonicalBase));
  }

  try {
    console.log('[HandCash] Callback - Token received:', authToken?.substring(0, 20) + '...');

    if (!handCashConnect) throw new Error('HandCash service not initialized');

    // Fetch user profile from HandCash
    const account = handCashConnect.getAccountFromAuthToken(authToken);
    const { publicProfile } = await account.profile.getCurrentProfile();
    const handle = publicProfile.handle;

    console.log('[HandCash] Auth successful for handle:', handle);

    // Resolve unified user — checks all active sessions for existing identity
    const walletProvider = request.cookies.get('b0ase_wallet_provider')?.value;
    const walletAddress = request.cookies.get('b0ase_wallet_address')?.value;
    const twitterUser = request.cookies.get('b0ase_twitter_user')?.value;

    const pseudoEmail = `${handle.replace('$', '')}@handcash.b0ase.com`;

    const { unifiedUserId, isNew } = await resolveUnifiedUser(
      supabaseAdmin,
      {
        provider: 'handcash',
        provider_user_id: handle,
        provider_handle: handle,
        provider_email: pseudoEmail,
        provider_data: {
          displayName: publicProfile.displayName,
          avatarUrl: publicProfile.avatarUrl,
        },
      },
      {
        // Check other active sessions for existing unified users
        walletProvider: walletProvider || undefined,
        walletAddress: walletAddress || undefined,
        twitterUsername: twitterUser || undefined,
      },
      {
        displayName: publicProfile.displayName || handle,
        avatarUrl: publicProfile.avatarUrl,
      },
    );

    console.log('[HandCash] Unified user:', unifiedUserId, isNew ? '(new)' : '(existing)');

    // Optionally ensure Supabase auth user exists (for future session compatibility).
    // Fire-and-forget — don't block the login flow on this.
    supabaseAdmin.auth.admin.createUser({
      email: pseudoEmail,
      email_confirm: true,
      user_metadata: {
        full_name: publicProfile.displayName || handle,
        avatar_url: publicProfile.avatarUrl,
        handcash_handle: handle,
        provider: 'handcash',
      },
    }).catch(() => {
      // Ignore errors — user likely already exists, which is fine
    });

    // Get return URL from cookie or default
    const returnCookie = request.cookies.get('kintsugi_auth_return')?.value;

    // Parse return URL - normalize www.b0ase.com to b0ase.com
    let returnUrl = (returnCookie || '/').replace('://www.b0ase.com', '://b0ase.com');

    // Direct redirect — HandCash cookies are set below, and middleware
    // accepts b0ase_handcash_token for /user/* route protection.
    const finalUrl = returnUrl.startsWith('http') ? returnUrl : new URL(returnUrl, canonicalBase).toString();
    console.log('[HandCash] Redirecting to:', finalUrl);
    let response = NextResponse.redirect(finalUrl);

    // Clear the return cookie
    response.cookies.delete('kintsugi_auth_return');

    // Set HandCash cookies — used for payments AND route auth.
    // Middleware accepts b0ase_handcash_token for /user/* protection.
    const cookieOptions = {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false
    };

    response.cookies.set('b0ase_handcash_token', authToken, cookieOptions);
    response.cookies.set('b0ase_user_handle', handle, cookieOptions);

    console.log('[HandCash] Login complete - unified user:', unifiedUserId, 'handle:', handle);

    return response;
  } catch (error) {
    console.error('[HandCash] Callback error:', error);
    const errorBase = process.env.NODE_ENV === 'production'
      ? 'https://b0ase.com'
      : request.nextUrl.origin;
    return NextResponse.redirect(new URL(`/?error=auth_failed&details=${encodeURIComponent(error instanceof Error ? error.message : String(error))}`, errorBase));
  }
}
