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
/** Supported cryptocurrency symbols */
type CryptoSymbol = 'BTC' | 'ETH' | 'BSV' | 'SOL' | 'USDT' | 'USDC' | 'MNEE' | 'XRP' | 'ADA' | 'DOT' | 'AVAX' | 'MATIC' | 'LINK' | string;
/** Supported fiat currencies */
type FiatCurrency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'AUD' | 'CAD';
/** Price data */
interface PriceData {
    symbol: string;
    usd: number;
    eur?: number;
    gbp?: number;
    btc?: number;
    updatedAt: Date;
}
/** Price with 24h change */
interface PriceWithChange extends PriceData {
    change24h: number;
    changePercent24h: number;
    high24h: number;
    low24h: number;
    volume24h: number;
    marketCap?: number;
}
/** Price service configuration */
interface PriceServiceConfig {
    /** Cache TTL in milliseconds (default: 60000 = 1 minute) */
    cacheTtlMs: number;
    /** API base URL */
    apiBaseUrl: string;
    /** Fallback prices for offline mode */
    fallbackPrices?: Record<string, number>;
    /** Request timeout in ms */
    timeout: number;
}
/**
 * Price Service
 *
 * Fetches and caches cryptocurrency prices.
 */
declare class PriceService {
    private config;
    private cache;
    private multiCache;
    constructor(config?: Partial<PriceServiceConfig>);
    /**
     * Check if cache entry is valid
     */
    private isCacheValid;
    /**
     * Get CoinGecko ID for symbol
     */
    private getCoinGeckoId;
    /**
     * Get price for a single cryptocurrency
     */
    getPrice(symbol: string): Promise<PriceData>;
    /**
     * Get prices for multiple cryptocurrencies
     */
    getPrices(symbols: string[]): Promise<Record<string, PriceData>>;
    /**
     * Get price with 24h change data
     */
    getPriceWithChange(symbol: string): Promise<PriceWithChange>;
    /**
     * Convert amount between currencies
     */
    convert(amount: number, from: string, to: string): Promise<number>;
    /**
     * Clear cache
     */
    clearCache(): void;
    /**
     * Set fallback price
     */
    setFallbackPrice(symbol: string, usdPrice: number): void;
}
/**
 * Create a price service instance
 */
declare function createPriceService(config?: Partial<PriceServiceConfig>): PriceService;
/**
 * Format price for display
 */
declare function formatPrice(price: number, currency?: string, options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
}): string;
/**
 * Format percentage change
 */
declare function formatChange(change: number): string;
/**
 * Format large numbers (1K, 1M, 1B)
 */
declare function formatLargeNumber(num: number): string;

export { type CryptoSymbol, type FiatCurrency, type PriceData, PriceService, type PriceServiceConfig, type PriceWithChange, createPriceService, formatChange, formatLargeNumber, formatPrice };
