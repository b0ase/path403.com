// Live cryptocurrency price feed
// Uses CoinGecko API for real-time prices

export type SupportedChain = 'bsv' | 'eth' | 'sol';

export interface PriceData {
  usd: number;
  gbp: number;
  lastUpdated: number;
}

export interface ChainInfo {
  id: SupportedChain;
  name: string;
  symbol: string;
  coinGeckoId: string;
  color: string;
}

export const CHAINS: Record<SupportedChain, ChainInfo> = {
  bsv: {
    id: 'bsv',
    name: 'Bitcoin SV',
    symbol: 'BSV',
    coinGeckoId: 'bitcoin-cash-sv',
    color: '#EAB300',
  },
  eth: {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    coinGeckoId: 'ethereum',
    color: '#627EEA',
  },
  sol: {
    id: 'sol',
    name: 'Solana',
    symbol: 'SOL',
    coinGeckoId: 'solana',
    color: '#14F195',
  },
};

// Cache prices for 60 seconds to avoid rate limits
const priceCache: Record<SupportedChain, { data: PriceData; timestamp: number } | null> = {
  bsv: null,
  eth: null,
  sol: null,
};

const CACHE_DURATION = 60 * 1000; // 60 seconds

/**
 * Fetch live price from CoinGecko API
 */
async function fetchPrice(chain: SupportedChain): Promise<PriceData> {
  const chainInfo = CHAINS[chain];
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${chainInfo.coinGeckoId}&vs_currencies=usd,gbp`;

  const response = await fetch(url, {
    next: { revalidate: 60 }, // Cache for 60 seconds
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${chain.toUpperCase()} price`);
  }

  const data = await response.json();
  const prices = data[chainInfo.coinGeckoId];

  return {
    usd: prices.usd,
    gbp: prices.gbp,
    lastUpdated: Date.now(),
  };
}

/**
 * Get current price with caching
 */
export async function getPrice(chain: SupportedChain): Promise<PriceData> {
  const cached = priceCache[chain];

  // Return cached if still valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // Fetch new price
  const price = await fetchPrice(chain);
  priceCache[chain] = { data: price, timestamp: Date.now() };

  return price;
}

/**
 * Get all prices at once
 */
export async function getAllPrices(): Promise<Record<SupportedChain, PriceData>> {
  const [bsv, eth, sol] = await Promise.all([
    getPrice('bsv'),
    getPrice('eth'),
    getPrice('sol'),
  ]);

  return { bsv, eth, sol };
}

/**
 * Convert fiat amount to crypto
 */
export function convertToCrypto(
  fiatAmount: number,
  fiatCurrency: 'usd' | 'gbp',
  cryptoPrice: PriceData
): number {
  const fiatPrice = fiatCurrency === 'usd' ? cryptoPrice.usd : cryptoPrice.gbp;
  return fiatAmount / fiatPrice;
}

/**
 * Format crypto amount for display
 */
export function formatCrypto(amount: number, chain: SupportedChain, decimals: number = 2): string {
  const chainInfo = CHAINS[chain];
  return `${amount.toFixed(decimals)} ${chainInfo.symbol}`;
}

/**
 * Format price with fiat and crypto equivalent
 */
export function formatPrice(
  fiatAmount: number,
  fiatCurrency: 'usd' | 'gbp',
  chain: SupportedChain,
  cryptoPrice: PriceData
): string {
  const cryptoAmount = convertToCrypto(fiatAmount, fiatCurrency, cryptoPrice);
  const symbol = fiatCurrency === 'usd' ? '$' : '£';
  return `${symbol}${fiatAmount} (≈${formatCrypto(cryptoAmount, chain)})`;
}
