/**
 * Investor Payment & Token Transfer Flow
 *
 * Handles the complete flow:
 * 1. Create investment order (investor commits to amount)
 * 2. Verify payment received (ETH/SOL/BSV)
 * 3. Transfer tokens from treasury to investor
 * 4. Update cap table
 */

import { getPrisma } from './prisma';
import { getTreasuryConfig, getPaymentAddresses, DEPLOYED_TOKENS } from './boase-treasury';
import { transferTokens } from './bsv-tokens';

// =============================================================================
// Types
// =============================================================================

export type PaymentChain = 'bsv' | 'eth' | 'sol';

export interface InvestmentOrder {
  id: string;
  investorEmail: string;
  investorWallet?: string;
  tokenSymbol: string;
  tokenAmount: number;
  pricePerToken: number;
  totalPriceGbp: number;
  paymentChain: PaymentChain;
  paymentAddress: string;
  paymentAmountCrypto: number;
  paymentCurrency: string;
  status: 'pending' | 'payment_detected' | 'confirmed' | 'tokens_sent' | 'completed' | 'expired' | 'failed';
  paymentTxid?: string;
  transferTxid?: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface CreateOrderParams {
  investorEmail: string;
  investorWallet?: string;
  tokenSymbol: string;
  tokenAmount: number;
  paymentChain: PaymentChain;
}

export interface PaymentVerification {
  verified: boolean;
  txid?: string;
  amountReceived?: number;
  confirmations?: number;
}

// =============================================================================
// Pricing
// =============================================================================

// Token prices in GBP (update as needed)
const TOKEN_PRICES_GBP: Record<string, number> = {
  KINTSUGI: 0.0001,  // £0.0001 per token = £100k for 1B = 0.01% equity
  BOASE: 0.0001,
};

// Crypto prices (fallback - should fetch live)
const CRYPTO_PRICES_GBP: Record<string, number> = {
  BSV: 40,
  ETH: 2500,
  SOL: 80,
};

/**
 * Get live crypto price in GBP
 */
export async function getCryptoPrice(currency: string): Promise<number> {
  try {
    const ids: Record<string, string> = {
      BSV: 'bitcoin-sv',
      ETH: 'ethereum',
      SOL: 'solana',
    };

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids[currency]}&vs_currencies=gbp`
    );
    const data = await response.json();
    return data[ids[currency]]?.gbp || CRYPTO_PRICES_GBP[currency];
  } catch {
    return CRYPTO_PRICES_GBP[currency];
  }
}

/**
 * Calculate investment pricing
 */
export async function calculateInvestmentPrice(
  tokenSymbol: string,
  tokenAmount: number,
  paymentChain: PaymentChain
): Promise<{
  pricePerToken: number;
  totalPriceGbp: number;
  cryptoPrice: number;
  cryptoAmount: number;
  currency: string;
}> {
  const pricePerToken = TOKEN_PRICES_GBP[tokenSymbol] || 0.0001;
  const totalPriceGbp = tokenAmount * pricePerToken;

  const currency = paymentChain.toUpperCase();
  const cryptoPrice = await getCryptoPrice(currency);
  const cryptoAmount = totalPriceGbp / cryptoPrice;

  return {
    pricePerToken,
    totalPriceGbp,
    cryptoPrice,
    cryptoAmount,
    currency,
  };
}

// =============================================================================
// Order Management
// =============================================================================

/**
 * Create a new investment order
 */
export async function createInvestmentOrder(params: CreateOrderParams): Promise<InvestmentOrder> {
  const { investorEmail, investorWallet, tokenSymbol, tokenAmount, paymentChain } = params;

  // Validate token exists
  const token = DEPLOYED_TOKENS[tokenSymbol];
  if (!token) {
    throw new Error(`Token ${tokenSymbol} not found`);
  }

  // Calculate pricing
  const pricing = await calculateInvestmentPrice(tokenSymbol, tokenAmount, paymentChain);

  // Get payment address
  const addresses = getPaymentAddresses();
  const paymentAddress = paymentChain === 'bsv' ? addresses.bsv
    : paymentChain === 'eth' ? addresses.eth
    : addresses.sol;

  if (!paymentAddress) {
    throw new Error(`No payment address configured for ${paymentChain}`);
  }

  const prisma = getPrisma();

  // Create order in database
  const order = await prisma.investor_orders.create({
    data: {
      investor_email: investorEmail,
      investor_wallet: investorWallet,
      token_symbol: tokenSymbol,
      token_amount: tokenAmount,
      price_per_token: pricing.pricePerToken,
      total_price_gbp: pricing.totalPriceGbp,
      payment_chain: paymentChain,
      payment_address: paymentAddress,
      payment_amount_crypto: pricing.cryptoAmount,
      payment_currency: pricing.currency,
      status: 'pending',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });

  return {
    id: order.id,
    investorEmail: order.investor_email,
    investorWallet: order.investor_wallet || undefined,
    tokenSymbol: order.token_symbol,
    tokenAmount: order.token_amount,
    pricePerToken: Number(order.price_per_token),
    totalPriceGbp: Number(order.total_price_gbp),
    paymentChain: order.payment_chain as PaymentChain,
    paymentAddress: order.payment_address,
    paymentAmountCrypto: Number(order.payment_amount_crypto),
    paymentCurrency: order.payment_currency,
    status: order.status as InvestmentOrder['status'],
    createdAt: order.created_at,
    expiresAt: order.expires_at,
  };
}

/**
 * Get order by ID
 */
export async function getInvestmentOrder(orderId: string): Promise<InvestmentOrder | null> {
  const prisma = getPrisma();
  const order = await prisma.investor_orders.findUnique({
    where: { id: orderId },
  });

  if (!order) return null;

  return {
    id: order.id,
    investorEmail: order.investor_email,
    investorWallet: order.investor_wallet || undefined,
    tokenSymbol: order.token_symbol,
    tokenAmount: order.token_amount,
    pricePerToken: Number(order.price_per_token),
    totalPriceGbp: Number(order.total_price_gbp),
    paymentChain: order.payment_chain as PaymentChain,
    paymentAddress: order.payment_address,
    paymentAmountCrypto: Number(order.payment_amount_crypto),
    paymentCurrency: order.payment_currency,
    status: order.status as InvestmentOrder['status'],
    paymentTxid: order.payment_txid || undefined,
    transferTxid: order.transfer_txid || undefined,
    createdAt: order.created_at,
    expiresAt: order.expires_at,
  };
}

// =============================================================================
// Payment Verification
// =============================================================================

/**
 * Verify BSV payment
 */
async function verifyBsvPayment(address: string, expectedAmount: number): Promise<PaymentVerification> {
  try {
    // Check recent transactions to this address
    const response = await fetch(
      `https://api.whatsonchain.com/v1/bsv/main/address/${address}/history`
    );
    const txs = await response.json();

