'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  FiCpu, FiDatabase, FiGlobe, FiLayers, FiCode, FiCommand,
  FiActivity, FiBox, FiSmartphone, FiTerminal, FiShield, FiAward
} from 'react-icons/fi';
import Link from 'next/link';

interface Capability {
  title: string;
  category: 'Strategic' | 'Technical' | 'Creative';
  description: string;
  icon: any;
  tags: string[];
}

const capabilities: Capability[] = [
  // Strategic
  {
    title: 'Digital Sovereignty Architecture',
    category: 'Strategic',
    description: 'Designing resilient, censorship-resistant digital ecosystems. We build platforms that you truly own, free from platform risk and third-party dependencies.',
    icon: FiShield,
    tags: ['Self-Hosting', 'Decentralization', 'Privacy']
  },
  {
    title: 'Visual Identity Engineering',
    category: 'Creative',
    description: 'Forging distinct visual languages for digital-first brands. We blend generative art, algorithmic design, and classic typography to create identities that feel alive.',
    icon: FiCpu,
    tags: ['Generative Design', 'Branding', 'Motion Graphics']
  },
  {
    title: 'Full-Stack Rapid Prototyping',
    category: 'Technical',
    description: 'Transforming napkin sketches into deployable MVPs at breakneck speed. We use cutting-edge stacks to validate market hypotheses without technical debt.',
    icon: FiBox,
    tags: ['Next.js', 'Supabase', 'Tailwind']
  },
  {
    title: 'AI Workflow Orchestration',
    category: 'Strategic',
    description: 'Integrating Large Language Models into business logic. We replace manual grunt work with intelligent agents that learn and adapt to your operational needs.',
    icon: FiCommand,
    tags: ['LLMs', 'Automation', 'RAG']
  },
  {
    title: 'Memetic Engineering',
    category: 'Creative',
    description: 'Crafting viral loops and contagious content strategies. We understand the physics of information spread and engineer content designed to propagate.',
    icon: FiActivity,
    tags: ['Growth Hacking', 'Social Strategy', 'Content']
  },
  {
    title: 'Blockchain Economics',
    category: 'Technical',
    description: 'Architecting sustainable token models and on-chain incentive structures. specialized in Bitcoin SV and low-latency value transfer systems.',
    icon: FiDatabase,
    tags: ['Smart Contracts', 'Tokenomics', 'BSV']
  },
  {
    title: 'Spatial Computing Interfaces',
    category: 'Creative',
    description: 'Building immersive 3D web experiences and AR/VR interfaces. We prepare valid brands for the inevitable shift from flat screens to spatial environments.',
    icon: FiGlobe,
    tags: ['Three.js', 'WebGL', 'WebXR']
  },
  {
    title: 'Legacy System Modernization',
    category: 'Technical',
    description: 'Rescuing critical business logic from aging codebases. We refactor, rewrite, and containerize legacy applications for the modern cloud era.',
    icon: FiTerminal,
    tags: ['Refactoring', 'Cloud Native', 'Docker']
  }
];

export default function SkillsPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30">
      <main className="px-4 md:px-8 py-20">

        {/* Header */}
        <motion.div
          className="mb-8 border-b border-zinc-900 pb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
            <div className="bg-gray-900/50 p-4 md:p-6 border border-gray-800 self-start">
              <FiAward className="text-4xl md:text-6xl text-white" />
            </div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                SKILLS
              </h1>
              <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                CAPABILITIES
              </div>
            </div>
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-zinc-400 max-w-2xl leading-relaxed mb-12"
        >
          Beyond a standard tech stack. We offer a holistic fusion of engineering, strategy, and art to build digital dominance.
        </motion.p>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {capabilities.map((cap, index) => (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-zinc-950 border border-zinc-900 overflow-hidden hover:border-zinc-700 transition-colors duration-300 flex flex-col h-full"
            >
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-zinc-900 text-zinc-400 group-hover:text-white group-hover:bg-zinc-800 transition-colors">
                    <cap.icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-600 group-hover:text-cyan-500 transition-colors border border-zinc-900 px-2 py-1">
                    {cap.category}
                  </span>
                </div>

                <h3 className="text-2xl font-bold mb-4 group-hover:text-cyan-400 transition-colors">
                  {cap.title}
                </h3>

                <p className="text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors mb-6 flex-grow">
                  {cap.description}
                </p>

                <div className="flex flex-wrap gap-2 mt-auto">
                  {cap.tags.map(tag => (
                    <span key={tag} className="text-xs text-zinc-600 bg-zinc-900/50 px-2 py-1 font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Infinite Marquee of "Standard" Skills */}
        <div className="border-t border-b border-zinc-900 py-12 overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent z-10" />

          <h3 className="text-center text-zinc-600 text-xs uppercase tracking-[0.2em] mb-8">
            Technical Proficiency
          </h3>

          <div className="flex whitespace-nowrap overflow-hidden">
            <motion.div
              animate={{ x: [0, -1000] }}
              transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
              className="flex gap-12 text-4xl font-bold text-zinc-800"
            >
              {['React', 'Next.js', 'Typescript', 'Node.js', 'Python', 'Rust', 'Solidity', 'PostgreSQL', 'GraphQL', 'Docker', 'Kubernetes', 'AWS', 'TensorFlow', 'OpenAI', 'Figma', 'Blender', 'TouchDesigner', 'React', 'Next.js', 'Typescript', 'Node.js'].map((skill, i) => (
                <span key={i} className="hover:text-zinc-600 transition-colors">{skill}</span>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="mt-20 text-center">
          <Link href="/contact" className="inline-block px-8 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors">
            Deploy Our Skills
          </Link>
        </div>

      </main>
    </div>
  );
}