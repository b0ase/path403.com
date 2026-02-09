'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCode } from 'react-icons/fi';
import {
  Coins,
  Users,
  Vote,
  Clock,
  Shield,
  Percent,
  Lock,
  Zap,
  FileCode,
  CheckCircle
} from 'lucide-react';

import { smartContractTemplates } from '@/lib/data';

export default function SmartContractsPage() {
  return (
    <motion.div
      className="min-h-screen bg-black text-white relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.section
        className="px-4 md:px-8 py-16 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        {/* Standardized Header */}
        <motion.div
          className="mb-12 border-b border-gray-800 pb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
            <div className="bg-gray-900/50 p-4 md:p-6 border border-gray-800 self-start">
              <FiCode className="text-4xl md:text-6xl text-white" />
            </div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                SMART_CONTRACTS
              </h1>
              <div className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-widest">
                AUTOMATION
              </div>
            </div>
          </div>

          {/* Marketing Pitch */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-gray-400 max-w-2xl">
              Automate your business logic on the blockchain with smart contracts.
              Dividend distribution, governance voting, escrow, vesting schedules - all trustless and transparent.
            </p>
            <Link
              href="/smart-contracts/form"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold hover:opacity-80 transition-colors whitespace-nowrap"
              style={{ backgroundColor: '#fff', color: '#000' }}
            >
              Get Started <FiArrowRight size={14} />
            </Link>
          </div>
        </motion.div>

        {/* Contract Types Grid */}
        <div className="mb-16">
          <h3 className="text-xl font-bold uppercase tracking-tight mb-6 text-gray-400">
            Template Library
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {smartContractTemplates.map((contract) => {
              // Map icon string to component (simplified for now, ideally we'd use a map)
              const icons = {
                Coins, Users, Vote, Clock, Shield, Percent, Lock
              };
              const Icon = icons[contract.iconName as keyof typeof icons] || FileCode;

              return (
                <Link
                  key={contract.slug}
                  href={`/smart-contracts/${contract.slug}`}
                  className="p-6 border border-gray-800 hover:border-gray-500 hover:bg-zinc-900 transition-all group block"
                >
                  <div className="flex justify-between items-start mb-4">
                    <Icon className="w-8 h-8 text-white group-hover:text-emerald-400 transition-colors" />
                    <FiArrowRight className="text-gray-600 group-hover:text-white transition-colors" />
                  </div>
                  <h4 className="font-bold uppercase tracking-tight mb-2 text-white group-hover:text-emerald-400 transition-colors">
                    {contract.title}
                  </h4>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{contract.description}</p>
                  <ul className="space-y-1">
                    {contract.features.slice(0, 2).map((feature, i) => (
                      <li key={i} className="text-xs text-gray-500 flex items-center gap-2">
                        <CheckCircle size={12} className="text-gray-600 group-hover:text-emerald-500 transition-colors" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Browse by Category */}
        <div className="mb-16">
          <h3 className="text-xl font-bold uppercase tracking-tight mb-6 text-gray-400">
            Browse by Category
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/smart-contracts/s/bsv-smart-contracts"
              className="p-6 border border-gray-800 hover:border-gray-500 hover:bg-zinc-900 transition-all group"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-white group-hover:text-emerald-400">BSV Development</span>
                <FiArrowRight className="text-gray-600 group-hover:text-white" />
              </div>
              <p className="text-gray-500 text-sm mt-2">Low fees, unlimited scale</p>
            </Link>
            <Link
              href="/smart-contracts/s/ethereum-smart-contracts"
              className="p-6 border border-gray-800 hover:border-gray-500 hover:bg-zinc-900 transition-all group"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-white group-hover:text-emerald-400">Ethereum / Solidity</span>
                <FiArrowRight className="text-gray-600 group-hover:text-white" />
              </div>
              <p className="text-gray-500 text-sm mt-2">Largest ecosystem, DeFi</p>
            </Link>
            <Link
              href="/smart-contracts/s/solana-programs"
              className="p-6 border border-gray-800 hover:border-gray-500 hover:bg-zinc-900 transition-all group"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-white group-hover:text-emerald-400">Solana / Rust</span>
                <FiArrowRight className="text-gray-600 group-hover:text-white" />
              </div>
              <p className="text-gray-500 text-sm mt-2">Lightning fast, gaming</p>
            </Link>
            <Link
              href="/smart-contracts/s/automate-dividend-payments"
              className="p-6 border border-gray-800 hover:border-gray-500 hover:bg-zinc-900 transition-all group"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-white group-hover:text-emerald-400">Dividend Automation</span>
                <FiArrowRight className="text-gray-600 group-hover:text-white" />
              </div>
              <p className="text-gray-500 text-sm mt-2">Auto-pay token holders</p>
            </Link>
            <Link
              href="/smart-contracts/s/trustless-escrow"
              className="p-6 border border-gray-800 hover:border-gray-500 hover:bg-zinc-900 transition-all group"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-white group-hover:text-emerald-400">Trustless Escrow</span>
                <FiArrowRight className="text-gray-600 group-hover:text-white" />
              </div>
              <p className="text-gray-500 text-sm mt-2">Secure payments</p>
            </Link>
            <Link
              href="/smart-contracts/s"
              className="p-6 border border-gray-800 hover:border-gray-500 hover:bg-zinc-900 transition-all group"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-white group-hover:text-emerald-400">View All Services</span>
                <FiArrowRight className="text-gray-600 group-hover:text-white" />
              </div>
              <p className="text-gray-500 text-sm mt-2">Browse by blockchain, use case, or industry</p>
            </Link>
          </div>
        </div>

        {/* Dividend Demo Section */}
        <div className="mb-16">
          <h3 className="text-xl font-bold uppercase tracking-tight mb-6 text-gray-400">
            Example: Automated Dividends
          </h3>
          <div className="border border-gray-800 p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-2xl font-bold mb-4 text-white">How It Works</h4>
                <p className="text-gray-400 mb-6">
                  Revenue flows into a smart contract. The contract automatically calculates each
                  token holder's share based on their percentage of total supply, then distributes
                  payments directly to their wallets.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="w-8 h-8 border border-gray-800 flex items-center justify-center text-xs font-mono">1</div>
                    <span>Revenue deposited to contract</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="w-8 h-8 border border-gray-800 flex items-center justify-center text-xs font-mono">2</div>
                    <span>Contract snapshots token holders</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="w-8 h-8 border border-gray-800 flex items-center justify-center text-xs font-mono">3</div>
                    <span>Pro-rata calculation executed</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="w-8 h-8 border border-gray-800 flex items-center justify-center text-xs font-mono">4</div>
                    <span>Funds distributed to wallets</span>
                  </div>
                </div>
              </div>
              <div className="border border-gray-800 p-6 bg-gray-900/30">
                <h5 className="font-bold uppercase tracking-tight mb-4 text-white text-sm">
                  Live Stats (Demo)
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-white">Daily</div>
                    <div className="text-xs text-gray-500 uppercase">Payout Frequency</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">100%</div>
                    <div className="text-xs text-gray-500 uppercase">Automated</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">$BOASE</div>
                    <div className="text-xs text-gray-500 uppercase">Token</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">BSV</div>
                    <div className="text-xs text-gray-500 uppercase">Blockchain</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-16">
          <h3 className="text-xl font-bold uppercase tracking-tight mb-6 text-gray-400">
            Technology
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border border-gray-800 text-center">
              <div className="font-bold text-white mb-1">BSV</div>
              <div className="text-xs text-gray-500">Blockchain</div>
            </div>
            <div className="p-4 border border-gray-800 text-center">
              <div className="font-bold text-white mb-1">sCrypt</div>
              <div className="text-xs text-gray-500">Smart Contracts</div>
            </div>
            <div className="p-4 border border-gray-800 text-center">
              <div className="font-bold text-white mb-1">TypeScript</div>
              <div className="text-xs text-gray-500">Integration</div>
            </div>
            <div className="p-4 border border-gray-800 text-center">
              <div className="font-bold text-white mb-1">Node.js</div>
              <div className="text-xs text-gray-500">Backend</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="border border-gray-800 p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2 text-white">
                Ready to automate your business?
              </h3>
              <p className="text-gray-400">
                Tell me what you need and I'll build the smart contract for it.
              </p>
            </div>
            <Link
              href="/smart-contracts/form"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              Get a Quote <FiArrowRight size={16} />
            </Link>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
