import { NextRequest, NextResponse } from 'next/server';

// POST /api/domain/verify-payload
// Generates a domain-verify payload and message template for signing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain, issuer_address, message } = body;

    if (!domain || !issuer_address) {
      return NextResponse.json({
        error: 'domain and issuer_address are required',
      }, { status: 400 });
    }

    const canonicalMessage = message || `path402-domain:${domain}`;

    return NextResponse.json({
      message: canonicalMessage,
      payload: {
        p: '$402',
        op: 'domain-verify',
        domain,
        issuer_address,
        message: canonicalMessage,
      },
    });
  } catch (error) {
    console.error('[/api/domain/verify-payload] Error:', error);
    return NextResponse.json({ error: 'Failed to generate payload' }, { status: 500 });
  }
}
