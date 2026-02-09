import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// Initialize Google Drive client
async function getDriveClient(request: NextRequest) {
  // Use service account authentication for public access
  // This allows the video editor to work without user authentication
  
  // First try to use user's credentials if available (for authenticated features)
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('google_access_token')?.value;
  const refreshToken = cookieStore.get('google_refresh_token')?.value;

  if (accessToken) {
    // User has authenticated - use their credentials
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/google/callback`
    );
    
    auth.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    const drive = google.drive({
      version: 'v3',
      auth: auth,
    });

    return drive;
  }

  // No user authentication - use API key for public read-only access
  // This requires the Google Drive folder to be publicly accessible
  const drive = google.drive({
    version: 'v3',
    auth: process.env.GOOGLE_API_KEY, // You'll need to add this to your .env file
  });

  return drive;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get('folderId') || '14NBTn-1rsg8XOXq2ZBc283OoGHJ802CP';
  const action = searchParams.get('action');
  const fileId = searchParams.get('fileId');

  try {
    const drive = await getDriveClient(request);
    
    // User authorization check removed - public access allowed
    // If a user is authenticated, we'll use their credentials (handled in getDriveClient)
    // Otherwise, we'll use the API key for public read-only access

    // If requesting a specific file stream
    if (action === 'stream' && fileId) {
      try {
        // Get file metadata
        const fileMetadata = await drive.files.get({
          fileId: fileId,
          fields: 'id,name,mimeType,webContentLink,webViewLink',
          supportsAllDrives: true,
        });

        // Get the download URL
        const response = await drive.files.get(
          {
            fileId: fileId,
            alt: 'media',
          },
          {
            responseType: 'stream',
          }
        );

        // Stream the video content
        const headers = new Headers();
        headers.set('Content-Type', fileMetadata.data.mimeType || 'video/mp4');
        headers.set('Cache-Control', 'public, max-age=3600');
        
        return new Response(response.data as any, {
          headers,
        });
      } catch (error) {
        console.error('Error streaming file:', error);
        
        // Fallback: return direct link for client-side handling
        const fileMetadata = await drive.files.get({
          fileId: fileId,
          fields: 'webContentLink',
        });
        
        return NextResponse.json({
          url: fileMetadata.data.webContentLink,
        });
      }
    }

    // List all videos in folder
    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'video/' and trashed = false`,
      fields: 'files(id, name, mimeType, size, thumbnailLink, webContentLink, webViewLink, createdTime)',
      orderBy: 'name',
      pageSize: 100,
      supportsAllDrives: true,
    });

    const videos = response.data.files || [];

    // Format video data for the frontend
    const formattedVideos = videos.map((file) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size,
      thumbnailUrl: file.thumbnailLink,
      // Use our API endpoint for streaming
      streamUrl: `/api/google-drive/videos?action=stream&fileId=${file.id}`,
      // Fallback direct download URL
      downloadUrl: file.webContentLink,
      viewUrl: file.webViewLink,
      createdAt: file.createdTime,
    }));

    return NextResponse.json({
      videos: formattedVideos,
      count: formattedVideos.length,
      folderId: folderId,
    });

  } catch (error: any) {
    console.error('Google Drive API error:', error);
    
    // For public access, we don't force authentication
    // Just return error details for debugging
    return NextResponse.json(
      { 
        error: 'Failed to fetch videos', 
        message: error.message || 'Unable to access Google Drive files. Make sure the folder is publicly accessible.',
        details: error.errors,
        // Only suggest authentication if it's truly a permission issue
        suggestion: error.code === 403 ? 'The Google Drive folder may not be publicly accessible.' : undefined
      },
      { status: error.code || 500 }
    );
  }
}

// Handle video upload (optional)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folderId = formData.get('folderId') as string || '14NBTn-1rsg8XOXq2ZBc283OoGHJ802CP';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const drive = await getDriveClient(request);

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [folderId],
        mimeType: file.type,
      },
      media: {
        mimeType: file.type,
        body: buffer as any,
      },
      fields: 'id,name,webContentLink',
    });

    return NextResponse.json({
      success: true,
      file: response.data,
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', message: error.message },
      { status: 500 }
    );
  }
}