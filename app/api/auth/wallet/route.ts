import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resolveUnifiedUser } from '@/lib/auth/unified-identity';
import { withRateLimit, rateLimitPresets } from '@/lib/rate-limit';

// Use admin client — wallet auth doesn't have a Supabase session
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// POST /api/auth/wallet - Authenticate with MetaMask or Phantom wallet
// Rate limited: 5 requests per 15 minutes (auth preset)
const walletAuthHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { provider, address } = body;

    if (!provider || !address) {
      return NextResponse.json(
        { error: 'provider and address are required' },
        { status: 400 }
      );
    }

    // Validate provider
    if (!['metamask', 'phantom'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Must be metamask or phantom' },
        { status: 400 }
      );
    }

    // Normalize address (lowercase for Ethereum, as-is for Solana)
    const normalizedAddress = provider === 'metamask'
      ? address.toLowerCase()
      : address;

    const displayName = provider === 'metamask'
      ? `${normalizedAddress.slice(0, 6)}...${normalizedAddress.slice(-4)}`
      : `${normalizedAddress.slice(0, 4)}...${normalizedAddress.slice(-4)}`;

    // Check other active sessions for identity linking
    const handcashHandle = request.cookies.get('b0ase_user_handle')?.value;
    const twitterUser = request.cookies.get('b0ase_twitter_user')?.value;

    const { unifiedUserId } = await resolveUnifiedUser(
      supabaseAdmin,
      {
        provider,
        provider_user_id: normalizedAddress,
        provider_handle: displayName,
        provider_data: {
          chain: provider === 'metamask' ? 'ethereum' : 'solana',
          full_address: normalizedAddress,
        },
      },
      {
        handcashHandle: handcashHandle || undefined,
        twitterUsername: twitterUser || undefined,
      },
      { displayName },
    );

    // Create response with session cookies
    const response = NextResponse.json({
      success: true,
      unified_user_id: unifiedUserId,
    });

    // Set wallet session cookies (30 days)
    const cookieOptions = {
      path: '/',
      maxAge: 2592000,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false,
    };

    response.cookies.set('b0ase_wallet_provider', provider, cookieOptions);
    response.cookies.set('b0ase_wallet_address', normalizedAddress, cookieOptions);

    return response;
  } catch (error) {
    console.error('Wallet auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};

// Apply rate limiting to wallet auth
export const POST = withRateLimit(walletAuthHandler, rateLimitPresets.auth);

// DELETE /api/auth/wallet - Sign out from wallet session
export async function DELETE() {
  const response = NextResponse.json({ success: true });

  const clearOptions = {
    path: '/',
    maxAge: 0,
    sameSite: 'lax' as const,
  };

  response.cookies.set('b0ase_wallet_provider', '', clearOptions);
  response.cookies.set('b0ase_wallet_address', '', clearOptions);

  return response;
}
