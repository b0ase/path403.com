import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, checkKycStatus } from '@/lib/investors/auth';
import { VaultManager } from '@/lib/custody/vault-manager';
import { z } from 'zod';

const createVaultSchema = z.object({
  userPublicKey: z.string().min(66).max(130), // Hex-encoded public key
});

/**
 * POST /api/investors/create-vault
 *
 * Creates a 2-of-2 multisig custody vault for the investor (UK FCA compliant).
 * Requires authenticated user with KYC verification.
 *
 * Key Distribution:
 * - Key 1: Investor's wallet public key (provided in request)
 * - Key 2: b0ase.com platform key (derived deterministically)
 *
 * Both parties must sign to move tokens. This ensures:
 * - Investors cannot transfer shares without b0ase approval (FCA compliance)
 * - b0ase cannot unilaterally seize investor tokens
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
          error: 'KYC verification required',
          kycStatus: kyc.status,
        }, { status: 403 });
      }
    }

    // 3. Validate request body
    const body = await request.json();
    const validation = createVaultSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid request',
        details: validation.error.errors,
      }, { status: 400 });
    }

    const { userPublicKey } = validation.data;

    // 4. Check if vault already exists
    const { getPrisma } = await import('@/lib/prisma');
    const prisma = getPrisma();

    const existingVault = await (prisma as unknown as {
      vault: {
        findUnique: (args: { where: { userId: string } }) => Promise<unknown | null>;
      };
    }).vault.findUnique({
      where: { userId: unifiedUser.id },
    });

    if (existingVault) {
      return NextResponse.json({
        error: 'Vault already exists',
        vault: {
          address: (existingVault as { address: string }).address,
          created: true,
        },
      }, { status: 409 });
    }

    // 5. Create the vault
    const vault = await VaultManager.createVault(unifiedUser.id, userPublicKey);

    // 6. Return vault info
    return NextResponse.json({
      success: true,
      vault: {
        address: vault.address,
        redeemScript: vault.redeemScript,
        userPublicKey: vault.userPublicKey,
        appPublicKey: vault.appPublicKey,
      },
      message: 'Vault created successfully. Your tokens will be held in a 2-of-2 multisig requiring both your signature and b0ase approval for any transfers.',
    });
  } catch (error) {
    console.error('[create-vault] Error:', error);
    return NextResponse.json({
      error: 'Failed to create vault',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * GET /api/investors/create-vault
 *
 * Get existing vault info
 */
export async function GET() {
  try {
    const authContext = await getAuthenticatedUser();
    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { unifiedUser } = authContext;

    const { getPrisma } = await import('@/lib/prisma');
    const prisma = getPrisma();

    const vault = await (prisma as unknown as {
      vault: {
        findUnique: (args: { where: { userId: string } }) => Promise<{
          address: string;
          userPublicKey: string;
          appPublicKey: string;
          created_at: Date;
        } | null>;
      };
    }).vault.findUnique({
      where: { userId: unifiedUser.id },
    });

    if (!vault) {
      return NextResponse.json({ hasVault: false, vault: null });
    }

    return NextResponse.json({
      hasVault: true,
      vault: {
        address: vault.address,
        userPublicKey: vault.userPublicKey,
        appPublicKey: vault.appPublicKey,
        createdAt: vault.created_at,
      },
    });
  } catch (error) {
    console.error('[create-vault] GET Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch vault',
    }, { status: 500 });
  }
}