    if (!Array.isArray(txs) || txs.length === 0) {
      return { verified: false };
    }

    // Get the most recent transaction
    const recentTx = txs[0];
    const txid = recentTx.tx_hash;

    // Get transaction details
    const txResponse = await fetch(
      `https://api.whatsonchain.com/v1/bsv/main/tx/${txid}`
    );
    const txData = await txResponse.json();

    // Find output to our address
    const output = txData.vout?.find((o: any) =>
      o.scriptPubKey?.addresses?.includes(address)
    );

    if (!output) {
      return { verified: false };
    }

    const amountReceived = output.value;
    const confirmations = txData.confirmations || 0;

    // Verify amount (allow 5% tolerance for price fluctuations)
    const tolerance = expectedAmount * 0.05;
    const verified = amountReceived >= (expectedAmount - tolerance);

    return {
      verified,
      txid,
      amountReceived,
      confirmations,
    };
  } catch (error) {
    console.error('[verifyBsvPayment] Error:', error);
    return { verified: false };
  }
}

/**
 * Verify ETH payment
 */
async function verifyEthPayment(address: string, expectedAmount: number): Promise<PaymentVerification> {
  try {
    const etherscanKey = process.env.ETHERSCAN_API_KEY;
    if (!etherscanKey) {
      console.warn('[verifyEthPayment] No Etherscan API key');
      return { verified: false };
    }

    const response = await fetch(
      `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&sort=desc&apikey=${etherscanKey}`
    );
    const data = await response.json();

    if (data.status !== '1' || !data.result?.length) {
      return { verified: false };
    }

    // Get most recent incoming transaction
    const recentTx = data.result.find((tx: any) =>
      tx.to.toLowerCase() === address.toLowerCase() && tx.value !== '0'
    );

    if (!recentTx) {
      return { verified: false };
    }

    const amountReceived = Number(recentTx.value) / 1e18; // Convert wei to ETH
    const confirmations = recentTx.confirmations || 0;

    const tolerance = expectedAmount * 0.05;
    const verified = amountReceived >= (expectedAmount - tolerance);

    return {
      verified,
      txid: recentTx.hash,
      amountReceived,
      confirmations,
    };
  } catch (error) {
    console.error('[verifyEthPayment] Error:', error);
    return { verified: false };
  }
}

