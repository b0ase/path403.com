'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMinus, FiPlus, FiCheck, FiLoader, FiAlertCircle } from 'react-icons/fi';
import type { TokenWithPrice } from '@/lib/path402/types';

interface AcquireModalProps {
  token: TokenWithPrice | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (transaction: { tokens_acquired: number; total_cost_sats: number }) => void;
  userHandle?: string;
}

interface PricePreview {
  total_cost_sats: number;
  average_price_sats: number;
  first_token_price: number;
  last_token_price: number;
  formatted_cost: string;
}

export const AcquireModal: React.FC<AcquireModalProps> = ({
  token,
  isOpen,
  onClose,
  onSuccess,
  userHandle
}) => {
  const [amount, setAmount] = useState(1);
  const [preview, setPreview] = useState<PricePreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [acquiring, setAcquiring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch price preview when amount changes
  useEffect(() => {
    if (!token || !isOpen) return;

    const fetchPreview = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/path402/tokens/${token.token_id}/acquire?amount=${amount}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        setPreview(data.pricing);
      } catch (err) {
        console.error('Failed to fetch preview:', err);
        setError(err instanceof Error ? err.message : 'Failed to load pricing');
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [token, amount, isOpen]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setAmount(1);
      setSuccess(false);
      setError(null);
    }
  }, [isOpen]);

  const handleAcquire = async () => {
    if (!token || !preview) return;

    setAcquiring(true);
    setError(null);

    try {
      const res = await fetch(`/api/path402/tokens/${token.token_id}/acquire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setSuccess(true);
      onSuccess?.({
        tokens_acquired: amount,
        total_cost_sats: data.summary.total_cost_sats
      });

      // Close after showing success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Acquisition failed:', err);
      setError(err instanceof Error ? err.message : 'Acquisition failed');
    } finally {
      setAcquiring(false);
    }
  };

  if (!token) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold text-white">Acquire Tokens</h2>
                <p className="text-sm text-gray-500">${token.token_id}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {success ? (
                <motion.div
                  className="text-center py-8"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                    <FiCheck className="text-green-400" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Success!</h3>
                  <p className="text-gray-400">
                    You now own {amount} {token.name} token{amount > 1 ? 's' : ''}
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Token info */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 flex items-center justify-center">
                      <span className="text-green-400 font-bold text-sm">
                        {token.token_id.substring(0, 3)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{token.name}</h3>
                      <p className="text-sm text-gray-500">
                        Current supply: {token.total_supply.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Amount selector */}
                  <div className="mb-6">
                    <label className="block text-sm text-gray-500 mb-2">Amount to acquire</label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setAmount(Math.max(1, amount - 1))}
                        disabled={amount <= 1 || acquiring}
                        className="w-12 h-12 flex items-center justify-center rounded-lg border border-white/10 text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiMinus size={20} />
                      </button>

                      <input
                        type="number"
                        min={1}
                        max={10000}
                        value={amount}
                        onChange={(e) => setAmount(Math.max(1, Math.min(10000, parseInt(e.target.value) || 1)))}
                        disabled={acquiring}
                        className="flex-1 h-12 px-4 text-center text-2xl font-mono font-bold bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500"
                      />

                      <button
                        onClick={() => setAmount(Math.min(10000, amount + 1))}
                        disabled={amount >= 10000 || acquiring}
                        className="w-12 h-12 flex items-center justify-center rounded-lg border border-white/10 text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiPlus size={20} />
                      </button>
                    </div>

                    {/* Quick amounts */}
                    <div className="flex gap-2 mt-3">
                      {[1, 5, 10, 25, 100].map((n) => (
                        <button
                          key={n}
                          onClick={() => setAmount(n)}
                          disabled={acquiring}
                          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                            amount === n
                              ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                              : 'bg-black/30 text-gray-400 hover:text-white border border-transparent'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price breakdown */}
                  <div className="bg-black/30 rounded-xl p-4 mb-6">
                    {loading ? (
                      <div className="flex items-center justify-center py-4">
                        <FiLoader className="animate-spin text-gray-500" size={24} />
                      </div>
                    ) : preview ? (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">First token price</span>
                          <span className="font-mono text-white">{preview.first_token_price.toLocaleString()} sats</span>
                        </div>
                        {amount > 1 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Last token price</span>
                            <span className="font-mono text-white">{preview.last_token_price.toLocaleString()} sats</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Average price</span>
                          <span className="font-mono text-white">{preview.average_price_sats.toLocaleString()} sats</span>
                        </div>
                        <div className="pt-3 border-t border-white/10 flex justify-between">
                          <span className="font-bold text-white">Total</span>
                          <span className="font-mono font-bold text-green-400 text-lg">
                            {preview.formatted_cost}
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                      <FiAlertCircle size={16} />
                      {error}
                    </div>
                  )}

                  {/* Login prompt */}
                  {!userHandle && (
                    <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-500 text-sm text-center">
                      Connect with HandCash to acquire tokens
                    </div>
                  )}

                  {/* Acquire button */}
                  <button
                    onClick={handleAcquire}
                    disabled={!preview || loading || acquiring || !userHandle}
                    className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {acquiring ? (
                      <>
                        <FiLoader className="animate-spin" size={20} />
                        Processing...
                      </>
                    ) : userHandle ? (
                      <>
                        Acquire {amount} Token{amount > 1 ? 's' : ''} for {preview?.formatted_cost || '...'}
                      </>
                    ) : (
                      'Connect Wallet to Continue'
                    )}
                  </button>

                  <p className="mt-4 text-xs text-center text-gray-600">
                    Tokens grant access to {token.content_type || 'content'}. Price decreases as more are issued.
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
