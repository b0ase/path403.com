/**
 * $BOASE Token Configuration
 *
 * Single source of truth for $BOASE token parameters.
 *
 * Total Supply: 100,000,000,000 (100 billion tokens)
 *
 * Environment Variables Required:
 * - BOASE_TREASURY_ADDRESS: BSV ordinals address holding the treasury
 * - BOASE_TREASURY_PRIVATE_KEY: WIF private key for treasury operations
 * - BOASE_TOKEN_ID: BSV-20 token ID after deployment
 */

export const BOASE_TOKEN = {
  // Token identity
  name: '$BOASE',
  symbol: 'BOASE',
  ticker: '$BOASE',

  // Supply (100 billion)
  totalSupply: BigInt(100_000_000_000),
  totalSupplyNumber: 100_000_000_000,
  totalSupplyFormatted: '100,000,000,000',
  totalSupplyShort: '100B',

  // Decimals (like BSV-20 standard)
  decimals: 8,

  // Bonding curve parameters
  minPrice: 0.00000001, // $0.00000001 (one hundred-millionth)
  maxPrice: 10_000_000, // $10,000,000 per token at full supply
  curveType: 'exponential' as const,

  // Computed log values for exponential curve
  logMin: -8, // log10(0.00000001)
  logMax: 7,  // log10(10,000,000)
  logRange: 15, // 15 orders of magnitude

  // Network
  network: 'BSV',
  standard: 'BSV-20',

  // Links
  explorerUrl: 'https://whatsonchain.com',
} as const;

/**
 * Get the current price per token based on tokens already sold
 * Uses exponential formula: P(n) = 10^(-8 + 15 * n / (100B - 1))
 */
export function getBoasePrice(tokensSold: bigint): number {
  const n = Number(tokensSold);
  const total = BOASE_TOKEN.totalSupplyNumber - 1;

  // Clamp to valid range
  if (n <= 0) return BOASE_TOKEN.minPrice;
  if (n >= total) return BOASE_TOKEN.maxPrice;

  // Exponential formula
  const logPrice = BOASE_TOKEN.logMin + (BOASE_TOKEN.logRange * n) / total;
  return Math.pow(10, logPrice);
}

/**
 * Get tokens remaining based on tokens sold
 */
export function getBoaseRemaining(tokensSold: bigint): bigint {
  return BOASE_TOKEN.totalSupply - tokensSold;
}

/**
 * Get progress percentage (0-100)
 */
export function getBoaseProgress(tokensSold: bigint): number {
  return (Number(tokensSold) / BOASE_TOKEN.totalSupplyNumber) * 100;
}

/**
 * Format price for display
 */
export function formatBoasePrice(price: number): string {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(1)}M`;
  if (price >= 1_000) return `$${(price / 1_000).toFixed(1)}K`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(2)}`;
  if (price >= 0.001) return `$${price.toFixed(3)}`;
  if (price >= 0.0001) return `$${price.toFixed(4)}`;
  if (price >= 0.00001) return `$${price.toFixed(5)}`;
  if (price >= 0.000001) return `$${price.toFixed(6)}`;
  if (price >= 0.0000001) return `$${price.toFixed(7)}`;
  if (price >= 0.00000001) return `$${price.toFixed(8)}`;
  return `$${price.toFixed(10)}`;
}

/**
 * Format token amounts with appropriate suffixes
 */
export function formatBoaseAmount(amount: bigint | number): string {
  const num = typeof amount === 'bigint' ? Number(amount) : amount;
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

/**
 * Treasury configuration - reads from environment
 */
export function getTreasuryConfig() {
  return {
    address: process.env.BOASE_TREASURY_ADDRESS || '',
    // Private key should only be used server-side
    privateKey: process.env.BOASE_TREASURY_PRIVATE_KEY || '',
    tokenId: process.env.BOASE_TOKEN_ID || '',
    isConfigured: !!(
      process.env.BOASE_TREASURY_ADDRESS &&
      process.env.BOASE_TREASURY_PRIVATE_KEY &&
      process.env.BOASE_TOKEN_ID
    ),
  };
}

const GORILLAPOOL_API = 'https://ordinals.gorillapool.io/api';

/**
 * Fetch treasury balance from blockchain
 * Returns the number of $BOASE tokens held in the treasury wallet
 */
export async function getTreasuryBalance(): Promise<bigint> {
  const config = getTreasuryConfig();

  if (!config.isConfigured) {
    console.log('[boase] Treasury not configured, returning full supply as balance');
    return BOASE_TOKEN.totalSupply;
  }

  try {
    const url = `${GORILLAPOOL_API}/bsv20/${config.address}/unspent?id=${config.tokenId}`;
    console.log(`[boase] Fetching treasury balance from: ${url}`);

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 60 } // Cache for 60 seconds
    });

    if (!response.ok) {
      console.error(`[boase] Failed to fetch treasury balance: ${response.status}`);
      return BOASE_TOKEN.totalSupply; // Fallback to full supply
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      console.log('[boase] No token UTXOs found in treasury');
      return BigInt(0);
    }

    // Sum up all token amounts in the treasury
    const totalBalance = data.reduce((sum: bigint, utxo: { amt?: string }) => {
      const amt = utxo.amt ? BigInt(Math.floor(parseFloat(utxo.amt))) : BigInt(0);
      return sum + amt;
    }, BigInt(0));

    console.log(`[boase] Treasury balance: ${totalBalance.toString()}`);
    return totalBalance;
  } catch (error) {
    console.error('[boase] Error fetching treasury balance:', error);
    return BOASE_TOKEN.totalSupply; // Fallback to full supply on error
  }
}

/**
 * Calculate tokens sold based on treasury balance
 * tokensSold = totalSupply - treasuryBalance
 */
export async function getTokensSold(): Promise<bigint> {
  const treasuryBalance = await getTreasuryBalance();
  const tokensSold = BOASE_TOKEN.totalSupply - treasuryBalance;
  return tokensSold > BigInt(0) ? tokensSold : BigInt(0);
}
