/**
 * $402 Holdings Registration API
 *
 * POST - Register a holding (requires KYC verification)
 *
 * Registration is required to receive dividends and vote.
 * This creates an entry in the public registry (cap table).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: holdingId } = await params;
    const userHandle = req.cookies.get('b0ase_user_handle')?.value;

    if (!userHandle) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const supabase = await createClient();

    // Check user is KYC verified
    const { data: user } = await supabase
      .from('unified_users')
      .select('id, kyc_status, full_legal_name')
      .eq('primary_handle', userHandle)
      .single();

    if (!user) {
      return NextResponse.json({
        error: 'User not found. Please complete KYC first.',
        kycStatus: 'none',
      }, { status: 403 });
    }

    if (user.kyc_status !== 'verified') {
      return NextResponse.json({
        error: 'KYC verification required to register holdings',
        kycStatus: user.kyc_status,
      }, { status: 403 });
    }

    // Get the holding
    const { data: holding } = await supabase
      .from('path402_holdings')
      .select(`
        id,
        user_handle,
        quantity,
        registered,
        withdrawn,
        token:path402_tokens!inner (
          id,
          dollar_address,
          title,
          confers_dividends,
          confers_voting
        )
      `)
      .eq('id', holdingId)
      .single();

    if (!holding) {
      return NextResponse.json({ error: 'Holding not found' }, { status: 404 });
    }

    if (holding.user_handle !== userHandle) {
      return NextResponse.json({ error: 'This holding belongs to another user' }, { status: 403 });
    }

    if (holding.registered) {
      return NextResponse.json({
        error: 'Holding is already registered',
        registered: true,
      }, { status: 400 });
    }

    if (holding.withdrawn) {
      return NextResponse.json({
        error: 'Cannot register withdrawn holding',
      }, { status: 400 });
    }

    const token = holding.token as any;
    if (!token.confers_dividends && !token.confers_voting) {
      return NextResponse.json({
        error: 'This token does not confer dividend or voting rights. Registration not required.',
      }, { status: 400 });
    }

    // Calculate position number (order of registration)
    const { count: registeredCount } = await supabase
      .from('path402_holdings')
      .select('id', { count: 'exact', head: true })
      .eq('token_id', token.id)
      .eq('registered', true);

    const position = (registeredCount || 0) + 1;

    // Register the holding
    const { error: updateError } = await supabase
      .from('path402_holdings')
      .update({
        registered: true,
        registered_at: new Date().toISOString(),
        position,
      })
      .eq('id', holdingId);

    if (updateError) {
      console.error('[Holdings] Registration error:', updateError);
      return NextResponse.json({ error: 'Failed to register holding' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      holding: {
        id: holdingId,
        tokenAddress: token.dollar_address,
        tokenName: token.title,
        quantity: holding.quantity,
        position,
        registered: true,
        registeredAt: new Date().toISOString(),
        rights: {
          dividends: token.confers_dividends,
          voting: token.confers_voting,
        },
      },
      message: `Successfully registered as member #${position} of ${token.title}. You are now eligible for ${[
        token.confers_dividends && 'dividends',
        token.confers_voting && 'voting',
      ].filter(Boolean).join(' and ')}.`,
    });
  } catch (error) {
    console.error('[Holdings] Registration Error:', error);
    return NextResponse.json({ error: 'Failed to register holding' }, { status: 500 });
  }
}
