/**
 * @b0ase/token-distributor
 *
 * Batch token distribution and airdrop management.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Distribution type */
export type DistributionType =
  | 'equal'
  | 'proportional'
  | 'fixed'
  | 'weighted'
  | 'random'
  | 'tiered';

/** Distribution status */
export type DistributionStatus =
  | 'draft'
  | 'scheduled'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

/** Recipient status */
export type RecipientStatus =
  | 'pending'
  | 'processing'
  | 'sent'
  | 'confirmed'
  | 'failed';

/** Recipient */
export interface Recipient {
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
export interface Distribution {
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
export interface DistributionSettings {
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
export interface TierDefinition {
  name: string;
  minAmount?: bigint;
  maxAmount?: bigint;
  percentage?: number;
  fixedAmount?: bigint;
}

/** Distribution config */
export interface DistributionConfig {
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
export interface RecipientInput {
  address: string;
  email?: string;
  name?: string;
  amount?: bigint;
  weight?: number;
  tier?: string;
}

/** Distribution progress */
export interface DistributionProgress {
  total: number;
  pending: number;
  processing: number;
  sent: number;
  confirmed: number;
  failed: number;
  percentage: number;
}

/** Batch result */
export interface BatchResult {
  batchIndex: number;
  recipients: Recipient[];
  successCount: number;
  failCount: number;
  txids: string[];
}

/** Distribution summary */
export interface DistributionSummary {
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

// ============================================================================
// Default Settings
// ============================================================================

export const DEFAULT_SETTINGS: DistributionSettings = {
  batchSize: 100,
  retryAttempts: 3,
  retryDelay: 5000,
  minConfirmations: 1,
  allowDuplicates: false,
  validateAddresses: true,
  notifyRecipients: false,
};

// ============================================================================
// Token Distributor
// ============================================================================

export class TokenDistributor {
  private distributions: Map<string, Distribution> = new Map();
  private sendCallback?: (recipient: Recipient, tokenId: string) => Promise<string>;

  /**
   * Set the send callback for executing transfers
   */
  setSendCallback(callback: (recipient: Recipient, tokenId: string) => Promise<string>): void {
    this.sendCallback = callback;
  }

  /**
   * Create a new distribution
   */
  createDistribution(config: DistributionConfig, createdBy: string): Distribution {
    const id = this.generateId('dist');
    const settings = { ...DEFAULT_SETTINGS, ...config.settings };

    // Calculate amounts based on distribution type
    const recipients = this.calculateAmounts(
      config.recipients,
      config.type,
      config.totalAmount,
      config.tiers
    );

    const distribution: Distribution = {
      id,
      name: config.name,
      tokenId: config.tokenId,
      tokenSymbol: config.tokenSymbol,
      totalAmount: config.totalAmount,
      distributedAmount: BigInt(0),
      type: config.type,
      status: config.scheduledAt ? 'scheduled' : 'draft',
      recipients,
      scheduledAt: config.scheduledAt,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      settings,
    };

    this.distributions.set(id, distribution);
    return distribution;
  }

