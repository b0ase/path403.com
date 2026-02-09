'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCheck, FiMessageCircle, FiUsers, FiClock, FiUpload, FiCpu } from 'react-icons/fi';

export default function LiveChatSystemModule() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black"
    >
      <div className="px-4 md:px-8 py-16">
        {/* Back Link */}
        <Link href="/components" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8">
          <FiArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Components</span>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-start gap-6 mb-6">
            <div className="bg-zinc-900/50 p-4 md:p-6 border border-zinc-800">
              <FiMessageCircle className="w-8 h-8 md:w-12 md:h-12 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mb-2">Component Module</p>
              <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter mb-4">
                Real-Time Live Chat System
              </h1>
              <p className="text-zinc-400 max-w-2xl">
                Provide instant customer support and boost engagement with a feature-rich live chat solution.
              </p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-2xl md:text-3xl font-bold text-white mb-4">£600-1000</p>
              <Link href="/contact" className="bg-white text-black hover:bg-zinc-200 px-6 py-2 text-xs uppercase font-bold tracking-wider inline-block transition-colors">
                Get Quote
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: What You Get & Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-zinc-950 border border-zinc-900 p-6">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">What You Get</h2>
              <p className="text-zinc-400 text-sm mb-6">
                Engage visitors, answer questions instantly, and convert leads with a professional chat widget and agent dashboard.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FiUsers className="text-emerald-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-white text-sm uppercase">Agent Dashboard</h3>
                    <p className="text-zinc-500 text-xs">A dedicated interface to manage multiple conversations.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiClock className="text-emerald-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-white text-sm uppercase">Chat History</h3>
                    <p className="text-zinc-500 text-xs">Store and search all conversations for quality control.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiCpu className="text-emerald-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-white text-sm uppercase">Optional AI Bot</h3>
                    <p className="text-zinc-500 text-xs">Handle initial queries and off-hours support.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-900 p-6">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Core Features</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Real-time Messaging', 'Customizable Widget', 'Agent Dashboard',
                  'Typing Indicators', 'Read Receipts', 'Chat Transcripts',
                  'File Uploads', 'Canned Responses'
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <FiCheck className="text-emerald-500 text-xs flex-shrink-0" />
                    <span className="text-zinc-400 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Column 2: Tech & Integration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="bg-zinc-950 border border-zinc-900 p-6">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Technical Implementation</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Technology Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Node.js', 'WebSocket', 'Redis', 'React', 'Next.js', 'PostgreSQL'].map((tech) => (
                      <span key={tech} className="text-[10px] uppercase font-bold text-zinc-500 border border-zinc-800 px-2 py-1 bg-zinc-900">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Integration Process</h3>
                  <ul className="space-y-2 text-zinc-400 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-zinc-600">01.</span>
                      <span>Setup of WebSocket server</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-zinc-600">02.</span>
                      <span>Integration of chat widget</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-zinc-600">03.</span>
                      <span>Development of agent dashboard</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-zinc-600">04.</span>
                      <span>Database schema for messages</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Column 3: Pricing & Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-zinc-950 border border-zinc-900 p-6">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Pricing Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                  <span className="text-zinc-500 text-sm">Core Chat System</span>
                  <span className="font-bold text-white">£600</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                  <span className="text-zinc-500 text-sm">Agent Dashboard</span>
                  <span className="font-bold text-white">£200</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                  <span className="text-zinc-500 text-sm">Chat History</span>
                  <span className="font-bold text-white">£200</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="font-bold text-white uppercase text-sm">Total Range</span>
                  <span className="font-bold text-white text-lg">£600-1000</span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-900 p-6">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Delivery Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-emerald-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <div className="font-bold text-white text-sm uppercase">Week 1</div>
                    <div className="text-xs text-zinc-500">Backend and WebSocket setup</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-emerald-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <div className="font-bold text-white text-sm uppercase">Week 2</div>
                    <div className="text-xs text-zinc-500">Frontend widget and dashboard</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
