import { NextRequest, NextResponse } from 'next/server';
import {
  verifyPayment,
  createInscription,
  checkNonce,
  FEES,
  type VerifyRequest,
  type SupportedNetwork,
} from '@/lib/x402';

/**
 * POST /api/x402/verify
 *
 * Verify a payment signature from any supported chain.
 * Optionally inscribes the proof on BSV.
 *
 * x402-compatible endpoint (matches Coinbase facilitator spec)
 */
export async function POST(request: NextRequest) {
  try {
    const body: VerifyRequest & { inscribe?: boolean } = await request.json();

    const { x402Version, scheme, network, payload, inscribe = true } = body;
    const txId = body.txId || payload?.txId || payload?.authorization?.txId;
    const asset = body.asset || payload?.authorization?.asset || 'USDC';

    // Validate request
    if (x402Version !== 1) {
      return NextResponse.json({
        valid: false,
        invalidReason: 'Unsupported x402 version',
      }, { status: 400 });
    }

    if (!['exact', 'upto'].includes(scheme)) {
      return NextResponse.json({
        valid: false,
        invalidReason: 'Unsupported payment scheme',
      }, { status: 400 });
    }

    const supportedNetworks: SupportedNetwork[] = ['bsv', 'base', 'solana', 'ethereum'];
    if (!supportedNetworks.includes(network)) {
      return NextResponse.json({
        valid: false,
        invalidReason: `Unsupported network: ${network}. Supported: ${supportedNetworks.join(', ')}`,
      }, { status: 400 });
    }

    if (!payload?.signature || !payload?.authorization) {
      return NextResponse.json({
        valid: false,
        invalidReason: 'Missing signature or authorization in payload',
      }, { status: 400 });
    }

    // Check nonce hasn't been used (replay protection)
    if (!await checkNonce(network, payload.authorization.nonce)) {
      return NextResponse.json({
        valid: false,
        invalidReason: 'Nonce already used',
      }, { status: 400 });
    }

    // Verify the payment on the origin chain
    // Pass through optional txId for on-chain verification
    if (txId) {
      payload.txId = txId;
    }

    const verification = await verifyPayment(network, payload);

    if (!verification.valid) {
      return NextResponse.json({
        valid: false,
        invalidReason: verification.invalidReason,
      });
    }

    // Optionally inscribe the proof on BSV
    let inscriptionId: string | undefined;
    let inscriptionTxId: string | undefined;

    if (inscribe) {
      const originTxId = verification.txId || txId;
      if (!originTxId) {
        return NextResponse.json({
          valid: false,
          invalidReason: 'Missing origin txId for inscription',
        }, { status: 400 });
      }

      const inscription = await createInscription(
        network,
        originTxId,
        {
          from: payload.authorization.from,
          to: payload.authorization.to,
          amount: payload.authorization.value,
          asset,
        },
        payload.signature
      );

      if (inscription.success) {
        inscriptionId = inscription.inscriptionId;
        inscriptionTxId = inscription.txId;
      }
    }

    return NextResponse.json({
      valid: true,
      txId: verification.txId,
      amount: verification.amount,
      sender: verification.sender,
      recipient: verification.recipient,
      inscriptionId,
      inscriptionTxId,
      fee: {
        verification: FEES.verification,
        inscription: inscribe ? FEES.inscription : 0,
        total: FEES.verification + (inscribe ? FEES.inscription : 0),
      },
    });
  } catch (error) {
    console.error('[x402/verify] Error:', error);
    return NextResponse.json({
      valid: false,
      invalidReason: 'Internal verification error',
    }, { status: 500 });
  }
}

/**
 * GET /api/x402/verify
 *
 * Returns verification service info
 */
export async function GET() {
  return NextResponse.json({
    service: 'PATH402.com x402 Verifier',
    version: '1.0.0',
    supportedNetworks: ['bsv', 'base', 'solana', 'ethereum'],
    supportedSchemes: ['exact', 'upto'],
    fees: {
      verification: FEES.verification,
      inscription: FEES.inscription,
      currency: 'sats',
    },
    features: {
      inscribeOnBSV: true,
      multiChainVerification: true,
    },
  });
}
