import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('google_access_token')?.value;
  
  if (!accessToken) {
    return NextResponse.json({ 
      authenticated: false,
      email: null 
    });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/google/callback`
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    // Get user info
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2'
    });

    const { data } = await oauth2.userinfo.get();
    
    return NextResponse.json({
      authenticated: true,
      email: data.email,
      name: data.name,
      picture: data.picture
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({
      authenticated: false,
      email: null,
      error: 'Invalid token'
    });
  }
}