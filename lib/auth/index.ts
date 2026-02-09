/**
 * Canonical Auth Module
 *
 * Single source of truth for authentication and authorization.
 * All other auth files (admin.ts, verifyAdmin.ts, inline checks) are deprecated
 * in favour of these exports.
 */

import { createClient } from '@/lib/supabase/server';

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
}

/**
 * Get the currently authenticated user from the Supabase session cookie.
 * Returns null if no valid session exists.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user || !user.email) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata,
    };
  } catch {
    return null;
  }
}

/**
 * Require an authenticated user. Throws a structured error (401) if not authenticated.
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    throw new AuthError('Authentication required', 401);
  }
  return user;
}

/**
 * Require an admin user. Throws 401 if not authenticated, 403 if not admin.
 * Admin check: user.email matches ADMIN_EMAIL env var.
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();

  if (!isAdminEmail(user.email)) {
    throw new AuthError('Admin access required', 403);
  }

  return user;
}

/**
 * Check if an email address belongs to an admin.
 * Supports comma-separated ADMIN_EMAIL for multiple admins.
 */
export function isAdminEmail(email: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return false;

  const adminEmails = adminEmail.split(',').map(e => e.trim().toLowerCase());
  return adminEmails.includes(email.toLowerCase());
}

/**
 * Structured auth error with HTTP status code.
 */
export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}