  /**
   * Calculate amounts for each recipient
   */
  private calculateAmounts(
    inputs: RecipientInput[],
    type: DistributionType,
    totalAmount: bigint,
    tiers?: TierDefinition[]
  ): Recipient[] {
    const recipients: Recipient[] = inputs.map(input => ({
      id: this.generateId('rcpt'),
      address: input.address,
      email: input.email,
      name: input.name,
      amount: BigInt(0),
      weight: input.weight,
      tier: input.tier,
      status: 'pending',
    }));

    switch (type) {
      case 'equal': {
        const equalAmount = totalAmount / BigInt(recipients.length);
        for (const r of recipients) {
          r.amount = equalAmount;
        }
        break;
      }

      case 'fixed': {
        for (let i = 0; i < recipients.length; i++) {
          recipients[i].amount = inputs[i].amount || BigInt(0);
        }
        break;
      }

      case 'weighted': {
        const totalWeight = inputs.reduce((sum, i) => sum + (i.weight || 1), 0);
        for (let i = 0; i < recipients.length; i++) {
          const weight = inputs[i].weight || 1;
          recipients[i].amount = (totalAmount * BigInt(Math.floor(weight * 1000))) /
            BigInt(Math.floor(totalWeight * 1000));
        }
        break;
      }

      case 'proportional': {
        const totalInputAmount = inputs.reduce(
          (sum, i) => sum + (i.amount || BigInt(0)),
          BigInt(0)
        );
        if (totalInputAmount > BigInt(0)) {
          for (let i = 0; i < recipients.length; i++) {
            const inputAmount = inputs[i].amount || BigInt(0);
            recipients[i].amount = (totalAmount * inputAmount) / totalInputAmount;
          }
        }
        break;
      }

      case 'tiered': {
        if (!tiers) break;
        for (let i = 0; i < recipients.length; i++) {
          const tierName = inputs[i].tier;
          const tier = tiers.find(t => t.name === tierName);
          if (tier) {
            if (tier.fixedAmount) {
              recipients[i].amount = tier.fixedAmount;
            } else if (tier.percentage) {
              recipients[i].amount = (totalAmount * BigInt(Math.floor(tier.percentage * 100))) / BigInt(10000);
            }
          }
        }
        break;
      }

      case 'random': {
        let remaining = totalAmount;
        const shuffled = [...recipients].sort(() => Math.random() - 0.5);
        for (let i = 0; i < shuffled.length - 1; i++) {
          const maxAmount = remaining / BigInt(shuffled.length - i);
          const randomAmount = BigInt(Math.floor(Math.random() * Number(maxAmount * BigInt(2))));
          shuffled[i].amount = randomAmount > remaining ? remaining : randomAmount;
          remaining -= shuffled[i].amount;
        }
        shuffled[shuffled.length - 1].amount = remaining;
        break;
      }
    }

    return recipients;
  }

  /**
   * Start a distribution
   */
  async startDistribution(distributionId: string): Promise<void> {
    const distribution = this.distributions.get(distributionId);
    if (!distribution) {
      throw new Error(`Distribution not found: ${distributionId}`);
    }

    if (distribution.status !== 'draft' && distribution.status !== 'scheduled') {
      throw new Error(`Cannot start distribution with status: ${distribution.status}`);
    }

    if (!this.sendCallback) {
      throw new Error('Send callback not configured');
    }

    distribution.status = 'processing';
    distribution.startedAt = new Date();
    distribution.updatedAt = new Date();

    await this.processDistribution(distribution);
  }

  /**
   * Process distribution in batches
   */
  private async processDistribution(distribution: Distribution): Promise<void> {
    const { recipients, settings, tokenId } = distribution;
    const batches = this.createBatches(recipients, settings.batchSize);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      await this.processBatch(distribution, batch, i);

      // Check if cancelled
      if (distribution.status === 'cancelled') {
        break;
      }
    }

    // Update final status
    const failedCount = recipients.filter(r => r.status === 'failed').length;
    distribution.status = failedCount === recipients.length ? 'failed' : 'completed';
    distribution.completedAt = new Date();
    distribution.updatedAt = new Date();
    distribution.distributedAmount = recipients
      .filter(r => r.status === 'confirmed' || r.status === 'sent')
      .reduce((sum, r) => sum + r.amount, BigInt(0));
  }

  /**
   * Process a single batch
   */
  private async processBatch(
    distribution: Distribution,
    batch: Recipient[],
    batchIndex: number
  ): Promise<BatchResult> {
    const result: BatchResult = {
      batchIndex,
      recipients: batch,
      successCount: 0,
      failCount: 0,
      txids: [],
    };

    for (const recipient of batch) {
      recipient.status = 'processing';

      for (let attempt = 0; attempt < distribution.settings.retryAttempts; attempt++) {
        try {
          const txid = await this.sendCallback!(recipient, distribution.tokenId);
          recipient.txid = txid;
          recipient.status = 'sent';
          recipient.processedAt = new Date();
          result.successCount++;
          result.txids.push(txid);
          break;
        } catch (error) {
          if (attempt === distribution.settings.retryAttempts - 1) {
            recipient.status = 'failed';
            recipient.error = error instanceof Error ? error.message : 'Unknown error';
            recipient.processedAt = new Date();
            result.failCount++;
          } else {
            await this.delay(distribution.settings.retryDelay);
          }
        }
      }
    }

    distribution.updatedAt = new Date();
    return result;
  }

