'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiFileText, FiUser, FiBriefcase, FiFolder, FiCircle } from 'react-icons/fi'
import { useAuth } from '@/components/Providers'
import { useRouter } from 'next/navigation'

type Tab = 'personal' | 'company' | 'project' | 'token'

export default function RegistryPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('personal')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [personalData, setPersonalData] = useState({
    full_name: '',
    username: '',
    bio: '',
    website: '',
    bsv_address: '',
    eth_address: '',
    sol_address: '',
  })

  const [projectData, setProjectData] = useState({
    name: '',
    slug: '',
    description: '',
    logo_url: '',
  })

  const [tokenData, setTokenData] = useState({
    symbol: '',
    name: '',
    blockchain: 'bsv',
    total_supply: '1000000000',
    decimals: '0',
    icon_url: '',
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (user) {
      fetch('/api/registry/personal')
        .then((res) => res.json())
        .then((data) => {
          if (data.profile) {
            setPersonalData({
              full_name: data.profile.full_name || '',
              username: data.profile.username || '',
              bio: data.profile.bio || '',
              website: data.profile.website || '',
              bsv_address: data.profile.bsv_address || '',
              eth_address: data.profile.eth_address || '',
              sol_address: data.profile.sol_address || '',
            })
          }
        })
    }
  }, [user])

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      const res = await fetch('/api/registry/personal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personalData),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      const res = await fetch('/api/registry/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: 'Project registered successfully' })
        setProjectData({ name: '', slug: '', description: '', logo_url: '' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to register project' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      const res = await fetch('/api/registry/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...tokenData,
          total_supply: parseInt(tokenData.total_supply),
          decimals: parseInt(tokenData.decimals),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: 'Token registered successfully' })
        setTokenData({ symbol: '', name: '', blockchain: 'bsv', total_supply: '1000000000', decimals: '0', icon_url: '' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to register token' })
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
      <motion.section
        className="px-4 md:px-8 py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="max-w-pillar mx-auto">
          {/* Header */}
          <motion.div
            className="mb-8 border-b border-zinc-900 pb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="flex items-start gap-6">
              <div className="bg-gray-900/50 p-4 border border-gray-800 rounded-pillar">
                <FiFileText className="text-4xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">
                  REGISTRY<span className="text-zinc-800">.SYS</span>
                </h1>
                <p className="text-zinc-500 uppercase text-xs tracking-widest">Global Identity & Asset Records</p>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-zinc-900 pb-4">
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border rounded-pillar transition-all ${activeTab === 'personal' ? 'bg-white text-black border-white' : 'bg-black text-zinc-500 border-zinc-900 hover:border-zinc-700 hover:text-white'
                }`}
            >
              <FiUser className="inline mr-2" />
              Personal
            </button>
            <button
              onClick={() => setActiveTab('company')}
              className={`px-4 py-2 text-sm font-bold uppercase border rounded-pillar ${activeTab === 'company' ? 'bg-white text-black border-white' : 'bg-black text-white border-zinc-800 hover:border-white'
                }`}
            >
              <FiBriefcase className="inline mr-2" />
              Company
            </button>
            <button
              onClick={() => setActiveTab('project')}
              className={`px-4 py-2 text-sm font-bold uppercase border rounded-pillar ${activeTab === 'project' ? 'bg-white text-black border-white' : 'bg-black text-white border-zinc-800 hover:border-white'
                }`}
            >
              <FiFolder className="inline mr-2" />
              Project
            </button>
            <button
              onClick={() => setActiveTab('token')}
              className={`px-4 py-2 text-sm font-bold uppercase border rounded-pillar ${activeTab === 'token' ? 'bg-white text-black border-white' : 'bg-black text-white border-zinc-800 hover:border-white'
                }`}
            >
              <FiCircle className="inline mr-2" />
              Token
            </button>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-6 p-4 border rounded-pillar text-xs tracking-widest uppercase ${message.type === 'success' ? 'bg-green-950/20 border-green-900 text-green-500' : 'bg-red-950/20 border-red-900 text-red-500'
                }`}
            >
              [{message.type === 'success' ? 'SUCCESS' : 'ERROR'}]: {message.text}
            </div>
          )}

          {/* Personal Tab */}
          {activeTab === 'personal' && (
            <form onSubmit={handlePersonalSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Full Name</label>
                <input
                  type="text"
                  value={personalData.full_name}
                  onChange={(e) => setPersonalData({ ...personalData, full_name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar placeholder:text-zinc-800 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Username</label>
                <input
                  type="text"
                  value={personalData.username}
                  onChange={(e) => setPersonalData({ ...personalData, username: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar placeholder:text-zinc-800 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Bio</label>
                <textarea
                  value={personalData.bio}
                  onChange={(e) => setPersonalData({ ...personalData, bio: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Website</label>
                <input
                  type="url"
                  value={personalData.website}
                  onChange={(e) => setPersonalData({ ...personalData, website: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar placeholder:text-zinc-800 transition-colors"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">BSV Address</label>
                  <input
                    type="text"
                    value={personalData.bsv_address}
                    onChange={(e) => setPersonalData({ ...personalData, bsv_address: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar placeholder:text-zinc-800 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">ETH Address</label>
                  <input
                    type="text"
                    value={personalData.eth_address}
                    onChange={(e) => setPersonalData({ ...personalData, eth_address: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar placeholder:text-zinc-800 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">SOL Address</label>
                  <input
                    type="text"
                    value={personalData.sol_address}
                    onChange={(e) => setPersonalData({ ...personalData, sol_address: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar placeholder:text-zinc-800 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-white text-black px-6 py-3 font-bold uppercase hover:bg-zinc-200 transition-colors disabled:opacity-50 rounded-pillar"
              >
                {submitting ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          )}

          {/* Company Tab */}
          {activeTab === 'company' && (
            <div className="border border-zinc-800 p-8 bg-zinc-950 rounded-pillar">
              <p className="text-zinc-500">Company registration uses existing /api/companies endpoint. Visit the Companies page to register a new company.</p>
              <button
                onClick={() => router.push('/companies')}
                className="mt-4 bg-white text-black px-6 py-3 font-bold uppercase hover:bg-zinc-200 transition-colors rounded-pillar"
              >
                Go to Companies
              </button>
            </div>
          )}

          {/* Project Tab */}
          {activeTab === 'project' && (
            <form onSubmit={handleProjectSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Project Name *</label>
                <input
                  type="text"
                  value={projectData.name}
                  onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar placeholder:text-zinc-800 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Project Slug * (URL-safe identifier)</label>
                <input
                  type="text"
                  value={projectData.slug}
                  onChange={(e) => setProjectData({ ...projectData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar placeholder:text-zinc-800 transition-colors"
                  placeholder="my-project-name"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Description</label>
                <textarea
                  value={projectData.description}
                  onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Logo URL</label>
                <input
                  type="url"
                  value={projectData.logo_url}
                  onChange={(e) => setProjectData({ ...projectData, logo_url: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar placeholder:text-zinc-800 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-white text-black px-6 py-3 font-bold uppercase hover:bg-zinc-200 transition-colors disabled:opacity-50 rounded-pillar"
              >
                {submitting ? 'Registering...' : 'Register Project'}
              </button>
            </form>
          )}

          {/* Token Tab */}
          {activeTab === 'token' && (
            <form onSubmit={handleTokenSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Token Symbol * (e.g., $MARS)</label>
                <input
                  type="text"
                  value={tokenData.symbol}
                  onChange={(e) => setTokenData({ ...tokenData, symbol: e.target.value.toUpperCase() })}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar placeholder:text-zinc-800 transition-colors"
                  placeholder="$TOKEN"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Token Name *</label>
                <input
                  type="text"
                  value={tokenData.name}
                  onChange={(e) => setTokenData({ ...tokenData, name: e.target.value })}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar placeholder:text-zinc-800 transition-colors"
                  placeholder="My Token"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Blockchain *</label>
                <select
                  value={tokenData.blockchain}
                  onChange={(e) => setTokenData({ ...tokenData, blockchain: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar placeholder:text-zinc-800 transition-colors"
                >
                  <option value="bsv">Bitcoin SV (BSV)</option>
                  <option value="eth">Ethereum (ETH)</option>
                  <option value="sol">Solana (SOL)</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Total Supply</label>
                  <input
                    type="number"
                    value={tokenData.total_supply}
                    onChange={(e) => setTokenData({ ...tokenData, total_supply: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar placeholder:text-zinc-800 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">Decimals</label>
                  <input
                    type="number"
                    value={tokenData.decimals}
                    onChange={(e) => setTokenData({ ...tokenData, decimals: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar placeholder:text-zinc-800 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Icon URL</label>
                <input
                  type="url"
                  value={tokenData.icon_url}
                  onChange={(e) => setTokenData({ ...tokenData, icon_url: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white rounded-pillar placeholder:text-zinc-800 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-white text-black px-6 py-3 font-bold uppercase hover:bg-zinc-200 transition-colors disabled:opacity-50 rounded-pillar"
              >
                {submitting ? 'Registering...' : 'Register Token'}
              </button>
            </form>
          )}
        </div>
      </motion.section>
    </motion.div>
  )
}
