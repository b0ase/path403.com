/**
 * @b0ase/ledger - Types
 *
 * Unified types for the b0ase accounting layer.
 * Supports both 1Sat Ordinals and BRC-100 tokens.
 */

// ============================================================================
// Token Types
// ============================================================================

export type TokenStandard = '1sat' | 'brc100' | 'internal';
export type TokenType = 'fungible' | 'non-fungible';

export interface Token {
  id: string;
  ticker: string;
  name: string;
  description?: string;
  standard: TokenStandard;
  type: TokenType;
  totalSupply: bigint;
  decimals: number;
  blockchain: string;
  deployTxid?: string;
  isDeployed: boolean;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Balance Types
// ============================================================================

export interface Balance {
  userId: string;
  tokenId: string;
  ticker: string;
  balance: bigint;
  pendingIn: bigint;
  pendingOut: bigint;
  availableBalance: bigint;
  totalPurchased: bigint;
  totalReceived: bigint;
  totalSent: bigint;
  totalWithdrawn: bigint;
  averageBuyPrice?: number;
  totalInvestedUsd?: number;
}

export interface PortfolioSummary {
  userId: string;
  balances: Balance[];
  totalValueUsd: number;
  totalValueGbp: number;
  lastUpdated: Date;
}

// ============================================================================
// Transaction Types
// ============================================================================

export type TransactionType =
  | 'purchase'      // Bought tokens (fiat or crypto)
  | 'sale'          // Sold tokens
  | 'transfer_in'   // Received from another user
  | 'transfer_out'  // Sent to another user
  | 'withdrawal'    // Moved to on-chain wallet
  | 'deposit'       // Received from on-chain wallet
  | 'dividend'      // Dividend payment received
  | 'mint'          // New tokens minted
  | 'burn'          // Tokens burned
  | 'airdrop'       // Free tokens received
  | 'swap';         // Token swap

export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'cancelled';

export interface Transaction {
  id: string;
  userId: string;
  tokenId: string;
  ticker: string;
  type: TransactionType;
  amount: bigint;

  // On-chain details (optional - only for blockchain txs)
  txid?: string;
  blockHeight?: number;
  confirmations?: number;

  // Counterparty
  fromAddress?: string;
  toAddress?: string;
  fromUserId?: string;
  toUserId?: string;

  // Value at time of transaction
  priceUsd?: number;
  valueUsd?: number;

  // Payment details (for purchases)
  paymentMethod?: string;
  paymentAmount?: number;
  paymentCurrency?: string;
  stripeSessionId?: string;

  // Status
  status: TransactionStatus;

  // Metadata
  notes?: string;
  metadata?: Record<string, unknown>;

  // Timestamps
  createdAt: Date;
  confirmedAt?: Date;
}

// ============================================================================
// Dividend Types
// ============================================================================

export interface DividendDistribution {
  id: string;
  name: string;
  tokenId: string;
  ticker: string;
  totalAmount: number;
  currency: string;
  perTokenAmount: number;
  eligibleTokens: bigint;
  recordDate: Date;
  paymentDate: Date;
  status: 'announced' | 'processing' | 'paid' | 'cancelled';
}

export interface DividendPayment {
  id: string;
  distributionId: string;
  userId: string;
  eligibleTokens: bigint;
  paymentAmount: number;
  currency: string;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  txid?: string;
  paidAt?: Date;
}

// ============================================================================
// Withdrawal Types
// ============================================================================

export interface WithdrawalRequest {
  id: string;
  userId: string;
  tokenId: string;
  ticker: string;
  amount: bigint;
  destination: string;
  blockchain: string;
  status: 'pending' | 'approved' | 'rejected' | 'executing' | 'completed' | 'failed';
  txid?: string;
  rejectionReason?: string;
  createdAt: Date;
  executedAt?: Date;
}

// ============================================================================
// Input Types (for creating records)
// ============================================================================

export interface RecordTransactionInput {
  userId: string;
  tokenId: string;
  type: TransactionType;
  amount: bigint;
  txid?: string;
  fromAddress?: string;
  toAddress?: string;
  fromUserId?: string;
  toUserId?: string;
  priceUsd?: number;
  paymentMethod?: string;
  paymentAmount?: number;
  paymentCurrency?: string;
  stripeSessionId?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface RecordPurchaseInput {
  userId: string;
  tokenId: string;
  tokenAmount: bigint;
  usdAmount: number;
  pricePerToken: number;
  paymentMethod: 'stripe' | 'crypto' | 'bank_transfer' | 'handcash';
  paymentCurrency?: string;
  paymentAmount?: number;
  stripeSessionId?: string;
  cryptoTxid?: string;
  notes?: string;
}

export interface RequestWithdrawalInput {
  userId: string;
  tokenId: string;
  amount: bigint;
  destination: string;
  blockchain?: string;
  notes?: string;
}

export interface TransferInput {
  fromUserId: string;
  toUserId: string;
  tokenId: string;
  amount: bigint;
  notes?: string;
}

// ============================================================================
// Query Types
// ============================================================================

export interface TransactionQuery {
  userId?: string;
  tokenId?: string;
  type?: TransactionType | TransactionType[];
  status?: TransactionStatus | TransactionStatus[];
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}

export interface HoldersQuery {
  tokenId: string;
  minBalance?: bigint;
  limit?: number;
  offset?: number;
}

// ============================================================================
// Ledger Config
// ============================================================================

export interface LedgerConfig {
  /** Prisma client instance */
  prisma: unknown; // Will be typed as PrismaClient when used

  /** Default blockchain for new tokens */
  defaultBlockchain?: string;

  /** Enable transaction logging */
  enableLogging?: boolean;

  /** Webhook URL for transaction notifications */
  webhookUrl?: string;
}
