import { NextResponse } from 'next/server';

// HandCash OAuth configuration
const HANDCASH_APP_ID = process.env.HANDCASH_APP_ID?.trim();
const HANDCASH_AUTH_URL = 'https://market.handcash.io';

export async function GET() {
  try {
    if (!HANDCASH_APP_ID) {
      return NextResponse.json({
        error: 'HandCash not configured',
        message: 'HANDCASH_APP_ID environment variable not set'
      }, { status: 500 });
    }

    // Build HandCash authorization URL (new format: market.handcash.io/connect)
    const authUrl = new URL(`${HANDCASH_AUTH_URL}/connect`);
    authUrl.searchParams.set('appId', HANDCASH_APP_ID);

    // Get the base URL for the callback - MUST match HandCash dashboard exactly
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://path402.com').trim();
    // Note: HandCash dashboard has this registered as the callback URL
    const callbackUrl = `${baseUrl}/api/auth/callback/handcash`;
    authUrl.searchParams.set('redirectUrl', callbackUrl);

    // Request PAY permission for token purchases
    authUrl.searchParams.set('permissions', 'PAY');

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('HandCash auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
