/**
 * @b0ase/ledger
 *
 * Unified accounting layer for b0ase tokens (1Sat + BRC-100).
 *
 * This is YOUR overlay. Users transact through YOUR apps,
 * data goes into YOUR database, you track everything internally.
 * No global indexers needed - just your Supabase database.
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
 * console.log(`Total value: $${portfolio.totalValueUsd}`);
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
 *
 * // Request withdrawal to on-chain wallet
 * await ledger.requestWithdrawal({
 *   userId: 'user-123',
 *   tokenId: 'token-abc',
 *   amount: 200n,
 *   destination: '1BitcoinAddress...',
 * });
 *
 * // Get transaction history
 * const txs = await ledger.getTransactions({
 *   userId: 'user-123',
 *   type: ['purchase', 'transfer_in'],
 *   limit: 50,
 * });
 * ```
 *
 * @packageDocumentation
 */

// Main exports
export { Ledger, createLedger } from './ledger';

// Type exports
export type {
  // Token types
  Token,
  TokenStandard,
  TokenType,

  // Balance types
  Balance,
  PortfolioSummary,

  // Transaction types
  Transaction,
  TransactionType,
  TransactionStatus,

  // Dividend types
  DividendDistribution,
  DividendPayment,

  // Withdrawal types
  WithdrawalRequest,

  // Input types
  RecordTransactionInput,
  RecordPurchaseInput,
  RequestWithdrawalInput,
  TransferInput,

  // Query types
  TransactionQuery,
  HoldersQuery,

  // Config
  LedgerConfig,
} from './types';
