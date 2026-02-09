import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Whitelisted paths for security
const ALLOWED_ROOTS = [
  '/Users/b0ase/Projects',
  '/Volumes/2026/Projects'
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filePath = searchParams.get('path');

  if (!filePath) {
    return new NextResponse('Missing path', { status: 400 });
  }

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

  // Detect content type from extension
  const ext = path.extname(decodedPath).toLowerCase();
  const contentTypes: Record<string, string> = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4',
    '.aac': 'audio/aac',
    '.flac': 'audio/flac',
  };
  const contentType = contentTypes[ext] || 'audio/mpeg';

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(decodedPath, { start, end });

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
      'Content-Type': contentType,
    };

    return new NextResponse(stream, { status: 206, headers });
  } else {
    const headers = {
      'Content-Length': fileSize,
      'Content-Type': contentType,
    };
    const file = fs.createReadStream(decodedPath);
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
