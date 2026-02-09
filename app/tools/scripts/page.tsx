'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowRight, FiCode, FiLock, FiRepeat, FiUsers, FiClock, FiShield, FiGift, FiTrendingUp } from 'react-icons/fi';
import { FaBitcoin } from 'react-icons/fa';

// BSV Script transaction types
const SCRIPT_TYPES = [
  {
    id: 'crowdfunding',
    title: 'Crowdfunding',
    description: 'Raise funds for projects with target-based escrow. Funds released only when goals are met, otherwise refunded to backers.',
    icon: FiUsers,
    tags: ['Escrow', 'Milestone', 'Refundable'],
    color: 'from-green-500 to-emerald-600',
    href: '/tools/scripts/crowdfunding',
    featured: true,
  },
  {
    id: 'escrow',
    title: 'Escrow',
    description: 'Two-party or multi-party escrow transactions. Funds held until conditions are met with optional arbiter resolution.',
    icon: FiLock,
    tags: ['2-of-3', 'Multisig', 'Conditional'],
    color: 'from-blue-500 to-indigo-600',
    href: '/tools/scripts/escrow',
  },
  {
    id: 'subscription',
    title: 'Subscriptions',
    description: 'Recurring pull payments on daily, weekly, or monthly schedules. User authorizes future withdrawals up to a limit.',
    icon: FiRepeat,
    tags: ['Daily', 'Weekly', 'Monthly'],
    color: 'from-purple-500 to-violet-600',
    href: '/tools/scripts/subscription',
  },
  {
    id: 'vesting',
    title: 'Token Vesting',
    description: 'Time-locked token releases for team allocations, investor tranches, or employee compensation schedules.',
    icon: FiClock,
    tags: ['Time-lock', 'Cliff', 'Linear'],
    color: 'from-amber-500 to-orange-600',
    href: '/tools/scripts/vesting',
  },
  {
    id: 'atomic-swap',
    title: 'Atomic Swaps',
    description: 'Trustless cross-chain token exchanges. Either both parties receive their tokens or the trade cancels entirely.',
    icon: FiTrendingUp,
    tags: ['Trustless', 'Cross-chain', 'HTLC'],
    color: 'from-cyan-500 to-blue-600',
    href: '/tools/scripts/atomic-swap',
  },
  {
    id: 'multisig',
    title: 'Multisig Wallets',
    description: 'M-of-N signature requirements for treasury management, DAOs, or shared company funds.',
    icon: FiShield,
    tags: ['2-of-3', '3-of-5', 'DAO'],
    color: 'from-red-500 to-pink-600',
    href: '/tools/scripts/multisig',
  },
  {
    id: 'airdrop',
    title: 'Batch Airdrops',
    description: 'Distribute tokens to thousands of addresses in a single transaction. Efficient mass token distribution.',
    icon: FiGift,
    tags: ['Batch', 'Distribution', 'Efficient'],
    color: 'from-pink-500 to-rose-600',
    href: '/tools/scripts/airdrop',
  },
  {
    id: 'conditional',
    title: 'Conditional Payments',
    description: 'Payments triggered by external data via oracle. Weather, sports, price feeds, or any verifiable event.',
    icon: FiCode,
    tags: ['Oracle', 'Data-driven', 'Smart'],
    color: 'from-teal-500 to-green-600',
    href: '/tools/scripts/conditional',
  },
];

