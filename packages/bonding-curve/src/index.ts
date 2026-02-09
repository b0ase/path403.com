/**
 * @b0ase/bonding-curve
 *
 * Generalized bonding curve implementation for token fair launches.
 * Supports exponential, linear, and sigmoid curve types.
 *
 * @example
 * ```typescript
 * import { BondingCurve, CURVE_PRESETS } from '@b0ase/bonding-curve';
 *
 * // Create a pump.fun style curve
 * const curve = new BondingCurve(CURVE_PRESETS.pumpFun);
 *
 * // Get current price
 * const tokensSold = BigInt(1_000_000);
 * const price = curve.getCurrentPrice(tokensSold);
 *
 * // Calculate tokens for a $100 purchase
 * const tokens = curve.getTokensForPayment(tokensSold, 100);
 *
 * // Get visualization data
 * const points = curve.getCurvePoints(100);
 * ```
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Supported curve types */
export type CurveType = 'exponential' | 'linear' | 'sigmoid';

/** Bonding curve configuration */
export interface BondingCurveConfig {
  /** Token name */
  name: string;
  /** Token symbol */
  symbol: string;
  /** Total token supply */
  totalSupply: bigint;
  /** Minimum price (first token) */
  minPrice: number;
  /** Maximum price (last token) */
  maxPrice: number;
  /** Curve type */
  curveType: CurveType;
  /** Sigmoid steepness (only for sigmoid curve) */
  sigmoidK?: number;
}

/** Curve data point for visualization */
export interface CurvePoint {
  tokenIndex: number;
  tokensSold: number;
  price: number;
  percentSold: number;
}

/** Milestone on the curve */
export interface Milestone {
  label: string;
  tokenIndex: number;
  price: number;
  percentSold: number;
}

/** Purchase quote */
export interface PurchaseQuote {
  tokensReceived: bigint;
  totalCost: number;
  averagePrice: number;
  newPrice: number;
  priceImpact: number;
}

/** Sale quote */
export interface SaleQuote {
  tokensToSell: bigint;
  totalReceived: number;
  averagePrice: number;
  newPrice: number;
  priceImpact: number;
}

// ============================================================================
// Default Configuration
// ============================================================================

/**
 * Default configuration for a "fair launch" style curve
 * Similar to Pump.fun - massive early advantage, premium for late buyers
 */
export const DEFAULT_CONFIG: BondingCurveConfig = {
  name: 'Token',
  symbol: 'TOKEN',
  totalSupply: BigInt(1_000_000_000), // 1 billion tokens
  minPrice: 0.0000001, // $0.0000001 (one ten-millionth)
  maxPrice: 1_000_000, // $1,000,000
  curveType: 'exponential',
};

/**
 * Preset configurations for different use cases
 */
export const CURVE_PRESETS = {
  /** Pump.fun style - 13 orders of magnitude */
  pumpFun: {
    ...DEFAULT_CONFIG,
    name: 'Fair Launch Token',
    symbol: 'PUMP',
  } as BondingCurveConfig,

  /** More conservative - 6 orders of magnitude */
  conservative: {
    ...DEFAULT_CONFIG,
    name: 'Conservative Token',
    symbol: 'SAFE',
    minPrice: 0.001,
    maxPrice: 1000,
  } as BondingCurveConfig,

  /** Linear curve - predictable pricing */
  linear: {
    ...DEFAULT_CONFIG,
    name: 'Linear Token',
    symbol: 'LINE',
    minPrice: 0.01,
    maxPrice: 100,
    curveType: 'linear' as CurveType,
  } as BondingCurveConfig,

  /** Sigmoid curve - S-shaped, slower start and end */
  sigmoid: {
    ...DEFAULT_CONFIG,
    name: 'Sigmoid Token',
    symbol: 'SIG',
    minPrice: 0.001,
    maxPrice: 1000,
    curveType: 'sigmoid' as CurveType,
    sigmoidK: 0.00000001,
  } as BondingCurveConfig,

  /** Small community token - 1M supply */
  community: {
    ...DEFAULT_CONFIG,
    name: 'Community Token',
    symbol: 'COMM',
    totalSupply: BigInt(1_000_000),
    minPrice: 0.01,
    maxPrice: 100,
  } as BondingCurveConfig,

  /** Micro cap - 10K supply, high value */
  microCap: {
    ...DEFAULT_CONFIG,
    name: 'Micro Token',
    symbol: 'MICRO',
    totalSupply: BigInt(10_000),
    minPrice: 1,
    maxPrice: 10_000,
  } as BondingCurveConfig,
};

