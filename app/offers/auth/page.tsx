'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FaGoogle,
  FaTwitter,
  FaDiscord,
  FaGithub,
  FaLinkedin,
  FaEthereum
} from 'react-icons/fa';
import { FiZap, FiCheck, FiArrowRight } from 'react-icons/fi';
import { SiSolana } from 'react-icons/si';

const socialProviders = [
  { name: 'Google', icon: FaGoogle, implementation: 'Direct OAuth2' },
  { name: 'Twitter / X', icon: FaTwitter, implementation: 'Custom PKCE Flow' },
  { name: 'Discord', icon: FaDiscord, implementation: 'Supabase Auth' },
  { name: 'GitHub', icon: FaGithub, implementation: 'Supabase Auth' },
  { name: 'LinkedIn', icon: FaLinkedin, implementation: 'OpenID Connect' },
];

const walletProviders = [
  { name: 'MetaMask', chain: 'ETH', icon: FaEthereum, color: 'text-orange-500' },
  { name: 'Phantom', chain: 'SOL', icon: SiSolana, color: 'text-purple-500' },
  { name: 'OKX', chain: 'ETH', icon: FaEthereum, color: 'text-white' },
  { name: 'HandCash', chain: 'BSV', icon: FiZap, color: 'text-green-500' },
  { name: 'Yours', chain: 'BSV', icon: FiZap, color: 'text-blue-500' },
];

const features = [
  'Unified user model - one account, unlimited providers',
  'Account merging - link existing accounts seamlessly',
  'PKCE security for all OAuth flows',
  'Row-Level Security (RLS) on all database tables',
  '6-level RBAC system with granular permissions',
  'Dual session management (OAuth + wallet cookies)',
  'Address normalization prevents duplicate accounts',
  'Domain-safe redirect URI handling',
  'Full audit trail with account tombstoning',
  'KYC-ready architecture',
];

const included = [
  'Database schema (unified_users, user_identities)',
  'All OAuth API routes + callbacks',
  'Wallet authentication endpoint',
  'AuthContext provider component',
  'WalletConnectModal UI component',
  'Account management page',
  'Middleware route protection',
  'RBAC library with hooks',
  'Full documentation',
  '30 days integration support',
];

