import { createClient } from '@supabase/supabase-js';
import { cookies, headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/certifications
 * Creates a new investor certification for the authenticated user
 *
 * Required fields:
 * - certification_type: 'high_net_worth' | 'sophisticated'
 * - statement_text: The signed FCA-compliant statement
 * - full_name: Legal name
 * - wallet_address: BSV wallet address
 * - signature_hash: Cryptographic signature of the statement
 *
 * Optional fields:
 * - income_threshold_met: boolean (for HNWI)
 * - assets_threshold_met: boolean (for HNWI)
 * - angel_network_member: boolean (for Sophisticated)
 * - previous_investments_count: number (for Sophisticated)
 * - relevant_work_experience: string (for Sophisticated)
 * - director_of_qualifying_co: boolean (for Sophisticated)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet_address } = body;

    // Try to get user from Supabase auth first
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    let userId: string | null = null;

    if (accessToken) {
      const { data: { user } } = await supabase.auth.getUser(accessToken);
      if (user) {
        userId = userId;
      }
    }

    // If no Supabase auth, try to find user by wallet address
    if (!userId && wallet_address) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('bsv_address', wallet_address)
        .single();

      if (profile) {
        userId = profile.id;
      }
    }

    // If still no user, return helpful error
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Please log in or link your wallet to your account first. Go to /login to sign in.',
      }, { status: 401 });
    }
    const {
      certification_type,
      income_threshold_met,
      assets_threshold_met,
      angel_network_member,
      previous_investments_count,
      relevant_work_experience,
      director_of_qualifying_co,
      statement_text,
      full_name,
      signature_hash,
    } = body;

    // Validate required fields
    if (!certification_type || !['high_net_worth', 'sophisticated'].includes(certification_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid certification type' },
        { status: 400 }
      );
    }

    if (!statement_text || statement_text.length < 100) {
      return NextResponse.json(
        { success: false, error: 'Invalid statement text' },
        { status: 400 }
      );
    }

    if (!full_name || full_name.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Full name is required' },
        { status: 400 }
      );
    }

    if (!wallet_address) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    if (!signature_hash) {
      return NextResponse.json(
        { success: false, error: 'Signature is required' },
        { status: 400 }
      );
    }

    // Validate qualification criteria
    if (certification_type === 'high_net_worth') {
      if (!income_threshold_met && !assets_threshold_met) {
        return NextResponse.json(
          { success: false, error: 'Must meet at least one High Net Worth criterion' },
          { status: 400 }
        );
      }
    }

    if (certification_type === 'sophisticated') {
      const hasQualification =
        angel_network_member ||
        (previous_investments_count && previous_investments_count >= 2) ||
        (relevant_work_experience && relevant_work_experience.length > 10) ||
        director_of_qualifying_co;

      if (!hasQualification) {
        return NextResponse.json(
          { success: false, error: 'Must meet at least one Sophisticated Investor criterion' },
          { status: 400 }
        );
      }
    }

    // Check for existing valid certification
    const { data: existingCert } = await supabase
      .from('investor_certifications')
      .select('id, valid_until')
      .eq('user_id', userId)
      .is('revoked_at', null)
      .gt('valid_until', new Date().toISOString())
      .single();

    if (existingCert) {
      return NextResponse.json(
        {
          success: false,
          error: 'You already have a valid certification',
          existing_certification: existingCert
        },
        { status: 400 }
      );
    }

    // Calculate validity period (12 months from now)
    const now = new Date();
    const validUntil = new Date(now);
    validUntil.setFullYear(validUntil.getFullYear() + 1);

    // Get IP address and user agent for audit trail
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] ||
                      headersList.get('x-real-ip') ||
                      'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    // Create certification
    const { data: certification, error } = await supabase
      .from('investor_certifications')
      .insert({
        user_id: userId,
        certification_type,
        income_threshold_met: income_threshold_met || false,
        assets_threshold_met: assets_threshold_met || false,
        angel_network_member: angel_network_member || false,
        previous_investments_count: previous_investments_count || 0,
        relevant_work_experience: relevant_work_experience || null,
        director_of_qualifying_co: director_of_qualifying_co || false,
        statement_text,
        full_name,
        wallet_address,
        signature_hash,
        signed_at: now.toISOString(),
        valid_from: now.toISOString(),
        valid_until: validUntil.toISOString(),
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating certification:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create certification', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: certification,
    });

  } catch (error: any) {
    console.error('Certification API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/certifications
 * Gets the current user's investor certifications
 * Supports query param: ?wallet_address=xxx for wallet-based lookup
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('wallet_address');

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    let userId: string | null = null;

    if (accessToken) {
      const { data: { user } } = await supabase.auth.getUser(accessToken);
      if (user) {
        userId = user.id;
      }
    }

    // If no Supabase auth, try wallet address lookup
    if (!userId && walletAddress) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('bsv_address', walletAddress)
        .single();

      if (profile) {
        userId = profile.id;
      }
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get all certifications for user
    const { data: certifications, error } = await supabase
      .from('investor_certifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching certifications:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch certifications' },
        { status: 500 }
      );
    }

    // Find current valid certification
    const validCertification = certifications?.find(
      c => !c.revoked_at && new Date(c.valid_until) > new Date()
    );

    return NextResponse.json({
      success: true,
      data: {
        certifications,
        valid_certification: validCertification || null,
        is_certified: !!validCertification,
      },
    });

  } catch (error: any) {
    console.error('Certification API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