// ============================================================================
// Bonding Curve Class
// ============================================================================

/**
 * Bonding Curve Calculator
 *
 * Handles all price calculations for token bonding curves.
 */
export class BondingCurve {
  readonly config: BondingCurveConfig;
  readonly logMin: number;
  readonly logMax: number;
  readonly logRange: number;

  constructor(config: Partial<BondingCurveConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.logMin = Math.log10(this.config.minPrice);
    this.logMax = Math.log10(this.config.maxPrice);
    this.logRange = this.logMax - this.logMin;
  }

  /**
   * Get the price at a specific token index (0-indexed)
   */
  getPriceAtToken(tokenIndex: number): number {
    const total = Number(this.config.totalSupply) - 1;

    if (tokenIndex <= 0) return this.config.minPrice;
    if (tokenIndex >= total) return this.config.maxPrice;

    const n = tokenIndex;
    const { minPrice, maxPrice, curveType, sigmoidK } = this.config;

    switch (curveType) {
      case 'exponential': {
        const logPrice = this.logMin + (this.logRange * n) / total;
        return Math.pow(10, logPrice);
      }

      case 'linear': {
        return minPrice + ((maxPrice - minPrice) * n) / total;
      }

      case 'sigmoid': {
        const k = sigmoidK || 0.00000001;
        const midpoint = total / 2;
        const sigmoid = 1 / (1 + Math.exp(-k * (n - midpoint)));
        return minPrice + (maxPrice - minPrice) * sigmoid;
      }

      default:
        return minPrice;
    }
  }

  /**
   * Get the current price based on tokens already sold
   */
  getCurrentPrice(tokensSold: bigint): number {
    return this.getPriceAtToken(Number(tokensSold));
  }

  /**
   * Get the token index at a specific price (inverse of getPriceAtToken)
   */
  getTokenAtPrice(price: number): number {
    const total = Number(this.config.totalSupply) - 1;
    const { minPrice, maxPrice, curveType, sigmoidK } = this.config;

    if (price <= minPrice) return 0;
    if (price >= maxPrice) return total;

    switch (curveType) {
      case 'exponential': {
        const logPrice = Math.log10(price);
        return Math.floor(((logPrice - this.logMin) / this.logRange) * total);
      }

      case 'linear': {
        return Math.floor(((price - minPrice) / (maxPrice - minPrice)) * total);
      }

      case 'sigmoid': {
        const k = sigmoidK || 0.00000001;
        const midpoint = total / 2;
        const normalizedPrice = (price - minPrice) / (maxPrice - minPrice);
        if (normalizedPrice <= 0 || normalizedPrice >= 1) return midpoint;
        return Math.floor(
          -Math.log((1 - normalizedPrice) / normalizedPrice) / k + midpoint
        );
      }

      default:
        return 0;
    }
  }

  /**
   * Calculate how many tokens a user gets for a given payment
   */
  getTokensForPayment(tokensSold: bigint, paymentUSD: number): bigint {
    if (paymentUSD <= 0) return BigInt(0);

    const startIndex = Number(tokensSold);
    const total = Number(this.config.totalSupply);
    let remaining = paymentUSD;
    let tokensReceived = 0;

    const step = Math.max(1, Math.floor(total / 10000));

    for (let i = startIndex; i < total && remaining > 0; i += step) {
      const price = this.getPriceAtToken(i);
      const maxTokensAtPrice = Math.min(step, total - i);
      const costForStep = price * maxTokensAtPrice;

      if (costForStep <= remaining) {
        remaining -= costForStep;
        tokensReceived += maxTokensAtPrice;
      } else {
        const tokensBuyable = Math.floor(remaining / price);
        tokensReceived += tokensBuyable;
        break;
      }
    }

    const maxTokens = total - startIndex;
    return BigInt(Math.min(tokensReceived, maxTokens));
  }

