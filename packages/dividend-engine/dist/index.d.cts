/**
 * @b0ase/dividend-engine
 *
 * Token holder dividend distribution engine.
 * Calculates pro-rata distributions, handles thresholds, and tracks payouts.
 *
 * The "irrigation" pattern: Revenue flows upward to token holders.
 *
 * @example
 * ```typescript
 * import { DividendEngine } from '@b0ase/dividend-engine';
 *
 * const engine = new DividendEngine();
 *
 * // Calculate distribution
 * const distribution = engine.calculateDistribution({
 *   totalAmount: 10000,
 *   currency: 'USD',
 *   holders: [
 *     { userId: 'alice', balance: 1000n, paymentHandle: '$alice' },
 *     { userId: 'bob', balance: 500n, paymentHandle: '$bob' },
 *   ],
 * });
 *
 * // Execute payments (via your payment provider)
 * for (const payment of distribution.payments) {
 *   await paymentProvider.send(payment.paymentHandle, payment.amount);
 * }
 * ```
 *
 * @packageDocumentation
 */
/** Token holder for distribution */
interface Holder {
    /** Unique user identifier */
    userId: string;
    /** Token balance */
    balance: bigint;
    /** Payment handle (e.g., HandCash handle, wallet address) */
    paymentHandle?: string;
    /** Additional metadata */
    metadata?: Record<string, unknown>;
}
/** Distribution calculation input */
interface DistributionInput {
    /** Total amount to distribute */
    totalAmount: number;
    /** Currency code */
    currency?: string;
    /** List of token holders */
    holders: Holder[];
    /** Minimum payment amount (skip smaller payments) */
    minPayment?: number;
    /** Distribution source/reason */
    source?: string;
    /** Token ID being distributed for */
    tokenId?: string;
}
/** Individual payment in a distribution */
interface DistributionPayment {
    /** User ID */
    userId: string;
    /** Payment handle */
    paymentHandle: string;
    /** Token balance at time of distribution */
    balance: bigint;
    /** Share percentage (0-100) */
    sharePercent: number;
    /** Payment amount */
    amount: number;
    /** Currency */
    currency: string;
}
/** Distribution calculation result */
interface Distribution {
    /** Unique distribution ID */
    id: string;
    /** Total amount distributed */
    totalAmount: number;
    /** Amount actually paid out (after minimums) */
    totalDistributed: number;
    /** Amount below minimum threshold (not distributed) */
    belowThreshold: number;
    /** Currency */
    currency: string;
    /** Source/reason */
    source?: string;
    /** Token ID */
    tokenId?: string;
    /** Total tokens across all holders */
    totalTokens: bigint;
    /** Per-token amount */
    perTokenAmount: number;
    /** Number of eligible holders */
    eligibleHolders: number;
    /** Number of holders below minimum */
    belowMinimumHolders: number;
    /** Individual payments */
    payments: DistributionPayment[];
    /** Timestamp */
    calculatedAt: Date;
}
/** Waterfall tier for multi-tier distributions */
interface WaterfallTier {
    /** Tier name */
    name: string;
    /** Percentage of distribution (0-100) */
    percentage: number;
    /** Holders in this tier */
    holders: Holder[];
}
/** Waterfall distribution input */
interface WaterfallInput {
    /** Total amount to distribute */
    totalAmount: number;
    /** Currency code */
    currency?: string;
    /** Waterfall tiers (must sum to 100%) */
    tiers: WaterfallTier[];
    /** Minimum payment amount */
    minPayment?: number;
    /** Distribution source */
    source?: string;
}
/** Threshold trigger for automatic distributions */
interface DistributionTrigger {
    /** Trigger type */
    type: 'amount' | 'time' | 'manual';
    /** Threshold amount (for 'amount' type) */
    thresholdAmount?: number;
    /** Interval in ms (for 'time' type) */
    intervalMs?: number;
}
/** Distribution configuration */
interface DistributionConfig {
    /** Minimum payment amount */
    minPayment: number;
    /** Default currency */
    currency: string;
    /** Distribution trigger */
    trigger?: DistributionTrigger;
    /** Whether to include holders without payment handles */
    includeWithoutHandles: boolean;
}
/**
 * Dividend Distribution Engine
 *
 * Calculates and manages pro-rata distributions to token holders.
 */
declare class DividendEngine {
    readonly config: DistributionConfig;
    constructor(config?: Partial<DistributionConfig>);
    /**
     * Generate unique distribution ID
     */
    private generateId;
    /**
     * Calculate pro-rata distribution
     */
    calculateDistribution(input: DistributionInput): Distribution;
    /**
     * Calculate waterfall distribution (multi-tier)
     */
    calculateWaterfall(input: WaterfallInput): Distribution[];
    /**
     * Calculate distribution with fixed splits (e.g., 70% to holders, 30% to treasury)
     */
    calculateSplit(input: {
        totalAmount: number;
        currency?: string;
        splits: Array<{
            name: string;
            percentage: number;
            destination: 'holders' | 'fixed';
            holders?: Holder[];
            fixedAddress?: string;
        }>;
        minPayment?: number;
        source?: string;
    }): {
        distributions: Distribution[];
        fixedPayments: Array<{
            name: string;
            address: string;
            amount: number;
        }>;
    };
    /**
     * Simulate distribution without executing
     */
    simulate(input: DistributionInput): {
        distribution: Distribution;
        summary: {
            totalHolders: number;
            eligibleHolders: number;
            largestPayment: number;
            smallestPayment: number;
            medianPayment: number;
            averagePayment: number;
        };
    };
}
/**
 * Create a dividend engine with custom configuration
 */
declare function createDividendEngine(config?: Partial<DistributionConfig>): DividendEngine;
/**
 * Quick calculation without creating an engine instance
 */
declare function calculateProRata(totalAmount: number, holders: Holder[], options?: {
    minPayment?: number;
    currency?: string;
}): Distribution;
/**
 * Calculate share percentage for a holder
 */
declare function calculateSharePercent(balance: bigint, totalSupply: bigint): number;
/**
 * Format payment amount for display
 */
declare function formatPaymentAmount(amount: number, currency?: string): string;
/**
 * Group payments by amount range for analysis
 */
declare function groupPaymentsByRange(payments: DistributionPayment[]): Record<string, DistributionPayment[]>;

export { type Distribution, type DistributionConfig, type DistributionInput, type DistributionPayment, type DistributionTrigger, DividendEngine, type Holder, type WaterfallInput, type WaterfallTier, calculateProRata, calculateSharePercent, createDividendEngine, formatPaymentAmount, groupPaymentsByRange };
