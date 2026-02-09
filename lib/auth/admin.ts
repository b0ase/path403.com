/**
 * @deprecated Use `import { requireAdmin, isAdminEmail } from '@/lib/auth'` instead.
 * This file re-exports from the canonical auth module for backward compatibility.
 */

import { getAuthUser, isAdminEmail } from '@/lib/auth';

/**
 * @deprecated Use `requireAdmin()` from `@/lib/auth` instead.
 */
export async function isAdmin(_authUserId: string): Promise<boolean> {
  const user = await getAuthUser();
  if (!user) return false;
  return isAdminEmail(user.email);
}

export { isAdminEmail };
