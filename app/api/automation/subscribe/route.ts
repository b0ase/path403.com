/**
 * POST /api/automation/subscribe
 *
 * Creates a Stripe subscription checkout for automation packages.
 * Does NOT require auth - anyone can subscribe.
 *
 * Tiers: starter (£297), professional (£597), enterprise (£1,497)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createAutomationCheckout,
  AUTOMATION_PACKAGES,
  type AutomationTier
} from '@/lib/stripe-marketplace';

const subscribeSchema = z.object({
  tier: z.enum(['starter', 'professional', 'enterprise']),
  email: z.string().email(),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = subscribeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { tier, email, name } = validation.data;

    // Verify tier exists
    if (!AUTOMATION_PACKAGES[tier as AutomationTier]) {
      return NextResponse.json(
        { error: 'Invalid package tier' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.b0ase.com';

    // Create Stripe checkout session
    const session = await createAutomationCheckout(
      {
        tier: tier as AutomationTier,
        customerEmail: email,
        customerName: name,
        metadata: {
          source: 'automation_page',
        },
      },
      `${baseUrl}/automation/success?tier=${tier}&session_id={CHECKOUT_SESSION_ID}`,
      `${baseUrl}/automation/packages/${tier}?cancelled=true`
    );

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
      tier,
      price: AUTOMATION_PACKAGES[tier as AutomationTier].price,
    });

  } catch (error) {
    console.error('[automation/subscribe] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
