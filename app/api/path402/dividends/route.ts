/**
 * $402 Dividends API
 *
 * GET - List dividend distributions for a token
 * POST - Create a new dividend distribution (issuer only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - List dividend distributions
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tokenId = searchParams.get('token');
    const userHandle = req.cookies.get('b0ase_user_handle')?.value;

    const supabase = await createClient();

    let query = supabase
      .from('dividend_distributions')
      .select(`
        id,
        token_id,
        total_amount_sats,
        total_eligible_shares,
        distribution_date,
        status,
        notes,
        created_at,
        completed_at,
        token:path402_tokens!inner (
          id,
          dollar_address,
          title
        )
      `)
      .order('distribution_date', { ascending: false });

    if (tokenId) {
      query = query.eq('token_id', tokenId);
    }

    const { data: distributions, error } = await query;

    if (error) {
      console.error('[Dividends] Query error:', error);
      return NextResponse.json({ error: 'Failed to fetch distributions' }, { status: 500 });
    }

    // If user is logged in, also get their payments
    let userPayments: Record<string, number> = {};
    if (userHandle && distributions && distributions.length > 0) {
      const distributionIds = distributions.map(d => d.id);
      const { data: payments } = await supabase
        .from('dividend_payments')
        .select('distribution_id, amount_sats, payment_status')
        .eq('user_handle', userHandle)
        .in('distribution_id', distributionIds)
        .eq('payment_status', 'paid');

      if (payments) {
        userPayments = payments.reduce((acc, p) => {
          acc[p.distribution_id] = (acc[p.distribution_id] || 0) + p.amount_sats;
          return acc;
        }, {} as Record<string, number>);
      }
    }

    return NextResponse.json({
      distributions: distributions?.map(d => ({
        id: d.id,
        tokenId: d.token_id,
        tokenAddress: (d.token as any).dollar_address,
        tokenName: (d.token as any).title,
        totalAmountSats: d.total_amount_sats,
        totalEligibleShares: d.total_eligible_shares,
        distributionDate: d.distribution_date,
        status: d.status,
        notes: d.notes,
        userReceived: userPayments[d.id] || 0,
      })) || [],
    });
  } catch (error) {
    console.error('[Dividends] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create dividend distribution (issuer only)
export async function POST(req: NextRequest) {
  try {
    const userHandle = req.cookies.get('b0ase_user_handle')?.value;

    if (!userHandle) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { tokenId, totalAmountSats, notes } = body;

    if (!tokenId || !totalAmountSats) {
      return NextResponse.json({
        error: 'Missing required fields: tokenId, totalAmountSats',
      }, { status: 400 });
    }

    if (totalAmountSats < 100) {
      return NextResponse.json({
        error: 'Minimum distribution is 100 sats',
      }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify user is the issuer
    const { data: token } = await supabase
      .from('path402_tokens')
      .select('id, issuer_handle, confers_dividends')
      .eq('id', tokenId)
      .single();

    if (!token) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    if (token.issuer_handle !== userHandle) {
      return NextResponse.json({ error: 'Only token issuer can distribute dividends' }, { status: 403 });
    }

    if (!token.confers_dividends) {
      return NextResponse.json({ error: 'Token does not confer dividend rights' }, { status: 400 });
    }

    // Get all registered holders (dividend eligible)
    const { data: holdings } = await supabase
      .from('path402_holdings')
      .select('id, user_handle, quantity')
      .eq('token_id', tokenId)
      .eq('registered', true)
      .eq('withdrawn', false)
      .gt('quantity', 0);

    if (!holdings || holdings.length === 0) {
      return NextResponse.json({ error: 'No registered holders to distribute to' }, { status: 400 });
    }

    const totalShares = holdings.reduce((sum, h) => sum + h.quantity, 0);

    // Create distribution record
    const { data: distribution, error: distError } = await supabase
      .from('dividend_distributions')
      .insert({
        token_id: tokenId,
        total_amount_sats: totalAmountSats,
        total_eligible_shares: totalShares,
        distribution_date: new Date().toISOString(),
        snapshot_taken_at: new Date().toISOString(),
        status: 'pending',
        initiated_by: userHandle,
        notes,
      })
      .select()
      .single();

    if (distError) {
      console.error('[Dividends] Create distribution error:', distError);
      return NextResponse.json({ error: 'Failed to create distribution' }, { status: 500 });
    }

    // Create payment records for each holder
    const payments = holdings.map(h => ({
      distribution_id: distribution.id,
      holding_id: h.id,
      user_handle: h.user_handle,
      shares_at_snapshot: h.quantity,
      amount_sats: Math.floor((h.quantity / totalShares) * totalAmountSats),
      payment_status: 'pending',
    }));

    const { error: paymentsError } = await supabase
      .from('dividend_payments')
      .insert(payments);

    if (paymentsError) {
      console.error('[Dividends] Create payments error:', paymentsError);
      // Rollback distribution
      await supabase.from('dividend_distributions').delete().eq('id', distribution.id);
      return NextResponse.json({ error: 'Failed to create payment records' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      distributionId: distribution.id,
      totalHolders: holdings.length,
      totalShares,
      amountPerShare: Math.floor(totalAmountSats / totalShares),
      message: `Distribution created for ${holdings.length} holders. Process payments to complete.`,
    });
  } catch (error) {
    console.error('[Dividends] POST Error:', error);
    return NextResponse.json({ error: 'Failed to create distribution' }, { status: 500 });
  }
}
