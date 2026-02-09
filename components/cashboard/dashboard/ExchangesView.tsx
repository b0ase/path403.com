'use client'

import { useState } from 'react'
import { Wallet, TrendingUp, RefreshCw, CheckCircle, XCircle } from 'lucide-react'

interface ExchangesViewProps {
  organizations: any[]
  selectedOrganization: string | null
}

export default function ExchangesView({ organizations, selectedOrganization }: ExchangesViewProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showBalances, setShowBalances] = useState(true)

  const refreshBalances = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const getUSDValue = (amount: number, currency: string) => {
    // Mock exchange rates
    const rates: { [key: string]: number } = {
      'BTC': 45000,
      'ETH': 3000,
      'USD': 1,
      'GBP': 1.25,
      'EUR': 1.1
    }
    return rates[currency] ? (amount * rates[currency]).toFixed(2) : 'N/A'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Exchange APIs</h1>
              <p className="text-gray-400">Connect to cryptocurrency exchanges for trading and portfolio management</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={refreshBalances}
                disabled={isRefreshing}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              <button
                onClick={() => setShowBalances(!showBalances)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {showBalances ? 'Hide' : 'Show'} Balances
              </button>
            </div>
          </div>
        </div>

        {/* Exchange API Connections */}
        <div className="bg-black/40 border border-white/20 rounded-xl p-6 mb-6">
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
        <div className="bg-black/40 border border-white/20 rounded-xl p-6 mb-6">
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
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-white">HandCash - Connected</span>
              </div>
              <span className="text-green-400 text-sm">Last sync: 2 min ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-3">
                <XCircle className="w-4 h-4 text-gray-400" />
                <span className="text-white">MetaMask - Not Connected</span>
              </div>
              <button className="text-blue-400 hover:text-blue-300 text-sm">Connect</button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-3">
                <XCircle className="w-4 h-4 text-gray-400" />
                <span className="text-white">Binance API - Not Connected</span>
              </div>
              <button className="text-blue-400 hover:text-blue-300 text-sm">Connect</button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-3">
                <XCircle className="w-4 h-4 text-gray-400" />
                <span className="text-white">Coinbase API - Not Connected</span>
              </div>
              <button className="text-blue-400 hover:text-blue-300 text-sm">Connect</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
