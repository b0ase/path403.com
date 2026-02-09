'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiX, FiClock } from 'react-icons/fi'

interface Order {
  id: string
  token_id: string
  token_symbol: string
  side: 'buy' | 'sell'
  amount: number
  price_sats: number
  filled_amount: number
  status: 'open' | 'partial' | 'filled' | 'cancelled'
  created_at: string
}

interface OpenOrdersProps {
  refreshInterval?: number
  onOrderCancelled?: () => void
}

export function OpenOrders({
  refreshInterval = 10000,
  onOrderCancelled
}: OpenOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/exchange/orders?user_orders_only=true&status=open')
      const data = await res.json()

      if (res.ok && data.orders) {
        // Include both open and partial orders
        const activeOrders = data.orders.filter(
          (o: Order) => o.status === 'open' || o.status === 'partial'
        )
        setOrders(activeOrders)
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const cancelOrder = async (orderId: string) => {
    setCancellingId(orderId)
    try {
      const res = await fetch(`/api/exchange/orders/${orderId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== orderId))
        onOrderCancelled?.()
      }
    } catch (err) {
      console.error('Failed to cancel order:', err)
    } finally {
      setCancellingId(null)
    }
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval])

  if (isLoading) {
    return (
      <div className="border border-white/10 rounded-xl bg-gray-900/30 p-6 animate-pulse">
        <div className="h-6 bg-gray-800 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-800 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="border border-white/10 rounded-xl bg-gray-900/30 overflow-hidden">
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <h3 className="font-bold">Open Orders</h3>
        <span className="text-xs text-gray-500">{orders.length} active</span>
      </div>

      {orders.length === 0 ? (
        <div className="p-6 text-center text-gray-500 text-sm">
          <FiClock className="mx-auto text-2xl mb-2 text-gray-600" />
          No open orders
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {orders.map((order) => {
            const remaining = order.amount - order.filled_amount
            const percentFilled = (order.filled_amount / order.amount) * 100

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-4 hover:bg-white/5"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-xs font-bold rounded ${
                        order.side === 'buy'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {order.side.toUpperCase()}
                    </span>
                    <span className="font-mono font-bold">{order.token_symbol}</span>
                  </div>
                  <button
                    onClick={() => cancelOrder(order.id)}
                    disabled={cancellingId === order.id}
                    className="p-1 text-gray-500 hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Cancel Order"
                  >
                    {cancellingId === order.id ? (
                      <span className="text-xs">...</span>
                    ) : (
                      <FiX size={16} />
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-gray-500">Price</div>
                    <div className="font-mono">{order.price_sats.toLocaleString()} sats</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Amount</div>
                    <div className="font-mono">
                      {remaining.toLocaleString()} / {order.amount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Total</div>
                    <div className="font-mono">
                      {(remaining * order.price_sats).toLocaleString()} sats
                    </div>
                  </div>
                </div>

                {/* Fill Progress */}
                {order.status === 'partial' && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Filled</span>
                      <span>{percentFilled.toFixed(1)}%</span>
                    </div>
                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          order.side === 'buy' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${percentFilled}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-2 text-xs text-gray-600">
                  {new Date(order.created_at).toLocaleString()}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
