'use client';

import React, { useState, useEffect } from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import { FaCheckCircle, FaSpinner, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

export default function PurchaseSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [purchase, setPurchase] = useState<{
    tokenAmount: number;
    usdAmount: number;
    newBalance: number;
    ownershipPercentage: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setError('No session ID provided');
      return;
    }

    async function completePurchase() {
      try {
        const res = await fetch('/api/investors/purchase/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setPurchase(data.purchase);
          setStatus('success');
        } else {
          setError(data.error || 'Failed to complete purchase');
          setStatus('error');
        }
      } catch (err) {
        console.error('Complete purchase error:', err);
        setError('Failed to complete purchase');
        setStatus('error');
      }
    }

    completePurchase();
  }, [sessionId]);

  return (
    <motion.div
      className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-mono relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.section
        className="px-4 md:px-8 py-20 lg:py-32 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="w-full max-w-2xl mx-auto text-center">

          {status === 'loading' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-zinc-800 p-12"
            >
              <FaSpinner className="text-4xl text-white animate-spin mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-white mb-4">Processing Your Purchase</h1>
              <p className="text-zinc-400">Please wait while we allocate your tokens...</p>
            </motion.div>
          )}

          {status === 'success' && purchase && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <FaCheckCircle className="text-4xl text-white" />
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 uppercase tracking-tight">
                Purchase Successful!
              </h1>
              <p className="text-zinc-400 mb-8">
                Your $BOASE tokens have been allocated to your custody vault.
              </p>

              <div className="border border-zinc-800 p-8 mb-8 text-left">
                <h3 className="text-sm text-zinc-500 uppercase tracking-wider mb-6">Purchase Details</h3>

                <div className="space-y-4">
                  <div className="flex justify-between border-b border-zinc-800 pb-4">
                    <span className="text-zinc-400">Investment Amount</span>
                    <span className="text-white font-bold">${purchase.usdAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-4">
                    <span className="text-zinc-400">Tokens Purchased</span>
                    <span className="text-white font-bold">{purchase.tokenAmount.toLocaleString()} $BOASE</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-4">
                    <span className="text-zinc-400">New Total Balance</span>
                    <span className="text-white font-bold">{purchase.newBalance.toLocaleString()} $BOASE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Ownership Percentage</span>
                    <span className="text-green-400 font-bold">{purchase.ownershipPercentage}%</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/investors/dashboard"
                  className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
                >
                  View Dashboard <FaArrowRight />
                </Link>
                <Link
                  href="/investors/purchase"
                  className="inline-flex items-center justify-center gap-2 border border-zinc-600 text-zinc-300 px-8 py-4 font-bold uppercase tracking-wider hover:border-white hover:text-white transition-colors"
                >
                  Purchase More
                </Link>
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-red-500/50 bg-red-500/10 p-12"
            >
              <h1 className="text-2xl font-bold text-red-400 mb-4">Purchase Error</h1>
              <p className="text-zinc-400 mb-8">{error || 'Something went wrong processing your purchase.'}</p>
              <Link
                href="/investors/purchase"
                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
              >
                Try Again <FaArrowRight />
              </Link>
            </motion.div>
          )}

        </div>
      </motion.section>
    </motion.div>
  );
}
