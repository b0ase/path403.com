'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiAlertCircle, FiCheck, FiLoader, FiExternalLink, FiCheckCircle } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';

interface BWriterPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAmount?: number;
  tokenTicker?: string;
  totalValuation?: number; // in USD
  totalRaised?: number; // in USD
}

type PurchaseState = 'form' | 'confirming' | 'success' | 'error';

const BWRITER_IMAGE = '/images/clientprojects/bitcoin-writer/bitcoin-writer-button.png';
const KYC_LIMIT = 10000; // $10,000 USD limit without KYC
const TOKEN_PRICE = 0.01; // $0.01 (1 penny) per token

const INVESTMENT_TIERS = [
  { tokens: 1, price: 0.01, label: '1', description: 'Try it', id: '001' },
  { tokens: 10, price: 0.10, label: '10', description: 'Starter', id: '010' },
  { tokens: 100, price: 1, label: '100', description: 'Try it out', id: '100' },
  { tokens: 1000, price: 10, label: '1K', description: 'Starter+', id: '1000' },
  { tokens: 10000, price: 100, label: '10K', description: 'Supporter', id: '10000' },
  { tokens: 100000, price: 1000, label: '100K', description: 'Serious', id: '100000' },
  { tokens: 1000000, price: 10000, label: '1M', description: 'Angel', id: '1000000' },
  { tokens: 10000000, price: 100000, label: '10M', description: 'Whale', id: '10000000' },
];

