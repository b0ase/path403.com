/**
 * @b0ase/token-distributor
 *
 * Batch token distribution and airdrop management.
 *
 * @packageDocumentation
 */
/** Distribution type */
type DistributionType = 'equal' | 'proportional' | 'fixed' | 'weighted' | 'random' | 'tiered';
/** Distribution status */
type DistributionStatus = 'draft' | 'scheduled' | 'processing' | 'completed' | 'failed' | 'cancelled';
/** Recipient status */
type RecipientStatus = 'pending' | 'processing' | 'sent' | 'confirmed' | 'failed';
/** Recipient */
interface Recipient {
    id: string;
    address: string;
    email?: string;
    name?: string;
    amount: bigint;
    weight?: number;
    tier?: string;
    status: RecipientStatus;
    txid?: string;
    error?: string;
    processedAt?: Date;
    metadata?: Record<string, unknown>;
}
/** Distribution */
interface Distribution {
    id: string;
    name: string;
    description?: string;
    tokenId: string;
    tokenSymbol: string;
    totalAmount: bigint;
    distributedAmount: bigint;
    type: DistributionType;
    status: DistributionStatus;
    recipients: Recipient[];
    scheduledAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    settings: DistributionSettings;
    metadata?: Record<string, unknown>;
}
/** Distribution settings */
interface DistributionSettings {
    batchSize: number;
    retryAttempts: number;
    retryDelay: number;
    minConfirmations?: number;
    allowDuplicates: boolean;
    validateAddresses: boolean;
    notifyRecipients: boolean;
    expiresAt?: Date;
}
/** Tier definition */
interface TierDefinition {
    name: string;
    minAmount?: bigint;
    maxAmount?: bigint;
    percentage?: number;
    fixedAmount?: bigint;
}
/** Distribution config */
interface DistributionConfig {
    name: string;
    tokenId: string;
    tokenSymbol: string;
    type: DistributionType;
    totalAmount: bigint;
    recipients: RecipientInput[];
    settings?: Partial<DistributionSettings>;
    tiers?: TierDefinition[];
    scheduledAt?: Date;
}
/** Recipient input */
interface RecipientInput {
    address: string;
    email?: string;
    name?: string;
    amount?: bigint;
    weight?: number;
    tier?: string;
}
/** Distribution progress */
interface DistributionProgress {
    total: number;
    pending: number;
    processing: number;
    sent: number;
    confirmed: number;
    failed: number;
    percentage: number;
}
/** Batch result */
interface BatchResult {
    batchIndex: number;
    recipients: Recipient[];
    successCount: number;
    failCount: number;
    txids: string[];
}
/** Distribution summary */
interface DistributionSummary {
    id: string;
    name: string;
    status: DistributionStatus;
    tokenSymbol: string;
    totalAmount: string;
    recipientCount: number;
    progress: DistributionProgress;
    createdAt: Date;
    completedAt?: Date;
}
declare const DEFAULT_SETTINGS: DistributionSettings;
declare class TokenDistributor {
    private distributions;
    private sendCallback?;
    /**
     * Set the send callback for executing transfers
     */
    setSendCallback(callback: (recipient: Recipient, tokenId: string) => Promise<string>): void;
    /**
     * Create a new distribution
     */
    createDistribution(config: DistributionConfig, createdBy: string): Distribution;
    /**
     * Calculate amounts for each recipient
     */
    private calculateAmounts;
    /**
     * Start a distribution
     */
    startDistribution(distributionId: string): Promise<void>;
    /**
     * Process distribution in batches
     */
    private processDistribution;
    /**
     * Process a single batch
     */
    private processBatch;
    /**
     * Cancel a distribution
     */
    cancelDistribution(distributionId: string): void;
    /**
     * Get distribution by ID
     */
    getDistribution(distributionId: string): Distribution | undefined;
    /**
     * Get distribution progress
     */
    getProgress(distributionId: string): DistributionProgress | undefined;
    /**
     * Get all distributions
     */
    getAllDistributions(): Distribution[];
    /**
     * Get distribution summary
     */
    getSummary(distributionId: string): DistributionSummary | undefined;
    /**
     * Create batches from recipients
     */
    private createBatches;
    /**
     * Delay helper
     */
    private delay;
    /**
     * Generate unique ID
     */
    private generateId;
}
declare function createTokenDistributor(): TokenDistributor;
declare function validateAddress(address: string, blockchain?: string): boolean;
declare function formatDistributionAmount(amount: bigint, decimals?: number): string;
declare function parseCSVRecipients(csv: string): RecipientInput[];
declare function exportRecipientsCSV(recipients: Recipient[]): string;

export { type BatchResult, DEFAULT_SETTINGS, type Distribution, type DistributionConfig, type DistributionProgress, type DistributionSettings, type DistributionStatus, type DistributionSummary, type DistributionType, type Recipient, type RecipientInput, type RecipientStatus, type TierDefinition, TokenDistributor, createTokenDistributor, exportRecipientsCSV, formatDistributionAmount, parseCSVRecipients, validateAddress };
