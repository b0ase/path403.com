'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/CashboardAuthContext'

export default function IntegrationsView() {
  const [selectedCategory, setSelectedCategory] = useState<'crm' | 'spreadsheet' | 'cms' | 'payment' | 'communication' | 'social' | 'ai' | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const integrations = [
    { id: '1', name: 'Salesforce', category: 'crm', description: 'Customer relationship management platform', icon: '🟦', status: 'connected', lastSync: '2 minutes ago', features: ['Contact Sync', 'Deal Tracking', 'Revenue Analytics'] },
    { id: '2', name: 'HubSpot', category: 'crm', description: 'Inbound marketing and sales platform', icon: '🟧', status: 'available', lastSync: null, features: ['Lead Management', 'Email Marketing', 'Analytics'] },
  ]

  const categories = [
    { id: 'all', name: 'All Integrations', icon: '🔗' },
    { id: 'crm', name: 'CRM Systems', icon: '👥' },
    { id: 'spreadsheet', name: 'Spreadsheets', icon: '📊' },
  ]

  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const { user: handCashUser } = useAuth()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-400'
      case 'available': return 'text-blue-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500/20 border-green-400/30'
      case 'available': return 'bg-blue-500/20 border-blue-400/30'
      case 'error': return 'bg-red-500/20 border-red-400/30'
      default: return 'bg-gray-500/20 border-gray-400/30'
    }
  }

  return (
    <div className="absolute inset-0 top-20 overflow-y-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Integrations</h1>
          <p className="text-gray-400">Connect your favorite tools and platforms to automate workflows and sync data</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as 'crm' | 'spreadsheet' | 'cms' | 'payment' | 'communication' | 'all')}
                className={`px-4 py-2 rounded-lg border transition-all whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-blue-500/20 border-blue-400/50 text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
    </div>
  )
}


