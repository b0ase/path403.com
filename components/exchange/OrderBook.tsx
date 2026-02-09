'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface OrderBookEntry {
  price_sats: number
  total_amount: number
  order_count: number
}

interface OrderBookData {
  token_id: string
  token_symbol: string
  bids: OrderBookEntry[]
  asks: OrderBookEntry[]
  spread: number | null
  last_trade_price?: number
  last_updated: string
}

interface OrderBookProps {
  tokenId: string
  tokenSymbol: string
  refreshInterval?: number  // ms
}

export function OrderBook({
  tokenId,
  tokenSymbol,
  refreshInterval = 5000
}: OrderBookProps) {
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrderBook = async () => {
    try {
      const res = await fetch(`/api/exchange/match?token_id=${tokenId}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch order book')
      }

      setOrderBook(data.order_book)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrderBook()
    const interval = setInterval(fetchOrderBook, refreshInterval)
    return () => clearInterval(interval)
  }, [tokenId, refreshInterval])

  // Calculate max volume for bar sizing
  const maxBidVolume = orderBook?.bids.reduce((max, b) => Math.max(max, b.total_amount), 0) || 1
  const maxAskVolume = orderBook?.asks.reduce((max, a) => Math.max(max, a.total_amount), 0) || 1
  const maxVolume = Math.max(maxBidVolume, maxAskVolume)

  if (isLoading) {
    return (
      <div className="border border-white/10 rounded-xl bg-gray-900/30 p-6 animate-pulse">
        <div className="h-6 bg-gray-800 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-800 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="border border-white/10 rounded-xl bg-gray-900/30 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <h3 className="font-bold">Order Book</h3>
        {orderBook?.spread !== null && (
          <span className="text-xs text-gray-500">
            Spread: {orderBook?.spread?.toLocaleString()} sats
          </span>
        )}
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 gap-2 px-4 py-2 text-xs text-gray-500 uppercase border-b border-white/10">
        <div>Price (sats)</div>
        <div className="text-right">Amount</div>
        <div className="text-right">Total</div>
      </div>

      {error ? (
        <div className="p-6 text-center text-red-400 text-sm">{error}</div>
      ) : (
        <>
          {/* Asks (Sells) - sorted high to low for display */}
          <div className="max-h-48 overflow-y-auto">
            {orderBook?.asks.slice().reverse().map((ask, i) => (
              <motion.div
                key={`ask-${ask.price_sats}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="relative grid grid-cols-3 gap-2 px-4 py-2 hover:bg-white/5"
              >
                {/* Background bar */}
                <div
                  className="absolute inset-y-0 right-0 bg-red-500/10"
                  style={{ width: `${(ask.total_amount / maxVolume) * 100}%` }}
                />
                <div className="relative text-red-400 font-mono">
                  {ask.price_sats.toLocaleString()}
                </div>
                <div className="relative text-right font-mono text-gray-300">
                  {ask.total_amount.toLocaleString()}
                </div>
                <div className="relative text-right font-mono text-gray-500 text-sm">
                  {(ask.price_sats * ask.total_amount).toLocaleString()}
                </div>
              </motion.div>
            ))}
            {(!orderBook?.asks || orderBook.asks.length === 0) && (
              <div className="px-4 py-4 text-center text-gray-500 text-sm">
                No sell orders
              </div>
            )}
          </div>

          {/* Spread / Last Trade */}
          <div className="px-4 py-3 border-y border-white/10 bg-gray-900/50">
            {orderBook?.last_trade_price ? (
              <div className="text-center">
                <span className="text-xs text-gray-500 mr-2">Last:</span>
                <span className="font-mono font-bold text-lg">
                  {orderBook.last_trade_price.toLocaleString()} sats
                </span>
              </div>
            ) : (
              <div className="text-center text-gray-500 text-sm">No trades yet</div>
            )}
          </div>

          {/* Bids (Buys) */}
          <div className="max-h-48 overflow-y-auto">
            {orderBook?.bids.map((bid, i) => (
              <motion.div
                key={`bid-${bid.price_sats}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="relative grid grid-cols-3 gap-2 px-4 py-2 hover:bg-white/5"
              >
                {/* Background bar */}
                <div
                  className="absolute inset-y-0 right-0 bg-green-500/10"
                  style={{ width: `${(bid.total_amount / maxVolume) * 100}%` }}
                />
                <div className="relative text-green-400 font-mono">
                  {bid.price_sats.toLocaleString()}
                </div>
                <div className="relative text-right font-mono text-gray-300">
                  {bid.total_amount.toLocaleString()}
                </div>
                <div className="relative text-right font-mono text-gray-500 text-sm">
                  {(bid.price_sats * bid.total_amount).toLocaleString()}
                </div>
              </motion.div>
            ))}
            {(!orderBook?.bids || orderBook.bids.length === 0) && (
              <div className="px-4 py-4 text-center text-gray-500 text-sm">
                No buy orders
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer */}
      <div className="p-2 border-t border-white/10 text-center">
        <span className="text-xs text-gray-500">
          Updated: {orderBook ? new Date(orderBook.last_updated).toLocaleTimeString() : '-'}
        </span>
      </div>
    </div>
  )
}
