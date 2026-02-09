'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiShield } from 'react-icons/fi'
import { useAuth } from '@/components/Providers'
import { useRouter } from 'next/navigation'

export default function VerifyPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [kycStatus, setKycStatus] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    government_id_front_url: '',
    proof_of_address_url: '',
  })

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [loading, user, router])

  useEffect(() => {
    if (user) {
      fetch('/api/kyc/status')
        .then((res) => res.json())
        .then((data) => setKycStatus(data))
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      const res = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: 'KYC submitted successfully. Awaiting verification.' })
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
                <FiShield className="text-4xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">
                  VERIFY<span className="text-zinc-800">.ID</span>
                </h1>
                <p className="text-zinc-500 uppercase text-xs tracking-widest">Identity Authentication Protocol</p>
              </div>
            </div>
          </motion.div>

          {kycStatus?.hasSubmitted && (
            <div className="mb-8 border border-zinc-800 p-6 bg-zinc-950 rounded-pillar">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1">NODE_STATUS</div>
                  <div className="text-2xl font-black uppercase tracking-tighter">{kycStatus.status}</div>
                </div>
                <div className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border rounded-pillar ${kycStatus.status === 'verified' ? 'bg-green-950/20 border-green-900 text-green-500' :
                  kycStatus.status === 'rejected' ? 'bg-red-950/20 border-red-900 text-red-500' :
                    'bg-zinc-950 border-zinc-800 text-zinc-500 animate-pulse'
                  }`}>
                  {kycStatus.status === 'verified' ? '[VERIFIED]' :
                    kycStatus.status === 'rejected' ? '[REJECTED]' :
                      '[PENDING_REVIEW]'}
                </div>
              </div>
            </div>
          )}

          {message && (
            <div className={`mb-6 p-4 border rounded-pillar text-xs tracking-widest uppercase transition-all ${message.type === 'success' ? 'bg-green-950/20 border-green-900 text-green-500' : 'bg-red-950/20 border-red-900 text-red-500'
              }`}>
              [{message.type === 'success' ? 'SUCCESS' : 'ERROR'}]: {message.text}
            </div>
          )}

          {!kycStatus?.hasSubmitted && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">FULL_NAME_SPEC</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  className="w-full bg-black border border-zinc-900 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar placeholder:text-zinc-800 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">BIRTH_DATE_SPEC</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  required
                  className="w-full bg-black border border-zinc-900 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar placeholder:text-zinc-800 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">GOV_ID_ENTRY_URL</label>
                <input
                  type="url"
                  value={formData.government_id_front_url}
                  onChange={(e) => setFormData({ ...formData, government_id_front_url: e.target.value })}
                  required
                  placeholder="Upload to Supabase storage and paste URL"
                  className="w-full bg-black border border-zinc-900 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar placeholder:text-zinc-800 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">ADDRESS_PROOF_URL</label>
                <input
                  type="url"
                  value={formData.proof_of_address_url}
                  onChange={(e) => setFormData({ ...formData, proof_of_address_url: e.target.value })}
                  required
                  placeholder="Upload to Supabase storage and paste URL"
                  className="w-full bg-black border border-zinc-900 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar placeholder:text-zinc-800 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-white text-black py-4 font-bold uppercase tracking-widest text-sm hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-pillar transition-all"
              >
                {submitting ? 'EXECUTING_SUBMISSION...' : 'INITIALIZE_VERIFICATION'}
              </button>
            </form>
          )}
        </div>
      </motion.section>
    </motion.div>
  )
}
