'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiCircle } from 'react-icons/fi'
import { useAuth } from '@/components/Providers'
import { useRouter } from 'next/navigation'

export default function CapTablePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [tokens, setTokens] = useState<any[]>([])
  const [selectedToken, setSelectedToken] = useState<string>('')
  const [capTable, setCapTable] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  const fetchCapTable = async (tokenId: string) => {
    try {
      const res = await fetch(`/api/cap-table/${tokenId}`)
      const data = await res.json()
      if (res.ok) {
        setCapTable(data)
      }
    } catch (error) {
      console.error('Failed to fetch cap table:', error)
    }
  }

  const handleTokenChange = (tokenId: string) => {
    setSelectedToken(tokenId)
    if (tokenId) {
      fetchCapTable(tokenId)
    }
  }

  const exportCSV = async () => {
    if (!selectedToken) return
    window.open(`/api/cap-table/${selectedToken}/export`, '_blank')
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-zinc-900 border-t-white rounded-full animate-spin" />
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">INITIALIZING_SYSTEM...</div>
        </div>
      </div>
    )
  }

  return (
    <motion.div className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.section className="px-4 md:px-8 py-16">
        <div className="max-w-pillar mx-auto">

          <motion.div className="mb-8 border-b border-zinc-900 pb-8">
            <div className="flex items-start gap-6">
              <div className="bg-gray-900/50 p-4 border border-gray-800 rounded-pillar">
                <FiCircle className="text-4xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">
                  CAP_TABLE<span className="text-zinc-800">.DB</span>
                </h1>
                <p className="text-zinc-500 uppercase text-xs tracking-widest">Shareholder Ledger Analysis Unit</p>
              </div>
            </div>
          </motion.div>

          <div className="mb-6">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Select_Asset_Unit</label>
            <select
              value={selectedToken}
              onChange={(e) => handleTokenChange(e.target.value)}
              className="w-full max-w-md bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar appearance-none"
            >
              <option value="">Choose a token...</option>
              {tokens.map((token) => (
                <option key={token.id} value={token.id}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
          </div>

          {capTable && (
            <>
              <div className="mb-6 flex justify-end">
                <button
                  onClick={exportCSV}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-4 py-2 font-bold uppercase text-[10px] tracking-widest hover:border-white hover:text-white rounded-pillar transition-all"
                >
                  EXPORT_ENTRY_LOG.CSV
                </button>
              </div>

              <div className="border border-zinc-800 overflow-hidden rounded-pillar">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-900 border-b border-zinc-800">
                    <tr>
                      <th className="text-left p-4 font-bold uppercase text-xs">Holder</th>
                      <th className="text-left p-4 font-bold uppercase text-xs">Email</th>
                      <th className="text-right p-4 font-bold uppercase text-xs">Shares</th>
                      <th className="text-right p-4 font-bold uppercase text-xs">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="bg-zinc-950">
                    {capTable.entries.map((entry: any, idx: number) => (
                      <tr key={idx} className="border-b border-zinc-900">
                        <td className="p-4">{entry.holder_name}</td>
                        <td className="p-4 text-zinc-400">{entry.holder_email || '-'}</td>
                        <td className="p-4 text-right font-mono">{entry.shares_held.toLocaleString()}</td>
                        <td className="p-4 text-right font-mono">{entry.percentage.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {!selectedToken && (
            <div className="border border-zinc-900 border-dashed p-12 bg-zinc-950/20 text-center rounded-pillar">
              <p className="text-zinc-700 uppercase text-[10px] tracking-widest">IDLE: SELECT_PARAMETER_UNIT</p>
            </div>
          )}
        </div>
      </motion.section>
    </motion.div>
  )
}
