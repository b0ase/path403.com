'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowLeftIcon,
  Coins,
  TrendingUp,
  Shield,
  CheckCircle,
  Zap,
  Calculator,
  Lock,
  BarChart,
  Settings,
  Flame,
  Globe
} from 'lucide-react';

interface TokenTemplate {
  id: string;
  name: string;
  description: string;
  token_type: string;
  blockchain: string;
  use_cases: string[];
  features: string[];
  complexity: 'Simple' | 'Moderate' | 'Advanced' | 'Expert';
  development_time: string;
  cost_range: string;
  legal_requirements: string[];
  popular?: boolean;
}

interface Blockchain {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  transaction_cost: string;
  speed: string;
}

export default function StudioLaunchTokenPage() {
  const [selectedTokenType, setSelectedTokenType] = useState<string>('All');
  const [selectedTemplate, setSelectedTemplate] = useState<TokenTemplate | null>(null);
  const [tokenForm, setTokenForm] = useState({
    name: '',
    symbol: '',
    supply: '',
    purpose: ''
  });

  const tokenTemplates: TokenTemplate[] = [
    {
      id: 'utility-token',
      name: 'Utility Token',
      description: 'Token that provides access to products or services within your ecosystem.',
      token_type: 'Utility',
      blockchain: 'Ethereum',
      use_cases: ['Platform Access', 'Service Payments', 'Feature Unlocking', 'Rewards System', 'Governance Rights'],
      features: ['Smart Contract', 'Burnable', 'Mintable', 'Pausable', 'Access Control'],
      complexity: 'Moderate',
      development_time: '4-8 weeks',
      cost_range: '$15,000 - $40,000',
      legal_requirements: ['Utility Token Opinion', 'Terms of Service', 'Privacy Policy', 'Compliance Review'],
      popular: true
    },
    {
      id: 'governance-token',
      name: 'Governance Token',
      description: 'Token that grants voting rights and decision-making power in a decentralized organization.',
      token_type: 'Governance',
      blockchain: 'Ethereum',
      use_cases: ['DAO Voting', 'Protocol Governance', 'Treasury Management', 'Proposal Submission', 'Delegation'],
      features: ['Voting Mechanism', 'Delegation', 'Proposal System', 'Time-locked Voting', 'Quadratic Voting'],
      complexity: 'Advanced',
      development_time: '8-12 weeks',
      cost_range: '$30,000 - $60,000',
      legal_requirements: ['DAO Structure', 'Governance Agreement', 'Security Audit', 'Regulatory Review']
    }
  ];

  const blockchains: Blockchain[] = [
    {
      id: 'ethereum',
      name: 'Ethereum',
      description: 'The global standard for smart contracts and DeFi applications.',
      icon: <Globe className="h-6 w-6" />,
      transaction_cost: 'High',
      speed: 'Moderate'
    },
    {
      id: 'solana',
      name: 'Solana',
      description: 'High-speed, low-cost blockchain optimized for scalability.',
      icon: <Zap className="h-6 w-6" />,
      transaction_cost: 'Extremely Low',
      speed: 'Instant'
    }
  ];

  const filteredTemplates = tokenTemplates.filter(t =>
    selectedTokenType === 'All' || t.token_type === selectedTokenType
  );

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black">
      <main className="relative z-10 px-4 md:px-8 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 border-b border-zinc-900 pb-8">
            <Link href="/studio" className="inline-flex items-center text-zinc-500 hover:text-white transition-colors mb-8 text-xs font-bold uppercase tracking-widest group">
              <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Studio
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center mb-6">
                <div className="p-3 bg-zinc-900 border border-zinc-800 mr-4">
                  <Coins className="h-8 w-8 text-zinc-400" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white uppercase leading-none">Capital Synthesis</h1>
              </div>
              <p className="text-xl text-zinc-400 max-w-3xl leading-relaxed">
                Forge and deploy cryptographic assets. Architect tokenomics, select underlying protocols, and launch your economic ecosystem.
              </p>
            </motion.div>
          </div>

          {/* Filtering */}
          <div className="flex flex-col md:flex-row gap-8 justify-between mb-16 items-end">
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Asset Category</span>
              <div className="flex flex-wrap gap-px bg-zinc-900 border border-zinc-900">
                {['All', 'Utility', 'Governance', 'Security', 'NFT'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedTokenType(type)}
                    className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${selectedTokenType === type
                        ? 'bg-white text-black'
                        : 'bg-black text-zinc-500 hover:text-zinc-300'
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          <section className="mb-24">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-8 flex items-center gap-4">
              <span className="w-12 h-px bg-zinc-800"></span>
              Token Blueprints
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="group"
                >
                  <div
                    className="bg-zinc-950 border border-zinc-900 hover:border-white transition-all duration-300 cursor-pointer p-8 relative overflow-hidden h-full flex flex-col"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    {template.popular && (
                      <div className="absolute top-0 right-0 p-2 text-black bg-white border-l border-b border-white z-10">
                        <span className="text-[8px] font-bold uppercase tracking-tighter">POPULAR</span>
                      </div>
                    )}

                    <div className="mb-8 p-3 bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:text-white transition-colors w-fit">
                      <Flame className="h-6 w-6" />
                    </div>

                    <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-3 group-hover:translate-x-1 transition-transform">{template.name}</h3>
                    <p className="text-zinc-500 text-[10px] uppercase tracking-widest leading-relaxed mb-8 flex-1">
                      {template.description}
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t border-zinc-900">
                      <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{template.token_type}</span>
                      <span className="text-sm font-bold text-white font-mono">{template.cost_range}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Blockchain Infrastructure */}
          <section className="mb-24">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-8 flex items-center gap-4">
              <span className="w-12 h-px bg-zinc-800"></span>
              Execution Layers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-900 border border-zinc-900">
              {blockchains.map((chain) => (
                <div
                  key={chain.id}
                  className="p-8 bg-black hover:bg-zinc-950 transition-all duration-300 group cursor-pointer"
                >
                  <div className="mb-8 p-3 bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:text-white transition-colors w-fit">
                    {chain.icon}
                  </div>
                  <h4 className="font-bold text-white mb-2 text-xs uppercase tracking-widest">{chain.name}</h4>
                  <p className="text-zinc-600 text-[9px] uppercase tracking-widest leading-relaxed mb-6">{chain.description}</p>

                  <div className="space-y-3 pt-6 border-t border-zinc-900">
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                      <span className="text-zinc-600">Cost</span>
                      <span className="text-white">{chain.transaction_cost}</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                      <span className="text-zinc-600">Speed</span>
                      <span className="text-white">{chain.speed}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Token Config */}
          <section className="mb-24">
            <div className="bg-zinc-950 border border-zinc-900 p-12">
              <h3 className="text-2xl font-bold mb-12 text-white uppercase tracking-tighter flex items-center gap-4">
                <Settings className="h-6 w-6 text-zinc-500" />
                Emission Parameters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Token Identifier</label>
                    <input
                      type="text"
                      value={tokenForm.name}
                      onChange={(e) => setTokenForm({ ...tokenForm, name: e.target.value })}
                      placeholder="ENTER TOKEN NAME"
                      className="w-full bg-zinc-900 border border-zinc-800 p-4 text-xs font-bold uppercase tracking-widest text-white focus:outline-none focus:border-white transition-colors rounded-none placeholder:text-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Ticker Symbol</label>
                    <input
                      type="text"
                      value={tokenForm.symbol}
                      onChange={(e) => setTokenForm({ ...tokenForm, symbol: e.target.value })}
                      placeholder="e.g. BTC, ETH, SOL"
                      className="w-full bg-zinc-900 border border-zinc-800 p-4 h-14 text-xs font-bold uppercase tracking-widest text-white focus:outline-none focus:border-white transition-colors rounded-none placeholder:text-zinc-800"
                    />
                  </div>
                </div>
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Total Supply</label>
                    <input
                      type="text"
                      value={tokenForm.supply}
                      onChange={(e) => setTokenForm({ ...tokenForm, supply: e.target.value })}
                      placeholder="ENTER QUANTITY"
                      className="w-full bg-zinc-900 border border-zinc-800 p-4 h-14 text-xs font-bold uppercase tracking-widest text-white focus:outline-none focus:border-white transition-colors rounded-none placeholder:text-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Regulatory Compliance</label>
                    <div className="p-4 bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Verify Legal Guidelines</span>
                      <Shield className="h-4 w-4 text-zinc-600" />
                    </div>
                  </div>
                  <Button className="w-full h-16 bg-white text-black hover:bg-zinc-200 rounded-none font-bold uppercase tracking-widest text-xs transition-colors mt-auto">
                    Initialize Emission Protocol
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Template Details Modal */}
          <AnimatePresence>
            {selectedTemplate && (
              <div
                className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono"
                onClick={() => setSelectedTemplate(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-black border border-white rounded-none p-12 max-w-4xl w-full relative h-[90vh] overflow-hidden flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"
                  >
                    CLOSE [X]
                  </button>

                  <div className="mb-12">
                    <h3 className="text-4xl font-bold text-white uppercase tracking-tighter">
                      {selectedTemplate.name}
                    </h3>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-4">Asset Architecture Specs</p>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-8 space-y-16 custom-scrollbar">
                    <p className="text-zinc-400 text-sm uppercase tracking-widest leading-relaxed">
                      {selectedTemplate.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                      <div className="space-y-12">
                        <div>
                          <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-6 border-b border-zinc-900 pb-2">Contract Features</h4>
                          <div className="grid grid-cols-1 gap-4">
                            {selectedTemplate.features.map((feature, index) => (
                              <div key={index} className="flex items-center text-[10px] text-zinc-400 uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 bg-white mr-3"></span>
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-6 border-b border-zinc-900 pb-2">Operational Use Cases</h4>
                          <div className="grid grid-cols-1 gap-4">
                            {selectedTemplate.use_cases.map((use, index) => (
                              <div key={index} className="flex items-center text-[10px] text-zinc-400 uppercase tracking-widest">
                                <TrendingUp className="h-3 w-3 text-white mr-3" />
                                {use}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-12">
                        <div>
                          <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-6 border-b border-zinc-900 pb-2">Legal Specs</h4>
                          <div className="grid grid-cols-1 gap-4">
                            {selectedTemplate.legal_requirements.map((req, index) => (
                              <div key={index} className="flex items-center text-[10px] text-zinc-400 uppercase tracking-widest">
                                <Shield className="h-3 w-3 text-white mr-3" />
                                {req}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="p-8 bg-zinc-950 border border-zinc-900">
                          <div className="grid grid-cols-2 gap-8">
                            <div>
                              <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Build Cycle</p>
                              <p className="text-sm font-bold text-white tracking-widest">{selectedTemplate.development_time}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Protocol Fee</p>
                              <p className="text-sm font-bold text-white font-mono">{selectedTemplate.cost_range}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-zinc-900 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">Asset: {selectedTemplate.token_type}</span>
                    <Button className="h-16 px-12 bg-white text-black hover:bg-zinc-200 rounded-none font-bold uppercase tracking-widest text-xs">
                      DEPLOY ASSET [→]
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}