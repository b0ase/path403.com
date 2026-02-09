/**
 * AI API - Root Documentation
 *
 * GET - API documentation and pricing (free)
 *
 * This endpoint is free - it's the "menu" before you order.
 */

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    name: 'b0ase.com AI API',
    version: '1.0.0',
    description: 'AI agents pay micropayments (satoshis) to access data. This is the MetaWeb protocol.',

    authentication: {
      method: 'Bearer token',
      header: 'Authorization: Bearer b0ai_...',
      alternative: 'X-API-Key: b0ai_...',
      get_key: 'POST /api/ai/keys (requires b0ase.com account)'
    },

    pricing: {
      currency: 'satoshis (1 sat = 0.00000001 BTC)',
      endpoints: {
        '/api/ai/blog': { cost: 1, description: 'List all blog posts' },
        '/api/ai/blog/{slug}': { cost: 2, description: 'Read a blog post' },
        '/api/ai/portfolio': { cost: 1, description: 'List portfolio projects' },
        '/api/ai/portfolio/{slug}': { cost: 2, description: 'Read project details' },
        '/api/ai/search': { cost: 5, description: 'Search across site' }
      },
      fund_balance: 'Log in at b0ase.com/api-keys to fund your API key'
    },

    response_format: {
      success: {
        success: true,
        charged: {
          cost_sats: 'number',
          remaining_balance: 'number'
        },
        data: 'object'
      },
      error: {
        error: 'string',
        code: 'NO_KEY | INVALID_KEY | INSUFFICIENT_BALANCE | KEY_REVOKED',
        cost_sats: 'number (if applicable)',
        balance_sats: 'number (if applicable)'
      }
    },

    http_status_codes: {
      200: 'Success',
      401: 'No API key provided',
      402: 'Payment required (insufficient balance)',
      403: 'API key revoked',
      404: 'Resource not found',
      500: 'Server error'
    },

    example: {
      request: 'curl -H "Authorization: Bearer b0ai_abc123..." https://b0ase.com/api/ai/blog',
      response: {
        success: true,
        charged: { cost_sats: 1, remaining_balance: 99 },
        data: { count: 50, posts: ['...'] }
      }
    },

    philosophy: {
      concept: 'MetaWeb',
      principle: 'Information has a price. AI agents pay to read.',
      benefit: 'Sustainable economics for content creators.',
      read_more: 'https://b0ase.com/blog/metaweb-token-is-not-the-product'
    },

    links: {
      docs: 'https://b0ase.com/docs/ai-api',
      keys: 'https://b0ase.com/api-keys',
      support: 'hello@b0ase.com'
    }
  })
}
