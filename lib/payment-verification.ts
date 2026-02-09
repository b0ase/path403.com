/**
 * Payment Verification for Treasury Purchases
 *
 * Verifies on-chain payments before executing token transfers.
 * Supports BSV, ETH, and SOL payment verification.
 */

export interface PaymentVerification {
  verified: boolean;
  txid: string;
  amount: number;
  currency: 'BSV' | 'ETH' | 'SOL';
  confirmations: number;
  recipientAddress: string;
  senderAddress?: string;
  timestamp?: Date;
  error?: string;
}

export interface PendingPurchase {
  id: string;
  tokenAmount: number;
  recipientAddress: string;
  paymentCurrency: 'BSV' | 'ETH' | 'SOL';
  expectedAmount: number;
  paymentAddress: string;
  createdAt: Date;
  expiresAt: Date;
  status: 'pending' | 'paid' | 'expired' | 'completed' | 'failed';
  paymentTxid?: string;
}

// Minimum confirmations required
const MIN_CONFIRMATIONS = {
  BSV: 1,  // BSV is fast, 1 confirmation is usually sufficient
  ETH: 3,  // ETH needs more due to reorgs
  SOL: 1   // SOL finality is quick
};

// Payment timeout (30 minutes)
const PAYMENT_TIMEOUT_MS = 30 * 60 * 1000;

/**
 * Verify a BSV transaction using WhatsOnChain API
 */
