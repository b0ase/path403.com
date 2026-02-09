import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { writeFile, readdir } from 'fs/promises';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

const CHERRY_VIDEO_PATH = '/Users/b0ase/Desktop/cherry-graf-video-jam';
const MUSIC_PATH = '/Users/b0ase/Desktop'; // Look for music on desktop
const TEMP_PATH = '/tmp/cherry-export';
const OUTPUT_PATH = '/tmp/cherry-export/output';

export async function POST(request: NextRequest) {
  try {
    // Check if we're in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Export only available in development' }, { status: 403 });
    }

    const body = await request.json();
    const duration = body.duration || 100; // Default 100 seconds (1:40)

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
      ['.mp4', '.mov'].some(ext => file.toLowerCase().endsWith(ext))
    );

    if (videoFiles.length === 0) {
      return NextResponse.json({ error: 'No video files found' }, { status: 404 });
    }

    // Find music file
    let musicFile: string | null = null;
    try {
      const musicFiles = (await readdir(MUSIC_PATH)).filter(file => 
        ['.mp3', '.wav', '.m4a'].some(ext => file.toLowerCase().endsWith(ext))
      );
      if (musicFiles.length > 0) {
        musicFile = path.join(MUSIC_PATH, musicFiles[0]); // Use first music file found
        console.log(`Using music: ${musicFiles[0]}`);
      }
    } catch (error) {
      console.log('No music files found, creating video without audio');
    }

    // Generate chaotic sequence with many short clips
    const sequence = generateChaosSequence(videoFiles, duration);
    
    // Generate output filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFilename = `cherry-chaos-${timestamp}.mp4`;
    const outputPath = path.join(OUTPUT_PATH, outputFilename);

    // Build complex FFmpeg command for chaos
    const ffmpegArgs = await buildChaosFFmpegCommand(sequence, outputPath, duration, musicFile);

    console.log('Chaos FFmpeg command:', ffmpegArgs.slice(0, 20).join(' '), '... [truncated]');

    // Execute FFmpeg
    await runFFmpeg(ffmpegArgs);

    return NextResponse.json({
      success: true,
      outputFile: outputFilename,
      outputPath: outputPath,
      downloadUrl: `/api/export/cherry-video/download?file=${encodeURIComponent(outputFilename)}`,
      sequence: sequence.slice(0, 10), // Only return first 10 for response size
      totalClips: sequence.length,
      duration: duration
    });

  } catch (error: any) {
    console.error('Chaos export error:', error);
    return NextResponse.json({
      error: 'Chaos export failed',
      details: error.message
    }, { status: 500 });
  }
}

interface VideoClip {
  file: string;
  startTime: number;
  duration: number;
  sourceStart: number;
  effects: {
    glitch: boolean;
    reverse: boolean;
    speed: number;
    rgbShift: boolean;
    noise: boolean;
    flip: boolean;
  };
}

function generateChaosSequence(videoFiles: string[], duration: number) {
  const sequence: VideoClip[] = [];
  let currentTime = 0;
  
  while (currentTime < duration) {
    // Very short clips for chaos effect (100-800ms)
    const clipDuration = (100 + Math.random() * 700) / 1000;
    
    if (currentTime + clipDuration > duration) {
      break;
    }
    
    // Random video file
    const videoFile = videoFiles[Math.floor(Math.random() * videoFiles.length)];
    
    // Random start time in video (first 20 seconds to avoid long intros)
    const sourceStart = Math.random() * 20;
    
    // Random effects for this clip
    const effects = {
      glitch: Math.random() < 0.6,
      reverse: Math.random() < 0.2,
      speed: 0.5 + Math.random() * 3.0, // 0.5x to 3.5x speed
      rgbShift: Math.random() < 0.4,
      noise: Math.random() < 0.7,
      flip: Math.random() < 0.3
    };
    
    sequence.push({
      file: videoFile,
      startTime: currentTime,
      duration: clipDuration,
      sourceStart: sourceStart,
      effects: effects
    });
    
    currentTime += clipDuration;
  }
  
  console.log(`Generated ${sequence.length} chaos clips for ${duration}s video`);
  return sequence;
}

