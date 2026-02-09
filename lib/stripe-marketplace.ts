/**
 * Stripe Marketplace Integration
 *
 * Handles client payments, escrow management, and developer payouts
 * using Stripe Checkout and Stripe Connect.
 */

import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (typeof window !== 'undefined') {
    throw new Error('Stripe must only be used on the server side');
  }

  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }

    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    });
  }

  return stripeInstance;
}

export interface CheckoutSessionData {
  contractId: string;
  clientUserId: string;
  developerUserId: string;
  amount: number; // in USD cents
  currency: string;
  contractTitle: string;
  contractDescription?: string;
  metadata?: Record<string, string>;
}

export interface PayoutData {
  developerStripeAccountId: string;
  amount: number; // in USD cents
  currency: string;
  contractId: string;
  milestoneId?: string;
  metadata?: Record<string, string>;
}

/**
 * Create a Stripe Checkout Session for client payment
 * Funds are held in manual capture mode for escrow
 */
export async function createCheckoutSession(
  data: CheckoutSessionData,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  try {
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card', 'us_bank_account'],
      line_items: [
        {
          price_data: {
            currency: data.currency.toLowerCase(),
            product_data: {
              name: data.contractTitle,
              description: data.contractDescription || undefined,
            },
            unit_amount: data.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      payment_intent_data: {
        capture_method: 'manual', // Hold funds in escrow
        metadata: {
          contract_id: data.contractId,
          client_user_id: data.clientUserId,
          developer_user_id: data.developerUserId,
          ...data.metadata,
        },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        contract_id: data.contractId,
        client_user_id: data.clientUserId,
        developer_user_id: data.developerUserId,
        ...data.metadata,
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    });

    return session;
  } catch (error) {
    console.error('[stripe-marketplace] Checkout session creation error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create checkout session'
    );
  }
}

/**
 * Retrieve a Checkout Session
 */
export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  try {
    return await getStripe().checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });
  } catch (error) {
    console.error('[stripe-marketplace] Checkout session retrieval error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to retrieve checkout session'
    );
  }
}

/**
 * Capture payment from escrow (after client approval)
 */
export async function captureEscrowPayment(
  paymentIntentId: string,
  amountToCapture?: number
): Promise<Stripe.PaymentIntent> {
  try {
    const captureParams: Stripe.PaymentIntentCaptureParams = {};
    if (amountToCapture) {
      captureParams.amount_to_capture = amountToCapture;
    }

    return await getStripe().paymentIntents.capture(paymentIntentId, captureParams);
  } catch (error) {
    console.error('[stripe-marketplace] Payment capture error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to capture payment'
    );
  }
}

/**
 * Cancel/refund escrowed payment
 */
export async function cancelEscrowPayment(
  paymentIntentId: string,
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
): Promise<Stripe.PaymentIntent> {
  try {
    return await getStripe().paymentIntents.cancel(paymentIntentId, {
      cancellation_reason: reason,
    });
  } catch (error) {
    console.error('[stripe-marketplace] Payment cancellation error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to cancel payment'
    );
  }
}

/**
 * Create a Stripe Connect account for a developer
 */
export async function createConnectAccount(
  email: string,
  metadata?: Record<string, string>
): Promise<Stripe.Account> {
  try {
    return await getStripe().accounts.create({
      type: 'express',
      email,
      capabilities: {
        transfers: { requested: true },
      },
      metadata,
    });
  } catch (error) {
    console.error('[stripe-marketplace] Connect account creation error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create Connect account'
    );
  }
}

/**
 * Create an onboarding link for Stripe Connect
 */
export async function createConnectAccountLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string
): Promise<Stripe.AccountLink> {
  try {
    return await getStripe().accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });
  } catch (error) {
    console.error('[stripe-marketplace] Account link creation error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create account link'
    );
  }
}

/**
 * Get Connect account status
 */
export async function getConnectAccount(
  accountId: string
): Promise<Stripe.Account> {
  try {
    return await getStripe().accounts.retrieve(accountId);
  } catch (error) {
    console.error('[stripe-marketplace] Account retrieval error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to retrieve account'
    );
  }
}

/**
 * Create a payout to developer's Connect account
 */
export async function createDeveloperPayout(
  data: PayoutData
): Promise<Stripe.Transfer> {
  try {
    // Deduct 5% platform fee
    const platformFee = Math.round(data.amount * 0.05);
    const developerAmount = data.amount - platformFee;

    const transfer = await getStripe().transfers.create({
      amount: developerAmount,
      currency: data.currency.toLowerCase(),
      destination: data.developerStripeAccountId,
      metadata: {
        contract_id: data.contractId,
        milestone_id: data.milestoneId || '',
        platform_fee: platformFee.toString(),
        gross_amount: data.amount.toString(),
        ...data.metadata,
      },
    });

    return transfer;
  } catch (error) {
    console.error('[stripe-marketplace] Payout creation error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create payout'
    );
  }
}

/**
 * Get payout/transfer status
 */