export default function AuthOfferPage() {
  return (
    <motion.div
      className="min-h-screen bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <section className="px-4 md:px-8 py-16 md:py-24">
        <div className="w-full">
          {/* Header */}
          <div className="mb-8">
            <Link href="/offers" className="text-xs font-mono uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
              &larr; All Offers
            </Link>
          </div>

          <div className="mb-4">
            <span className="text-xs font-mono uppercase tracking-widest text-gray-500">
              Enterprise Identity Infrastructure
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-none mb-6">
            MULTI_AUTH
          </h1>

          <div className="flex items-baseline gap-4 mb-8 border-b border-gray-800 pb-8">
            <span className="text-6xl md:text-8xl font-bold">£2,500</span>
            <span className="text-xl text-gray-500">integration package</span>
          </div>

          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mb-12">
            A unified identity system that lets users authenticate through any combination of
            social OAuth providers and crypto wallets—all linked to a single account.
            The hardest auth problem, solved.
          </p>

          {/* Provider Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-800 border border-gray-800 mb-16">
            {/* Social OAuth */}
            <div className="bg-black p-8">
              <h2 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-6">
                Social OAuth Providers
              </h2>
              <div className="space-y-4">
                {socialProviders.map((provider) => (
                  <div key={provider.name} className="flex items-center justify-between py-2 border-b border-gray-900">
                    <div className="flex items-center gap-3">
                      <provider.icon className="text-lg" />
                      <span className="font-medium">{provider.name}</span>
                    </div>
                    <span className="text-xs text-gray-600">{provider.implementation}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Wallets */}
            <div className="bg-black p-8">
              <h2 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-6">
                Crypto Wallets
              </h2>
              <div className="space-y-4">
                {walletProviders.map((wallet) => (
                  <div key={wallet.name} className="flex items-center justify-between py-2 border-b border-gray-900">
                    <div className="flex items-center gap-3">
                      <wallet.icon className={`text-lg ${wallet.color}`} />
                      <span className="font-medium">{wallet.name}</span>
                    </div>
                    <span className="text-[10px] text-gray-700 uppercase tracking-wider">{wallet.chain}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Why This Is Hard */}
          <div className="mb-16 border border-gray-800 p-8 md:p-12">
            <h2 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-6">
              Why This Is Hard
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-400">
              <div>
                <h3 className="text-white font-bold mb-2">Identity Unification</h3>
                <p className="text-sm">
                  Users expect to sign in with Google on their phone, MetaMask on desktop,
                  and Twitter on another device—and see the same account. This requires a
                  central identity hub with provider-agnostic linking.
                </p>
              </div>
              <div>
                <h3 className="text-white font-bold mb-2">Account Merging</h3>
                <p className="text-sm">
                  What happens when someone creates an account with Google, then later connects
                  a wallet that already has an account? You need tombstoning, audit trails,
                  and graceful data migration.
                </p>
              </div>
              <div>
                <h3 className="text-white font-bold mb-2">Mixed Session Types</h3>
                <p className="text-sm">
                  OAuth providers use cookies managed by Supabase. Wallets need custom cookies.
                  Twitter's broken Supabase integration requires a custom PKCE implementation.
                  All must coexist.
                </p>
              </div>
              <div>
                <h3 className="text-white font-bold mb-2">Security at Every Layer</h3>
                <p className="text-sm">
                  PKCE for OAuth flows. Address normalization to prevent duplicates.
                  Row-Level Security in the database. Middleware route protection.
                  RBAC for feature access. Nothing can be skipped.
                </p>
              </div>
            </div>
          </div>

          {/* Features + Included */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-800 border border-gray-800 mb-16">
            {/* Features */}
            <div className="bg-black p-8">
              <h2 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-6">
                Technical Features
              </h2>
              <div className="space-y-3">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <FiCheck className="text-white mt-0.5 flex-shrink-0" size={14} />
                    <span className="text-gray-400 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What's Included */}
            <div className="bg-black p-8">
              <h2 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-6">
                What's Included
              </h2>
              <div className="space-y-3">
                {included.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-gray-700">+</span>
                    <span className="text-gray-400 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Architecture Overview */}
          <div className="mb-16 border border-gray-800">
            <div className="p-4 border-b border-gray-800 bg-gray-900/30">
              <span className="text-xs font-mono uppercase tracking-widest text-gray-500">
                Architecture
              </span>
            </div>
            <div className="p-8 font-mono text-sm">
              <pre className="text-gray-500 overflow-x-auto">
{`┌─────────────────────────────────────────────────────────┐
│                     unified_users                        │
│  id | display_name | primary_email | merged_into_id     │
└─────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ user_identities │ │ user_identities │ │ user_identities │
│ provider: google│ │ provider: wallet│ │ provider: twitter│
│ oauth_provider: │ │ address: 0x...  │ │ handle: @user   │
│   google        │ │                 │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘

All identities → single unified_user → single account`}
              </pre>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-6">
              Built With
            </h2>
            <div className="flex flex-wrap gap-3">
              {['Next.js 14', 'Supabase', 'TypeScript', 'PostgreSQL', 'Row-Level Security', 'HandCash Connect SDK', 'EIP-1193'].map((tech) => (
                <span key={tech} className="px-3 py-1 border border-gray-800 text-sm text-gray-400">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <a
              href="/contact"
              className="px-8 py-4 text-sm font-bold uppercase tracking-widest hover:opacity-80 transition-colors text-center flex items-center justify-center gap-2"
              style={{ backgroundColor: '#fff', color: '#000' }}
            >
              Get Started <FiArrowRight />
            </a>
            <Link
              href="/multi-auth"
              className="px-8 py-4 bg-transparent border border-gray-800 text-white text-sm font-bold uppercase tracking-widest hover:border-gray-600 transition-colors text-center"
            >
              View Live Implementation
            </Link>
          </div>

          {/* Trust */}
          <div className="pt-8 border-t border-gray-800">
            <p className="text-xs text-gray-500 uppercase tracking-widest">
              Production-tested on b0ase.com · 10 providers · 3 blockchains · Full source code included
            </p>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
