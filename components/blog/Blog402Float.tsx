'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiExternalLink, FiDollarSign } from 'react-icons/fi';

interface TokenStatus {
  tokenized: boolean;
  token?: {
    token_id: string;
    name: string;
    description: string | null;
    base_price_sats: number;
    total_supply: number;
    current_price_sats: number;
    next_price_sats: number;
    price_for_10: number;
    price_for_100: number;
    issuer_share_bps: number;
    platform_share_bps: number;
  };
  inscription?: {
    txid: string;
    vout: number;
    explorerUrl: string;
    ordinalUrl: string;
  };
  priceSchedule?: Array<{
    supply: number;
    unit_price_sats: number;
    cumulative_cost_sats: number;
  }>;
}

const BUTTON_SIZE = 90;
const ACCENT = '#22d3ee'; // cyan-400

function formatSats(sats: number): string {
  return `${sats.toLocaleString()} sats`;
}

export default function Blog402Float({ slug }: { slug: string }) {
  const [status, setStatus] = useState<TokenStatus | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch(`/api/path402/blog/${slug}/status`)
      .then(r => r.json())
      .then(setStatus)
      .catch(() => setStatus({ tokenized: false }));
  }, [slug]);

  // Don't render if not tokenized or still loading
  if (!mounted || !status?.tokenized || !status.token) return null;

  const { token, inscription, priceSchedule } = status;
  const issuerPct = (token.issuer_share_bps / 100).toFixed(0);
  const platformPct = (token.platform_share_bps / 100).toFixed(0);

  const floatContent = (
    <>
      {/* Fixed Button */}
      <motion.div
        className="cursor-pointer"
        style={{
          position: 'fixed',
          bottom: '40px',
          right: '48px',
          width: BUTTON_SIZE,
          height: BUTTON_SIZE,
          zIndex: 9999,
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowPanel(true)}
      >
        <div
          className="w-full h-full rounded-full flex flex-col items-center justify-center relative overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 20%, #0d2d3a 0%, #0a1a20 40%, #050d10 100%)',
            boxShadow: `0 0 20px rgba(34, 211, 238, 0.4), 0 0 40px rgba(34, 211, 238, 0.2), inset 0 0 0 3px rgba(34, 211, 238, 0.7), inset 0 -8px 15px rgba(0,0,0,0.4), inset 0 8px 15px rgba(255,255,255,0.08)`,
          }}
        >
          <div
            className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-4 rounded-full opacity-30"
            style={{ background: 'radial-gradient(ellipse, rgba(34,211,238,0.8) 0%, transparent 70%)' }}
          />
          <span
            className="font-black text-[28px] leading-none relative z-10"
            style={{ color: ACCENT, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
          >
            $
          </span>
          <span
            className="font-bold text-[7px] tracking-[0.15em] uppercase relative z-10 text-center px-1"
            style={{ color: ACCENT, opacity: 0.7 }}
          >
            {formatSats(token.current_price_sats)}
          </span>
        </div>
      </motion.div>

      {/* Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowPanel(false)}
            />

            <motion.div
              className="relative w-full max-w-2xl bg-zinc-950 rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(34, 211, 238, 0.3)' }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              {/* Header */}
              <div
                className="p-6 border-b border-zinc-800"
                style={{ background: 'linear-gradient(to right, rgba(34, 211, 238, 0.08), transparent)' }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-black flex items-center gap-3">
                      <div
                        className="w-10 h-10 flex items-center justify-center font-black text-black text-xl rounded"
                        style={{ backgroundColor: ACCENT }}
                      >
                        <FiDollarSign size={24} />
                      </div>
                      <span style={{ color: ACCENT, textShadow: '0 0 20px rgba(34, 211, 238, 0.5)' }}>
                        {token.name}
                      </span>
                    </h2>
                    <p className="text-zinc-400 mt-2 text-sm">
                      {token.description || `$402 access token for this blog post. sqrt_decay pricing — earlier buyers pay less.`}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPanel(false)}
                    className="text-zinc-500 hover:text-white transition-colors p-2"
                  >
                    <FiX size={24} />
                  </button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-4 p-6 border-b border-zinc-800 text-center">
                <div>
                  <div className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Current Price</div>
                  <div className="text-white font-bold text-lg">{formatSats(token.current_price_sats)}</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Supply</div>
                  <div className="text-white font-bold text-lg">{token.total_supply}</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Next Price</div>
                  <div className="text-zinc-400 font-bold text-lg">{formatSats(token.next_price_sats)}</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Revenue Split</div>
                  <div className="text-zinc-400 font-bold text-lg">{issuerPct}/{platformPct}</div>
                </div>
              </div>

              <div className="p-6">
                {/* MoneyButton Press */}
                <div className="mb-6">
                  <motion.button
                    className="w-full group relative p-6 border-2 rounded-lg transition-all text-center"
                    style={{
                      borderColor: `${ACCENT}66`,
                      background: `linear-gradient(135deg, rgba(34,211,238,0.08), rgba(34,211,238,0.02))`,
                    }}
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/path402/press/${token.token_id}`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' }
                        });
                        if (res.status === 401) {
                          window.location.href = '/api/auth/handcash';
                          return;
                        }
                        const data = await res.json();
                        if (data.success) {
                          alert(`+1 token acquired! TX: ${data.press.handcash_tx_id.slice(0, 12)}...`);
                          // Refresh status
                          const newStatus = await fetch(`/api/path402/blog/${slug}/status`).then(r => r.json());
                          setStatus(newStatus);
                        } else {
                          alert(data.error || 'Press failed');
                        }
                      } catch (e) {
                        alert('Press failed. Are you signed in with HandCash?');
                      }
                    }}
                    whileHover={{ scale: 1.02, borderColor: ACCENT }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="font-black text-2xl" style={{ color: ACCENT }}>
                      Press — $0.01
                    </div>
                    <div className="text-zinc-400 text-sm mt-1">
                      1 token at {formatSats(token.current_price_sats)} | via HandCash
                    </div>
                  </motion.button>
                </div>

                {/* Bulk Acquire */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { amount: 10, cost: token.price_for_10 },
                    { amount: 100, cost: token.price_for_100 },
                  ].map((tier, index) => (
                    <motion.button
                      key={tier.amount}
                      className="group relative p-4 border border-zinc-800 rounded-lg hover:border-cyan-600/50 transition-all text-left bg-zinc-900/50 hover:bg-cyan-900/10"
                      onClick={() => window.open(`/api/path402/tokens/${token.token_id}/acquire?amount=${tier.amount}`, '_blank')}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="font-black text-lg" style={{ color: ACCENT }}>
                        {tier.amount} tokens
                      </div>
                      <div className="text-white text-xl font-bold mt-1">
                        {formatSats(tier.cost)}
                      </div>
                      <div className="text-zinc-500 text-xs mt-1">
                        {formatSats(Math.ceil(tier.cost / tier.amount))}/ea
                      </div>
                      <div className="absolute inset-0 rounded-lg bg-cyan-500/0 group-hover:bg-cyan-500/5 transition-colors" />
                    </motion.button>
                  ))}
                </div>

                {/* Price Schedule */}
                {priceSchedule && priceSchedule.length > 0 && (
                  <div className="mb-6">
                    <div className="text-zinc-500 text-[10px] uppercase tracking-wider mb-2">sqrt_decay Price Schedule</div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {priceSchedule.map(point => (
                        <div
                          key={point.supply}
                          className={`flex-shrink-0 px-3 py-2 rounded border text-center text-xs font-mono ${
                            point.supply === token.total_supply
                              ? 'border-cyan-500/50 bg-cyan-900/20 text-cyan-300'
                              : 'border-zinc-800 bg-zinc-900/50 text-zinc-400'
                          }`}
                        >
                          <div className="text-[10px] text-zinc-600">@{point.supply}</div>
                          <div>{point.unit_price_sats} sats</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inscription Proof */}
                {inscription && (
                  <div className="flex flex-wrap gap-4 pt-4 border-t border-zinc-800">
                    <a
                      href={inscription.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm flex items-center gap-2 transition-colors hover:opacity-80"
                      style={{ color: ACCENT }}
                    >
                      View on WhatsOnChain
                      <FiExternalLink size={14} />
                    </a>
                    <a
                      href={inscription.ordinalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-white text-sm flex items-center gap-2 transition-colors"
                    >
                      View Ordinal
                      <FiExternalLink size={14} />
                    </a>
                    <span className="text-zinc-600 text-xs font-mono self-center ml-auto">
                      txid: {inscription.txid.slice(0, 8)}...{inscription.txid.slice(-8)}
                    </span>
                  </div>
                )}

                <p className="text-zinc-600 text-xs mt-4">
                  $402 tokens grant access. sqrt_decay pricing means early buyers pay less. {issuerPct}% to author, {platformPct}% to platform.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return createPortal(floatContent, document.body);
}
