import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { writeFile, readdir } from 'fs/promises';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

const CHERRY_VIDEO_PATH = '/Users/b0ase/Desktop/cherry-graf-video-jam';
const TEMP_PATH = '/tmp/cherry-export';
const OUTPUT_PATH = '/tmp/cherry-export/output';

export async function POST(request: NextRequest) {
  try {
    // Check if we're in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Export only available in development' }, { status: 403 });
    }

    const body = await request.json();
    const duration = body.duration || 10; // Default 10 seconds for testing

    // Ensure temp directories exist
    if (!existsSync(TEMP_PATH)) {
      mkdirSync(TEMP_PATH, { recursive: true });
    }
    if (!existsSync(OUTPUT_PATH)) {
      mkdirSync(OUTPUT_PATH, { recursive: true });
    }

    // Get 5 random video files for simplicity
    const files = await readdir(CHERRY_VIDEO_PATH);
    const videoFiles = files.filter(file => 
      ['.mp4', '.mov'].some(ext => file.toLowerCase().endsWith(ext))
    ).slice(0, 5); // Just use first 5 files

    if (videoFiles.length === 0) {
      return NextResponse.json({ error: 'No video files found' }, { status: 404 });
    }

    // Generate output filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFilename = `cherry-simple-${timestamp}.mp4`;
    const outputPath = path.join(OUTPUT_PATH, outputFilename);

    // Simple chaos: concatenate random segments with effects
    const clipDuration = duration / videoFiles.length;
    
    // Build simple FFmpeg command
    const ffmpegArgs = [
      'ffmpeg', '-y'
    ];
    
    // Add inputs
    videoFiles.forEach(file => {
      ffmpegArgs.push('-i', path.join(CHERRY_VIDEO_PATH, file));
    });
    
    // Simple filter: random clips with cherry color grading
    const filters: string[] = [];
    videoFiles.forEach((file, i) => {
      const start = Math.random() * 10; // Random start within first 10 seconds
      filters.push(`[${i}:v]trim=start=${start}:duration=${clipDuration},setpts=PTS-STARTPTS,colorbalance=rs=0.4:gs=-0.3:bs=-0.5,eq=contrast=1.2:brightness=0.1:saturation=1.3[clip${i}]`);
    });
    
    // Concatenate all clips
    const clipRefs = videoFiles.map((_, i) => `[clip${i}]`).join('');
    filters.push(`${clipRefs}concat=n=${videoFiles.length}:v=1:a=0[final]`);
    
    const filterComplex = filters.join(';');
    
    ffmpegArgs.push(
      '-filter_complex', filterComplex,
      '-map', '[final]',
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', '28',
      '-pix_fmt', 'yuv420p',  // Compatible pixel format
      '-r', '30',
      '-movflags', '+faststart',  // Better web compatibility
      '-t', duration.toString(),
      outputPath
    );

    console.log('Simple FFmpeg command:', ffmpegArgs.join(' '));

    // Execute FFmpeg
    await runFFmpeg(ffmpegArgs);

    return NextResponse.json({
      success: true,
      outputFile: outputFilename,
      outputPath: outputPath,
      downloadUrl: `/api/export/cherry-video/download?file=${encodeURIComponent(outputFilename)}`,
      videoCount: videoFiles.length,
      duration: duration
    });

  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({
      error: 'Export failed',
      details: error.message
    }, { status: 500 });
  }
}

function runFFmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('Running FFmpeg:', args.join(' '));
    
    const ffmpeg = spawn(args[0], args.slice(1), {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    ffmpeg.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
      console.log('FFmpeg:', data.toString().trim());
    });
    
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log('FFmpeg completed successfully');
        resolve();
      } else {
        console.error('FFmpeg failed with code:', code);
        console.error('Stderr:', stderr.slice(-1000));
        reject(new Error(`FFmpeg exited with code ${code}: ${stderr.slice(-500)}`));
      }
    });
    
    ffmpeg.on('error', (err) => {
      reject(new Error(`Failed to spawn FFmpeg: ${err.message}`));
    });
  });
}