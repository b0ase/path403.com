// src/index.ts
var DEFAULT_CONFIG = {
  cacheTtlMs: 6e4,
  // 1 minute
  apiBaseUrl: "https://api.coingecko.com/api/v3",
  timeout: 1e4,
  fallbackPrices: {
    BTC: 45e3,
    ETH: 2500,
    BSV: 50,
    SOL: 100,
    USDT: 1,
    USDC: 1
  }
};
var COINGECKO_IDS = {
  BTC: "bitcoin",
  ETH: "ethereum",
  BSV: "bitcoin-sv",
  SOL: "solana",
  USDT: "tether",
  USDC: "usd-coin",
  XRP: "ripple",
  ADA: "cardano",
  DOT: "polkadot",
  AVAX: "avalanche-2",
  MATIC: "matic-network",
  LINK: "chainlink",
  MNEE: "money-network"
  // May not exist on CoinGecko
};
async function fetchWithTimeout(url, options = {}, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}
var PriceService = class {
  constructor(config = {}) {
    this.cache = /* @__PURE__ */ new Map();
    this.multiCache = null;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  /**
   * Check if cache entry is valid
   */
  isCacheValid(entry) {
    if (!entry) return false;
    return Date.now() < entry.expiresAt;
  }
  /**
   * Get CoinGecko ID for symbol
   */
  getCoinGeckoId(symbol) {
    return COINGECKO_IDS[symbol.toUpperCase()] || symbol.toLowerCase();
  }
  /**
   * Get price for a single cryptocurrency
   */
  async getPrice(symbol) {
    const upperSymbol = symbol.toUpperCase();
    const cacheKey = `price:${upperSymbol}`;
    const cached = this.cache.get(cacheKey);
    if (this.isCacheValid(cached)) {
      return cached.data;
    }
    try {
      const coinId = this.getCoinGeckoId(upperSymbol);
      const url = `${this.config.apiBaseUrl}/simple/price?ids=${coinId}&vs_currencies=usd,eur,gbp,btc`;
      const response = await fetchWithTimeout(url, {}, this.config.timeout);
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      const data = await response.json();
      const prices = data[coinId];
      if (!prices) {
        throw new Error(`No price data for ${symbol}`);
      }
      const priceData = {
        symbol: upperSymbol,
        usd: prices.usd,
        eur: prices.eur,
        gbp: prices.gbp,
        btc: prices.btc,
        updatedAt: /* @__PURE__ */ new Date()
      };
      this.cache.set(cacheKey, {
        data: priceData,
        expiresAt: Date.now() + this.config.cacheTtlMs
      });
      return priceData;
    } catch (error) {
      const fallback = this.config.fallbackPrices?.[upperSymbol];
      if (fallback !== void 0) {
        return {
          symbol: upperSymbol,
          usd: fallback,
          updatedAt: /* @__PURE__ */ new Date()
        };
      }
      throw error;
    }
  }
  /**
   * Get prices for multiple cryptocurrencies
   */
  async getPrices(symbols) {
    if (this.isCacheValid(this.multiCache)) {
      const result = {};
      for (const symbol of symbols) {
        const upper = symbol.toUpperCase();
        if (this.multiCache.data[upper]) {
          result[upper] = this.multiCache.data[upper];
        }
      }
      if (Object.keys(result).length === symbols.length) {
        return result;
      }
    }
    try {
      const coinIds = symbols.map((s) => this.getCoinGeckoId(s)).join(",");
      const url = `${this.config.apiBaseUrl}/simple/price?ids=${coinIds}&vs_currencies=usd,eur,gbp,btc`;
      const response = await fetchWithTimeout(url, {}, this.config.timeout);
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      const data = await response.json();
      const result = {};
      const now = /* @__PURE__ */ new Date();
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
            updatedAt: now
          };
        } else if (this.config.fallbackPrices?.[upper]) {
          result[upper] = {
            symbol: upper,
            usd: this.config.fallbackPrices[upper],
            updatedAt: now
          };
        }
      }
      this.multiCache = {
        data: { ...this.multiCache?.data, ...result },
        expiresAt: Date.now() + this.config.cacheTtlMs
      };
      return result;
    } catch (error) {
      const result = {};
      const now = /* @__PURE__ */ new Date();
      for (const symbol of symbols) {
        const upper = symbol.toUpperCase();
        const fallback = this.config.fallbackPrices?.[upper];
        if (fallback !== void 0) {
          result[upper] = {
            symbol: upper,
            usd: fallback,
            updatedAt: now
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
  async getPriceWithChange(symbol) {
    const coinId = this.getCoinGeckoId(symbol.toUpperCase());
    const url = `${this.config.apiBaseUrl}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`;
    const response = await fetchWithTimeout(url, {}, this.config.timeout);
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    const data = await response.json();
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
      updatedAt: /* @__PURE__ */ new Date()
    };
  }
  /**
   * Convert amount between currencies
   */
  async convert(amount, from, to) {
    const fromUpper = from.toUpperCase();
    const toUpper = to.toUpperCase();
    const fiatCurrencies = ["USD", "EUR", "GBP", "JPY", "CNY", "AUD", "CAD"];
    if (fromUpper === toUpper) return amount;
    if (!fiatCurrencies.includes(fromUpper) && fiatCurrencies.includes(toUpper)) {
      const price = await this.getPrice(fromUpper);
      const rate = toUpper === "USD" ? price.usd : toUpper === "EUR" ? price.eur || price.usd * 0.92 : toUpper === "GBP" ? price.gbp || price.usd * 0.79 : price.usd;
      return amount * rate;
    }
    if (fiatCurrencies.includes(fromUpper) && !fiatCurrencies.includes(toUpper)) {
      const price = await this.getPrice(toUpper);
      const rate = fromUpper === "USD" ? price.usd : fromUpper === "EUR" ? price.eur || price.usd * 0.92 : fromUpper === "GBP" ? price.gbp || price.usd * 0.79 : price.usd;
      return amount / rate;
    }
    const [fromPrice, toPrice] = await Promise.all([
      this.getPrice(fromUpper),
      this.getPrice(toUpper)
    ]);
    const usdValue = amount * fromPrice.usd;
    return usdValue / toPrice.usd;
  }
  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    this.multiCache = null;
  }
  /**
   * Set fallback price
   */
  setFallbackPrice(symbol, usdPrice) {
    if (!this.config.fallbackPrices) {
      this.config.fallbackPrices = {};
    }
    this.config.fallbackPrices[symbol.toUpperCase()] = usdPrice;
  }
};
function createPriceService(config) {
  return new PriceService(config);
}
function formatPrice(price, currency = "USD", options) {
  const currencySymbols = {
    USD: "$",
    EUR: "\u20AC",
    GBP: "\xA3",
    JPY: "\xA5",
    CNY: "\xA5",
    AUD: "A$",
    CAD: "C$"
  };
  const symbol = currencySymbols[currency.toUpperCase()] || "$";
  const minDigits = options?.minimumFractionDigits ?? (price < 1 ? 4 : 2);
  const maxDigits = options?.maximumFractionDigits ?? (price < 1 ? 6 : 2);
  const formatted = price.toLocaleString("en-US", {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits
  });
  return `${symbol}${formatted}`;
}
function formatChange(change) {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
}
function formatLargeNumber(num) {
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(2);
}
export {
  PriceService,
  createPriceService,
  formatChange,
  formatLargeNumber,
  formatPrice
};
//# sourceMappingURL=index.js.map