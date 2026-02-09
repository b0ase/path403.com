'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiCircle } from 'react-icons/fi'
import { useAuth } from '@/components/Providers'
import { useRouter } from 'next/navigation'

export default function MintPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [tokens, setTokens] = useState<any[]>([])
  const [mintLogs, setMintLogs] = useState<any[]>([])

  const [formData, setFormData] = useState({
    token_symbol: '',
    amount: '',
    recipient_address: '',
    blockchain: 'bsv',
    notes: '',
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (user) {
      fetch('/api/registry/tokens')
        .then((res) => res.json())
        .then((data) => {
          if (data.tokens) {
            setTokens(data.tokens)
          }
        })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      const res = await fetch('/api/tokens/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenSymbol: formData.token_symbol,
          amount: parseInt(formData.amount),
          source: 'manual_mint',
          sourceReference: `mint_tool_${Date.now()}`,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: `Minted ${formData.amount} ${formData.token_symbol} successfully!` })
        setFormData({ token_symbol: '', amount: '', recipient_address: '', blockchain: 'bsv', notes: '' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to mint tokens' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>
  }

  return (
    <motion.div
      className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-mono"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.section className="px-4 md:px-8 py-16">
        <div className="max-w-pillar mx-auto">
          <motion.div className="mb-8 border-b border-zinc-900 pb-8">
            <div className="flex items-start gap-6">
              <div className="bg-gray-900/50 p-4 border border-gray-800 rounded-pillar">
                <FiCircle className="text-4xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">
                  MINT<span className="text-zinc-800">.OPS</span>
                </h1>
                <p className="text-zinc-500 uppercase text-xs tracking-widest">Digital Asset Issuance Protocol</p>
              </div>
            </div>
          </motion.div>

          {message && (
            <div
              className={`mb-6 p-4 border rounded-pillar text-xs tracking-widest uppercase transition-all ${message.type === 'success' ? 'bg-green-950/20 border-green-900 text-green-500' : 'bg-red-950/20 border-red-900 text-red-500'
                }`}
            >
              [{message.type === 'success' ? 'SUCCESS' : 'ERROR'}]: {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 mb-12">
            <div>
              <label className="block text-sm font-bold text-white mb-2">Token *</label>
              <select
                value={formData.token_symbol}
                onChange={(e) => setFormData({ ...formData, token_symbol: e.target.value })}
                required
                className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar placeholder:text-zinc-800 transition-colors"
              >
                <option value="">Select token...</option>
                {tokens.map((token) => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.symbol} - {token.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">Amount *</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                min="1"
                className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar placeholder:text-zinc-800 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">Recipient Address (optional)</label>
              <input
                type="text"
                value={formData.recipient_address}
                onChange={(e) => setFormData({ ...formData, recipient_address: e.target.value })}
                placeholder="Leave blank to mint to yourself"
                className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar placeholder:text-zinc-800 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">Blockchain</label>
              <select
                value={formData.blockchain}
                onChange={(e) => setFormData({ ...formData, blockchain: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar placeholder:text-zinc-800 transition-colors"
              >
                <option value="bsv">Bitcoin SV (BSV)</option>
                <option value="eth">Ethereum (ETH)</option>
                <option value="sol">Solana (SOL)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white h-24 rounded-pillar"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-white text-black py-4 font-bold uppercase tracking-widest text-sm hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-pillar transition-all"
            >
              {submitting ? 'EXECUTING_ISSUANCE...' : 'EXECUTE_MINT'}
            </button>
          </form>

          <div className="border border-zinc-800 p-6 bg-zinc-950 rounded-pillar">
            <h2 className="text-xl font-bold mb-4">Recent Mints</h2>
            <p className="text-zinc-500 text-sm">Minting history will appear here after transactions.</p>
          </div>
        </div>
      </motion.section>
    </motion.div>
  )
}