/**
 * Verify SOL payment
 */
async function verifySolPayment(address: string, expectedAmount: number): Promise<PaymentVerification> {
  try {
    // Use Solana RPC to check recent transactions
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getSignaturesForAddress',
        params: [address, { limit: 5 }],
      }),
    });

    const data = await response.json();
    const signatures = data.result;

    if (!signatures?.length) {
      return { verified: false };
    }

    // Get the most recent transaction details
    const txResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTransaction',
        params: [signatures[0].signature, { encoding: 'jsonParsed' }],
      }),
    });

    const txData = await txResponse.json();
    const tx = txData.result;

    if (!tx) {
      return { verified: false };
    }

    // Parse amount from transaction (simplified)
    const preBalance = tx.meta?.preBalances?.[1] || 0;
    const postBalance = tx.meta?.postBalances?.[1] || 0;
    const amountReceived = (postBalance - preBalance) / 1e9; // Convert lamports to SOL

    const tolerance = expectedAmount * 0.05;
    const verified = amountReceived >= (expectedAmount - tolerance);

    return {
      verified,
      txid: signatures[0].signature,
      amountReceived,
      confirmations: tx.slot ? 1 : 0,
    };
  } catch (error) {
    console.error('[verifySolPayment] Error:', error);
    return { verified: false };
  }
}

/**
 * Verify payment for an order
 */
