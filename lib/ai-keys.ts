import { createClient } from '@/lib/supabase/server';
import { decrypt } from '@/lib/encryption';

export type AIProvider = 'claude' | 'openai' | 'gemini';

interface AIKeyResult {
  provider: AIProvider;
  apiKey: string;
  keyPrefix: string;
}

/**
 * Get a user's decrypted API key for an AI provider
 * This should only be called from server-side code (API routes, server actions)
 *
 * @param unifiedUserId - The user's unified_user_id
 * @param provider - The AI provider ('claude', 'openai', or 'gemini')
 * @returns The decrypted API key or null if not found
 */
export async function getAIApiKey(
  unifiedUserId: string,
  provider: AIProvider
): Promise<string | null> {
  try {
    const supabase = await createClient();

    const { data: identity, error } = await supabase
      .from('user_identities')
      .select('provider_data')
      .eq('unified_user_id', unifiedUserId)
      .eq('provider', provider)
      .single();

    if (error || !identity?.provider_data?.encrypted_key) {
      return null;
    }

    return decrypt(identity.provider_data.encrypted_key);
  } catch (error) {
    console.error(`Error retrieving ${provider} API key:`, error);
    return null;
  }
}

/**
 * Get all of a user's AI API keys (decrypted)
 * This should only be called from server-side code
 *
 * @param unifiedUserId - The user's unified_user_id
 * @returns Array of decrypted API keys with their providers
 */
export async function getAllAIApiKeys(
  unifiedUserId: string
): Promise<AIKeyResult[]> {
  try {
    const supabase = await createClient();

    const { data: identities, error } = await supabase
      .from('user_identities')
      .select('provider, provider_data')
      .eq('unified_user_id', unifiedUserId)
      .in('provider', ['claude', 'openai', 'gemini']);

    if (error || !identities) {
      return [];
    }

    const results: AIKeyResult[] = [];

    for (const identity of identities) {
      if (identity.provider_data?.encrypted_key) {
        try {
          const apiKey = decrypt(identity.provider_data.encrypted_key);
          results.push({
            provider: identity.provider as AIProvider,
            apiKey,
            keyPrefix: identity.provider_data.key_prefix || '',
          });
        } catch {
          // Skip keys that fail to decrypt
          console.error(`Failed to decrypt ${identity.provider} key`);
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Error retrieving AI API keys:', error);
    return [];
  }
}

/**
 * Check if a user has a specific AI provider connected
 *
 * @param unifiedUserId - The user's unified_user_id
 * @param provider - The AI provider to check
 * @returns Boolean indicating if the provider is connected
 */
export async function hasAIProvider(
  unifiedUserId: string,
  provider: AIProvider
): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('user_identities')
      .select('id')
      .eq('unified_user_id', unifiedUserId)
      .eq('provider', provider)
      .single();

    return !error && !!data;
  } catch {
    return false;
  }
}
