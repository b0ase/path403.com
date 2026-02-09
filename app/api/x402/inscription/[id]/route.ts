import { NextRequest, NextResponse } from 'next/server';
import { getInscription } from '@/lib/x402';

/**
 * GET /api/x402/inscription/[id]
 *
 * Retrieve an inscription by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({
        error: 'Inscription ID required',
      }, { status: 400 });
    }

    const inscription = await getInscription(id);

    if (!inscription) {
      return NextResponse.json({
        error: 'Inscription not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      id: inscription.id,
      txId: inscription.txId,
      blockHeight: inscription.blockHeight,
      timestamp: inscription.timestamp,
      fee: inscription.fee,
      proof: inscription.inscription,
      explorerUrl: `https://whatsonchain.com/tx/${inscription.txId}`,
    });
  } catch (error) {
    console.error('[x402/inscription] Error:', error);
    return NextResponse.json({
      error: 'Failed to retrieve inscription',
    }, { status: 500 });
  }
}