export async function getTransfer(transferId: string): Promise<Stripe.Transfer> {
  try {
    return await getStripe().transfers.retrieve(transferId);
  } catch (error) {
    console.error('[stripe-marketplace] Transfer retrieval error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to retrieve transfer'
    );
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  try {
    return getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error('[stripe-marketplace] Webhook verification error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Webhook signature verification failed'
    );
  }
}

/**
 * Calculate platform fee (5%)
 */
export function calculatePlatformFee(amount: number): {
  grossAmount: number;
  platformFee: number;
  developerAmount: number;
} {
  const platformFee = Math.round(amount * 0.05);
  const developerAmount = amount - platformFee;

  return {
    grossAmount: amount,
    platformFee,
    developerAmount,
  };
}

/**
 * Convert USD to cents
 */
export function usdToCents(usdAmount: number): number {
  return Math.round(usdAmount * 100);
}

/**
 * Convert cents to USD
 */
export function centsToUsd(cents: number): number {
  return cents / 100;
}

/**
 * Create or get a Stripe product for development services
 */
export async function getOrCreateDevelopmentProduct(): Promise<Stripe.Product> {
  const stripe = getStripe();
  const productId = 'prod_development_support';

  try {
    return await stripe.products.retrieve(productId);
  } catch {
    // Product doesn't exist, create it
    return await stripe.products.create({
      id: productId,
      name: 'Development Support Package',
      description: 'Monthly subscription to fund ongoing software development. Your funds are allocated to project tranches and released as work is completed.',
      metadata: {
        type: 'kintsugi_subscription',
      },
    });
  }
}

/**
 * Create or get a Stripe price for £999/month subscription
 */
export async function getOrCreateDevelopmentPrice(): Promise<Stripe.Price> {
  const stripe = getStripe();
  const product = await getOrCreateDevelopmentProduct();

  // Check for existing price
  const prices = await stripe.prices.list({
    product: product.id,
    active: true,
    limit: 1,
  });

  if (prices.data.length > 0) {
    return prices.data[0];
  }

  // Create new price
  return await stripe.prices.create({
    product: product.id,
    unit_amount: 99900, // £999.00 in pence
    currency: 'gbp',
    recurring: {
      interval: 'month',
    },
    metadata: {
      type: 'kintsugi_monthly',
    },
  });
}

export interface SubscriptionCheckoutData {
  userId: string;
  projectSlug: string;
  projectName: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

/**
 * Create a Stripe Checkout Session for subscription
 */
export async function createSubscriptionCheckout(
  data: SubscriptionCheckoutData,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  const price = await getOrCreateDevelopmentPrice();

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: data.customerEmail,
      subscription_data: {
        metadata: {
          type: 'kintsugi_subscription',
          user_id: data.userId,
          project_slug: data.projectSlug,
          project_name: data.projectName,
          ...data.metadata,
        },
      },
      metadata: {
        type: 'kintsugi_subscription',
        user_id: data.userId,
        project_slug: data.projectSlug,
        project_name: data.projectName,
        ...data.metadata,
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    });

    return session;
  } catch (error) {
    console.error('[stripe-marketplace] Subscription checkout error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create subscription checkout'
    );
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  try {
    return await getStripe().subscriptions.cancel(subscriptionId);
  } catch (error) {
    console.error('[stripe-marketplace] Subscription cancellation error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to cancel subscription'
    );
  }
}

/**
 * Get subscription details
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  try {
    return await getStripe().subscriptions.retrieve(subscriptionId);
  } catch (error) {
    console.error('[stripe-marketplace] Subscription retrieval error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to retrieve subscription'
    );
  }
}

/**
 * Automation package tiers and pricing
 */
export type AutomationTier = 'starter' | 'professional' | 'enterprise';

export const AUTOMATION_PACKAGES: Record<AutomationTier, { price: number; name: string; description: string }> = {
  starter: {
    price: 297,
    name: 'Starter Automation',
    description: 'Basic automation package - save 5+ hours per week',
  },
  professional: {
    price: 597,
    name: 'Professional Automation',
    description: 'Advanced automation package - save 15+ hours per week',
  },
  enterprise: {
    price: 1497,
    name: 'Enterprise Automation',
    description: 'Full automation suite - save 25+ hours per week',
  },
};

export interface AutomationCheckoutData {
  tier: AutomationTier;
  customerEmail: string;
  customerName?: string;
  metadata?: Record<string, string>;
}

/**
 * Create a Stripe Checkout Session for automation packages
 */
export async function createAutomationCheckout(
  data: AutomationCheckoutData,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  const pkg = AUTOMATION_PACKAGES[data.tier];

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: pkg.name,
              description: pkg.description,
            },
            unit_amount: gbpToPence(pkg.price),
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: data.customerEmail,
      subscription_data: {
        metadata: {
          type: 'automation_subscription',
          tier: data.tier,
          ...data.metadata,
        },
      },
      metadata: {
        type: 'automation_subscription',
        tier: data.tier,
        customer_name: data.customerName || '',
        ...data.metadata,
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    });

    return session;
  } catch (error) {
    console.error('[stripe-marketplace] Automation checkout error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create automation checkout'
    );
  }
}

/**
 * Convert GBP to pence
 */
export function gbpToPence(gbpAmount: number): number {
  return Math.round(gbpAmount * 100);
}

/**
 * Convert pence to GBP
 */
export function penceToGbp(pence: number): number {
  return pence / 100;
}

export { getStripe as stripe };
