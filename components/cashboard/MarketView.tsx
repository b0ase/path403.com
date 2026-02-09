'use client'

import React, { useState } from 'react'
import {
  Globe,
  MessageSquare,
  Send,
  Hash,
  Building,
} from 'lucide-react'

export default function MarketView() {
  const [sortBy, setSortBy] = useState<'rank' | 'price' | 'volume' | 'marketCap' | 'change24h'>('rank')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock market data - in production this would come from a real API
  const marketData = [
    {
      rank: 1,
      symbol: 'EXT1',
      name: 'Example Token 1',
      price: 45.23,
      change24h: 2.5,
      volume24h: 125000000,
      marketCap: 890000000,
      circulatingSupply: 19678432,
      website: 'https://example1.com',
      socials: {
        twitter: 'https://twitter.com/example1',
        telegram: 'https://t.me/example1',
        discord: 'https://discord.gg/example1'
      }
    },
    {
      rank: 2,
      symbol: 'EXT2',
      name: 'Example Token 2',
      price: 0.0012,
      change24h: -1.2,
      volume24h: 2500000,
      marketCap: 12000000,
      circulatingSupply: 10000000000,
      website: 'https://example2.com',
      socials: {
        twitter: 'https://twitter.com/example2',
        telegram: 'https://t.me/example2'
      }
    },
    {
      rank: 3,
      symbol: 'EXT3',
      name: 'Example Token 3',
      price: 0.000001,
      change24h: 15.8,
      volume24h: 850000,
      marketCap: 1000000,
      circulatingSupply: 1000000000000,
      website: 'https://example3.com',
      socials: {
        twitter: 'https://twitter.com/example3',
        discord: 'https://discord.gg/example3'
      }
    },
    {
      rank: 4,
      symbol: 'EXT4',
      name: 'Example Token 4',
      price: 0.25,
      change24h: 8.3,
      volume24h: 450000,
      marketCap: 2500000,
      circulatingSupply: 10000000,
      website: 'https://example4.com',
      socials: {
        twitter: 'https://twitter.com/example4',
        linkedin: 'https://linkedin.com/company/example4'
      }
    },
    {
      rank: 5,
      symbol: 'EXT5',
      name: 'Example Token 5',
      price: 1.85,
      change24h: -3.1,
      volume24h: 1200000,
      marketCap: 18500000,
      circulatingSupply: 10000000,
      website: 'https://example5.com',
      socials: {
        twitter: 'https://twitter.com/example5',
        telegram: 'https://t.me/example5'
      }
    }
  ]

  const filteredAndSortedData = marketData
    .filter(token => 
      token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const direction = sortOrder === 'asc' ? 1 : -1
      switch (sortBy) {
        case 'rank': return (a.rank - b.rank) * direction
        case 'price': return (a.price - b.price) * direction
        case 'volume': return (a.volume24h - b.volume24h) * direction
        case 'marketCap': return (a.marketCap - b.marketCap) * direction
        case 'change24h': return (a.change24h - b.change24h) * direction
        default: return 0
      }
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
     <div className="absolute inset-0 top-20 p-6">
       <div className="max-w-full mx-auto h-full flex flex-col">
         <div className="mb-6">
           <h1 className="text-3xl font-bold text-white mb-2">Token Market</h1>
           <p className="text-gray-400">Real-time token prices, market caps, and trading data</p>
         </div>

      {/* Search and Controls */}
      <div className="mb-6 flex gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="rank">Rank</option>
            <option value="price">Price</option>
            <option value="volume">Volume</option>
            <option value="marketCap">Market Cap</option>
            <option value="change24h">24h Change</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-white hover:bg-white/10 transition-colors"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

               {/* Market Table */}
         <div className="flex-1 bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden">
           <div className="overflow-auto h-full">
             <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-gray-400 font-medium">Rank</th>
                <th className="text-left p-4 text-gray-400 font-medium">Token</th>
                <th className="text-right p-4 text-gray-400 font-medium">Price</th>
                <th className="text-right p-4 text-gray-400 font-medium">24h Change</th>
                <th className="text-right p-4 text-gray-400 font-medium">Volume (24h)</th>
                <th className="text-right p-4 text-gray-400 font-medium">Market Cap</th>
                <th className="text-right p-4 text-gray-400 font-medium">Circulating Supply</th>
                <th className="text-center p-4 text-gray-400 font-medium">Links</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.map((token, index) => (
                <tr key={token.symbol} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <span className="text-white font-medium">#{token.rank}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{token.symbol[0]}</span>
                      </div>
                      <div>
                        <div className="text-white font-medium">{token.name}</div>
                        <div className="text-gray-400 text-sm">{token.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-white font-medium">{formatPrice(token.price)}</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`font-medium ${
                      token.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-white">{formatVolume(token.volume24h)}</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-white">{formatVolume(token.marketCap)}</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-gray-400">{formatSupply(token.circulatingSupply)} {token.symbol}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <a
                        href={token.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                        title="Website"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                      {token.socials.twitter && (
                        <a
                          href={token.socials.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-400 transition-colors"
                          title="Twitter"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                      )}
                      {token.socials.telegram && (
                        <a
                          href={token.socials.telegram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-400 transition-colors"
                          title="Telegram"
                        >
                          <Send className="w-4 h-4" />
                        </a>
                      )}
                      {token.socials.discord && (
                        <a
                          href={token.socials.discord}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-400 transition-colors"
                          title="Discord"
                        >
                          <Hash className="w-4 h-4" />
                        </a>
                      )}
                      {token.socials.linkedin && (
                        <a
                          href={token.socials.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-400 transition-colors"
                          title="LinkedIn"
                        >
                          <Building className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
                           </tbody>
             </table>
           </div>
         </div>

                  {filteredAndSortedData.length === 0 && (
           <div className="flex-1 flex items-center justify-center">
             <div className="text-center">
               <div className="text-6xl mb-4">📊</div>
               <h3 className="text-xl font-semibold text-white mb-2">No tokens found</h3>
               <p className="text-gray-400">Try adjusting your search criteria</p>
             </div>
           </div>
         )}
       </div>
     </div>
   )
}

