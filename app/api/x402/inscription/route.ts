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

/**
 * POST /api/x402/inscription
 *
 * Create a new BSV inscription for a payment proof
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      network,
      txId,
      payment,
      signature,
    } = body;

    if (!network || !txId) {
      return NextResponse.json({
        error: 'network and txId are required'
      }, { status: 400 });
    }

    const result = await createInscription(
      network,
      txId,
      payment || {
        from: 'unknown',
        to: 'unknown',
        amount: '0',
        asset: 'unknown',
      },
      signature || ''
    );

    if (!result.success) {
      return NextResponse.json({
        error: result.error || 'Failed to create inscription'
      }, { status: 500 });
    }

    return NextResponse.json({
      inscription_id: result.inscriptionId,
      txId: result.txId,
      explorer_url: `https://whatsonchain.com/tx/${result.txId}`,
      created_at: new Date().toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error('[x402/inscription] Error:', error);
    return NextResponse.json({
      error: 'Failed to create inscription'
    }, { status: 500 });
  }
}
