// x402 Inscription Service
// Inscribes x402 payment proofs on BSV

import { X402Inscription, SupportedNetwork, FEES } from './types';

// In production, this would use the treasury wallet to inscribe
// For now, we'll create the inscription data and simulate

export interface InscriptionResult {
  success: boolean;
  inscriptionId?: string;
  txId?: string;
  error?: string;
  fee?: number;
}

export interface InscriptionRecord {
  id: string;
  inscription: X402Inscription;
  txId: string;
  blockHeight?: number;
  timestamp: number;
  fee: number;
}

// In-memory store for development (use database in production)
const inscriptionStore = new Map<string, InscriptionRecord>();

/**
 * Create an x402 inscription on BSV
 */
export async function createInscription(
  originChain: SupportedNetwork,
  originTxId: string,
  payment: {
    from: string;
    to: string;
    amount: string;
    asset: string;
  },
  signature: string,
  settlementChain?: SupportedNetwork,
  settlementTxId?: string
): Promise<InscriptionResult> {
  try {
    const inscription: X402Inscription = {
      p: 'x402-notary',
      v: 1,
      origin: {
        chain: originChain,
        txId: originTxId,
      },
      payment: {
        from: payment.from,
        to: payment.to,
        amount: payment.amount,
        asset: payment.asset,
        timestamp: Date.now(),
      },
      signature,
      facilitator: 'path402.com',
      settlementChain,
      settlementTxId,
    };

    // In production: Actually inscribe on BSV
    // For now: Simulate inscription
    const mockTxId = generateMockTxId();
    const inscriptionId = `${mockTxId}_0`;

    const record: InscriptionRecord = {
      id: inscriptionId,
      inscription,
      txId: mockTxId,
      timestamp: Date.now(),
      fee: FEES.inscription,
    };

    inscriptionStore.set(inscriptionId, record);

    console.log(`[x402] Inscribed payment proof: ${inscriptionId}`);
    console.log(`[x402] Origin: ${originChain}/${originTxId}`);
    console.log(`[x402] Amount: ${payment.amount} ${payment.asset}`);

    return {
      success: true,
      inscriptionId,
      txId: mockTxId,
      fee: FEES.inscription,
    };
  } catch (error) {
    console.error('[x402] Inscription failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Inscription failed',
    };
  }
}

/**
 * Get an inscription by ID
 */
export async function getInscription(inscriptionId: string): Promise<InscriptionRecord | null> {
  return inscriptionStore.get(inscriptionId) || null;
}

/**
 * Get all inscriptions for a given origin transaction
 */
export async function getInscriptionsByOrigin(
  chain: SupportedNetwork,
  txId: string
): Promise<InscriptionRecord[]> {
  const results: InscriptionRecord[] = [];

  for (const record of inscriptionStore.values()) {
    if (record.inscription.origin.chain === chain &&
        record.inscription.origin.txId === txId) {
      results.push(record);
    }
  }

  return results;
}

/**
 * Get inscription statistics
 */
export async function getInscriptionStats(): Promise<{
  totalInscriptions: number;
  totalFees: number;
  byChain: Record<SupportedNetwork, number>;
}> {
  const byChain: Record<SupportedNetwork, number> = {
    bsv: 0,
    base: 0,
    solana: 0,
    ethereum: 0,
  };

  let totalFees = 0;

  for (const record of inscriptionStore.values()) {
    byChain[record.inscription.origin.chain]++;
    totalFees += record.fee;
  }

  return {
    totalInscriptions: inscriptionStore.size,
    totalFees,
    byChain,
  };
}

// Helper to generate mock transaction ID (for development)
function generateMockTxId(): string {
  const chars = '0123456789abcdef';
  let txId = '';
  for (let i = 0; i < 64; i++) {
    txId += chars[Math.floor(Math.random() * chars.length)];
  }
  return txId;
}

/**
 * Calculate inscription fee based on data size
 */
export function calculateInscriptionFee(data: X402Inscription): number {
  const dataSize = JSON.stringify(data).length;
  // Base fee + size-based component
  return FEES.inscription + Math.ceil(dataSize / 100) * 10;
}
