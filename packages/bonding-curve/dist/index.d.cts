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
/** Supported curve types */
type CurveType = 'exponential' | 'linear' | 'sigmoid';
/** Bonding curve configuration */
interface BondingCurveConfig {
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
interface CurvePoint {
    tokenIndex: number;
    tokensSold: number;
    price: number;
    percentSold: number;
}
/** Milestone on the curve */
interface Milestone {
    label: string;
    tokenIndex: number;
    price: number;
    percentSold: number;
}
/** Purchase quote */
interface PurchaseQuote {
    tokensReceived: bigint;
    totalCost: number;
    averagePrice: number;
    newPrice: number;
    priceImpact: number;
}
/** Sale quote */
interface SaleQuote {
    tokensToSell: bigint;
    totalReceived: number;
    averagePrice: number;
    newPrice: number;
    priceImpact: number;
}
/**
 * Default configuration for a "fair launch" style curve
 * Similar to Pump.fun - massive early advantage, premium for late buyers
 */
declare const DEFAULT_CONFIG: BondingCurveConfig;
/**
 * Preset configurations for different use cases
 */
declare const CURVE_PRESETS: {
    /** Pump.fun style - 13 orders of magnitude */
    pumpFun: BondingCurveConfig;
    /** More conservative - 6 orders of magnitude */
    conservative: BondingCurveConfig;
    /** Linear curve - predictable pricing */
    linear: BondingCurveConfig;
    /** Sigmoid curve - S-shaped, slower start and end */
    sigmoid: BondingCurveConfig;
    /** Small community token - 1M supply */
    community: BondingCurveConfig;
    /** Micro cap - 10K supply, high value */
    microCap: BondingCurveConfig;
};
/**
 * Bonding Curve Calculator
 *
 * Handles all price calculations for token bonding curves.
 */
declare class BondingCurve {
    readonly config: BondingCurveConfig;
    readonly logMin: number;
    readonly logMax: number;
    readonly logRange: number;
    constructor(config?: Partial<BondingCurveConfig>);
    /**
     * Get the price at a specific token index (0-indexed)
     */
    getPriceAtToken(tokenIndex: number): number;
    /**
     * Get the current price based on tokens already sold
     */
    getCurrentPrice(tokensSold: bigint): number;
    /**
     * Get the token index at a specific price (inverse of getPriceAtToken)
     */
    getTokenAtPrice(price: number): number;
    /**
     * Calculate how many tokens a user gets for a given payment
     */
    getTokensForPayment(tokensSold: bigint, paymentUSD: number): bigint;
    /**
     * Calculate the cost to buy a specific number of tokens
     */
    getCostForTokens(tokensSold: bigint, tokensToBuy: bigint): number;
    /**
     * Get a full purchase quote with price impact
     */
    getPurchaseQuote(tokensSold: bigint, paymentUSD: number): PurchaseQuote;
    /**
     * Get market cap at current supply level
     */
    getMarketCap(tokensSold: bigint): number;
    /**
     * Get fully diluted valuation
     */
    getFDV(tokensSold: bigint): number;
    /**
     * Get progress percentage (0-100)
     */
    getProgress(tokensSold: bigint): number;
    /**
     * Get remaining supply
     */
    getRemainingSupply(tokensSold: bigint): bigint;
    /**
     * Generate curve data points for visualization
     */
    getCurvePoints(numPoints?: number): CurvePoint[];
    /**
     * Get key milestones with prices
     */
    getMilestones(): Milestone[];
}
/**
 * Format price for display - always readable, never scientific notation
 */
declare function formatPrice(price: number): string;
/**
 * Format large numbers with K/M/B suffixes
 */
declare function formatNumber(n: bigint | number): string;
/**
 * Format currency with proper symbols
 */
declare function formatCurrency(amount: number, currency?: string): string;
/**
 * Create a new bonding curve with custom configuration
 */
declare function createBondingCurve(config?: Partial<BondingCurveConfig>): BondingCurve;

export { BondingCurve, type BondingCurveConfig, CURVE_PRESETS, type CurvePoint, type CurveType, DEFAULT_CONFIG, type Milestone, type PurchaseQuote, type SaleQuote, createBondingCurve, formatCurrency, formatNumber, formatPrice };
