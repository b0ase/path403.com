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
/** Supported currencies */
type Currency = 'USD' | 'EUR' | 'GBP' | 'BTC' | 'ETH' | 'BSV' | 'SOL' | 'USDC' | 'USDT';
/** Payment status */
type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
/** Split type */
type SplitType = 'percentage' | 'fixed' | 'waterfall' | 'priority';
/** Payment recipient */
interface Recipient {
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
interface PaymentSplitConfig {
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
    remainderTo?: string;
    /** Minimum payment threshold */
    minimumPayment?: number;
    /** Source/reason */
    source?: string;
}
/** Individual payment in a split */
interface SplitPayment {
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
interface PaymentSplit {
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
interface EscrowConfig {
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
interface ReleaseCondition {
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
interface Escrow {
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
/**
 * Payment Splitter
 *
 * Calculates multi-party payment splits.
 */
declare class PaymentSplitter {
    private defaultCurrency;
    private defaultRoundTo;
    private defaultMinimum;
    constructor(options?: {
        defaultCurrency?: Currency;
        defaultRoundTo?: number;
        defaultMinimum?: number;
    });
    /**
     * Generate unique ID
     */
    private generateId;
    /**
     * Round to decimal places
     */
    private round;
    /**
     * Calculate percentage split
     */
    private calculatePercentageSplit;
    /**
     * Calculate fixed split
     */
    private calculateFixedSplit;
    /**
     * Calculate waterfall split
     */
    private calculateWaterfallSplit;
    /**
     * Create payment split
     */
    split(config: PaymentSplitConfig): PaymentSplit;
    /**
     * Validate split configuration
     */
    validate(config: PaymentSplitConfig): {
        valid: boolean;
        errors: string[];
    };
}
/**
 * Create a payment splitter
 */
declare function createPaymentSplitter(options?: {
    defaultCurrency?: Currency;
    defaultRoundTo?: number;
    defaultMinimum?: number;
}): PaymentSplitter;
/**
 * Quick split without creating splitter instance
 */
declare function createPaymentSplit(config: PaymentSplitConfig): PaymentSplit;
/** Standard 70/30 creator/platform split */
declare function creatorPlatformSplit(totalAmount: number, creatorAddress: string, platformAddress: string, currency?: Currency): PaymentSplit;
/** Three-way split (creator/platform/referrer) */
declare function threeWaySplit(totalAmount: number, addresses: {
    creator: string;
    platform: string;
    referrer: string;
}, percentages?: {
    creator: number;
    platform: number;
    referrer: number;
}, currency?: Currency): PaymentSplit;
/**
 * Format currency amount
 */
declare function formatAmount(amount: number, currency: Currency): string;
/**
 * Calculate platform fee
 */
declare function calculatePlatformFee(amount: number, feePercent: number, minFee?: number): number;

export { type Currency, type Escrow, type EscrowConfig, type PaymentSplit, type PaymentSplitConfig, PaymentSplitter, type PaymentStatus, type Recipient, type ReleaseCondition, type SplitPayment, type SplitType, calculatePlatformFee, createPaymentSplit, createPaymentSplitter, creatorPlatformSplit, formatAmount, threeWaySplit };
