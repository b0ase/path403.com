/**
 * POST /api/invest/boase/interest
 *
 * Register investor interest in $BOASE studio token.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'

const prisma = getPrisma()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, tier, amount } = body as {
      email: string
      tier?: string
      amount?: number
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Check if already registered
    const existing = await prisma.investors.findFirst({
      where: { email: email.toLowerCase() }
    })

    if (existing) {
      // Update with new tier if different
      if (tier && existing.investment_tier !== tier) {
        await prisma.investors.update({
          where: { id: existing.id },
          data: {
            investment_tier: tier,
            investment_amount: amount || existing.investment_amount,
            notes: `Updated interest: ${tier} tier at £${amount}`
          }
        })
      }
      return NextResponse.json({
        success: true,
        message: 'Interest updated',
        investor_id: existing.id
      })
    }

    // Calculate equity based on amount
    const equityMap: Record<number, number> = {
      999: 0.1,
      4999: 0.5,
      9999: 1.0
    }
    const equity = equityMap[amount || 999] || 0.1

    // Create new investor record
    const investor = await prisma.investors.create({
      data: {
        name: 'Interested Party',
        email: email.toLowerCase(),
        investment_amount: amount || 999,
        equity_percentage: equity,
        investment_tier: tier || 'supporter',
        status: 'pending',
        notes: `Interest via /invest/boase - ${tier || 'supporter'} tier`
      }
    })

    // Also add to token_member_registry
    const tokenMap: Record<number, number> = {
      999: 1_000_000,
      4999: 5_000_000,
      9999: 10_000_000
    }
    const tokens = tokenMap[amount || 999] || 1_000_000

    await prisma.token_member_registry.create({
      data: {
        token_symbol: 'BOASE',
        member_name: email,
        email: email.toLowerCase(),
        allocation_tokens: tokens,
        allocation_percentage: equity,
        status: 'pending',
        is_public: false,
        notes: `Interest registered ${new Date().toISOString()} - ${tier || 'supporter'} tier`,
        price_per_token: (amount || 999) / tokens
      }
    }).catch(() => {
      // Ignore if duplicate
    })

    return NextResponse.json({
      success: true,
      message: 'Interest registered successfully',
      investor_id: investor.id,
      tier,
      amount,
      tokens,
      next_steps: [
        'We will send the $BOASE Subscription Agreement to your email within 24 hours',
        'Review and sign the agreement',
        'Complete payment',
        'Receive your $BOASE token allocation'
      ]
    })
  } catch (error) {
    console.error('$BOASE interest registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register interest' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Return current raise status
    const investors = await prisma.investors.count({
      where: { status: { in: ['pending', 'confirmed', 'active'] } }
    })

    const confirmed = await prisma.investors.count({
      where: { status: { in: ['confirmed', 'active'] } }
    })

    const totalRaised = await prisma.investors.aggregate({
      where: { status: { in: ['confirmed', 'active'] } },
      _sum: { investment_amount: true }
    })

    return NextResponse.json({
      token: 'BOASE',
      total_supply: 1_000_000_000,
      interested_investors: investors,
      confirmed_investors: confirmed,
      total_raised_gbp: Number(totalRaised._sum.investment_amount) || 0
    })
  } catch {
    return NextResponse.json({
      token: 'BOASE',
      total_supply: 1_000_000_000,
      interested_investors: 0,
      confirmed_investors: 0,
      total_raised_gbp: 0
    })
  }
}
