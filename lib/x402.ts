/**
 * x402 Facilitator Library
 *
 * Provides payment verification, settlement, and inscription services
 * for the $402 protocol. Compatible with Coinbase x402 specification.
 */

// Types
export type SupportedNetwork = 'bsv' | 'base' | 'solana' | 'ethereum';

export interface VerifyRequest {
  x402Version: number;
  scheme: 'exact' | 'upto';
  network: SupportedNetwork;
  txId?: string;
  asset?: string;
  payload: {
    signature: string;
    authorization: {
      from: string;
      to: string;
      value: string;
      nonce: string;
      txId?: string;
      asset?: string;
      validAfter?: string;
      validBefore?: string;
    };
    txId?: string;
    asset?: string;
  };
}

export interface SettleRequest extends VerifyRequest {
  paymentRequirements?: {
    asset: string;
    amount: string;
    recipient: string;
  };
}

export interface VerificationResult {
  valid: boolean;
  invalidReason?: string;
  txId?: string;
  amount?: number;
  recipient?: string;
  sender?: string;
}

export interface InscriptionResult {
  success: boolean;
  inscriptionId?: string;
  txId?: string;
  error?: string;
}

// Fee configuration
export const FEES = {
  verification: 200,      // sats per verification
  inscription: 500,       // sats per inscription
  settlementPercent: 0.001, // 0.1% settlement fee
};

// Network configuration
export const NETWORK_CONFIG: Record<SupportedNetwork, {
  name: string;
  chainId: number | string;
  explorerUrl: string;
  rpcUrl?: string;
}> = {
  bsv: {
    name: 'Bitcoin SV',
    chainId: 'mainnet',
    explorerUrl: 'https://whatsonchain.com',
  },
  base: {
    name: 'Base (Coinbase L2)',
    chainId: 8453,
    explorerUrl: 'https://basescan.org',
  },
  solana: {
    name: 'Solana',
    chainId: 'mainnet-beta',
    explorerUrl: 'https://solscan.io',
  },
  ethereum: {
    name: 'Ethereum',
    chainId: 1,
    explorerUrl: 'https://etherscan.io',
  },
};

// Supported assets per network
export const SUPPORTED_ASSETS: Record<SupportedNetwork, string[]> = {
  bsv: ['BSV', 'BSV-20'],
  base: ['USDC', 'ETH'],
  solana: ['USDC', 'SOL'],
  ethereum: ['USDC', 'ETH', 'USDT'],
};

import { supabase, isDbConnected } from '@/lib/supabase';
import { verifyBsvPaymentTx } from '@/lib/bsv-verify';
import { createAndBroadcastInscription } from '@/lib/bsv-inscribe';

const X402_NONCE_TTL_SECONDS = parseInt(process.env.X402_NONCE_TTL_SECONDS || '300', 10);
const X402_VERIFY_REQUIRE_TX = (process.env.X402_VERIFY_REQUIRE_TX || 'true').toLowerCase() === 'true';
const X402_TREASURY_ADDRESS = (process.env.X402_TREASURY_ADDRESS || process.env.TREASURY_ADDRESS || '').trim();
const X402_TREASURY_PRIVATE_KEY = (process.env.X402_TREASURY_PRIVATE_KEY || process.env.TREASURY_PRIVATE_KEY || '').trim();

// Nonce tracking fallback (in-memory)
const usedNonces = new Map<string, Set<string>>();

/**
 * Check if a nonce has already been used (replay protection)
 */
export async function checkNonce(network: SupportedNetwork, nonce: string): Promise<boolean> {
  if (!nonce) return false;

  if (isDbConnected() && supabase) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + X402_NONCE_TTL_SECONDS * 1000).toISOString();

    // Clean expired nonces (best-effort)
    await supabase.from('x402_nonces').delete().lt('expires_at', now.toISOString());

    const { error } = await supabase
      .from('x402_nonces')
      .insert({
        network,
        nonce,
        used_at: now.toISOString(),
        expires_at: expiresAt,
      });

    if (error) {
      // Duplicate nonce or insert failure
      if (error.code === '23505' || error.message?.toLowerCase().includes('duplicate')) {
        return false;
      }
      console.warn('[x402] nonce insert failed:', error.message);
      return false;
    }

    return true;
  }

  // In-memory fallback
  const key = `${network}`;
  if (!usedNonces.has(key)) {
    usedNonces.set(key, new Set());
  }
  const networkNonces = usedNonces.get(key)!;
  if (networkNonces.has(nonce)) return false;
  networkNonces.add(nonce);
  return true;
}

/**
 * Verify a payment signature on the origin chain
 */
export async function verifyPayment(
  network: SupportedNetwork,
  payload: VerifyRequest['payload']
): Promise<VerificationResult> {
  try {
    switch (network) {
      case 'bsv':
        return await verifyBSVPayment(payload);
      case 'base':
        return await verifyBasePayment(payload);
      case 'solana':
        return await verifySolanaPayment(payload);
      case 'ethereum':
        return await verifyEthereumPayment(payload);
      default:
        return { valid: false, invalidReason: 'Unsupported network' };
    }
  } catch (error) {
    console.error(`[x402] Verification error on ${network}:`, error);
    return { valid: false, invalidReason: 'Verification failed' };
  }
}

/**
 * Create a BSV inscription for payment proof
 */
