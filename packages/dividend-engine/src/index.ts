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

// ============================================================================
// Types
// ============================================================================

/** Token holder for distribution */
export interface Holder {
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
export interface DistributionInput {
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
export interface DistributionPayment {
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
export interface Distribution {
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
export interface WaterfallTier {
  /** Tier name */
  name: string;
  /** Percentage of distribution (0-100) */
  percentage: number;
  /** Holders in this tier */
  holders: Holder[];
}

/** Waterfall distribution input */
export interface WaterfallInput {
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
export interface DistributionTrigger {
  /** Trigger type */
  type: 'amount' | 'time' | 'manual';
  /** Threshold amount (for 'amount' type) */
  thresholdAmount?: number;
  /** Interval in ms (for 'time' type) */
  intervalMs?: number;
}

/** Distribution configuration */
export interface DistributionConfig {
  /** Minimum payment amount */
  minPayment: number;
  /** Default currency */
  currency: string;
  /** Distribution trigger */
  trigger?: DistributionTrigger;
  /** Whether to include holders without payment handles */
  includeWithoutHandles: boolean;
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: DistributionConfig = {
  minPayment: 0.01,
  currency: 'USD',
  includeWithoutHandles: false,
};

// ============================================================================
// Dividend Engine Class
// ============================================================================

/**
 * Dividend Distribution Engine
 *
 * Calculates and manages pro-rata distributions to token holders.
 */
export class DividendEngine {
  readonly config: DistributionConfig;

