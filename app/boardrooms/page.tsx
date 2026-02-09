'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import {
  FaUsers,
  FaLock,
  FaCoins,
  FaBroadcastTower,
  FaVoteYea,
  FaFileContract,
  FaShieldAlt,
  FaGlobe
} from 'react-icons/fa';

const FEATURES = [
  {
    icon: FaLock,
    title: 'Token-Gated Access',
    description: 'Only verified shareholders can enter. Access is automatically granted based on token holdings.'
  },
  {
    icon: FaUsers,
    title: 'Shareholder Meetings',
    description: 'Host virtual AGMs, board meetings, and investor calls in a secure, private environment.'
  },
  {
    icon: FaBroadcastTower,
    title: 'Announcements',
    description: 'Broadcast updates directly to token holders. They receive notifications based on their stake.'
  },
  {
    icon: FaVoteYea,
    title: 'Governance Voting',
    description: 'Run proposals and votes with token-weighted results. Fully transparent and verifiable.'
  },
  {
    icon: FaFileContract,
    title: 'Document Sharing',
    description: 'Share sensitive documents only with verified stakeholders. Audit trails included.'
  },
  {
    icon: FaShieldAlt,
    title: 'Role-Based Permissions',
    description: 'Define roles for founders, advisors, investors. Each sees what they should see.'
  }
];

const BLOCKCHAINS = [
  { name: 'BSV', description: 'Low fees, high throughput' },
  { name: 'Ethereum', description: 'ERC-20 tokens supported' },
  { name: 'Polygon', description: 'Fast & cheap transactions' },
  { name: 'Solana', description: 'SPL tokens supported' },
  { name: 'Base', description: 'Coinbase L2 ecosystem' },
  { name: 'Custom', description: 'Any EVM-compatible chain' }
];

export default function BoardroomsPage() {
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
              <FaUsers className="text-4xl md:text-6xl text-white" />
            </div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                BOARDROOMS
              </h1>
              <div className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-widest">
                TOKEN-GATED
              </div>
            </div>
          </div>

          {/* Marketing Pitch */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-gray-400 max-w-2xl">
              Build your own digital boardroom with token-gated access for shareholders.
              Private meetings, governance voting, and announcements - secured by blockchain.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold hover:opacity-80 transition-colors whitespace-nowrap"
              style={{ backgroundColor: '#fff', color: '#000' }}
            >
              Get Started <FiArrowRight size={14} />
            </Link>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="mb-16">
          <h3 className="text-xl font-bold uppercase tracking-tight mb-6 text-gray-400">
            Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className="p-6 border border-gray-800 hover:border-gray-600 bg-black transition-all"
              >
                <feature.icon className="w-8 h-8 text-white mb-4" />
                <h4 className="font-bold uppercase tracking-tight mb-2 text-white">
                  {feature.title}
                </h4>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Supported Blockchains */}
        <div className="mb-16">
          <h3 className="text-xl font-bold uppercase tracking-tight mb-6 text-gray-400">
            Supported Blockchains
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {BLOCKCHAINS.map((chain, index) => (
              <div
                key={index}
                className="p-4 border border-gray-800 hover:border-gray-600 bg-black transition-all text-center"
              >
                <div className="font-bold text-white mb-1">{chain.name}</div>
                <div className="text-xs text-gray-500">{chain.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h3 className="text-xl font-bold uppercase tracking-tight mb-6 text-gray-400">
            How It Works
          </h3>
          <div className="border border-gray-800 p-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 border border-gray-800 flex items-center justify-center mx-auto mb-4 text-xl font-mono text-gray-500">1</div>
                <h4 className="font-bold text-white mb-2">Issue Tokens</h4>
                <p className="text-gray-500 text-sm">Create tokens representing shares in your company</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 border border-gray-800 flex items-center justify-center mx-auto mb-4 text-xl font-mono text-gray-500">2</div>
                <h4 className="font-bold text-white mb-2">Set Up Boardroom</h4>
                <p className="text-gray-500 text-sm">Configure access rules based on token holdings</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 border border-gray-800 flex items-center justify-center mx-auto mb-4 text-xl font-mono text-gray-500">3</div>
                <h4 className="font-bold text-white mb-2">Invite Holders</h4>
                <p className="text-gray-500 text-sm">Shareholders connect wallets to verify holdings</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 border border-gray-800 flex items-center justify-center mx-auto mb-4 text-xl font-mono text-gray-500">4</div>
                <h4 className="font-bold text-white mb-2">Collaborate</h4>
                <p className="text-gray-500 text-sm">Meet, vote, and communicate securely</p>
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-16">
          <h3 className="text-xl font-bold uppercase tracking-tight mb-6 text-gray-400">
            Use Cases
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 border border-gray-800 bg-black">
              <h4 className="font-bold uppercase tracking-tight mb-3 text-white">Tokenized Startups</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2"><FiCheck className="text-green-400" /> Investor updates & quarterly reports</li>
                <li className="flex items-center gap-2"><FiCheck className="text-green-400" /> Cap table management via tokens</li>
                <li className="flex items-center gap-2"><FiCheck className="text-green-400" /> Board meeting minutes & voting</li>
              </ul>
            </div>
            <div className="p-6 border border-gray-800 bg-black">
              <h4 className="font-bold uppercase tracking-tight mb-3 text-white">DAOs & Collectives</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2"><FiCheck className="text-green-400" /> Governance proposals & voting</li>
                <li className="flex items-center gap-2"><FiCheck className="text-green-400" /> Treasury discussions</li>
                <li className="flex items-center gap-2"><FiCheck className="text-green-400" /> Working group coordination</li>
              </ul>
            </div>
            <div className="p-6 border border-gray-800 bg-black">
              <h4 className="font-bold uppercase tracking-tight mb-3 text-white">Investment Clubs</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2"><FiCheck className="text-green-400" /> Deal flow discussions</li>
                <li className="flex items-center gap-2"><FiCheck className="text-green-400" /> Investment voting</li>
                <li className="flex items-center gap-2"><FiCheck className="text-green-400" /> Portfolio updates</li>
              </ul>
            </div>
            <div className="p-6 border border-gray-800 bg-black">
              <h4 className="font-bold uppercase tracking-tight mb-3 text-white">NFT Communities</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2"><FiCheck className="text-green-400" /> Holder-only channels</li>
                <li className="flex items-center gap-2"><FiCheck className="text-green-400" /> Roadmap voting</li>
                <li className="flex items-center gap-2"><FiCheck className="text-green-400" /> Alpha & announcements</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="border border-gray-800 p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2 text-white">
                Ready for your own boardroom?
              </h3>
              <p className="text-gray-400">
                Tell me about your organization and I'll set up your token-gated space.
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/boardroom"
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-800 text-white font-bold hover:border-gray-600 transition-colors whitespace-nowrap"
              >
                Try Demo
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                Get a Quote <FiArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
