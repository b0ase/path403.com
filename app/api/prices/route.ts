import { NextRequest, NextResponse } from 'next/server';
import { getAllPrices, getPrice, type SupportedChain } from '@/lib/prices';

export const runtime = 'edge';
export const revalidate = 60; // Cache for 60 seconds

/**
 * GET /api/prices - Get cryptocurrency prices
 * Query params:
 * - chain: specific chain (bsv, eth, sol) or omit for all
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const chain = searchParams.get('chain') as SupportedChain | null;

    if (chain) {
      // Get single chain price
      if (!['bsv', 'eth', 'sol'].includes(chain)) {
        return NextResponse.json(
          { error: 'Invalid chain. Must be bsv, eth, or sol' },
          { status: 400 }
        );
      }

      const price = await getPrice(chain);
      return NextResponse.json({ [chain]: price });
    } else {
      // Get all prices
      const prices = await getAllPrices();
      return NextResponse.json(prices);
    }
  } catch (error) {
    console.error('Error fetching prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cryptocurrency prices' },
      { status: 500 }
    );
  }
}
