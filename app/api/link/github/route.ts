import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Generate PKCE code verifier and challenge
function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
  return { verifier, challenge };
}

/**
 * Custom GitHub linking flow that allows duplicate GitHub accounts across multiple users
 * This bypasses Supabase Auth's unique constraint on OAuth identities
 */
export async function GET(request: Request) {
  try {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;

    if (!clientId) {
      console.error('GITHUB_CLIENT_ID not configured');
      return NextResponse.redirect(new URL('/user/account?error=github_not_configured&tab=connections', request.url));
    }

    // Generate PKCE
    const { verifier, challenge } = generatePKCE();

    // Generate state for CSRF protection
    const state = crypto.randomBytes(16).toString('hex');

    // Determine redirect URI
    const requestUrl = new URL(request.url);
    let baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;

    if (baseUrl.includes('b0ase.com') && !baseUrl.includes('www.')) {
      baseUrl = baseUrl.replace('://b0ase.com', '://www.b0ase.com');
    }
    const redirectUri = `${baseUrl}/api/link/github/callback`;

    // Build GitHub OAuth authorization URL
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'read:user user:email public_repo',
      state: state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });

    const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

    console.log('🔗 Initiating custom GitHub linking flow');

    const response = NextResponse.redirect(authUrl);

    // Set cookies with short expiry (10 minutes for OAuth flow)
    response.cookies.set('github_code_verifier', verifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    response.cookies.set('github_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('❌ GitHub OAuth initiation error:', error);
    return NextResponse.redirect(new URL('/user/account?error=github_init_failed&tab=connections', request.url));
  }
}
