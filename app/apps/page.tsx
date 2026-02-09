'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FiSmartphone, FiCheck, FiArrowRight, FiCpu, FiBox, FiActivity, FiCodepen } from 'react-icons/fi';

const engineeringModels = [
  {
    name: 'Agentic Systems',
    description: 'AI-first architectures designed for autonomous interaction and independent problem solving.',
    icon: FiCpu,
    features: ['Autonomous Workflows', 'The Third Audience Standard', 'LLM-Integrated Logic', 'Context-Aware Ops'],
    price: '£5,000 - £25,000',
    timeline: '6-10 weeks',
    category: 'Intelligence'
  },
  {
    name: 'Kintsugi Engines',
    description: 'High-trust, tokenized economic platforms utilizing the Kintsugi Engine for equitable distribution.',
    icon: FiBox,
    features: ['Tokenized Equity', 'Blockchain Verification', 'Automated Dividends', 'Covenant Security'],
    price: '£8,000 - £30,000',
    timeline: '8-14 weeks',
    category: 'Economics'
  },
  {
    name: 'Industrial Web',
    description: 'Engineering-grade web applications built for extreme performance, latency, and scale.',
    icon: FiActivity,
    features: ['Latency Injection Protection', 'Real-time Sync', 'Multi-tenant Logic', 'Advanced Telemetry'],
    price: '£10,000 - £35,000',
    timeline: '10-16 weeks',
    category: 'Infrastructure'
  },
  {
    name: 'Native Artifacts',
    description: 'Premium mobile experiences for iOS and Android, focusing on cryptographic trust and agentic flow.',
    icon: FiSmartphone,
    features: ['Biometric Auth', 'Offline-First Vaults', 'Cross-Platform Sync', 'Native Performance'],
    price: '£15,000 - £50,000',
    timeline: '12-20 weeks',
    category: 'Experience'
  },
];

const portfolio = [
  {
    name: 'AIVJ',
    description: 'The world\'s first Agentic VJ platform. Visual performances driven by autonomous intelligence.',
    tech: ['Next.js', 'PyTorch', 'Agentic Workflows'],
    image: '/images/slugs/aivj-website.png',
    url: 'https://aivj.website/',
    status: 'LIVE'
  },
  {
    name: 'Kintsugi Store',
    description: 'Tokenized digital artifact marketplace built on the Kintsugi Equity Engine.',
    tech: ['React', 'Bitcoin SV', 'Kintsugi'],
    image: '/images/slugs/ninja-punk-girls-website.png',
    url: 'https://ninjapunkgirls.com',
    status: 'BETA'
  },
  {
    name: 'AUDEX',
    description: 'Decentralized audio exchange for the next generation of music production.',
    tech: ['Web3', 'HandCash', 'MusicNFTs'],
    image: '/images/slugs/audex-website.png',
    url: 'https://www.audex.website/',
    status: 'PRODUCTION'
  },
];

const architecturalFlow = [
  { step: '01', title: 'Discovery', description: 'Defining the intent and identifying the target audiences.' },
  { step: '02', title: 'Specification', description: 'Mapping agentic workflows and trust requirements.' },
  { step: '03', title: 'Architecture', description: 'Designing the engine and interfaces.' },
  { step: '04', title: 'Iteration', description: 'Rapid development with feedback loops.' },
  { step: '05', title: 'Verification', description: 'Testing, security audits, and tuning.' },
  { step: '06', title: 'Deployment', description: 'Launching with ongoing updates.' },
];

