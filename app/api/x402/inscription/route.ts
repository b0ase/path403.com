import { retired } from '@/lib/retired';
import { NextRequest, NextResponse } from 'next/server';
import { createInscription, getInscription } from '@/lib/x402';

/**
 * GET /api/x402/inscription
 * GET /api/x402/inscription?id=xxx
 *
 * Retrieve inscription details by ID
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({
      service: 'PATH402.com x402 Inscription',
      version: '1.0.0',
      usage: {
        get: '/api/x402/inscription?id=xxx',
        create: 'POST /api/x402/inscription',
      },
      explorer: 'https://whatsonchain.com',
    });
  }

  const inscription = await getInscription(id);
  if (!inscription) {
    return NextResponse.json({ error: 'Inscription not found' }, { status: 404 });
  }

  let content: object = {};
  try {
    content = JSON.parse(inscription.inscription || '{}');
  } catch {
    content = {};
  }

  return NextResponse.json({
    inscription_id: inscription.id,
    txId: inscription.txId,
    content_type: 'application/json',
    content,
    explorer_url: `https://whatsonchain.com/tx/${inscription.txId}`,
    created_at: inscription.timestamp,
  });
}

// RETIRED 18 Nov 2026 (security): POST took any {network, txId} with no authentication and broadcast an
// inscription paid from the treasury key. 410 only; settlement inscribes via /api/x402/settle after a verified payment.
export const POST = retired;
