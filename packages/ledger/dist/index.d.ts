/**
 * @b0ase/ledger - Types
 *
 * Unified types for the b0ase accounting layer.
 * Supports both 1Sat Ordinals and BRC-100 tokens.
 */
type TokenStandard = '1sat' | 'brc100' | 'internal';
type TokenType = 'fungible' | 'non-fungible';
interface Token {
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
interface Balance {
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
interface PortfolioSummary {
    userId: string;
    balances: Balance[];
    totalValueUsd: number;
    totalValueGbp: number;
    lastUpdated: Date;
}
type TransactionType = 'purchase' | 'sale' | 'transfer_in' | 'transfer_out' | 'withdrawal' | 'deposit' | 'dividend' | 'mint' | 'burn' | 'airdrop' | 'swap';
type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'cancelled';
interface Transaction {
    id: string;
    userId: string;
    tokenId: string;
    ticker: string;
    type: TransactionType;
    amount: bigint;
    txid?: string;
    blockHeight?: number;
    confirmations?: number;
    fromAddress?: string;
    toAddress?: string;
    fromUserId?: string;
    toUserId?: string;
    priceUsd?: number;
    valueUsd?: number;
    paymentMethod?: string;
    paymentAmount?: number;
    paymentCurrency?: string;
    stripeSessionId?: string;
    status: TransactionStatus;
    notes?: string;
    metadata?: Record<string, unknown>;
    createdAt: Date;
    confirmedAt?: Date;
}
interface DividendDistribution {
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
interface DividendPayment {
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
interface WithdrawalRequest {
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
interface RecordTransactionInput {
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
interface RecordPurchaseInput {
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
interface RequestWithdrawalInput {
    userId: string;
    tokenId: string;
    amount: bigint;
    destination: string;
    blockchain?: string;
    notes?: string;
}
interface TransferInput {
    fromUserId: string;
    toUserId: string;
    tokenId: string;
    amount: bigint;
    notes?: string;
}
interface TransactionQuery {
    userId?: string;
    tokenId?: string;
    type?: TransactionType | TransactionType[];
    status?: TransactionStatus | TransactionStatus[];
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
    offset?: number;
}
interface HoldersQuery {
    tokenId: string;
    minBalance?: bigint;
    limit?: number;
    offset?: number;
}
interface LedgerConfig {
    /** Prisma client instance */
    prisma: unknown;
    /** Default blockchain for new tokens */
    defaultBlockchain?: string;
    /** Enable transaction logging */
    enableLogging?: boolean;
    /** Webhook URL for transaction notifications */
    webhookUrl?: string;
}

/**
 * @b0ase/ledger - Ledger Service
 *
 * Unified accounting layer for b0ase tokens.
 * This is YOUR overlay - users transact through YOUR apps,
 * data goes into YOUR database, you track everything internally.
 *
 * @example
 * ```typescript
 * import { Ledger } from '@b0ase/ledger';
 * import { prisma } from '@/lib/prisma';
 *
 * const ledger = new Ledger({ prisma });
 *
 * // Get user's portfolio
 * const portfolio = await ledger.getPortfolio('user-123');
 *
 * // Record a purchase
 * await ledger.recordPurchase({
 *   userId: 'user-123',
 *   tokenId: 'token-abc',
 *   tokenAmount: 1000n,
 *   usdAmount: 100,
 *   pricePerToken: 0.10,
 *   paymentMethod: 'stripe',
 * });
 *
 * // Transfer between users
 * await ledger.transfer({
 *   fromUserId: 'user-123',
 *   toUserId: 'user-456',
 *   tokenId: 'token-abc',
 *   amount: 500n,
 * });
 * ```
 */

declare class Ledger {
    private prisma;
    private config;
    constructor(config: LedgerConfig);
    /**
     * Get a token by ID or ticker
     */
    getToken(idOrTicker: string): Promise<Token | null>;
    /**
     * Get all tokens
     */
    getTokens(options?: {
        activeOnly?: boolean;
    }): Promise<Token[]>;
    /**
     * Register a new token
     */
    registerToken(data: {
        ticker: string;
        name: string;
        description?: string;
        totalSupply?: bigint;
        priceUsd?: number;
        blockchain?: string;
        portfolioSlug?: string;
    }): Promise<Token>;
    /**
     * Get a user's balance for a specific token
     */
    getBalance(userId: string, tokenId: string): Promise<Balance | null>;
    /**
     * Get all balances for a user
     */
    getBalances(userId: string): Promise<Balance[]>;
    /**
     * Get user's full portfolio with USD/GBP values
     */
    getPortfolio(userId: string): Promise<PortfolioSummary>;
    /**
     * Get all holders of a token
     */
    getHolders(query: HoldersQuery): Promise<Balance[]>;
    /**
     * Record a generic transaction
     */
    recordTransaction(input: RecordTransactionInput): Promise<Transaction>;
    /**
     * Record a token purchase
     */
    recordPurchase(input: RecordPurchaseInput): Promise<Transaction>;
    /**
     * Transfer tokens between users
     */
    transfer(input: TransferInput): Promise<Transaction>;
    /**
     * Request a withdrawal to on-chain wallet
     */
    requestWithdrawal(input: RequestWithdrawalInput): Promise<WithdrawalRequest>;
    /**
     * Get transaction history
     */
    getTransactions(query: TransactionQuery): Promise<Transaction[]>;
    /**
     * Get pending dividends for a user
     */
    getPendingDividends(userId: string): Promise<DividendPayment[]>;
    private creditBalance;
    private debitBalance;
    private updateBalances;
    private mapToken;
    private mapBalance;
    private mapTransaction;
}
/**
 * Create a ledger instance
 */
declare function createLedger(config: LedgerConfig): Ledger;

export { type Balance, type DividendDistribution, type DividendPayment, type HoldersQuery, Ledger, type LedgerConfig, type PortfolioSummary, type RecordPurchaseInput, type RecordTransactionInput, type RequestWithdrawalInput, type Token, type TokenStandard, type TokenType, type Transaction, type TransactionQuery, type TransactionStatus, type TransactionType, type TransferInput, type WithdrawalRequest, createLedger };
