'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

type MintType = 'domain' | 'email' | 'paymail' | 'content';

export default function MintPage() {
  const [mintType, setMintType] = useState<MintType>('domain');
  const [identifier, setIdentifier] = useState('');
  const [supply, setSupply] = useState('1000000000');
  const [dividendRate, setDividendRate] = useState(100);
  const [accessRate, setAccessRate] = useState(1);

  const getPlaceholder = () => {
    switch (mintType) {
      case 'domain': return 'alice.com';
      case 'email': return 'alice@example.com';
      case 'paymail': return 'alice@handcash.io';
      case 'content': return 'https://alice.com/video.mp4';
    }
  };

  const getTokenSymbol = () => {
    if (!identifier) return 'TOKEN';
    return identifier.replace(/[@\.]/g, '_').split('/')[0].toUpperCase().slice(0, 10);
  };

  const totalTokens = parseInt(supply) || 0;
  const baseUnits = Math.floor(totalTokens / accessRate);
  const hours = Math.floor(baseUnits / 3600);
  const mins = Math.floor((baseUnits % 3600) / 60);
  const secs = baseUnits % 60;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-mono">
      <main className="w-full px-4 md:px-8 py-16 max-w-[1920px] mx-auto">
        {/* PageHeader */}
        <header className="mb-8 border-b border-zinc-200 dark:border-zinc-900 pb-6 flex items-end justify-between overflow-hidden relative">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 mb-4 text-zinc-500 text-xs tracking-widest uppercase"
            >
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              Token Creation Protocol
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl md:text-6xl font-black tracking-tighter mb-2"
            >
              MINT<span className="text-zinc-300 dark:text-zinc-800">.SYS</span>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-zinc-500 max-w-lg"
            >
              <b>Deploy BSV-21 Tokens.</b> Create tradable access tokens for domains, identities, and content.
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 0.1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "backOut" }}
            className="hidden md:block text-6xl"
          >
            🪙
          </motion.div>
        </header>

        {/* Demo Banner */}
        <div className="mb-8 border border-amber-500/30 bg-amber-500/5 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-amber-500 rounded-full" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Preview Mode — Download the desktop client to mint tokens on BSV
            </span>
          </div>
          <Link href="/download" className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 hover:text-black dark:hover:text-white transition-colors">
            Download →
          </Link>
        </div>

        {/* 3-Column Form Layout */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Column 1: Asset Details */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
              Asset Details
            </h3>
            <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-950 border-l-2 border-zinc-900 dark:border-white">
              <p className="text-xs text-zinc-700 dark:text-zinc-300">
                Define what you&apos;re tokenizing. This creates a tradable BSV-21 token that represents access rights to your asset.
              </p>
            </div>
            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-6 space-y-4">
              <div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {(['domain', 'email', 'paymail', 'content'] as MintType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => { setMintType(type); setIdentifier(''); }}
                      className={`px-2 py-1.5 text-xs font-bold uppercase tracking-wider border transition-colors ${mintType === type
                        ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                        : 'bg-white dark:bg-black text-zinc-500 border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={getPlaceholder()}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
                <p className="text-xs text-zinc-500 mt-1">The {mintType} you want to tokenize</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">Token Symbol</label>
                <div className="px-3 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono">
                  ${getTokenSymbol()}
                </div>
                <p className="text-xs text-zinc-500 mt-1">Auto-generated from identifier</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">Total Supply</label>
                <input
                  type="number"
                  value={supply}
                  onChange={(e) => setSupply(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors font-mono"
                />
                <p className="text-xs text-zinc-500 mt-1">Total tokens to create (immutable)</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">Description</label>
                <textarea
                  placeholder="What does this token provide access to?"
                  rows={4}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Column 2: Payment & Economics */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
              Payment & Economics
            </h3>
            <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-950 border-l-2 border-zinc-900 dark:border-white">
              <p className="text-xs text-zinc-700 dark:text-zinc-300">
                Your payment address is permanently inscribed in the token. All token sales route payments here. Dividends are auto-distributed to stakers.
              </p>
            </div>
            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">Payment Address</label>
                <input
                  type="text"
                  placeholder="alice@handcash.io or 1AliceXYZ..."
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors font-mono text-sm"
                />
                <p className="text-xs text-zinc-500 mt-1">Canonical address inscribed in token</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">Dividend Rate</label>
                <div className="border border-zinc-200 dark:border-zinc-800 p-4 mb-2">
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl font-bold text-black dark:text-white font-mono">{dividendRate}%</span>
                    <span className="text-xs text-zinc-500">to stakers</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={dividendRate}
                    onChange={(e) => setDividendRate(parseInt(e.target.value))}
                    className="w-full h-1 bg-zinc-200 dark:bg-zinc-700 appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-zinc-500 mt-2">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-500">Percentage auto-distributed to stakers on all payments</p>
              </div>

              <div className="border-l-2 border-black dark:border-white pl-3 py-2 bg-zinc-50 dark:bg-zinc-950">
                <p className="text-xs font-medium text-zinc-900 dark:text-white mb-1">How dividends work</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  {dividendRate === 100
                    ? 'All payments are automatically distributed to stakers proportionally.'
                    : `${dividendRate}% of all payments are distributed to stakers. ${100 - dividendRate}% goes to the payment address.`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Column 3: Access Settings */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
              Access Settings
            </h3>
            <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-950 border-l-2 border-zinc-900 dark:border-white">
              <p className="text-xs text-zinc-700 dark:text-zinc-300">
                Control how fast tokens are consumed during access. Higher rates mean shorter access times but higher per-second value.
              </p>
            </div>
            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">Access Mode</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'burn', title: 'Burn on Use', desc: 'Tokens are consumed and destroyed' },
                    { id: 'continuous', title: 'Continuous Auth', desc: 'Verify ownership, don\'t burn tokens' },
                    { id: 'returnable', title: 'Returnable', desc: 'Unused tokens return to issuer on sign out' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      className="px-3 py-2 text-left border bg-white dark:bg-black text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white transition-colors first:bg-black first:dark:bg-white first:text-white first:dark:text-black first:border-black first:dark:border-white"
                    >
                      <div className="text-xs font-semibold mb-1">{mode.title}</div>
                      <div className="text-xs opacity-70">{mode.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">Burn Rate</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={accessRate}
                    onChange={(e) => setAccessRate(parseInt(e.target.value) || 1)}
                    min="1"
                    className="flex-1 px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors font-mono"
                  />
                  <span className="px-3 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono text-xs">per second</span>
                </div>
              </div>

              <div className="border-l-2 border-black dark:border-white pl-3 py-2 bg-zinc-50 dark:bg-zinc-950">
                <p className="text-xs font-medium text-zinc-900 dark:text-white mb-1">Total access time</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  {hours.toLocaleString()}h {mins}m {secs}s total
                </p>
              </div>

              <div className="pt-6 space-y-3">
                <Link
                  href="/download"
                  className="block w-full py-3 bg-black dark:bg-white text-white dark:text-black font-semibold text-center hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors text-sm"
                >
                  Download Client to Mint
                </Link>
                <p className="text-xs text-center text-zinc-500">
                  Requires the desktop client for BSV transaction signing
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
