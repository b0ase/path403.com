import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const prisma = getPrisma();

    // Query for audio assets from the database
    const assets = await prisma.video.findMany({
      include: { shares: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Filter for audio files based on extension
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a'];
    const marketAudio = assets
      .filter(v => {
        const url = v.url?.toLowerCase() || '';
        const filename = v.filename?.toLowerCase() || '';
        return audioExtensions.some(ext => url.endsWith(ext) || filename.endsWith(ext));
      })
      .map(video => {
        const totalShares = 1000;
        const soldShares = video.shares.reduce((acc, curr) => acc + curr.shares, 0);
        return {
          id: video.id,
          title: video.filename || 'Untitled Audio',
          artist: 'Unknown Artist',
          url: video.url,
          priceSats: video.framePriceSats || 500,
          totalSupply: totalShares,
          availableSupply: totalShares - soldShares,
          holders: video.shares.length,
          createdAt: video.createdAt
        };
      });

    return NextResponse.json({
      audio: marketAudio,
      total: marketAudio.length
    });

  } catch (error: any) {
    console.error('Audio Market API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch audio market' }, { status: 500 });
  }
}
