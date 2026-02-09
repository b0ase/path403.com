/**
 * Treasury Management for b0ase.com
 *
 * Handles token sales from treasury, pricing, and allocation tracking.
 */

import { transferTokens } from './bsv-tokens';

// $BOASE Token Configuration
export const BOASE_TOKEN = {
  tokenId: 'c3bf2d7a4519ddc633bc91bbfd1022db1a77da71e16bb582b0acc0d8f7836161_1',
  symbol: 'BOASE',
  totalSupply: 1_000_000_000,
  decimals: 0,
  marketUrl: 'https://1sat.market/market/bsv21/c3bf2d7a4519ddc633bc91bbfd1022db1a77da71e16bb582b0acc0d8f7836161_1'
};

// Treasury address (where unsold tokens are held)
// Uses MoneyButton wallet for now - can be changed to dedicated BOASE_TREASURY_ADDRESS
export const TREASURY_ADDRESS = process.env.BOASE_TREASURY_ADDRESS || process.env.MONEYBUTTON_BSV_ORDINALS_ADDRESS || '';

// Pricing tiers (in USD per 1000 tokens)
export interface PricingTier {
  minAmount: number;
  maxAmount: number;
  pricePerThousand: number;
  discount: number;
}

export const PRICING_TIERS: PricingTier[] = [
  { minAmount: 1000, maxAmount: 9999, pricePerThousand: 10, discount: 0 },
  { minAmount: 10000, maxAmount: 99999, pricePerThousand: 9, discount: 10 },
  { minAmount: 100000, maxAmount: 999999, pricePerThousand: 8, discount: 20 },
  { minAmount: 1000000, maxAmount: Infinity, pricePerThousand: 7, discount: 30 },
];

// Payment methods
export type PaymentMethod = 'bsv' | 'eth' | 'sol' | 'fiat';

export interface PaymentConfig {
  method: PaymentMethod;
  currency: string;
  address?: string;
  minAmount: number;
}

export const PAYMENT_METHODS: PaymentConfig[] = [
  { method: 'bsv', currency: 'BSV', address: TREASURY_ADDRESS, minAmount: 0.01 },
  { method: 'eth', currency: 'ETH', address: process.env.ETH_PUBLIC_ADDRESS, minAmount: 0.001 },
  { method: 'sol', currency: 'SOL', address: process.env.SOL_PUBLIC_ADDRESS, minAmount: 0.1 },
];

/**
 * Calculate price for a given token amount
 */
export function calculatePrice(tokenAmount: number): {
  priceUsd: number;
  pricePerToken: number;
  tier: PricingTier;
  savings: number;
} {
  const tier = PRICING_TIERS.find(
    t => tokenAmount >= t.minAmount && tokenAmount <= t.maxAmount
  ) || PRICING_TIERS[0];

  const basePrice = (tokenAmount / 1000) * PRICING_TIERS[0].pricePerThousand;
  const actualPrice = (tokenAmount / 1000) * tier.pricePerThousand;
  const savings = basePrice - actualPrice;

  return {
    priceUsd: actualPrice,
    pricePerToken: tier.pricePerThousand / 1000,
    tier,
    savings
  };
}

/**
 * Convert USD to crypto amount
 */
