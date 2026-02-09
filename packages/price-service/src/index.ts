/**
 * @b0ase/price-service
 *
 * Real-time cryptocurrency price service with caching.
 *
 * @example
 * ```typescript
 * import { PriceService, createPriceService } from '@b0ase/price-service';
 *
 * const prices = createPriceService();
 *
 * // Get single price
 * const bsvPrice = await prices.getPrice('BSV');
 * console.log(`BSV: $${bsvPrice.usd}`);
 *
 * // Get multiple prices
 * const allPrices = await prices.getPrices(['BTC', 'ETH', 'BSV', 'SOL']);
 *
 * // Convert amounts
 * const usdAmount = await prices.convert(1, 'BTC', 'USD');
 * console.log(`1 BTC = $${usdAmount}`);
 *
 * // Get with 24h change
 * const btcData = await prices.getPriceWithChange('BTC');
 * console.log(`BTC: $${btcData.usd} (${btcData.change24h}%)`);
 * ```
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Supported cryptocurrency symbols */
export type CryptoSymbol =
  | 'BTC'
  | 'ETH'
  | 'BSV'
  | 'SOL'
  | 'USDT'
  | 'USDC'
  | 'MNEE'
  | 'XRP'
  | 'ADA'
  | 'DOT'
  | 'AVAX'
  | 'MATIC'
  | 'LINK'
  | string;

/** Supported fiat currencies */
export type FiatCurrency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'AUD' | 'CAD';

/** Price data */
export interface PriceData {
  symbol: string;
  usd: number;
  eur?: number;
  gbp?: number;
  btc?: number;
  updatedAt: Date;
}

/** Price with 24h change */
export interface PriceWithChange extends PriceData {
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap?: number;
}

/** Price service configuration */
export interface PriceServiceConfig {
  /** Cache TTL in milliseconds (default: 60000 = 1 minute) */
  cacheTtlMs: number;
  /** API base URL */
  apiBaseUrl: string;
  /** Fallback prices for offline mode */
  fallbackPrices?: Record<string, number>;
  /** Request timeout in ms */
  timeout: number;
}

/** Cache entry */
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: PriceServiceConfig = {
  cacheTtlMs: 60000, // 1 minute
  apiBaseUrl: 'https://api.coingecko.com/api/v3',
  timeout: 10000,
  fallbackPrices: {
    BTC: 45000,
    ETH: 2500,
    BSV: 50,
    SOL: 100,
    USDT: 1,
    USDC: 1,
  },
};

// CoinGecko ID mapping
const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  BSV: 'bitcoin-sv',
  SOL: 'solana',
  USDT: 'tether',
  USDC: 'usd-coin',
  XRP: 'ripple',
  ADA: 'cardano',
  DOT: 'polkadot',
  AVAX: 'avalanche-2',
  MATIC: 'matic-network',
  LINK: 'chainlink',
  MNEE: 'money-network', // May not exist on CoinGecko
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

// ============================================================================
// Price Service Class
// ============================================================================

/**
 * Price Service
 *
 * Fetches and caches cryptocurrency prices.
 */
export class PriceService {
  private config: PriceServiceConfig;
  private cache: Map<string, CacheEntry<PriceData>> = new Map();
  private multiCache: CacheEntry<Record<string, PriceData>> | null = null;