export async function verifyPayment(orderId: string): Promise<PaymentVerification> {
  const order = await getInvestmentOrder(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  let verification: PaymentVerification;

  switch (order.paymentChain) {
    case 'bsv':
      verification = await verifyBsvPayment(order.paymentAddress, order.paymentAmountCrypto);
      break;
    case 'eth':
      verification = await verifyEthPayment(order.paymentAddress, order.paymentAmountCrypto);
      break;
    case 'sol':
      verification = await verifySolPayment(order.paymentAddress, order.paymentAmountCrypto);
      break;
    default:
      throw new Error(`Unsupported payment chain: ${order.paymentChain}`);
  }

  // Update order status if payment verified
  if (verification.verified && verification.txid) {
    const prisma = getPrisma();
    await prisma.investor_orders.update({
      where: { id: orderId },
      data: {
        status: 'payment_detected',
        payment_txid: verification.txid,
      },
    });
  }

  return verification;
}

// =============================================================================
// Token Transfer
// =============================================================================

/**
 * Transfer tokens from treasury to investor
 */
export async function transferTokensToInvestor(orderId: string): Promise<{
  success: boolean;
  txid?: string;
  error?: string;
}> {
  const order = await getInvestmentOrder(orderId);
  if (!order) {
    return { success: false, error: 'Order not found' };
  }

  if (order.status !== 'payment_detected' && order.status !== 'confirmed') {
    return { success: false, error: `Cannot transfer: order status is ${order.status}` };
  }

  if (!order.investorWallet) {
    return { success: false, error: 'Investor wallet address not set' };
  }

  const token = DEPLOYED_TOKENS[order.tokenSymbol];
  if (!token) {
    return { success: false, error: `Token ${order.tokenSymbol} not found` };
  }

  const treasury = getTreasuryConfig();

  try {
    // Transfer BSV-21 tokens
    const result = await transferTokens(
      treasury.privateKey,
      token.tokenId,
      BigInt(order.tokenAmount),
      order.investorWallet,
      treasury.ordAddress
    );

    // Update order status
    const prisma = getPrisma();
    await prisma.investor_orders.update({
      where: { id: orderId },
      data: {
        status: 'tokens_sent',
        transfer_txid: result.txid,
      },
    });

    // Update cap table
    await updateCapTable({
      investorEmail: order.investorEmail,
      investorWallet: order.investorWallet,
      tokenSymbol: order.tokenSymbol,
      tokenAmount: order.tokenAmount,
      priceGbp: order.totalPriceGbp,
      paymentTxid: order.paymentTxid,
      transferTxid: result.txid,
    });

    return { success: true, txid: result.txid };
  } catch (error) {
    console.error('[transferTokensToInvestor] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transfer failed',
    };
  }
}

// =============================================================================
// Cap Table
// =============================================================================

interface CapTableUpdate {
  investorEmail: string;
  investorWallet: string;
  tokenSymbol: string;
  tokenAmount: number;
  priceGbp: number;
  paymentTxid?: string;
  transferTxid?: string;
}

/**
 * Update cap table with new investment
 */
async function updateCapTable(data: CapTableUpdate): Promise<void> {
  const prisma = getPrisma();
  const token = DEPLOYED_TOKENS[data.tokenSymbol];

  // Calculate ownership percentage
  const ownershipPercent = (data.tokenAmount / token.totalSupply) * 100;

  // Upsert investor record
  await prisma.investors.upsert({
    where: { email: data.investorEmail },
    create: {
      email: data.investorEmail,
      wallet_address: data.investorWallet,
      status: 'active',
      total_invested_gbp: data.priceGbp,
      created_at: new Date(),
    },
    update: {
      wallet_address: data.investorWallet,
      status: 'active',
      total_invested_gbp: {
        increment: data.priceGbp,
      },
    },
  });

  // Add to token member registry (using existing schema fields)
  await prisma.token_member_registry.create({
    data: {
      token_symbol: data.tokenSymbol,
      member_name: data.investorEmail, // Use email as name for now
      email: data.investorEmail,
      wallet_address: data.investorWallet,
      allocation_tokens: data.tokenAmount,
      allocation_percentage: ownershipPercent,
      total_paid: data.priceGbp,
      currency: 'GBP',
      payment_reference: data.paymentTxid,
      status: 'confirmed',
      metadata: {
        transfer_txid: data.transferTxid,
        token_id: token.tokenId,
      },
    },
  });

  console.log(`[capTable] Added ${data.investorEmail}: ${data.tokenAmount} ${data.tokenSymbol} (${ownershipPercent.toFixed(4)}%)`);
}

// =============================================================================
// Complete Flow Helper
// =============================================================================

/**
 * Complete the investment flow (verify + transfer)
 */
export async function completeInvestment(orderId: string): Promise<{
  success: boolean;
  order?: InvestmentOrder;
  transferTxid?: string;
  error?: string;
}> {
  // Verify payment
  const verification = await verifyPayment(orderId);
  if (!verification.verified) {
    return { success: false, error: 'Payment not verified' };
  }

  // Transfer tokens
  const transfer = await transferTokensToInvestor(orderId);
  if (!transfer.success) {
    return { success: false, error: transfer.error };
  }

  // Get updated order
  const order = await getInvestmentOrder(orderId);

  // Mark as completed
  const prisma = getPrisma();
  await prisma.investor_orders.update({
    where: { id: orderId },
    data: { status: 'completed' },
  });

  return {
    success: true,
    order: order || undefined,
    transferTxid: transfer.txid,
  };
}
