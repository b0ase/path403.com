import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'content', 'pages', 'contact.md');

    if (fs.existsSync(filePath)) {
      const markdown = fs.readFileSync(filePath, 'utf-8');

      return new NextResponse(markdown, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
  } catch (error) {
    console.error('Error serving markdown:', error);
  }

  return new NextResponse('Not Found', { status: 404 });
}
