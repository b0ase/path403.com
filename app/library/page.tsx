'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useWallet } from '@/components/WalletProvider';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

interface LibraryToken {
  tokenAddress: string;
  symbol: string;
  name: string;
  balance: number;
  avgCost: number;
  currentPrice: number;
  value: number;
  pnl: number;
  contentType?: string;
  description?: string;
  issuer?: string;
  accessRate?: number;
  accessUrl?: string;
}

interface TokenDetail {
  address: string;
  symbol: string;
  name: string;
  description: string;
  contentType: string;
  issuer: string;
  accessRate: number;
  totalSupply: number;
  accessUrl?: string;
}

const formatNumber = (n: number | undefined | null) => (n ?? 0).toLocaleString();
const formatSats = (sats: number | undefined | null) => {
  const val = sats ?? 0;
  if (val >= 100000000) return `${(val / 100000000).toFixed(4)} BSV`;
  return `${formatNumber(val)} sats`;
};

export default function LibraryPage() {
  const { wallet, connectHandCash } = useWallet();
  const [tokens, setTokens] = useState<LibraryToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [tokenDetail, setTokenDetail] = useState<TokenDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchHoldings = useCallback(async () => {
    if (!wallet.handle) {
      setLoading(false);
      return;
    }
    try {
      const headers: Record<string, string> = {
        'x-wallet-handle': wallet.handle,
      };
      if (wallet.provider) headers['x-wallet-provider'] = wallet.provider;

      const res = await fetch('/api/tokens/holdings', { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.holdings)) setTokens(data.holdings);
      }
    } catch (error) {
      console.error('Failed to fetch holdings:', error);
    } finally {
      setLoading(false);
    }
  }, [wallet.handle, wallet.provider]);

  useEffect(() => {
    if (wallet.connected) {
      fetchHoldings();
    } else {
      setLoading(false);
    }
  }, [wallet.connected, fetchHoldings]);

  const selectToken = async (address: string) => {
    setSelectedToken(address);
    setLoadingDetail(true);
    setTokenDetail(null);

    try {
      const res = await fetch(`/api/tokens/${address}`);
      if (res.ok) {
        const data = await res.json();
        setTokenDetail(data);
      }
    } catch (error) {
      console.error('Failed to fetch token detail:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const selectedHolding = tokens.find(t => t.tokenAddress === selectedToken);
  const totalValue = tokens.reduce((sum, t) => sum + (t.value || 0), 0);

  if (!wallet.connected) {
    return (
      <div className="min-h-screen bg-white dark:bg-black pt-20 px-6 md:px-16">
        <div className="max-w-[1920px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500 mb-6">
            HTTP_200: ACCESS_GRANTED
          </div>
          <h1 className="text-2xl font-mono font-bold text-zinc-900 dark:text-white uppercase tracking-tight mb-4">
            LIBRARY<span className="text-zinc-300 dark:text-zinc-700">.SYS</span>
          </h1>
          <p className="text-zinc-500 text-sm mb-8">Connect your wallet to view your content library.</p>
          <button
            onClick={connectHandCash}
            className="px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-xs hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black pt-20 px-6 md:px-16">
        <div className="max-w-[1920px] mx-auto">
          <div className="text-zinc-500 text-sm font-mono animate-pulse">Loading library...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-20 px-6 md:px-16 pb-20">
      <div className="max-w-[1920px] mx-auto">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
          {/* Header */}
          <motion.div className="mb-6" variants={fadeIn}>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500 mb-4">
                  HTTP_200: ACCESS_GRANTED
                </div>
                <div className="text-[10px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-1">
                  Content Token Holdings
                </div>
                <h1 className="text-3xl font-mono font-bold text-zinc-900 dark:text-white uppercase tracking-tight">
                  LIBRARY<span className="text-zinc-300 dark:text-zinc-700">.SYS</span>
                </h1>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Tokens</div>
                  <div className="text-xl font-mono font-bold text-zinc-900 dark:text-white">{tokens.length}</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Value</div>
                  <div className="text-xl font-mono font-bold text-zinc-900 dark:text-white">{formatSats(totalValue)}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {tokens.length === 0 ? (
            <motion.div
              className="border border-zinc-200 dark:border-zinc-800 p-12 bg-zinc-50 dark:bg-zinc-950 text-center"
              variants={fadeIn}
            >
              <div className="text-zinc-400 dark:text-zinc-600 mb-2">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-mono font-bold text-zinc-900 dark:text-white mb-2">Your library is empty</h3>
              <p className="text-zinc-500 text-sm mb-6">Acquire content tokens on the Exchange to build your collection.</p>
              <Link
                href="/exchange"
                className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-widest hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors inline-block"
              >
                Visit Exchange
              </Link>
            </motion.div>
          ) : (
            <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-4" variants={fadeIn}>
              {/* Content Detail Panel (left 2/3) */}
              <div className="lg:col-span-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 min-h-[400px]">
                {selectedToken && selectedHolding ? (
                  <div className="p-6">
                    {loadingDetail ? (
                      <div className="text-zinc-500 text-sm font-mono animate-pulse">Loading details...</div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-mono font-bold text-zinc-900 dark:text-white">
                              {tokenDetail?.symbol || selectedHolding.symbol || selectedHolding.name}
                            </h2>
                            {(selectedHolding.contentType || tokenDetail?.contentType) && (
                              <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                                {tokenDetail?.contentType || selectedHolding.contentType}
                              </span>
                            )}
                          </div>
                          {(tokenDetail?.description || selectedHolding.description) && (
                            <p className="text-zinc-500 text-sm">
                              {tokenDetail?.description || selectedHolding.description}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
                            <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-1">Balance</div>
                            <div className="text-lg font-mono font-bold text-zinc-900 dark:text-white">
                              {formatNumber(selectedHolding.balance)}
                            </div>
                          </div>
                          <div className="p-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
                            <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-1">Value</div>
                            <div className="text-lg font-mono font-bold text-zinc-900 dark:text-white">
                              {formatSats(selectedHolding.value)}
                            </div>
                          </div>
                          <div className="p-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
                            <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-1">Avg Cost</div>
                            <div className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
                              {formatSats(selectedHolding.avgCost)}
                            </div>
                          </div>
                          <div className="p-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
                            <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-1">P&L</div>
                            <div className={`text-sm font-mono font-bold ${selectedHolding.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {selectedHolding.pnl >= 0 ? '+' : ''}{formatSats(selectedHolding.pnl)}
                            </div>
                          </div>
                        </div>

                        {tokenDetail && (
                          <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                            {tokenDetail.issuer && (
                              <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Issuer</span>
                                <span className="font-mono text-zinc-900 dark:text-white">{tokenDetail.issuer}</span>
                              </div>
                            )}
                            {tokenDetail.accessRate > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Access Rate</span>
                                <span className="font-mono text-zinc-900 dark:text-white">{tokenDetail.accessRate} tok/sec</span>
                              </div>
                            )}
                            {tokenDetail.totalSupply > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Total Supply</span>
                                <span className="font-mono text-zinc-900 dark:text-white">{formatNumber(tokenDetail.totalSupply)}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {(tokenDetail?.accessUrl || selectedHolding.accessUrl) && (
                          <div className="pt-2">
                            <a
                              href={tokenDetail?.accessUrl || selectedHolding.accessUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-widest hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors inline-block"
                            >
                              Access Content
                            </a>
                          </div>
                        )}

                        <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 break-all">
                          {selectedToken}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[400px]">
                    <div className="text-center">
                      <div className="text-zinc-300 dark:text-zinc-700 mb-3">
                        <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <p className="text-zinc-400 dark:text-zinc-600 text-sm font-mono">Select an item from your archive</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Archive Index (right 1/3) */}
              <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
                <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Archive Index</div>
                </div>
                <div className="max-h-[500px] overflow-y-auto">
                  {tokens.map((token) => (
                    <button
                      key={token.tokenAddress}
                      onClick={() => selectToken(token.tokenAddress)}
                      className={`w-full text-left p-4 border-b border-zinc-100 dark:border-zinc-900 transition-colors ${
                        selectedToken === token.tokenAddress
                          ? 'bg-zinc-900 dark:bg-white text-white dark:text-black'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-mono font-bold ${
                          selectedToken === token.tokenAddress
                            ? 'text-white dark:text-black'
                            : 'text-zinc-900 dark:text-white'
                        }`}>
                          {token.symbol || token.name}
                        </span>
                        {token.contentType && (
                          <span className={`text-[8px] uppercase tracking-widest px-1.5 py-0.5 ${
                            selectedToken === token.tokenAddress
                              ? 'bg-white/20 dark:bg-black/20'
                              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                          }`}>
                            {token.contentType}
                          </span>
                        )}
                      </div>
                      <div className={`text-[10px] font-mono ${
                        selectedToken === token.tokenAddress
                          ? 'text-white/70 dark:text-black/70'
                          : 'text-zinc-500'
                      }`}>
                        {formatNumber(token.balance)} tokens
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
