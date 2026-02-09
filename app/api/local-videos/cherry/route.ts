import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';

const CHERRY_VIDEO_PATH = path.join(process.cwd(), 'public/videos/local/cherry');

export async function GET(request: NextRequest) {
  try {
    // Check if we're in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Local videos only available in development' }, { status: 403 });
    }

    // Read the directory
    const files = await readdir(CHERRY_VIDEO_PATH);
    
    // Filter for video files
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
    const videoFiles = files.filter(file => 
      videoExtensions.some(ext => file.toLowerCase().endsWith(ext))
    );

    // Get file stats and create video objects
    const videos = await Promise.all(
      videoFiles.map(async (filename) => {
        const filepath = path.join(CHERRY_VIDEO_PATH, filename);
        const stats = await stat(filepath);
        
        return {
          id: filename,
          name: filename,
          url: `/api/local-videos/cherry/stream?file=${encodeURIComponent(filename)}`,
          size: stats.size,
          modified: stats.mtime.toISOString()
        };
      })
    );

    return NextResponse.json({ 
      videos: videos.sort((a, b) => a.name.localeCompare(b.name)),
      count: videos.length 
    });

  } catch (error: any) {
    console.error('Error loading local cherry videos:', error);
    return NextResponse.json({ 
      error: 'Failed to load local videos',
      details: error.message 
    }, { status: 500 });
  }
}