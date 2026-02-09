'use client';

import React from 'react';
import {
  FiTrendingUp,
  FiShield,
  FiUserCheck,
  FiKey,
  FiArrowRight,
  FiCheckCircle,
  FiPieChart,
  FiGlobe,
  FiLock,
  FiBriefcase,
  FiCpu
} from 'react-icons/fi';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function InvestorsPage() {
  return (
    <motion.div
      className="min-h-screen bg-black text-white font-mono"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <main className="px-4 md:px-8 py-16">
        {/* Header */}
        <motion.header
          className="mb-12 border-b border-zinc-800 pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-zinc-900 border border-zinc-800">
              <FiTrendingUp size={32} />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight uppercase">
                Invest in $BOASE
              </h1>
              <p className="text-zinc-500 text-sm uppercase tracking-widest">
                FCA Exempt • Venture Studio Equity
              </p>
            </div>
          </div>
          <p className="text-zinc-400 max-w-2xl mt-4">
            Join verified investors in the b0ase.com venture studio. KYC-verified, certified high net worth and sophisticated investors only.
            2-of-2 multisig custody ensures FCA compliance while protecting your assets.
          </p>
        </motion.header>

        {/* Value Proposition Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          <div className="border border-zinc-800 bg-zinc-900/30 p-8 hover:border-zinc-600 transition-colors">
            <div className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-4">01. Model</div>
            <h3 className="text-xl font-bold text-white mb-3 uppercase flex items-center gap-2">
              <FiBriefcase className="text-zinc-400" /> Venture Studio
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              $BOASE gives you exposure to an entire portfolio of AI-powered applications, SaaS products, and digital ventures built by b0ase.com.
            </p>
          </div>
          <div className="border border-zinc-800 bg-zinc-900/30 p-8 hover:border-zinc-600 transition-colors">
            <div className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-4">02. Returns</div>
            <h3 className="text-xl font-bold text-white mb-3 uppercase flex items-center gap-2">
              <FiPieChart className="text-zinc-400" /> Revenue Sharing
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Token holders receive proportional distributions from studio revenue, including client contracts, product sales, and licensing deals.
            </p>
          </div>
          <div className="border border-zinc-800 bg-zinc-900/30 p-8 hover:border-zinc-600 transition-colors">
            <div className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-4">03. Tech</div>
            <h3 className="text-xl font-bold text-white mb-3 uppercase flex items-center gap-2">
              <FiGlobe className="text-zinc-400" /> Blockchain Native
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              $BOASE is a BSV-20 token with full on-chain transparency. Your ownership is verifiable, transferable, and secured by Bitcoin.
            </p>
          </div>
        </motion.div>

        {/* CTA Section - Industrial Pattern */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border border-zinc-800 bg-zinc-900/10 p-8 md:p-12 mb-16 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tight mb-6">
            Become a Verified Investor
          </h2>

          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm uppercase tracking-wider font-bold">
            <div className="flex items-center gap-2">
              <FiUserCheck className="text-green-500" />
              <span className="text-zinc-300">KYC Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <FiShield className="text-green-500" />
              <span className="text-zinc-300">Certified Investor</span>
            </div>
            <div className="flex items-center gap-2">
              <FiKey className="text-green-500" />
              <span className="text-zinc-300">2-of-2 Custody</span>
            </div>
          </div>

          <p className="text-zinc-400 mb-8 max-w-2xl mx-auto">
            Complete the onboarding process to join the investor registry.
            Minimum investment: £1,000. Secure 2-of-2 multisig custody with mutual approval.
          </p>

          <Link
            href="/investors/onboard"
            className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors border border-white"
          >
            Start Onboarding <FiArrowRight />
          </Link>
        </motion.div>

        {/* Onboarding Process - Horizontal Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-zinc-900 border border-zinc-800">
              <FiCheckCircle size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-tight">Onboarding Process</h2>
              <p className="text-zinc-500 text-sm">Step-by-step verification pipeline</p>
            </div>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            {[
              { step: '01', title: 'Connect', desc: 'Link wallet or sign in', icon: FiKey },
              { step: '02', title: 'KYC', desc: 'Verify identity docs', icon: FiUserCheck },
              { step: '03', title: 'Certify', desc: 'Confirm investor status', icon: FiShield },
              { step: '04', title: 'Vault', desc: 'Create 2-of-2 multisig', icon: FiLock },
              { step: '05', title: 'Invest', desc: 'Purchase tokens', icon: FiTrendingUp },
            ].map((item, i) => (
              <div
                key={i}
                className="border border-zinc-800 p-6 bg-zinc-900/20 hover:border-zinc-600 transition-colors"
              >
                <div className="text-3xl font-bold text-zinc-800 mb-3">{item.step}</div>
                <item.icon className="text-xl text-zinc-400 mb-3" />
                <h3 className="font-bold text-white mb-2 text-sm uppercase">{item.title}</h3>
                <p className="text-zinc-500 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Compliant Custody Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid lg:grid-cols-2 gap-8 mb-16"
        >
          <div className="border border-zinc-800 p-8 bg-zinc-900/20">
            <div className="flex items-center gap-3 mb-6">
              <FiKey size={24} className="text-zinc-500" />
              <h3 className="text-xl font-bold text-white uppercase">2-of-2 Multisig</h3>
            </div>
            <p className="text-zinc-400 mb-8 leading-relaxed text-sm">
              Your tokens are held in a Bitcoin SV multisig vault requiring both keys to authorize any transfer.
              This ensures regulatory compliance: you cannot transfer shares without b0ase approval, and we cannot move your tokens without your consent.
            </p>
            <div className="space-y-4 text-sm font-mono uppercase">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-zinc-300">Key 1: Your Wallet (User Control)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-zinc-300">Key 2: Platform (Admin Control)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-zinc-600 rounded-full"></div>
                <span className="text-zinc-500">Both Required for Transfer</span>
              </div>
            </div>
          </div>

          <div className="border border-zinc-800 p-8 bg-zinc-900/20">
            <div className="flex items-center gap-3 mb-6">
              <FiShield size={24} className="text-zinc-500" />
              <h3 className="text-xl font-bold text-white uppercase">FCA Compliance</h3>
            </div>
            <p className="text-zinc-400 mb-8 leading-relaxed text-sm">
              $BOASE is offered under FSMA prospectus exemptions to certified investors.
              All investors undergo KYC/AML verification per UK regulations before accessing the deal flow.
            </p>
            <div className="space-y-4 text-sm font-mono uppercase">
              <div className="flex items-center gap-3">
                <FiCheckCircle className="text-green-500" />
                <span className="text-zinc-300">FSMA Section 86 Exempt</span>
              </div>
              <div className="flex items-center gap-3">
                <FiCheckCircle className="text-green-500" />
                <span className="text-zinc-300">KYC/AML Mandatory</span>
              </div>
              <div className="flex items-center gap-3">
                <FiCheckCircle className="text-green-500" />
                <span className="text-zinc-300">High Net Worth / Sophisticated</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Other Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-zinc-900 border border-zinc-800">
              <FiGlobe size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-tight">Alternative Options</h2>
              <p className="text-zinc-500 text-sm">Explore other ways to participate</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/exchange"
              className="group border border-zinc-800 p-8 hover:bg-zinc-900/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <FiPieChart size={32} className="text-zinc-500 group-hover:text-white transition-colors" />
                <FiArrowRight className="text-zinc-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-2 uppercase">Project Portfolio</h3>
              <p className="text-zinc-400 text-sm">
                Trade and invest in specific project tokens rather than the studio itself.
              </p>
            </Link>

            <Link
              href="/agent"
              className="group border border-zinc-800 p-8 hover:bg-zinc-900/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <FiCpu size={32} className="text-zinc-500 group-hover:text-white transition-colors" />
                <FiArrowRight className="text-zinc-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-2 uppercase">Build Your Vision</h3>
              <p className="text-zinc-400 text-sm">
                Partner with us to build and tokenize your own AI-powered platform.
              </p>
            </Link>
          </div>
        </motion.div>

        {/* Footer Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center border-t border-zinc-800 pt-8"
        >
          <Link
            href="/investors/dashboard"
            className="text-zinc-500 hover:text-white text-sm uppercase tracking-widest font-bold transition-colors"
          >
            Already an investor? View Dashboard →
          </Link>
        </motion.div>
      </main>
    </motion.div>
  );
}
