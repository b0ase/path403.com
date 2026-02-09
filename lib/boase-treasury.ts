/**
 * Unified b0ase.com Treasury
 *
 * Single treasury for all b0ase-owned tokens: $BOASE, $KINTSUGI, etc.
 * Uses BSV blockchain via Yours wallet infrastructure.
 *
 * Environment Variables:
 * - BOASE_TREASURY_PRIVATE_KEY: WIF format private key for signing
 * - BOASE_TREASURY_ORD_ADDRESS: Address for holding tokens/ordinals
 * - BOASE_TREASURY_BSV_ADDRESS: Address for BSV payments (optional, can be same)
 */

import { PrivateKey } from '@bsv/sdk';

// =============================================================================
// Treasury Configuration
// =============================================================================

export interface TreasuryConfig {
  privateKey: string;
  ordAddress: string;
  bsvAddress: string;
}

export function getTreasuryConfig(): TreasuryConfig {
  const privateKey = process.env.BOASE_TREASURY_PRIVATE_KEY;
  // Support both ORD_ADDRESS (new) and ADDRESS (legacy) naming
  const ordAddress = process.env.BOASE_TREASURY_ORD_ADDRESS || process.env.BOASE_TREASURY_ADDRESS;
  const bsvAddress = process.env.BOASE_TREASURY_BSV_ADDRESS || ordAddress;

  if (!privateKey) {
    throw new Error('BOASE_TREASURY_PRIVATE_KEY not set');
  }
  if (!ordAddress) {
    throw new Error('BOASE_TREASURY_ORD_ADDRESS not set');
  }

  return { privateKey, ordAddress, bsvAddress: bsvAddress || '' };
}

export function getTreasuryPrivateKey(): PrivateKey {
  const config = getTreasuryConfig();
  return PrivateKey.fromWif(config.privateKey);
}

export function getTreasuryOrdAddress(): string {
  return getTreasuryConfig().ordAddress;
}

export function getTreasuryBsvAddress(): string {
  return getTreasuryConfig().bsvAddress;
}

// =============================================================================
// Token Registry
// =============================================================================

export interface TokenInfo {
  tokenId: string;
  symbol: string;
  name: string;
  totalSupply: number;
  decimals: number;
  icon?: string;
  marketUrl?: string;
  deployedAt?: string;
}

// Deployed tokens (update after minting)
export const DEPLOYED_TOKENS: Record<string, TokenInfo> = {
  BOASE: {
    tokenId: 'c3bf2d7a4519ddc633bc91bbfd1022db1a77da71e16bb582b0acc0d8f7836161_1',
    symbol: 'BOASE',
    name: 'b0ase.com',
    totalSupply: 1_000_000_000,
    decimals: 0,
    marketUrl: 'https://1sat.market/market/bsv21/c3bf2d7a4519ddc633bc91bbfd1022db1a77da71e16bb582b0acc0d8f7836161_1',
  },
  KINTSUGI: {
    tokenId: '78c97e5a49bddd4a720f83f09917be2b9907c5619ee9330a032922aead14d5ac_0',
    symbol: 'KINTSUGI',
    name: 'Kintsugi Engine',
    totalSupply: 1_000_000_000,
    decimals: 0,
    icon: '/tokens/kintsugi-icon-400.jpg',
    marketUrl: 'https://1sat.market/market/bsv21/78c97e5a49bddd4a720f83f09917be2b9907c5619ee9330a032922aead14d5ac_0',
    deployedAt: '2026-01-31',
  },
};

export function getToken(symbol: string): TokenInfo | undefined {
  return DEPLOYED_TOKENS[symbol.toUpperCase().replace('$', '')];
}

// =============================================================================
// Balance Queries
// =============================================================================

const GORILLA_POOL_API = 'https://ordinals.gorillapool.io/api';
const WHATSONCHAIN_API = 'https://api.whatsonchain.com/v1/bsv/main';

export interface TreasuryBalance {
  bsvSatoshis: number;
  bsvAmount: number;
  tokens: { symbol: string; balance: number; tokenId: string }[];
}

/**
 * Get treasury BSV balance
 */
export async function getTreasuryBsvBalance(): Promise<{ satoshis: number; bsv: number }> {
  const address = getTreasuryBsvAddress();

  try {
    const response = await fetch(`${WHATSONCHAIN_API}/address/${address}/balance`);
    const data = await response.json();
    const satoshis = (data.confirmed || 0) + (data.unconfirmed || 0);
    return {
      satoshis,
      bsv: satoshis / 100_000_000,
    };
  } catch (error) {
    console.error('[treasury] Error fetching BSV balance:', error);
    return { satoshis: 0, bsv: 0 };
  }
}

/**
 * Get treasury token balance for a specific token
 */
export async function getTreasuryTokenBalance(tokenId: string): Promise<number> {
  const address = getTreasuryOrdAddress();

  try {
    const response = await fetch(
      `${GORILLA_POOL_API}/bsv20/${address}/unspent?id=${tokenId}`
    );
    const data = await response.json();

    if (!Array.isArray(data)) return 0;

    return data.reduce((sum: number, utxo: { amt?: string }) => {
      return sum + parseInt(utxo.amt || '0', 10);
    }, 0);
  } catch (error) {
    console.error('[treasury] Error fetching token balance:', error);
    return 0;
  }
}

/**
 * Get all treasury balances
 */
export async function getTreasuryBalances(): Promise<TreasuryBalance> {
  const bsv = await getTreasuryBsvBalance();
  const tokens: TreasuryBalance['tokens'] = [];

  for (const [symbol, info] of Object.entries(DEPLOYED_TOKENS)) {
    const balance = await getTreasuryTokenBalance(info.tokenId);
    tokens.push({ symbol, balance, tokenId: info.tokenId });
  }

  return {
    bsvSatoshis: bsv.satoshis,
    bsvAmount: bsv.bsv,
    tokens,
  };
}

// =============================================================================
// Payment Addresses for Investors
// =============================================================================

export interface PaymentAddresses {
  bsv: string;
  eth?: string;
  sol?: string;
}

/**
 * Get addresses for investor payments
 */
export function getPaymentAddresses(): PaymentAddresses {
  return {
    bsv: getTreasuryBsvAddress(),
    eth: process.env.BOASE_TREASURY_ETH_ADDRESS || process.env.ETH_PUBLIC_ADDRESS,
    sol: process.env.BOASE_TREASURY_SOL_ADDRESS || process.env.SOL_PUBLIC_ADDRESS,
  };
}
