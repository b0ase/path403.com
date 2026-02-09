'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiPackage, FiZap, FiClock, FiExternalLink } from 'react-icons/fi';

interface Holding {
  token_id: string;
  token_name: string;
  token_description: string | null;
  content_type: string | null;
  access_url: string | null;
  balance: number;
  total_acquired: number;
  total_spent_sats: number;
  current_value_sats: number;
  formatted_value: string;
  first_acquired: string;
  last_acquired: string | null;
}

interface HoldingsSummary {
  total_tokens: number;
  total_balance: number;
  total_value_sats: number;
  total_spent_sats: number;
  formatted_value: string;
  formatted_spent: string;
}

interface HoldingsPanelProps {
  userHandle?: string;
  onSelectToken?: (tokenId: string) => void;
  refreshTrigger?: number;
}

export const HoldingsPanel: React.FC<HoldingsPanelProps> = ({
  userHandle,
  onSelectToken,
  refreshTrigger
}) => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [summary, setSummary] = useState<HoldingsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHoldings = async () => {
    if (!userHandle) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/path402/holdings');
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setHoldings(data.holdings || []);
      setSummary(data.summary || null);
    } catch (err) {
      console.error('Failed to fetch holdings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load holdings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoldings();
  }, [userHandle, refreshTrigger]);

  if (!userHandle) {
    return (
      <div className="border border-white/10 rounded-xl p-6 bg-gray-900/30">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <FiPackage size={18} />
          Your Holdings
        </h3>
        <div className="text-center py-8">
          <p className="text-gray-500">Connect with HandCash to view your holdings</p>
          <a
            href="/api/auth/handcash"
            className="inline-block mt-4 px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors"
          >
            Connect Wallet
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-white/10 rounded-xl bg-gray-900/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h3 className="font-bold text-white flex items-center gap-2">
          <FiPackage size={18} />
          Your Holdings
        </h3>
        <button
          onClick={fetchHoldings}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Summary */}
      {summary && summary.total_tokens > 0 && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-black/20 border-b border-white/10">
          <div>
            <div className="text-xs text-gray-500 uppercase">Total Value</div>
            <div className="text-lg font-mono font-bold text-green-400">
              {summary.formatted_value}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase">Total Spent</div>
            <div className="text-lg font-mono text-white">
              {summary.formatted_spent}
            </div>
          </div>
        </div>
      )}

      {/* Holdings list */}
      <div className="divide-y divide-white/5">
        {loading && holdings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Loading holdings...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">
            {error}
          </div>
        ) : holdings.length === 0 ? (
          <div className="p-8 text-center">
            <FiPackage className="mx-auto text-4xl text-gray-700 mb-4" />
            <p className="text-gray-500 mb-2">No tokens yet</p>
            <p className="text-sm text-gray-600">Acquire tokens to gain access to content</p>
          </div>
        ) : (
          holdings.map((holding, index) => (
            <motion.div
              key={holding.token_id}
              className="p-4 hover:bg-white/5 cursor-pointer transition-colors"
              onClick={() => onSelectToken?.(holding.token_id)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {/* Token icon */}
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400 font-bold text-xs">
                      {holding.token_id.substring(0, 3)}
                    </span>
                  </div>

                  <div>
                    <div className="font-bold text-white">{holding.token_name}</div>
                    <div className="text-sm text-gray-500">${holding.token_id}</div>
                    {holding.token_description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                        {holding.token_description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-white">
                    {holding.balance.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">tokens</div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <FiZap size={12} />
                  {holding.formatted_value} value
                </span>
                <span className="flex items-center gap-1">
                  <FiClock size={12} />
                  {new Date(holding.last_acquired || holding.first_acquired).toLocaleDateString()}
                </span>
                {holding.access_url && (
                  <a
                    href={holding.access_url.replace('*', '')}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-green-400 hover:text-green-300"
                  >
                    <FiExternalLink size={12} />
                    Access
                  </a>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Footer with handle */}
      <div className="p-3 border-t border-white/10 text-center text-xs text-gray-600">
        Connected as <span className="text-gray-400">@{userHandle}</span>
      </div>
    </div>
  );
};
