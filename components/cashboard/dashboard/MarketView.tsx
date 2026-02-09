'use client'

import React, { useState } from 'react'
import { Globe, MessageSquare, Send, Hash, Building } from 'lucide-react'

export default function MarketView() {
  const [sortBy, setSortBy] = useState<'rank' | 'price' | 'volume' | 'marketCap' | 'change24h'>('rank')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [searchTerm, setSearchTerm] = useState('')

  const marketData = [
    { rank: 1, symbol: 'EXT1', name: 'Example Token 1', price: 45.23, change24h: 2.5, volume24h: 125000000, marketCap: 890000000, circulatingSupply: 19678432, website: 'https://example1.com', socials: { twitter: 'https://twitter.com/example1', telegram: 'https://t.me/example1', discord: 'https://discord.gg/example1' } },
    { rank: 2, symbol: 'EXT2', name: 'Example Token 2', price: 0.0012, change24h: -1.2, volume24h: 2500000, marketCap: 12000000, circulatingSupply: 10000000000, website: 'https://example2.com', socials: { twitter: 'https://twitter.com/example2', telegram: 'https://t.me/example2' } },
  ]

  const filteredAndSortedData = marketData
    .filter(token => 
      token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const direction = sortOrder === 'asc' ? 1 : -1
      if (sortBy in a && sortBy in b) {
        // @ts-ignore
        if (a[sortBy] < b[sortBy]) return -1 * direction
        // @ts-ignore
        if (a[sortBy] > b[sortBy]) return 1 * direction
      }
      return 0
    })

  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`
    return `$${price.toFixed(2)}`
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`
    if (volume >= 1000) return `$${(volume / 1000).toFixed(1)}K`
    return `$${volume.toFixed(0)}`
  }

  const formatSupply = (supply: number) => {
    if (supply >= 1000000000) return `${(supply / 1000000000).toFixed(1)}B`
    if (supply >= 1000000) return `${(supply / 1000000).toFixed(1)}M`
    if (supply >= 1000) return `${(supply / 1000).toFixed(1)}K`
    return supply.toLocaleString()
  }

  return (
    <div className="absolute inset-0 top-20 px-6">
      <div className="max-w-full mx-auto h-full flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Token Market</h1>
          <p className="text-gray-400">Real-time token prices, market caps, and trading data</p>
        </div>
      </div>
    </div>
  )
}