export default function BWriterPurchaseModal({
  isOpen,
  onClose,
  initialAmount = 100,
  tokenTicker = 'BWRITER',
  totalValuation = 10000000, // $10M default
  totalRaised = 1000, // $1000 default
}: BWriterPurchaseModalProps) {
  const [state, setState] = useState<PurchaseState>('form');
  const [amount, setAmount] = useState(Math.min(initialAmount, KYC_LIMIT - 0.01).toString());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  // New state for balance and auth
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [justPaidTier, setJustPaidTier] = useState<'001' | '010' | null>(null);
  const [tier001PurchasedAt, setTier001PurchasedAt] = useState<string | null>(null);
  const [tier010PurchasedAt, setTier010PurchasedAt] = useState<string | null>(null);

  const selectTier = (tier: typeof INVESTMENT_TIERS[0]) => {
    setAmount(tier.price.toString());
    setError(null);
  };

  // Load user balance from dashboard API
  const loadUserBalance = async () => {
    setIsLoadingBalance(true);
    try {
      const response = await fetch('/api/bwriter/dashboard');
      if (response.ok) {
        const data = await response.json();
        setUserBalance(data.balance?.available || 0);
        setTier001PurchasedAt(data.balance?.tier001PurchasedAt || null);
        setTier010PurchasedAt(data.balance?.tier010PurchasedAt || null);
        setIsAuthenticated(true);
      } else {
        // User not authenticated or error fetching balance
        setIsAuthenticated(false);
        setUserBalance(null);
      }
    } catch (err) {
      console.error('Failed to load balance:', err);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Handle first-time token credit after HandCash auth
  const handleFirstTimeCredit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/bwriter/credit-first-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoCharge: true }),
      });

      const result = await response.json();

      if (result.alreadyCredited) {
        // User already got free token, just load balance
        loadUserBalance();
        return;
      }

      if (result.success) {
        // Update UI state
        setUserBalance(result.balance);
        if (result.tier001PurchasedAt) {
          setTier001PurchasedAt(result.tier001PurchasedAt);
          setJustPaidTier('001'); // Trigger highlight animation
        }

        setState('success');
        setTxId(result.transactionId || 'FIRST_TOKEN');
      } else if (result.freeCredited && !result.paidCharged) {
        // Partial success: free token credited but charge failed
        setUserBalance(result.balance);
        setError(result.error || 'Payment failed, but you got 1 free token!');
        setState('error');
      } else {
        setError(result.error || 'Failed to credit first token');
        setState('error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to credit first token');
      setState('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    // Check authentication first - if not authenticated, trigger HandCash auth
    if (!isAuthenticated) {
      const returnTo = window.location.pathname + '?openBWriterModal=true';
      window.location.href = `/api/auth/handcash?returnTo=${encodeURIComponent(returnTo)}`;
      return;
    }

    if (!amount || parseFloat(amount) < 0.01) {
      setError('Amount must be at least $0.01 (1 token)');
      return;
    }

    if (parseFloat(amount) >= KYC_LIMIT) {
      setError(`Purchases of $${KYC_LIMIT.toLocaleString()} or more require KYC verification. Contact richard@b0ase.com for large investments.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setState('confirming');

    try {
      const requestBody = {
        amount: parseFloat(amount),
        currency: 'USD',
        tokenTicker: tokenTicker,
        paymentMethod: 'handcash',
      };
      console.log('[BWriter Modal] Sending purchase request:', requestBody);

      const response = await fetch('/api/investors/purchase/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      console.log('[BWriter Modal] Full response:', { status: response.status, body: JSON.stringify(result, null, 2) });

      if (!response.ok) {
        if (response.status === 401) {
          setError('You must be logged in to purchase tokens');
        } else if (response.status === 400) {
          let errorMsg = 'Invalid request';

          if (result.error) {
            errorMsg = result.error;
          } else if (result.details && Array.isArray(result.details) && result.details.length > 0) {
            errorMsg = result.details.map((d: any) => `${d.path?.join('.')}: ${d.message}`).join(', ');
          } else if (result.details) {
            errorMsg = JSON.stringify(result.details);
          }

          setError(errorMsg);
          console.error('[BWriter Modal] 400 Response:', { error: result.error, details: result.details, fullBody: result });
        } else if (response.status === 402) {
          setError(result.error || 'Payment failed. Check your HandCash wallet');
        } else if (response.status === 404) {
          setError(`Token "${tokenTicker}" not found. Please contact support.`);
        } else {
          setError(result.error || 'Purchase failed');
        }
        setState('error');
        setIsLoading(false);
        return;
      }

      if (result.success) {
        setTxId(result.purchase?.id || result.transactionId);
        setState('success');
      } else {
        setError(result.error || 'Unexpected response');
        setState('error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
      setState('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setState('form');
    setAmount(Math.min(initialAmount, KYC_LIMIT - 0.01).toString());
    setError(null);
    setTxId(null);
  };

  // Check for HandCash auth return and first-time token credit
  useEffect(() => {
    if (!isOpen) return;

    // Always check for auth return first
    const params = new URLSearchParams(window.location.search);
    const handcashAuth = params.get('handcash_auth');

    if (handcashAuth === 'success') {
      // Clear auth params from URL
      window.history.replaceState({}, '', window.location.pathname);
      // Trigger first-time token credit flow
      handleFirstTimeCredit();
    } else {
      // Normal flow: load balance if authenticated
      loadUserBalance();
    }
  }, [isOpen]);

  // Fade out "just paid" highlight after 5 seconds
  useEffect(() => {
    if (justPaidTier) {
      const timer = setTimeout(() => setJustPaidTier(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [justPaidTier]);

  // Calculate tokens: $1 = 1 token
  const tokensToReceive = Math.floor(parseFloat(amount || '0') / TOKEN_PRICE);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-start justify-center p-4 pt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal - Wide on desktop */}
          <motion.div
            className="relative w-full max-w-5xl bg-zinc-950 border border-orange-500/30 rounded-xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-zinc-800 bg-gradient-to-r from-orange-500/10 to-transparent">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    <Image src={BWRITER_IMAGE} alt="$bWriter" fill className="object-cover" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white">Buy $bWriter Tokens</h2>
                    <p className="text-zinc-400 text-sm hidden sm:block">Own your words forever on the Bitcoin blockchain</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-zinc-500 hover:text-white transition-colors p-1"
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500">Token Price:</span>
                  <span className="text-white font-semibold">1¢</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500">Total Valuation:</span>
                  <span className="text-white font-semibold">${(totalValuation / 1000000).toFixed(0)}M</span>
                </div>
                <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-xs font-medium">
                  ${totalRaised.toLocaleString()} raised ({((totalRaised / totalValuation) * 100).toFixed(2)}%)
                </div>
              </div>

              {/* Balance Display Card */}
              {isAuthenticated && userBalance !== null && (
                <div className="mt-4 p-4 bg-gradient-to-r from-orange-500/10 to-orange-500/5 border border-orange-500/30 rounded-lg">
                  <div className="text-xs text-zinc-500 mb-1">Your Balance</div>
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    {userBalance.toLocaleString()}
                    <span className="text-xs md:text-sm ml-2 text-orange-400">$bWriter</span>
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4 md:p-6">
              {state === 'form' && (
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left: Investment Tier Cards */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-zinc-300 mb-3">
                      Quick Select
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2">
                      {INVESTMENT_TIERS.map((tier, index) => {
                        const isPaid = tier.id === '001'
                          ? !!tier001PurchasedAt
                          : tier.id === '010'
                            ? !!tier010PurchasedAt
                            : false;
                        const isJustPaid = justPaidTier === tier.id;

                        return (
                          <motion.button
                            key={tier.tokens}
                            type="button"
                            className={`group relative p-2 md:p-3 border rounded-lg transition-all text-left ${
                              parseFloat(amount) === tier.price
                                ? 'border-orange-500 bg-orange-500/10'
                                : isPaid && isJustPaid
                                  ? 'border-green-500 bg-green-500/10 animate-pulse'
                                  : isPaid
                                    ? 'border-green-500/30 bg-green-500/5'
                                    : 'border-zinc-800 bg-zinc-900/50 hover:border-orange-500/50 hover:bg-orange-500/5'
                            }`}
                            onClick={() => selectTier(tier)}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.02 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {isPaid && (
                              <div className="absolute top-1 right-1">
                                <FiCheckCircle className="text-green-400" size={14} />
                              </div>
                            )}
                            <div className="text-orange-400 font-bold text-xs md:text-sm">
                              {tier.label} tokens
                            </div>
                            <div className="text-white text-base md:text-lg font-bold">
                              ${tier.price.toLocaleString()}
                            </div>
                            <div className="text-zinc-500 text-[10px] md:text-xs">
                              {tier.description}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Custom Amount & Summary */}
                  <div className="lg:w-80 space-y-4">
                    {/* Custom Amount */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Custom Amount (USD)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-zinc-500">$</span>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          min="0.01"
                          max={KYC_LIMIT - 0.01}
                          step="0.01"
                          className="w-full pl-7 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-orange-500/50 focus:outline-none text-lg"
                          placeholder="0.00"
                        />
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        1 token = 1¢ (max $10,000 without KYC)
                      </p>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                        <FiAlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={14} />
                        <p className="text-xs text-red-300">{error}</p>
                      </div>
                    )}

                    {/* Summary */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Amount:</span>
                        <span className="text-white font-medium">${parseFloat(amount || '0').toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">$bWriter Tokens:</span>
                        <span className="text-orange-400 font-bold text-lg">
                          {tokensToReceive.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handlePurchase}
                      disabled={isLoading}
                      className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <FiLoader className="animate-spin" size={18} />
                          Processing...
                        </>
                      ) : (
                        'Purchase with HandCash'
                      )}
                    </button>

                    {/* Links */}
                    <div className="flex flex-wrap justify-center gap-4 text-xs">
                      <Link
                        href="/portfolio/bitcoin-writer"
                        className="text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
                      >
                        Learn more <FiExternalLink size={10} />
                      </Link>
                      <Link
                        href="/blog/introduction-to-bitcoin-writer"
                        className="text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        Introduction <FiExternalLink size={10} />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {state === 'confirming' && (
                <div className="py-12 text-center">
                  <FiLoader className="animate-spin mx-auto text-orange-400" size={40} />
                  <p className="text-white font-semibold mt-4">Processing Payment</p>
                  <p className="text-sm text-zinc-400">Connecting to HandCash...</p>
                </div>
              )}

              {state === 'success' && (
                <div className="py-12 text-center max-w-md mx-auto">
                  <div className="mx-auto w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center">
                    <FiCheck className="text-green-400" size={32} />
                  </div>
                  <p className="text-white font-semibold mt-4">Purchase Successful!</p>
                  <p className="text-sm text-zinc-400 mt-2">
                    {tokensToReceive.toLocaleString()} $bWriter tokens credited to your account
                  </p>
                  {txId && (
                    <p className="text-xs text-zinc-500 mt-2">TX: {txId.slice(0, 16)}...</p>
                  )}
                  <button
                    onClick={onClose}
                    className="mt-6 px-8 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}

              {state === 'error' && (
                <div className="py-12 text-center max-w-md mx-auto">
                  <div className="mx-auto w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center">
                    <FiAlertCircle className="text-red-400" size={32} />
                  </div>
                  <p className="text-white font-semibold mt-4">Purchase Failed</p>
                  <p className="text-sm text-red-300 mt-2">{error}</p>
                  <div className="flex gap-3 justify-center mt-6">
                    <button
                      onClick={handleReset}
                      className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={onClose}
                      className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {state === 'form' && (
              <div className="px-4 md:px-6 pb-4 md:pb-6">
                <p className="text-xs text-zinc-600 text-center">
                  Tokens represent utility rights in the Bitcoin Writer platform. Not financial advice.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
