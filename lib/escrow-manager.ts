/**
 * Unified Escrow Manager
 *
 * Provides a unified interface for escrow operations across
 * Stripe, PayPal, and crypto payment methods.
 */

import * as stripe from './stripe-marketplace';
import * as paypal from './paypal-marketplace';

export type PaymentMethod = 'stripe' | 'paypal' | 'crypto';
export type EscrowStatus = 'pending' | 'escrowed' | 'released' | 'refunded' | 'failed';

export interface CreateEscrowOptions {
  paymentMethod: PaymentMethod;
  contractId: string;
  clientUserId: string;
  developerUserId: string;
  amount: number; // USD amount
  currency: string;
  contractTitle: string;
  contractDescription?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface EscrowPaymentResult {
  paymentMethod: PaymentMethod;
  providerId: string; // Stripe Session ID, PayPal Order ID, or crypto txid
  approvalUrl?: string; // For PayPal
  status: EscrowStatus;
  metadata?: Record<string, any>;
}

export interface ReleaseEscrowOptions {
  paymentMethod: PaymentMethod;
  providerId: string; // Payment Intent ID, PayPal Order ID, etc.
  developerPayoutInfo: {
    stripeAccountId?: string;
    paypalEmail?: string;
    cryptoAddress?: string;
    cryptoCurrency?: 'BSV' | 'ETH' | 'SOL';
  };
  amount: number; // USD amount
  currency: string;
  contractId: string;
  milestoneId?: string;
  metadata?: Record<string, string>;
}

/**
 * Create an escrow payment (hold funds)
 */
export async function createEscrow(
  options: CreateEscrowOptions
): Promise<EscrowPaymentResult> {
  try {
    switch (options.paymentMethod) {
      case 'stripe': {
        const session = await stripe.createCheckoutSession(
          {
            contractId: options.contractId,
            clientUserId: options.clientUserId,
            developerUserId: options.developerUserId,
            amount: stripe.usdToCents(options.amount),
            currency: options.currency,
            contractTitle: options.contractTitle,
            contractDescription: options.contractDescription,
            metadata: options.metadata,
          },
          options.successUrl,
          options.cancelUrl
        );

        return {
          paymentMethod: 'stripe',
          providerId: session.id,
          approvalUrl: session.url || undefined,
          status: 'pending',
          metadata: { sessionId: session.id },
        };
      }

      case 'paypal': {
        const order = await paypal.createPayPalOrder({
          contractId: options.contractId,
          clientUserId: options.clientUserId,
          developerUserId: options.developerUserId,
          amount: options.amount.toFixed(2),
          currency: options.currency,
          contractTitle: options.contractTitle,
          contractDescription: options.contractDescription,
          returnUrl: options.successUrl,
          cancelUrl: options.cancelUrl,
        });

        return {
          paymentMethod: 'paypal',
          providerId: order.orderId,
          approvalUrl: order.approvalUrl,
          status: 'pending',
          metadata: { orderId: order.orderId },
        };
      }

      case 'crypto':
        // Crypto payments are handled separately via payment-verification.ts
        throw new Error('Crypto escrow must be created through crypto payment flow');

      default:
        throw new Error(`Unsupported payment method: ${options.paymentMethod}`);
    }
  } catch (error) {
    console.error('[escrow-manager] Create escrow error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create escrow'
    );
  }
}

/**
 * Capture escrow payment (after client confirms receipt)
 */
export async function captureEscrow(
  paymentMethod: PaymentMethod,
  providerId: string
): Promise<{ success: boolean; captureId?: string; error?: string }> {
  try {
    switch (paymentMethod) {
      case 'stripe': {
        // For Stripe, we need to get the Payment Intent from the session first
        const session = await stripe.getCheckoutSession(providerId);
        const paymentIntentId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id;

        if (!paymentIntentId) {
          throw new Error('Payment Intent not found in session');
        }

        const paymentIntent = await stripe.captureEscrowPayment(paymentIntentId);
        return {
          success: true,
          captureId: paymentIntent.id,
        };
      }

      case 'paypal': {
        const capture = await paypal.capturePayPalOrder(providerId);
        return {
          success: true,
          captureId: capture.id,
        };
      }

      case 'crypto':
        // Crypto payments are already captured when verified
        return { success: true, captureId: providerId };

      default:
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }
  } catch (error) {
    console.error('[escrow-manager] Capture escrow error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to capture escrow',
    };
  }
}

/**
 * Release funds to developer (after escrow captured)
 */
export async function releaseEscrow(
  options: ReleaseEscrowOptions
): Promise<{ success: boolean; payoutId?: string; error?: string }> {
  try {
    switch (options.paymentMethod) {
      case 'stripe': {
        if (!options.developerPayoutInfo.stripeAccountId) {
          throw new Error('Stripe account ID required for payout');
        }

        const transfer = await stripe.createDeveloperPayout({
          developerStripeAccountId: options.developerPayoutInfo.stripeAccountId,
          amount: stripe.usdToCents(options.amount),
          currency: options.currency,
          contractId: options.contractId,
          milestoneId: options.milestoneId,
          metadata: options.metadata,
        });

        return {
          success: true,
          payoutId: transfer.id,
        };
      }

      case 'paypal': {
        if (!options.developerPayoutInfo.paypalEmail) {
          throw new Error('PayPal email required for payout');
        }

        const payout = await paypal.createPayPalPayout({
          developerPayPalEmail: options.developerPayoutInfo.paypalEmail,
          amount: options.amount.toFixed(2),
          currency: options.currency,
          contractId: options.contractId,
          milestoneId: options.milestoneId,
        });

        return {
          success: true,
          payoutId: payout.batchId,
        };
      }

      case 'crypto': {
        // Crypto payouts would be handled through clearing house
        // For now, return success (implement crypto payout logic as needed)
        throw new Error('Crypto payouts not yet implemented');
      }

      default:
        throw new Error(`Unsupported payment method: ${options.paymentMethod}`);
    }
  } catch (error) {
    console.error('[escrow-manager] Release escrow error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to release escrow',
    };
  }
}

/**
 * Cancel/refund escrowed payment
 */
export async function refundEscrow(
  paymentMethod: PaymentMethod,
  providerId: string,
  reason?: string
): Promise<{ success: boolean; refundId?: string; error?: string }> {
  try {
    switch (paymentMethod) {
      case 'stripe': {
        // Get Payment Intent from session
        const session = await stripe.getCheckoutSession(providerId);
        const paymentIntentId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id;

        if (!paymentIntentId) {
          throw new Error('Payment Intent not found in session');
        }

        const refund = await stripe.cancelEscrowPayment(
          paymentIntentId,
          reason as any
        );

        return {
          success: true,
          refundId: refund.id,
        };
      }

      case 'paypal':
        // PayPal refunds require a different API call
        // For now, return error (implement as needed)
        throw new Error('PayPal refunds not yet implemented');

      case 'crypto':
        // Crypto refunds require manual transaction
        throw new Error('Crypto refunds must be handled manually');

      default:
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }
  } catch (error) {
    console.error('[escrow-manager] Refund escrow error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refund escrow',
    };
  }
}

/**
 * Get escrow status
 */
export async function getEscrowStatus(
  paymentMethod: PaymentMethod,
  providerId: string
): Promise<{
  status: EscrowStatus;
  amount?: number;
  currency?: string;
  metadata?: Record<string, any>;
}> {
  try {
    switch (paymentMethod) {
      case 'stripe': {
        const session = await stripe.getCheckoutSession(providerId);
        const paymentIntent = session.payment_intent;

        let status: EscrowStatus = 'pending';
        if (session.payment_status === 'paid') {
          status = 'escrowed';
        } else if (session.payment_status === 'unpaid') {
          status = 'pending';
        }

        return {
          status,
          amount: session.amount_total ? session.amount_total / 100 : undefined,
          currency: session.currency?.toUpperCase(),
          metadata: session.metadata || {},
        };
      }

      case 'paypal': {
        const order = await paypal.getPayPalOrder(providerId);
        let status: EscrowStatus = 'pending';

        if (order.status === 'COMPLETED') {
          status = 'escrowed';
        } else if (order.status === 'APPROVED') {
          status = 'pending';
        } else if (order.status === 'VOIDED') {
          status = 'refunded';
        }

        const amount = order.purchase_units?.[0]?.amount?.value;
        const currency = order.purchase_units?.[0]?.amount?.currency_code;

        return {
          status,
          amount: amount ? parseFloat(amount) : undefined,
          currency,
          metadata: {},
        };
      }

      case 'crypto':
        // Crypto status would come from blockchain
        return { status: 'escrowed' };

      default:
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }
  } catch (error) {
    console.error('[escrow-manager] Get status error:', error);
    return { status: 'failed' };
  }
}

/**
 * Calculate fees for all parties
 */
export function calculateFees(grossAmount: number): {
  grossAmount: number;
  platformFee: number;
  developerAmount: number;
  platformFeePercentage: number;
} {
  const platformFee = grossAmount * 0.05; // 5%
  const developerAmount = grossAmount - platformFee;

  return {
    grossAmount,
    platformFee,
    developerAmount,
    platformFeePercentage: 5.0,
  };
}
