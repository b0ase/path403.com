'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import { Package, Zap, ShoppingCart, Users } from 'lucide-react';

export default function UtilityTokensPage() {
  const useCases = [
    {
      title: 'Platform Access Rights',
      description: 'Grant tiered access to platform features, premium content, or exclusive services.',
      example: 'SaaS platforms using tokens for feature unlocking'
    },
    {
      title: 'Service Credits',
      description: 'Pre-paid credits for API calls, computing resources, or service usage.',
      example: 'Cloud platforms selling compute credits as tokens'
    },
    {
      title: 'Loyalty Programs',
      description: 'Reward customer loyalty with tradeable, redeemable utility tokens.',
      example: 'Retail loyalty points that can be traded or gifted'
    },
    {
      title: 'Subscription Management',
      description: 'Token-based subscriptions that are transferable and verifiable on-chain.',
      example: 'Netflix-style subscription as a transferable token'
    }
  ];

  const bsvAdvantages = [
    {
      title: 'Micro-Transaction Ready',
      description: 'Fees measured in fractions of a penny enable economical micro-payments for every utility token interaction.',
      icon: Zap
    },
    {
      title: 'Infinite Scalability',
      description: 'BSV handles millions of transactions per second, perfect for high-frequency utility token systems.',
      icon: Users
    },
    {
      title: 'On-Chain Logic',
      description: 'Embed complex utility rules directly in smart contracts for automated, trustless operations.',
      icon: Package
    },
    {
      title: 'Instant Settlement',
      description: 'Near-instant confirmation times mean users can spend utility tokens without delays.',
      icon: ShoppingCart
    }
  ];

  const realWorldExamples = [
    {
      industry: 'SaaS Platforms',
      useCase: 'API Credits',
      description: 'Developer platforms issue tokens representing API call credits. Users buy tokens in bulk, use them for API access, and can trade unused tokens.',
      metrics: '10M+ API calls/month tokenized'
    },
    {
      industry: 'Gaming',
      useCase: 'In-Game Currency',
      description: 'Game publishers create utility tokens for in-game purchases. Players earn, buy, and trade tokens across game ecosystems.',
      metrics: '500K+ active player wallets'
    },
    {
      industry: 'Cloud Computing',
      useCase: 'Compute Credits',
      description: 'Cloud providers sell compute time as utility tokens. Users purchase tokens for storage, processing, or bandwidth.',
      metrics: '£2M+ in monthly token sales'
    },
    {
      industry: 'Marketplaces',
      useCase: 'Platform Credits',
      description: 'E-commerce marketplaces issue tokens for fee-free transactions, seller boosts, or premium listings.',
      metrics: '50K+ merchants using tokens'
    }
  ];

  const implementationSteps = [
    {
      step: 1,
      title: 'Token Design Workshop',
      description: 'We analyze your business model and design utility token economics that align with your goals.',
      duration: '1 week'
    },
    {
      step: 2,
      title: 'Smart Contract Development',
      description: 'Custom smart contracts encode utility rules, redemption logic, and transfer restrictions.',
      duration: '1-2 weeks'
    },
    {
      step: 3,
      title: 'Integration & Testing',
      description: 'Integrate tokens into your existing platform with comprehensive testing on BSV testnet.',
      duration: '1 week'
    },
    {
      step: 4,
      title: 'Launch & Support',
      description: 'Mainnet deployment with ongoing monitoring, optimization, and user support.',
      duration: 'Ongoing'
    }
  ];

  return (
    <motion.div
      className="min-h-screen bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Header */}
      <div className="px-4 md:px-8 py-16">
        <Link
          href="/tokens/types"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        >
          <FiArrowLeft />
          <span>Back to Token Types</span>
        </Link>

        <div className="mb-12 border-b border-white/20 pb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center">
              <Package className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tight">
              Utility Tokens
            </h1>
          </div>
          <p className="text-2xl text-white/60 mb-4">
            Access, Credits & Platform Rights
          </p>
          <p className="text-xl text-white/80 max-w-3xl">
            Utility tokens grant access to services, act as digital credits, or provide platform rights within your ecosystem. They're the Swiss Army knife of tokenization.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div className="bg-white/5 border border-white/20 rounded-lg p-6">
            <p className="text-3xl font-bold mb-2">2-4</p>
            <p className="text-sm text-white/60 uppercase tracking-wider">Weeks to Market</p>
          </div>
          <div className="bg-white/5 border border-white/20 rounded-lg p-6">
            <p className="text-3xl font-bold mb-2">Medium</p>
            <p className="text-sm text-white/60 uppercase tracking-wider">Complexity</p>
          </div>
          <div className="bg-white/5 border border-white/20 rounded-lg p-6">
            <p className="text-3xl font-bold mb-2">∞</p>
            <p className="text-sm text-white/60 uppercase tracking-wider">Transaction Volume</p>
          </div>
          <div className="bg-white/5 border border-white/20 rounded-lg p-6">
            <p className="text-3xl font-bold mb-2">&lt;£0.001</p>
            <p className="text-sm text-white/60 uppercase tracking-wider">Cost per TX</p>
          </div>
        </div>

        {/* Use Cases */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 uppercase tracking-tight">Primary Use Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {useCases.map((useCase, index) => (
              <div key={index} className="bg-white/5 border border-white/20 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3">{useCase.title}</h3>
                <p className="text-white/80 mb-4">{useCase.description}</p>
                <div className="bg-white/10 border-l-4 border-green-500 p-3 rounded">
                  <p className="text-sm text-white/60">Example:</p>
                  <p className="text-sm text-white">{useCase.example}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BSV Advantages */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 uppercase tracking-tight">Why BSV for Utility Tokens?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bsvAdvantages.map((advantage, index) => (
              <div key={index} className="bg-gradient-to-b from-white/10 to-white/5 border border-white/20 rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <advantage.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">{advantage.title}</h3>
                <p className="text-sm text-white/60">{advantage.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Real-World Examples */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 uppercase tracking-tight">Real-World Applications</h2>
          <div className="space-y-4">
            {realWorldExamples.map((example, index) => (
              <div key={index} className="bg-white/5 border border-white/20 rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="inline-block bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                      {example.industry}
                    </span>
                    <h3 className="text-xl font-bold">{example.useCase}</h3>
                  </div>
                  <span className="text-2xl font-bold text-white/20">0{index + 1}</span>
                </div>
                <p className="text-white/80 mb-3">{example.description}</p>
                <div className="bg-white/10 px-4 py-2 rounded inline-block">
                  <p className="text-sm font-mono text-green-400">{example.metrics}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Implementation Process */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 uppercase tracking-tight">Implementation Process</h2>
          <div className="space-y-4">
            {implementationSteps.map((step) => (
              <div key={step.step} className="flex gap-6 border-l-4 border-white/20 pl-6 pb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-white text-black rounded-lg flex items-center justify-center font-bold text-xl -ml-9 mt-1">
                  {step.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold">{step.title}</h3>
                    <span className="text-sm text-white/60 font-mono">{step.duration}</span>
                  </div>
                  <p className="text-white/80">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-lg p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Build Your Utility Token?
          </h2>
          <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
            Get started with a free consultation. We'll analyze your use case and design token economics that drive your business forward.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/agent/chat"
              className="bg-white text-black px-8 py-4 rounded-lg font-bold uppercase tracking-wider hover:bg-white/90 transition-colors inline-flex items-center justify-center gap-2"
            >
              <Package className="w-5 h-5" />
              Start Building
            </Link>
            <Link
              href="/tokens/types"
              className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-lg font-bold uppercase tracking-wider hover:bg-white/20 transition-colors inline-flex items-center justify-center gap-2"
            >
              <FiArrowLeft className="w-5 h-5" />
              Explore Other Types
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
