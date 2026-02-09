/**
 * POST /api/ledger/irrigate
 *
 * Distribute revenue to token holders (the irrigation pattern).
 *
 * This is the core of the b0ase tokenomics:
 * - Revenue flows in from various sources
 * - Gets distributed pro-rata to all token holders
 * - Payments execute via HandCash
 *
 * Admin only endpoint.
 */

import { NextRequest, NextResponse } from 'next/server';
import { irrigate } from '@/lib/ledger-payments';
import { getServerSession } from 'next-auth';

// Simple admin check - replace with your actual admin logic
const ADMIN_EMAILS = ['richard@b0ase.com', 'admin@b0ase.com'];

export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const session = await getServerSession();
    const userEmail = session?.user?.email;

    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      tokenId,
      totalAmount,
      source,
      currency,
    } = body;

    // Validate required fields
    if (!tokenId || !totalAmount || !source) {
      return NextResponse.json(
        { error: 'Missing required fields: tokenId, totalAmount, source' },
        { status: 400 }
      );
    }

    // Execute irrigation
    const result = await irrigate({
      tokenId,
      totalAmount,
      source,
      currency: currency || 'USD',
    });

    return NextResponse.json({
      success: true,
      transactionId: result.txid,
      holdersProcessed: result.holdersProcessed,
      totalDistributed: result.totalDistributed,
      message: `Distributed $${result.totalDistributed} to ${result.holdersProcessed} holders`,
    });
  } catch (error: any) {
    console.error('[Irrigation Error]', error);

    return NextResponse.json(
      {
        error: error.message || 'Irrigation failed',
        code: error.code || 'IRRIGATION_ERROR',
      },
      { status: 500 }
    );
  }
}
