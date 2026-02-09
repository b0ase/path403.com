/**
 * Stripe Webhook Handler for Marketplace
 *
 * POST /api/marketplace/webhooks/stripe
 * Handles Stripe webhook events for marketplace payments
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { verifyWebhookSignature } from '@/lib/stripe-marketplace';
import { captureStripeWebhook } from '@/lib/m2m';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    const event = verifyWebhookSignature(body, signature, webhookSecret);

    console.log('[stripe-webhook] Event received:', event.type);

    // Capture event for BSV anchoring (M2M infrastructure)
    captureStripeWebhook(event).catch(err => {
      console.error('[stripe-webhook] Failed to capture for M2M:', err);
      // Don't fail the webhook if M2M capture fails
    });

    const prisma = getPrisma();

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Check if this is a Kintsugi subscription
        if (session.metadata?.type === 'kintsugi_subscription') {
          await handleKintsugiSubscription(session);
          break;
        }

        // Check if this is an investor purchase (legacy equity flow)
        if (session.metadata?.type === 'investor_purchase') {
          await handleInvestorPurchase(session);
          break;
        }

        // Check if this is a venture token purchase (new token flow)
        if (session.metadata?.type === 'venture_token_purchase') {
          await handleVentureTokenPurchase(session);
          break;
        }

        // Otherwise, handle as marketplace contract payment
        const contractId = session.metadata?.contract_id;

        if (!contractId) {
          console.warn('[stripe-webhook] No contract_id in session metadata');
          break;
        }

        // Update contract status to escrowed
        await prisma.marketplace_contracts.update({
          where: { id: contractId },
          data: {
            escrow_status: 'escrowed',
            contract_status: 'active',
            start_date: new Date(),
          },
        });

        console.log(`[stripe-webhook] Contract ${contractId} marked as escrowed`);

        // Inscribe contract on BSV blockchain
        try {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
          const inscriptionResponse = await fetch(
            `${baseUrl}/api/marketplace/contracts/${contractId}/inscribe`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            }
          );

          if (inscriptionResponse.ok) {
            const inscriptionData = await inscriptionResponse.json();
            console.log(
              `[stripe-webhook] Contract ${contractId} inscribed on BSV: ${inscriptionData.inscription?.txid}`
            );
          } else {
            console.error(
              `[stripe-webhook] Failed to inscribe contract ${contractId}`
            );
          }
        } catch (inscriptionError) {
          console.error('[stripe-webhook] Inscription error:', inscriptionError);
          // Don't fail the webhook if inscription fails
        }

        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const contractId = session.metadata?.contract_id;

        if (!contractId) break;

        // Mark contract as failed
        await prisma.marketplace_contracts.update({
          where: { id: contractId },
          data: {
            escrow_status: 'failed',
            contract_status: 'cancelled',
          },
        });

        console.log(`[stripe-webhook] Contract ${contractId} expired`);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const contractId = paymentIntent.metadata?.contract_id;

        if (!contractId) break;

        console.log(`[stripe-webhook] Payment succeeded for contract ${contractId}`);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const contractId = paymentIntent.metadata?.contract_id;

        if (!contractId) break;

        // Mark escrow as failed
        await prisma.marketplace_contracts.update({
          where: { id: contractId },
          data: {
            escrow_status: 'failed',
          },
        });

        console.log(`[stripe-webhook] Payment failed for contract ${contractId}`);
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const contractId = paymentIntent.metadata?.contract_id;

        if (!contractId) break;

        // Mark as refunded
        await prisma.marketplace_contracts.update({
          where: { id: contractId },
          data: {
            escrow_status: 'refunded',
            contract_status: 'cancelled',
          },
        });

        console.log(`[stripe-webhook] Payment canceled for contract ${contractId}`);
        break;
      }

      case 'transfer.created': {
        const transfer = event.data.object as Stripe.Transfer;
        const milestoneId = transfer.metadata?.milestone_id;

        if (milestoneId) {
          // Update milestone as paid
          await prisma.contract_milestones.update({
            where: { id: milestoneId },
            data: {
              status: 'paid',
              paid_at: new Date(),
              payment_txid: transfer.id,
            },
          });

          console.log(`[stripe-webhook] Milestone ${milestoneId} marked as paid`);
        }
        break;
      }

      case 'transfer.failed': {
        const transfer = event.data.object as Stripe.Transfer;
        const milestoneId = transfer.metadata?.milestone_id;

        if (milestoneId) {
          // Revert milestone to approved status
          await prisma.contract_milestones.update({
            where: { id: milestoneId },
            data: {
              status: 'approved',
            },
          });

          console.error(
            `[stripe-webhook] Transfer failed for milestone ${milestoneId}`
          );
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;

        // Check if this is a Kintsugi subscription renewal
        if (invoice.subscription_details?.metadata?.type === 'kintsugi_subscription') {
          await handleKintsugiRenewal(invoice);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        // Check if this is a Kintsugi subscription
        if (subscription.metadata?.type === 'kintsugi_subscription') {
          await handleKintsugiCancellation(subscription);
        }
        break;
      }

      default:
        console.log(`[stripe-webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[stripe-webhook] Webhook error:', error);

    if (error instanceof Error && error.message.includes('signature')) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Disable body parsing to get raw request body for signature verification
export const runtime = 'nodejs';

/**
 * Handle investor token purchase from Stripe webhook
 */
