import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;

  try {
    // Get auth tokens from cookies
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();

    const accessToken = cookieStore.get('google_access_token')?.value;
    const refreshToken = cookieStore.get('google_refresh_token')?.value;

    if (!accessToken) {
      // Redirect to auth if not authenticated
      return NextResponse.redirect(new URL('/api/auth/google?scope=drive.readonly&returnUrl=/video/editor', request.url));
    }

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    auth.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    // Verify user identity
    const oauth2 = google.oauth2({
      version: 'v2',
      auth: auth,
    });

    const userInfo = await oauth2.userinfo.get();

    // Only allow authorized admin email
    if (userInfo.data.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Unauthorized user. Access restricted to authorized accounts only.' },
        { status: 403 }
      );
    }

    const drive = google.drive({
      version: 'v3',
      auth: auth,
    });

    // Get file metadata first
    const fileMetadata = await drive.files.get({
      fileId: fileId,
      fields: 'id,name,mimeType,size',
      supportsAllDrives: true,
    });

    // Stream the file
    const response = await drive.files.get(
      {
        fileId: fileId,
        alt: 'media',
      },
      {
        responseType: 'stream',
      }
    );

    // Set appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', fileMetadata.data.mimeType || 'video/mp4');
    headers.set('Cache-Control', 'public, max-age=3600');
    headers.set('Accept-Ranges', 'bytes');

    // Enable CORS for video playback
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');

    return new Response(response.data as any, {
      headers,
    });

  } catch (error: any) {
    console.error('Error streaming video:', error);

    return NextResponse.json(
      {
        error: 'Failed to stream video',
        message: error.message
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}