/**
 * @b0ase/payments
 *
 * Multi-party payment splits and revenue distribution.
 *
 * @example
 * ```typescript
 * import { PaymentSplitter, createPaymentSplit } from '@b0ase/payments';
 *
 * // Create a payment split
 * const split = createPaymentSplit({
 *   totalAmount: 1000,
 *   currency: 'USD',
 *   recipients: [
 *     { id: 'creator', address: '$creator', percent: 70 },
 *     { id: 'platform', address: '$platform', percent: 25 },
 *     { id: 'referrer', address: '$referrer', percent: 5 },
 *   ],
 * });
 *
 * console.log(split.payments);
 * // [
 * //   { recipientId: 'creator', amount: 700 },
 * //   { recipientId: 'platform', amount: 250 },
 * //   { recipientId: 'referrer', amount: 50 },
 * // ]
 * ```
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Supported currencies */
export type Currency =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'BTC'
  | 'ETH'
  | 'BSV'
  | 'SOL'
  | 'USDC'
  | 'USDT';

/** Payment status */
export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled';

/** Split type */
export type SplitType =
  | 'percentage'  // Split by percentage
  | 'fixed'       // Fixed amounts
  | 'waterfall'   // Sequential (first gets X, then next, etc.)
  | 'priority';   // Priority-based with minimums

/** Payment recipient */
export interface Recipient {
  /** Unique recipient ID */
  id: string;
  /** Payment address or handle */
  address: string;
  /** Display name */
  name?: string;
  /** Split percentage (0-100) for percentage splits */
  percent?: number;
  /** Fixed amount for fixed splits */
  fixedAmount?: number;
  /** Priority (lower = higher priority) for priority splits */
  priority?: number;
  /** Minimum amount (for priority splits) */
  minimumAmount?: number;
  /** Maximum amount cap */
  maximumAmount?: number;
  /** Metadata */
  metadata?: Record<string, unknown>;
}

/** Payment split configuration */
export interface PaymentSplitConfig {
  /** Total amount to split */
  totalAmount: number;
  /** Currency */
  currency: Currency;
  /** Recipients */
  recipients: Recipient[];
  /** Split type (default: percentage) */
  splitType?: SplitType;
  /** Round to decimal places (default: 2) */
  roundTo?: number;
  /** How to handle rounding remainder */
  remainderTo?: string; // Recipient ID
  /** Minimum payment threshold */
  minimumPayment?: number;
  /** Source/reason */
  source?: string;
}

/** Individual payment in a split */
export interface SplitPayment {
  /** Recipient ID */
  recipientId: string;
  /** Recipient address */
  address: string;
  /** Amount */
  amount: number;
  /** Currency */
  currency: Currency;
  /** Percentage of total */
  percentOfTotal: number;
  /** Is below minimum (skipped) */
  belowMinimum: boolean;
}

/** Payment split result */
export interface PaymentSplit {
  /** Unique split ID */
  id: string;
  /** Total amount */
  totalAmount: number;
  /** Amount distributed */
  distributedAmount: number;
  /** Remainder (due to rounding/minimums) */
  remainder: number;
  /** Currency */
  currency: Currency;
  /** Individual payments */
  payments: SplitPayment[];
  /** Recipients below minimum */
  belowMinimumCount: number;
  /** Split type used */
  splitType: SplitType;
  /** Created timestamp */
  createdAt: Date;
  /** Source */
  source?: string;
}

/** Escrow configuration */
export interface EscrowConfig {
  /** Total amount */
  amount: number;
  /** Currency */
  currency: Currency;
  /** Payer address */
  payerAddress: string;
  /** Payee address */
  payeeAddress: string;
  /** Release conditions */
  releaseConditions: ReleaseCondition[];
  /** Expiry date */
  expiresAt?: Date;
  /** Dispute resolution address */
  disputeResolver?: string;
}

/** Release condition */
export interface ReleaseCondition {
  /** Condition type */
  type: 'approval' | 'milestone' | 'time' | 'signature';
  /** Description */
  description: string;
  /** Required approver (for approval type) */
  approver?: string;
  /** Milestone ID (for milestone type) */
  milestoneId?: string;
  /** Release date (for time type) */
  releaseDate?: Date;
  /** Is met */
  met: boolean;
}

/** Escrow state */
export interface Escrow {
  /** Escrow ID */
  id: string;
  /** Configuration */
  config: EscrowConfig;
  /** Current status */
  status: 'pending' | 'funded' | 'released' | 'refunded' | 'disputed';
  /** Funded amount */
  fundedAmount: number;
  /** Released amount */
  releasedAmount: number;
  /** Created timestamp */
  createdAt: Date;
  /** Funded timestamp */
  fundedAt?: Date;
  /** Released timestamp */
  releasedAt?: Date;
}

