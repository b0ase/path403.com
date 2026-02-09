'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiSend } from 'react-icons/fi'
import { useAuth } from '@/components/Providers'
import { useRouter } from 'next/navigation'

export default function TransferPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [transactions, setTransactions] = useState<any[]>([])

  const [formData, setFormData] = useState({
    from_shareholder_id: '',
    to_shareholder_id: '',
    token_amount: '',
    transaction_type: 'sale',
    purpose: '',
    notes: '',
  })

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [loading, user, router])

  useEffect(() => {
    if (user) {
      fetch('/api/transfers')
        .then((res) => res.json())
        .then((data) => setTransactions(data.transactions || []))
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          token_amount: parseFloat(formData.token_amount),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: 'Transfer completed successfully' })
        setFormData({
          from_shareholder_id: '',
          to_shareholder_id: '',
          token_amount: '',
          transaction_type: 'sale',
          purpose: '',
          notes: '',
        })
        window.location.reload()
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>

  return (
    <motion.div className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.section className="px-4 md:px-8 py-16">
        <div className="max-w-pillar mx-auto">

          <motion.div className="mb-8 border-b border-zinc-900 pb-8">
            <div className="flex items-start gap-6">
              <div className="bg-gray-900/50 p-4 border border-gray-800 rounded-pillar">
                <FiSend className="text-4xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">
                  TRANSFER<span className="text-zinc-800">.OPS</span>
                </h1>
                <p className="text-zinc-500 uppercase text-xs tracking-widest">Digital Asset Handover Protocol</p>
              </div>
            </div>
          </motion.div>

          {message && (
            <div className={`mb-6 p-4 border rounded-pillar text-xs tracking-widest uppercase transition-all ${message.type === 'success' ? 'bg-green-950/20 border-green-900 text-green-500' : 'bg-red-950/20 border-red-900 text-red-500'
              }`}>
              [{message.type === 'success' ? 'SUCCESS' : 'ERROR'}]: {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mb-12 border border-zinc-800 p-6 bg-zinc-950 space-y-6 rounded-pillar">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-white mb-2">From Shareholder ID *</label>
                <input
                  type="text"
                  value={formData.from_shareholder_id}
                  onChange={(e) => setFormData({ ...formData, from_shareholder_id: e.target.value })}
                  required
                  className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar placeholder:text-zinc-800 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">To Shareholder ID *</label>
                <input
                  type="text"
                  value={formData.to_shareholder_id}
                  onChange={(e) => setFormData({ ...formData, to_shareholder_id: e.target.value })}
                  required
                  className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar placeholder:text-zinc-800 transition-colors"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Token Amount *</label>
                <input
                  type="number"
                  value={formData.token_amount}
                  onChange={(e) => setFormData({ ...formData, token_amount: e.target.value })}
                  required
                  className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar placeholder:text-zinc-800 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Transaction Type</label>
                <select
                  value={formData.transaction_type}
                  onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value })}
                  className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar placeholder:text-zinc-800 transition-colors"
                >
                  <option value="sale">Sale</option>
                  <option value="gift">Gift</option>
                  <option value="vesting_release">Vesting Release</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">Purpose</label>
              <input
                type="text"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar placeholder:text-zinc-800 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white h-24"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-white text-black py-4 font-bold uppercase tracking-widest text-sm hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-pillar transition-all"
            >
              {submitting ? 'EXECUTING_HANDOVER...' : 'EXECUTE_TRANSFER'}
            </button>
          </form>

          <div className="border border-zinc-800 rounded-pillar overflow-hidden">
            <div className="bg-zinc-900 p-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="font-bold uppercase text-[10px] tracking-widest text-zinc-500">TRANSFER_LOG_01</h2>
              <div className="flex gap-2">
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-zinc-800 rounded-full"></div>
              </div>
            </div>
            <div className="bg-zinc-950 p-6">
              {transactions.length === 0 ? (
                <p className="text-zinc-500 text-sm">No transfers yet</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-900">
                      <th className="text-left p-2 font-bold uppercase text-xs">Type</th>
                      <th className="text-right p-2 font-bold uppercase text-xs">Amount</th>
                      <th className="text-right p-2 font-bold uppercase text-xs">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 10).map((tx: any) => (
                      <tr key={tx.id} className="border-b border-zinc-900">
                        <td className="p-2">{tx.transaction_type}</td>
                        <td className="p-2 text-right font-mono">{Number(tx.token_amount).toLocaleString()}</td>
                        <td className="p-2 text-right text-zinc-500">{new Date(tx.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  )
}
