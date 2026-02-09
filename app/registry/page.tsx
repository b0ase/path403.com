'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { TOKEN_CONFIG } from '@/lib/types';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 }
};

interface Holder {
  address: string;
  handle?: string;
  balance: number;
  percentage: number;
}

interface CapTableData {
  holders: Holder[];
  stats: {
    totalHolders: number;
    totalCirculating: number;
    totalStaked: number;
    treasuryBalance: number;
  };
}

interface OnChainData {
  onChain: {
    treasuryAddress: string;
    treasuryBalance: number;
    circulatingSupply: number;
    holders: Array<{ address: string; balance: number }>;
    totalHolders: number;
  };
  database: {
    holders: Array<{ address: string; balance: number }>;
    totalHolders: number;
    totalCirculating: number;
  };
  comparison: {
    inSync: boolean;
    discrepancies: Array<{
      address: string;
      onChain: number;
      database: number;
      difference: number;
    }>;
  };
  warning: string | null;
}

export default function RegistryPage() {
  const [data, setData] = useState<CapTableData | null>(null);
  const [onChainData, setOnChainData] = useState<OnChainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnChain, setShowOnChain] = useState(false);

  useEffect(() => {
    fetchCapTable();
    fetchOnChainData();
  }, []);

  const fetchCapTable = async () => {
    try {
      const response = await fetch('/api/token/cap-table');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch cap table:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOnChainData = async () => {
    try {
      const response = await fetch('/api/token/onchain');
      if (response.ok) {
        const result = await response.json();
        setOnChainData(result);
      }
    } catch (error) {
      console.error('Failed to fetch on-chain data:', error);
    }
  };

  const formatNumber = (n: number | undefined | null) => (n ?? 0).toLocaleString();

  // Compact format for stats boxes (1B, 500M, etc.)
  const formatCompact = (n: number | undefined | null) => {
    const num = n ?? 0;
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(num % 1_000_000_000 === 0 ? 0 : 1)}B`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1)}K`;
    return num.toLocaleString();
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const stats = [
    { label: "Total Supply", value: formatCompact(TOKEN_CONFIG.totalSupply), fullValue: formatNumber(TOKEN_CONFIG.totalSupply) },
    { label: "Circulating", value: loading ? '...' : formatCompact(data?.stats.totalCirculating || 0), fullValue: loading ? '...' : formatNumber(data?.stats.totalCirculating || 0) },
    { label: "Total Staked", value: loading ? '...' : formatCompact(data?.stats.totalStaked || 0), fullValue: loading ? '...' : formatNumber(data?.stats.totalStaked || 0) },
    { label: "Holders", value: loading ? '...' : data?.stats.totalHolders || 0, fullValue: loading ? '...' : data?.stats.totalHolders || 0 },
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white pt-20">
      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeIn}>
            <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-sm mb-4 inline-block">
              ← Back to Home
            </Link>
          </motion.div>
          <motion.h1
            className="text-5xl font-bold tracking-tight mb-4 text-zinc-900 dark:text-white"
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            Token Registry
          </motion.h1>
          <motion.p
            className="text-zinc-600 dark:text-zinc-400 text-lg"
            variants={fadeIn}
            transition={{ delay: 0.2 }}
          >
            Cap table for {TOKEN_CONFIG.displaySymbol} token holders
          </motion.p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              className="border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-950 overflow-hidden"
              variants={scaleIn}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{
                borderColor: "rgba(96, 165, 250, 0.5)",
                y: -2,
                transition: { duration: 0.2 }
              }}
            >
              <div className="text-zinc-600 dark:text-zinc-400 text-xs mb-1">{stat.label}</div>
              <motion.div
                className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                title={String(stat.fullValue)}
              >
                {stat.value}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* On-Chain Sync Status - only show if there's an actual problem */}
        {onChainData && !onChainData.comparison.inSync && onChainData.onChain.circulatingSupply > 0 && (
          <motion.div
            className="border border-blue-500/50 bg-blue-500/10 p-4 mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">External indexer syncing</span>
            </div>
            <p className="text-blue-400/80 text-sm">
              Third-party indexer (GorillaPool) is catching up. Your balance is tracked locally and accurate.
            </p>
          </motion.div>
        )}

        {/* Treasury Info */}
        <motion.div
          className="border border-zinc-200 dark:border-zinc-800 p-6 mb-12 bg-zinc-50 dark:bg-zinc-950 "
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ borderColor: "rgba(96, 165, 250, 0.5)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-zinc-600 dark:text-zinc-400 text-sm mb-1">Treasury</div>
              <div className="font-mono text-sm text-zinc-900 dark:text-white">{TOKEN_CONFIG.txId.slice(0, 20)}...</div>
            </div>
            <button
              onClick={() => setShowOnChain(!showOnChain)}
              className="text-sm text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
            >
              {showOnChain ? 'Hide' : 'Show'} On-Chain State
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Database State */}
            <div>
              <div className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Database (Off-Chain)</div>
              <div className="text-xl font-bold text-zinc-900 dark:text-white">
                {loading ? '...' : formatNumber(data?.stats.treasuryBalance || TOKEN_CONFIG.totalSupply)}
              </div>
              <div className="text-zinc-500 text-sm">
                {loading
                  ? '...'
                  : `${(((data?.stats.treasuryBalance || TOKEN_CONFIG.totalSupply) / TOKEN_CONFIG.totalSupply) * 100).toFixed(2)}%`}
              </div>
            </div>

            {/* On-Chain State */}
            <div>
              <div className="text-zinc-500 text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                On-Chain (BSV-20)
                {onChainData?.comparison.inSync ? (
                  <span className="text-green-400 text-xs">IN SYNC</span>
                ) : (
                  <span className="text-yellow-600 dark:text-yellow-400 text-xs">OUT OF SYNC</span>
                )}
              </div>
              <div className="text-xl font-bold text-zinc-900 dark:text-white">
                {onChainData ? formatNumber(onChainData.onChain.treasuryBalance) : '...'}
              </div>
              <div className="text-zinc-500 text-sm">
                {onChainData
                  ? `${((onChainData.onChain.treasuryBalance / TOKEN_CONFIG.totalSupply) * 100).toFixed(2)}%`
                  : '...'}
              </div>
            </div>
          </div>

          {/* Expanded On-Chain Details */}
          <AnimatePresence>
            {showOnChain && onChainData && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800"
              >
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  <strong>On-Chain Holders:</strong> {onChainData.onChain.totalHolders}
                </div>

                {onChainData.onChain.holders.length > 0 ? (
                  <div className="space-y-2">
                    {onChainData.onChain.holders.map((holder, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="font-mono text-zinc-600 dark:text-zinc-400">{truncateAddress(holder.address)}</span>
                        <span className="text-zinc-900 dark:text-white">{formatNumber(holder.balance)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-zinc-500 text-sm">All tokens in treasury (no transfers yet)</div>
                )}

                {onChainData.comparison.discrepancies.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 ">
                    <div className="text-yellow-600 dark:text-yellow-400 text-sm font-medium mb-2">Discrepancies:</div>
                    {onChainData.comparison.discrepancies.map((d, i) => (
                      <div key={i} className="text-xs text-yellow-600/80 dark:text-yellow-400/80">
                        {truncateAddress(d.address)}: DB={formatNumber(d.database)}, Chain={formatNumber(d.onChain)}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Cap Table */}
        <motion.div
          className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 "
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-white">Token Holders</h2>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                className="p-12 text-center text-zinc-600 dark:text-zinc-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Loading cap table...
              </motion.div>
            ) : !data?.holders?.length ? (
              <motion.div
                key="empty"
                className="p-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-zinc-600 dark:text-zinc-400 mb-4">No token holders yet</div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/token"
                    className="inline-block px-6 py-3 bg-white text-black font-medium hover:bg-zinc-200 transition-colors "
                  >
                    Buy Tokens
                  </Link>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="table"
                className="overflow-x-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-zinc-500 text-sm border-b border-zinc-200 dark:border-zinc-800">
                      <th className="px-6 py-4">Rank</th>
                      <th className="px-6 py-4">Holder</th>
                      <th className="px-6 py-4 text-right">Balance</th>
                      <th className="px-6 py-4 text-right">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.holders.map((holder, index) => (
                      <motion.tr
                        key={holder.address}
                        className="border-b border-zinc-200 dark:border-zinc-800"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: "rgba(96, 165, 250, 0.05)" }}
                      >
                        <td className="px-6 py-4 text-zinc-500">#{index + 1}</td>
                        <td className="px-6 py-4">
                          {holder.handle ? (
                            <span className="text-green-600 dark:text-green-400">@{holder.handle}</span>
                          ) : (
                            <span className="font-mono text-sm text-zinc-900 dark:text-white">{truncateAddress(holder.address)}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-zinc-900 dark:text-white">
                          {formatNumber(holder.balance)}
                        </td>
                        <td className="px-6 py-4 text-right text-zinc-500">
                          {holder.percentage.toFixed(4)}%
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Token Info */}
        <motion.div
          className="mt-12 border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50 dark:bg-zinc-950 "
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          transition={{ duration: 0.6 }}
          whileHover={{ borderColor: "rgba(96, 165, 250, 0.5)" }}
        >
          <h3 className="font-medium mb-4 text-zinc-900 dark:text-white">Token Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-zinc-500">Symbol:</span>{' '}
              <span className="font-mono text-zinc-900 dark:text-white">{TOKEN_CONFIG.displaySymbol}</span>
              <span className="text-zinc-400 text-xs ml-2">(on-chain: {TOKEN_CONFIG.symbol})</span>
            </div>
            <div>
              <span className="text-zinc-500">Protocol:</span>{' '}
              <span className="font-mono text-zinc-900 dark:text-white">{TOKEN_CONFIG.protocol}</span>
            </div>
            <div className="md:col-span-2">
              <span className="text-zinc-500">Inscription ID:</span>{' '}
              <a
                href={TOKEN_CONFIG.marketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 break-all"
              >
                {TOKEN_CONFIG.inscriptionId}
              </a>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="mt-8 flex flex-wrap gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeIn}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href="/token"
              className="inline-block px-6 py-3 bg-white text-black font-medium hover:bg-zinc-200 transition-colors "
            >
              Buy Tokens
            </Link>
          </motion.div>
          <motion.a
            href={TOKEN_CONFIG.marketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white hover:border-zinc-500 dark:hover:border-white transition-colors "
            variants={fadeIn}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            View on 1SatOrdinals
          </motion.a>
        </motion.div>
      </div>
    </main>
  );
}