export default function ScriptsPage() {
  return (
    <motion.div
      className="min-h-screen bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="px-4 md:px-8 py-16">
        {/* Header */}
        <motion.div
          className="mb-12 border-b border-gray-800 pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
            <div className="bg-gray-900/50 p-4 md:p-6 border border-gray-800 self-start">
              <FiCode className="text-4xl md:text-6xl text-white" />
            </div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                BSV SCRIPTS
              </h1>
              <div className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-widest">
                Transaction Builder
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-gray-400 max-w-2xl">
              Build complex Bitcoin SV transactions with our script templates. Escrow, subscriptions,
              crowdfunding, vesting, and more - all powered by Bitcoin's native scripting language.
            </p>
            <div className="flex gap-3">
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold border border-zinc-700 text-zinc-300 hover:text-white hover:border-white transition-colors"
              >
                All Tools
              </Link>
              <Link
                href="/tx-broadcaster"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold bg-white text-black hover:bg-zinc-200 transition-colors"
              >
                <FaBitcoin size={14} /> TX Broadcaster
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Featured: Crowdfunding */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link href="/tools/scripts/crowdfunding" className="block group">
            <div className="border-2 border-green-800/50 bg-green-900/10 p-8 hover:border-green-600/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                    <FiUsers className="text-2xl text-white" />
                  </div>
                  <div>
                    <span className="text-xs text-green-400 font-bold uppercase tracking-wider">Featured Script</span>
                    <h2 className="text-2xl font-bold text-white">Crowdfunding Transactions</h2>
                  </div>
                </div>
                <FiArrowRight className="text-green-400 group-hover:translate-x-2 transition-transform" size={24} />
              </div>
              <p className="text-gray-400 mb-4 max-w-2xl">
                Launch token-based crowdfunding campaigns with automatic escrow. Backers receive tokens
                immediately, but funds are only released when funding targets are met. If the goal isn't
                reached, all contributions are automatically refunded.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-green-900/50 border border-green-800 text-green-400 text-xs font-bold">
                  Target-based Escrow
                </span>
                <span className="px-3 py-1 bg-green-900/50 border border-green-800 text-green-400 text-xs font-bold">
                  Automatic Refunds
                </span>
                <span className="px-3 py-1 bg-green-900/50 border border-green-800 text-green-400 text-xs font-bold">
                  Token Distribution
                </span>
                <span className="px-3 py-1 bg-green-900/50 border border-green-800 text-green-400 text-xs font-bold">
                  On-chain Transparency
                </span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Script Types Grid */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-sm font-bold text-white mb-6 bg-zinc-900 border border-zinc-800 inline-block px-3 py-1 uppercase tracking-widest">
            Transaction Types
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SCRIPT_TYPES.filter(s => !s.featured).map((script, index) => (
              <Link key={script.id} href={script.href} className="block group">
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-zinc-950 border border-zinc-800 p-6 h-full hover:bg-white hover:border-white transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 bg-gradient-to-br ${script.color} rounded-lg flex items-center justify-center`}>
                      <script.icon className="text-lg text-white" />
                    </div>
                    <FiArrowRight className="text-zinc-600 group-hover:text-black text-sm" />
                  </div>

                  <h3 className="text-sm font-bold text-white mb-2 group-hover:text-black">
                    {script.title}
                  </h3>
                  <p className="text-zinc-500 text-xs mb-4 leading-relaxed group-hover:text-zinc-600">
                    {script.description}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {script.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[9px] uppercase font-bold border border-zinc-800 px-1.5 py-0.5 text-zinc-400 group-hover:border-zinc-300 group-hover:text-zinc-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          className="mb-12 border border-gray-800 p-8 bg-gray-900/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-xl font-bold mb-6">How BSV Scripts Work</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Choose Script', desc: 'Select a transaction type that fits your use case' },
              { step: '02', title: 'Configure', desc: 'Set parameters like amounts, addresses, and conditions' },
              { step: '03', title: 'Review', desc: 'Preview the raw transaction and verify all details' },
              { step: '04', title: 'Broadcast', desc: 'Sign and broadcast to the BSV network' },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-4xl font-bold text-zinc-800 mb-2">{item.step}</div>
                <h3 className="font-bold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-zinc-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Active Campaigns CTA */}
        <motion.div
          className="border border-gray-800 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Ready to Create a Script?</h2>
              <p className="text-gray-400">
                Start building complex Bitcoin transactions or browse active crowdfunding campaigns.
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/tools/scripts/crowdfunding"
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-700 text-gray-300 font-bold hover:border-white hover:text-white transition-colors"
              >
                Launch Crowdfund
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold hover:bg-zinc-200 transition-colors"
              >
                Custom Script <FiArrowRight size={16} />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