  constructor(config: Partial<DistributionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate unique distribution ID
   */
  private generateId(): string {
    return `dist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate pro-rata distribution
   */
  calculateDistribution(input: DistributionInput): Distribution {
    const {
      totalAmount,
      currency = this.config.currency,
      holders,
      minPayment = this.config.minPayment,
      source,
      tokenId,
    } = input;

    // Filter holders with balance > 0
    const activeHolders = holders.filter((h) => h.balance > BigInt(0));

    // Calculate total tokens
    const totalTokens = activeHolders.reduce(
      (sum, h) => sum + h.balance,
      BigInt(0)
    );

    if (totalTokens === BigInt(0)) {
      return {
        id: this.generateId(),
        totalAmount,
        totalDistributed: 0,
        belowThreshold: totalAmount,
        currency,
        source,
        tokenId,
        totalTokens: BigInt(0),
        perTokenAmount: 0,
        eligibleHolders: 0,
        belowMinimumHolders: 0,
        payments: [],
        calculatedAt: new Date(),
      };
    }

    // Calculate per-token amount
    const perTokenAmount = totalAmount / Number(totalTokens);

    // Calculate individual payments
    const payments: DistributionPayment[] = [];
    let totalDistributed = 0;
    let belowThreshold = 0;
    let belowMinimumHolders = 0;

    for (const holder of activeHolders) {
      // Skip holders without payment handles if configured
      if (!this.config.includeWithoutHandles && !holder.paymentHandle) {
        continue;
      }

      const sharePercent =
        (Number(holder.balance) / Number(totalTokens)) * 100;
      const amount = Number(holder.balance) * perTokenAmount;

      // Round to cents
      const roundedAmount = Math.round(amount * 100) / 100;

      if (roundedAmount >= minPayment) {
        payments.push({
          userId: holder.userId,
          paymentHandle: holder.paymentHandle || holder.userId,
          balance: holder.balance,
          sharePercent,
          amount: roundedAmount,
          currency,
        });
        totalDistributed += roundedAmount;
      } else {
        belowThreshold += roundedAmount;
        belowMinimumHolders++;
      }
    }

    return {
      id: this.generateId(),
      totalAmount,
      totalDistributed,
      belowThreshold,
      currency,
      source,
      tokenId,
      totalTokens,
      perTokenAmount,
      eligibleHolders: payments.length,
      belowMinimumHolders,
      payments,
      calculatedAt: new Date(),
    };
  }

  /**
   * Calculate waterfall distribution (multi-tier)
   */
  calculateWaterfall(input: WaterfallInput): Distribution[] {
    const {
      totalAmount,
      currency = this.config.currency,
      tiers,
      minPayment = this.config.minPayment,
      source,
    } = input;

    // Validate tiers sum to 100%
    const tierSum = tiers.reduce((sum, t) => sum + t.percentage, 0);
    if (Math.abs(tierSum - 100) > 0.01) {
      throw new Error(`Waterfall tiers must sum to 100%, got ${tierSum}%`);
    }

    // Calculate distribution for each tier
    return tiers.map((tier) => {
      const tierAmount = (totalAmount * tier.percentage) / 100;
      return this.calculateDistribution({
        totalAmount: tierAmount,
        currency,
        holders: tier.holders,
        minPayment,
        source: source ? `${source} - ${tier.name}` : tier.name,
      });
    });
  }

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
    fixedPayments: Array<{ name: string; address: string; amount: number }>;
  } {
    const distributions: Distribution[] = [];
    const fixedPayments: Array<{ name: string; address: string; amount: number }> = [];

    for (const split of input.splits) {
      const amount = (input.totalAmount * split.percentage) / 100;

      if (split.destination === 'holders' && split.holders) {
        distributions.push(
          this.calculateDistribution({
            totalAmount: amount,
            currency: input.currency,
            holders: split.holders,
            minPayment: input.minPayment,
            source: input.source ? `${input.source} - ${split.name}` : split.name,
          })
        );
      } else if (split.destination === 'fixed' && split.fixedAddress) {
        fixedPayments.push({
          name: split.name,
          address: split.fixedAddress,
          amount,
        });
      }
    }

    return { distributions, fixedPayments };
  }

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
  } {
    const distribution = this.calculateDistribution(input);
    const amounts = distribution.payments.map((p) => p.amount).sort((a, b) => a - b);

    return {
      distribution,
      summary: {
        totalHolders: input.holders.length,
        eligibleHolders: distribution.eligibleHolders,
        largestPayment: amounts[amounts.length - 1] || 0,
        smallestPayment: amounts[0] || 0,
        medianPayment: amounts[Math.floor(amounts.length / 2)] || 0,
        averagePayment:
          distribution.eligibleHolders > 0
            ? distribution.totalDistributed / distribution.eligibleHolders
            : 0,
      },
    };
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a dividend engine with custom configuration
 */
export function createDividendEngine(
  config: Partial<DistributionConfig> = {}
): DividendEngine {
  return new DividendEngine(config);
}

/**
 * Quick calculation without creating an engine instance
 */
export function calculateProRata(
  totalAmount: number,
  holders: Holder[],
  options: { minPayment?: number; currency?: string } = {}
): Distribution {
  const engine = new DividendEngine(options);
  return engine.calculateDistribution({
    totalAmount,
    holders,
    ...options,
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate share percentage for a holder
 */
export function calculateSharePercent(
  balance: bigint,
  totalSupply: bigint
): number {
  if (totalSupply === BigInt(0)) return 0;
  return (Number(balance) / Number(totalSupply)) * 100;
}

/**
 * Format payment amount for display
 */
export function formatPaymentAmount(
  amount: number,
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Group payments by amount range for analysis
 */
export function groupPaymentsByRange(
  payments: DistributionPayment[]
): Record<string, DistributionPayment[]> {
  const ranges: Record<string, DistributionPayment[]> = {
    'micro (<$1)': [],
    'small ($1-$10)': [],
    'medium ($10-$100)': [],
    'large ($100-$1000)': [],
    'whale (>$1000)': [],
  };

  for (const payment of payments) {
    if (payment.amount < 1) {
      ranges['micro (<$1)'].push(payment);
    } else if (payment.amount < 10) {
      ranges['small ($1-$10)'].push(payment);
    } else if (payment.amount < 100) {
      ranges['medium ($10-$100)'].push(payment);
    } else if (payment.amount < 1000) {
      ranges['large ($100-$1000)'].push(payment);
    } else {
      ranges['whale (>$1000)'].push(payment);
    }
  }

  return ranges;
}
