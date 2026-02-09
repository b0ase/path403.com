'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PressPreview {
  token_id: string;
  name: string;
  press_price_usd: number;
  current_supply: number;
  max_supply: number | null;
  tokens_remaining: number | null;
  current_price_sats: number;
  tokens_per_press: number;
  user: { handle: string; balance: number } | null;
}

interface PressResult {
  success: boolean;
  press: {
    tokens_awarded: number;
    unit_price_sats: number;
    total_cost_sats: number;
    formatted_cost: string;
    handcash_tx_id: string;
    dividends_distributed_sats: number;
  };
}

interface MoneyButtonProps {
  tokenId: string;
  /** Button size in pixels. Default: 80 */
  size?: number;
  /** Primary color. Default: pink-500 */
  color?: string;
  /** Emoji shown on button. Default: dollar sign */
  emoji?: string;
  /** Label below button */
  label?: string;
  /** Callback after successful press */
  onPress?: (result: PressResult) => void;
  /** Callback on error */
  onError?: (error: string) => void;
}

export default function MoneyButton({
  tokenId,
  size = 80,
  color = '#ec4899',
  emoji,
  label,
  onPress,
  onError
}: MoneyButtonProps) {
  const [preview, setPreview] = useState<PressPreview | null>(null);
  const [pressing, setPressing] = useState(false);
  const [lastResult, setLastResult] = useState<PressResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Load preview data
  useEffect(() => {
    fetch(`/api/path402/press/${tokenId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setPreview(data);
        }
      })
      .catch(() => setError('Failed to load token'));
  }, [tokenId]);

  const handlePress = useCallback(async () => {
    if (pressing) return;

    setPressing(true);
    setError(null);
    setShowFeedback(false);

    try {
      const res = await fetch(`/api/path402/press/${tokenId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();

      if (!res.ok) {
        // If 401, redirect to HandCash login
        if (res.status === 401) {
          window.location.href = '/api/auth/handcash';
          return;
        }
        throw new Error(data.error || 'Press failed');
      }

      setLastResult(data);
      setShowFeedback(true);
      onPress?.(data);

      // Refresh preview
      const previewRes = await fetch(`/api/path402/press/${tokenId}`);
      const previewData = await previewRes.json();
      if (!previewData.error) setPreview(previewData);

      // Hide feedback after 3s
      setTimeout(() => setShowFeedback(false), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Press failed';
      setError(msg);
      onError?.(msg);
    } finally {
      setPressing(false);
    }
  }, [tokenId, pressing, onPress, onError]);

  const displayLabel = label || preview?.name || tokenId;
  const isSoldOut = preview?.max_supply
    ? preview.current_supply >= preview.max_supply
    : false;

  return (
    <div className="inline-flex flex-col items-center gap-2">
      {/* The Button */}
      <motion.button
        className="relative rounded-full flex items-center justify-center cursor-pointer select-none"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(ellipse 80% 50% at 50% 20%, ${color}33 0%, ${color}11 40%, #0a0a0a 100%)`,
          boxShadow: `0 0 20px ${color}66, 0 0 40px ${color}33, inset 0 0 0 3px ${color}bb, inset 0 -8px 15px rgba(0,0,0,0.4), inset 0 8px 15px rgba(255,255,255,0.08)`,
        }}
        onClick={handlePress}
        disabled={pressing || isSoldOut}
        whileHover={!pressing && !isSoldOut ? { scale: 1.08 } : {}}
        whileTap={!pressing && !isSoldOut ? { scale: 0.92 } : {}}
        animate={pressing ? { rotate: [0, -5, 5, -5, 0] } : {}}
        transition={pressing ? { duration: 0.4, repeat: Infinity } : {}}
      >
        {/* Glare highlight */}
        <div
          className="absolute top-1 left-1/2 -translate-x-1/2 rounded-full opacity-30"
          style={{
            width: size * 0.55,
            height: size * 0.2,
            background: `radial-gradient(ellipse, ${color}cc 0%, transparent 70%)`
          }}
        />

        {/* Content */}
        <span
          className="relative z-10 font-black leading-none"
          style={{
            fontSize: size * 0.35,
            color,
            textShadow: `0 1px 2px rgba(0,0,0,0.5), 0 0 20px ${color}66`
          }}
        >
          {pressing ? '...' : (emoji || '$')}
        </span>
      </motion.button>

      {/* Label */}
      <div className="text-center">
        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider truncate max-w-[120px]">
          {displayLabel}
        </div>
        {preview && (
          <div className="text-[9px] font-mono text-zinc-600">
            {isSoldOut ? 'SOLD OUT' : `$0.01 = 1 token`}
          </div>
        )}
      </div>

      {/* Feedback Toast */}
      <AnimatePresence>
        {showFeedback && lastResult && (
          <motion.div
            className="fixed bottom-24 right-8 p-4 rounded-lg border z-50 max-w-xs"
            style={{
              backgroundColor: '#0a1a10',
              borderColor: '#22c55e50',
              boxShadow: '0 0 20px rgba(34, 197, 94, 0.2)'
            }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            <div className="text-green-400 font-bold text-sm">+{lastResult.press.tokens_awarded} token</div>
            <div className="text-zinc-400 text-xs mt-1">
              {lastResult.press.formatted_cost} | tx: {lastResult.press.handcash_tx_id.slice(0, 8)}...
            </div>
            {lastResult.press.dividends_distributed_sats > 0 && (
              <div className="text-zinc-500 text-[10px] mt-1">
                {lastResult.press.dividends_distributed_sats} sats distributed to holders
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="fixed bottom-24 right-8 p-4 rounded-lg border border-red-500/30 bg-red-950/80 z-50 max-w-xs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => setError(null)}
          >
            <div className="text-red-400 font-bold text-sm">Press Failed</div>
            <div className="text-zinc-400 text-xs mt-1">{error}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