  /**
   * Cancel a distribution
   */
  cancelDistribution(distributionId: string): void {
    const distribution = this.distributions.get(distributionId);
    if (!distribution) {
      throw new Error(`Distribution not found: ${distributionId}`);
    }

    if (distribution.status === 'completed' || distribution.status === 'failed') {
      throw new Error('Cannot cancel completed distribution');
    }

    distribution.status = 'cancelled';
    distribution.updatedAt = new Date();
  }

  /**
   * Get distribution by ID
   */
  getDistribution(distributionId: string): Distribution | undefined {
    return this.distributions.get(distributionId);
  }

  /**
   * Get distribution progress
   */
  getProgress(distributionId: string): DistributionProgress | undefined {
    const distribution = this.distributions.get(distributionId);
    if (!distribution) return undefined;

    const { recipients } = distribution;
    const total = recipients.length;
    const pending = recipients.filter(r => r.status === 'pending').length;
    const processing = recipients.filter(r => r.status === 'processing').length;
    const sent = recipients.filter(r => r.status === 'sent').length;
    const confirmed = recipients.filter(r => r.status === 'confirmed').length;
    const failed = recipients.filter(r => r.status === 'failed').length;
    const completed = sent + confirmed;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return { total, pending, processing, sent, confirmed, failed, percentage };
  }

  /**
   * Get all distributions
   */
  getAllDistributions(): Distribution[] {
    return Array.from(this.distributions.values());
  }

  /**
   * Get distribution summary
   */
  getSummary(distributionId: string): DistributionSummary | undefined {
    const distribution = this.distributions.get(distributionId);
    if (!distribution) return undefined;

    const progress = this.getProgress(distributionId)!;

    return {
      id: distribution.id,
      name: distribution.name,
      status: distribution.status,
      tokenSymbol: distribution.tokenSymbol,
      totalAmount: distribution.totalAmount.toString(),
      recipientCount: distribution.recipients.length,
      progress,
      createdAt: distribution.createdAt,
      completedAt: distribution.completedAt,
    };
  }

  /**
   * Create batches from recipients
   */
  private createBatches(recipients: Recipient[], batchSize: number): Recipient[][] {
    const batches: Recipient[][] = [];
    for (let i = 0; i < recipients.length; i += batchSize) {
      batches.push(recipients.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate unique ID
   */
  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createTokenDistributor(): TokenDistributor {
  return new TokenDistributor();
}

// ============================================================================
// Utility Functions
// ============================================================================

export function validateAddress(address: string, blockchain?: string): boolean {
  // Basic validation - real implementation would be blockchain-specific
  if (!address || address.length < 10) return false;

  if (blockchain === 'bsv' || blockchain === 'bitcoin') {
    return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address);
  }

  if (blockchain === 'ethereum' || blockchain === 'evm') {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  if (blockchain === 'solana') {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  }

  return true;
}

export function formatDistributionAmount(amount: bigint, decimals: number = 8): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;

  if (fraction === BigInt(0)) {
    return whole.toString();
  }

  const fractionStr = fraction.toString().padStart(decimals, '0');
  return `${whole}.${fractionStr.replace(/0+$/, '')}`;
}

export function parseCSVRecipients(csv: string): RecipientInput[] {
  const lines = csv.trim().split('\n');
  const recipients: RecipientInput[] = [];

  for (const line of lines) {
    const parts = line.split(',').map(p => p.trim());
    if (parts.length >= 1 && parts[0]) {
      recipients.push({
        address: parts[0],
        amount: parts[1] ? BigInt(parts[1]) : undefined,
        email: parts[2] || undefined,
        name: parts[3] || undefined,
      });
    }
  }

  return recipients;
}

export function exportRecipientsCSV(recipients: Recipient[]): string {
  const header = 'address,amount,status,txid,error';
  const lines = recipients.map(r =>
    `${r.address},${r.amount.toString()},${r.status},${r.txid || ''},${r.error || ''}`
  );
  return [header, ...lines].join('\n');
}