  constructor(config: Partial<PriceServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Check if cache entry is valid
   */
  private isCacheValid<T>(entry: CacheEntry<T> | null | undefined): entry is CacheEntry<T> {
    if (!entry) return false;
    return Date.now() < entry.expiresAt;
  }

  /**
   * Get CoinGecko ID for symbol
   */
  private getCoinGeckoId(symbol: string): string {
    return COINGECKO_IDS[symbol.toUpperCase()] || symbol.toLowerCase();
  }

  /**
   * Get price for a single cryptocurrency
   */
  async getPrice(symbol: string): Promise<PriceData> {
    const upperSymbol = symbol.toUpperCase();
    const cacheKey = `price:${upperSymbol}`;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (this.isCacheValid(cached)) {
      return cached!.data;
    }

    try {
      const coinId = this.getCoinGeckoId(upperSymbol);
      const url = `${this.config.apiBaseUrl}/simple/price?ids=${coinId}&vs_currencies=usd,eur,gbp,btc`;

      const response = await fetchWithTimeout(url, {}, this.config.timeout);
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = (await response.json()) as Record<
        string,
        Record<string, number>
      >;
      const prices = data[coinId];

      if (!prices) {
        throw new Error(`No price data for ${symbol}`);
      }

      const priceData: PriceData = {
        symbol: upperSymbol,
        usd: prices.usd,
        eur: prices.eur,
        gbp: prices.gbp,
        btc: prices.btc,
        updatedAt: new Date(),
      };

      // Cache result
      this.cache.set(cacheKey, {
        data: priceData,
        expiresAt: Date.now() + this.config.cacheTtlMs,
      });

      return priceData;
    } catch (error) {
      // Return fallback price if available
      const fallback = this.config.fallbackPrices?.[upperSymbol];
      if (fallback !== undefined) {
        return {
          symbol: upperSymbol,
          usd: fallback,
          updatedAt: new Date(),
        };
      }
      throw error;
    }
  }

  /**
   * Get prices for multiple cryptocurrencies
   */
  async getPrices(symbols: string[]): Promise<Record<string, PriceData>> {
    // Check multi-cache
    if (this.isCacheValid(this.multiCache)) {
      const result: Record<string, PriceData> = {};
      for (const symbol of symbols) {
        const upper = symbol.toUpperCase();
        if (this.multiCache!.data[upper]) {
          result[upper] = this.multiCache!.data[upper];
        }
      }
      if (Object.keys(result).length === symbols.length) {
        return result;
      }
    }

    try {
      const coinIds = symbols.map((s) => this.getCoinGeckoId(s)).join(',');
      const url = `${this.config.apiBaseUrl}/simple/price?ids=${coinIds}&vs_currencies=usd,eur,gbp,btc`;

      const response = await fetchWithTimeout(url, {}, this.config.timeout);
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = (await response.json()) as Record<
        string,
        Record<string, number>
      >;
      const result: Record<string, PriceData> = {};
      const now = new Date();

      for (const symbol of symbols) {
        const upper = symbol.toUpperCase();
        const coinId = this.getCoinGeckoId(upper);
        const prices = data[coinId];

        if (prices) {
          result[upper] = {
            symbol: upper,
            usd: prices.usd,
            eur: prices.eur,
            gbp: prices.gbp,
            btc: prices.btc,
            updatedAt: now,
          };
        } else if (this.config.fallbackPrices?.[upper]) {
          result[upper] = {
            symbol: upper,
            usd: this.config.fallbackPrices[upper],
            updatedAt: now,
          };
        }
      }

      // Update multi-cache
      this.multiCache = {
        data: { ...this.multiCache?.data, ...result },
        expiresAt: Date.now() + this.config.cacheTtlMs,
      };

      return result;
    } catch (error) {
      // Return fallback prices
      const result: Record<string, PriceData> = {};
      const now = new Date();
      for (const symbol of symbols) {
        const upper = symbol.toUpperCase();
        const fallback = this.config.fallbackPrices?.[upper];
        if (fallback !== undefined) {
          result[upper] = {
            symbol: upper,
            usd: fallback,
            updatedAt: now,
          };
        }
      }
      if (Object.keys(result).length > 0) {
        return result;
      }
      throw error;
    }
  }

  /**
   * Get price with 24h change data
   */
  async getPriceWithChange(symbol: string): Promise<PriceWithChange> {
    const coinId = this.getCoinGeckoId(symbol.toUpperCase());
    const url = `${this.config.apiBaseUrl}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`;

    const response = await fetchWithTimeout(url, {}, this.config.timeout);
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = (await response.json()) as {
      symbol: string;
      market_data: {
        current_price: Record<string, number>;
        price_change_24h: number;
        price_change_percentage_24h: number;
        high_24h: Record<string, number>;
        low_24h: Record<string, number>;
        total_volume: Record<string, number>;
        market_cap: Record<string, number>;
      };
    };

    const marketData = data.market_data;

    return {
      symbol: symbol.toUpperCase(),
      usd: marketData.current_price.usd,
      eur: marketData.current_price.eur,
      gbp: marketData.current_price.gbp,
      btc: marketData.current_price.btc,
      change24h: marketData.price_change_24h,
      changePercent24h: marketData.price_change_percentage_24h,
      high24h: marketData.high_24h.usd,
      low24h: marketData.low_24h.usd,
      volume24h: marketData.total_volume.usd,
      marketCap: marketData.market_cap.usd,
      updatedAt: new Date(),
    };
  }

  /**
   * Convert amount between currencies
   */
  async convert(
    amount: number,
    from: string,
    to: string
  ): Promise<number> {
    const fromUpper = from.toUpperCase();
    const toUpper = to.toUpperCase();

    // Handle fiat currencies
    const fiatCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD'];

    if (fromUpper === toUpper) return amount;

    // Crypto to fiat
    if (!fiatCurrencies.includes(fromUpper) && fiatCurrencies.includes(toUpper)) {
      const price = await this.getPrice(fromUpper);
      const rate =
        toUpper === 'USD'
          ? price.usd
          : toUpper === 'EUR'
          ? price.eur || price.usd * 0.92
          : toUpper === 'GBP'
          ? price.gbp || price.usd * 0.79
          : price.usd;
      return amount * rate;
    }

    // Fiat to crypto
    if (fiatCurrencies.includes(fromUpper) && !fiatCurrencies.includes(toUpper)) {
      const price = await this.getPrice(toUpper);
      const rate =
        fromUpper === 'USD'
          ? price.usd
          : fromUpper === 'EUR'
          ? price.eur || price.usd * 0.92
          : fromUpper === 'GBP'
          ? price.gbp || price.usd * 0.79
          : price.usd;
      return amount / rate;
    }

    // Crypto to crypto
    const [fromPrice, toPrice] = await Promise.all([
      this.getPrice(fromUpper),
      this.getPrice(toUpper),
    ]);

    const usdValue = amount * fromPrice.usd;
    return usdValue / toPrice.usd;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.multiCache = null;
  }

  /**
   * Set fallback price
   */
  setFallbackPrice(symbol: string, usdPrice: number): void {
    if (!this.config.fallbackPrices) {
      this.config.fallbackPrices = {};
    }
    this.config.fallbackPrices[symbol.toUpperCase()] = usdPrice;
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a price service instance
 */
export function createPriceService(
  config?: Partial<PriceServiceConfig>
): PriceService {
  return new PriceService(config);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format price for display
 */
export function formatPrice(
  price: number,
  currency: string = 'USD',
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CNY: '¥',
    AUD: 'A$',
    CAD: 'C$',
  };

  const symbol = currencySymbols[currency.toUpperCase()] || '$';
  const minDigits = options?.minimumFractionDigits ?? (price < 1 ? 4 : 2);
  const maxDigits = options?.maximumFractionDigits ?? (price < 1 ? 6 : 2);

  const formatted = price.toLocaleString('en-US', {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  });

  return `${symbol}${formatted}`;
}

/**
 * Format percentage change
 */
export function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

/**
 * Format large numbers (1K, 1M, 1B)
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(2);
}
