import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';
import { getPrisma } from '@/lib/prisma';

// Generate a secure API key
function generateApiKey(): { key: string; prefix: string; hash: string } {
  const randomBytes = crypto.randomBytes(32);
  const key = `b0_${randomBytes.toString('base64url')}`;
  const prefix = key.substring(0, 12); // First 12 chars for display
  const hash = crypto.createHash('sha256').update(key).digest('hex');

  return { key, prefix, hash };
}

// GET /api/user/access-keys - List all API keys for the current user
export async function GET(request: NextRequest) {
  try {
    const prisma = getPrisma();
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKeys = await prisma.api_keys.findMany({
      where: {
        user_id: user.id,
        revoked_at: null
      },
      select: {
        id: true,
        key_prefix: true,
        name: true,
        created_at: true,
        last_used_at: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({ apiKeys });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

// POST /api/user/access-keys - Create a new API key
export async function POST(request: NextRequest) {
  try {
    const prisma = getPrisma();
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (name.length > 255) {
      return NextResponse.json(
        { error: 'Name must be 255 characters or less' },
        { status: 400 }
      );
    }

    const { key, prefix, hash } = generateApiKey();

    const apiKey = await prisma.api_keys.create({
      data: {
        user_id: user.id,
        key_hash: hash,
        key_prefix: prefix,
        name: name.trim()
      },
      select: {
        id: true,
        key_prefix: true,
        name: true,
        created_at: true
      }
    });

    // Return the full key only on creation (won't be shown again)
    return NextResponse.json({
      apiKey: {
        ...apiKey,
        key // Full key only shown once
      }
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}