async function handleInvestorPurchase(session: Stripe.Checkout.Session) {
  const { createClient } = await import('@/lib/supabase/server');

  const metadata = session.metadata || {};
  const investorId = metadata.investor_id;
  const vaultAddress = metadata.vault_address;
  const tokenAmount = parseInt(metadata.token_amount || '0', 10);
  const usdAmount = parseFloat(metadata.usd_amount || '0');

  if (!investorId || !vaultAddress || !tokenAmount) {
    console.error('[stripe-webhook] Invalid investor purchase metadata:', metadata);
    return;
  }

  console.log(`[stripe-webhook] Processing investor purchase: ${tokenAmount} tokens for investor ${investorId}`);

  const supabase = await createClient();
  const TOTAL_SUPPLY = 100_000_000;

  // Check if already processed (idempotency)
  const { data: existingTx } = await supabase
    .from('token_transactions')
    .select('id')
    .eq('transaction_hash', session.id)
    .single();

  if (existingTx) {
    console.log(`[stripe-webhook] Investor purchase already processed: ${session.id}`);
    return;
  }

  // Get current shareholder data
  const { data: shareholder, error: fetchError } = await supabase
    .from('cap_table_shareholders')
    .select('*')
    .eq('id', investorId)
    .single();

  if (fetchError || !shareholder) {
    console.error(`[stripe-webhook] Investor not found: ${investorId}`, fetchError);
    return;
  }

  // Calculate new balances
  const currentBalance = parseFloat(shareholder.token_balance || '0');
  const newBalance = currentBalance + tokenAmount;
  const newOwnershipPercentage = (newBalance / TOTAL_SUPPLY) * 100;

  const currentInvestment = parseFloat(shareholder.investment_amount || '0');
  const newInvestmentAmount = currentInvestment + usdAmount;

  // Update shareholder record
  const { error: updateError } = await supabase
    .from('cap_table_shareholders')
    .update({
      token_balance: newBalance,
      ownership_percentage: newOwnershipPercentage,
      investment_amount: newInvestmentAmount,
      investment_currency: 'USD',
      investment_date: shareholder.investment_date || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', investorId);

  if (updateError) {
    console.error('[stripe-webhook] Failed to update shareholder:', updateError);
    return;
  }

  // Create transaction record
  const { error: txError } = await supabase
    .from('token_transactions')
    .insert({
      transaction_hash: session.id,
      transaction_type: 'purchase',
      from_address: 'platform',
      to_address: vaultAddress,
      to_shareholder_id: investorId,
      amount: tokenAmount,
      block_timestamp: new Date().toISOString(),
      notes: `Token purchase via Stripe webhook. Session: ${session.id}`,
    });

  if (txError) {
    console.error('[stripe-webhook] Failed to create transaction record:', txError);
    // Don't fail - shareholder already updated
  }

  console.log(`[stripe-webhook] Investor purchase completed: ${tokenAmount} tokens allocated to ${vaultAddress}`);
}

/**
 * Handle venture token purchase from Stripe webhook
 * This handles the newer flow where users purchase tokens from venture_tokens table
 */
async function handleVentureTokenPurchase(session: Stripe.Checkout.Session) {
  const { createClient } = await import('@/lib/supabase/server');

  const metadata = session.metadata || {};
  const userId = metadata.user_id;
  const tokenId = metadata.token_id;
  const tokenTicker = metadata.token_ticker;
  const tokenAmount = parseInt(metadata.token_amount || '0', 10);
  const usdAmount = parseFloat(metadata.usd_amount || '0');
  const pricePerToken = parseFloat(metadata.price_per_token || '0');

  if (!userId || !tokenId || !tokenAmount) {
    console.error('[stripe-webhook] Invalid venture token purchase metadata:', metadata);
    return;
  }

  console.log(`[stripe-webhook] Processing venture token purchase: ${tokenAmount} ${tokenTicker} for user ${userId}`);

  const supabase = await createClient();

  // Update the pending purchase record
  const { error: purchaseUpdateError } = await supabase
    .from('token_purchases')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      stripe_payment_intent_id: session.payment_intent as string,
    })
    .eq('stripe_session_id', session.id)
    .eq('status', 'pending');

  if (purchaseUpdateError) {
    console.error('[stripe-webhook] Failed to update purchase record:', purchaseUpdateError);
    // Continue - try to allocate tokens anyway
  }

  // Get the venture token info
  const { data: ventureToken, error: tokenError } = await supabase
    .from('venture_tokens')
    .select('*')
    .eq('id', tokenId)
    .single();

  if (tokenError || !ventureToken) {
    console.error(`[stripe-webhook] Venture token not found: ${tokenId}`, tokenError);
    return;
  }

  // Update token availability
  const newAvailable = Number(ventureToken.tokens_available) - tokenAmount;
  if (newAvailable >= 0) {
    await supabase
      .from('venture_tokens')
      .update({
        tokens_available: newAvailable,
        tokens_sold: Number(ventureToken.tokens_sold || 0) + tokenAmount,
      })
      .eq('id', tokenId);
  }

  // If this is a $BOASE token, also update the cap table
  if (tokenTicker === 'BOASE') {
    // Find or create shareholder entry
    const { data: existingShareholder } = await supabase
      .from('cap_table_shareholders')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingShareholder) {
      // Update existing shareholder
      const currentBalance = parseFloat(existingShareholder.token_balance || '0');
      const newBalance = currentBalance + tokenAmount;
      const TOTAL_SUPPLY = 100_000_000;
      const newOwnershipPercentage = (newBalance / TOTAL_SUPPLY) * 100;

      const currentInvestment = parseFloat(existingShareholder.investment_amount || '0');
      const newInvestmentAmount = currentInvestment + usdAmount;

      await supabase
        .from('cap_table_shareholders')
        .update({
          token_balance: newBalance,
          ownership_percentage: newOwnershipPercentage,
          investment_amount: newInvestmentAmount,
          investment_date: existingShareholder.investment_date || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingShareholder.id);
    }
  }

  // Record the transaction
  await supabase
    .from('token_purchases')
    .update({
      status: 'allocated',
      allocated_at: new Date().toISOString(),
    })
    .eq('stripe_session_id', session.id);

  console.log(`[stripe-webhook] Venture token purchase completed: ${tokenAmount} ${tokenTicker} allocated`);
}

