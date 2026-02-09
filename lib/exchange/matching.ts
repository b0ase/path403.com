/**
 * Exchange Order Matching Engine
 *
 * Implements price-time priority matching algorithm:
 * 1. Get all open buy orders (highest price first)
 * 2. Get all open sell orders (lowest price first)
 * 3. Match where buy_price >= sell_price
 * 4. Execute at sell_price (price improvement for buyer)
 * 5. Partial fills allowed
 */

import { createClient } from '@/lib/supabase/server'
import { ExchangeOrder, OrderMatch, MatchResult, OrderBook, OrderBookEntry } from './types'
import { settleTrade } from './settlement'

/**
 * Find matching orders for a specific token
 */
export async function findMatches(
  tokenId: string,
  maxMatches: number = 10
): Promise<OrderMatch[]> {
  const supabase = await createClient()
  const matches: OrderMatch[] = []

  // Get open buy orders (highest price first, oldest first for same price)
  const { data: buyOrders, error: buyError } = await supabase
    .from('exchange_orders')
    .select('*')
    .eq('token_id', tokenId)
    .eq('side', 'buy')
    .in('status', ['open', 'partial'])
    .order('price_sats', { ascending: false })
    .order('created_at', { ascending: true })

  if (buyError || !buyOrders?.length) {
    return matches
  }

  // Get open sell orders (lowest price first, oldest first for same price)
  const { data: sellOrders, error: sellError } = await supabase
    .from('exchange_orders')
    .select('*')
    .eq('token_id', tokenId)
    .eq('side', 'sell')
    .in('status', ['open', 'partial'])
    .order('price_sats', { ascending: true })
    .order('created_at', { ascending: true })

  if (sellError || !sellOrders?.length) {
    return matches
  }

  // Match orders using price-time priority
  for (const buyOrder of buyOrders) {
    if (matches.length >= maxMatches) break

    const buyRemaining = buyOrder.amount - buyOrder.filled_amount
    if (buyRemaining <= 0) continue

    for (const sellOrder of sellOrders) {
      if (matches.length >= maxMatches) break

      // Skip if same user (no self-trading)
      if (buyOrder.user_id === sellOrder.user_id) continue

      const sellRemaining = sellOrder.amount - sellOrder.filled_amount
      if (sellRemaining <= 0) continue

      // Check if prices cross (buy price >= sell price)
      if (buyOrder.price_sats >= sellOrder.price_sats) {
        const matchAmount = Math.min(buyRemaining, sellRemaining)

        matches.push({
          buyOrder: buyOrder as ExchangeOrder,
          sellOrder: sellOrder as ExchangeOrder,
          matchAmount,
          matchPrice: sellOrder.price_sats  // Execute at sell price (price improvement)
        })
      }
    }
  }

  return matches
}

/**
 * Execute a single match - update orders and create trade
 */
