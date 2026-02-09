/**
 * POST /api/bwriter/consume
 *
 * Deducts 1 $bWriter token from user's balance when they save/publish in Bitcoin Writer
 *
 * Request body:
 * {
 *   action: 'save' | 'publish',
 *   metadata?: {
 *     documentId?: string,
 *     pageCount?: number,
 *     title?: string,
 *     [key: string]: any
 *   }
 * }
 *
 * Response on success:
 * {
 *   success: true,
 *   remainingBalance: number,
 *   consumed: 1
 * }
 *
 * Response on insufficient balance:
 * {
 *   success: false,
 *   error: 'Insufficient balance',
 *   balance: number
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/investors/auth';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const authContext = await getAuthenticatedUser();
    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { unifiedUser } = authContext;
    const supabase = await createClient();

    // 2. Parse request body
    const body = await request.json();
    const action = body.action || 'save';
    const metadata = body.metadata || {};

    // 3. Get user's current balance
    const { data: balance, error: balanceError } = await supabase
      .from('user_bwriter_balance')
      .select('*')
      .eq('user_id', unifiedUser.id)
      .eq('platform', 'b0ase')
      .single();

    if (balanceError) {
      console.error('[consume] Failed to fetch balance:', balanceError);
      return NextResponse.json(
        { error: 'Failed to fetch balance' },
        { status: 500 }
      );
    }

    const currentBalance = balance?.balance || 0;

    // 4. Check if user has sufficient balance
    if (currentBalance < 1) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient balance',
        balance: currentBalance,
        requiredBalance: 1,
      });
    }

    // 5. Deduct 1 token
    const newBalance = currentBalance - 1;

    const { data: updatedBalance, error: updateError } = await supabase
      .from('user_bwriter_balance')
      .update({
        balance: newBalance,
      })
      .eq('user_id', unifiedUser.id)
      .eq('platform', 'b0ase')
      .select()
      .single();

    if (updateError) {
      console.error('[consume] Failed to update balance:', updateError);
      return NextResponse.json(
        { error: 'Failed to consume token' },
        { status: 500 }
      );
    }

    // 6. Optionally log the consumption for analytics
    try {
      await supabase.from('bwriter_token_consumption_log').insert({
        user_id: unifiedUser.id,
        action,
        tokens_consumed: 1,
        metadata: JSON.stringify(metadata),
      });
    } catch (logErr) {
      // Log error but don't fail the request - consumption already happened
      console.error('[consume] Failed to log consumption:', logErr);
    }

    // 7. Return success response
    return NextResponse.json({
      success: true,
      remainingBalance: newBalance,
      consumed: 1,
      action,
    });
  } catch (err) {
    console.error('[consume] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
