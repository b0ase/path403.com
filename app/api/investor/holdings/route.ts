/**
 * GET /api/investor/holdings
 *
 * Get token holdings for an investor by email.
 * Simple email-based lookup (no auth required for now).
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'

const prisma = getPrisma()

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find investor
    const investor = await prisma.investors.findFirst({
      where: { email: email.toLowerCase() }
    })

    if (!investor) {
      return NextResponse.json(
        { error: 'No investor found with this email' },
        { status: 404 }
      )
    }

    // Get token holdings from member registry
    const holdings = await prisma.token_member_registry.findMany({
      where: {
        OR: [
          { email: { equals: email.toLowerCase(), mode: 'insensitive' } },
          { member_name: { contains: investor.name || '', mode: 'insensitive' } }
        ]
      }
    })

    // Calculate total value
    let totalValue = 0
    const formattedHoldings = holdings.map(h => {
      const value = Number(h.allocation_tokens) * Number(h.price_per_token || 0.0000999)
      totalValue += value
      return {
        token_symbol: h.token_symbol,
        holder_name: h.member_name,
        allocation_tokens: Number(h.allocation_tokens),
        allocation_percentage: Number(h.allocation_percentage),
        status: h.status,
        price_per_token: Number(h.price_per_token) || 0.0000999
      }
    })

    // Get any documents (from investor agreements if they exist)
    const documents: { name: string; url: string }[] = []

    if (investor.subscription_agreement_url) {
      documents.push({
        name: 'Subscription Agreement',
        url: investor.subscription_agreement_url
      })
    }

    if (investor.share_certificate_url) {
      documents.push({
        name: 'Share Certificate',
        url: investor.share_certificate_url
      })
    }

    return NextResponse.json({
      email: investor.email,
      name: investor.name,
      holdings: formattedHoldings,
      total_value_gbp: Math.round(totalValue * 100) / 100,
      documents
    })
  } catch (error) {
    console.error('Holdings lookup error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch holdings' },
      { status: 500 }
    )
  }
}