export async function executeMatch(match: OrderMatch): Promise<{
  success: boolean
  trade?: { id: string }
  error?: string
}> {
  const supabase = await createClient()
  const { buyOrder, sellOrder, matchAmount, matchPrice } = match
  const totalSats = matchAmount * matchPrice

  try {
    // Update buy order
    const newBuyFilled = buyOrder.filled_amount + matchAmount
    const buyStatus = newBuyFilled >= buyOrder.amount ? 'filled' : 'partial'

    const { error: buyUpdateError } = await supabase
      .from('exchange_orders')
      .update({
        filled_amount: newBuyFilled,
        status: buyStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', buyOrder.id)

    if (buyUpdateError) throw new Error(`Buy order update failed: ${buyUpdateError.message}`)

    // Update sell order
    const newSellFilled = sellOrder.filled_amount + matchAmount
    const sellStatus = newSellFilled >= sellOrder.amount ? 'filled' : 'partial'

    const { error: sellUpdateError } = await supabase
      .from('exchange_orders')
      .update({
        filled_amount: newSellFilled,
        status: sellStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', sellOrder.id)

    if (sellUpdateError) throw new Error(`Sell order update failed: ${sellUpdateError.message}`)

    // Create trade record
    const { data: trade, error: tradeError } = await supabase
      .from('exchange_trades')
      .insert({
        buy_order_id: buyOrder.id,
        sell_order_id: sellOrder.id,
        token_id: buyOrder.token_id,
        token_symbol: buyOrder.token_symbol,
        amount: matchAmount,
        price_sats: matchPrice,
        total_sats: totalSats,
        buyer_id: buyOrder.user_id,
        buyer_handle: buyOrder.user_handle,
        seller_id: sellOrder.user_id,
        seller_handle: sellOrder.user_handle,
        settlement_type: 'pending'
      })
      .select('id')
      .single()

    if (tradeError) throw new Error(`Trade creation failed: ${tradeError.message}`)

    // Settle the trade (transfer balances)
    const settleResult = await settleTrade({
      tradeId: trade.id,
      buyerId: buyOrder.user_id,
      sellerId: sellOrder.user_id,
      tokenId: buyOrder.token_id,
      tokenSymbol: buyOrder.token_symbol,
      amount: matchAmount,
      totalSats
    })

    if (!settleResult.success) {
      console.error('Settlement failed:', settleResult.error)
      // Trade still created, but marked as pending settlement
    }

    return { success: true, trade: { id: trade.id } }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Match execution failed:', message)
    return { success: false, error: message }
  }
}

/**
 * Run matching for a token - find and execute all matches
 */
export async function runMatching(
  tokenId: string,
  maxMatches: number = 10
): Promise<MatchResult> {
  const result: MatchResult = {
    success: true,
    matches: [],
    tradesExecuted: [],
    errors: []
  }

  try {
    // Find matching orders
    const matches = await findMatches(tokenId, maxMatches)
    result.matches = matches

    if (matches.length === 0) {
      return result
    }

    // Execute each match
    for (const match of matches) {
      const execResult = await executeMatch(match)

      if (execResult.success && execResult.trade) {
        result.tradesExecuted.push({
          id: execResult.trade.id,
          buy_order_id: match.buyOrder.id,
          sell_order_id: match.sellOrder.id,
          token_id: match.buyOrder.token_id,
          token_symbol: match.buyOrder.token_symbol,
          amount: match.matchAmount,
          price_sats: match.matchPrice,
          total_sats: match.matchAmount * match.matchPrice,
          buyer_id: match.buyOrder.user_id,
          seller_id: match.sellOrder.user_id,
          executed_at: new Date().toISOString(),
          settlement_type: 'offchain'
        })
      } else if (execResult.error) {
        result.errors.push(execResult.error)
      }
    }

    result.success = result.errors.length === 0
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    result.success = false
    result.errors.push(message)
  }

  return result
}

/**
 * Get aggregated order book for a token
 */
export async function getOrderBook(tokenId: string): Promise<OrderBook> {
  const supabase = await createClient()

  // Get open buy orders aggregated by price
  const { data: buyData } = await supabase
    .from('exchange_orders')
    .select('price_sats, amount, filled_amount, token_symbol')
    .eq('token_id', tokenId)
    .eq('side', 'buy')
    .in('status', ['open', 'partial'])
    .order('price_sats', { ascending: false })

  // Get open sell orders aggregated by price
  const { data: sellData } = await supabase
    .from('exchange_orders')
    .select('price_sats, amount, filled_amount, token_symbol')
    .eq('token_id', tokenId)
    .eq('side', 'sell')
    .in('status', ['open', 'partial'])
    .order('price_sats', { ascending: true })

  // Get last trade
  const { data: lastTrade } = await supabase
    .from('exchange_trades')
    .select('price_sats')
    .eq('token_id', tokenId)
    .order('executed_at', { ascending: false })
    .limit(1)
    .single()

  // Aggregate bids by price level
  const bidMap = new Map<number, { total: number; count: number }>()
  for (const order of buyData || []) {
    const remaining = order.amount - order.filled_amount
    const existing = bidMap.get(order.price_sats) || { total: 0, count: 0 }
    bidMap.set(order.price_sats, {
      total: existing.total + remaining,
      count: existing.count + 1
    })
  }

  // Aggregate asks by price level
  const askMap = new Map<number, { total: number; count: number }>()
  for (const order of sellData || []) {
    const remaining = order.amount - order.filled_amount
    const existing = askMap.get(order.price_sats) || { total: 0, count: 0 }
    askMap.set(order.price_sats, {
      total: existing.total + remaining,
      count: existing.count + 1
    })
  }

  const bids: OrderBookEntry[] = Array.from(bidMap.entries())
    .map(([price_sats, { total, count }]) => ({
      price_sats,
      total_amount: total,
      order_count: count
    }))
    .sort((a, b) => b.price_sats - a.price_sats)

  const asks: OrderBookEntry[] = Array.from(askMap.entries())
    .map(([price_sats, { total, count }]) => ({
      price_sats,
      total_amount: total,
      order_count: count
    }))
    .sort((a, b) => a.price_sats - b.price_sats)

  const bestBid = bids[0]?.price_sats
  const bestAsk = asks[0]?.price_sats
  const spread = bestBid && bestAsk ? bestAsk - bestBid : null

  const tokenSymbol = buyData?.[0]?.token_symbol || sellData?.[0]?.token_symbol || ''

  return {
    token_id: tokenId,
    token_symbol: tokenSymbol,
    bids,
    asks,
    spread,
    last_trade_price: lastTrade?.price_sats,
    last_updated: new Date().toISOString()
  }
}

/**
 * Queue an order for matching by Kintsugi
 */
export async function queueForMatching(orderId: string, tokenId: string): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('exchange_match_queue')
    .insert({
      order_id: orderId,
      token_id: tokenId,
      priority: 0,
      status: 'pending'
    })
}
