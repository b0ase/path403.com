/**
 * POST /api/invest/kintsugi/interest
 *
 * Register investor interest in $KINTSUGI token.
 * Saves email and sends confirmation.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'

const prisma = getPrisma()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, amount } = body as {
      email: string
      name?: string
      amount?: number
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Check if already registered interest
    const existing = await prisma.investors.findFirst({
      where: { email: email.toLowerCase() }
    })

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Interest already registered',
        investor_id: existing.id
      })
    }

    // Create new investor record with pending status
    const investor = await prisma.investors.create({
      data: {
        name: name || 'Interested Party',
        email: email.toLowerCase(),
        investment_amount: amount || 999,
        equity_percentage: 1.0,
        investment_tier: 'seed',
        status: 'pending',
        notes: 'Interest registered via /invest/kintsugi page'
      }
    })

    // Also add to token_member_registry with pending status
    await prisma.token_member_registry.create({
      data: {
        token_symbol: 'KINTSUGI',
        member_name: name || email,
        email: email.toLowerCase(),
        allocation_tokens: 10000000, // 10M = 1%
        allocation_percentage: 1.0,
        status: 'pending',
        is_public: false,
        notes: `Interest registered ${new Date().toISOString()}`,
        price_per_token: 0.0000999 // £999 / 10M tokens
      }
    }).catch(() => {
      // Ignore if already exists
    })

    // TODO: Send confirmation email

    return NextResponse.json({
      success: true,
      message: 'Interest registered successfully',
      investor_id: investor.id,
      next_steps: [
        'We will send the subscription agreement to your email within 24 hours',
        'Review and sign the agreement',
        'Complete payment (£999)',
        'Receive your $KINTSUGI token allocation'
      ]
    })
  } catch (error) {
    console.error('Interest registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register interest' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return current raise status (public info only)
  try {
    const stats = await prisma.token_member_registry.groupBy({
      by: ['status'],
      where: { token_symbol: 'KINTSUGI' },
      _sum: { allocation_percentage: true },
      _count: { id: true }
    })

    const totalAllocated = stats.reduce((sum, s) =>
      sum + (Number(s._sum.allocation_percentage) || 0), 0
    )

    const confirmedInvestors = stats.find(s => s.status === 'confirmed')?._count?.id || 0
    const pendingInvestors = stats.find(s => s.status === 'pending')?._count?.id || 0

    return NextResponse.json({
      token: 'KINTSUGI',
      total_supply: 1000000000,
      price_per_percent: 999,
      investor_pool_total: 10, // 10%
      investor_pool_remaining: Math.max(0, 10 - totalAllocated + 90), // Rough calc
      confirmed_investors: confirmedInvestors,
      pending_investors: pendingInvestors
    })
  } catch {
    return NextResponse.json({
      token: 'KINTSUGI',
      total_supply: 1000000000,
      price_per_percent: 999,
      investor_pool_total: 10,
      investor_pool_remaining: 10,
      confirmed_investors: 0,
      pending_investors: 0
    })
  }
}
