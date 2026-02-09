'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingDown, FiUsers, FiZap, FiLock, FiUnlock } from 'react-icons/fi';
import type { TokenWithPrice } from '@/lib/path402/types';

interface TokenCardProps {
  token: TokenWithPrice;
  userBalance?: number;
  onAcquire?: (token: TokenWithPrice) => void;
  selected?: boolean;
}

export const TokenCard: React.FC<TokenCardProps> = ({
  token,
  userBalance = 0,
  onAcquire,
  selected = false
}) => {
  const hasAccess = userBalance > 0;

  // Format content type badge
  const contentTypeBadge: Record<string, { label: string; color: string }> = {
    blog: { label: 'BLOG', color: 'bg-blue-500' },
    api: { label: 'API', color: 'bg-purple-500' },
    membership: { label: 'MEMBER', color: 'bg-yellow-500' },
    media: { label: 'MEDIA', color: 'bg-pink-500' },
    custom: { label: 'CUSTOM', color: 'bg-gray-500' }
  };

  const badge = token.content_type
    ? contentTypeBadge[token.content_type]
    : { label: 'TOKEN', color: 'bg-gray-600' };

  return (
    <motion.div
      className={`border rounded-xl p-6 transition-all cursor-pointer ${
        selected
          ? 'border-green-500 bg-green-500/10'
          : 'border-white/10 bg-gray-900/30 hover:border-white/20'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onAcquire?.(token)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Token icon */}
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 flex items-center justify-center">
            <span className="text-green-400 font-bold text-sm">
              {token.token_id.substring(0, 3)}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white">{token.name}</h3>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold text-white ${badge.color}`}>
                {badge.label}
              </span>
            </div>
            <p className="text-sm text-gray-500">${token.token_id}</p>
          </div>
        </div>

        {/* Access indicator */}
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
          hasAccess
            ? 'bg-green-500/20 text-green-400'
            : 'bg-gray-700/50 text-gray-500'
        }`}>
          {hasAccess ? <FiUnlock size={12} /> : <FiLock size={12} />}
          {hasAccess ? `${userBalance} owned` : 'No access'}
        </div>
      </div>

      {/* Description */}
      {token.description && (
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {token.description}
        </p>
      )}

      {/* Pricing */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-500 uppercase mb-1">Current Price</div>
          <div className="text-lg font-mono font-bold text-white">
            {token.current_price_sats.toLocaleString()} <span className="text-gray-500 text-sm">sats</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase mb-1">Supply</div>
          <div className="text-lg font-mono text-white">
            {token.total_supply.toLocaleString()}
            {token.max_supply && (
              <span className="text-gray-500 text-sm">/{token.max_supply.toLocaleString()}</span>
            )}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase mb-1">Model</div>
          <div className="flex items-center gap-1 text-white">
            <FiTrendingDown className="text-green-400" size={14} />
            <span className="text-sm font-medium">{token.pricing_model}</span>
          </div>
        </div>
      </div>

      {/* Price preview */}
      <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg mb-4">
        <div className="text-xs text-gray-500">
          <span className="text-gray-400">1 token: </span>
          <span className="text-white font-mono">{token.current_price_sats} sats</span>
        </div>
        <div className="text-xs text-gray-500">
          <span className="text-gray-400">10 tokens: </span>
          <span className="text-white font-mono">{token.price_for_10.toLocaleString()} sats</span>
        </div>
        <div className="text-xs text-gray-500">
          <span className="text-gray-400">100 tokens: </span>
          <span className="text-white font-mono">{token.price_for_100.toLocaleString()} sats</span>
        </div>
      </div>

      {/* Stats footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <FiUsers size={12} />
            {token.issuer_handle}
          </span>
          <span className="flex items-center gap-1">
            <FiZap size={12} />
            {token.issuer_share_bps / 100}% to issuer
          </span>
        </div>
        <span className="text-gray-600">
          Created {new Date(token.created_at).toLocaleDateString()}
        </span>
      </div>
    </motion.div>
  );
};