// ============================================================================
// Payment Splitter Class
// ============================================================================

/**
 * Payment Splitter
 *
 * Calculates multi-party payment splits.
 */
export class PaymentSplitter {
  private defaultCurrency: Currency = 'USD';
  private defaultRoundTo: number = 2;
  private defaultMinimum: number = 0.01;

  constructor(options?: {
    defaultCurrency?: Currency;
    defaultRoundTo?: number;
    defaultMinimum?: number;
  }) {
    if (options?.defaultCurrency) this.defaultCurrency = options.defaultCurrency;
    if (options?.defaultRoundTo !== undefined) this.defaultRoundTo = options.defaultRoundTo;
    if (options?.defaultMinimum !== undefined) this.defaultMinimum = options.defaultMinimum;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `split-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Round to decimal places
   */
  private round(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  /**
   * Calculate percentage split
   */
  private calculatePercentageSplit(config: PaymentSplitConfig): SplitPayment[] {
    const roundTo = config.roundTo ?? this.defaultRoundTo;
    const minimum = config.minimumPayment ?? this.defaultMinimum;
    const payments: SplitPayment[] = [];

    // Validate percentages sum to ~100
    const totalPercent = config.recipients.reduce(
      (sum, r) => sum + (r.percent || 0),
      0
    );
    if (Math.abs(totalPercent - 100) > 0.01) {
      throw new Error(`Percentages must sum to 100%, got ${totalPercent}%`);
    }

    for (const recipient of config.recipients) {
      const percent = recipient.percent || 0;
      let amount = this.round((config.totalAmount * percent) / 100, roundTo);

      // Apply caps
      if (recipient.maximumAmount && amount > recipient.maximumAmount) {
        amount = recipient.maximumAmount;
      }

      const belowMinimum = amount < minimum;

      payments.push({
        recipientId: recipient.id,
        address: recipient.address,
        amount: belowMinimum ? 0 : amount,
        currency: config.currency,
        percentOfTotal: percent,
        belowMinimum,
      });
    }

    return payments;
  }

  /**
   * Calculate fixed split
   */
  private calculateFixedSplit(config: PaymentSplitConfig): SplitPayment[] {
    const minimum = config.minimumPayment ?? this.defaultMinimum;
    const payments: SplitPayment[] = [];

    const totalFixed = config.recipients.reduce(
      (sum, r) => sum + (r.fixedAmount || 0),
      0
    );

    if (totalFixed > config.totalAmount) {
      throw new Error(
        `Fixed amounts (${totalFixed}) exceed total (${config.totalAmount})`
      );
    }

    for (const recipient of config.recipients) {
      const amount = recipient.fixedAmount || 0;
      const belowMinimum = amount < minimum;

      payments.push({
        recipientId: recipient.id,
        address: recipient.address,
        amount: belowMinimum ? 0 : amount,
        currency: config.currency,
        percentOfTotal: (amount / config.totalAmount) * 100,
        belowMinimum,
      });
    }

    return payments;
  }

  /**
   * Calculate waterfall split
   */
  private calculateWaterfallSplit(config: PaymentSplitConfig): SplitPayment[] {
    const roundTo = config.roundTo ?? this.defaultRoundTo;
    const minimum = config.minimumPayment ?? this.defaultMinimum;
    const payments: SplitPayment[] = [];

    // Sort by priority
    const sorted = [...config.recipients].sort(
      (a, b) => (a.priority || 0) - (b.priority || 0)
    );

    let remaining = config.totalAmount;

    for (const recipient of sorted) {
      if (remaining <= 0) {
        payments.push({
          recipientId: recipient.id,
          address: recipient.address,
          amount: 0,
          currency: config.currency,
          percentOfTotal: 0,
          belowMinimum: true,
        });
        continue;
      }

      let amount = recipient.fixedAmount || remaining;
      amount = Math.min(amount, remaining);

      if (recipient.maximumAmount) {
        amount = Math.min(amount, recipient.maximumAmount);
      }

      amount = this.round(amount, roundTo);
      remaining -= amount;

      const belowMinimum = amount < minimum;

      payments.push({
        recipientId: recipient.id,
        address: recipient.address,
        amount: belowMinimum ? 0 : amount,
        currency: config.currency,
        percentOfTotal: (amount / config.totalAmount) * 100,
        belowMinimum,
      });
    }

    return payments;
  }

  /**
   * Create payment split
   */
  split(config: PaymentSplitConfig): PaymentSplit {
    const splitType = config.splitType || 'percentage';
    let payments: SplitPayment[];

    switch (splitType) {
      case 'percentage':
        payments = this.calculatePercentageSplit(config);
        break;
      case 'fixed':
        payments = this.calculateFixedSplit(config);
        break;
      case 'waterfall':
      case 'priority':
        payments = this.calculateWaterfallSplit(config);
        break;
      default:
        throw new Error(`Unknown split type: ${splitType}`);
    }

    const distributedAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const remainder = this.round(
      config.totalAmount - distributedAmount,
      config.roundTo ?? this.defaultRoundTo
    );

    // Handle remainder
    if (remainder > 0 && config.remainderTo) {
      const remainderPayment = payments.find(
        (p) => p.recipientId === config.remainderTo
      );
      if (remainderPayment) {
        remainderPayment.amount += remainder;
      }
    }

    return {
      id: this.generateId(),
      totalAmount: config.totalAmount,
      distributedAmount: distributedAmount + (config.remainderTo ? remainder : 0),
      remainder: config.remainderTo ? 0 : remainder,
      currency: config.currency,
      payments,
      belowMinimumCount: payments.filter((p) => p.belowMinimum).length,
      splitType,
      createdAt: new Date(),
      source: config.source,
    };
  }

  /**
   * Validate split configuration
   */
  validate(config: PaymentSplitConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.totalAmount <= 0) {
      errors.push('Total amount must be positive');
    }

    if (config.recipients.length === 0) {
      errors.push('At least one recipient required');
    }

    const splitType = config.splitType || 'percentage';

    if (splitType === 'percentage') {
      const totalPercent = config.recipients.reduce(
        (sum, r) => sum + (r.percent || 0),
        0
      );
      if (Math.abs(totalPercent - 100) > 0.01) {
        errors.push(`Percentages must sum to 100%, got ${totalPercent}%`);
      }
    }

    if (splitType === 'fixed') {
      const totalFixed = config.recipients.reduce(
        (sum, r) => sum + (r.fixedAmount || 0),
        0
      );
      if (totalFixed > config.totalAmount) {
        errors.push(
          `Fixed amounts (${totalFixed}) exceed total (${config.totalAmount})`
        );
      }
    }

    // Check for duplicate IDs
    const ids = config.recipients.map((r) => r.id);
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (duplicates.length > 0) {
      errors.push(`Duplicate recipient IDs: ${duplicates.join(', ')}`);
    }

    return { valid: errors.length === 0, errors };
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a payment splitter
 */
export function createPaymentSplitter(options?: {
  defaultCurrency?: Currency;
  defaultRoundTo?: number;
  defaultMinimum?: number;
}): PaymentSplitter {
  return new PaymentSplitter(options);
}

/**
 * Quick split without creating splitter instance
 */
export function createPaymentSplit(config: PaymentSplitConfig): PaymentSplit {
  const splitter = new PaymentSplitter();
  return splitter.split(config);
}

// ============================================================================
// Preset Splits
// ============================================================================

/** Standard 70/30 creator/platform split */
export function creatorPlatformSplit(
  totalAmount: number,
  creatorAddress: string,
  platformAddress: string,
  currency: Currency = 'USD'
): PaymentSplit {
  return createPaymentSplit({
    totalAmount,
    currency,
    recipients: [
      { id: 'creator', address: creatorAddress, percent: 70 },
      { id: 'platform', address: platformAddress, percent: 30 },
    ],
  });
}

/** Three-way split (creator/platform/referrer) */
export function threeWaySplit(
  totalAmount: number,
  addresses: {
    creator: string;
    platform: string;
    referrer: string;
  },
  percentages: {
    creator: number;
    platform: number;
    referrer: number;
  } = { creator: 70, platform: 25, referrer: 5 },
  currency: Currency = 'USD'
): PaymentSplit {
  return createPaymentSplit({
    totalAmount,
    currency,
    recipients: [
      { id: 'creator', address: addresses.creator, percent: percentages.creator },
      { id: 'platform', address: addresses.platform, percent: percentages.platform },
      { id: 'referrer', address: addresses.referrer, percent: percentages.referrer },
    ],
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format currency amount
 */
export function formatAmount(
  amount: number,
  currency: Currency
): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    BTC: '₿',
    ETH: 'Ξ',
    BSV: 'BSV ',
    SOL: 'SOL ',
    USDC: 'USDC ',
    USDT: 'USDT ',
  };

  const decimals = ['BTC', 'ETH', 'BSV', 'SOL'].includes(currency) ? 8 : 2;
  const symbol = symbols[currency] || `${currency} `;

  return `${symbol}${amount.toFixed(decimals)}`;
}

/**
 * Calculate platform fee
 */
export function calculatePlatformFee(
  amount: number,
  feePercent: number,
  minFee: number = 0
): number {
  const fee = amount * (feePercent / 100);
  return Math.max(fee, minFee);
}
