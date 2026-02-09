'use client'

import React, { useState, useEffect } from 'react'
import { Plus, X, Grid, Bitcoin, Coins, DollarSign, Wallet, Shield, FileText, Users, ArrowUpRight, ArrowDownLeft, RefreshCw, Settings, Building2, Zap, Link, Eye, EyeOff, TrendingUp, AlertCircle, CheckCircle, Clock, ExternalLink, Building, FileText as FileTextIcon, CreditCard, UserCheck, Shield as ShieldIcon, Globe, Gavel, Calculator, Banknote, CheckCircle2, XCircle, Clock as ClockIcon } from 'lucide-react'
import type { Organization, Wallet as WalletType, WalletsViewProps } from '@/components/cashboard/dashboard.types'

export default function WalletsView({ organizations, selectedOrganization }: WalletsViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'wallets' | 'builder' | 'exchanges' | 'registration' | 'identity'>('overview')
  const [showCreateWallet, setShowCreateWallet] = useState(false)
  const [showWalletBuilder, setShowWalletBuilder] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null)
  const [showWalletDetail, setShowWalletDetail] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showBalances, setShowBalances] = useState(true)

  // Sample data - in real app this would come from API/context
  const wallets: WalletType[] = [
    { 
      id: '1', 
      name: 'Treasury Wallet', 
      type: 'bitcoin', 
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', 
      balance: 12.5, 
      currency: 'BTC', 
      isActive: true, 
      organizationId: '1', 
      description: 'Main corporate treasury wallet for reserves and large transactions', 
      network: 'mainnet', 
      transactions: [], 
      metadata: { isWatchOnly: false, isMultiSig: true, requiredSignatures: 2, totalSigners: 3 }, 
      createdAt: '2024-01-01T00:00:00Z', 
      updatedAt: '2024-01-20T10:30:00Z', 
      lastSyncAt: '2024-01-20T16:00:00Z' 
    },
    { 
      id: '2', 
      name: 'HandCash Operations', 
      type: 'handcash', 
      address: '$techcorp', 
      balance: 2500.0, 
      currency: 'BSV', 
      isActive: true, 
      organizationId: '1', 
      description: 'HandCash wallet for daily operations and microtransactions', 
      network: 'mainnet', 
      transactions: [], 
      metadata: { isWatchOnly: false, hdWallet: true }, 
      createdAt: '2024-01-05T00:00:00Z', 
      updatedAt: '2024-01-19T12:00:00Z', 
      lastSyncAt: '2024-01-20T16:00:00Z' 
    },
    { 
      id: '3', 
      name: 'Ethereum DeFi', 
      type: 'ethereum', 
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', 
      balance: 45.2, 
      currency: 'ETH', 
      isActive: true, 
      organizationId: '1', 
      description: 'Ethereum wallet for DeFi operations and yield farming', 
      network: 'mainnet', 
      transactions: [], 
      metadata: { isWatchOnly: false, hdWallet: true }, 
      createdAt: '2024-01-10T00:00:00Z', 
      updatedAt: '2024-01-20T14:00:00Z', 
      lastSyncAt: '2024-01-20T16:00:00Z' 
    },
    { 
      id: '4', 
      name: 'Cold Storage', 
      type: 'hardware', 
      address: 'Hardware Wallet', 
      balance: 8.75, 
      currency: 'BTC', 
      isActive: true, 
      organizationId: '1', 
      description: 'Hardware wallet for long-term cold storage', 
      network: 'mainnet', 
      transactions: [], 
      metadata: { isWatchOnly: true, hardware: { device: 'Ledger', model: 'Nano X' } }, 
      createdAt: '2024-01-15T00:00:00Z', 
      updatedAt: '2024-01-20T16:00:00Z', 
      lastSyncAt: '2024-01-20T16:00:00Z' 
    }
  ]

  const filteredWallets = selectedOrganization 
    ? wallets.filter(wallet => wallet.organizationId === selectedOrganization)
    : wallets

  const getWalletTypeIcon = (type: WalletType['type']) => {
    switch (type) {
      case 'bitcoin': return <Bitcoin className="w-5 h-5" />
      case 'ethereum': return <Coins className="w-5 h-5" />
      case 'bsv': return <Bitcoin className="w-5 h-5" />
      case 'handcash': return <DollarSign className="w-5 h-5" />
      case 'metamask': return <Wallet className="w-5 h-5" />
      case 'hardware': return <Shield className="w-5 h-5" />
      case 'paper': return <FileText className="w-5 h-5" />
      case 'multi_sig': return <Users className="w-5 h-5" />
      default: return <Wallet className="w-5 h-5" />
    }
  }

  const getWalletTypeColor = (type: WalletType['type']) => {
    switch (type) {
      case 'bitcoin': return 'text-orange-400'
      case 'ethereum': return 'text-blue-400'
      case 'bsv': return 'text-yellow-400'
      case 'handcash': return 'text-green-400'
      case 'metamask': return 'text-orange-500'
      case 'hardware': return 'text-purple-400'
      case 'paper': return 'text-gray-400'
      case 'multi_sig': return 'text-indigo-400'
      default: return 'text-gray-400'
    }
  }

  const formatBalance = (balance: number, currency: string) => {
    return `${balance.toLocaleString()} ${currency}`
  }

  const truncateAddress = (address: string) => {
    if (address.startsWith('$')) return address
    if (address.startsWith('0x')) return `${address.slice(0, 6)}...${address.slice(-4)}`
    if (address.length <= 16) return address
    return `${address.slice(0, 8)}...${address.slice(-8)}`
  }

  const getUSDValue = (balance: number, currency: string) => {
    const rates = {
      'BTC': 45000,
      'ETH': 2500,
      'BSV': 50,
      'USD': 1
    }
    return balance * (rates[currency as keyof typeof rates] || 0)
  }

  const totalBalance = filteredWallets.reduce((sum, wallet) => {
    return sum + getUSDValue(wallet.balance, wallet.currency)
  }, 0)

  const refreshBalances = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Balance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Total Portfolio Value</h3>
            <button
              onClick={() => setShowBalances(!showBalances)}
              className="text-blue-400 hover:text-blue-300"
            >
              {showBalances ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {showBalances ? `$${totalBalance.toLocaleString()}` : '••••••'}
          </div>
          <div className="flex items-center text-green-400 text-sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            +12.5% this month
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Active Wallets</h3>
          <div className="text-3xl font-bold text-white mb-2">{filteredWallets.length}</div>
          <div className="text-green-400 text-sm">All wallets operational</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Last Sync</h3>
          <div className="text-3xl font-bold text-white mb-2">2 min ago</div>
          <div className="text-orange-400 text-sm">Real-time updates</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-black/40 border border-white/20 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg p-4 text-center transition-colors">
            <Plus className="w-8 h-8 mx-auto mb-2 text-blue-400" />
            <div className="text-white font-medium">Add Wallet</div>
          </button>
          <button className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg p-4 text-center transition-colors">
            <Zap className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <div className="text-white font-medium">Send Payment</div>
          </button>
          <button 
            onClick={() => setActiveTab('exchanges')}
            className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg p-4 text-center transition-colors"
          >
            <Link className="w-8 h-8 mx-auto mb-2 text-purple-400" />
            <div className="text-white font-medium">Connect Wallet</div>
          </button>
          <button className="bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg p-4 text-center transition-colors">
            <Settings className="w-8 h-8 mx-auto mb-2 text-orange-400" />
            <div className="text-white font-medium">Settings</div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-black/40 border border-white/20 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {filteredWallets.slice(0, 3).map(wallet => (
            <div key={wallet.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-white/10 ${getWalletTypeColor(wallet.type)}`}>
                  {getWalletTypeIcon(wallet.type)}
                </div>
                <div>
                  <div className="text-white font-medium">{wallet.name}</div>
                  <div className="text-gray-400 text-sm">{truncateAddress(wallet.address)}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">{formatBalance(wallet.balance, wallet.currency)}</div>
                <div className="text-gray-400 text-sm">${getUSDValue(wallet.balance, wallet.currency).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderWallets = () => (
    <div className="space-y-6">
      {/* Connected Wallets Section */}
      <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Connected Wallets</h3>
                    <button 
            onClick={() => setActiveTab('exchanges')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <Link className="w-4 h-4 mr-2 inline" />
            Connect New Wallet
          </button>
        </div>
        
        {filteredWallets.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No wallets connected</h3>
            <p className="text-gray-400 mb-6">Connect your first wallet to get started</p>
            <button
              onClick={() => setActiveTab('exchanges')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Go to Exchange APIs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWallets.map(wallet => (
              <div key={wallet.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getWalletTypeColor(wallet.type).replace('text-', 'bg-')}/20`}>
                    {getWalletTypeIcon(wallet.type)}
                  </div>
                  <div>
                    <div className="text-white font-medium">{wallet.name}</div>
                    <div className="text-gray-400 text-sm">{truncateAddress(wallet.address)}</div>
                    <div className="text-gray-500 text-xs">{wallet.network} • {wallet.currency}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-white font-medium">{formatBalance(wallet.balance, wallet.currency)}</div>
                  <div className="text-gray-400 text-sm">${getUSDValue(wallet.balance, wallet.currency).toLocaleString()}</div>
                  <div className="text-gray-500 text-xs">
                    {wallet.lastSyncAt ? new Date(wallet.lastSyncAt).toLocaleTimeString() : 'Never'}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="text-blue-400 hover:text-blue-300 text-sm">View</button>
                  <button className="text-green-400 hover:text-green-300 text-sm">Send</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wallet List */}
      <div className="bg-black/40 border border-white/20 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Organization Wallets</h3>
            <button
              onClick={refreshBalances}
              disabled={isRefreshing}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-white/20">
          {filteredWallets.map(wallet => (
            <div key={wallet.id} className="p-6 hover:bg-white/5 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl bg-white/10 ${getWalletTypeColor(wallet.type)}`}>
                    {getWalletTypeIcon(wallet.type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-lg font-semibold text-white">{wallet.name}</h4>
                      {wallet.metadata.isMultiSig && (
                        <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded-full">
                          Multi-Sig
                        </span>
                      )}
                      {wallet.metadata.isWatchOnly && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                          Watch Only
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">{wallet.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{truncateAddress(wallet.address)}</span>
                      <span>•</span>
                      <span className="capitalize">{wallet.network}</span>
                      <span>•</span>
                      <span>Last sync: {wallet.lastSyncAt ? new Date(wallet.lastSyncAt).toLocaleTimeString() : 'Never'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-white mb-1">
                    {formatBalance(wallet.balance, wallet.currency)}
                  </div>
                  <div className="text-gray-400">
                    ${getUSDValue(wallet.balance, wallet.currency).toLocaleString()}
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <button className="text-blue-400 hover:text-blue-300 text-sm">View Details</button>
                    <button className="text-green-400 hover:text-green-300 text-sm">Send</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderBuilder = () => (
    <div className="space-y-6">
      <div className="bg-black/40 border border-white/20 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Wallet Builder</h3>
        <p className="text-gray-400 mb-6">Create custom wallet integrations and automation workflows</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/20 rounded-lg p-4">
            <h4 className="text-lg font-medium text-white mb-3">Custom Wallet Integration</h4>
            <p className="text-gray-400 text-sm mb-4">Build custom wallet connectors for any blockchain or service</p>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
              Start Building
            </button>
          </div>
          
          <div className="bg-white/5 border border-white/20 rounded-lg p-4">
            <h4 className="text-lg font-medium text-white mb-3">Automation Workflows</h4>
            <p className="text-gray-400 text-sm mb-4">Create automated wallet operations and triggers</p>
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">
              Create Workflow
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderExchanges = () => (
    <div className="space-y-6">
      {/* Exchange API Connections */}
      <div className="bg-black/40 border border-white/20 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Exchange API Connections</h3>
        <p className="text-gray-400 mb-6">Connect to cryptocurrency exchanges for trading and portfolio management</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/20 rounded-lg p-4 text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4z"/>
              </svg>
            </div>
            <h4 className="text-white font-medium mb-2">Binance</h4>
            <p className="text-gray-400 text-sm mb-3">Connect to Binance API</p>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
              Connect
            </button>
          </div>
          
          <div className="bg-white/5 border border-white/20 rounded-lg p-4 text-center">
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
            </div>
            <h4 className="text-white font-medium mb-2">Coinbase</h4>
            <p className="text-gray-400 text-sm mb-3">Connect to Coinbase API</p>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm">
              Connect
            </button>
          </div>
          
          <div className="bg-white/5 border border-white/20 rounded-lg p-4 text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h4 className="text-white font-medium mb-2">Kraken</h4>
            <p className="text-gray-400 text-sm mb-3">Connect to Kraken API</p>
            <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm">
              Connect
            </button>
          </div>
        </div>
      </div>

      {/* Wallet Connections */}
      <div className="bg-black/40 border border-white/20 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Wallet Connections</h3>
        <p className="text-gray-400 mb-6">Connect external wallets to manage them in one place</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/20 rounded-lg p-4 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Wallet className="w-6 h-6 text-green-400" />
            </div>
            <h4 className="text-white font-medium mb-2">HandCash</h4>
            <p className="text-gray-400 text-sm mb-3">Connect your HandCash wallet</p>
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
              Connect
            </button>
          </div>
          
          <div className="bg-white/5 border border-white/20 rounded-lg p-4 text-center">
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Wallet className="w-6 h-6 text-orange-400" />
            </div>
            <h4 className="text-white font-medium mb-2">MetaMask</h4>
            <p className="text-gray-400 text-sm mb-3">Connect your MetaMask wallet</p>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm">
              Connect
            </button>
          </div>
          
          <div className="bg-white/5 border border-white/20 rounded-lg p-4 text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Wallet className="w-6 h-6 text-purple-400" />
            </div>
            <h4 className="text-white font-medium mb-2">Hardware Wallets</h4>
            <p className="text-gray-400 text-sm mb-3">Connect Ledger, Trezor, etc.</p>
            <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm">
              Connect
            </button>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="bg-black/40 border border-white/20 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Connection Status</h3>
        <p className="text-gray-400 mb-6">Monitor your wallet connections and service integrations</p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-white">HandCash - Connected</span>
            </div>
            <span className="text-green-400 text-sm">Last sync: 2 min ago</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-white">MetaMask - Not Connected</span>
            </div>
            <button className="text-blue-400 hover:text-blue-300 text-sm">Connect</button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-white">Hardware Wallet - Not Connected</span>
            </div>
            <button className="text-blue-400 hover:text-blue-300 text-sm">Connect</button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderIdentity = () => (
    <div className="space-y-6">
      {/* Identity & KYC Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-white font-medium">Identity Status</div>
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-gray-400 text-sm">Verified</div>
          <div className="text-green-400 text-xs mt-1">Last updated: 2 days ago</div>
        </div>
        
        <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-white font-medium">KYC Level</div>
            <ShieldIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-gray-400 text-sm">Level 2</div>
          <div className="text-blue-400 text-xs mt-1">Enhanced due diligence</div>
        </div>
        
        <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-white font-medium">Wallet Linking</div>
            <Link className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-gray-400 text-sm">3 wallets linked</div>
          <div className="text-purple-400 text-xs mt-1">Last linked: 1 week ago</div>
        </div>
      </div>

      {/* Authentication & Identity Providers */}
      <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Authentication & Identity</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8.5 12.5L5 9l1.5-1.5L8.5 9.5 13.5 4.5 15 6l-7 7z"/>
                </svg>
              </div>
              <div>
                <div className="text-white font-medium">HandCash Identity</div>
                <div className="text-gray-400 text-sm">Connected to HandCash wallet</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-400 text-sm">Connected</span>
              <button className="text-red-400 hover:text-red-300 text-sm">Disconnect</button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div>
                <div className="text-white font-medium">Phantom Wallet</div>
                <div className="text-gray-400 text-sm">Connected to Phantom wallet</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-400 text-sm">Connected</span>
              <button className="text-red-400 hover:text-red-300 text-sm">Disconnect</button>
            </div>
          </div>
        </div>
      </div>

      {/* KYC Verification Steps */}
      <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">KYC Verification Steps</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <div>
              <div className="text-white font-medium">Personal Identity Verified</div>
              <div className="text-gray-400 text-sm">Government ID, passport, or driving license</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <div>
              <div className="text-white font-medium">Address Verification</div>
              <div className="text-gray-400 text-sm">Utility bill or bank statement</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <ClockIcon className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-white font-medium">Business Verification</div>
              <div className="text-gray-400 text-sm">Company documents and registration</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-500/10 border border-gray-500/20 rounded-lg">
            <XCircle className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-white font-medium">Enhanced Due Diligence</div>
              <div className="text-gray-400 text-sm">Source of funds verification</div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Identity Linking */}
      <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Wallet Identity Linking</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="text-white font-medium">Linked Wallets</div>
                <button className="text-blue-400 hover:text-blue-300 text-sm">Link New</button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">HandCash ($techcorp)</span>
                  <span className="text-green-400">✓ Verified</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Phantom (0x742d...b6)</span>
                  <span className="text-green-400">✓ Verified</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Hardware Wallet</span>
                  <span className="text-yellow-400">Pending</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="text-white font-medium mb-3">Identity Benefits</div>
              <div className="space-y-2 text-sm text-gray-400">
                <div>• Higher transaction limits</div>
                <div>• Reduced fees</div>
                <div>• Access to premium features</div>
                <div>• Compliance with regulations</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderRegistration = () => (
    <div className="space-y-6">
      {/* Compliance Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">KYC Status</h3>
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-2">Verified</div>
          <div className="text-green-400 text-sm">Identity confirmed</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Companies House</h3>
            <CheckCircle2 className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-2">Registered</div>
          <div className="text-blue-400 text-sm">Business registered</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Tax Authority</h3>
            <ClockIcon className="w-6 h-6 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-2">Pending</div>
          <div className="text-orange-400 text-sm">HMRC connection</div>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Banking</h3>
            <XCircle className="w-6 h-6 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-2">Not Connected</div>
          <div className="text-red-400 text-sm">Connect bank account</div>
        </div>
      </div>

      {/* Companies House Registration */}
      <div className="bg-black/40 border border-white/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center">
              <Building className="w-6 h-6 mr-3 text-blue-400" />
              Companies House Registration
            </h3>
            <p className="text-gray-400">UK business registration and compliance</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">Registered</span>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
              View Details
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Company Number:</span>
              <span className="text-white font-mono">12345678</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Company Name:</span>
              <span className="text-white">CASHBOARD LTD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className="text-green-400">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Incorporated:</span>
              <span className="text-white">15 Jan 2024</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Next Filing:</span>
              <span className="text-white">Confirmation Statement</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Due Date:</span>
              <span className="text-yellow-400">15 Jan 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Registered Office:</span>
              <span className="text-white">London, UK</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">SIC Code:</span>
              <span className="text-white">62012 - Business software</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Authority Integration */}
      <div className="bg-black/40 border border-white/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center">
              <Calculator className="w-6 h-6 mr-3 text-orange-400" />
              Tax Authority Integration
            </h3>
            <p className="text-gray-400">Connect to HMRC, IRS, and other tax authorities</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm rounded-full">In Progress</span>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg">
              Complete Setup
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium">HMRC (UK)</h4>
              <ClockIcon className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-gray-400 text-sm mb-3">Connect to UK tax authority</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">VAT Number:</span>
                <span className="text-white">Pending</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">UTR:</span>
                <span className="text-white">Pending</span>
              </div>
            </div>
            <button className="w-full mt-3 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">
              Connect HMRC
            </button>
          </div>
          
          <div className="bg-white/5 border border-white/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium">IRS (US)</h4>
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-gray-400 text-sm mb-3">Connect to US tax authority</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">EIN:</span>
                <span className="text-white">Not Set</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tax Year:</span>
                <span className="text-white">2024</span>
              </div>
            </div>
            <button className="w-full mt-3 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">
              Connect IRS
            </button>
          </div>
          
          <div className="bg-white/5 border border-white/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium">Other Authorities</h4>
              <Plus className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-gray-400 text-sm mb-3">Add other tax jurisdictions</p>
            <button className="w-full mt-3 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm">
              Add Authority
            </button>
          </div>
        </div>
      </div>

      {/* Banking Integration */}
      <div className="bg-black/40 border border-white/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center">
              <Banknote className="w-6 h-6 mr-3 text-green-400" />
              Banking Integration
            </h3>
            <p className="text-gray-400">Connect bank accounts and payment systems</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-full">Not Connected</span>
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">
              Connect Bank
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/20 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Open Banking (UK)</h4>
            <p className="text-gray-400 text-sm mb-4">Connect via Open Banking API</p>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-red-400">Not Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Provider:</span>
                <span className="text-white">Not Selected</span>
              </div>
            </div>
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">
              Connect Open Banking
            </button>
          </div>
          
          <div className="bg-white/5 border border-white/20 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Traditional Banking</h4>
            <p className="text-gray-400 text-sm mb-4">Manual bank account connection</p>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-red-400">Not Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Accounts:</span>
                <span className="text-white">0</span>
              </div>
            </div>
            <button className="w-full bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm">
              Add Bank Account
            </button>
          </div>
        </div>
      </div>

      {/* KYC & Identity Management */}
      <div className="bg-black/40 border border-white/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center">
              <UserCheck className="w-6 h-6 mr-3 text-purple-400" />
              KYC & Identity Management
            </h3>
            <p className="text-gray-400">Know Your Customer verification and identity documents</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">Verified</span>
            <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg">
              Manage Identity
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium">Personal Identity</h4>
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-gray-400 text-sm mb-3">Individual verification complete</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-400">Verified</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Method:</span>
                <span className="text-white">Digital ID</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Verified:</span>
                <span className="text-white">20 Jan 2024</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium">Business Verification</h4>
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-gray-400 text-sm mb-3">Business entity verified</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-400">Verified</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Method:</span>
                <span className="text-white">Companies House</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Verified:</span>
                <span className="text-white">15 Jan 2024</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium">Address Verification</h4>
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-gray-400 text-sm mb-3">Address verification complete</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-400">Verified</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Method:</span>
                <span className="text-white">Utility Bill</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Verified:</span>
                <span className="text-white">18 Jan 2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Reporting */}
      <div className="bg-black/40 border border-white/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center">
              <FileTextIcon className="w-6 h-6 mr-3 text-indigo-400" />
              Compliance Reporting
            </h3>
            <p className="text-gray-400">Regulatory reporting and compliance monitoring</p>
          </div>
          <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg">
            Generate Reports
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-white font-medium">Upcoming Reports</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <div className="text-white font-medium">VAT Return</div>
                  <div className="text-gray-400 text-sm">Quarterly filing</div>
                </div>
                <div className="text-right">
                  <div className="text-yellow-400 text-sm">Due: 30 Apr 2024</div>
                  <div className="text-gray-400 text-xs">2 months</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <div className="text-white font-medium">Corporation Tax</div>
                  <div className="text-gray-400 text-sm">Annual filing</div>
                </div>
                <div className="text-right">
                  <div className="text-yellow-400 text-sm">Due: 31 Jan 2025</div>
                  <div className="text-gray-400 text-xs">11 months</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-white font-medium">Recent Reports</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <div className="text-white font-medium">Confirmation Statement</div>
                  <div className="text-gray-400 text-sm">Companies House</div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 text-sm">Filed: 15 Jan 2024</div>
                  <div className="text-gray-400 text-xs">On time</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <div className="text-white font-medium">VAT Return</div>
                  <div className="text-gray-400 text-sm">Q4 2023</div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 text-sm">Filed: 31 Jan 2024</div>
                  <div className="text-gray-400 text-xs">On time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="absolute inset-0 top-24 overflow-y-auto px-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Wallets</h1>
          <p className="text-gray-300">Manage cryptocurrency wallets, track balances, and build integrations</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshBalances}
            disabled={isRefreshing}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowCreateWallet(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Wallet</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 p-1 bg-black/60 backdrop-blur-xl rounded-xl border border-white/20">
        {[
          { id: 'overview', label: 'Overview', icon: Grid },
          { id: 'wallets', label: 'Wallets', icon: Wallet },
          { id: 'builder', label: 'Builder', icon: Zap },
          { id: 'exchanges', label: 'Exchange APIs', icon: TrendingUp },
          { id: 'registration', label: 'Registration', icon: ShieldIcon },
          { id: 'identity', label: 'Identity & KYC', icon: UserCheck }
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'wallets' && renderWallets()}
      {activeTab === 'builder' && renderBuilder()}
      {activeTab === 'exchanges' && renderExchanges()}
      {activeTab === 'registration' && renderRegistration()}
      {activeTab === 'identity' && renderIdentity()}
    </div>
  )
}