/**
 * Handle Kintsugi subscription from Stripe webhook
 * Updates user_subscriptions and allocates monthly payment to project tranches
 */
async function handleKintsugiSubscription(session: Stripe.Checkout.Session) {
  const { createClient } = await import('@/lib/supabase/server');

  const metadata = session.metadata || {};
  const userId = metadata.user_id;
  const projectSlug = metadata.project_slug;
  const projectName = metadata.project_name;

  if (!userId || !projectSlug) {
    console.error('[stripe-webhook] Invalid Kintsugi subscription metadata:', metadata);
    return;
  }

  console.log(`[stripe-webhook] Processing Kintsugi subscription for ${projectName} (${projectSlug}) by user ${userId}`);

  const supabase = await createClient();

  // Get the Stripe subscription ID from the session
  const subscriptionId = session.subscription as string;

  // Update subscription record to active
  const { error: updateError } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'active',
      stripe_subscription_id: subscriptionId,
      started_at: new Date().toISOString(),
    })
    .eq('stripe_session_id', session.id)
    .eq('status', 'pending');

  if (updateError) {
    console.error('[stripe-webhook] Failed to update subscription:', updateError);
    // Try to create if update failed
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('slug', projectSlug)
      .single();

    if (project) {
      await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          project_id: project.id,
          subscription_type: 'development_support',
          status: 'active',
          price_gbp: 999,
          stripe_session_id: session.id,
          stripe_subscription_id: subscriptionId,
          started_at: new Date().toISOString(),
          metadata: {
            type: 'kintsugi',
            created_via: 'stripe-webhook',
          },
        });
    }
  }

  // Allocate first month's payment to the first open tranche
  await allocateSubscriptionPayment(supabase, projectSlug, userId, 999);

  console.log(`[stripe-webhook] Kintsugi subscription activated for ${projectSlug}`);
}

