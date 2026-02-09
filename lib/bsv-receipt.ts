/**
 * BSV Receipt Layer
 *
 * Inscribes payment receipts on BSV for ALL payment types.
 * This is the "capturing ETH/SOL payments inside BSV UTXOs" concept.
 *
 * Every payment (Stripe, PayPal, ETH, SOL) gets a BSV inscription that:
 * 1. Proves the payment happened (immutable on-chain record)
 * 2. Creates a claim that can be settled to native BSV later
 * 3. Links cross-chain transactions to BSV accounting
 *
 * When BSV becomes the dominant settlement layer, these receipts
 * can be "redeemed" for native BSV tokens.
 */

import { inscribeContract } from './bsv-inscription'

/**
 * COMPLIANCE NOTE:
 * All terminology uses Stripe-safe language:
 * - "Service Credits" not "Tokens"
 * - "Revenue Share" not "Dividends"
 * - "Backers" not "Investors"
 * - "Distributed Ledger" not "Blockchain" (in user-facing text)
 *
 * See docs/PAYMENT_COMPLIANCE.md for full terminology guide.
 */

export interface CrossChainReceipt {
  type: 'SERVICE_CREDIT_RECEIPT'  // Stripe-safe: not "token"
  source_chain: 'stripe' | 'paypal' | 'eth' | 'sol' | 'bsv' | 'handcash' | 'yours' | 'metamask' | 'phantom'
  source_tx: string           // Original tx/payment_intent/order_id
  amount_usd: number          // Normalized USD value
  amount_source: string       // Human-readable: "0.5 ETH", "£100", "50000 sats"
  recipient: string           // b0ase handle, wallet address, or email

  // Stripe-safe purpose descriptions
  purpose:
    | 'service_credit_purchase'  // Was: token_purchase
    | 'service_payment'
    | 'revenue_share'            // Was: dividend
    | 'platform_deposit'
    | 'platform_fee'
    | 'project_backing'          // Pre-purchase of future services
    | string

  timestamp: number

  // Settlement tracking
  settlement_status: 'pending' | 'settled' | 'failed'
  bsv_settlement_tx?: string  // When settled to native BSV

  // Optional metadata
  metadata?: {
    credit_type?: string      // Was: token_id - type of service credit
    service_agreement_id?: string  // Was: contract_id
    invoice_id?: string
    project_id?: string       // For project backing
    note?: string
  }
}

/**
 * Format receipt as markdown for inscription
 * This is human-readable AND machine-parseable
 */
/**
 * Format receipt as markdown for inscription
 * Uses Stripe-compliant language throughout
 */
function formatReceiptMarkdown(receipt: CrossChainReceipt): string {
  // Map source chain to user-friendly name
  const sourceNames: Record<string, string> = {
    stripe: 'Card Payment',
    paypal: 'PayPal',
    eth: 'Ethereum Network',
    sol: 'Solana Network',
    bsv: 'BSV Network',
    handcash: 'HandCash',
    yours: 'Yours Wallet',
    metamask: 'MetaMask',
    phantom: 'Phantom',
  }

  // Map purpose to Stripe-safe description
  const purposeDescriptions: Record<string, string> = {
    service_credit_purchase: 'Service Credit Purchase',
    service_payment: 'Service Payment',
    revenue_share: 'Revenue Share Distribution',
    platform_deposit: 'Platform Deposit',
    platform_fee: 'Platform Fee',
    project_backing: 'Project Backing (Pre-purchase)',
  }

  const lines = [
    `# SERVICE CREDIT RECEIPT`,
    ``,
    `**Receipt Type**: ${receipt.type}`,
    `**Payment Method**: ${sourceNames[receipt.source_chain] || receipt.source_chain}`,
    `**Transaction Reference**: ${receipt.source_tx}`,
    `**Amount (USD)**: $${receipt.amount_usd.toFixed(2)}`,
    `**Amount Paid**: ${receipt.amount_source}`,
    `**Recipient**: ${receipt.recipient}`,
    `**Service**: ${purposeDescriptions[receipt.purpose] || receipt.purpose}`,
    `**Timestamp**: ${new Date(receipt.timestamp).toISOString()}`,
    `**Status**: ${receipt.settlement_status === 'settled' ? 'Confirmed' : 'Processing'}`,
  ]

  if (receipt.bsv_settlement_tx) {
    lines.push(`**Confirmation Reference**: ${receipt.bsv_settlement_tx}`)
  }

  if (receipt.metadata) {
    lines.push(``, `## Service Details`)
    if (receipt.metadata.credit_type) lines.push(`- Credit Type: ${receipt.metadata.credit_type}`)
    if (receipt.metadata.service_agreement_id) lines.push(`- Agreement ID: ${receipt.metadata.service_agreement_id}`)
    if (receipt.metadata.invoice_id) lines.push(`- Invoice ID: ${receipt.metadata.invoice_id}`)
    if (receipt.metadata.project_id) lines.push(`- Project ID: ${receipt.metadata.project_id}`)
    if (receipt.metadata.note) lines.push(`- Note: ${receipt.metadata.note}`)
  }

  lines.push(
    ``,
    `---`,
    ``,
    `*This receipt is recorded on a distributed ledger for transparency and auditability.*`,
    `*Service credits are redeemable for platform services and may be transferred.*`,
    ``,
    `**Issued by**: b0ase.com`,
    `**Protocol**: SERVICE_CREDIT_V1`,
  )

  return lines.join('\n')
}

/**
 * Inscribe a payment receipt on BSV
 * Returns the BSV txid (permanent proof)
 */
