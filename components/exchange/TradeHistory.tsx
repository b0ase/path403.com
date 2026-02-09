'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi'

interface Trade {
  id: string
  token_id: string
  token_symbol: string
  amount: number
  price_sats: number
  total_sats: number
  buyer_id: string
  buyer_handle?: string | null
  seller_id: string
  seller_handle?: string | null
  executed_at: string
  settlement_type: 'offchain' | 'onchain' | 'pending'
}

interface TradeHistoryProps {
  tokenId?: string
  userTradesOnly?: boolean
  limit?: number
  refreshInterval?: number
}

export function TradeHistory({
  tokenId,
  userTradesOnly = false,
  limit = 20,
  refreshInterval = 10000
}: TradeHistoryProps) {
  const [trades, setTrades] = useState<Trade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<{
    volume_24h_sats: number
    trade_count_24h: number
  }>({ volume_24h_sats: 0, trade_count_24h: 0 })

  const fetchTrades = async () => {
    try {
      const params = new URLSearchParams()
      if (tokenId) params.set('token_id', tokenId)
      if (userTradesOnly) params.set('user_trades_only', 'true')
      params.set('limit', limit.toString())

      const res = await fetch(`/api/exchange/trades?${params}`)
      const data = await res.json()

      if (res.ok) {
        setTrades(data.trades || [])
        setStats(data.stats || { volume_24h_sats: 0, trade_count_24h: 0 })
      }
    } catch (err) {
      console.error('Failed to fetch trades:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTrades()
    const interval = setInterval(fetchTrades, refreshInterval)
    return () => clearInterval(interval)
  }, [tokenId, userTradesOnly, limit, refreshInterval])

  // Determine price direction between consecutive trades
  const getPriceDirection = (index: number): 'up' | 'down' | 'neutral' => {
    if (index >= trades.length - 1) return 'neutral'
    const current = trades[index].price_sats
    const previous = trades[index + 1].price_sats
    if (current > previous) return 'up'
    if (current < previous) return 'down'
    return 'neutral'
  }

  if (isLoading) {
    return (
      <div className="border border-white/10 rounded-xl bg-gray-900/30 p-6 animate-pulse">
        <div className="h-6 bg-gray-800 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-800 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="border border-white/10 rounded-xl bg-gray-900/30 overflow-hidden">
      {/* Header with Stats */}
      <div className="p-4 border-b border-white/10">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold">Recent Trades</h3>
          <span className="text-xs text-gray-500">{trades.length} trades</span>
        </div>
        <div className="flex gap-4 text-xs">
          <div>
            <span className="text-gray-500">24h Volume: </span>
            <span className="font-mono text-gray-300">
              {stats.volume_24h_sats.toLocaleString()} sats
            </span>
          </div>
          <div>
            <span className="text-gray-500">24h Trades: </span>
            <span className="font-mono text-gray-300">{stats.trade_count_24h}</span>
          </div>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-4 gap-2 px-4 py-2 text-xs text-gray-500 uppercase border-b border-white/10">
        <div>Price</div>
        <div className="text-right">Amount</div>
        <div className="text-right">Total</div>
        <div className="text-right">Time</div>
      </div>

      {trades.length === 0 ? (
        <div className="p-6 text-center text-gray-500 text-sm">
          No trades yet
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto">
          {trades.map((trade, i) => {
            const direction = getPriceDirection(i)

            return (
              <motion.div
                key={trade.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="grid grid-cols-4 gap-2 px-4 py-2 hover:bg-white/5 border-b border-white/5"
              >
                <div className="flex items-center gap-1">
                  {direction === 'up' && (
                    <FiTrendingUp className="text-green-400" size={12} />
                  )}
                  {direction === 'down' && (
                    <FiTrendingDown className="text-red-400" size={12} />
                  )}
                  <span
                    className={`font-mono ${
                      direction === 'up'
                        ? 'text-green-400'
                        : direction === 'down'
                        ? 'text-red-400'
                        : 'text-gray-300'
                    }`}
                  >
                    {trade.price_sats.toLocaleString()}
                  </span>
                </div>
                <div className="text-right font-mono text-gray-300">
                  {trade.amount.toLocaleString()}
                </div>
                <div className="text-right font-mono text-gray-500">
                  {trade.total_sats.toLocaleString()}
                </div>
                <div className="text-right text-xs text-gray-500">
                  {new Date(trade.executed_at).toLocaleTimeString()}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
