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

/**
 * POST /api/tokens
 *
 * Register a new $address token
 */
export async function POST(request: NextRequest) {
  try {
    // Get issuer from auth headers
    const issuerHandle = request.headers.get('x-wallet-handle');
    const provider = request.headers.get('x-wallet-provider');

    if (!issuerHandle || !provider) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body: RegisterTokenRequest = await request.json();

    // Validate required fields
    if (!body.address || !body.name) {
      return NextResponse.json({ error: 'address and name are required' }, { status: 400 });
    }

    // Validate $address format
    if (!body.address.startsWith('$')) {
      return NextResponse.json({ error: 'Address must start with $' }, { status: 400 });
    }

    if (!body.issuer_address) {
      return NextResponse.json({ error: 'issuer_address is required' }, { status: 400 });
    }

    // Validate access mode + usage pricing consistency
    if (body.access_mode && !['token', 'usage', 'hybrid', 'public'].includes(body.access_mode)) {
      return NextResponse.json({ error: 'Invalid access_mode' }, { status: 400 });
    }

    if (body.access_mode && (body.access_mode === 'usage' || body.access_mode === 'hybrid')) {
      if (!body.usage_pricing || !body.usage_pricing.unit_ms || !body.usage_pricing.price_sats_per_unit) {
        return NextResponse.json({
          error: 'usage_pricing is required for access_mode usage/hybrid',
        }, { status: 400 });
      }
    }

    const domain = extractDomain(body.address);
    const verified = await verifyDomainOwnership(domain, issuerHandle, body.issuer_address);
    if (!verified) {
      return NextResponse.json({
        error: 'Domain ownership verification failed',
        details: `Add a TXT record at _path402.${domain} with value path402=${issuerHandle} and issuer_address=${body.issuer_address}, and configure https://${domain}/.well-known/path402.json with issuer + issuer_address + on-chain signature.`,
      }, { status: 403 });
    }

    const token = await registerToken(issuerHandle, body);

    return NextResponse.json({
      success: true,
      token,
    }, { status: 201 });
  } catch (error) {
    console.error('[/api/tokens POST] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to register token';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function extractDomain(address: string): string {
  const parts = address.split('/').filter(Boolean);
  if (!parts.length) return '';
  const root = parts[0];
  return root.startsWith('$') ? root.slice(1) : root;
}
