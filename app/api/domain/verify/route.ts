import { NextRequest, NextResponse } from 'next/server';
import { verifyDomainOwnershipDetailed } from '@/lib/domain-verification';

// POST /api/domain/verify
// Verify DNS + HTTP + on-chain domain binding
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain, handle, issuer_address } = body;

    if (!domain || !handle || !issuer_address) {
      return NextResponse.json({
        error: 'domain, handle, and issuer_address are required',
      }, { status: 400 });
    }

    const result = await verifyDomainOwnershipDetailed(domain, handle, issuer_address);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[/api/domain/verify] Error:', error);
    return NextResponse.json({ error: 'Failed to verify domain' }, { status: 500 });
  }
}
