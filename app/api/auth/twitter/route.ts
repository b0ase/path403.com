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

export async function GET(request: Request) {
  try {
    const clientId = process.env.TWITTER_CLIENT_ID;

    if (!clientId) {
      console.error('TWITTER_CLIENT_ID not configured');
      return NextResponse.redirect(new URL('/login?error=twitter_not_configured', request.url));
    }

    // Generate PKCE
    const { verifier, challenge } = generatePKCE();

    // Generate state for CSRF protection
    const state = crypto.randomBytes(16).toString('hex');

    // Determine redirect URI from actual request origin
    const requestUrl = new URL(request.url);
    let baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;

    // For production b0ase.com, always use www (b0ase.com redirects to www.b0ase.com)
    if (baseUrl.includes('b0ase.com') && !baseUrl.includes('www.')) {
      baseUrl = baseUrl.replace('://b0ase.com', '://www.b0ase.com');
    }
    const redirectUri = `${baseUrl}/api/auth/twitter/callback`;

    // Build Twitter OAuth 2.0 authorization URL
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'tweet.read users.read offline.access',
      state: state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });

    const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;

    console.log('🐦 Initiating Twitter OAuth redirect');

    const response = NextResponse.redirect(authUrl);

    // Set cookies with short expiry (10 minutes for OAuth flow)
    response.cookies.set('twitter_code_verifier', verifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    response.cookies.set('twitter_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('❌ Twitter OAuth initiation error:', error);
    return NextResponse.redirect(new URL('/login?error=twitter_init_failed', request.url));
  }
}
