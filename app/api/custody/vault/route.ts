import { NextRequest, NextResponse } from 'next/server';
import { VaultManager } from '@/lib/custody/vault-manager';
import { getPrisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// Helper to get authenticated user ID from various auth methods
async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  // Try Supabase session first
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id) {
    return user.id;
  }

  // Try HandCash auth token
  const handcashToken = request.cookies.get('handcash_auth_token')?.value;
  if (handcashToken) {
    // Look up user by handcash session
    const prisma = getPrisma();
    const handcashUser = await prisma.user.findFirst({
      where: { handcashAuthToken: handcashToken }
    });
    if (handcashUser) {
      return handcashUser.id;
    }
  }

  // Try wallet session
  const walletSession = request.cookies.get('wallet_session')?.value;
  if (walletSession) {
    try {
      const session = JSON.parse(walletSession);
      if (session.userId) {
        return session.userId;
      }
    } catch {
      // Invalid session format
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { userPublicKey } = body;

    if (!userPublicKey) {
      return NextResponse.json({ error: 'Missing userPublicKey' }, { status: 400 });
    }

    // Verify user exists
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const vault = await VaultManager.createVault(userId, userPublicKey);

    // Serialize BigInt if any
    const json = JSON.stringify(vault, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    );

    return new NextResponse(json, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (e: any) {
    console.error("Vault Generation Error:", e);
    return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrisma();
    const vault = await prisma.vault.findUnique({ where: { userId } });

    if (!vault) {
      return NextResponse.json({ found: false }, { status: 200 });
    }

    const json = JSON.stringify({ ...vault, found: true }, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    );

    return new NextResponse(json, { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (e: any) {
    console.error("Vault Fetch Error:", e);
    return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
  }
}