async function verifyBsvTransaction(
  txid: string,
  expectedAddress: string,
  expectedAmountSats: number
): Promise<PaymentVerification> {
  try {
    // Fetch transaction from WhatsOnChain
    const response = await fetch(
      `https://api.whatsonchain.com/v1/bsv/main/tx/${txid}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return {
          verified: false,
          txid,
          amount: 0,
          currency: 'BSV',
          confirmations: 0,
          recipientAddress: expectedAddress,
          error: 'Transaction not found'
        };
      }
      throw new Error(`WhatsOnChain API error: ${response.status}`);
    }

    const tx = await response.json();

    // Check confirmations
    const confirmations = tx.confirmations || 0;
    if (confirmations < MIN_CONFIRMATIONS.BSV) {
      return {
        verified: false,
        txid,
        amount: 0,
        currency: 'BSV',
        confirmations,
        recipientAddress: expectedAddress,
        error: `Insufficient confirmations: ${confirmations}/${MIN_CONFIRMATIONS.BSV}`
      };
    }

    // Find output to expected address and sum the amounts
    let receivedAmount = 0;
    let foundOutput = false;

    for (const vout of tx.vout) {
      const addresses = vout.scriptPubKey?.addresses || [];
      if (addresses.includes(expectedAddress)) {
        receivedAmount += Math.round(vout.value * 100_000_000); // Convert to sats
        foundOutput = true;
      }
    }

    if (!foundOutput) {
      return {
        verified: false,
        txid,
        amount: receivedAmount,
        currency: 'BSV',
        confirmations,
        recipientAddress: expectedAddress,
        error: `No output found to address ${expectedAddress}`
      };
    }

    // Allow 1% tolerance for fees/rounding
    const tolerance = expectedAmountSats * 0.01;
    if (receivedAmount < expectedAmountSats - tolerance) {
      return {
        verified: false,
        txid,
        amount: receivedAmount,
        currency: 'BSV',
        confirmations,
        recipientAddress: expectedAddress,
        error: `Insufficient amount: received ${receivedAmount} sats, expected ${expectedAmountSats} sats`
      };
    }

    // Get sender address from first input
    let senderAddress: string | undefined;
    if (tx.vin && tx.vin.length > 0 && tx.vin[0].addr) {
      senderAddress = tx.vin[0].addr;
    }

    return {
      verified: true,
      txid,
      amount: receivedAmount,
      currency: 'BSV',
      confirmations,
      recipientAddress: expectedAddress,
      senderAddress,
      timestamp: tx.time ? new Date(tx.time * 1000) : undefined
    };

  } catch (error) {
    console.error('[payment-verification] BSV verification error:', error);
    return {
      verified: false,
      txid,
      amount: 0,
      currency: 'BSV',
      confirmations: 0,
      recipientAddress: expectedAddress,
      error: error instanceof Error ? error.message : 'Verification failed'
    };
  }
}

/**
 * Verify an Ethereum transaction
 */
async function verifyEthTransaction(
  txid: string,
  expectedAddress: string,
  expectedAmountWei: bigint
): Promise<PaymentVerification> {
  try {
    const rpcUrl = process.env.ETH_RPC_URL || 'https://eth.llamarpc.com';

    // Get transaction
    const txResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionByHash',
        params: [txid],
        id: 1
      })
    });

    const txResult = await txResponse.json();
    const tx = txResult.result;

    if (!tx) {
      return {
        verified: false,
        txid,
        amount: 0,
        currency: 'ETH',
        confirmations: 0,
        recipientAddress: expectedAddress,
        error: 'Transaction not found'
      };
    }

    // Get receipt for confirmation status
    const receiptResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionReceipt',
        params: [txid],
        id: 2
      })
    });

    const receiptResult = await receiptResponse.json();
    const receipt = receiptResult.result;

    if (!receipt || receipt.status !== '0x1') {
      return {
        verified: false,
        txid,
        amount: 0,
        currency: 'ETH',
        confirmations: 0,
        recipientAddress: expectedAddress,
        error: receipt ? 'Transaction failed' : 'Transaction not yet mined'
      };
    }

    // Get current block for confirmations
    const blockResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 3
      })
    });

    const blockResult = await blockResponse.json();
    const currentBlock = parseInt(blockResult.result, 16);
    const txBlock = parseInt(receipt.blockNumber, 16);
    const confirmations = currentBlock - txBlock + 1;

    if (confirmations < MIN_CONFIRMATIONS.ETH) {
      return {
        verified: false,
        txid,
        amount: Number(BigInt(tx.value)),
        currency: 'ETH',
        confirmations,
        recipientAddress: expectedAddress,
        error: `Insufficient confirmations: ${confirmations}/${MIN_CONFIRMATIONS.ETH}`
      };
    }

    // Check recipient
    if (tx.to?.toLowerCase() !== expectedAddress.toLowerCase()) {
      return {
        verified: false,
        txid,
        amount: Number(BigInt(tx.value)),
        currency: 'ETH',
        confirmations,
        recipientAddress: expectedAddress,
        error: `Wrong recipient: ${tx.to}`
      };
    }

    // Check amount
    const receivedAmount = BigInt(tx.value);
    const tolerance = expectedAmountWei / BigInt(100); // 1% tolerance
    if (receivedAmount < expectedAmountWei - tolerance) {
      return {
        verified: false,
        txid,
        amount: Number(receivedAmount),
        currency: 'ETH',
        confirmations,
        recipientAddress: expectedAddress,
        error: `Insufficient amount`
      };
    }

    return {
      verified: true,
      txid,
      amount: Number(receivedAmount),
      currency: 'ETH',
      confirmations,
      recipientAddress: expectedAddress,
      senderAddress: tx.from
    };

  } catch (error) {
    console.error('[payment-verification] ETH verification error:', error);
    return {
      verified: false,
      txid,
      amount: 0,
      currency: 'ETH',
      confirmations: 0,
      recipientAddress: expectedAddress,
      error: error instanceof Error ? error.message : 'Verification failed'
    };
  }
}

/**
 * Verify a Solana transaction
 */
async function verifySolTransaction(
  txid: string,
  expectedAddress: string,
  expectedAmountLamports: bigint
): Promise<PaymentVerification> {
  try {
    const rpcUrl = process.env.SOL_RPC_URL || 'https://api.mainnet-beta.solana.com';

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'getTransaction',
        params: [txid, { encoding: 'jsonParsed', commitment: 'confirmed' }],
        id: 1
      })
    });

    const result = await response.json();
    const tx = result.result;

    if (!tx) {
      return {
        verified: false,
        txid,
        amount: 0,
        currency: 'SOL',
        confirmations: 0,
        recipientAddress: expectedAddress,
        error: 'Transaction not found'
      };
    }

    if (tx.meta?.err) {
      return {
        verified: false,
        txid,
        amount: 0,
        currency: 'SOL',
        confirmations: 0,
        recipientAddress: expectedAddress,
        error: 'Transaction failed'
      };
    }

    // Find transfer to expected address
    const instructions = tx.transaction?.message?.instructions || [];
    let receivedAmount = BigInt(0);
    let senderAddress: string | undefined;

    for (const ix of instructions) {
      if (ix.parsed?.type === 'transfer' && ix.parsed?.info) {
        const { destination, lamports, source } = ix.parsed.info;
        if (destination === expectedAddress) {
          receivedAmount += BigInt(lamports);
          senderAddress = source;
        }
      }
    }

    if (receivedAmount === BigInt(0)) {
      return {
        verified: false,
        txid,
        amount: 0,
        currency: 'SOL',
        confirmations: 1,
        recipientAddress: expectedAddress,
        error: `No transfer found to ${expectedAddress}`
      };
    }

    // Check amount with 1% tolerance
    const tolerance = expectedAmountLamports / BigInt(100);
    if (receivedAmount < expectedAmountLamports - tolerance) {
      return {
        verified: false,
        txid,
        amount: Number(receivedAmount),
        currency: 'SOL',
        confirmations: 1,
        recipientAddress: expectedAddress,
        error: `Insufficient amount`
      };
    }

    return {
      verified: true,
      txid,
      amount: Number(receivedAmount),
      currency: 'SOL',
      confirmations: 1,
      recipientAddress: expectedAddress,
      senderAddress,
      timestamp: tx.blockTime ? new Date(tx.blockTime * 1000) : undefined
    };

  } catch (error) {
    console.error('[payment-verification] SOL verification error:', error);
    return {
      verified: false,
      txid,
      amount: 0,
      currency: 'SOL',
      confirmations: 0,
      recipientAddress: expectedAddress,
      error: error instanceof Error ? error.message : 'Verification failed'
    };
  }
}

/**
 * Verify a payment transaction
 */
export async function verifyPayment(
  txid: string,
  currency: 'BSV' | 'ETH' | 'SOL',
  expectedAddress: string,
  expectedAmount: number // In smallest unit (sats, wei, lamports)
): Promise<PaymentVerification> {
  switch (currency) {
    case 'BSV':
      return verifyBsvTransaction(txid, expectedAddress, expectedAmount);
    case 'ETH':
      return verifyEthTransaction(txid, expectedAddress, BigInt(expectedAmount));
    case 'SOL':
      return verifySolTransaction(txid, expectedAddress, BigInt(expectedAmount));
    default:
      return {
        verified: false,
        txid,
        amount: 0,
        currency,
        confirmations: 0,
        recipientAddress: expectedAddress,
        error: `Unsupported currency: ${currency}`
      };
  }
}

/**
 * Generate a unique purchase ID
 */
export function generatePurchaseId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `PUR-${timestamp}-${random}`.toUpperCase();
}

/**
 * Check if a purchase has expired
 */
export function isPurchaseExpired(purchase: PendingPurchase): boolean {
  return new Date() > purchase.expiresAt;
}

/**
 * Create a pending purchase record
 */
export function createPendingPurchase(
  tokenAmount: number,
  recipientAddress: string,
  paymentCurrency: 'BSV' | 'ETH' | 'SOL',
  expectedAmount: number,
  paymentAddress: string
): PendingPurchase {
  const now = new Date();
  return {
    id: generatePurchaseId(),
    tokenAmount,
    recipientAddress,
    paymentCurrency,
    expectedAmount,
    paymentAddress,
    createdAt: now,
    expiresAt: new Date(now.getTime() + PAYMENT_TIMEOUT_MS),
    status: 'pending'
  };
}

/**
 * Convert crypto amount to smallest unit
 */
export function toSmallestUnit(amount: number, currency: 'BSV' | 'ETH' | 'SOL'): number {
  switch (currency) {
    case 'BSV':
      return Math.round(amount * 100_000_000); // satoshis
    case 'ETH':
      return Math.round(amount * 1e18); // wei
    case 'SOL':
      return Math.round(amount * 1e9); // lamports
    default:
      return amount;
  }
}
