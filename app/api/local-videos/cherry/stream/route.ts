import { NextRequest, NextResponse } from 'next/server';
import { createReadStream, statSync } from 'fs';
import path from 'path';

const CHERRY_VIDEO_PATH = path.join(process.cwd(), 'public/videos/local/cherry');

export async function GET(request: NextRequest) {
  try {
    // Check if we're in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Local videos only available in development' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('file');

    if (!filename) {
      return NextResponse.json({ error: 'File parameter required' }, { status: 400 });
    }

    // Security check - prevent path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const filepath = path.join(CHERRY_VIDEO_PATH, filename);

    try {
      const stats = statSync(filepath);
      const fileSize = stats.size;

      // Handle range requests for video streaming
      const range = request.headers.get('range');
      
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = (end - start) + 1;

        const stream = createReadStream(filepath, { start, end });
        
        return new NextResponse(stream as any, {
          status: 206,
          headers: {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize.toString(),
            'Content-Type': getContentType(filename),
            'Cache-Control': 'public, max-age=31536000',
          },
        });
      } else {
        const stream = createReadStream(filepath);
        
        return new NextResponse(stream as any, {
          headers: {
            'Content-Length': fileSize.toString(),
            'Content-Type': getContentType(filename),
            'Cache-Control': 'public, max-age=31536000',
          },
        });
      }

    } catch (fileError) {
      console.error('File access error:', fileError);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

  } catch (error: any) {
    console.error('Error streaming local video:', error);
    return NextResponse.json({ 
      error: 'Failed to stream video',
      details: error.message 
    }, { status: 500 });
  }
}

function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.mp4':
      return 'video/mp4';
    case '.mov':
      return 'video/quicktime';
    case '.avi':
      return 'video/x-msvideo';
    case '.mkv':
      return 'video/x-matroska';
    case '.webm':
      return 'video/webm';
    default:
      return 'video/mp4';
  }
}