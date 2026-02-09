'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaCoins, FaRocket, FaCogs, FaShieldAlt, FaChartLine, FaHandshake, FaEthereum, FaBitcoin, FaWallet, FaQuestionCircle } from 'react-icons/fa';
import { SiSolana, SiBinance, SiPolygon } from 'react-icons/si';
import { BsCurrencyBitcoin } from 'react-icons/bs';
import { FiHome } from 'react-icons/fi';

export default function TaaSPage() {
  const [url, setUrl] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [minted, setMinted] = useState(false);
  const [mintLoading, setMintLoading] = useState(false);

  return (
    <motion.div
      className="min-h-screen bg-black text-white relative font-mono selection:bg-white selection:text-black"
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-end gap-4 border-b border-zinc-900 pb-4">
            <h2 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
              TAAS<span className="text-zinc-600">_SYS</span>
            </h2>
            <div className="text-xs text-zinc-500 mb-2 uppercase tracking-widest">
              Tokens as a Service
            </div>
          </div>

          {/* Hero Section */}
          <div className="bg-black border border-zinc-800 p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                <FaCoins className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold uppercase tracking-tight">Tokens as a Service</h1>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Tokenization Infrastructure</p>
              </div>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl mb-6">
              Unlock new ways to fund, grow, and engage your business. With TaaS, you can easily create digital tokens that represent ownership, access, or rewards in your company. Raise capital from your community, share profits transparently, and turn your customers into true stakeholders.
            </p>
            <Link href="/studio/start-a-company" className="inline-block px-6 py-3 bg-white text-black font-bold uppercase tracking-wider text-sm hover:bg-zinc-200 transition-colors">
              Start Your Token Journey
            </Link>
          </div>

          {/* Why Tokenize */}
          <div className="bg-black border border-zinc-800 mb-8">
            <div className="bg-zinc-900/50 px-4 py-3 border-b border-zinc-800">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Why_Tokenize</span>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-zinc-800 p-4">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Raise Capital</p>
                  <p className="text-sm text-zinc-300">Offer tokens to your supporters and raise funds without giving up control.</p>
                </div>
                <div className="border border-zinc-800 p-4">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Share Success</p>
                  <p className="text-sm text-zinc-300">Distribute profits or rewards to token holders, building loyalty and trust.</p>
                </div>
                <div className="border border-zinc-800 p-4">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Build Community</p>
                  <p className="text-sm text-zinc-300">Turn your customers into stakeholders who are invested in your growth.</p>
                </div>
                <div className="border border-zinc-800 p-4">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Future-Proof</p>
                  <p className="text-sm text-zinc-300">Stay ahead in the new, economically powered web where value flows directly.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Tokenise Your Business */}
            <div className="bg-black border border-zinc-800">
              <div className="bg-zinc-900/50 px-4 py-3 border-b border-zinc-800 flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tokenise_Business</span>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              </div>
              <div className="p-6">
                <p className="text-zinc-400 text-sm mb-4">
                  Transform your business into a community-powered enterprise. Tokenisation lets you offer digital shares to your customers, fans, or investors.
                </p>
                <div className="bg-zinc-900/30 border border-zinc-800 p-4 mb-4">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Distribute Website Revenue</p>
                  <p className="text-zinc-400 text-xs mb-3">Tokenising your URL enables you to automatically distribute revenue from website access payments to your token holders.</p>
                  <input
                    type="text"
                    placeholder="https://yourdomain.com"
                    value={url}
                    onChange={e => { setUrl(e.target.value); setMinted(false); }}
                    className="w-full bg-black border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-white mb-2"
                    disabled={mintLoading}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setWalletConnected(true)}
                      disabled={walletConnected || mintLoading}
                      className={`flex-1 px-3 py-2 text-xs font-bold uppercase transition-colors ${walletConnected ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white text-black hover:bg-zinc-200'}`}
                    >
                      {walletConnected ? 'Connected' : 'Connect Wallet'}
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setMintLoading(true);
                      setTimeout(() => {
                        setMinted(true);
                        setMintLoading(false);
                      }, 1500);
                    }}
                    disabled={!url || !walletConnected || mintLoading}
                    className="w-full mt-2 px-3 py-2 text-xs font-bold uppercase bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {mintLoading ? 'Minting...' : 'Tokenise URL'}
                  </button>
                  {minted && (
                    <p className="text-green-400 text-xs mt-2">Your URL has been tokenised!</p>
                  )}
                </div>
              </div>
            </div>

            {/* Branded Business Wallet */}
            <div className="bg-black border border-zinc-800">
              <div className="bg-zinc-900/50 px-4 py-3 border-b border-zinc-800 flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Business_Wallet</span>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
              </div>
              <div className="p-6">
                <p className="text-zinc-400 text-sm mb-4">
                  Give your business a professional, secure digital wallet—customized with your brand.
                </p>
                <div className="space-y-2 mb-4">
                  {[
                    { label: 'Custom Branding', desc: 'Your logo, colors, and business identity' },
                    { label: 'Multi-chain Ready', desc: 'ETH, BSV, Solana, Polygon, BSC' },
                    { label: 'Team Access', desc: 'Roles and permissions' },
                    { label: 'Token Management', desc: 'Mint, distribute, and track' },
                    { label: 'Enterprise Security', desc: 'Advanced protection' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className="text-zinc-600">•</span>
                      <span className="text-white font-bold">{item.label}:</span>
                      <span className="text-zinc-500">{item.desc}</span>
                    </div>
                  ))}
                </div>
                <Link href="/agent" className="inline-block px-4 py-2 bg-white text-black font-bold uppercase tracking-wider text-xs hover:bg-zinc-200 transition-colors">
                  Book a Demo
                </Link>
              </div>
            </div>
          </div>

          {/* Supported Blockchains */}
          <div className="bg-black border border-zinc-800 mb-8">
            <div className="bg-zinc-900/50 px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
              <FaEthereum className="text-zinc-500" />
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Supported_Blockchains</span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                {[
                  { icon: FaEthereum, name: 'Ethereum', color: 'text-blue-400' },
                  { icon: SiSolana, name: 'Solana', color: 'text-purple-400' },
                  { icon: SiBinance, name: 'BSC', color: 'text-yellow-400' },
                  { icon: SiPolygon, name: 'Polygon', color: 'text-indigo-400' },
                  { icon: FaBitcoin, name: 'Bitcoin', color: 'text-orange-400' },
                  { icon: BsCurrencyBitcoin, name: 'BSV', color: 'text-yellow-500' },
                  { icon: FaRocket, name: 'Stellar', color: 'text-pink-400' },
                  { icon: FaCoins, name: 'Other EVM', color: 'text-green-400' },
                ].map((chain, i) => (
                  <div key={i} className="flex flex-col items-center text-center">
                    <chain.icon className={`${chain.color} text-2xl mb-1`} />
                    <span className="text-[10px] text-zinc-500 uppercase">{chain.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Supported Wallets */}
          <div className="bg-black border border-zinc-800 mb-8">
            <div className="bg-zinc-900/50 px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
              <FaWallet className="text-zinc-500" />
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Supported_Wallets</span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                {[
                  { name: 'MetaMask', color: 'text-orange-400' },
                  { name: 'Ledger', color: 'text-zinc-300' },
                  { name: 'Trezor', color: 'text-zinc-400' },
                  { name: 'Xverse', color: 'text-blue-400' },
                  { name: 'Phantom', color: 'text-purple-400' },
                  { name: 'Unisat', color: 'text-yellow-400' },
                  { name: 'Trust', color: 'text-pink-400' },
                  { name: 'Other', color: 'text-green-400' },
                ].map((wallet, i) => (
                  <div key={i} className="flex flex-col items-center text-center">
                    <FaWallet className={`${wallet.color} text-2xl mb-1`} />
                    <span className="text-[10px] text-zinc-500 uppercase">{wallet.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: FaRocket, title: 'Custom Token Creation', desc: 'Design and deploy tokens tailored to your brand', color: 'text-blue-400' },
              { icon: FaCogs, title: 'End-to-End Management', desc: 'From smart contract deployment to ongoing support', color: 'text-green-400' },
              { icon: FaShieldAlt, title: 'Security & Compliance', desc: 'Highest standards for security and legal compliance', color: 'text-purple-400' },
              { icon: FaChartLine, title: 'Integration & Growth', desc: 'Integrate with exchanges, wallets, and dApps', color: 'text-yellow-400' },
            ].map((feature, i) => (
              <div key={i} className="bg-black border border-zinc-800 p-4">
                <feature.icon className={`${feature.color} text-xl mb-3`} />
                <h3 className="text-sm font-bold uppercase tracking-tight mb-1">{feature.title}</h3>
                <p className="text-zinc-500 text-xs">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* How It Works */}
          <div className="bg-black border border-zinc-800 mb-8">
            <div className="bg-zinc-900/50 px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
              <FaHandshake className="text-zinc-500" />
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">How_It_Works</span>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { step: '01', title: 'Consultation', desc: 'Discuss your goals, use cases, and requirements' },
                  { step: '02', title: 'Design', desc: 'Draft tokenomics, compliance, and technical specs' },
                  { step: '03', title: 'Development', desc: 'Build, test, and deploy custom token and contracts' },
                  { step: '04', title: 'Launch', desc: 'Guidance through launch, listings, and management' },
                ].map((item, i) => (
                  <div key={i} className="border border-zinc-800 p-4">
                    <span className="text-2xl font-bold text-zinc-700">{item.step}</span>
                    <h4 className="text-sm font-bold uppercase tracking-tight mt-2 mb-1">{item.title}</h4>
                    <p className="text-zinc-500 text-xs">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-black border border-zinc-800 mb-8">
            <div className="bg-zinc-900/50 px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
              <FaQuestionCircle className="text-zinc-500" />
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Multi_Chain_Support</span>
            </div>
            <div className="p-6">
              <div className="space-y-2 text-sm">
                {[
                  'Launch your token on one or multiple blockchains',
                  'Support for all major wallets, including hardware options',
                  'Seamless integration with DeFi, NFT, and dApp ecosystems',
                  'Custom integrations available for new or emerging chains',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/agent" className="px-6 py-3 bg-white text-black font-bold uppercase tracking-wider text-sm hover:bg-zinc-200 transition-colors">
              Book a Consultation
            </Link>
            <Link href="/agent" className="px-6 py-3 border border-zinc-800 text-zinc-400 hover:text-white hover:border-white font-bold uppercase tracking-wider text-sm transition-colors">
              Request Custom Integration
            </Link>
            <Link href="/" className="px-6 py-3 border border-zinc-800 text-zinc-400 hover:text-white hover:border-white font-bold uppercase tracking-wider text-sm transition-colors flex items-center gap-2">
              <FiHome size={14} />
              Home
            </Link>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
