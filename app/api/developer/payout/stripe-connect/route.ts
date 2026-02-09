/**
 * Stripe Connect Onboarding API
 *
 * POST /api/developer/payout/stripe-connect
 * Creates a Stripe Connect account and returns onboarding link
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import {
  createConnectAccount,
  createConnectAccountLink,
} from '@/lib/stripe-marketplace';

export async function POST(request: NextRequest) {
  try {
    // Get current user (from session)
    const cookieStore = await import('next/headers').then((m) => m.cookies());
    const sessionCookie = (await cookieStore).get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = sessionCookie.value;
    const prisma = getPrisma();

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user || !user.email) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has a Stripe account
    const existingPayout = await prisma.payout_preferences.findUnique({
      where: { user_id: userId },
    });

    let stripeAccountId = existingPayout?.stripe_account_id;

    // Create new Stripe Connect account if doesn't exist
    if (!stripeAccountId) {
      const account = await createConnectAccount(user.email, {
        user_id: userId,
      });

      stripeAccountId = account.id;

      // Save to database
      await prisma.payout_preferences.upsert({
        where: { user_id: userId },
        create: {
          user_id: userId,
          payout_method: 'stripe',
          stripe_account_id: stripeAccountId,
        },
        update: {
          payout_method: 'stripe',
          stripe_account_id: stripeAccountId,
        },
      });
    }

    // Create account link for onboarding
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const accountLink = await createConnectAccountLink(
      stripeAccountId,
      `${baseUrl}/dashboard/developer/payout/refresh`,
      `${baseUrl}/dashboard/developer/setup?step=payout-complete`
    );

    return NextResponse.json({
      accountLinkUrl: accountLink.url,
      stripeAccountId,
    });
  } catch (error) {
    console.error('[stripe-connect] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create Stripe Connect account',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
