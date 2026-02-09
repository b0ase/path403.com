/**
 * Bonding Curve Library
 *
 * Generalized bonding curve implementation supporting multiple curve types
 * and configurable parameters. Used for token fair launches (Pump.fun style).
 *
 * Curve Types:
 * - Exponential: P(n) = 10^(logMin + logRange * n / (supply - 1))
 * - Linear: P(n) = minPrice + (maxPrice - minPrice) * n / (supply - 1)
 * - Sigmoid: P(n) = minPrice + (maxPrice - minPrice) / (1 + e^(-k * (n - supply/2)))
 *
 * Based on work from moneybutton2 project.
 */

export type CurveType = 'exponential' | 'linear' | 'sigmoid';

export interface BondingCurveConfig {
  name: string;
  symbol: string;
  totalSupply: bigint;
  minPrice: number;
  maxPrice: number;
  curveType: CurveType;
  // Sigmoid steepness (only used for sigmoid curve)
  sigmoidK?: number;
}

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
 * Example configurations for different use cases
 */
export const CURVE_PRESETS = {
  // Pump.fun style - 13 orders of magnitude
  pumpFun: {
    ...DEFAULT_CONFIG,
    name: 'Fair Launch Token',
    symbol: 'PUMP',
  },

  // More conservative - 6 orders of magnitude
  conservative: {
    ...DEFAULT_CONFIG,
    name: 'Conservative Token',
    symbol: 'SAFE',
    minPrice: 0.001,
    maxPrice: 1000,
  },

  // Linear curve - predictable pricing
  linear: {
    ...DEFAULT_CONFIG,
    name: 'Linear Token',
    symbol: 'LINE',
    minPrice: 0.01,
    maxPrice: 100,
    curveType: 'linear' as CurveType,
  },

  // Sigmoid curve - S-shaped, slower start and end
  sigmoid: {
    ...DEFAULT_CONFIG,
    name: 'Sigmoid Token',
    symbol: 'SIG',
    minPrice: 0.001,
    maxPrice: 1000,
    curveType: 'sigmoid' as CurveType,
    sigmoidK: 0.00000001,
  },
};

/**
 * Bonding Curve Calculator
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

    // Clamp to valid range
    if (tokenIndex <= 0) return this.config.minPrice;
    if (tokenIndex >= total) return this.config.maxPrice;

    const n = tokenIndex;
    const { minPrice, maxPrice, curveType, sigmoidK } = this.config;

    switch (curveType) {
      case 'exponential': {
        // P(n) = 10^(logMin + logRange * n / total)
        const logPrice = this.logMin + (this.logRange * n) / total;
        return Math.pow(10, logPrice);
      }

      case 'linear': {
        // P(n) = minPrice + (maxPrice - minPrice) * n / total
        return minPrice + ((maxPrice - minPrice) * n) / total;
      }

      case 'sigmoid': {
        // P(n) = minPrice + (maxPrice - minPrice) / (1 + e^(-k * (n - total/2)))
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
        // Inverse sigmoid - solve for n
        const k = sigmoidK || 0.00000001;
        const midpoint = total / 2;
        const normalizedPrice = (price - minPrice) / (maxPrice - minPrice);
        // sigmoid^-1(y) = -ln((1-y)/y) / k + midpoint
        if (normalizedPrice <= 0 || normalizedPrice >= 1) return midpoint;
        return Math.floor(-Math.log((1 - normalizedPrice) / normalizedPrice) / k + midpoint);
      }

      default:
        return 0;
    }
  }

  /**
   * Calculate how many tokens a user gets for a given payment
   * Uses trapezoidal integration for accuracy
   */
  getTokensForPayment(tokensSold: bigint, paymentUSD: number): bigint {
    if (paymentUSD <= 0) return BigInt(0);

    const startIndex = Number(tokensSold);
    const total = Number(this.config.totalSupply);
    let remaining = paymentUSD;
    let tokensReceived = 0;

    // Step through tokens, buying until we run out of money
    // Use larger steps for efficiency, smaller for accuracy near boundaries
    const step = Math.max(1, Math.floor(total / 10000));

    for (let i = startIndex; i < total && remaining > 0; i += step) {
      const price = this.getPriceAtToken(i);
      const maxTokensAtPrice = Math.min(step, total - i);
      const costForStep = price * maxTokensAtPrice;

      if (costForStep <= remaining) {
        remaining -= costForStep;
        tokensReceived += maxTokensAtPrice;
      } else {
        // Partial purchase at this price point
        const tokensBuyable = Math.floor(remaining / price);
        tokensReceived += tokensBuyable;
        break;
      }
    }

    // Cap at remaining supply
    const maxTokens = total - startIndex;
    return BigInt(Math.min(tokensReceived, maxTokens));
  }

  /**
   * Calculate the cost to buy a specific number of tokens
   * Uses trapezoidal integration for accuracy
   */
  getCostForTokens(tokensSold: bigint, tokensToBuy: bigint): number {
    if (tokensToBuy <= BigInt(0)) return 0;

    const startIndex = Number(tokensSold);
    const endIndex = Math.min(
      startIndex + Number(tokensToBuy),
      Number(this.config.totalSupply) - 1
    );

    // For small purchases, use simple average
    if (Number(tokensToBuy) < 1000) {
      const startPrice = this.getPriceAtToken(startIndex);
      const endPrice = this.getPriceAtToken(endIndex);
      return ((startPrice + endPrice) / 2) * Number(tokensToBuy);
    }

    // For larger purchases, use trapezoidal integration
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
   * Generate curve data points for visualization
   */
  getCurvePoints(numPoints: number = 100): Array<{
    tokenIndex: number;
    tokensSold: number;
    price: number;
    percentSold: number;
  }> {
    const total = Number(this.config.totalSupply);
    const points = [];

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
  getMilestones(): Array<{
    label: string;
    tokenIndex: number;
    price: number;
    percentSold: number;
  }> {
    const total = Number(this.config.totalSupply);
    const milestonePercents = [0, 0.1, 1, 10, 25, 50, 75, 90, 99, 99.9, 100];

    return milestonePercents.map(percent => {
      const tokenIndex = Math.floor((percent / 100) * (total - 1));
      return {
        label: percent === 0 ? 'First token' : percent === 100 ? 'Last token' : `${percent}% sold`,
        tokenIndex,
        price: this.getPriceAtToken(tokenIndex),
        percentSold: percent,
      };
    });
  }
}

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
