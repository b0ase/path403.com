'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Eye,
  Bot,
  Coins,
  Building,
  Target,
  Star,
  Activity,
  Brain,
  Layers,
  Database,
  GitBranch,
  Settings,
  Wallet,
  Trophy,
  Gem,
  Crown,
  Workflow,
  Gamepad2
} from 'lucide-react';

import IrrigationFlow from '@/components/boase/IrrigationFlow';

export default function DividendsPage() {
  return (

    <motion.div
      className="min-h-screen bg-black text-white selection:bg-white selection:text-black relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Main Content */}
      <motion.section
        className="px-4 md:px-8 py-16 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="w-full">
          {/* Standardized Header */}
          <motion.div
            className="mb-16 border-b border-zinc-900 pb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="flex items-end gap-4">
              {/* Pyramid Icon - Scaled Down */}
              <div className="relative w-16 h-16 mb-1">
                <svg width="100%" height="100%" viewBox="0 0 120 110" className="relative">
                  <polygon points="60,5 5,105 115,105" fill="none" stroke="#ffffff" strokeWidth="4" />
                </svg>
                <div className="absolute left-1/2 top-1/3 -translate-x-1/2 translate-y-1">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                DIVIDENDS
              </h1>
              <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                REVENUE
              </div>
            </div>
          </motion.div>

          {/* Irrigation Model Section */}
          <div className="mb-32">
            {/* Irrigation Map */}
            <IrrigationFlow />
          </div>

          {/* Mission & Vision */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-8 text-white">Mission & Vision</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="border border-white/10 p-8">
                <Target className="w-12 h-12 text-white mb-4" />
                <h3 className="text-2xl font-semibold mb-4 text-white">Our Mission</h3>
                <p className="text-gray-400">
                  To democratize digital wealth creation by making tokenized business building accessible to every entrepreneur, developer, and creative worldwide through AI-powered development and automated financial infrastructure.
                </p>
              </div>
              <div className="border border-white/10 p-8">
                <Star className="w-12 h-12 text-white mb-4" />
                <h3 className="text-2xl font-semibold mb-4 text-white">Our Vision</h3>
                <p className="text-gray-400">
                  To become the standard for automated digital corporations, where success is shared transparently with all stakeholders.
                </p>
              </div>
            </div>
          </div>

          {/* Core Technology Stack */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-8 text-white">Core Technology Stack</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="border border-white/10 p-6">
                <Bot className="w-10 h-10 text-white mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-white">AI Development Engine</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Claude 3.5, GPT-4, and custom AI models for automated code generation and review
                </p>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>Automated feature building</li>
                  <li>Code quality assurance</li>
                  <li>Self-healing systems</li>
                  <li>Predictive optimization</li>
                </ul>
              </div>

              <div className="border border-white/10 p-6">
                <Coins className="w-10 h-10 text-white mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-white">Blockchain Infrastructure</h3>
                <p className="text-gray-400 text-sm mb-4">
                  BSV blockchain for scalable, low-cost tokenization and transaction processing
                </p>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>Instant token creation</li>
                  <li>Automated smart contracts</li>
                  <li>Revenue distribution</li>
                  <li>Immutable record keeping</li>
                </ul>
              </div>

              <div className="border border-white/10 p-6">
                <Building className="w-10 h-10 text-white mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-white">Web3 Integration</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Full-stack modern web development with blockchain-native capabilities
                </p>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>Next.js & React</li>
                  <li>TypeScript & Node.js</li>
                  <li>Three.js visualizations</li>
                  <li>Real-time data streams</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Portfolio Ecosystem */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-8 text-white">Portfolio Ecosystem</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="border border-white/10 p-6">
                <Gamepad2 className="w-10 h-10 text-white mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-white">Ninja Punk Girls</h3>
                <p className="text-gray-400 text-sm">
                  Gaming and NFT collection ecosystem with multiple branded tokens and AI-driven character development
                </p>
                <div className="mt-4 text-sm text-gray-400">
                  <div>Tokens: $NPG, $AIGF, $TRIBE</div>
                  <div>Market Cap: $400K+</div>
                </div>
              </div>

              <div className="border border-white/10 p-6">
                <Building className="w-10 h-10 text-white mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-white">Bitcoin Corporation</h3>
                <p className="text-gray-400 text-sm">
                  Suite of Bitcoin-native applications for banking, AI, gaming, and social interactions
                </p>
                <div className="mt-4 text-sm text-gray-400">
                  <div>Apps: 8+ specialized platforms</div>
                  <div>Focus: DeFi & Web3 tools</div>
                </div>
              </div>

              <div className="border border-white/10 p-6">
                <Activity className="w-10 h-10 text-white mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-white">b0ase Ventures</h3>
                <p className="text-gray-400 text-sm">
                  Diverse digital products portfolio including AI tools, marketplaces, and creative platforms
                </p>
                <div className="mt-4 text-sm text-gray-400">
                  <div>Projects: 20+ active</div>
                  <div>Token: $BOASE index</div>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Features */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-8 text-white">Platform Capabilities</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="border border-white/10 p-6">
                <Brain className="w-8 h-8 text-white mb-3" />
                <h4 className="font-semibold mb-2 text-white">AI-First Development</h4>
                <p className="text-gray-400 text-sm">
                  Automated code generation with human oversight
                </p>
              </div>

              <div className="border border-white/10 p-6">
                <Layers className="w-8 h-8 text-white mb-3" />
                <h4 className="font-semibold mb-2 text-white">Token-as-a-Service</h4>
                <p className="text-gray-400 text-sm">
                  Every project launches with integrated tokenomics
                </p>
              </div>

              <div className="border border-white/10 p-6">
                <Database className="w-8 h-8 text-white mb-3" />
                <h4 className="font-semibold mb-2 text-white">Automated Exchange</h4>
                <p className="text-gray-400 text-sm">
                  Built-in DEX for instant token liquidity
                </p>
              </div>

              <div className="border border-white/10 p-6">
                <GitBranch className="w-8 h-8 text-white mb-3" />
                <h4 className="font-semibold mb-2 text-white">Revenue Sharing</h4>
                <p className="text-gray-400 text-sm">
                  Transparent blockchain-based distributions
                </p>
              </div>

              <div className="border border-white/10 p-6">
                <Settings className="w-8 h-8 text-white mb-3" />
                <h4 className="font-semibold mb-2 text-white">Self-Optimizing</h4>
                <p className="text-gray-400 text-sm">
                  AI continuously improves platform performance
                </p>
              </div>

              <div className="border border-white/10 p-6">
                <Workflow className="w-8 h-8 text-white mb-3" />
                <h4 className="font-semibold mb-2 text-white">Workflow Automation</h4>
                <p className="text-gray-400 text-sm">
                  From idea to deployment in hours, not months
                </p>
              </div>

              <div className="border border-white/10 p-6">
                <Trophy className="w-8 h-8 text-white mb-3" />
                <h4 className="font-semibold mb-2 text-white">Success Metrics</h4>
                <p className="text-gray-400 text-sm">
                  Real-time performance and ROI tracking
                </p>
              </div>

              <div className="border border-white/10 p-6">
                <Crown className="w-8 h-8 text-white mb-3" />
                <h4 className="font-semibold mb-2 text-white">Premium Services</h4>
                <p className="text-gray-400 text-sm">
                  Enterprise-grade features and support
                </p>
              </div>
            </div>
          </div>


          {/* Call to Action */}
          <div className="text-center border border-white/10 p-12">
            <h2 className="text-4xl font-bold mb-6 text-white">
              Join the Dividend Economy
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Be part of the future where AI builds, tokens fund, and success is shared by all
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/portfolio"
                className="px-8 py-3 bg-white text-black font-semibold hover:bg-gray-200 transition-colors"
              >
                Explore Portfolio
              </Link>
              <Link
                href="/investors"
                className="px-8 py-3 border border-white text-white font-semibold hover:bg-white hover:text-black transition-colors"
              >
                Investment Info
              </Link>
              <Link
                href="/exchange"
                className="px-8 py-3 border border-white text-white font-semibold hover:bg-white hover:text-black transition-colors"
              >
                Trade Tokens
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
