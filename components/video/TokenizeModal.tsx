'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiDollarSign, FiPercent, FiTag, FiUser, FiFileText } from 'react-icons/fi'

interface TokenizeModalProps {
  isOpen: boolean
  onClose: () => void
  onTokenize: (protocol: string, options: TokenizationOptions) => void
  videoTitle: string
  videoDuration: number
  videoSize: number
  videoUrl?: string
}

export interface TokenizationOptions {
  protocol: string
  name: string
  symbol: string
  supply: number
  decimals: number
  description: string
  royaltyPercentage: number
  price?: number
  metadata?: {
    creator?: string
    genre?: string
    tags?: string[]
    thumbnail?: string
    duration?: number
    resolution?: string
    fileSize?: number
    codec?: string
  }
}

const TOKENIZATION_PROTOCOLS = [
  {
    id: 'stas',
    name: 'STAS',
    fullName: 'Satoshi Token Asset Standard',
    description: 'Simple and efficient token protocol',
    features: ['Low fees', 'Smart contracts', 'Atomic swaps']
  },
  {
    id: 'run',
    name: 'RUN',
    fullName: 'RUN Protocol',
    description: 'Interactive token protocol',
    features: ['Interactive', 'On-chain state', 'Programmable']
  },
  {
    id: '1sat',
    name: '1SAT',
    fullName: '1Sat Ordinals',
    description: 'Inscribe data on satoshis',
    features: ['Permanent storage', 'Simple transfers', 'Collectible']
  },
  {
    id: 'bsv21',
    name: 'BSV-21',
    fullName: 'Bitcoin OS Assets',
    description: 'Digital documents and collectibles',
    features: ['Metadata support', 'Royalties', 'Marketplace ready']
  }
]

export default function TokenizeModal({
  isOpen,
  onClose,
  onTokenize,
  videoTitle,
  videoDuration,
  videoSize
}: TokenizeModalProps) {
  const [selectedProtocol, setSelectedProtocol] = useState('stas')
  const [tokenName, setTokenName] = useState(videoTitle || 'My Video Token')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [totalSupply, setTotalSupply] = useState(1000)
  const [decimals, setDecimals] = useState(0)
  const [description, setDescription] = useState('')
  const [royaltyPercentage, setRoyaltyPercentage] = useState(10)
  const [tokenPrice, setTokenPrice] = useState(0.1)
  const [author, setAuthor] = useState('')
  const [category, setCategory] = useState('Creative')
  const [tags, setTags] = useState('')

  if (!isOpen) return null

  const handleTokenize = () => {
    const options: TokenizationOptions = {
      protocol: selectedProtocol,
      name: tokenName,
      symbol: tokenSymbol,
      supply: totalSupply,
      decimals,
      description,
      royaltyPercentage,
      price: tokenPrice,
      metadata: {
        creator: author,
        genre: category,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }
    }
    onTokenize(selectedProtocol, options)
    onClose()
  }

  const selectedProtocolInfo = TOKENIZATION_PROTOCOLS.find(p => p.id === selectedProtocol)
  const isAsset = selectedProtocol === 'bsv21' || selectedProtocol === '1sat'

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatSize = (bytes: number) => {
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-black border border-zinc-800"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-800">
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">Tokenize Video</h2>
              <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">Create Bitcoin Asset</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-900 transition-colors"
            >
              <FiX className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Video Info */}
            <div className="p-4 bg-zinc-900/50 border border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-800">
                  <FiFileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{videoTitle || 'Untitled Video'}</h3>
                  <p className="text-xs text-zinc-500 font-mono">
                    {formatDuration(videoDuration)} • {formatSize(videoSize)}
                  </p>
                </div>
              </div>
            </div>

            {/* Protocol Selection */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
                Select Protocol
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {TOKENIZATION_PROTOCOLS.map(protocol => (
                  <button
                    key={protocol.id}
                    onClick={() => setSelectedProtocol(protocol.id)}
                    className={`p-3 border text-left transition-all ${
                      selectedProtocol === protocol.id
                        ? 'bg-white text-black border-white'
                        : 'bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    <div className="font-bold text-sm">{protocol.name}</div>
                    <div className="text-[10px] opacity-70 truncate">{protocol.description}</div>
                  </button>
                ))}
              </div>
              {selectedProtocolInfo && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedProtocolInfo.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 uppercase tracking-wider"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Token Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  Token Name
                </label>
                <input
                  type="text"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
                  placeholder="My Video Token"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  Symbol
                </label>
                <input
                  type="text"
                  value={tokenSymbol}
                  onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 font-mono"
                  placeholder="VID"
                  maxLength={10}
                />
              </div>

              {!isAsset && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                      Total Supply
                    </label>
                    <input
                      type="number"
                      value={totalSupply}
                      onChange={(e) => setTotalSupply(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 font-mono"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                      Decimals
                    </label>
                    <input
                      type="number"
                      value={decimals}
                      onChange={(e) => setDecimals(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 font-mono"
                      min="0"
                      max="18"
                    />
                  </div>
                </>
              )}

              {isAsset && (
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                    Edition Size
                  </label>
                  <input
                    type="number"
                    value={totalSupply}
                    onChange={(e) => setTotalSupply(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 font-mono"
                    min="1"
                    placeholder="1"
                  />
                </div>
              )}

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  <FiDollarSign className="w-3 h-3" />
                  Price (USD)
                </label>
                <input
                  type="number"
                  value={tokenPrice}
                  onChange={(e) => setTokenPrice(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 font-mono"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  <FiPercent className="w-3 h-3" />
                  Royalty %
                </label>
                <input
                  type="number"
                  value={royaltyPercentage}
                  onChange={(e) => setRoyaltyPercentage(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 font-mono"
                  min="0"
                  max="50"
                />
                <p className="text-[10px] text-zinc-600 mt-1">Earn {royaltyPercentage}% on secondary sales</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 resize-none"
                placeholder="Describe your token..."
                rows={3}
              />
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  <FiUser className="w-3 h-3" />
                  Creator
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-zinc-600"
                >
                  <option value="Creative">Creative</option>
                  <option value="Music">Music</option>
                  <option value="Film">Film</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Education">Education</option>
                  <option value="Business">Business</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  <FiTag className="w-3 h-3" />
                  Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
                  placeholder="video, nft, art (comma separated)"
                />
              </div>
            </div>

            {/* Cost Estimation */}
            <div className="p-4 bg-zinc-900/50 border border-zinc-800">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Estimated Costs</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Protocol Fee</span>
                  <span className="text-white font-mono">~$0.05</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Token Creation</span>
                  <span className="text-white font-mono">~$0.10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Metadata Storage</span>
                  <span className="text-white font-mono">~$0.02</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-zinc-800">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-white font-mono font-bold">~$0.17</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-800">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-zinc-700 text-zinc-400 text-xs font-bold uppercase tracking-widest hover:border-zinc-500 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleTokenize}
              className="px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
            >
              Create Token
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
