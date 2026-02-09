import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const prisma = getPrisma();
    const videos = await prisma.video.findMany({
        include: {
            shares: true // To calculate sold shares
        },
        orderBy: { createdAt: 'desc' }
    });

    const marketVideos = videos.map(video => {
        const totalShares = 1000; // Hardcoded supply for now (1000 shares per video)
        const soldShares = video.shares.reduce((acc, curr) => acc + curr.shares, 0);
        
        return {
            id: video.id,
            title: video.filename,
            url: video.url,
            thumbnail: video.url + '#t=0.5', // Simple thumbnail hack
            priceSats: video.framePriceSats || 1000, // Default price
            totalSupply: totalShares,
            availableSupply: totalShares - soldShares,
            holders: video.shares.length,
            marketCapSats: totalShares * (video.framePriceSats || 1000)
        };
    });

    return NextResponse.json({ videos: marketVideos });

  } catch (error: any) {
    console.error('Market API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
