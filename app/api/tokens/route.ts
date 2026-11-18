import { retired } from '@/lib/retired';
import { NextRequest, NextResponse } from 'next/server';
import { listTokens, registerToken, RegisterTokenRequest } from '@/lib/tokens';
import { verifyDomainOwnership } from '@/lib/domain-verification';

/**
 * GET /api/tokens
 *
 * List all active tokens with current prices
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const issuer = searchParams.get('issuer') || undefined;
    const content_type = searchParams.get('type') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    const tokens = await listTokens({ issuer, content_type, limit, offset });

    return NextResponse.json({
      tokens,
      count: tokens.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error('[/api/tokens GET] Error:', error);
    return NextResponse.json({ error: 'Failed to list tokens' }, { status: 500 });
  }
}

function extractDomain(address: string): string {
  const parts = address.split('/').filter(Boolean);
  if (!parts.length) return '';
  const root = parts[0];
  return root.startsWith('$') ? root.slice(1) : root;
}

// RETIRED 18 Nov 2026 (security): POST trusted an unauthenticated x-wallet-handle header. 410 only.
export const POST = retired;