export default function AppsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredModels = selectedCategory
    ? engineeringModels.filter(m => m.category === selectedCategory)
    : engineeringModels;

  const categories = Array.from(new Set(engineeringModels.map(m => m.category)));

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
        <div className="w-full">
          {/* Header */}
          <motion.div
            className="mb-12 border-b border-zinc-900 pb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
              <div className="bg-zinc-900/50 p-4 md:p-6 border border-zinc-800 self-start">
                <FiCodepen className="text-4xl md:text-6xl text-white" />
              </div>
              <div className="flex items-end gap-4">
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                  APPS
                </h1>
                <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                  High-Fidelity Artifacts
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <p className="text-zinc-400 max-w-2xl">
                We build Agentic Artifacts — high-precision digital tools designed for the Third Audience.
                From tokenized engines to autonomous AI frameworks.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors whitespace-nowrap"
                >
                  Start Build <FiArrowRight size={12} />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Engineering Models */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h3 className="text-xl font-bold uppercase tracking-tight text-zinc-400">
                Engineering Models
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1.5 text-xs border transition-colors ${
                    selectedCategory === null
                      ? 'border-white text-white bg-white/10'
                      : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs border transition-colors ${
                      selectedCategory === cat
                        ? 'border-white text-white bg-white/10'
                        : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredModels.map((model, i) => (
                  <motion.div
                    key={model.name}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="border border-zinc-800 bg-black p-4 hover:border-zinc-600 transition-colors flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="bg-zinc-900/50 p-2 border border-zinc-800">
                        <model.icon className="text-lg text-zinc-500" />
                      </div>
                      <span className="text-[10px] text-zinc-600 uppercase tracking-wider">{model.category}</span>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-1 uppercase">{model.name}</h3>
                    <p className="text-zinc-600 text-xs leading-relaxed mb-4">{model.description}</p>

                    <div className="space-y-1.5 mb-4 flex-grow">
                      {model.features.map((feature, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <FiCheck className="text-zinc-600" size={10} />
                          <span className="text-[10px] text-zinc-500">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-zinc-900 flex justify-between items-end">
                      <div>
                        <div className="text-[10px] text-zinc-600 uppercase tracking-wider">Scale</div>
                        <div className="text-xs font-bold text-white">{model.price}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-zinc-600 uppercase tracking-wider">Cycle</div>
                        <div className="text-xs font-bold text-zinc-400">{model.timeline}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Portfolio */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <h3 className="text-xl font-bold uppercase tracking-tight mb-6 text-zinc-400">
              Live Artifacts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {portfolio.map((project, i) => (
                <motion.a
                  key={project.name}
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group border border-zinc-800 bg-black hover:border-zinc-600 transition-colors overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={project.image}
                      alt={project.name}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute top-2 right-2 bg-black/80 border border-zinc-800 px-2 py-0.5">
                      <span className="text-[8px] font-bold text-white uppercase tracking-wider">{project.status}</span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h4 className="text-sm font-bold text-white mb-1 uppercase group-hover:text-zinc-300 transition-colors">
                      {project.name}
                    </h4>
                    <p className="text-zinc-600 text-xs leading-relaxed mb-3">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {project.tech.map((tech) => (
                        <span key={tech} className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 border border-zinc-800 text-zinc-500">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Process Flow */}
          <motion.div
            className="mb-12 border border-zinc-800 bg-black"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <div className="bg-zinc-900/50 px-4 py-3 border-b border-zinc-800">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Process_Flow</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-y md:divide-y-0 divide-x-0 md:divide-x divide-zinc-900">
              {architecturalFlow.map((phase) => (
                <div key={phase.step} className="p-4">
                  <div className="text-2xl font-bold text-zinc-700 mb-2">{phase.step}</div>
                  <h3 className="text-sm font-bold text-white mb-1 uppercase">{phase.title}</h3>
                  <p className="text-zinc-600 text-[10px] leading-relaxed">
                    {phase.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            className="border border-zinc-800 bg-black p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold mb-1 text-white uppercase">
                  Initiate Build Sequence
                </h3>
                <p className="text-zinc-500 text-sm">
                  The next generation of digital artifacts starts with a single specification.
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider hover:border-zinc-600 hover:text-white transition-colors whitespace-nowrap"
                >
                  View Services
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors whitespace-nowrap"
                >
                  Get Started <FiArrowRight size={12} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
}
