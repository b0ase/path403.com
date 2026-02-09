/**
 * @deprecated Use `import { requireAdmin, requireAuth, getAuthUser } from '@/lib/auth'` instead.
 * This file re-exports from the canonical auth module for backward compatibility.
 */

import { getAuthUser, isAdminEmail } from '@/lib/auth';

export interface AdminVerificationResult {
  isAdmin: boolean;
  error?: string;
  userId?: string;
  userEmail?: string;
}

/**
 * @deprecated Use `requireAdmin()` from `@/lib/auth` instead.
 */
export async function verifyAdmin(): Promise<AdminVerificationResult> {
  const user = await getAuthUser();

  if (!user) {
    return { isAdmin: false, error: 'Authentication required' };
  }

  if (!isAdminEmail(user.email)) {
    return { isAdmin: false, error: 'Admin access required' };
  }

  return { isAdmin: true, userId: user.id, userEmail: user.email };
}

/**
 * @deprecated Use `requireAuth()` from `@/lib/auth` instead.
 */
export async function verifyAuth(): Promise<{ isAuthenticated: boolean; userId?: string; userEmail?: string; error?: string }> {
  const user = await getAuthUser();

  if (!user) {
    return { isAuthenticated: false, error: 'Authentication required' };
  }

  return { isAuthenticated: true, userId: user.id, userEmail: user.email };
}
