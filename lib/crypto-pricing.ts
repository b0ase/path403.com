/**
 * Cryptocurrency Pricing Utilities
 * Converts GBP prices to BSV, ETH, and SOL equivalents
 *
 * Rates are fetched from CoinGecko API with caching, falling back to
 * environment variables or hardcoded defaults.
 */

export interface CryptoPricing {
  blockchain: 'BSV' | 'ETH' | 'SOL';
  symbol: string;
  color: string;
  gbpRate: number; // GBP per 1 token
}

// CoinGecko API IDs for each blockchain
const COINGECKO_IDS: Record<'BSV' | 'ETH' | 'SOL', string> = {
  BSV: 'bitcoin-sv',
  ETH: 'ethereum',
  SOL: 'solana',
};

// Cache for live rates (5 minute TTL)
let ratesCache: {
  rates: Record<'BSV' | 'ETH' | 'SOL', number>;
  timestamp: number;
} | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Default/fallback rates from environment or hardcoded (January 2026 approximate)
const DEFAULT_RATES: Record<'BSV' | 'ETH' | 'SOL', number> = {
  BSV: parseFloat(process.env.CRYPTO_RATE_BSV_GBP || '45'),
  ETH: parseFloat(process.env.CRYPTO_RATE_ETH_GBP || '2500'),
  SOL: parseFloat(process.env.CRYPTO_RATE_SOL_GBP || '120'),
};

/**
 * Fetch live rates from CoinGecko API
 * Returns null if fetch fails (caller should use fallback)
 */
async function fetchLiveRates(): Promise<Record<'BSV' | 'ETH' | 'SOL', number> | null> {
  try {
    const ids = Object.values(COINGECKO_IDS).join(',');
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=gbp`,
      { next: { revalidate: 300 } } // Next.js cache for 5 min
    );

    if (!response.ok) {
      console.warn('[crypto-pricing] CoinGecko API returned', response.status);
      return null;
    }

    const data = await response.json();

    return {
      BSV: data[COINGECKO_IDS.BSV]?.gbp || DEFAULT_RATES.BSV,
      ETH: data[COINGECKO_IDS.ETH]?.gbp || DEFAULT_RATES.ETH,
      SOL: data[COINGECKO_IDS.SOL]?.gbp || DEFAULT_RATES.SOL,
    };
  } catch (error) {
    console.warn('[crypto-pricing] Failed to fetch live rates:', error);
    return null;
  }
}

/**
 * Get current exchange rates (with caching)
 * Uses live rates when available, falls back to defaults
 */
export async function getCurrentRates(): Promise<Record<'BSV' | 'ETH' | 'SOL', number>> {
  // Check cache
  if (ratesCache && Date.now() - ratesCache.timestamp < CACHE_TTL_MS) {
    return ratesCache.rates;
  }

  // Try to fetch live rates
  const liveRates = await fetchLiveRates();

  if (liveRates) {
    ratesCache = { rates: liveRates, timestamp: Date.now() };
    return liveRates;
  }

  // Fall back to defaults
  return DEFAULT_RATES;
}

/**
 * Synchronous rate getter (uses cache or defaults)
 * Use getCurrentRates() for guaranteed fresh rates
 */
export function getRatesSync(): Record<'BSV' | 'ETH' | 'SOL', number> {
  if (ratesCache && Date.now() - ratesCache.timestamp < CACHE_TTL_MS) {
    return ratesCache.rates;
  }
  return DEFAULT_RATES;
}

// Static metadata (doesn't change with rates)
const CRYPTO_META: Record<'BSV' | 'ETH' | 'SOL', { symbol: string; color: string }> = {
  BSV: { symbol: 'BSV', color: 'text-yellow-500' },
  ETH: { symbol: 'ETH', color: 'text-blue-500' },
  SOL: { symbol: 'SOL', color: 'text-purple-500' },
};

/**
 * Get crypto pricing info for a blockchain
 * Uses cached rates or defaults for synchronous access
 */
export function getCryptoPricing(blockchain: 'BSV' | 'ETH' | 'SOL'): CryptoPricing {
  const rates = getRatesSync();
  const meta = CRYPTO_META[blockchain];

  return {
    blockchain,
    symbol: meta.symbol,
    color: meta.color,
    gbpRate: rates[blockchain],
  };
}

// Legacy export for backwards compatibility
export const cryptoRates: Record<'BSV' | 'ETH' | 'SOL', CryptoPricing> = {
  BSV: {
    blockchain: 'BSV',
    symbol: 'BSV',
    color: 'text-yellow-500',
    get gbpRate() { return getRatesSync().BSV; },
  },
  ETH: {
    blockchain: 'ETH',
    symbol: 'ETH',
    color: 'text-blue-500',
    get gbpRate() { return getRatesSync().ETH; },
  },
  SOL: {
    blockchain: 'SOL',
    symbol: 'SOL',
    color: 'text-purple-500',
    get gbpRate() { return getRatesSync().SOL; },
  },
};

/**
 * Convert GBP price string to crypto amount
 * @param gbpPrice - Price string like "£180" or "£2,000"
 * @param blockchain - Target blockchain
 * @returns Formatted crypto price string
 */
export function convertToCrypto(gbpPrice: string, blockchain: 'BSV' | 'ETH' | 'SOL'): string {
  // Remove £ and commas, parse as number
  const gbpAmount = parseFloat(gbpPrice.replace(/[£,]/g, ''));

  if (isNaN(gbpAmount)) {
    return gbpPrice; // Return original if can't parse
  }

  const rate = cryptoRates[blockchain];
  const cryptoAmount = gbpAmount / rate.gbpRate;

  // Format based on blockchain
  if (blockchain === 'BSV') {
    // BSV: Show up to 2 decimals for small amounts, 0 for large
    return cryptoAmount >= 10
      ? `${Math.round(cryptoAmount)} ${rate.symbol}`
      : `${cryptoAmount.toFixed(2)} ${rate.symbol}`;
  } else if (blockchain === 'ETH') {
    // ETH: Show up to 4 decimals
    return cryptoAmount >= 1
      ? `${cryptoAmount.toFixed(2)} ${rate.symbol}`
      : `${cryptoAmount.toFixed(4)} ${rate.symbol}`;
  } else {
    // SOL: Show up to 3 decimals
    return cryptoAmount >= 10
      ? `${Math.round(cryptoAmount)} ${rate.symbol}`
      : `${cryptoAmount.toFixed(3)} ${rate.symbol}`;
  }
}

/**
 * Get blockchain display metadata
 */
export function getBlockchainMeta(blockchain: 'BSV' | 'ETH' | 'SOL') {
  const meta = {
    BSV: {
      name: 'Bitcoin SV',
      description: 'Pay in BSV',
      tagline: 'Instant settlement · Sub-penny fees · Unlimited scale',
      explorerUrl: 'https://whatsonchain.com',
    },
    ETH: {
      name: 'Ethereum',
      description: 'Pay in ETH',
      tagline: 'Smart contracts · DeFi native · Global liquidity',
      explorerUrl: 'https://etherscan.io',
    },
    SOL: {
      name: 'Solana',
      description: 'Pay in SOL',
      tagline: 'High throughput · Low latency · Growing ecosystem',
      explorerUrl: 'https://solscan.io',
    },
  };

  return meta[blockchain];
}
