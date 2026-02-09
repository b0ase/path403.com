/**
 * AI API Keys Management
 *
 * POST - Create a new API key (requires auth)
 * GET - List user's API keys (requires auth)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateApiKey, hashApiKey } from '@/lib/ai-api/auth'
import { z } from 'zod'

const CreateKeySchema = z.object({
  name: z.string().max(100).optional()
})

// Create a new API key
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Require authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get user handle
    const { data: profile } = await supabase
      .from('profiles')
      .select('handcash_handle')
      .eq('id', user.id)
      .single()

    const body = await request.json().catch(() => ({}))
    const parsed = CreateKeySchema.safeParse(body)
    const name = parsed.success ? parsed.data.name : null

    // Generate key
    const { key, prefix, hash } = generateApiKey()

    // Store in database
    const { data: apiKey, error: createError } = await supabase
      .from('ai_api_keys')
      .insert({
        user_id: user.id,
        user_handle: profile?.handcash_handle,
        key_hash: hash,
        key_prefix: prefix,
        name,
        balance_sats: 0,
        is_active: true
      })
      .select('id, key_prefix, name, balance_sats, created_at')
      .single()

    if (createError) {
      console.error('Failed to create API key:', createError)
      return NextResponse.json({ error: 'Failed to create key' }, { status: 500 })
    }

    // Return the full key ONCE - it won't be shown again
    return NextResponse.json({
      success: true,
      message: 'API key created. Save it now - it won\'t be shown again!',
      key: key,  // Full key - only shown once
      id: apiKey.id,
      prefix: apiKey.key_prefix,
      name: apiKey.name,
      balance_sats: apiKey.balance_sats,
      created_at: apiKey.created_at,
      usage: {
        header: 'Authorization: Bearer ' + key,
        example: `curl -H "Authorization: Bearer ${key}" https://b0ase.com/api/ai/blog`
      }
    })
  } catch (error) {
    console.error('API key creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// List user's API keys
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Require authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { data: keys, error } = await supabase
      .from('ai_api_keys')
      .select('id, key_prefix, name, balance_sats, total_funded_sats, total_spent_sats, request_count, last_used_at, created_at, is_active')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch keys' }, { status: 500 })
    }

    return NextResponse.json({
      keys,
      pricing_info: {
        message: 'AI agents pay satoshis per request',
        example_costs: {
          'List blog posts': '1 sat',
          'Read blog post': '2 sats',
          'Search': '5 sats'
        },
        fund_url: '/api-keys'
      }
    })
  } catch (error) {
    console.error('API keys list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
