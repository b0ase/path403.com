import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get('scope') || 'drive.readonly';
  
  // Determine the correct redirect URI based on the request
  const host = request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
  
  // For production, always use the canonical URL
  let redirectUri: string;
  if (host?.includes('localhost:3001')) {
    redirectUri = 'http://localhost:3001/api/auth/google/callback';
  } else if (host?.includes('localhost')) {
    redirectUri = 'http://localhost:3000/api/auth/google/callback';
  } else {
    // For production, always use the www subdomain for consistency
    redirectUri = 'https://www.b0ase.com/api/auth/google/callback';
  }
  
  console.log('OAuth redirect URI being used:', redirectUri);
  console.log('Request host:', host);
  console.log('Protocol:', protocol);

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  // Generate auth URL with appropriate scopes
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ];

  // Add Drive scopes
  if (scope.includes('drive')) {
    scopes.push('https://www.googleapis.com/auth/drive.readonly');
    scopes.push('https://www.googleapis.com/auth/drive.file');
  }

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    state: JSON.stringify({
      returnUrl: searchParams.get('returnUrl') || '/video/editor',
    }),
  });

  return NextResponse.redirect(authUrl);
}