export async function inscribeReceipt(receipt: CrossChainReceipt): Promise<string> {
  const markdown = formatReceiptMarkdown(receipt)

  // Use existing inscription infrastructure
  const result = await inscribeContract(markdown)

  return result.txId
}

/**
 * Create a receipt for a Stripe payment (service credit purchase)
 */
export function createStripeReceipt(params: {
  payment_intent_id: string
  amount_gbp: number
  recipient: string
  purpose: CrossChainReceipt['purpose']
  credit_type?: string  // e.g., "BOASE", "Platform Access"
  service_agreement_id?: string
  metadata?: Omit<CrossChainReceipt['metadata'], 'credit_type' | 'service_agreement_id'>
}): CrossChainReceipt {
  const amount_usd = params.amount_gbp * 1.27 // Approx GBP to USD

  return {
    type: 'SERVICE_CREDIT_RECEIPT',
    source_chain: 'stripe',
    source_tx: params.payment_intent_id,
    amount_usd,
    amount_source: `£${params.amount_gbp.toFixed(2)}`,
    recipient: params.recipient,
    purpose: params.purpose,
    timestamp: Date.now(),
    settlement_status: 'pending',
    metadata: {
      ...params.metadata,
      credit_type: params.credit_type,
      service_agreement_id: params.service_agreement_id,
    },
  }
}

/**
 * Create a receipt for a PayPal payment
 */
export function createPayPalReceipt(params: {
  order_id: string
  amount_usd: number
  recipient: string
  purpose: CrossChainReceipt['purpose']
  credit_type?: string
  metadata?: CrossChainReceipt['metadata']
}): CrossChainReceipt {
  return {
    type: 'SERVICE_CREDIT_RECEIPT',
    source_chain: 'paypal',
    source_tx: params.order_id,
    amount_usd: params.amount_usd,
    amount_source: `$${params.amount_usd.toFixed(2)}`,
    recipient: params.recipient,
    purpose: params.purpose,
    timestamp: Date.now(),
    settlement_status: 'pending',
    metadata: {
      ...params.metadata,
      credit_type: params.credit_type,
    },
  }
}

/**
 * Create a receipt for an ETH/ERC-20 payment
 * Note: Crypto payments don't need Stripe-safe language,
 * but we keep consistent terminology
 */
export function createEthReceipt(params: {
  tx_hash: string
  amount_eth: number
  amount_usd: number
  recipient: string
  purpose: CrossChainReceipt['purpose']
  token_symbol?: string // If ERC-20 (e.g., USDC, USDT)
  credit_type?: string
  metadata?: CrossChainReceipt['metadata']
}): CrossChainReceipt {
  return {
    type: 'SERVICE_CREDIT_RECEIPT',
    source_chain: 'eth',
    source_tx: params.tx_hash,
    amount_usd: params.amount_usd,
    amount_source: `${params.amount_eth} ${params.token_symbol || 'ETH'}`,
    recipient: params.recipient,
    purpose: params.purpose,
    timestamp: Date.now(),
    settlement_status: 'pending',
    metadata: {
      ...params.metadata,
      credit_type: params.credit_type,
    },
  }
}

/**
 * Create a receipt for a SOL/SPL payment
 */
export function createSolReceipt(params: {
  signature: string
  amount_sol: number
  amount_usd: number
  recipient: string
  purpose: CrossChainReceipt['purpose']
  token_symbol?: string // If SPL token (e.g., USDC)
  credit_type?: string
  metadata?: CrossChainReceipt['metadata']
}): CrossChainReceipt {
  return {
    type: 'SERVICE_CREDIT_RECEIPT',
    source_chain: 'sol',
    source_tx: params.signature,
    amount_usd: params.amount_usd,
    amount_source: `${params.amount_sol} ${params.token_symbol || 'SOL'}`,
    recipient: params.recipient,
    purpose: params.purpose,
    timestamp: Date.now(),
    settlement_status: 'pending',
    metadata: {
      ...params.metadata,
      credit_type: params.credit_type,
    },
  }
}

/**
 * Query service credit receipts awaiting confirmation
 * These represent payments that have been recorded but not yet
 * fully processed on the primary ledger
 */
export async function getPendingCredits(recipient?: string): Promise<CrossChainReceipt[]> {
  // TODO: Query from database where settlement_status = 'pending'
  // For now, return empty array
  return []
}

/**
 * Mark a service credit receipt as confirmed
 * Called when the credit has been fully processed and is redeemable
 */
export async function confirmReceipt(
  original_receipt_tx: string,
  confirmation_tx: string
): Promise<void> {
  // TODO: Update database record
  // TODO: Optionally inscribe confirmation proof
}

/**
 * Create a service credit receipt for project backing
 * This is the Stripe-safe way to handle "investment" in projects
 */
export function createProjectBackingReceipt(params: {
  source_chain: CrossChainReceipt['source_chain']
  source_tx: string
  amount_usd: number
  amount_source: string
  backer: string  // Not "investor"
  project_id: string
  project_name: string
  credit_amount: number  // Service credits issued
  profit_participation_percent?: number  // Revenue share %
}): CrossChainReceipt {
  return {
    type: 'SERVICE_CREDIT_RECEIPT',
    source_chain: params.source_chain,
    source_tx: params.source_tx,
    amount_usd: params.amount_usd,
    amount_source: params.amount_source,
    recipient: params.backer,
    purpose: 'project_backing',
    timestamp: Date.now(),
    settlement_status: 'pending',
    metadata: {
      project_id: params.project_id,
      credit_type: `${params.project_name} Service Credits`,
      note: params.profit_participation_percent
        ? `Includes ${params.profit_participation_percent}% revenue share participation`
        : undefined,
    },
  }
}
