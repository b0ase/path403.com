'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiExternalLink } from 'react-icons/fi'
import {
  TOKEN_REGISTRY,
  getTokensByCategory,
  getMintedTokens,
  type TokenInfo,
  type TokenStatus,
} from '@/lib/token-registry'

// Investment hierarchy with levels
const HIERARCHY_LEVELS = [
  {
    level: 0,
    name: 'STUDIO',
    description: 'Master yield token — exposure to everything',
    tokens: ['$BOASE'],
    color: 'yellow',
  },
  {
    level: 1,
    name: 'ENGINE',
    description: 'The AI that powers all products',
    tokens: ['$KINTSUGI'],
    color: 'purple',
  },
  {
    level: 2,
    name: 'COMPANIES',
    description: 'Index tokens for major ecosystems',
    tokens: ['$bCorp', '$NPG'],
    color: 'orange',
  },
  {
    level: 3,
    name: 'BAPPS_ECOSYSTEM',
    description: 'Bitcoin applications — part of $bCorp',
    category: 'bApps',
    color: 'orange',
  },
  {
    level: 3,
    name: 'NPG_ECOSYSTEM',
    description: 'Ninja Punk Girls properties — part of $NPG',
    category: 'npg',
    color: 'pink',
  },
  {
    level: 4,
    name: 'VENTURES',
    description: 'Individual products — all roll up to $BOASE',
    category: 'venture',
    color: 'cyan',
  },
]

function getStatusLabel(status: TokenStatus): { label: string; class: string } {
  switch (status) {
    case 'minted':
      return { label: 'LIVE', class: 'text-green-400' }
    case 'concept':
      return { label: 'MINTABLE', class: 'text-amber-400' }
    case 'planned':
      return { label: 'PLANNED', class: 'text-zinc-500' }
  }
}

function formatOwnership(ownership?: TokenInfo['ownership']): string {
  if (!ownership?.boaseOwnership) return '—'
  return `${ownership.boaseOwnership}%`
}

function formatMarketCap(pricing?: TokenInfo['pricing']): string {
  if (!pricing?.marketCap) return '—'
  const gbp = Math.round(pricing.marketCap * 0.79)
  if (gbp >= 1000000) return `£${(gbp / 1000000).toFixed(1)}M`
  if (gbp >= 1000) return `£${(gbp / 1000).toFixed(0)}K`
  return `£${gbp}`
}

