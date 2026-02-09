/**
 * Exchange Order by ID API
 * GET - Get order details
 * DELETE - Cancel order
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  unlockSatsForCancelledOrder,
  unlockTokensForCancelledOrder
} from '@/lib/exchange'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: order, error } = await supabase
      .from('exchange_orders')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Order fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch the order
    const { data: order, error: fetchError } = await supabase
      .from('exchange_orders')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Verify ownership
    if (order.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Can only cancel open or partial orders
    if (!['open', 'partial'].includes(order.status)) {
      return NextResponse.json(
        { error: `Cannot cancel order with status: ${order.status}` },
        { status: 400 }
      )
    }

    // Calculate remaining unfilled amount
    const remainingAmount = order.amount - order.filled_amount
    const remainingSats = remainingAmount * order.price_sats

    // Unlock funds based on order side
    if (order.side === 'buy') {
      const unlockResult = await unlockSatsForCancelledOrder(user.id, remainingSats)
      if (!unlockResult.success) {
        console.error('Failed to unlock sats:', unlockResult.error)
      }
    } else {
      const unlockResult = await unlockTokensForCancelledOrder(
        user.id,
        order.token_id,
        remainingAmount
      )
      if (!unlockResult.success) {
        console.error('Failed to unlock tokens:', unlockResult.error)
      }
    }

    // Update order status to cancelled
    const { error: updateError } = await supabase
      .from('exchange_orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) {
      console.error('Order cancellation failed:', updateError)
      return NextResponse.json(
        { error: 'Failed to cancel order' },
        { status: 500 }
      )
    }

    // Remove from match queue
    await supabase
      .from('exchange_match_queue')
      .delete()
      .eq('order_id', id)

    return NextResponse.json({
      success: true,
      message: 'Order cancelled',
      unlocked: order.side === 'buy'
        ? { sats: remainingSats }
        : { tokens: remainingAmount, token_id: order.token_id }
    })
  } catch (error) {
    console.error('Order cancel error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
