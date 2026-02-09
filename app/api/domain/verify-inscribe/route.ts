import { NextRequest, NextResponse } from 'next/server';
import { createAndBroadcastInscription } from '@/lib/bsv-inscribe';
import { verifyBsvMessageSignature, isValidBsvAddress } from '@/lib/bsv-domain-proof';

const TREASURY_ADDRESS = (process.env.X402_TREASURY_ADDRESS || process.env.TREASURY_ADDRESS || '').trim();
const TREASURY_PRIVATE_KEY = (process.env.X402_TREASURY_PRIVATE_KEY || process.env.TREASURY_PRIVATE_KEY || '').trim();

// POST /api/domain/verify-inscribe
// Broadcasts a domain-verify inscription (admin only)
export async function POST(request: NextRequest) {
  try {
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { domain, issuer_address, signature, message } = body;

    if (!domain || !issuer_address || !signature) {
      return NextResponse.json({
        error: 'domain, issuer_address, and signature are required',
      }, { status: 400 });
    }

    if (!isValidBsvAddress(issuer_address)) {
      return NextResponse.json({
        error: 'Invalid issuer_address',
      }, { status: 400 });
    }

    if (!TREASURY_ADDRESS || !TREASURY_PRIVATE_KEY) {
      return NextResponse.json({
        error: 'Treasury keys not configured',
      }, { status: 500 });
    }

    const canonicalMessage = message || `path402-domain:${domain}`;
    const signatureOk = verifyBsvMessageSignature({
      message: canonicalMessage,
      signature,
      address: issuer_address,
    });

    if (!signatureOk) {
      return NextResponse.json({
        error: 'Invalid signature for issuer_address',
      }, { status: 400 });
    }

    const payload = {
      p: '$402',
      op: 'domain-verify',
      domain,
      issuer_address,
      message: canonicalMessage,
      signature,
    };

    const { txId, inscriptionId } = await createAndBroadcastInscription({
      data: payload,
      contentType: 'application/json',
      toAddress: TREASURY_ADDRESS,
      privateKeyWIF: TREASURY_PRIVATE_KEY,
    });

    return NextResponse.json({
      success: true,
      tx_id: txId,
      inscription_id: inscriptionId,
      payload,
    });
  } catch (error) {
    console.error('[/api/domain/verify-inscribe] Error:', error);
    return NextResponse.json({ error: 'Failed to inscribe domain proof' }, { status: 500 });
  }
}
