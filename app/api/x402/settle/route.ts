import { NextRequest, NextResponse } from 'next/server';
import {
  verifyPayment,
  createInscription,
  checkNonce,
  FEES,
  type SettleRequest,
  type SupportedNetwork,
} from '@/lib/x402';
import { sendBsvPayment } from '@/lib/bsv-send';

/**
 * POST /api/x402/settle
 *
 * Settle a payment. Can settle on origin chain or on BSV (cheapest).
 *
 * x402-compatible endpoint (matches Coinbase facilitator spec)
 */
export async function POST(request: NextRequest) {
  try {
    const body: SettleRequest & {
      settleOn?: SupportedNetwork;
    } = await request.json();

    const {
      x402Version,
      scheme,
      network,
      payload,
      paymentRequirements,
      settleOn = 'bsv', // Default to BSV (cheapest)
    } = body;
    const txId = body.txId || payload?.txId || payload?.authorization?.txId;

    // Validate request
    if (x402Version !== 1) {
      return NextResponse.json({
        success: false,
        error: 'Unsupported x402 version',
      }, { status: 400 });
    }

    if (!['exact', 'upto'].includes(scheme)) {
      return NextResponse.json({
        success: false,
        error: 'Unsupported payment scheme',
      }, { status: 400 });
    }

    const supportedNetworks: SupportedNetwork[] = ['bsv', 'base', 'solana', 'ethereum'];
    if (!supportedNetworks.includes(network)) {
      return NextResponse.json({
        success: false,
        error: `Unsupported origin network: ${network}`,
      }, { status: 400 });
    }

    if (!payload?.signature || !payload?.authorization) {
      return NextResponse.json({
        success: false,
        error: 'Missing signature or authorization',
      }, { status: 400 });
    }

    // Check nonce
    if (!await checkNonce(network, payload.authorization.nonce)) {
      return NextResponse.json({
        success: false,
        error: 'Nonce already used',
      }, { status: 400 });
    }

    // First, verify the payment
    if (txId) {
      payload.txId = txId;
    }

    const verification = await verifyPayment(network, payload);

    if (!verification.valid) {
      return NextResponse.json({
        success: false,
        error: verification.invalidReason,
      });
    }

    // Calculate fees
    const paymentAmount = parseInt(payload.authorization.value);
    const settlementFee = Math.ceil(paymentAmount * FEES.settlementPercent);
    const inscriptionFee = FEES.inscription;
    const totalFee = settlementFee + inscriptionFee;

    let settlementTxId = verification.txId || txId || generateMockTxId();

    if (settleOn === 'bsv') {
      const treasuryKey = process.env.TREASURY_PRIVATE_KEY || process.env.X402_TREASURY_PRIVATE_KEY;
      if (!treasuryKey) {
        return NextResponse.json({
          success: false,
          error: 'Treasury not configured',
        }, { status: 500 });
      }

      const amountSats = parseInt(paymentRequirements?.amount || payload.authorization.value);
      const recipient = paymentRequirements?.recipient || payload.authorization.to;

      if (!recipient || !amountSats) {
        return NextResponse.json({
          success: false,
          error: 'Missing recipient or amount for settlement',
        }, { status: 400 });
      }

      const payout = await sendBsvPayment({
        toAddress: recipient,
        amountSats,
        privateKeyWIF: treasuryKey,
      });

      settlementTxId = payout.txId;
    } else {
      return NextResponse.json({
        success: false,
        error: `Settlement chain not implemented: ${settleOn}`,
      }, { status: 501 });
    }

    // Inscribe the settlement proof on BSV
    const inscription = await createInscription(
      network,
      settlementTxId,
      {
        from: payload.authorization.from,
        to: payload.authorization.to,
        amount: payload.authorization.value,
        asset: paymentRequirements?.asset || 'USDC',
      },
      payload.signature,
      settleOn,
      settlementTxId
    );

    console.log(`[x402/settle] Payment settled`);
    console.log(`[x402/settle] Origin: ${network}`);
    console.log(`[x402/settle] Settlement chain: ${settleOn}`);
    console.log(`[x402/settle] Amount: ${payload.authorization.value}`);
    console.log(`[x402/settle] Fee: ${totalFee} sats`);

    return NextResponse.json({
      success: true,
      transaction: settlementTxId,
      network: settleOn,
      inscriptionId: inscription.inscriptionId,
      inscriptionTxId: inscription.txId,
      settlementChain: settleOn,
      fee: {
        settlement: settlementFee,
        inscription: inscriptionFee,
        total: totalFee,
        currency: 'sats',
      },
      // Cost comparison
      costComparison: {
        bsv: inscriptionFee + Math.ceil(paymentAmount * FEES.settlementPercent),
        base: estimateBaseFee(paymentAmount),
        solana: estimateSolanaFee(paymentAmount),
        ethereum: estimateEthereumFee(paymentAmount),
        cheapest: 'bsv',
      },
    });
  } catch (error) {
    console.error('[x402/settle] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal settlement error',
    }, { status: 500 });
  }
}

/**
 * GET /api/x402/settle
 *
 * Returns settlement service info
 */
export async function GET() {
  return NextResponse.json({
    service: 'PATH402.com x402 Settlement',
    version: '1.0.0',
    supportedNetworks: ['bsv', 'base', 'solana', 'ethereum'],
    defaultSettlementChain: 'bsv',
    fees: {
      settlementPercent: FEES.settlementPercent * 100 + '%',
      inscription: FEES.inscription,
      currency: 'sats',
    },
    features: {
      crossChainSettlement: true,
      inscribeOnBSV: true,
      cheapestRouting: true,
    },
  });
}

// Helper functions
function generateMockTxId(): string {
  const chars = '0123456789abcdef';
  let txId = '';
  for (let i = 0; i < 64; i++) {
    txId += chars[Math.floor(Math.random() * chars.length)];
  }
  return txId;
}

function estimateBaseFee(amount: number): number {
  // Base L2 fees are relatively low but variable
  return Math.max(100, Math.ceil(amount * 0.001)); // ~0.1%
}

function estimateSolanaFee(amount: number): number {
  // Solana has low fees
  return Math.max(50, Math.ceil(amount * 0.0005)); // ~0.05%
}

function estimateEthereumFee(amount: number): number {
  // Ethereum mainnet is expensive
  return Math.max(5000, Math.ceil(amount * 0.005)); // ~0.5%
}