export default function InvestPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  }

  // Get tokens by category
  const bAppsTokens = useMemo(() => getTokensByCategory('bApps'), [])
  const npgTokens = useMemo(() => getTokensByCategory('npg'), [])
  const ventureTokens = useMemo(() => getTokensByCategory('venture'), [])
  const mintedTokens = useMemo(() => getMintedTokens(), [])

  // Get specific tokens from registry
  const getTokensFromSymbols = (symbols: string[]): TokenInfo[] => {
    return symbols
      .map(s => TOKEN_REGISTRY[s])
      .filter(Boolean)
  }

  const renderTokenRow = (token: TokenInfo, index: number, showOwnership = true) => {
    const status = getStatusLabel(token.status)
    const ownership = token.ownership?.boaseOwnership

    return (
      <motion.div
        key={token.symbol}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.03 }}
        className="grid grid-cols-12 px-4 py-3 hover:bg-zinc-900/50 transition-colors group border-b border-zinc-900 last:border-b-0"
      >
        <div className="col-span-4 md:col-span-3">
          <span className="font-bold text-sm text-zinc-300 group-hover:text-white transition-colors">
            {token.symbol}
          </span>
          <span className="hidden md:inline text-xs text-zinc-600 ml-2">
            {token.name}
          </span>
        </div>
        <div className={`col-span-2 text-[10px] font-mono font-bold uppercase ${status.class}`}>
          {status.label}
        </div>
        {showOwnership && (
          <div className="col-span-2 text-sm font-mono text-right">
            {ownership ? (
              <span className={ownership === 100 ? 'text-green-400' : 'text-amber-400'}>
                {ownership}%
              </span>
            ) : (
              <span className="text-zinc-600">—</span>
            )}
          </div>
        )}
        <div className={`${showOwnership ? 'col-span-1' : 'col-span-2'} text-sm font-mono text-zinc-400 text-right hidden md:block`}>
          {formatMarketCap(token.pricing)}
        </div>
        <div className="col-span-4 md:col-span-4 flex justify-end gap-2">
          {token.status === 'minted' && token.marketUrl && (
            <a
              href={token.marketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 text-[10px] border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-all font-mono uppercase"
            >
              Trade
            </a>
          )}
          {token.projectSlug && (
            <Link
              href={`/invest/${token.projectSlug}`}
              className="px-2 py-1 text-[10px] border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white transition-all font-mono uppercase"
            >
              Invest
            </Link>
          )}
        </div>
      </motion.div>
    )
  }

  const renderSection = (
    title: string,
    description: string,
    tokens: TokenInfo[],
    color: string,
    level: number
  ) => {
    const colorClasses: Record<string, string> = {
      yellow: 'border-l-yellow-500 bg-yellow-500/5',
      purple: 'border-l-purple-500 bg-purple-500/5',
      orange: 'border-l-orange-500 bg-orange-500/5',
      pink: 'border-l-pink-500 bg-pink-500/5',
      cyan: 'border-l-cyan-500 bg-cyan-500/5',
      green: 'border-l-green-500 bg-green-500/5',
    }

    const textColors: Record<string, string> = {
      yellow: 'text-yellow-400',
      purple: 'text-purple-400',
      orange: 'text-orange-400',
      pink: 'text-pink-400',
      cyan: 'text-cyan-400',
      green: 'text-green-400',
    }

    return (
      <motion.div className="mb-8" variants={itemVariants}>
        <div className={`border-l-4 ${colorClasses[color]} pl-4 py-2 mb-4`}>
          <div className="flex items-baseline gap-3">
            <span className="text-[10px] font-mono text-zinc-600">L{level}</span>
            <h2 className={`text-lg font-bold uppercase tracking-tight ${textColors[color]}`}>
              {title.replace(/_/g, ' ')}
            </h2>
          </div>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-tight">
            {description}
          </p>
        </div>

        <div className="border border-zinc-900">
          <div className="grid grid-cols-12 px-4 py-2 border-b border-zinc-900 bg-zinc-900/20">
            <div className="col-span-4 md:col-span-3 text-[10px] text-zinc-600 uppercase tracking-widest font-mono font-bold">
              Token
            </div>
            <div className="col-span-2 text-[10px] text-zinc-600 uppercase tracking-widest font-mono font-bold">
              Status
            </div>
            <div className="col-span-2 text-[10px] text-zinc-600 uppercase tracking-widest text-right font-mono font-bold">
              $BOASE
            </div>
            <div className="col-span-1 text-[10px] text-zinc-600 uppercase tracking-widest text-right font-mono font-bold hidden md:block">
              FDV
            </div>
            <div className="col-span-4 text-[10px] text-zinc-600 uppercase tracking-widest text-right font-mono font-bold">
              Action
            </div>
          </div>
          <div>
            {tokens.map((token, i) => renderTokenRow(token, i))}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="min-h-screen bg-black text-white"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <section className="px-4 md:px-8 py-16">
        <div className="w-full">
          {/* Header */}
          <motion.div
            className="mb-12 border-b border-zinc-900 pb-4"
            variants={itemVariants}
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase">
              INVEST
            </h1>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-2 font-mono">
              Nested token architecture · {Object.keys(TOKEN_REGISTRY).length} tokens
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            className="flex flex-wrap gap-2 mb-12"
            variants={itemVariants}
          >
            {HIERARCHY_LEVELS.map((level, i) => (
              <a
                key={i}
                href={`#${level.name.toLowerCase()}`}
                className="px-3 py-1 text-[10px] border border-zinc-900 text-zinc-500 hover:border-white hover:text-white hover:bg-zinc-900/50 transition-all font-mono uppercase tracking-tight"
              >
                L{level.level} {level.name.replace(/_/g, ' ')}
              </a>
            ))}
            <a
              href="#live"
              className="px-3 py-1 text-[10px] border border-green-500/30 text-green-400 hover:border-green-400 hover:bg-green-500/10 transition-all font-mono uppercase tracking-tight"
            >
              LIVE TRADING
            </a>
          </motion.div>

          {/* Hierarchy Diagram with Real Ownership */}
          <motion.div
            className="mb-12 p-6 border border-zinc-900 bg-zinc-900/20"
            variants={itemVariants}
          >
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono mb-4">
              Investment Hierarchy · $BOASE Ownership Stakes
            </p>
            <div className="font-mono text-sm space-y-2">
              <p>
                <span className="text-yellow-400">$BOASE</span>
                <span className="text-zinc-600"> ─────────────────────── </span>
                <span className="text-green-400 font-bold">100%</span>
                <span className="text-zinc-500 ml-2">Master Token</span>
              </p>
              <p className="text-zinc-600 pl-4">↓ owns</p>
              <p className="pl-4">
                <span className="text-purple-400">$KINTSUGI</span>
                <span className="text-zinc-600"> ─────────────────── </span>
                <span className="text-green-400 font-bold">100%</span>
                <span className="text-zinc-500 ml-2">AI Engine</span>
              </p>
              <p className="text-zinc-600 pl-8">↓ powers</p>
              <div className="pl-8 space-y-1">
                <p>
                  <span className="text-orange-400">$bCorp</span>
                  <span className="text-zinc-600"> ──────────────────────── </span>
                  <span className="text-green-400 font-bold">99%</span>
                  <span className="text-zinc-500 ml-2">bApps ecosystem</span>
                </p>
                <p>
                  <span className="text-pink-400">$NPG</span>
                  <span className="text-zinc-600"> ─────────────────────────── </span>
                  <span className="text-amber-400 font-bold">85.35%</span>
                  <span className="text-zinc-500 ml-2">Entertainment</span>
                </p>
              </div>
              <p className="text-zinc-600 pl-12">↓ contain</p>
              <p className="pl-12">
                <span className="text-cyan-400">50+ Product Tokens</span>
                <span className="text-zinc-600"> ────────── </span>
                <span className="text-green-400">100%</span>
                <span className="text-zinc-500 ml-2">each</span>
              </p>
            </div>
            <p className="text-[10px] text-zinc-600 mt-4 font-mono">
              * Ownership is dynamic. External investors hold 14.65% of $NPG and 1% of $bCorp.
            </p>
          </motion.div>

          {/* Level 0: Studio */}
          <div id="studio">
            {renderSection(
              'STUDIO',
              'Master yield token — exposure to everything',
              getTokensFromSymbols(['$BOASE']),
              'yellow',
              0
            )}
          </div>

          {/* Level 1: Engine */}
          <div id="engine">
            {renderSection(
              'ENGINE',
              'The AI that powers all products',
              getTokensFromSymbols(['$KINTSUGI']),
              'purple',
              1
            )}
          </div>

          {/* Level 2: Companies */}
          <div id="companies">
            {renderSection(
              'COMPANIES',
              'Index tokens for major ecosystems',
              getTokensFromSymbols(['$bCorp', '$NPG']),
              'orange',
              2
            )}
          </div>

          {/* Level 3: bApps Ecosystem */}
          <div id="bapps_ecosystem">
            {renderSection(
              'BAPPS_ECOSYSTEM',
              'Bitcoin applications — part of $bCorp',
              bAppsTokens,
              'orange',
              3
            )}
          </div>

          {/* Level 3: NPG Ecosystem */}
          <div id="npg_ecosystem">
            {renderSection(
              'NPG_ECOSYSTEM',
              'Ninja Punk Girls properties — part of $NPG',
              npgTokens,
              'pink',
              3
            )}
          </div>

          {/* Level 4: Ventures */}
          <div id="ventures">
            {renderSection(
              'VENTURES',
              'Individual products — all roll up to $BOASE',
              ventureTokens,
              'cyan',
              4
            )}
          </div>

          {/* Live Trading Section */}
          <motion.div id="live" className="mb-8" variants={itemVariants}>
            <div className="border-l-4 border-l-green-500 bg-green-500/5 pl-4 py-2 mb-4">
              <div className="flex items-baseline gap-3">
                <span className="text-[10px] font-mono text-green-600">LIVE</span>
                <h2 className="text-lg font-bold uppercase tracking-tight text-green-400">
                  TRADING NOW
                </h2>
              </div>
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-tight">
                These tokens are minted and trading on 1Sat Market
              </p>
            </div>

            <div className="border border-zinc-900">
              <div className="grid grid-cols-12 px-4 py-2 border-b border-zinc-900 bg-zinc-900/20">
                <div className="col-span-4 md:col-span-3 text-[10px] text-zinc-600 uppercase tracking-widest font-mono font-bold">
                  Token
                </div>
                <div className="col-span-2 text-[10px] text-zinc-600 uppercase tracking-widest font-mono font-bold">
                  Status
                </div>
                <div className="col-span-2 text-[10px] text-zinc-600 uppercase tracking-widest text-right font-mono font-bold">
                  $BOASE
                </div>
                <div className="col-span-1 text-[10px] text-zinc-600 uppercase tracking-widest text-right font-mono font-bold hidden md:block">
                  FDV
                </div>
                <div className="col-span-4 text-[10px] text-zinc-600 uppercase tracking-widest text-right font-mono font-bold">
                  Action
                </div>
              </div>
              <div>
                {mintedTokens.map((token, i) => renderTokenRow(token, i))}
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <a
                href="https://1sat.market"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-green-500/30 text-green-400 text-[10px] font-bold uppercase tracking-widest hover:bg-green-500/10 transition-all font-mono"
              >
                View on 1Sat Market <FiExternalLink size={10} />
              </a>
            </div>
          </motion.div>

          {/* Footer CTA */}
          <motion.div
            className="mt-16 pt-8 border-t border-zinc-900"
            variants={itemVariants}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <p className="text-xs text-zinc-500 mb-2 font-mono uppercase">
                  All prices in GBP. Token investments carry high risk.
                </p>
                <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-tight">
                  Not financial advice · For sophisticated investors only
                </p>
              </div>
              <div className="flex gap-4">
                <Link
                  href="/dividends"
                  className="px-6 py-3 border border-zinc-900 text-zinc-400 text-[10px] font-bold uppercase tracking-widest hover:border-white hover:text-white transition-all font-mono"
                >
                  Revenue Flow
                </Link>
                <Link
                  href="/invest/boase"
                  className="px-6 py-3 bg-yellow-500 text-black text-[10px] font-bold uppercase tracking-widest hover:bg-yellow-400 transition-all font-mono"
                >
                  Invest in $BOASE
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}
