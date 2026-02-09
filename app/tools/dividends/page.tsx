'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiDollarSign } from 'react-icons/fi'
import { useAuth } from '@/components/Providers'
import { useRouter } from 'next/navigation'

export default function DividendsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [distributions, setDistributions] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    distribution_name: '',
    total_amount: '',
    eligible_tokens: '',
    currency: 'GBP',
    description: '',
  })

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [loading, user, router])

  useEffect(() => {
    if (user) {
      fetch('/api/dividends')
        .then((res) => res.json())
        .then((data) => {
          setDistributions(data.distributions || [])
          setSummary(data.summary)
        })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/dividends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          total_amount: parseFloat(formData.total_amount),
          eligible_tokens: parseFloat(formData.eligible_tokens),
        }),
      })

      if (res.ok) {
        setShowForm(false)
        setFormData({ distribution_name: '', total_amount: '', eligible_tokens: '', currency: 'GBP', description: '' })
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to create distribution:', error)
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
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-6">
                <div className="bg-gray-900/50 p-4 border border-gray-800 rounded-pillar">
                  <FiDollarSign className="text-4xl text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">
                    DIVIDENDS<span className="text-zinc-800">.SYS</span>
                  </h1>
                  <p className="text-zinc-500 uppercase text-xs tracking-widest">Autonomous Distribution Protocol</p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className={`px-4 py-2 font-bold uppercase text-xs tracking-widest border transition-all rounded-pillar ${showForm
                  ? 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  : 'bg-white text-black border-white hover:bg-zinc-200'
                  }`}
              >
                {showForm ? 'CLOSE_TERMINAL' : 'INIT_DISTRIBUTION'}
              </button>
            </div>
          </motion.div>

          {summary && (
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="border border-zinc-800 p-4 bg-zinc-950/50 rounded-pillar hover:border-zinc-700 transition-colors">
                <div className="text-zinc-600 text-[10px] uppercase tracking-widest mb-1">Total Distributions</div>
                <div className="text-2xl font-bold">{summary.totalDistributions}</div>
              </div>
              <div className="border border-zinc-800 p-4 bg-zinc-950/50 rounded-pillar hover:border-zinc-700 transition-colors">
                <div className="text-zinc-600 text-[10px] uppercase tracking-widest mb-1">Total Amount</div>
                <div className="text-2xl font-bold">£{summary.totalAmount.toLocaleString()}</div>
              </div>
              <div className="border border-zinc-800 p-4 bg-zinc-950/50 rounded-pillar hover:border-zinc-700 transition-colors">
                <div className="text-zinc-600 text-[10px] uppercase tracking-widest mb-1">Pending</div>
                <div className="text-2xl font-bold">{summary.pendingCount}</div>
              </div>
              <div className="border border-zinc-800 p-4 bg-zinc-950/50 rounded-pillar hover:border-zinc-700 transition-colors">
                <div className="text-zinc-600 text-[10px] uppercase tracking-widest mb-1">Completed</div>
                <div className="text-2xl font-bold">{summary.completedCount}</div>
              </div>
            </div>
          )}

          {showForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden">
              <form onSubmit={handleSubmit} className="border border-zinc-800 p-12 bg-zinc-950/50 mb-8 space-y-8 rounded-pillar relative group">
                <div className="absolute top-0 right-0 p-4 text-[10px] text-zinc-800 uppercase tracking-widest">
                  Terminal_01
                </div>
                <div className="space-y-6">
                  <h2 className="text-xs font-bold uppercase tracking-widest border-b border-zinc-900 pb-2 mb-4">
                    DISTRIBUTION_PARAMETERS
                  </h2>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="DISTRIBUTION_NAME"
                      value={formData.distribution_name}
                      onChange={(e) => setFormData({ ...formData, distribution_name: e.target.value })}
                      required
                      className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar placeholder:text-zinc-800"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        placeholder="TOTAL_AMOUNT"
                        value={formData.total_amount}
                        onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                        required
                        className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar placeholder:text-zinc-800"
                      />
                      <input
                        type="number"
                        placeholder="ELIGIBLE_TOKENS"
                        value={formData.eligible_tokens}
                        onChange={(e) => setFormData({ ...formData, eligible_tokens: e.target.value })}
                        required
                        className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar placeholder:text-zinc-800"
                      />
                    </div>
                    <textarea
                      placeholder="DESCRIPTION_NULLABLE"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white h-24 rounded-pillar placeholder:text-zinc-800"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-white text-black py-4 font-bold uppercase tracking-widest text-sm hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-pillar transition-all"
                >
                  {submitting ? 'EXECUTING_PROTOCOL...' : 'EXECUTE_DISTRIBUTION'}
                </button>
              </form>
            </motion.div>
          )}

          <div className="border border-zinc-800 rounded-pillar overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900 border-b border-zinc-800">
                <tr>
                  <th className="text-left p-4 font-bold uppercase text-xs">Name</th>
                  <th className="text-right p-4 font-bold uppercase text-xs">Amount</th>
                  <th className="text-right p-4 font-bold uppercase text-xs">Per Token</th>
                  <th className="text-center p-4 font-bold uppercase text-xs">Status</th>
                </tr>
              </thead>
              <tbody className="bg-zinc-950">
                {distributions.map((dist: any) => (
                  <tr key={dist.id} className="border-b border-zinc-900">
                    <td className="p-4">{dist.distribution_name}</td>
                    <td className="p-4 text-right font-mono">{dist.currency}{Number(dist.total_amount).toLocaleString()}</td>
                    <td className="p-4 text-right font-mono">{Number(dist.per_token_amount).toFixed(8)}</td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-1 bg-zinc-800 text-xs uppercase rounded-pillar">{dist.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.section>
    </motion.div>
  )
}
