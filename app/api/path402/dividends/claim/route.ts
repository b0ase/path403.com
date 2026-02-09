/**
 * POST /api/path402/dividends/claim
 *
 * Claim accumulated dividends. Pays out via HandCash house account
 * to the user's HandCash handle.
 *
 * Minimum payout: $0.01 USD (HandCash minimum)
 */

import { NextRequest, NextResponse } from 'next/server';
import { handcashService } from '@/lib/handcash-service';
import { createAdminClient } from '@/lib/supabase/admin';
import { estimateUSD } from '@/lib/path402/pricing';

const MIN_PAYOUT_SATS = 50; // Minimum to be worth sending (~$0.01 at $50/BSV)

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate via HandCash
    const authToken = request.cookies.get('b0ase_handcash_token')?.value;
    if (!authToken) {
      return NextResponse.json(
        { error: 'HandCash authentication required' },
        { status: 401 }
      );
    }

    let userHandle: string;
    try {
      const profile = await handcashService.getUserProfile(authToken);
      userHandle = profile.handle;
    } catch {
      return NextResponse.json(
        { error: 'HandCash session expired' },
        { status: 401 }
      );
    }

    // 2. Get all holdings with pending dividends
    const supabase = createAdminClient();

    const { data: holdings, error } = await supabase
      .from('path402_holdings')
      .select('id, token_id, pending_dividends_sats, total_dividends_paid_sats')
      .eq('holder_handle', userHandle)
      .gt('pending_dividends_sats', 0);

    if (error) {
      console.error('[dividends/claim] Query error:', error);
      return NextResponse.json({ error: 'Failed to fetch holdings' }, { status: 500 });
    }

    if (!holdings || holdings.length === 0) {
      return NextResponse.json(
        { error: 'No pending dividends to claim' },
        { status: 400 }
      );
    }

    // 3. Calculate total
    const totalPendingSats = holdings.reduce(
      (sum, h) => sum + (h.pending_dividends_sats || 0),
      0
    );

    if (totalPendingSats < MIN_PAYOUT_SATS) {
      return NextResponse.json({
        error: `Minimum payout is ${MIN_PAYOUT_SATS} sats (~$${estimateUSD(MIN_PAYOUT_SATS).toFixed(4)}). You have ${totalPendingSats} sats pending.`,
        pending_sats: totalPendingSats
      }, { status: 400 });
    }

    // 4. Pay via HandCash house account
    const payoutUSD = estimateUSD(totalPendingSats);
    const payoutAmount = Math.max(0.01, Math.round(payoutUSD * 100) / 100);

    let handcashTxId: string;
    try {
      const houseAccount = handcashService.getHouseAccount();
      const result = await houseAccount.wallet.pay({
        description: `$402 dividend payout: ${totalPendingSats} sats`,
        appAction: 'PAYMENT',
        payments: [{
          destination: userHandle,
          currencyCode: 'USD' as any,
          sendAmount: payoutAmount
        }]
      });
      handcashTxId = result.transactionId;
    } catch (payError) {
      console.error('[dividends/claim] Payout failed:', payError);
      return NextResponse.json(
        { error: 'Dividend payout failed. Please try again later.' },
        { status: 500 }
      );
    }

    // 5. Reset pending dividends and update totals
    for (const holding of holdings) {
      await supabase
        .from('path402_holdings')
        .update({
          pending_dividends_sats: 0,
          total_dividends_paid_sats:
            (holding.total_dividends_paid_sats || 0) + (holding.pending_dividends_sats || 0)
        })
        .eq('id', holding.id);
    }

    return NextResponse.json({
      success: true,
      payout: {
        sats: totalPendingSats,
        usd: payoutAmount,
        handcash_tx_id: handcashTxId,
        holdings_paid: holdings.length
      }
    });

  } catch (error) {
    console.error('[dividends/claim] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Claim failed' },
      { status: 500 }
    );
  }
}
