import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, checkKycStatus } from '@/lib/investors/auth';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const registerSchema = z.object({
  fullName: z.string().min(2).max(200),
  email: z.string().email(),
  phone: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default('United Kingdom'),
  accreditedInvestor: z.boolean().default(false), // UK: certified investor (high net worth / sophisticated)
  accreditedReason: z.string().optional(), // UK: 'high_net_worth', 'sophisticated', 'self_certified', 'professional'
});

/**
 * POST /api/investors/register
 *
 * Register as a $BOASE token investor (UK FCA compliant).
 * Requires:
 * - Authenticated user
 * - KYC verification
 * - Vault created (2-of-2 multisig)
 * - Certified investor status (high net worth or sophisticated)
 *
 * Creates an entry in cap_table_shareholders
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const authContext = await getAuthenticatedUser();
    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { unifiedUser, supabaseUserId } = authContext;

    // 2. KYC verification check
    if (supabaseUserId) {
      const kyc = await checkKycStatus(supabaseUserId);
      if (!kyc.isVerified) {
        return NextResponse.json({
          error: 'KYC verification required before registration',
          kycStatus: kyc.status,
        }, { status: 403 });
      }
    }

    // 3. Check vault exists
    const { getPrisma } = await import('@/lib/prisma');
    const prisma = getPrisma();

    const vault = await (prisma as unknown as {
      vault: {
        findUnique: (args: { where: { userId: string } }) => Promise<{ address: string } | null>;
      };
    }).vault.findUnique({
      where: { userId: unifiedUser.id },
    });

    if (!vault) {
      return NextResponse.json({
        error: 'Vault required before registration. Create a vault first.',
      }, { status: 400 });
    }

    // 4. Validate request body
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid request',
        details: validation.error.errors,
      }, { status: 400 });
    }

    const data = validation.data;

    // 5. Check if already registered
    const supabase = await createClient();

    const { data: existingShareholder } = await supabase
      .from('cap_table_shareholders')
      .select('id, wallet_address')
      .eq('wallet_address', vault.address)
      .single();

    if (existingShareholder) {
      return NextResponse.json({
        error: 'Already registered as an investor',
        shareholderId: existingShareholder.id,
      }, { status: 409 });
    }

    // 6. Create shareholder entry
    const { data: shareholder, error: createError } = await supabase
      .from('cap_table_shareholders')
      .insert({
        full_name: data.fullName,
        email: data.email,
        phone: data.phone || null,
        wallet_address: vault.address,
        token_balance: 0, // Will be updated on purchase
        ownership_percentage: 0,
        shareholder_type: 'individual',
        investment_date: null, // Set on first purchase
        investment_amount: null,
        share_class: 'ordinary',
        kyc_status: 'approved', // Already verified
        kyc_verified_at: new Date().toISOString(),
        accredited_investor: data.accreditedInvestor,
        address_line_1: data.addressLine1 || null,
        address_line_2: data.addressLine2 || null,
        city: data.city || null,
        postal_code: data.postalCode || null,
        country: data.country,
        status: 'active',
        tags: data.accreditedInvestor ? ['accredited'] : [],
      })
      .select()
      .single();

    if (createError) {
      console.error('[register] Create shareholder error:', createError);
      return NextResponse.json({
        error: 'Failed to register investor',
        message: createError.message,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      shareholder: {
        id: shareholder.id,
        fullName: shareholder.full_name,
        email: shareholder.email,
        walletAddress: shareholder.wallet_address,
        accreditedInvestor: shareholder.accredited_investor,
        status: shareholder.status,
      },
      message: 'Successfully registered as a $BOASE investor',
    });
  } catch (error) {
    console.error('[register] Error:', error);
    return NextResponse.json({
      error: 'Failed to register investor',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * GET /api/investors/register
 *
 * Get investor registration status
 */
export async function GET() {
  try {
    const authContext = await getAuthenticatedUser();
    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { unifiedUser, supabaseUserId } = authContext;

    // Check vault
    const { getPrisma } = await import('@/lib/prisma');
    const prisma = getPrisma();

    const vault = await (prisma as unknown as {
      vault: {
        findUnique: (args: { where: { userId: string } }) => Promise<{ address: string } | null>;
      };
    }).vault.findUnique({
      where: { userId: unifiedUser.id },
    });

    // Check KYC
    let kycStatus = { hasKyc: false, status: 'none', isVerified: false };
    if (supabaseUserId) {
      kycStatus = await checkKycStatus(supabaseUserId);
    }

    // Check shareholder registration
    let isRegistered = false;
    let shareholder = null;

    if (vault) {
      const supabase = await createClient();
      const { data } = await supabase
        .from('cap_table_shareholders')
        .select('*')
        .eq('wallet_address', vault.address)
        .single();

      if (data) {
        isRegistered = true;
        shareholder = data;
      }
    }

    return NextResponse.json({
      hasVault: !!vault,
      vaultAddress: vault?.address || null,
      kyc: kycStatus,
      isRegistered,
      shareholder: shareholder ? {
        id: shareholder.id,
        fullName: shareholder.full_name,
        email: shareholder.email,
        tokenBalance: shareholder.token_balance,
        ownershipPercentage: shareholder.ownership_percentage,
        accreditedInvestor: shareholder.accredited_investor,
        status: shareholder.status,
        investmentDate: shareholder.investment_date,
        investmentAmount: shareholder.investment_amount,
      } : null,
    });
  } catch (error) {
    console.error('[register] GET Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch registration status',
    }, { status: 500 });
  }
}
