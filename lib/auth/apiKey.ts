import crypto from 'crypto';
import { getPrisma } from '@/lib/prisma';

/**
 * Verify an API key and return the associated user ID
 * @param apiKey - The API key from the Authorization header (e.g., "b0_...")
 * @returns User ID if valid, null if invalid or revoked
 */
export async function verifyApiKey(apiKey: string): Promise<string | null> {
  if (!apiKey || !apiKey.startsWith('b0_')) {
    return null;
  }

  try {
    const prisma = getPrisma();
    // Hash the provided API key
    const hash = crypto.createHash('sha256').update(apiKey).digest('hex');

    // Find the API key in the database
    const keyRecord = await prisma.api_keys.findUnique({
      where: {
        key_hash: hash,
        revoked_at: null // Only active keys
      },
      select: {
        id: true,
        user_id: true,
        revoked_at: true
      }
    });

    if (!keyRecord || keyRecord.revoked_at) {
      return null;
    }

    // Update last_used_at timestamp (fire and forget)
    prisma.api_keys.update({
      where: { id: keyRecord.id },
      data: { last_used_at: new Date() }
    }).catch(err => console.error('Failed to update API key last_used_at:', err));

    return keyRecord.user_id;
  } catch (error) {
    console.error('Error verifying API key:', error);
    return null;
  }
}

/**
 * Extract API key from Authorization header
 * Supports: "Bearer b0_..." or just "b0_..."
 */
export function extractApiKey(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }

  // Remove "Bearer " prefix if present
  const key = authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : authHeader;

  return key.startsWith('b0_') ? key : null;
}
