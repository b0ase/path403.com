/**
 * Payment Router
 *
 * Routes payments through appropriate provider based on user's available wallets.
 * Records ALL payments on BSV as receipts (even Stripe/PayPal/ETH/SOL).
 *
 * Architecture:
 * - MoneyButton = universal payment interface
 * - Payment Router = detects wallet, routes to provider
 * - BSV Receipt = permanent proof of all payments (regardless of source)
 * - Unified Ledger = single source of truth
 */

import { inscribeReceipt, type CrossChainReceipt } from './bsv-receipt'

export type PaymentRail =
  | 'stripe'      // Credit cards
  | 'paypal'      // PayPal
  | 'handcash'    // BSV payments
  | 'yours'       // BSV tokens (Yours.org wallet)
  | 'metamask'    // ETH/ERC-20
  | 'phantom'     // SOL/SPL

export type WalletStatus = {
  rail: PaymentRail
  available: boolean
  address?: string
  balance?: string
}

/**
 * Detect which wallets the user has available
 * Called on page load to determine payment options
 */
export async function detectWallets(): Promise<WalletStatus[]> {
  const wallets: WalletStatus[] = []

  // Always available (no wallet needed)
  wallets.push({ rail: 'stripe', available: true })
  wallets.push({ rail: 'paypal', available: true })

  // Check browser wallets
  if (typeof window !== 'undefined') {
    // MetaMask (Ethereum)
    if ((window as any).ethereum?.isMetaMask) {
      const accounts = await (window as any).ethereum.request({
        method: 'eth_accounts'
      }).catch(() => [])
      wallets.push({
        rail: 'metamask',
        available: true,
        address: accounts[0]
      })
    }

    // Phantom (Solana)
    if ((window as any).solana?.isPhantom) {
      const connected = (window as any).solana.isConnected
      wallets.push({
        rail: 'phantom',
        available: true,
        address: connected ? (window as any).solana.publicKey?.toString() : undefined
      })
    }

    // HandCash (check via session/auth)
    // This would come from your auth context
    wallets.push({ rail: 'handcash', available: false }) // Placeholder

    // Yours.org (check via extension)
    if ((window as any).yours) {
      wallets.push({ rail: 'yours', available: true })
    }
  }

  return wallets
}

/**
 * Preferred rail order for crypto-native users
 * BSV first (native settlement), then other chains, then fiat
 */
export const CRYPTO_NATIVE_PRIORITY: PaymentRail[] = [
  'handcash',  // Native BSV
  'yours',     // BSV tokens
  'metamask',  // ETH
  'phantom',   // SOL
  'stripe',    // Cards
  'paypal',    // PayPal
]

/**
 * Preferred rail order for normie users
 * Familiar methods first
 */
export const NORMIE_PRIORITY: PaymentRail[] = [
  'stripe',
  'paypal',
  'metamask',  // Some normies have MetaMask
  'phantom',
  'handcash',
  'yours',
]

/**
 * Get the best available payment rail for a user
 */
export function selectBestRail(
  wallets: WalletStatus[],
  preference: 'crypto' | 'normie' = 'normie'
): PaymentRail | null {
  const priority = preference === 'crypto' ? CRYPTO_NATIVE_PRIORITY : NORMIE_PRIORITY

  for (const rail of priority) {
    const wallet = wallets.find(w => w.rail === rail && w.available)
    if (wallet) return rail
  }

  return null
}

/**
 * Payment result from any rail
 */
export interface PaymentResult {
  success: boolean
  rail: PaymentRail
  source_tx: string        // Stripe payment_intent, ETH txid, etc.
  amount_usd: number
  amount_source: string    // "0.5 ETH" or "£100"
  bsv_receipt_tx?: string  // BSV inscription txid (proof)
  error?: string
}

/**
 * Process a payment through the appropriate rail
 * Always inscribes a BSV receipt (even for non-BSV payments)
 */
export async function processPayment(params: {
  rail: PaymentRail
  amount_usd: number
  recipient: string
  purpose: string
  metadata?: Record<string, any>
}): Promise<PaymentResult> {
  const { rail, amount_usd, recipient, purpose, metadata } = params

  let source_tx: string
  let amount_source: string

  try {
    // Route to appropriate provider
    switch (rail) {
      case 'stripe':
        // Use existing Stripe integration
        const stripeResult = await processStripePayment(amount_usd, recipient, metadata)
        source_tx = stripeResult.payment_intent_id
        amount_source = `£${(amount_usd * 0.79).toFixed(2)}` // Approx GBP
        break

      case 'paypal':
        const paypalResult = await processPayPalPayment(amount_usd, recipient, metadata)
        source_tx = paypalResult.order_id
        amount_source = `$${amount_usd.toFixed(2)}`
        break

      case 'handcash':
        const hcResult = await processHandCashPayment(amount_usd, recipient, metadata)
        source_tx = hcResult.tx_id
        amount_source = `${hcResult.satoshis} sats`
        // HandCash is already on BSV, no separate receipt needed
        return {
          success: true,
          rail,
          source_tx,
          amount_usd,
          amount_source,
          bsv_receipt_tx: source_tx, // Same tx
        }

      case 'metamask':
        const ethResult = await processEthPayment(amount_usd, recipient, metadata)
        source_tx = ethResult.tx_hash
        amount_source = `${ethResult.eth_amount} ETH`
        break

      case 'phantom':
        const solResult = await processSolPayment(amount_usd, recipient, metadata)
        source_tx = solResult.signature
        amount_source = `${solResult.sol_amount} SOL`
        break

      default:
        throw new Error(`Unsupported rail: ${rail}`)
    }

    // Inscribe BSV receipt for non-BSV payments
    // This creates permanent proof on BSV
    const receipt: CrossChainReceipt = {
      type: 'PAYMENT_RECEIPT',
      source_chain: rail,
      source_tx,
      amount_usd,
      amount_source,
      recipient,
      purpose,
      timestamp: Date.now(),
      settlement_status: rail === 'handcash' ? 'settled' : 'pending',
    }

    const bsv_receipt_tx = await inscribeReceipt(receipt)

    return {
      success: true,
      rail,
      source_tx,
      amount_usd,
      amount_source,
      bsv_receipt_tx,
    }

  } catch (error) {
    return {
      success: false,
      rail,
      source_tx: '',
      amount_usd,
      amount_source: '',
      error: error instanceof Error ? error.message : 'Payment failed',
    }
  }
}

// Placeholder implementations - these call your existing integrations

async function processStripePayment(amount_usd: number, recipient: string, metadata?: Record<string, any>) {
  // TODO: Call lib/stripe-marketplace.ts
  throw new Error('Implement Stripe integration')
}

async function processPayPalPayment(amount_usd: number, recipient: string, metadata?: Record<string, any>) {
  // TODO: Call lib/paypal-marketplace.ts
  throw new Error('Implement PayPal integration')
}

async function processHandCashPayment(amount_usd: number, recipient: string, metadata?: Record<string, any>) {
  // TODO: Call lib/handcash.ts
  throw new Error('Implement HandCash integration')
}

async function processEthPayment(amount_usd: number, recipient: string, metadata?: Record<string, any>) {
  // TODO: Call lib/eth-tokens.ts
  throw new Error('Implement ETH integration')
}

async function processSolPayment(amount_usd: number, recipient: string, metadata?: Record<string, any>) {
  // TODO: Call lib/sol-tokens.ts
  throw new Error('Implement SOL integration')
}