export async function createInscription(
  originNetwork: SupportedNetwork,
  originTxId: string,
  payment: {
    from: string;
    to: string;
    amount: string;
    asset: string;
  },
  signature: string,
  settledOn?: SupportedNetwork,
  settlementTxId?: string
): Promise<InscriptionResult> {
  try {
    if (!X402_TREASURY_ADDRESS || !X402_TREASURY_PRIVATE_KEY) {
      return { success: false, error: 'Treasury keys not configured' };
    }

    const content = {
      type: 'x402_payment_proof',
      version: '1.0.0',
      origin: {
        network: originNetwork,
        txId: originTxId,
      },
      payment,
      signature,
      settlement: settledOn ? {
        network: settledOn,
        txId: settlementTxId,
      } : undefined,
      timestamp: new Date().toISOString(),
      facilitator: 'path402.com',
    };

    const { txId, inscriptionId } = await createAndBroadcastInscription({
      data: content,
      contentType: 'application/json',
      toAddress: X402_TREASURY_ADDRESS,
      privateKeyWIF: X402_TREASURY_PRIVATE_KEY,
    });

    if (isDbConnected() && supabase) {
      await supabase.from('x402_inscriptions').insert({
        inscription_id: inscriptionId,
        tx_id: txId,
        origin_network: originNetwork,
        origin_tx_id: originTxId,
        payment_from: payment.from,
        payment_to: payment.to,
        payment_amount: payment.amount,
        payment_asset: payment.asset,
        signature,
        settlement_network: settledOn || null,
        settlement_tx_id: settlementTxId || null,
        content_json: content,
      });
    }

    return {
      success: true,
      inscriptionId,
      txId,
    };
  } catch (error) {
    console.error('[x402] Inscription error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create inscription',
    };
  }
}

/**
 * Get inscription statistics
 */
export async function getInscriptionStats() {
  if (isDbConnected() && supabase) {
    const { data } = await supabase
      .from('x402_inscriptions')
      .select('origin_network', { count: 'exact' });

    const byChain: Record<SupportedNetwork, number> = {
      bsv: 0,
      base: 0,
      solana: 0,
      ethereum: 0,
    };

    (data || []).forEach((row: { origin_network: SupportedNetwork }) => {
      if (row.origin_network && byChain[row.origin_network] !== undefined) {
        byChain[row.origin_network] += 1;
      }
    });

    return {
      totalInscriptions: (data || []).length,
      totalFees: (data || []).length * FEES.inscription,
      byChain,
    };
  }

  return {
    totalInscriptions: 0,
    totalFees: 0,
    byChain: {
      bsv: 0,
      base: 0,
      solana: 0,
      ethereum: 0,
    },
  };
}

/**
 * Get a single inscription by ID
 */
export async function getInscription(id: string): Promise<{
  id: string;
  txId: string;
  blockHeight: number | null;
  timestamp: string;
  fee: number;
  inscription: string;
} | null> {
  if (isDbConnected() && supabase) {
    const { data } = await supabase
      .from('x402_inscriptions')
      .select('*')
      .or(`inscription_id.eq.${id},tx_id.eq.${id}`)
      .single();

    if (!data) return null;

    return {
      id: data.inscription_id,
      txId: data.tx_id,
      blockHeight: null,
      timestamp: data.created_at,
      fee: FEES.inscription,
      inscription: JSON.stringify(data.content_json || {}),
    };
  }

  return null;
}

// Network-specific verification functions

async function verifyBSVPayment(payload: VerifyRequest['payload']): Promise<VerificationResult> {
  const txId = payload.txId || payload.authorization?.txId;
  const expectedTo = payload.authorization?.to;
  const expectedAmount = parseInt(payload.authorization?.value || '0');

  if (X402_VERIFY_REQUIRE_TX && !txId) {
    return { valid: false, invalidReason: 'Missing txId for BSV verification' };
  }

  if (!txId || !expectedTo || !expectedAmount) {
    return { valid: false, invalidReason: 'Missing required payment fields' };
  }

  const result = await verifyBsvPaymentTx({
    txId,
    expectedAddress: expectedTo,
    minSats: expectedAmount,
  });

  const verification: VerificationResult = {
    valid: result.valid,
    txId,
    amount: expectedAmount,
    recipient: expectedTo,
    sender: payload.authorization?.from,
    invalidReason: result.valid ? undefined : 'Payment not found on-chain',
  };

  await recordVerification(networkSafe('bsv'), verification);

  return verification;
}

async function verifyBasePayment(payload: VerifyRequest['payload']): Promise<VerificationResult> {
  const txId = payload.txId || payload.authorization?.txId;
  if (X402_VERIFY_REQUIRE_TX && !txId) {
    return { valid: false, invalidReason: 'Missing txId for Base verification' };
  }
  return { valid: false, invalidReason: 'Base verification not implemented yet' };
}

async function verifySolanaPayment(payload: VerifyRequest['payload']): Promise<VerificationResult> {
  const txId = payload.txId || payload.authorization?.txId;
  if (X402_VERIFY_REQUIRE_TX && !txId) {
    return { valid: false, invalidReason: 'Missing txId for Solana verification' };
  }
  return { valid: false, invalidReason: 'Solana verification not implemented yet' };
}

async function verifyEthereumPayment(payload: VerifyRequest['payload']): Promise<VerificationResult> {
  const txId = payload.txId || payload.authorization?.txId;
  if (X402_VERIFY_REQUIRE_TX && !txId) {
    return { valid: false, invalidReason: 'Missing txId for Ethereum verification' };
  }
  return { valid: false, invalidReason: 'Ethereum verification not implemented yet' };
}

async function recordVerification(network: SupportedNetwork, verification: VerificationResult) {
  if (!isDbConnected() || !supabase) return;

  await supabase.from('x402_verifications').insert({
    network,
    tx_id: verification.txId || null,
    amount_sats: verification.amount || null,
    sender: verification.sender || null,
    recipient: verification.recipient || null,
    valid: verification.valid,
    invalid_reason: verification.invalidReason || null,
  });
}

function networkSafe(network: SupportedNetwork): SupportedNetwork {
  return network;
}
