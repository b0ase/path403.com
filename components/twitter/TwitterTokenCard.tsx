'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiTwitter, FiDollarSign, FiTrendingUp, FiCheck, FiLoader } from 'react-icons/fi';

interface TwitterTokenCardProps {
  /** Twitter username (without @) */
  username: string;
  /** Display name */
  displayName?: string;
  /** Profile image URL */
  profileImageUrl?: string;
  /** Whether already tokenized */
  isTokenized: boolean;
  /** Token ID if tokenized */
  tokenId?: string;
  /** Current token supply */
  totalSupply?: number;
  /** Current price in sats */
  currentPriceSats?: number;
  /** Callback after successful tokenization */
  onTokenized?: (tokenId: string) => void;
}

export default function TwitterTokenCard({
  username,
  displayName,
  profileImageUrl,
  isTokenized,
  tokenId,
  totalSupply = 0,
  currentPriceSats = 500,
  onTokenized,
}: TwitterTokenCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenized, setTokenized] = useState(isTokenized);
  const [supply, setSupply] = useState(totalSupply);

  const handleTokenize = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/twitter/tokenize', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to tokenize');
        return;
      }

      setTokenized(true);
      setSupply(data.token?.total_supply || 0);
      onTokenized?.(data.tokenId);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-5 border-b border-zinc-800 bg-gradient-to-r from-sky-500/5 to-transparent">
        <div className="flex items-center gap-4">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt={username}
              className="w-12 h-12 rounded-full border-2 border-zinc-700"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
              <FiTwitter className="text-sky-400" size={20} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white truncate">
                {displayName || username}
              </span>
              {tokenized && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Tokenized
                </span>
              )}
            </div>
            <div className="text-zinc-500 text-sm">@{username}</div>
          </div>
          <FiTwitter className="text-sky-400 flex-shrink-0" size={24} />
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {tokenized ? (
          /* Tokenized state — show stats + MoneyButton info */
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-zinc-500 text-[10px] uppercase tracking-wider">Token</div>
                <div className="text-sky-400 font-mono text-sm mt-1">
                  ${username.toUpperCase()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-zinc-500 text-[10px] uppercase tracking-wider">Supply</div>
                <div className="text-white font-mono text-sm mt-1">{supply}</div>
              </div>
              <div className="text-center">
                <div className="text-zinc-500 text-[10px] uppercase tracking-wider">Price</div>
                <div className="text-white font-mono text-sm mt-1">
                  {currentPriceSats} <span className="text-zinc-600">sats</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <FiTrendingUp className="text-emerald-400 flex-shrink-0" size={16} />
              <p className="text-zinc-400 text-xs">
                Your MoneyButton is live. Share your profile to attract token buyers.
                You earn 70% of every purchase.
              </p>
            </div>

            <a
              href={`https://x.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-sky-400 hover:text-sky-300 text-sm transition-colors"
            >
              View on X/Twitter
            </a>
          </div>
        ) : (
          /* Not tokenized — show CTA */
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <FiDollarSign className="text-sky-400 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-zinc-300 text-sm">
                  Turn @{username} into a tradeable token.
                </p>
                <p className="text-zinc-500 text-xs mt-1">
                  Earn 70% every time someone buys your token. Token holders can
                  syndicate and serve your content.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-zinc-600">
              <div className="flex items-center gap-2">
                <FiCheck size={12} /> sqrt_decay pricing — early buyers rewarded
              </div>
              <div className="flex items-center gap-2">
                <FiCheck size={12} /> $0.01 per press via HandCash
              </div>
              <div className="flex items-center gap-2">
                <FiCheck size={12} /> Automatic dividends to holders
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs">{error}</p>
            )}

            <button
              onClick={handleTokenize}
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-sm transition-all
                bg-sky-500 hover:bg-sky-400 text-black
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" size={16} />
                  Tokenizing...
                </>
              ) : (
                <>
                  <FiDollarSign size={16} />
                  Tokenize @{username}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
