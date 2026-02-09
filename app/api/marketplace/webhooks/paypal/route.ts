/**
 * PayPal Webhook Handler for Marketplace
 *
 * POST /api/marketplace/webhooks/paypal
 * Handles PayPal webhook events for marketplace payments
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { verifyPayPalWebhook } from '@/lib/paypal-marketplace';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract PayPal webhook headers
    const headers = {
      'paypal-transmission-id': request.headers.get('paypal-transmission-id') || '',
      'paypal-transmission-time':
        request.headers.get('paypal-transmission-time') || '',
      'paypal-cert-url': request.headers.get('paypal-cert-url') || '',
      'paypal-auth-algo': request.headers.get('paypal-auth-algo') || '',
      'paypal-transmission-sig':
        request.headers.get('paypal-transmission-sig') || '',
    };

    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (!webhookId) {
      console.error('[paypal-webhook] PAYPAL_WEBHOOK_ID not configured');
      return NextResponse.json(
        { error: 'Webhook ID not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    const isValid = await verifyPayPalWebhook(webhookId, headers, body);
    if (!isValid) {
      console.error('[paypal-webhook] Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    console.log('[paypal-webhook] Event received:', body.event_type);

    const prisma = getPrisma();
    const eventType = body.event_type;
    const resource = body.resource;

    // Handle different event types
    switch (eventType) {
      case 'CHECKOUT.ORDER.APPROVED': {
        const orderId = resource.id;
        const customId = resource.purchase_units?.[0]?.custom_id;

        if (!customId) {
          console.warn('[paypal-webhook] No custom_id in order');
          break;
        }

        console.log(`[paypal-webhook] Order ${orderId} approved for contract ${customId}`);
        break;
      }

      case 'CHECKOUT.ORDER.COMPLETED':
      case 'PAYMENT.CAPTURE.COMPLETED': {
        const customId =
          resource.purchase_units?.[0]?.custom_id ||
          resource.supplementary_data?.related_ids?.order_id;

        if (!customId) {
          console.warn('[paypal-webhook] No contract ID found');
          break;
        }

        // Update contract status to escrowed
        await prisma.marketplace_contracts.update({
          where: { id: customId },
          data: {
            escrow_status: 'escrowed',
            contract_status: 'active',
            start_date: new Date(),
          },
        });

        console.log(`[paypal-webhook] Contract ${customId} marked as escrowed`);

        // Inscribe contract on BSV blockchain
        try {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
          const inscriptionResponse = await fetch(
            `${baseUrl}/api/marketplace/contracts/${customId}/inscribe`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            }
          );

          if (inscriptionResponse.ok) {
            const inscriptionData = await inscriptionResponse.json();
            console.log(
              `[paypal-webhook] Contract ${customId} inscribed on BSV: ${inscriptionData.inscription?.txid}`
            );
          } else {
            console.error(
              `[paypal-webhook] Failed to inscribe contract ${customId}`
            );
          }
        } catch (inscriptionError) {
          console.error('[paypal-webhook] Inscription error:', inscriptionError);
          // Don't fail the webhook if inscription fails
        }

        break;
      }

      case 'CHECKOUT.ORDER.CANCELLED':
      case 'PAYMENT.CAPTURE.DENIED': {
        const customId = resource.purchase_units?.[0]?.custom_id;

        if (!customId) break;

        // Mark contract as cancelled
        await prisma.marketplace_contracts.update({
          where: { id: customId },
          data: {
            escrow_status: 'failed',
            contract_status: 'cancelled',
          },
        });

        console.log(`[paypal-webhook] Contract ${customId} cancelled`);
        break;
      }

      case 'PAYMENT.CAPTURE.REFUNDED': {
        const customId = resource.custom_id;

        if (!customId) break;

        // Mark as refunded
        await prisma.marketplace_contracts.update({
          where: { id: customId },
          data: {
            escrow_status: 'refunded',
            contract_status: 'cancelled',
          },
        });

        console.log(`[paypal-webhook] Contract ${customId} refunded`);
        break;
      }

      case 'PAYMENT.PAYOUTS-ITEM.SUCCEEDED': {
        const senderItemId = resource.sender_item_id;

        // sender_item_id contains milestoneId or contractId
        if (senderItemId) {
          // Try to find milestone
          const milestone = await prisma.contract_milestones.findFirst({
            where: { id: senderItemId },
          });

          if (milestone) {
            await prisma.contract_milestones.update({
              where: { id: senderItemId },
              data: {
                status: 'paid',
                paid_at: new Date(),
                payment_txid: resource.payout_item_id,
              },
            });

            console.log(`[paypal-webhook] Milestone ${senderItemId} marked as paid`);
          }
        }
        break;
      }

      case 'PAYMENT.PAYOUTS-ITEM.FAILED': {
        const senderItemId = resource.sender_item_id;

        if (senderItemId) {
          // Revert milestone to approved
          const milestone = await prisma.contract_milestones.findFirst({
            where: { id: senderItemId },
          });

          if (milestone) {
            await prisma.contract_milestones.update({
              where: { id: senderItemId },
              data: {
                status: 'approved',
              },
            });

            console.error(
              `[paypal-webhook] Payout failed for milestone ${senderItemId}`
            );
          }
        }
        break;
      }

      default:
        console.log(`[paypal-webhook] Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[paypal-webhook] Webhook error:', error);

    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
