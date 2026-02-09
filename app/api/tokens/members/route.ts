import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Token Member Registry API
 *
 * Tracks token allocations for verified members/investors.
 * Uses the existing cap_table infrastructure but scoped to specific tokens.
 *
 * This is separate from user_token_balances which tracks on-platform balances.
 * Member registry tracks legal ownership for cap table purposes.
 */

export interface TokenMember {
  id: string;
  tokenSymbol: string;
  memberName: string;
  email?: string;
  walletAddress?: string;
  allocationTokens: number;
  allocationPercentage: number;
  allocationDate: string;
  tranche: number;
  pricePerToken: number;
  totalPaid: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'claimed';
  isPublic: boolean;
  notes?: string;
}

/**
 * GET /api/tokens/members?symbol=BSHEETS
 *
 * Get member registry for a token.
 * Public endpoint - returns only public members.
 */
export async function GET(request: NextRequest) {
  try {
    const symbol = request.nextUrl.searchParams.get('symbol');
    const includePrivate = request.nextUrl.searchParams.get('includePrivate') === 'true';

    if (!symbol) {
      return NextResponse.json({ error: 'Token symbol required' }, { status: 400 });
    }

    const normalizedSymbol = symbol.replace(/^\$/, '').toUpperCase();

    const supabase = await createClient();

    // Check if user is admin (for private member access)
    let isAdmin = false;
    if (includePrivate) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        isAdmin = profile?.role && ['admin', 'superadmin'].includes(profile.role);
      }
    }

    // Query token_member_registry table
    let query = supabase
      .from('token_member_registry')
      .select('*')
      .eq('token_symbol', normalizedSymbol)
      .order('allocation_date', { ascending: true });

    if (!isAdmin || !includePrivate) {
      query = query.eq('is_public', true);
    }

    const { data: members, error } = await query;

    if (error) {
      // Table might not exist yet - return empty
      console.log('[members] Query error (table may not exist):', error.message);
      return NextResponse.json({
        symbol: normalizedSymbol,
        members: [],
        totalAllocated: 0,
        totalAllocatedPercentage: 0,
      });
    }

    // Calculate totals
    const totalAllocated = (members || []).reduce((sum, m) => sum + (m.allocation_tokens || 0), 0);
    const totalAllocatedPercentage = (members || []).reduce((sum, m) => sum + (m.allocation_percentage || 0), 0);

    return NextResponse.json({
      symbol: normalizedSymbol,
      members: (members || []).map(m => ({
        id: m.id,
        tokenSymbol: m.token_symbol,
        memberName: m.member_name,
        email: isAdmin ? m.email : undefined,
        walletAddress: m.wallet_address,
        allocationTokens: m.allocation_tokens,
        allocationPercentage: m.allocation_percentage,
        allocationDate: m.allocation_date,
        tranche: m.tranche,
        pricePerToken: m.price_per_token,
        totalPaid: m.total_paid,
        currency: m.currency,
        status: m.status,
        isPublic: m.is_public,
        notes: isAdmin ? m.notes : undefined,
      })),
      totalAllocated,
      totalAllocatedPercentage,
    });
  } catch (error) {
    console.error('[members] GET error:', error);
    return NextResponse.json({
      error: 'Failed to fetch member registry',
    }, { status: 500 });
  }
}

/**
 * POST /api/tokens/members
 *
 * Add a member to the token registry.
 * Admin only.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication and admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'superadmin'].includes(profile.role || '')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      tokenSymbol,
      memberName,
      email,
      walletAddress,
      allocationTokens,
      allocationPercentage,
      tranche,
      pricePerToken,
      totalPaid,
      currency,
      isPublic,
      notes,
    } = body;

    if (!tokenSymbol || !memberName) {
      return NextResponse.json({
        error: 'tokenSymbol and memberName required',
      }, { status: 400 });
    }

    const normalizedSymbol = tokenSymbol.replace(/^\$/, '').toUpperCase();

    const { data: member, error: insertError } = await supabase
      .from('token_member_registry')
      .insert({
        token_symbol: normalizedSymbol,
        member_name: memberName,
        email: email || null,
        wallet_address: walletAddress || null,
        allocation_tokens: allocationTokens || 0,
        allocation_percentage: allocationPercentage || 0,
        allocation_date: new Date().toISOString(),
        tranche: tranche || 0,
        price_per_token: pricePerToken || 0,
        total_paid: totalPaid || 0,
        currency: currency || 'GBP',
        status: 'confirmed',
        is_public: isPublic ?? false,
        notes: notes || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[members] Insert error:', insertError);
      return NextResponse.json({
        error: 'Failed to add member',
        details: insertError.message,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        tokenSymbol: member.token_symbol,
        memberName: member.member_name,
        allocationTokens: member.allocation_tokens,
        allocationPercentage: member.allocation_percentage,
        status: member.status,
      },
    });
  } catch (error) {
    console.error('[members] POST error:', error);
    return NextResponse.json({
      error: 'Failed to add member',
    }, { status: 500 });
  }
}