export async function convertUsdToCrypto(
  usdAmount: number,
  currency: 'BSV' | 'ETH' | 'SOL'
): Promise<number> {
  // Fetch current prices from CoinGecko
  try {
    const ids = { BSV: 'bitcoin-sv', ETH: 'ethereum', SOL: 'solana' };
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids[currency]}&vs_currencies=usd`
    );
    const data = await response.json();
    const price = data[ids[currency]]?.usd;

    if (!price) throw new Error('Price not available');
    return usdAmount / price;
  } catch (error) {
    // Fallback prices
    const fallbackPrices = { BSV: 50, ETH: 3000, SOL: 100 };
    return usdAmount / fallbackPrices[currency];
  }
}

/**
 * Treasury sale order
 */
export interface TreasurySaleOrder {
  id: string;
  buyerAddress: string;
  tokenAmount: number;
  paymentMethod: PaymentMethod;
  paymentAmount: number;
  paymentCurrency: string;
  priceUsd: number;
  status: 'pending' | 'paid' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  txid?: string;
}

/**
 * Execute a treasury sale (transfer tokens to buyer)
 */
export async function executeTreasurySale(
  buyerAddress: string,
  tokenAmount: number
): Promise<{ success: boolean; txid?: string; error?: string }> {
  const privateKeyWif = process.env.BOASE_TREASURY_PRIVATE_KEY || process.env.MONEYBUTTON_BSV_ORDINALS_PRIVATE_KEY;

  if (!privateKeyWif || !TREASURY_ADDRESS) {
    return { success: false, error: 'Treasury not configured' };
  }

  try {
    const result = await transferTokens(
      privateKeyWif,
      BOASE_TOKEN.tokenId,
      BigInt(tokenAmount),
      buyerAddress,
      TREASURY_ADDRESS // Change goes back to treasury
    );

    return { success: true, txid: result.txid };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transfer failed'
    };
  }
}

/**
 * Get treasury balance
 */
export async function getTreasuryBalance(): Promise<{
  tokenBalance: number;
  bsvBalance: number;
} | null> {
  if (!TREASURY_ADDRESS) return null;

  try {
    // Fetch token balance from GorillaPool
    const tokenResponse = await fetch(
      `https://ordinals.gorillapool.io/api/bsv20/${TREASURY_ADDRESS}/unspent?id=${BOASE_TOKEN.tokenId}`
    );
    const tokenData = await tokenResponse.json();
    const tokenBalance = Array.isArray(tokenData)
      ? tokenData.reduce((sum: number, u: any) => sum + parseInt(u.amt || '0'), 0)
      : 0;

    // Fetch BSV balance from WhatsOnChain
    const bsvResponse = await fetch(
      `https://api.whatsonchain.com/v1/bsv/main/address/${TREASURY_ADDRESS}/balance`
    );
    const bsvData = await bsvResponse.json();
    const bsvBalance = (bsvData.confirmed + bsvData.unconfirmed) / 100000000;

    return { tokenBalance, bsvBalance };
  } catch (error) {
    console.error('[treasury] Error fetching balance:', error);
    return null;
  }
}

/**
 * Cap table entry
 */
export interface CapTableEntry {
  holder: string;
  displayName?: string;
  tokens: number;
  percentage: number;
  category: 'treasury' | 'founder' | 'investor' | 'team' | 'public';
}

/**
 * Get cap table for a token
 */
export async function getCapTable(tokenId: string): Promise<CapTableEntry[]> {
  try {
    // Fetch holders from GorillaPool
    const response = await fetch(
      `https://ordinals.gorillapool.io/api/bsv20/holders?id=${tokenId}`
    );

    if (!response.ok) {
      // Return mock data if API fails
      return getMockCapTable();
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return getMockCapTable();
    }

    const totalSupply = data.reduce((sum: number, h: any) => sum + parseInt(h.amt || '0'), 0);

    return data.map((holder: any) => ({
      holder: holder.address,
      tokens: parseInt(holder.amt || '0'),
      percentage: (parseInt(holder.amt || '0') / totalSupply) * 100,
      category: categorizeHolder(holder.address)
    }));
  } catch (error) {
    console.error('[treasury] Error fetching cap table:', error);
    return getMockCapTable();
  }
}

/**
 * Categorize a holder based on known addresses
 */
function categorizeHolder(address: string): CapTableEntry['category'] {
  // Treasury address
  if (address === TREASURY_ADDRESS) return 'treasury';

  // Known founder addresses (would be configured)
  const founderAddresses: string[] = [];
  if (founderAddresses.includes(address)) return 'founder';

  // Default to public
  return 'public';
}

/**
 * Mock cap table for development
 */
function getMockCapTable(): CapTableEntry[] {
  return [
    { holder: 'Treasury', displayName: 'B0ase Treasury', tokens: 750_000_000, percentage: 75, category: 'treasury' },
    { holder: 'Founder', displayName: 'Founder Allocation', tokens: 100_000_000, percentage: 10, category: 'founder' },
    { holder: 'Team', displayName: 'Team Pool', tokens: 50_000_000, percentage: 5, category: 'team' },
    { holder: 'Investors', displayName: 'Early Investors', tokens: 50_000_000, percentage: 5, category: 'investor' },
    { holder: 'Public', displayName: 'Public Holders', tokens: 50_000_000, percentage: 5, category: 'public' },
  ];
}
