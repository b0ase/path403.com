'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface OrderFormProps {
  tokenId: string
  tokenSymbol: string
  currentPrice?: number
  userBalance?: {
    sats: number
    tokens: number
  }
  onOrderCreated?: (order: any) => void
}

export function OrderForm({
  tokenId,
  tokenSymbol,
  currentPrice = 100,
  userBalance = { sats: 0, tokens: 0 },
  onOrderCreated
}: OrderFormProps) {
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = useState('')
  const [price, setPrice] = useState(currentPrice.toString())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const numAmount = parseInt(amount) || 0
  const numPrice = parseInt(price) || 0
  const totalSats = numAmount * numPrice

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (numAmount <= 0) {
      setError('Amount must be greater than 0')
      return
    }

    if (numPrice <= 0) {
      setError('Price must be greater than 0')
      return
    }

    // Validate balance
    if (side === 'buy' && totalSats > userBalance.sats) {
      setError(`Insufficient balance. Need ${totalSats.toLocaleString()} sats`)
      return
    }

    if (side === 'sell' && numAmount > userBalance.tokens) {
      setError(`Insufficient ${tokenSymbol}. Have ${userBalance.tokens.toLocaleString()}`)
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/exchange/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token_id: tokenId,
          token_symbol: tokenSymbol,
          side,
          amount: numAmount,
          price_sats: numPrice
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create order')
      }

      setSuccess(
        `${side.toUpperCase()} order created! ` +
        `${data.matching?.trades_executed || 0} trades executed.`
      )
      setAmount('')
      onOrderCreated?.(data.order)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="border border-white/10 rounded-xl bg-gray-900/30 p-6">
      <h3 className="text-lg font-bold mb-4">Place Order</h3>

      {/* Buy/Sell Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setSide('buy')}
          className={`flex-1 py-3 font-bold transition-colors ${
            side === 'buy'
              ? 'bg-green-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          BUY
        </button>
        <button
          type="button"
          onClick={() => setSide('sell')}
          className={`flex-1 py-3 font-bold transition-colors ${
            side === 'sell'
              ? 'bg-red-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          SELL
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-2">
            Amount ({tokenSymbol})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            min="1"
            className="w-full bg-gray-800 border border-white/10 rounded px-4 py-3 font-mono text-lg focus:outline-none focus:border-white/30"
          />
          {side === 'sell' && (
            <div className="text-xs text-gray-500 mt-1">
              Available: {userBalance.tokens.toLocaleString()} {tokenSymbol}
            </div>
          )}
        </div>

        {/* Price Input */}
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-2">
            Price (sats per token)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="100"
            min="1"
            className="w-full bg-gray-800 border border-white/10 rounded px-4 py-3 font-mono text-lg focus:outline-none focus:border-white/30"
          />
        </div>

        {/* Total */}
        <div className="border-t border-white/10 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total</span>
            <span className="font-mono font-bold">{totalSats.toLocaleString()} sats</span>
          </div>
          {side === 'buy' && (
            <div className="text-xs text-gray-500 mt-1 text-right">
              Available: {userBalance.sats.toLocaleString()} sats
            </div>
          )}
        </div>

        {/* Error/Success Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-500/20 border border-red-500/50 text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-green-500/20 border border-green-500/50 text-green-400 text-sm"
          >
            {success}
          </motion.div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !numAmount || !numPrice}
          className={`w-full py-4 font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            side === 'buy'
              ? 'bg-green-600 hover:bg-green-500 text-white'
              : 'bg-red-600 hover:bg-red-500 text-white'
          }`}
        >
          {isSubmitting ? 'Processing...' : `${side.toUpperCase()} ${tokenSymbol}`}
        </button>
      </form>
    </div>
  )
}
