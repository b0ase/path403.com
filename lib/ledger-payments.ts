/**
 * Ledger + HandCash Integration
 *
 * Connects the @b0ase/ledger accounting system to @b0ase/handcash
 * for real payment execution.
 *
 * Flow:
 * 1. User purchases tokens → Ledger records → HandCash receives payment
 * 2. User requests withdrawal → Admin approves → HandCash sends tokens
 * 3. Dividend distributed → Ledger calculates → HandCash pays holders
 */

import { Ledger, type RecordPurchaseInput, type WithdrawalRequest } from '@b0ase/ledger';
import { HandCashServer } from '@b0ase/handcash/server';
import { getPrisma } from '@/lib/prisma';

// Initialize services
const prisma = getPrisma();
const ledger = new Ledger({ prisma });
const handcash = new HandCashServer();

// ============================================================================
// Purchase Flow
// ============================================================================

interface PurchaseWithPaymentInput extends RecordPurchaseInput {
  /** HandCash auth token of the buyer */
  buyerAuthToken: string;
  /** Destination handle for payment (e.g., 'b0ase') */
  paymentDestination?: string;
}

/**
 * Process a token purchase with HandCash payment
 *
 * 1. Execute HandCash payment from buyer to platform
 * 2. Record purchase in ledger
 * 3. Credit tokens to buyer's balance
 */
export async function purchaseWithHandCash(
  input: PurchaseWithPaymentInput
): Promise<{ txid: string; purchaseId: string }> {
  const destination = input.paymentDestination || 'b0ase';

  // 1. Execute HandCash payment
  const paymentResult = await handcash.sendPayment(input.buyerAuthToken, {
    destination,
    amount: input.usdAmount,
    currency: 'USD',
    description: `Token purchase: ${input.tokenAmount} tokens`,
  });

  // 2. Record in ledger (this credits the balance)
  const purchase = await ledger.recordPurchase({
    ...input,
    paymentMethod: 'handcash',
    cryptoTxid: paymentResult.transactionId,
  });

  return {
    txid: paymentResult.transactionId,
    purchaseId: purchase.id,
  };
}

// ============================================================================
// Withdrawal Flow
// ============================================================================

interface ExecuteWithdrawalInput {
  /** Withdrawal request ID */
  withdrawalId: string;
  /** Admin's HandCash auth token (house account) */
  adminAuthToken?: string;
}

/**
 * Execute an approved withdrawal via HandCash
 *
 * 1. Verify withdrawal is approved
 * 2. Send tokens via HandCash
 * 3. Update withdrawal status
 * 4. Debit ledger balance
 */
export async function executeWithdrawal(
  input: ExecuteWithdrawalInput
): Promise<{ txid: string }> {
  // 1. Get withdrawal request
  const withdrawal = await prisma.withdrawal_requests.findUnique({
    where: { id: input.withdrawalId },
    include: { venture_token: true },
  });

  if (!withdrawal) {
    throw new Error('Withdrawal not found');
  }

  if (withdrawal.status !== 'approved') {
    throw new Error(`Withdrawal status is ${withdrawal.status}, expected 'approved'`);
  }

  // 2. Execute payment via HandCash house account
  // Note: For token transfers, we'd use transferItems for ordinals
  // For now, this sends BSV equivalent
  const houseAccount = handcash.getHouseAccount();

  // Calculate BSV amount based on token price
  const token = withdrawal.venture_token;
  const usdValue = Number(withdrawal.amount) * Number(token?.price_usd || 0.01);

  const paymentResult = await houseAccount.wallet.pay({
    description: `Withdrawal: ${withdrawal.amount} ${token?.ticker || 'tokens'}`,
    appAction: 'PAYMENT',
    payments: [
      {
        destination: withdrawal.destination,
        currencyCode: 'USD' as any,
        sendAmount: usdValue,
      },
    ],
  });

  // 3. Update withdrawal status
  await prisma.withdrawal_requests.update({
    where: { id: input.withdrawalId },
    data: {
      status: 'completed',
      txid: paymentResult.transactionId,
      executed_at: new Date(),
    },
  });

  // 4. Debit from ledger (already done when withdrawal was requested)
  // The balance was already decremented when the withdrawal was created

  return {
    txid: paymentResult.transactionId,
  };
}