async function buildChaosFFmpegCommand(sequence: any[], outputPath: string, duration: number, musicFile?: string | null) {
  const args = ['ffmpeg', '-y'];
  
  // Add all unique video inputs
  const uniqueFiles = [...new Set(sequence.map(clip => clip.file))];
  const fileIndexMap = new Map();
  
  uniqueFiles.forEach((file, index) => {
    args.push('-i', path.join(CHERRY_VIDEO_PATH, file));
    fileIndexMap.set(file, index);
  });
  
  // Add music input if available
  let musicInputIndex = -1;
  if (musicFile && existsSync(musicFile)) {
    args.push('-i', musicFile);
    musicInputIndex = uniqueFiles.length;
    console.log(`Added music input at index ${musicInputIndex}: ${musicFile}`);
  }
  
  // Build complex filter chain
  const filterParts: string[] = [];
  const processedClips: string[] = [];
  
  sequence.forEach((clip, i) => {
    const inputIndex = fileIndexMap.get(clip.file);
    let filterChain = `[${inputIndex}:v]`;
    
    // Trim and timing
    filterChain += `trim=start=${clip.sourceStart}:duration=${clip.duration},setpts=PTS-STARTPTS`;
    
    // Speed effects
    if (clip.effects.speed !== 1) {
      filterChain += `,setpts=PTS/${clip.effects.speed}`;
    }
    
    // Reverse effect
    if (clip.effects.reverse) {
      filterChain += `,reverse`;
    }
    
    // Flip effect
    if (clip.effects.flip) {
      filterChain += `,hflip`;
    }
    
    // Cherry color grading (always applied)
    filterChain += `,colorbalance=rs=0.5:gs=-0.4:bs=-0.6`;
    filterChain += `,eq=contrast=1.4:brightness=0.15:saturation=1.5:gamma=1.1`;
    filterChain += `,hue=h=5:s=1.2`; // Slight red shift
    
    // Noise/glitch effects
    if (clip.effects.noise) {
      filterChain += `,noise=alls=15:allf=t+u`;
    }
    
    if (clip.effects.glitch) {
      // Add some digital glitch effects
      filterChain += `,unsharp=5:5:2.0:5:5:0.0`;
    }
    
    // RGB shift effect (simplified)
    if (clip.effects.rgbShift) {
      filterChain += `,chromashift=cbh=3:cbv=3:crh=-3:crv=-3`;
    }
    
    // Scale to consistent size and add slight blur for organic feel
    filterChain += `,scale=720:1280:flags=lanczos,unsharp=3:3:0.5`;
    
    filterChain += `[chaos${i}]`;
    filterParts.push(filterChain);
    processedClips.push(`[chaos${i}]`);
  });
  
  // Concatenate all clips
  const concatFilter = `${processedClips.join('')}concat=n=${sequence.length}:v=1:a=0[prechaos]`;
  filterParts.push(concatFilter);
  
  // Add final chaos effects to the whole video
  let finalFilter = '[prechaos]';
  
  // Final color enhancement (skip flicker for now to avoid escaping issues)
  finalFilter += 'colorbalance=rs=0.3:bs=-0.3';
  finalFilter += ',eq=contrast=1.2:brightness=0.1:saturation=1.4';
  
  // Add slight vignette
  finalFilter += ',vignette=angle=PI/4';
  
  finalFilter += '[final]';
  filterParts.push(finalFilter);
  
  // Write filter to file for debugging
  const filterComplex = filterParts.join(';');
  await writeFile(path.join(TEMP_PATH, 'chaos-filter.txt'), filterComplex);
  
  // Add filter to command
  args.push(
    '-filter_complex', filterComplex,
    '-map', '[final]'
  );
  
  // Add music mapping if available
  if (musicInputIndex >= 0) {
    args.push('-map', `${musicInputIndex}:a`);
    args.push('-c:a', 'aac', '-b:a', '128k');
    args.push('-shortest'); // Stop when shortest input ends
  }
  
  args.push(
    '-c:v', 'libx264',
    '-preset', 'medium',  // Better quality than ultrafast
    '-crf', '20',         // Higher quality
    '-pix_fmt', 'yuv420p',
    '-r', '30',
    '-movflags', '+faststart',
    '-t', duration.toString(),
    outputPath
  );
  
  return args;
}

function runFFmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('Running chaos FFmpeg...');
    
    const ffmpeg = spawn(args[0], args.slice(1), {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let stderr = '';
    let lastProgress = 0;
    
    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
      const output = data.toString();
      
      // Show progress occasionally
      const progressMatch = output.match(/time=(\d{2}:\d{2}:\d{2})/);
      if (progressMatch) {
        const timeStr = progressMatch[1];
        const [hours, minutes, seconds] = timeStr.split(':').map(Number);
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        
        if (totalSeconds > lastProgress + 5) { // Log every 5 seconds
          console.log(`FFmpeg progress: ${timeStr}`);
          lastProgress = totalSeconds;
        }
      }
    });
    
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log('Chaos FFmpeg completed successfully');
        resolve();
      } else {
        console.error('Chaos FFmpeg failed with code:', code);
        console.error('Last stderr:', stderr.slice(-1000));
        reject(new Error(`FFmpeg exited with code ${code}: ${stderr.slice(-500)}`));
      }
    });
    
    ffmpeg.on('error', (err) => {
      reject(new Error(`Failed to spawn FFmpeg: ${err.message}`));
    });
  });
}