/**
 * Handle Kintsugi subscription renewal (monthly payment)
 */
async function handleKintsugiRenewal(invoice: Stripe.Invoice) {
  const { createClient } = await import('@/lib/supabase/server');

  const metadata = invoice.subscription_details?.metadata || {};
  const userId = metadata.user_id;
  const projectSlug = metadata.project_slug;

  if (!userId || !projectSlug) {
    console.error('[stripe-webhook] Invalid Kintsugi renewal metadata:', metadata);
    return;
  }

  console.log(`[stripe-webhook] Processing Kintsugi renewal for ${projectSlug} by user ${userId}`);

  const supabase = await createClient();

  // Allocate monthly payment to tranches
  await allocateSubscriptionPayment(supabase, projectSlug, userId, 999);

  console.log(`[stripe-webhook] Kintsugi renewal processed for ${projectSlug}`);
}

/**
 * Handle Kintsugi subscription cancellation
 */
async function handleKintsugiCancellation(subscription: Stripe.Subscription) {
  const { createClient } = await import('@/lib/supabase/server');

  const metadata = subscription.metadata || {};
  const userId = metadata.user_id;
  const projectSlug = metadata.project_slug;

  if (!userId || !projectSlug) {
    console.error('[stripe-webhook] Invalid Kintsugi cancellation metadata:', metadata);
    return;
  }

  console.log(`[stripe-webhook] Processing Kintsugi cancellation for ${projectSlug}`);

  const supabase = await createClient();

  // Update subscription status
  await supabase
    .from('user_subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  console.log(`[stripe-webhook] Kintsugi subscription cancelled for ${projectSlug}`);
}

/**
 * Allocate a subscription payment to the next open tranche
 */
async function allocateSubscriptionPayment(
  supabase: any,
  projectSlug: string,
  userId: string,
  amountGbp: number
) {
  // Find the first open or underfunded tranche
  const { data: tranches } = await supabase
    .from('funding_tranches')
    .select('*')
    .eq('project_slug', projectSlug)
    .in('status', ['open', 'upcoming'])
    .order('tranche_number', { ascending: true });

  if (!tranches?.length) {
    console.log(`[stripe-webhook] No open tranches for ${projectSlug}`);
    return;
  }

  let remainingAmount = amountGbp;

  for (const tranche of tranches) {
    if (remainingAmount <= 0) break;

    const currentRaised = parseFloat(tranche.raised_amount_gbp) || 0;
    const target = parseFloat(tranche.target_amount_gbp) || 999;
    const remaining = target - currentRaised;

    if (remaining <= 0) continue;

    const toAllocate = Math.min(remainingAmount, remaining);
    const newRaised = currentRaised + toAllocate;
    const newStatus = newRaised >= target ? 'funded' : 'open';

    // Update tranche
    await supabase
      .from('funding_tranches')
      .update({
        raised_amount_gbp: newRaised,
        status: newStatus,
      })
      .eq('id', tranche.id);

    // Record allocation
    await supabase
      .from('investor_allocations')
      .insert({
        tranche_id: tranche.id,
        user_id: userId,
        amount_gbp: toAllocate,
        equity_percent: toAllocate / target, // Proportional equity
        allocation_type: 'subscription',
        escrow_status: 'pending',
        created_at: new Date().toISOString(),
      });

    console.log(`[stripe-webhook] Allocated £${toAllocate} to tranche ${tranche.tranche_number} for ${projectSlug}`);

    remainingAmount -= toAllocate;

    // If tranche is now funded, open the next one
    if (newStatus === 'funded') {
      const nextTrancheNumber = tranche.tranche_number + 1;
      await supabase
        .from('funding_tranches')
        .update({ status: 'open' })
        .eq('project_slug', projectSlug)
        .eq('tranche_number', nextTrancheNumber)
        .eq('status', 'upcoming');
    }
  }
}