  /**
   * Calculate the cost to buy a specific number of tokens
   */
  getCostForTokens(tokensSold: bigint, tokensToBuy: bigint): number {
    if (tokensToBuy <= BigInt(0)) return 0;

    const startIndex = Number(tokensSold);
    const endIndex = Math.min(
      startIndex + Number(tokensToBuy),
      Number(this.config.totalSupply) - 1
    );

    if (Number(tokensToBuy) < 1000) {
      const startPrice = this.getPriceAtToken(startIndex);
      const endPrice = this.getPriceAtToken(endIndex);
      return ((startPrice + endPrice) / 2) * Number(tokensToBuy);
    }

    let totalCost = 0;
    const numSteps = 100;
    const stepSize = (endIndex - startIndex) / numSteps;

    for (let i = 0; i < numSteps; i++) {
      const idx1 = startIndex + i * stepSize;
      const idx2 = startIndex + (i + 1) * stepSize;
      const p1 = this.getPriceAtToken(Math.floor(idx1));
      const p2 = this.getPriceAtToken(Math.floor(idx2));
      totalCost += ((p1 + p2) / 2) * stepSize;
    }

    return totalCost;
  }

  /**
   * Get a full purchase quote with price impact
   */
  getPurchaseQuote(tokensSold: bigint, paymentUSD: number): PurchaseQuote {
    const currentPrice = this.getCurrentPrice(tokensSold);
    const tokensReceived = this.getTokensForPayment(tokensSold, paymentUSD);
    const totalCost = this.getCostForTokens(tokensSold, tokensReceived);
    const newTokensSold = tokensSold + tokensReceived;
    const newPrice = this.getCurrentPrice(newTokensSold);

    return {
      tokensReceived,
      totalCost,
      averagePrice: Number(tokensReceived) > 0 ? totalCost / Number(tokensReceived) : 0,
      newPrice,
      priceImpact: currentPrice > 0 ? ((newPrice - currentPrice) / currentPrice) * 100 : 0,
    };
  }

  /**
   * Get market cap at current supply level
   */
  getMarketCap(tokensSold: bigint): number {
    const currentPrice = this.getCurrentPrice(tokensSold);
    return currentPrice * Number(tokensSold);
  }

  /**
   * Get fully diluted valuation
   */
  getFDV(tokensSold: bigint): number {
    const currentPrice = this.getCurrentPrice(tokensSold);
    return currentPrice * Number(this.config.totalSupply);
  }

  /**
   * Get progress percentage (0-100)
   */
  getProgress(tokensSold: bigint): number {
    return (Number(tokensSold) / Number(this.config.totalSupply)) * 100;
  }

  /**
   * Get remaining supply
   */
  getRemainingSupply(tokensSold: bigint): bigint {
    return this.config.totalSupply - tokensSold;
  }

  /**
   * Generate curve data points for visualization
   */
  getCurvePoints(numPoints: number = 100): CurvePoint[] {
    const total = Number(this.config.totalSupply);
    const points: CurvePoint[] = [];

    for (let i = 0; i <= numPoints; i++) {
      const tokenIndex = Math.floor((i / numPoints) * (total - 1));
      const price = this.getPriceAtToken(tokenIndex);
      points.push({
        tokenIndex,
        tokensSold: tokenIndex + 1,
        price,
        percentSold: ((tokenIndex + 1) / total) * 100,
      });
    }

    return points;
  }

  /**
   * Get key milestones with prices
   */
  getMilestones(): Milestone[] {
    const total = Number(this.config.totalSupply);
    const milestonePercents = [0, 0.1, 1, 10, 25, 50, 75, 90, 99, 99.9, 100];

    return milestonePercents.map((percent) => {
      const tokenIndex = Math.floor((percent / 100) * (total - 1));
      return {
        label:
          percent === 0
            ? 'First token'
            : percent === 100
              ? 'Last token'
              : `${percent}% sold`,
        tokenIndex,
        price: this.getPriceAtToken(tokenIndex),
        percentSold: percent,
      };
    });
  }
}

// ============================================================================
// Formatting Utilities
// ============================================================================

/**
 * Format price for display - always readable, never scientific notation
 */
export function formatPrice(price: number): string {
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
  if (price >= 0.000000001) return `$${price.toFixed(9)}`;
  return `$${price.toFixed(10)}`;
}

/**
 * Format large numbers with K/M/B suffixes
 */
export function formatNumber(n: bigint | number): string {
  const num = typeof n === 'bigint' ? Number(n) : n;
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

/**
 * Format currency with proper symbols
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Create a new bonding curve with custom configuration
 */
export function createBondingCurve(
  config: Partial<BondingCurveConfig> = {}
): BondingCurve {
  return new BondingCurve(config);
}
