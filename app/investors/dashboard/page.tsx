'use client';

import React, { useState, useEffect } from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import { FaCoins, FaPercentage, FaWallet, FaHistory, FaArrowRight, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaKey } from 'react-icons/fa';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface InvestorData {
  shareholder: {
    id: string;
    fullName: string;
    email: string;
    tokenBalance: string;
    ownershipPercentage: string;
    accreditedInvestor: boolean;
    status: string;
    investmentDate: string | null;
    investmentAmount: string | null;
  };
  vault: {
    address: string;
    userPublicKey: string;
    appPublicKey: string;
    createdAt: string;
  } | null;
  transactions: Array<{
    id: string;
    type: string;
    amount: string;
    timestamp: string;
    txHash: string;
  }>;
}

export default function InvestorDashboardPage() {
  const [data, setData] = useState<InvestorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch registration status which includes shareholder and vault info
        const res = await fetch('/api/investors/register');
        if (res.ok) {
          const regData = await res.json();
          if (regData.isRegistered && regData.shareholder) {
            setData({
              shareholder: regData.shareholder,
              vault: regData.hasVault ? {
                address: regData.vaultAddress,
                userPublicKey: '',
                appPublicKey: '',
                createdAt: '',
              } : null,
              transactions: [], // Would fetch from API
            });
          } else {
            setError('Not registered as an investor');
          }
        } else if (res.status === 401) {
          setError('Please sign in to view your dashboard');
        } else {
          setError('Failed to load dashboard');
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <FaSpinner className="animate-spin text-2xl text-zinc-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="px-4 md:px-8 py-20 lg:py-32 max-w-4xl mx-auto text-center">
          <div className="border border-zinc-800 p-12">
            <FaExclamationTriangle className="text-4xl text-yellow-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-white mb-4">{error}</h1>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link
                href="/investors/onboard"
                className="inline-flex items-center justify-center gap-2 bg-white text-black px-6 py-3 font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
              >
                Start Onboarding <FaArrowRight />
              </Link>
              <Link
                href="/investors"
                className="inline-flex items-center justify-center gap-2 border border-zinc-600 text-zinc-300 px-6 py-3 font-bold uppercase tracking-wider hover:border-white hover:text-white transition-colors"
              >
                View Registry
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tokenBalance = parseFloat(data.shareholder.tokenBalance || '0');
  const ownershipPct = parseFloat(data.shareholder.ownershipPercentage || '0');
  const investmentAmount = parseFloat(data.shareholder.investmentAmount || '0');

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
        <div className="w-full max-w-6xl mx-auto">

          {/* Header */}
          <motion.div
            className="mb-12 border-b border-zinc-900 pb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Link href="/investors" className="text-zinc-500 hover:text-white text-sm mb-4 inline-block">
              ← Back to Investor Registry
            </Link>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="flex items-end gap-6">
                <div className="bg-gray-900/50 p-4 md:p-6 border border-gray-800">
                  <FiTrendingUp className="text-4xl md:text-6xl text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-5xl font-bold text-white leading-none tracking-tighter">
                    INVESTOR DASHBOARD
                  </h1>
                  <p className="text-zinc-500 mt-2">Welcome back, {data.shareholder.fullName}</p>
                </div>
              </div>
              <Link
                href="/investors/purchase"
                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors self-start"
              >
                Purchase More <FaArrowRight />
              </Link>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
          >
            <div className="border border-zinc-800 p-6 bg-zinc-900/30">
              <div className="flex items-center gap-3 text-zinc-500 mb-2">
                <FaCoins />
                <span className="text-xs uppercase tracking-wider">Token Balance</span>
              </div>
              <div className="text-3xl font-bold text-white font-mono">
                {tokenBalance.toLocaleString()}
              </div>
              <div className="text-xs text-zinc-500 mt-1">$BOASE</div>
            </div>

            <div className="border border-zinc-800 p-6 bg-zinc-900/30">
              <div className="flex items-center gap-3 text-zinc-500 mb-2">
                <FaPercentage />
                <span className="text-xs uppercase tracking-wider">Ownership</span>
              </div>
              <div className="text-3xl font-bold text-green-400 font-mono">
                {ownershipPct.toFixed(4)}%
              </div>
              <div className="text-xs text-zinc-500 mt-1">of total supply</div>
            </div>

            <div className="border border-zinc-800 p-6 bg-zinc-900/30">
              <div className="flex items-center gap-3 text-zinc-500 mb-2">
                <FaWallet />
                <span className="text-xs uppercase tracking-wider">Total Invested</span>
              </div>
              <div className="text-3xl font-bold text-white font-mono">
                ${investmentAmount.toLocaleString()}
              </div>
              <div className="text-xs text-zinc-500 mt-1">USD</div>
            </div>

            <div className="border border-zinc-800 p-6 bg-zinc-900/30">
              <div className="flex items-center gap-3 text-zinc-500 mb-2">
                <FaCheckCircle />
                <span className="text-xs uppercase tracking-wider">Status</span>
              </div>
              <div className="text-xl font-bold text-white">
                {data.shareholder.accreditedInvestor ? (
                  <span className="text-green-400">Accredited</span>
                ) : (
                  <span className="text-yellow-400">Standard</span>
                )}
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                {data.shareholder.status === 'active' ? 'Active investor' : data.shareholder.status}
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Vault Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="border border-zinc-800 p-8"
            >
              <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-3">
                <FaKey className="text-zinc-500" />
                Custody Vault
              </h2>

              {data.vault ? (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-zinc-500 uppercase tracking-wider">Vault Address</span>
                    <p className="font-mono text-sm text-zinc-300 break-all mt-1 bg-zinc-900 p-3">
                      {data.vault.address}
                    </p>
                  </div>

                  <div className="bg-zinc-900/50 border border-zinc-800 p-4">
                    <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-3">2-of-2 Multisig Keys</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-zinc-400">Your wallet key (you control)</span>
                        <span className="text-green-500 ml-auto">✓</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-zinc-400">b0ase platform key (we control)</span>
                        <span className="text-blue-500 ml-auto">✓</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-zinc-500 text-xs">
                    Both signatures required for transfers. This ensures regulatory compliance while protecting your assets.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-zinc-400 mb-4">No vault found</p>
                  <Link
                    href="/investors/onboard"
                    className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 text-sm font-bold uppercase hover:bg-zinc-200 transition-colors"
                  >
                    Create Vault <FaArrowRight />
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Transaction History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="border border-zinc-800 p-8"
            >
              <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-3">
                <FaHistory className="text-zinc-500" />
                Transaction History
              </h2>

              {data.transactions.length > 0 ? (
                <div className="space-y-4">
                  {data.transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-3 border-b border-zinc-800">
                      <div>
                        <div className="text-white font-medium">{tx.type}</div>
                        <div className="text-xs text-zinc-500">{new Date(tx.timestamp).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-mono">+{tx.amount}</div>
                        <div className="text-xs text-zinc-600 font-mono truncate max-w-[100px]">{tx.txHash}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500">
                  <FaHistory className="text-3xl mx-auto mb-4 opacity-50" />
                  <p>No transactions yet</p>
                  <Link
                    href="/investors/purchase"
                    className="inline-flex items-center gap-2 text-white mt-4 text-sm hover:underline"
                  >
                    Make your first purchase <FaArrowRight />
                  </Link>
                </div>
              )}
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-8 grid sm:grid-cols-3 gap-4"
          >
            <Link
              href="/investors/purchase"
              className="border border-zinc-800 p-6 hover:border-zinc-600 transition-colors group"
            >
              <FaCoins className="text-xl text-zinc-500 group-hover:text-white mb-3 transition-colors" />
              <h3 className="font-bold text-white mb-1">Purchase Tokens</h3>
              <p className="text-zinc-500 text-sm">Buy more $BOASE tokens</p>
            </Link>

            <Link
              href="/investors"
              className="border border-zinc-800 p-6 hover:border-zinc-600 transition-colors group"
            >
              <FiTrendingUp className="text-xl text-zinc-500 group-hover:text-white mb-3 transition-colors" />
              <h3 className="font-bold text-white mb-1">Cap Table</h3>
              <p className="text-zinc-500 text-sm">View all shareholders</p>
            </Link>

            <Link
              href="/token"
              className="border border-zinc-800 p-6 hover:border-zinc-600 transition-colors group"
            >
              <FaPercentage className="text-xl text-zinc-500 group-hover:text-white mb-3 transition-colors" />
              <h3 className="font-bold text-white mb-1">Token Info</h3>
              <p className="text-zinc-500 text-sm">View $BOASE details</p>
            </Link>
          </motion.div>

        </div>
      </motion.section>
    </motion.div>
  );
}
