import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/developers/tokens
 * Returns developers who have issued tokens on the platform
 */
export async function GET(request: NextRequest) {
  try {
    const prisma = getPrisma();

    // Fetch developers with tokens from identity_tokens table
    const developersWithTokens = await prisma.identity_tokens.findMany({
      where: {
        token_type: 'DEVELOPER',
        is_active: true,
      },
      include: {
        profiles: {
          select: {
            id: true,
            display_name: true,
            avatar_url: true,
            github_username: true,
            github_verified: true,
          }
        },
        token_market_data: {
          take: 1,
          orderBy: { updated_at: 'desc' }
        }
      },
      orderBy: { created_at: 'desc' },
      take: 50,
    });

    // Format the response
    const developers = developersWithTokens.map(token => {
      const profile = token.profiles;
      const marketData = token.token_market_data?.[0];

      return {
        id: token.id,
        name: profile?.display_name || token.display_name || 'Anonymous Developer',
        handle: profile?.github_username || token.token_symbol?.toLowerCase() || 'unknown',
        ticker: token.token_symbol,
        avatar: profile?.avatar_url || null,
        skills: [], // Could be populated from a skills table
        price: marketData ? Number(marketData.price_usd) : 0.001,
        change24h: marketData ? Number(marketData.change_24h) : 0,
        marketCap: marketData ? Number(marketData.market_cap) : 10000,
        holders: 0, // Could be counted from developer_token_holders
        verified: profile?.github_verified || false,
        totalSupply: token.total_supply ? Number(token.total_supply) : 1000000,
        createdAt: token.created_at,
      };
    });

    return NextResponse.json(developers);
  } catch (error) {
    console.error('[Developers Tokens API] Error:', error);

    // Return empty array on error - UI will show demo data
    return NextResponse.json([]);
  }
}
