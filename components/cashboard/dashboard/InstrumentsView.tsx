'use client'

import React, { useState } from 'react'
import { Plus, X, Building2, Globe, TrendingUp, CreditCard, BarChart3, Coins, Settings, Scale, Circle, Building } from 'lucide-react'
import type { Organization, FinancialInstrument, InstrumentsViewProps } from '@/components/cashboard/dashboard.types'

export default function InstrumentsView({ instruments, organizations, selectedOrganization, onCreateInstrument, onDeleteInstrument, onSelectOrganization, onDeselectOrganization }: Omit<InstrumentsViewProps, 'onUpdateInstrument'>) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [formData, setFormData] = useState({
    name: '',
    type: 'equity' as FinancialInstrument['type'],
    symbol: '',
    description: '',
    totalSupply: 1000000,
    decimals: 18,
    blockchain: 'Bitcoin SV',
    organizationId: selectedOrganization || ''
  })

  const currentOrg = organizations.find((org: Organization) => org.id === selectedOrganization)
  const orgInstruments = instruments.filter(instrument => instrument.organizationId === selectedOrganization)

  const handleCreate = () => {
    if (formData.name && formData.symbol) {
      onCreateInstrument({
        ...formData,
        organizationId: selectedOrganization || undefined,
        issuedSupply: 0,
        status: 'draft',
        metadata: {}
      })
      setFormData({
        name: '',
        type: 'equity',
        symbol: '',
        description: '',
        totalSupply: 1000000,
        decimals: 18,
        blockchain: 'Bitcoin SV',
        organizationId: selectedOrganization || ''
      })
      setShowCreateForm(false)
    }
  }

  const getInstrumentTypeColor = (type: FinancialInstrument['type']) => {
    switch (type) {
      case 'equity': return 'text-green-400'
      case 'debt': return 'text-red-400'
      case 'derivative': return 'text-purple-400'
      case 'reward': return 'text-yellow-400'
      case 'utility': return 'text-blue-400'
      case 'governance': return 'text-indigo-400'
      case 'hybrid': return 'text-pink-400'
      default: return 'text-gray-400'
    }
  }

  const getInstrumentIcon = (type: FinancialInstrument['type']) => {
    switch (type) {
      case 'equity': return <TrendingUp className="w-5 h-5" />
      case 'debt': return <CreditCard className="w-5 h-5" />
      case 'derivative': return <BarChart3 className="w-5 h-5" />
      case 'reward': return <Coins className="w-5 h-5" />
      case 'utility': return <Settings className="w-5 h-5" />
      case 'governance': return <Scale className="w-5 h-5" />
      case 'hybrid': return <Circle className="w-5 h-5" />
      default: return <Circle className="w-5 h-5" />
    }
  }

  const instrumentTemplates = [
    { id: '1', name: 'Common Stock', category: 'Equity', type: 'equity', symbol: 'COMM', description: 'Traditional common stock with voting rights', totalSupply: 1000000, decimals: 0, blockchain: 'Bitcoin SV', icon: '📈' },
    { id: '2', name: 'Preferred Shares', category: 'Equity', type: 'equity', symbol: 'PREF', description: 'Preferred stock with dividend priority', totalSupply: 100000, decimals: 0, blockchain: 'Bitcoin SV', icon: '⭐' },
  ]

  const instrumentCategories = ['All', 'Equity', 'Debt', 'Utility', 'Governance', 'Reward', 'Derivative', 'Hybrid']

  const applyInstrumentTemplate = (template: typeof instrumentTemplates[0]) => {
    setFormData({
      name: template.name,
      type: template.type,
      symbol: template.symbol,
      description: template.description,
      totalSupply: template.totalSupply,
      decimals: template.decimals,
      blockchain: template.blockchain,
      organizationId: selectedOrganization || ''
    })
    setShowTemplates(false)
  }

  const filteredInstrumentTemplates = selectedCategory === 'All' 
    ? instrumentTemplates 
    : instrumentTemplates.filter(template => template.category === selectedCategory)

  return (
    <div className="absolute inset-0 top-20 overflow-y-auto pb-24 scrollbar-always-visible px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Financial Instruments</h1>
            <p className="text-gray-300">Create and manage blockchain-based financial instruments</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Instrument</span>
          </button>
        </div>
    </div>
  )
}