// ============================================================================
// Dividend Flow
// ============================================================================

interface ExecuteDividendInput {
  /** Dividend distribution ID */
  distributionId: string;
  /** Admin's HandCash auth token */
  adminAuthToken?: string;
}

/**
 * Execute dividend payments via HandCash
 *
 * 1. Get all pending dividend payments for distribution
 * 2. Batch payments via HandCash multi-payment
 * 3. Update payment statuses
 */
export async function executeDividend(
  input: ExecuteDividendInput
): Promise<{ txid: string; paymentsProcessed: number }> {
  // 1. Get distribution and pending payments
  const distribution = await prisma.dividend_distributions.findUnique({
    where: { id: input.distributionId },
    include: {
      dividend_payments: {
        where: { status: 'pending' },
        include: {
          cap_table_shareholders: true,
        },
      },
    },
  });

  if (!distribution) {
    throw new Error('Distribution not found');
  }

  if (distribution.dividend_payments.length === 0) {
    throw new Error('No pending payments found');
  }

  // 2. Build multi-payment request
  const payments = distribution.dividend_payments
    .filter((p) => p.cap_table_shareholders?.handcash_handle)
    .map((p) => ({
      destination: p.cap_table_shareholders!.handcash_handle!,
      amount: Number(p.payment_amount),
      currencyCode: p.currency || 'USD',
    }));

  if (payments.length === 0) {
    throw new Error('No shareholders with HandCash handles found');
  }

  // 3. Execute multi-payment
  const houseAccount = handcash.getHouseAccount();

  const paymentResult = await houseAccount.wallet.pay({
    description: `Dividend: ${distribution.distribution_name}`,
    appAction: 'PAYMENT',
    payments: payments.map((p) => ({
      destination: p.destination,
      currencyCode: p.currencyCode as any,
      sendAmount: p.amount,
    })),
  });

  // 4. Update payment statuses
  const paymentIds = distribution.dividend_payments.map((p) => p.id);

  await prisma.dividend_payments.updateMany({
    where: { id: { in: paymentIds } },
    data: {
      status: 'paid',
      transaction_reference: paymentResult.transactionId,
      payment_date: new Date(),
    },
  });

  // 5. Update distribution status if all payments complete
  const remainingPending = await prisma.dividend_payments.count({
    where: {
      distribution_id: input.distributionId,
      status: 'pending',
    },
  });

  if (remainingPending === 0) {
    await prisma.dividend_distributions.update({
      where: { id: input.distributionId },
      data: { status: 'paid' },
    });
  }

  return {
    txid: paymentResult.transactionId,
    paymentsProcessed: payments.length,
  };
}

// ============================================================================
// Transfer Flow (User to User)
// ============================================================================

interface TransferWithPaymentInput {
  fromUserId: string;
  toUserId: string;
  tokenId: string;
  amount: bigint;
  /** If true, also send BSV equivalent via HandCash */
  includePayment?: boolean;
  /** Sender's HandCash auth token (if includePayment) */
  senderAuthToken?: string;
  /** Receiver's HandCash handle (if includePayment) */
  receiverHandle?: string;
}

/**
 * Transfer tokens between users with optional HandCash payment
 */
export async function transferWithPayment(
  input: TransferWithPaymentInput
): Promise<{ ledgerTxId: string; paymentTxId?: string }> {
  // 1. Execute ledger transfer
  const ledgerTx = await ledger.transfer({
    fromUserId: input.fromUserId,
    toUserId: input.toUserId,
    tokenId: input.tokenId,
    amount: input.amount,
  });

  let paymentTxId: string | undefined;

  // 2. Optionally execute HandCash payment
  if (input.includePayment && input.senderAuthToken && input.receiverHandle) {
    const token = await ledger.getToken(input.tokenId);
    if (token) {
      const tokenRecord = await prisma.venture_tokens.findUnique({
        where: { id: input.tokenId },
      });

      const usdValue = Number(input.amount) * Number(tokenRecord?.price_usd || 0.01);

      const paymentResult = await handcash.sendPayment(input.senderAuthToken, {
        destination: input.receiverHandle,
        amount: usdValue,
        currency: 'USD',
        description: `Transfer: ${input.amount} ${token.ticker}`,
      });

      paymentTxId = paymentResult.transactionId;
    }
  }

  return {
    ledgerTxId: ledgerTx.id,
    paymentTxId,
  };
}

