import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { writeFile, readdir, unlink } from 'fs/promises';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

const CHERRY_VIDEO_PATH = '/Users/b0ase/Desktop/cherry-graf-video-jam';
const TEMP_PATH = '/tmp/cherry-export';
const OUTPUT_PATH = '/tmp/cherry-export/output';

interface ChaosSettings {
  jumpCutSpeed: number;
  glitchIntensity: number;
  effects: {
    glitch: boolean;
    strobe: boolean;
    rgbShift: boolean;
    reverse: boolean;
    cherryFilter: boolean;
    speedMultiplier: number;
  };
  duration: number; // in seconds
}

export async function POST(request: NextRequest) {
  try {
    // Check if we're in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Export only available in development' }, { status: 403 });
    }

    const body = await request.json();
    const settings: ChaosSettings = {
      jumpCutSpeed: body.jumpCutSpeed || 250,
      glitchIntensity: body.glitchIntensity || 60,
      effects: body.effects || {
        glitch: true,
        strobe: true,
        rgbShift: true,
        reverse: false,
        cherryFilter: true,
        speedMultiplier: 1.2
      },
      duration: body.duration || 100 // 1:40 = 100 seconds
    };

    // Ensure temp directories exist
    if (!existsSync(TEMP_PATH)) {
      mkdirSync(TEMP_PATH, { recursive: true });
    }
    if (!existsSync(OUTPUT_PATH)) {
      mkdirSync(OUTPUT_PATH, { recursive: true });
    }

    // Get all video files
    const files = await readdir(CHERRY_VIDEO_PATH);
    const videoFiles = files.filter(file => 
      ['.mp4', '.mov', '.avi', '.mkv'].some(ext => file.toLowerCase().endsWith(ext))
    );

    if (videoFiles.length === 0) {
      return NextResponse.json({ error: 'No video files found' }, { status: 404 });
    }

    // Generate chaotic edit sequence
    const editSequence = generateChaosSequence(videoFiles, settings);
    
    // Create FFmpeg filter complex for chaos effects
    const filterComplex = createChaosFilterComplex(editSequence, settings);
    
    // Write filter complex to file for debugging
    await writeFile(path.join(TEMP_PATH, 'filter.txt'), filterComplex);
    
    // Generate output filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFilename = `cherry-chaos-${timestamp}.mp4`;
    const outputPath = path.join(OUTPUT_PATH, outputFilename);

    // Build FFmpeg command
    const ffmpegArgs = [
      '-y', // Overwrite output files
      ...buildInputArgs(videoFiles),
      '-filter_complex', filterComplex,
      '-map', '[final]',
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23',
      '-r', '30', // 30 fps
      '-t', settings.duration.toString(),
      outputPath
    ];

    console.log('Running FFmpeg with args:', ffmpegArgs.join(' '));

    // Execute FFmpeg
    await runFFmpeg(ffmpegArgs);

    return NextResponse.json({
      success: true,
      outputFile: outputFilename,
      outputPath: outputPath,
      downloadUrl: `/api/export/cherry-video/download?file=${encodeURIComponent(outputFilename)}`,
      sequence: editSequence,
      settings: settings
    });

  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({
      error: 'Export failed',
      details: error.message
    }, { status: 500 });
  }
}

function generateChaosSequence(videoFiles: string[], settings: ChaosSettings) {
  const sequence = [];
  let currentTime = 0;
  
  while (currentTime < settings.duration) {
    // Random clip duration based on jumpCutSpeed (convert to seconds)
    const clipDuration = (settings.jumpCutSpeed + Math.random() * 500) / 1000;
    
    if (currentTime + clipDuration > settings.duration) {
      break;
    }
    
    // Random video file
    const videoFile = videoFiles[Math.floor(Math.random() * videoFiles.length)];
    
    // Random start time in video (assume max 30 seconds per clip)
    const startTime = Math.random() * 30;
    
    // Random effects for this clip
    const clipEffects = {
      glitch: Math.random() < 0.7,
      strobe: Math.random() < 0.3,
      rgbShift: Math.random() < 0.6,
      reverse: Math.random() < 0.2,
      speed: 0.5 + Math.random() * 2.5
    };
    
    sequence.push({
      file: videoFile,
      startTime: currentTime,
      duration: clipDuration,
      sourceStart: startTime,
      effects: clipEffects
    });
    
    currentTime += clipDuration;
  }
  
  return sequence;
}

function createChaosFilterComplex(sequence: any[], settings: ChaosSettings) {
  let filterLines = [];
  let inputIndex = 0;
  
  // Create a map of unique video files to input indices
  const fileToIndex = new Map();
  sequence.forEach(clip => {
    if (!fileToIndex.has(clip.file)) {
      fileToIndex.set(clip.file, inputIndex++);
    }
  });
  
  // Process each clip with effects
  const processedClips = sequence.map((clip, i) => {
    const inputIdx = fileToIndex.get(clip.file);
    let filterChain = `[${inputIdx}:v]`;
    
    // Trim to specific time range
    filterChain += `trim=start=${clip.sourceStart}:duration=${clip.duration},setpts=PTS-STARTPTS`;
    
    // Apply speed change
    if (clip.effects.speed !== 1) {
      filterChain += `,setpts=PTS/${clip.effects.speed}`;
    }
    
    // Apply reverse effect
    if (clip.effects.reverse) {
      filterChain += `,reverse`;
    }
    
    // Cherry color filter (always on)
    filterChain += `,colorbalance=rs=0.4:gs=-0.3:bs=-0.5`;
    filterChain += `,eq=contrast=1.2:brightness=0.1:saturation=1.3`;
    
    // RGB shift effect
    if (clip.effects.rgbShift) {
      filterChain += `,split=3[r][g][b];[r]lutrgb=r=val*1.2[rr];[g]lutrgb=g=val*0.8[gg];[b]lutrgb=b=val*0.6[bb];[rr][gg][bb]blend=all_mode=screen`;
    }
    
    // Add noise for glitch effect
    if (clip.effects.glitch) {
      filterChain += `,noise=alls=20:allf=t+u`;
    }
    
    filterLines.push(`${filterChain}[clip${i}]`);
    return `[clip${i}]`;
  });
  
  // Concatenate all clips
  const concatFilter = `${processedClips.join('')}concat=n=${processedClips.length}:v=1[final]`;
  filterLines.push(concatFilter);
  
  return filterLines.join(';');
}

function buildInputArgs(videoFiles: string[]) {
  const args = [];
  const uniqueFiles = [...new Set(videoFiles)]; // Remove duplicates
  
  for (const file of uniqueFiles) {
    args.push('-i', path.join(CHERRY_VIDEO_PATH, file));
  }
  
  return args;
}

function runFFmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', args, {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let stderr = '';
    
    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
      console.log('FFmpeg:', data.toString());
    });
    
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg exited with code ${code}: ${stderr}`));
      }
    });
    
    ffmpeg.on('error', (err) => {
      reject(new Error(`Failed to spawn FFmpeg: ${err.message}`));
    });
  });
}