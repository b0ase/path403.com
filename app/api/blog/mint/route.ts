/**
 * POST /api/blog/mint
 *
 * Mint a blog post as a $402 token backed by a BSV inscription.
 * Admin-only. Creates both the on-chain inscription and the
 * path402_token + path402_blog_mints database records.
 *
 * Body: { slug: string, base_price_sats?: number, max_supply?: number }
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AuthError } from '@/lib/auth';
import { mintBlogToken } from '@/lib/blog-token';

export async function POST(request: NextRequest) {
  // Auth: admin only
  let adminUser;
  try {
    adminUser = await requireAdmin();
  } catch (e) {
    const status = e instanceof AuthError ? e.status : 401;
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unauthorized' },
      { status }
    );
  }

  // Parse body
  let body: { slug?: string; base_price_sats?: number; max_supply?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { slug, base_price_sats, max_supply } = body;

  if (!slug || typeof slug !== 'string') {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 });
  }

  // Validate slug format (alphanumeric + hyphens)
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug)) {
    return NextResponse.json(
      { error: 'Invalid slug format. Use lowercase alphanumeric with hyphens.' },
      { status: 400 }
    );
  }

  try {
    const result = await mintBlogToken(slug, adminUser.email, {
      base_price_sats,
      max_supply,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Mint failed';
    const status = message.includes('already tokenized') ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