// ============================================================================
// Irrigation Flow (Revenue Distribution)
// ============================================================================

interface IrrigationInput {
  /** Total revenue to distribute */
  totalAmount: number;
  /** Currency code */
  currency?: string;
  /** Token ID for determining holders */
  tokenId: string;
  /** Source of revenue (for tracking) */
  source: string;
  /** Admin auth token */
  adminAuthToken?: string;
}

/**
 * Distribute revenue to token holders (the irrigation pattern)
 *
 * 1. Get all holders and their balances
 * 2. Calculate pro-rata distribution
 * 3. Execute multi-payment via HandCash
 * 4. Record in ledger
 */
export async function irrigate(
  input: IrrigationInput
): Promise<{ txid: string; holdersProcessed: number; totalDistributed: number }> {
  // 1. Get all holders with HandCash handles
  const holders = await prisma.user_token_balances.findMany({
    where: {
      token_id: input.tokenId,
      balance: { gt: 0 },
    },
  });

  if (holders.length === 0) {
    throw new Error('No token holders found');
  }

  // Get user profiles to find HandCash handles
  const userIds = holders.map((h) => h.user_id);
  const profiles = await prisma.profiles.findMany({
    where: { id: { in: userIds } },
  });

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  // 2. Calculate total tokens for pro-rata
  const totalTokens = holders.reduce((sum, h) => sum + BigInt(h.balance || 0), 0n);

  // 3. Build payment list
  const payments: Array<{ destination: string; amount: number; userId: string }> = [];

  for (const holder of holders) {
    const profile = profileMap.get(holder.user_id);
    const handle = (profile as any)?.handcash_handle;

    if (!handle) continue; // Skip holders without HandCash

    // Pro-rata calculation
    const holderShare =
      (Number(holder.balance) / Number(totalTokens)) * input.totalAmount;

    if (holderShare >= 0.01) {
      // Minimum $0.01
      payments.push({
        destination: handle,
        amount: Math.round(holderShare * 100) / 100, // Round to cents
        userId: holder.user_id,
      });
    }
  }

  if (payments.length === 0) {
    throw new Error('No eligible holders with HandCash handles');
  }

  // 4. Execute multi-payment
  const houseAccount = handcash.getHouseAccount();

  const paymentResult = await houseAccount.wallet.pay({
    description: `Revenue distribution: ${input.source}`,
    appAction: 'PAYMENT',
    payments: payments.map((p) => ({
      destination: p.destination,
      currencyCode: (input.currency || 'USD') as any,
      sendAmount: p.amount,
    })),
  });

  // 5. Record in ledger (create dividend distribution)
  const token = await ledger.getToken(input.tokenId);
  const totalDistributed = payments.reduce((sum, p) => sum + p.amount, 0);

  await prisma.dividend_distributions.create({
    data: {
      distribution_name: `${input.source} - ${new Date().toISOString().split('T')[0]}`,
      total_amount: totalDistributed,
      currency: input.currency || 'USD',
      record_date: new Date(),
      payment_date: new Date(),
      announcement_date: new Date(),
      per_token_amount: totalDistributed / Number(totalTokens),
      eligible_tokens: totalTokens,
      status: 'paid',
    },
  });

  return {
    txid: paymentResult.transactionId,
    holdersProcessed: payments.length,
    totalDistributed,
  };
}

// ============================================================================
// Exports
// ============================================================================

export {
  ledger,
  handcash,
  // Types
  type PurchaseWithPaymentInput,
  type ExecuteWithdrawalInput,
  type ExecuteDividendInput,
  type TransferWithPaymentInput,
  type IrrigationInput,
};
