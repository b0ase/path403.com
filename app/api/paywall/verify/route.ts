import { NextResponse } from 'next/server';
import { hasValidAccess } from '@/lib/paywall/access';
import { PAYWALL_CONFIG } from '@/lib/paywall/config';

export async function GET() {
    const { valid, access } = await hasValidAccess();

    return NextResponse.json({
        hasAccess: valid,
        access: valid ? {
            handle: access?.handle,
            paidAt: access?.paidAt,
            expiresAt: access?.expiresAt,
            tokensAwarded: access?.tokensAwarded,
        } : null,
        price: PAYWALL_CONFIG.priceUSD,
        tokenReward: PAYWALL_CONFIG.tokenReward,
        tokenSymbol: PAYWALL_CONFIG.tokenSymbol,
    });
}
