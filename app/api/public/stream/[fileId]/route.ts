import { NextRequest, NextResponse } from 'next/server';

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  
  try {
    // Check if this is a mobile device from user agent
    const userAgent = request.headers.get('user-agent') || '';
    const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
    
    // Use the direct download URL for both mobile and desktop
    // The preview URL doesn't work for video streaming
    const streamUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    
    try {
      // Try to fetch the video and proxy it with proper headers
      const response = await fetch(streamUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.status}`);
      }
      
      // Create new headers with CORS support
      const headers = new Headers();
      
      // Copy relevant headers from Google Drive
      const contentType = response.headers.get('content-type') || 'video/mp4';
      const contentLength = response.headers.get('content-length');
      const acceptRanges = response.headers.get('accept-ranges');
      
      headers.set('Content-Type', contentType);
      if (contentLength) headers.set('Content-Length', contentLength);
      if (acceptRanges) headers.set('Accept-Ranges', acceptRanges);
      
      // Add CORS and caching headers
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Range');
      headers.set('Cache-Control', 'public, max-age=3600');
      
      return new NextResponse(response.body, {
        status: response.status,
        headers
      });
    } catch (fetchError) {
      console.error('Error fetching from Google Drive:', fetchError);
      // Fall back to redirect for desktop
      if (!isMobile) {
        return NextResponse.redirect(streamUrl);
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Error streaming video:', error);
    return NextResponse.json(
      { error: 'Failed to stream video', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}