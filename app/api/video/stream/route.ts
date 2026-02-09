import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Whitelisted paths for security
const ALLOWED_ROOTS = [
  '/Users/b0ase/Projects',
  '/Volumes/2026/Projects',
  '/Volumes/2026/iCloud-Backup'
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filePath = searchParams.get('path');

  if (!filePath) {
    return new NextResponse('Missing path', { status: 400 });
  }

  // Security Check: Ensure path is strict and absolute
  // In a real app we'd be stricter, but for local dev tool:
  const decodedPath = decodeURIComponent(filePath);
  
  // Verify it starts with allowed root
  const isAllowed = ALLOWED_ROOTS.some(root => decodedPath.startsWith(root));
  if (!isAllowed) {
    return new NextResponse('Forbidden path', { status: 403 });
  }

  if (!fs.existsSync(decodedPath)) {
    return new NextResponse('File not found', { status: 404 });
  }

  const stat = fs.statSync(decodedPath);
  const fileSize = stat.size;
  const range = req.headers.get('range');

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(decodedPath, { start, end });
    
    // Create a ReadableStream from the Node stream
    const stream = new ReadableStream({
        start(controller) {
          file.on('data', (chunk) => controller.enqueue(chunk));
          file.on('end', () => controller.close());
          file.on('error', (err) => controller.error(err));
        },
      });

    const headers = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4', // Naive type detection, acceptable for dev
    };

    return new NextResponse(stream, { status: 206, headers });
  } else {
    const headers = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4', 
    };
    const file = fs.createReadStream(decodedPath);
    // Convert to ReadableStream
      const stream = new ReadableStream({
        start(controller) {
          file.on('data', (chunk) => controller.enqueue(chunk));
          file.on('end', () => controller.close());
          file.on('error', (err) => controller.error(err));
        },
      });
    return new NextResponse(stream, { status: 200, headers });
  }
}
