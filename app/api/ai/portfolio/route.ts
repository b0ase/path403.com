/**
 * AI API - Portfolio Projects
 *
 * GET - List all portfolio projects (costs 1 sat)
 */

import { NextRequest, NextResponse } from 'next/server'
import { authorizeAndCharge } from '@/lib/ai-api/auth'
import { portfolioData } from '@/lib/data'

export async function GET(request: NextRequest) {
  const endpoint = '/api/ai/portfolio'

  // Authorize and charge
  const auth = await authorizeAndCharge(request, endpoint)

  if (!auth.authorized) {
    return NextResponse.json(
      {
        error: auth.error,
        code: auth.code,
        cost_sats: auth.cost,
        balance_sats: auth.key?.balance_sats
      },
      { status: auth.code === 'NO_KEY' ? 401 : 402 }
    )
  }

  try {
    const projects = portfolioData.projects.map(project => ({
      slug: project.slug,
      title: project.title,
      description: project.description,
      status: project.status,
      token_name: project.tokenName,
      price: project.price,
      url: `https://b0ase.com/portfolio/${project.slug}`,
      api_url: `https://b0ase.com/api/ai/portfolio/${project.slug}`
    }))

    return NextResponse.json({
      success: true,
      charged: {
        cost_sats: auth.cost,
        remaining_balance: auth.key?.balance_sats
      },
      data: {
        count: projects.length,
        projects
      },
      _meta: {
        source: 'b0ase.com',
        license: 'Paid access via MetaWeb protocol'
      }
    })
  } catch (error) {
    console.error('Portfolio list error:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}
