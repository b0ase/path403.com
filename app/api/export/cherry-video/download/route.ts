import { NextRequest, NextResponse } from 'next/server';
import { createReadStream, statSync } from 'fs';
import path from 'path';

const OUTPUT_PATH = '/tmp/cherry-export/output';

export async function GET(request: NextRequest) {
  try {
    // Check if we're in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Download only available in development' }, { status: 403 });
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

    const filepath = path.join(OUTPUT_PATH, filename);

    try {
      const stats = statSync(filepath);
      const fileSize = stats.size;
      const stream = createReadStream(filepath);

      return new NextResponse(stream as any, {
        headers: {
          'Content-Length': fileSize.toString(),
          'Content-Type': 'video/mp4',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache',
        },
      });

    } catch (fileError) {
      console.error('File access error:', fileError);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

  } catch (error: any) {
    console.error('Error downloading exported video:', error);
    return NextResponse.json({ 
      error: 'Failed to download video',
      details: error.message 
    }, { status: 500 });
  }
}