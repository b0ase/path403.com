'use client';

import React, { useEffect, useState } from 'react';
import { FiPieChart, FiRefreshCw, FiExternalLink } from 'react-icons/fi';

interface ChainHolding {
  chain: 'bsv' | 'eth' | 'sol';
  address: string;
  balance: string;
  formattedBalance: string;
  tokenContract: string;
}

interface Holding {
  tokenSymbol: string;
  totalBalance: string;
  formattedBalance: string;
  percentage: number;
  chains: ChainHolding[];
}

interface PortfolioData {
  wallets: {
    bsv?: string;
    eth?: string;
    sol?: string;
  };
  holdings: Holding[];
  votingPower: string;
  formattedVotingPower: string;
  lastUpdated: string;
}

interface HoldingsDisplayProps {
  walletAddress?: string;
  walletProvider?: string;
  isDark?: boolean;
}

const CHAIN_COLORS = {
  bsv: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
  eth: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/50' },
  sol: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50' },
};

const CHAIN_NAMES = {
  bsv: 'Bitcoin SV',
  eth: 'Ethereum',
  sol: 'Solana',
};

export default function HoldingsDisplay({ walletAddress, walletProvider, isDark = true }: HoldingsDisplayProps) {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = async () => {
    if (!walletAddress) return;

    setLoading(true);
    setError(null);

    try {
      // Build query params based on wallet provider
      const params = new URLSearchParams();
      if (walletProvider === 'yours') {
        params.set('bsv', walletAddress);
      } else if (walletProvider === 'metamask') {
        params.set('eth', walletAddress);
      } else if (walletProvider === 'phantom') {
        params.set('sol', walletAddress);
      } else {
        // Try all chains
        params.set('bsv', walletAddress);
      }

      const res = await fetch(`/api/portfolio?${params}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setPortfolio(data);
      }
    } catch (err) {
      setError('Failed to fetch portfolio');
      console.error('Portfolio fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchPortfolio();
    }
  }, [walletAddress, walletProvider]);

  if (!walletAddress) {
    return (
      <div className={`border p-8 text-center ${isDark ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
        <FiPieChart size={24} className="mx-auto mb-3 opacity-50" />
        <p className="text-sm mb-2">Connect a wallet to view holdings</p>
        <p className="text-xs">Your token holdings across BSV, ETH, and SOL will appear here</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`border p-8 text-center ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="animate-spin w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-3" />
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Fetching holdings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`border p-8 text-center ${isDark ? 'border-gray-800 border-red-500/30' : 'border-gray-200 border-red-300'}`}>
        <p className="text-red-400 text-sm mb-2">{error}</p>
        <button
          onClick={fetchPortfolio}
          className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mx-auto"
        >
          <FiRefreshCw size={12} /> Try again
        </button>
      </div>
    );
  }

  if (!portfolio || portfolio.holdings.length === 0) {
    return (
      <div className={`border p-8 text-center ${isDark ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
        <FiPieChart size={24} className="mx-auto mb-3 opacity-50" />
        <p className="text-sm mb-2">No holdings found</p>
        <p className="text-xs">When you acquire tokens, they will appear here</p>
        <button
          onClick={fetchPortfolio}
          className="mt-4 text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mx-auto"
        >
          <FiRefreshCw size={12} /> Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Holdings List */}
      <div className={`border ${isDark ? 'border-gray-800 bg-black' : 'border-gray-200 bg-white'}`}>
        <div className={`px-4 py-3 border-b flex items-center justify-between ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="grid grid-cols-5 gap-4 text-xs uppercase tracking-wide text-gray-500 flex-1">
            <div>Token</div>
            <div>Chain</div>
            <div className="text-right">Balance</div>
            <div className="text-right">Ownership</div>
            <div className="text-right">Voting Power</div>
          </div>
          <button
            onClick={fetchPortfolio}
            className={`ml-4 p-2 transition-colors ${isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-black'}`}
            title="Refresh"
          >
            <FiRefreshCw size={14} />
          </button>
        </div>

        {portfolio.holdings.map((holding, i) => (
          <div
            key={holding.tokenSymbol}
            className={`px-4 py-4 ${i > 0 ? (isDark ? 'border-t border-gray-800' : 'border-t border-gray-200') : ''}`}
          >
            {/* Token Row */}
            <div className="grid grid-cols-5 gap-4 items-center">
              <div>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                  ${holding.tokenSymbol}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {holding.chains.map(chain => (
                  <span
                    key={chain.chain}
                    className={`text-[10px] px-2 py-0.5 uppercase ${CHAIN_COLORS[chain.chain].bg} ${CHAIN_COLORS[chain.chain].text} border ${CHAIN_COLORS[chain.chain].border}`}
                  >
                    {chain.chain}
                  </span>
                ))}
              </div>
              <div className={`text-right font-mono ${isDark ? 'text-white' : 'text-black'}`}>
                {holding.formattedBalance}
              </div>
              <div className={`text-right ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                {holding.percentage.toFixed(4)}%
              </div>
              <div className={`text-right font-mono ${isDark ? 'text-white' : 'text-black'}`}>
                {holding.formattedBalance}
              </div>
            </div>

            {/* Chain Breakdown (if multiple chains) */}
            {holding.chains.length > 1 && (
              <div className={`mt-3 pt-3 border-t ${isDark ? 'border-gray-800/50' : 'border-gray-200'}`}>
                <div className="text-xs text-gray-500 mb-2">Chain Breakdown:</div>
                <div className="grid grid-cols-3 gap-2">
                  {holding.chains.map(chain => (
                    <div
                      key={chain.chain}
                      className={`p-2 border ${isDark ? 'border-gray-800' : 'border-gray-200'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${CHAIN_COLORS[chain.chain].text}`}>
                          {CHAIN_NAMES[chain.chain]}
                        </span>
                        <span className={`text-xs font-mono ${isDark ? 'text-white' : 'text-black'}`}>
                          {chain.formattedBalance}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono truncate mt-1">
                        {chain.address.slice(0, 8)}...{chain.address.slice(-6)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className={`border p-4 ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className={`text-xs uppercase tracking-wide mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Total Holdings
          </div>
          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
            {portfolio.holdings.length}
          </div>
        </div>
        <div className={`border p-4 ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className={`text-xs uppercase tracking-wide mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Voting Power
          </div>
          <div className={`text-2xl font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
            {portfolio.formattedVotingPower}
          </div>
        </div>
        <div className={`border p-4 ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className={`text-xs uppercase tracking-wide mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Chains
          </div>
          <div className="flex gap-1 mt-1">
            {portfolio.wallets.bsv && (
              <span className="text-[10px] px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">BSV</span>
            )}
            {portfolio.wallets.eth && (
              <span className="text-[10px] px-2 py-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/50">ETH</span>
            )}
            {portfolio.wallets.sol && (
              <span className="text-[10px] px-2 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/50">SOL</span>
            )}
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className={`text-xs text-center ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
        Last updated: {new Date(portfolio.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
}
