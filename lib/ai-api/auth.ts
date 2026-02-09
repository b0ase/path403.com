/**
 * AI API Authentication & Billing
 *
 * AI agents pay micropayments (satoshis) to access data.
 * This is the MetaWeb in action - information has a price.
 */

import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export interface AIApiKey {
  id: string
  user_id: string
  user_handle: string | null
  key_prefix: string
  name: string | null
  balance_sats: number
  request_count: number
  is_active: boolean
  created_at: string
}

export interface AuthResult {
  success: boolean
  key?: AIApiKey
  error?: string
  code?: 'INVALID_KEY' | 'INSUFFICIENT_BALANCE' | 'KEY_REVOKED' | 'NO_KEY'
}

/**
 * Hash an API key for storage
 */
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

/**
 * Generate a new API key
 */
export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const randomBytes = crypto.randomBytes(24)
  const key = `b0ai_${randomBytes.toString('base64url')}`
  const prefix = key.substring(0, 12)
  const hash = hashApiKey(key)
  return { key, prefix, hash }
}

/**
 * Extract API key from request
 */
export function extractApiKey(request: Request): string | null {
  // Check Authorization header first
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  // Check X-API-Key header
  const apiKeyHeader = request.headers.get('X-API-Key')
  if (apiKeyHeader) {
    return apiKeyHeader
  }

  // Check query parameter (for simple integrations)
  const url = new URL(request.url)
  const queryKey = url.searchParams.get('api_key')
  if (queryKey) {
    return queryKey
  }

  return null
}

/**
 * Authenticate an API request
 */
export async function authenticateRequest(request: Request): Promise<AuthResult> {
  const apiKey = extractApiKey(request)

  if (!apiKey) {
    return {
      success: false,
      error: 'API key required. Get one at b0ase.com/api-keys',
      code: 'NO_KEY'
    }
  }

  const keyHash = hashApiKey(apiKey)
  const supabase = await createClient()

  const { data: key, error } = await supabase
    .from('ai_api_keys')
    .select('*')
    .eq('key_hash', keyHash)
    .single()

  if (error || !key) {
    return {
      success: false,
      error: 'Invalid API key',
      code: 'INVALID_KEY'
    }
  }

  if (!key.is_active || key.revoked_at) {
    return {
      success: false,
      error: 'API key has been revoked',
      code: 'KEY_REVOKED'
    }
  }

  return {
    success: true,
    key: key as AIApiKey
  }
}

/**
 * Get the cost for an endpoint
 */
export async function getEndpointCost(endpoint: string): Promise<number> {
  const supabase = await createClient()

  // Try exact match first
  const { data: exactMatch } = await supabase
    .from('ai_api_pricing')
    .select('cost_sats')
    .eq('endpoint_pattern', endpoint)
    .eq('is_active', true)
    .single()

  if (exactMatch) {
    return exactMatch.cost_sats
  }

  // Try wildcard match (e.g., /api/ai/blog/* for /api/ai/blog/some-post)
  const parts = endpoint.split('/')
  for (let i = parts.length; i > 0; i--) {
    const pattern = parts.slice(0, i).join('/') + '/*'
    const { data: wildcardMatch } = await supabase
      .from('ai_api_pricing')
      .select('cost_sats')
      .eq('endpoint_pattern', pattern)
      .eq('is_active', true)
      .single()

    if (wildcardMatch) {
      return wildcardMatch.cost_sats
    }
  }

  // Default cost
  return 1
}

/**
 * Charge for an API request
 */
export async function chargeRequest(
  keyId: string,
  endpoint: string,
  costSats: number,
  request: Request,
  responseTokens?: number
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  const supabase = await createClient()

  // Get current balance
  const { data: key, error: fetchError } = await supabase
    .from('ai_api_keys')
    .select('balance_sats')
    .eq('id', keyId)
    .single()

  if (fetchError || !key) {
    return { success: false, error: 'Key not found' }
  }

  if (key.balance_sats < costSats) {
    return { success: false, error: 'Insufficient balance' }
  }

  // Deduct balance
  const newBalance = key.balance_sats - costSats
  const { error: updateError } = await supabase
    .from('ai_api_keys')
    .update({
      balance_sats: newBalance,
      total_spent_sats: supabase.rpc ? undefined : key.balance_sats, // Increment handled below
      request_count: supabase.rpc ? undefined : 1,
      last_used_at: new Date().toISOString()
    })
    .eq('id', keyId)

  if (updateError) {
    return { success: false, error: 'Failed to charge' }
  }

  // Increment counters separately to avoid race conditions
  await supabase.rpc('increment_ai_api_stats', {
    p_key_id: keyId,
    p_spent: costSats
  }).catch(() => {
    // If RPC doesn't exist, manual update already done
  })

  // Log usage
  await supabase
    .from('ai_api_usage')
    .insert({
      key_id: keyId,
      endpoint,
      cost_sats: costSats,
      request_ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
      response_tokens: responseTokens
    })
    .catch(console.error)

  return { success: true, newBalance }
}

/**
 * Full auth + charge flow for AI API endpoints
 */
export async function authorizeAndCharge(
  request: Request,
  endpoint: string
): Promise<{
  authorized: boolean
  key?: AIApiKey
  cost?: number
  error?: string
  code?: string
}> {
  // Authenticate
  const auth = await authenticateRequest(request)
  if (!auth.success || !auth.key) {
    return {
      authorized: false,
      error: auth.error,
      code: auth.code
    }
  }

  // Get cost
  const cost = await getEndpointCost(endpoint)

  // Check balance
  if (auth.key.balance_sats < cost) {
    return {
      authorized: false,
      key: auth.key,
      cost,
      error: `Insufficient balance. Need ${cost} sats, have ${auth.key.balance_sats}. Fund at b0ase.com/api-keys`,
      code: 'INSUFFICIENT_BALANCE'
    }
  }

  // Charge
  const chargeResult = await chargeRequest(auth.key.id, endpoint, cost, request)
  if (!chargeResult.success) {
    return {
      authorized: false,
      key: auth.key,
      cost,
      error: chargeResult.error,
      code: 'CHARGE_FAILED'
    }
  }

  return {
    authorized: true,
    key: { ...auth.key, balance_sats: chargeResult.newBalance! },
    cost
  }
}
