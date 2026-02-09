'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { Vote, Users, Shield, TrendingUp } from 'lucide-react';

export default function GovernanceTokensPage() {
  return (
    <motion.div
      className="min-h-screen bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="px-4 md:px-8 py-16">
        <Link href="/tokens/types" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors">
          <FiArrowLeft /> <span>Back to Token Types</span>
        </Link>

        <div className="mb-12 border-b border-white/20 pb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center">
              <Vote className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tight">Governance Tokens</h1>
          </div>
          <p className="text-2xl text-white/60 mb-4">Voting Rights & DAO Participation</p>
          <p className="text-xl text-white/80 max-w-3xl">
            Enable democratic decision-making in your organization. Governance tokens give holders voting rights on proposals, protocol changes, and resource allocation.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div className="bg-white/5 border border-white/20 rounded-lg p-6">
            <p className="text-3xl font-bold mb-2">4-6</p>
            <p className="text-sm text-white/60 uppercase tracking-wider">Weeks to Market</p>
          </div>
          <div className="bg-white/5 border border-white/20 rounded-lg p-6">
            <p className="text-3xl font-bold mb-2">High</p>
            <p className="text-sm text-white/60 uppercase tracking-wider">Complexity</p>
          </div>
          <div className="bg-white/5 border border-white/20 rounded-lg p-6">
            <p className="text-3xl font-bold mb-2">∞</p>
            <p className="text-sm text-white/60 uppercase tracking-wider">Voting Records</p>
          </div>
          <div className="bg-white/5 border border-white/20 rounded-lg p-6">
            <p className="text-3xl font-bold mb-2">100%</p>
            <p className="text-sm text-white/60 uppercase tracking-wider">Transparency</p>
          </div>
        </div>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 uppercase tracking-tight">Primary Use Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'DAO Governance', desc: 'Decentralized Autonomous Organizations use governance tokens for all organizational decisions.', example: 'Investment DAOs voting on portfolio allocation' },
              { title: 'Protocol Upgrades', desc: 'Token holders vote on smart contract upgrades, feature additions, and protocol parameters.', example: 'DeFi protocols voting on interest rate changes' },
              { title: 'Treasury Management', desc: 'Community votes on how to spend organizational funds, grants, and investments.', example: 'Non-profits voting on fund distribution' },
              { title: 'Community Curation', desc: 'Token-weighted voting on content moderation, feature requests, or platform changes.', example: 'Social platforms with community governance' }
            ].map((useCase, i) => (
              <div key={i} className="bg-white/5 border border-white/20 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3">{useCase.title}</h3>
                <p className="text-white/80 mb-4">{useCase.desc}</p>
                <div className="bg-white/10 border-l-4 border-purple-500 p-3 rounded">
                  <p className="text-sm text-white/60">Example:</p>
                  <p className="text-sm text-white">{useCase.example}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 uppercase tracking-tight">Why BSV for Governance?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Permanent Records', desc: 'Every vote is inscribed on-chain with cryptographic proof. Immutable audit trail.', icon: Shield },
              { title: 'Timestamped Votes', desc: 'Precise timestamps prove when votes were cast, preventing manipulation.', icon: TrendingUp },
              { title: 'Scalable Voting', desc: 'Handle millions of votes simultaneously without network congestion or high fees.', icon: Users },
              { title: 'Transparent Results', desc: 'Anyone can verify vote counts and validate governance outcomes on-chain.', icon: Vote }
            ].map((adv, i) => (
              <div key={i} className="bg-gradient-to-b from-white/10 to-white/5 border border-white/20 rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <adv.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">{adv.title}</h3>
                <p className="text-sm text-white/60">{adv.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-lg p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Launch Your DAO</h2>
          <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
            Build transparent, democratic governance for your organization with BSV-powered governance tokens.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/agent/chat" className="bg-white text-black px-8 py-4 rounded-lg font-bold uppercase tracking-wider hover:bg-white/90 transition-colors inline-flex items-center justify-center gap-2">
              <Vote className="w-5 h-5" /> Start Building
            </Link>
            <Link href="/tokens/types" className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-lg font-bold uppercase tracking-wider hover:bg-white/20 transition-colors inline-flex items-center justify-center gap-2">
              <FiArrowLeft className="w-5 h-5" /> Explore Other Types
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
