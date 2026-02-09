/**
 * Payout Preferences API
 *
 * POST /api/developer/payout/preferences
 * Saves developer payout preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPrisma } from '@/lib/prisma';

const payoutSchema = z.object({
  userId: z.string().uuid(),
  payoutMethod: z.enum(['stripe', 'paypal', 'crypto']),
  paypalEmail: z.string().email().optional(),
  cryptoCurrency: z.enum(['BSV', 'ETH', 'SOL']).optional(),
  cryptoAddress: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = payoutSchema.parse(body);

    const prisma = getPrisma();

    // Validate based on payout method
    if (data.payoutMethod === 'paypal' && !data.paypalEmail) {
      return NextResponse.json(
        { error: 'PayPal email is required' },
        { status: 400 }
      );
    }

    if (data.payoutMethod === 'crypto' && (!data.cryptoCurrency || !data.cryptoAddress)) {
      return NextResponse.json(
        { error: 'Crypto currency and address are required' },
        { status: 400 }
      );
    }

    // Save payout preferences
    const preferences = await prisma.payout_preferences.upsert({
      where: { user_id: data.userId },
      create: {
        user_id: data.userId,
        payout_method: data.payoutMethod,
        paypal_email: data.paypalEmail || null,
        crypto_currency: data.cryptoCurrency || null,
        crypto_address: data.cryptoAddress || null,
      },
      update: {
        payout_method: data.payoutMethod,
        paypal_email: data.paypalEmail || null,
        crypto_currency: data.cryptoCurrency || null,
        crypto_address: data.cryptoAddress || null,
      },
    });

    return NextResponse.json({
      success: true,
      preferences: {
        method: preferences.payout_method,
        verified: preferences.verified,
      },
    });
  } catch (error) {
    console.error('[payout-preferences] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to save payout preferences' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
