/**
 * PayPal Marketplace Integration
 *
 * Handles client payments via PayPal Orders API and developer payouts
 * via PayPal Payouts API.
 */

import axios from 'axios';

function getPayPalConfig() {
  if (typeof window !== 'undefined') {
    throw new Error('PayPal must only be used on the server side');
  }

  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    throw new Error('PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are required');
  }

  const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';
  const PAYPAL_BASE_URL =
    PAYPAL_MODE === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

  return {
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    mode: PAYPAL_MODE,
    baseUrl: PAYPAL_BASE_URL,
  };
}

interface PayPalAccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
}

let cachedToken: PayPalAccessToken | null = null;

/**
 * Get PayPal OAuth access token (with caching)
 */
async function getAccessToken(): Promise<string> {
  // Return cached token if valid
  if (cachedToken && Date.now() < cachedToken.expires_at) {
    return cachedToken.access_token;
  }

  try {
    const config = getPayPalConfig();
    const auth = Buffer.from(
      `${config.clientId}:${config.clientSecret}`
    ).toString('base64');

    const response = await axios.post(
      `${config.baseUrl}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    cachedToken = {
      access_token: response.data.access_token,
      token_type: response.data.token_type,
      expires_in: response.data.expires_in,
      expires_at: Date.now() + response.data.expires_in * 1000 - 60000, // 1 min buffer
    };

    return cachedToken.access_token;
  } catch (error) {
    console.error('[paypal-marketplace] Access token error:', error);
    throw new Error('Failed to get PayPal access token');
  }
}

export interface PayPalOrderData {
  contractId: string;
  clientUserId: string;
  developerUserId: string;
  amount: string; // USD amount as string (e.g., "100.00")
  currency: string;
  contractTitle: string;
  contractDescription?: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface PayPalPayoutData {
  developerPayPalEmail: string;
  amount: string; // USD amount as string
  currency: string;
  contractId: string;
  milestoneId?: string;
  note?: string;
}

/**
 * Create a PayPal Order for client payment
 */
export async function createPayPalOrder(
  data: PayPalOrderData
): Promise<{ orderId: string; approvalUrl: string }> {
  try {
    const accessToken = await getAccessToken();

    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: data.contractId,
          description: data.contractDescription || data.contractTitle,
          amount: {
            currency_code: data.currency,
            value: data.amount,
          },
          custom_id: data.contractId,
        },
      ],
      application_context: {
        brand_name: 'b0ase Marketplace',
        landing_page: 'BILLING',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        return_url: data.returnUrl,
        cancel_url: data.cancelUrl,
      },
      payment_source: {
        paypal: {
          experience_context: {
            payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
            brand_name: 'b0ase',
            locale: 'en-US',
            return_url: data.returnUrl,
            cancel_url: data.cancelUrl,
          },
        },
      },
    };

    const response = await axios.post(
      `${getPayPalConfig().baseUrl}/v2/checkout/orders`,
      orderPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const order = response.data;
    const approvalUrl =
      order.links.find((link: any) => link.rel === 'approve')?.href || '';

    return {
      orderId: order.id,
      approvalUrl,
    };
  } catch (error) {
    console.error('[paypal-marketplace] Order creation error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create PayPal order'
    );
  }
}

/**
 * Capture a PayPal Order (complete payment)
 */
export async function capturePayPalOrder(orderId: string): Promise<any> {
  try {
    const accessToken = await getAccessToken();

    const response = await axios.post(
      `${getPayPalConfig().baseUrl}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('[paypal-marketplace] Order capture error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to capture PayPal order'
    );
  }
}

/**
 * Get PayPal Order details
 */
export async function getPayPalOrder(orderId: string): Promise<any> {
  try {
    const accessToken = await getAccessToken();

    const response = await axios.get(
      `${getPayPalConfig().baseUrl}/v2/checkout/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('[paypal-marketplace] Order retrieval error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to get PayPal order'
    );
  }
}

/**
 * Create a PayPal Payout to developer
 */
export async function createPayPalPayout(
  data: PayPalPayoutData
): Promise<{ batchId: string; payoutBatchId: string }> {
  try {
    const accessToken = await getAccessToken();

    // Calculate platform fee (5%)
    const grossAmount = parseFloat(data.amount);
    const platformFee = grossAmount * 0.05;
    const developerAmount = grossAmount - platformFee;

    const payoutPayload = {
      sender_batch_header: {
        sender_batch_id: `batch-${data.contractId}-${Date.now()}`,
        email_subject: 'You have a payment from b0ase Marketplace',
        email_message: data.note || 'Payment for completed milestone',
      },
      items: [
        {
          recipient_type: 'EMAIL',
          amount: {
            value: developerAmount.toFixed(2),
            currency: data.currency,
          },
          note: `Contract ${data.contractId}${data.milestoneId ? ` - Milestone ${data.milestoneId}` : ''}`,
          sender_item_id: data.milestoneId || data.contractId,
          receiver: data.developerPayPalEmail,
        },
      ],
    };

    const response = await axios.post(
      `${getPayPalConfig().baseUrl}/v1/payments/payouts`,
      payoutPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      batchId: response.data.batch_header.payout_batch_id,
      payoutBatchId: response.data.batch_header.payout_batch_id,
    };
  } catch (error) {
    console.error('[paypal-marketplace] Payout creation error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create PayPal payout'
    );
  }
}

/**
 * Get PayPal Payout status
 */
export async function getPayPalPayout(payoutBatchId: string): Promise<any> {
  try {
    const accessToken = await getAccessToken();

    const response = await axios.get(
      `${getPayPalConfig().baseUrl}/v1/payments/payouts/${payoutBatchId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('[paypal-marketplace] Payout retrieval error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to get PayPal payout'
    );
  }
}

/**
 * Verify PayPal webhook signature
 */
export async function verifyPayPalWebhook(
  webhookId: string,
  headers: Record<string, string>,
  body: any
): Promise<boolean> {
  try {
    const accessToken = await getAccessToken();

    const verificationPayload = {
      transmission_id: headers['paypal-transmission-id'],
      transmission_time: headers['paypal-transmission-time'],
      cert_url: headers['paypal-cert-url'],
      auth_algo: headers['paypal-auth-algo'],
      transmission_sig: headers['paypal-transmission-sig'],
      webhook_id: webhookId,
      webhook_event: body,
    };

    const response = await axios.post(
      `${getPayPalConfig().baseUrl}/v1/notifications/verify-webhook-signature`,
      verificationPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('[paypal-marketplace] Webhook verification error:', error);
    return false;
  }
}

/**
 * Calculate platform fee (5%)
 */
export function calculatePayPalFee(amount: string): {
  grossAmount: number;
  platformFee: number;
  developerAmount: number;
} {
  const grossAmount = parseFloat(amount);
  const platformFee = grossAmount * 0.05;
  const developerAmount = grossAmount - platformFee;

  return {
    grossAmount,
    platformFee,
    developerAmount,
  };
}
