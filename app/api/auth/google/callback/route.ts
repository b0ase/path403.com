import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  
  if (!code) {
    return NextResponse.redirect('/video/editor?error=no_code');
  }

  try {
    // Determine the correct redirect URI - must match exactly what we used in the auth route
    const host = request.headers.get('host');
    let redirectUri: string;
    if (host?.includes('localhost:3001')) {
      redirectUri = 'http://localhost:3001/api/auth/google/callback';
    } else if (host?.includes('localhost')) {
      redirectUri = 'http://localhost:3000/api/auth/google/callback';
    } else {
      // For production, always use the www subdomain for consistency
      redirectUri = 'https://www.b0ase.com/api/auth/google/callback';
    }
    
    console.log('Callback redirect URI being used:', redirectUri);
    console.log('Request host:', host);

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Store tokens in cookies (in production, use secure storage)
    const cookieStore = await cookies();
    cookieStore.set('google_access_token', tokens.access_token || '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    if (tokens.refresh_token) {
      cookieStore.set('google_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    // Parse state to get return URL (with validation to prevent open redirect)
    let returnUrl = '/video/editor';
    try {
      const stateData = JSON.parse(state || '{}');
      const requestedUrl = stateData.returnUrl || returnUrl;

      // Only allow relative paths or same-origin URLs to prevent open redirect
      if (requestedUrl.startsWith('/') && !requestedUrl.startsWith('//')) {
        // Relative path - safe
        returnUrl = requestedUrl;
      } else {
        // Absolute URL - validate it's our domain
        const parsed = new URL(requestedUrl, request.url);
        const allowedHosts = ['b0ase.com', 'www.b0ase.com', 'localhost'];
        if (allowedHosts.some(h => parsed.hostname === h || parsed.hostname.endsWith('.' + h))) {
          returnUrl = parsed.pathname + parsed.search;
        }
        // Otherwise, use default - don't allow external redirects
      }
    } catch (e) {
      console.error('Failed to parse state:', e);
    }

    return NextResponse.redirect(new URL(returnUrl, request.url).toString());
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect('/video/editor?error=auth_failed');
  }
} 