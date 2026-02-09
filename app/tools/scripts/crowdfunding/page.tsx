'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowRight, FiUsers, FiTarget, FiClock, FiCheckCircle, FiAlertCircle, FiDollarSign, FiGift } from 'react-icons/fi';
import { FaBitcoin } from 'react-icons/fa';

// Example active campaigns
const ACTIVE_CAMPAIGNS = [
  {
    id: 'osinka-kalaso',
    name: 'Osinka Kalaso Onion Farm',
    token: '$OK',
    description: 'Community-funded sustainable onion farming operation in Eastern Europe. Backers receive $OK tokens representing ownership.',
    target: 50000,
    raised: 12500,
    backers: 47,
    daysLeft: 28,
    status: 'active',
    imageUrl: '/images/campaigns/onion-farm.png',
  },
];

export default function CrowdfundingPage() {
  const [formData, setFormData] = useState({
    projectName: '',
    tokenSymbol: '',
    targetAmount: '',
    duration: '30',
    description: '',
    walletAddress: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Would integrate with BSV script builder
    alert('Crowdfunding script builder coming soon! Contact us to launch your campaign.');
  };

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
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 md:p-6 self-start">
              <FiUsers className="text-4xl md:text-6xl text-white" />
            </div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                CROWDFUNDING
              </h1>
              <div className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-widest">
                BSV Scripts
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-gray-400 max-w-2xl">
              Launch token-backed crowdfunding campaigns with on-chain escrow. Funds are held until
              targets are met - if the goal isn't reached, all contributions automatically refund.
            </p>
            <div className="flex gap-3">
              <Link
                href="/tools/scripts"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold border border-zinc-700 text-zinc-300 hover:text-white hover:border-white transition-colors"
              >
                All Scripts
              </Link>
              <Link
                href="/blog/osinka-kalaso-onion-farm"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold bg-green-600 text-white hover:bg-green-500 transition-colors"
              >
                Featured: $OK <FiArrowRight size={14} />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          className="mb-12 border border-green-800/30 bg-green-900/10 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FiCheckCircle className="text-green-400" /> How Crowdfunding Scripts Work
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: FiTarget,
                title: 'Set Target',
                desc: 'Define your funding goal and campaign duration. All parameters are locked on-chain.',
              },
              {
                icon: FiGift,
                title: 'Issue Tokens',
                desc: 'Backers receive tokens immediately upon contribution. Tokens represent ownership.',
              },
              {
                icon: FiDollarSign,
                title: 'Escrow Funds',
                desc: 'Contributions are held in a BSV script. Neither party can access until conditions are met.',
              },
              {
                icon: FiCheckCircle,
                title: 'Release or Refund',
                desc: 'Goal met? Funds release to project. Goal missed? Automatic refund to all backers.',
              },
            ].map((item, i) => (
              <div key={i} className="flex flex-col">
                <item.icon className="text-2xl text-green-400 mb-3" />
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Active Campaigns */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-sm font-bold text-white mb-6 bg-zinc-900 border border-zinc-800 inline-block px-3 py-1 uppercase tracking-widest">
            Active Campaigns
          </h2>

          <div className="space-y-4">
            {ACTIVE_CAMPAIGNS.map((campaign) => (
              <Link key={campaign.id} href={`/blog/${campaign.id}-onion-farm`} className="block group">
                <div className="border border-zinc-800 bg-zinc-900/20 p-6 hover:border-green-600/50 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-1 bg-green-900/50 text-green-400 text-xs font-mono border border-green-800">
                          {campaign.token}
                        </span>
                        <span className="text-xs text-green-400 uppercase font-bold">
                          {campaign.status === 'active' ? 'Live' : 'Ended'}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">
                        {campaign.name}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">{campaign.description}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-2xl font-bold text-white">
                        ${campaign.raised.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        of ${campaign.target.toLocaleString()} goal
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="h-2 bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${Math.min((campaign.raised / campaign.target) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>{campaign.backers} backers</span>
                      <span>{campaign.daysLeft} days left</span>
                      <span>{Math.round((campaign.raised / campaign.target) * 100)}% funded</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Launch Your Own */}
        <motion.div
          className="grid lg:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Form */}
          <div className="border border-gray-800 p-8 bg-gray-900/20">
            <h2 className="text-xl font-bold mb-6">Launch Your Campaign</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Project Name</label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  placeholder="e.g., Community Solar Farm"
                  className="w-full px-4 py-3 bg-black border border-zinc-700 text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Token Symbol</label>
                  <input
                    type="text"
                    value={formData.tokenSymbol}
                    onChange={(e) => setFormData({ ...formData, tokenSymbol: e.target.value.toUpperCase() })}
                    placeholder="e.g., $SOLAR"
                    maxLength={10}
                    className="w-full px-4 py-3 bg-black border border-zinc-700 text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Target (USD)</label>
                  <input
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    placeholder="50000"
                    className="w-full px-4 py-3 bg-black border border-zinc-700 text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Campaign Duration</label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-zinc-700 text-white focus:border-green-500 focus:outline-none"
                >
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your project and what backers will receive..."
                  rows={4}
                  className="w-full px-4 py-3 bg-black border border-zinc-700 text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">BSV Wallet Address</label>
                <input
                  type="text"
                  value={formData.walletAddress}
                  onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                  placeholder="Your BSV address for receiving funds"
                  className="w-full px-4 py-3 bg-black border border-zinc-700 text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none font-mono text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-green-600 text-white font-bold uppercase hover:bg-green-500 transition-colors"
              >
                Launch Campaign
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div className="border border-gray-800 p-6 bg-gray-900/20">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <FaBitcoin className="text-orange-400" /> Why BSV for Crowdfunding?
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Sub-cent transaction fees enable micro-contributions</li>
                <li>• Native scripting language for trustless escrow</li>
                <li>• Instant token distribution upon contribution</li>
                <li>• Complete on-chain transparency and auditability</li>
                <li>• No intermediaries or platform fees</li>
              </ul>
            </div>

            <div className="border border-gray-800 p-6 bg-gray-900/20">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <FiAlertCircle className="text-amber-400" /> Important Notes
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Crowdfunding campaigns are binding on-chain contracts</li>
                <li>• Token distribution ratios are locked at launch</li>
                <li>• Refunds are automatic if target is not met</li>
                <li>• All campaign parameters are publicly verifiable</li>
              </ul>
            </div>

            <div className="border border-amber-800/30 bg-amber-900/10 p-6">
              <h3 className="font-bold mb-2 text-amber-400">Need Help?</h3>
              <p className="text-sm text-gray-400 mb-4">
                Our team can help you structure your crowdfunding campaign, design tokenomics,
                and ensure compliance with applicable regulations.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300"
              >
                Schedule a consultation <FiArrowRight size={14} />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
