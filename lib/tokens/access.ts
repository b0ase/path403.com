/**
 * Token-based Access System
 *
 * JWT contains list of owned token paths for fast edge verification.
 * On token purchase, JWT is refreshed with new token added.
 */

import { jwtVerify, SignJWT } from 'jose';
import { getUserTokens, userOwnsToken } from './content-tokens';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'token-access-secret'
);

export interface TokenAccessPayload {
  handle: string;
  ownedPaths: string[];  // Paths user has tokens for
  issuedAt: number;
  expiresAt: number;
}

// Generate access JWT with owned tokens
export async function generateTokenAccessJWT(handcashHandle: string): Promise<string> {
  // Get all tokens owned by user
  const tokens = await getUserTokens(handcashHandle);
  const ownedPaths = tokens.map((t: any) => t.token?.path).filter(Boolean);

  const now = Date.now();
  const expiresAt = now + (24 * 60 * 60 * 1000); // 24 hours - refresh often

  const token = await new SignJWT({
    handle: handcashHandle,
    ownedPaths,
    issuedAt: now,
    expiresAt,
  } as TokenAccessPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  return token;
}

// Verify JWT and check if user owns token for path
export async function verifyTokenAccess(
  token: string,
  path: string
): Promise<{ valid: boolean; handle?: string; ownsPath: boolean }> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const data = payload as unknown as TokenAccessPayload;

    // Check expiration
    if (data.expiresAt < Date.now()) {
      return { valid: false, ownsPath: false };
    }

    // Check if path is in owned paths
    const ownsPath = data.ownedPaths.includes(path);

    return {
      valid: true,
      handle: data.handle,
      ownsPath,
    };
  } catch {
    return { valid: false, ownsPath: false };
  }
}

// Edge-compatible verification (just JWT, no DB)
export async function verifyTokenAccessEdge(
  token: string,
  path: string
): Promise<{ valid: boolean; handle?: string; ownsPath: boolean }> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const data = payload as unknown as TokenAccessPayload;

    if (data.expiresAt < Date.now()) {
      return { valid: false, ownsPath: false };
    }

    const ownsPath = data.ownedPaths.includes(path);
    return { valid: true, handle: data.handle, ownsPath };
  } catch {
    return { valid: false, ownsPath: false };
  }
}

// Check if user needs to buy token (DB check, not edge)
export async function needsToBuyToken(handcashHandle: string, path: string): Promise<boolean> {
  const owns = await userOwnsToken(handcashHandle, path);
  return !owns;
}

// Paths that are always free (no token needed)
const FREE_PATHS = [
  '/',  // Landing page free after site entry
  '/exchange',  // Exchange listing is free to browse
  '/paywall',
  '/login',
  '/api',
];

export function isFreePath(path: string): boolean {
  // Exact matches
  if (FREE_PATHS.includes(path)) return true;

  // API routes handled separately
  if (path.startsWith('/api/')) return true;

  // Static assets
  if (path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|mp3|json|txt)$/)) {
    return true;
  }

  return false;
}

// Paths that require site-wide entry (not per-content)
// After paying site entry, these are accessible
const SITE_ACCESS_PATHS = [
  '/',
  '/exchange',
  '/user',
  '/dashboard',
];

export function isSiteAccessPath(path: string): boolean {
  for (const p of SITE_ACCESS_PATHS) {
    if (path === p || path.startsWith(p + '/')) return true;
  }
  return false;
}

// Content paths that require per-content tokens
export function isContentPath(path: string): boolean {
  // Blog posts
  if (path.startsWith('/blog/') && path !== '/blog') return true;

  // Portfolio items
  if (path.startsWith('/portfolio/') && path !== '/portfolio') return true;

  // Other content sections can be added here

  return false;
}
