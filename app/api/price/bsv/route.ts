import { NextResponse } from 'next/server';

// Cache the price for 60 seconds to avoid rate limiting
let cachedPrice: { usd: number; timestamp: number } | null = null;
const CACHE_DURATION_MS = 60_000;

export async function GET() {
  try {
    // Check cache first
    if (cachedPrice && Date.now() - cachedPrice.timestamp < CACHE_DURATION_MS) {
      return NextResponse.json({
        bsv_usd: cachedPrice.usd,
        cached: true,
        timestamp: cachedPrice.timestamp,
      });
    }

    // Fetch from CoinGecko (free, no API key needed)
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin-cash-sv&vs_currencies=usd',
      {
        headers: { Accept: 'application/json' },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      // Return last cached price or fallback
      if (cachedPrice) {
        return NextResponse.json({
          bsv_usd: cachedPrice.usd,
          cached: true,
          stale: true,
          timestamp: cachedPrice.timestamp,
        });
      }
      // Fallback to approximate price
      return NextResponse.json({
        bsv_usd: 45,
        fallback: true,
        error: 'Price feed unavailable',
      });
    }

    const data = await response.json();
    const usdPrice = data['bitcoin-cash-sv']?.usd;

    if (!usdPrice) {
      return NextResponse.json({
        bsv_usd: cachedPrice?.usd || 45,
        fallback: true,
        error: 'Invalid price data',
      });
    }

    // Update cache
    cachedPrice = {
      usd: usdPrice,
      timestamp: Date.now(),
    };

    return NextResponse.json({
      bsv_usd: usdPrice,
      cached: false,
      timestamp: cachedPrice.timestamp,
    });
  } catch (error) {
    console.error('Error fetching BSV price:', error);
    return NextResponse.json({
      bsv_usd: cachedPrice?.usd || 45,
      fallback: true,
      error: 'Price fetch failed',
    });
  }
}
