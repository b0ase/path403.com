'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCheck, FiCpu, FiTool, FiZap } from 'react-icons/fi';

export default function AIAgentBuilderModule() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black"
    >
      <div className="px-4 md:px-8 py-16">
        <Link href="/components" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8">
          <FiArrowLeft />
          <span>Back to Components</span>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-12">
          <div className="flex flex-col md:flex-row md:items-start gap-6 mb-6">
            <div className="bg-zinc-900/50 p-4 md:p-6 border border-zinc-800">
              <FiCpu className="text-3xl md:text-4xl text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mb-2">AI/ML</p>
              <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter mb-4">AI Agent Builder</h1>
              <p className="text-zinc-400 max-w-2xl">Custom AI agent development with tool integration and autonomous task execution capabilities.</p>
            </div>
            <div className="text-right">
              <div className="text-2xl md:text-3xl font-bold text-white mb-4">£1500-3000</div>
              <Link href="/contact" className="bg-white text-black hover:bg-zinc-200 px-6 py-2 text-xs uppercase font-bold tracking-wider inline-block">Get Quote</Link>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="text-[10px] uppercase font-bold text-zinc-500 border border-zinc-800 px-2 py-1 bg-zinc-900">4-6 weeks delivery</span>
            <span className="text-[10px] uppercase font-bold text-zinc-500 border border-zinc-800 px-2 py-1 bg-zinc-900">Advanced complexity</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-zinc-950 border border-zinc-900 p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">What You Get</h2>
              <p className="text-zinc-400 text-sm mb-6">A powerful framework for building custom AI agents that can execute complex tasks autonomously.</p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FiCpu className="text-emerald-500 mt-1 flex-shrink-0" />
                  <div><h3 className="font-bold text-white text-sm mb-1">Custom AI Agents</h3><p className="text-zinc-500 text-xs">Build agents tailored to your specific business needs.</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <FiTool className="text-emerald-500 mt-1 flex-shrink-0" />
                  <div><h3 className="font-bold text-white text-sm mb-1">Tool Integration</h3><p className="text-zinc-500 text-xs">Connect agents to APIs, databases, and external services.</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <FiZap className="text-emerald-500 mt-1 flex-shrink-0" />
                  <div><h3 className="font-bold text-white text-sm mb-1">Task Automation</h3><p className="text-zinc-500 text-xs">Automate complex workflows with intelligent decision-making.</p></div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Core Features</h2>
              <div className="grid grid-cols-1 gap-2">
                {['Custom AI Agents', 'Tool Integration', 'Task Automation', 'Memory & Context', 'Multi-model Support', 'Error Recovery', 'Logging & Analytics', 'API Endpoints'].map((feature) => (
                  <div key={feature} className="flex items-center gap-2"><FiCheck className="text-emerald-500 flex-shrink-0" /><span className="text-zinc-400 text-sm">{feature}</span></div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-zinc-950 border border-zinc-900 p-6">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Technical Implementation</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Technology Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {['Claude API', 'OpenAI API', 'LangChain', 'Vector DB', 'Node.js', 'TypeScript'].map((tech) => (
                    <span key={tech} className="text-[10px] uppercase font-bold text-zinc-500 border border-zinc-800 px-2 py-1 bg-zinc-900">{tech}</span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Use Cases</h3>
                <ul className="space-y-2 text-zinc-400 text-sm">
                  <li className="flex items-start gap-2"><span className="text-zinc-600">-</span>Customer support automation</li>
                  <li className="flex items-start gap-2"><span className="text-zinc-600">-</span>Data processing pipelines</li>
                  <li className="flex items-start gap-2"><span className="text-zinc-600">-</span>Research assistants</li>
                  <li className="flex items-start gap-2"><span className="text-zinc-600">-</span>Content generation</li>
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-zinc-950 border border-zinc-900 p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Pricing Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-zinc-900"><span className="text-zinc-500 text-sm">Base Agent Framework</span><span className="font-bold text-white">£1500</span></div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-900"><span className="text-zinc-500 text-sm">Tool Integrations</span><span className="font-bold text-white">£500</span></div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-900"><span className="text-zinc-500 text-sm">Multi-model Support</span><span className="font-bold text-white">£500</span></div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-900"><span className="text-zinc-500 text-sm">Analytics Dashboard</span><span className="font-bold text-white">£500</span></div>
                <div className="flex justify-between items-center pt-2"><span className="font-bold text-white">Total Range</span><span className="font-bold text-emerald-500">£1500-3000</span></div>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Delivery Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3"><div className="w-2 h-2 bg-emerald-500 mt-2"></div><div><div className="text-sm font-bold text-white">Weeks 1-2</div><div className="text-xs text-zinc-500">Agent architecture & core framework</div></div></div>
                <div className="flex items-start gap-3"><div className="w-2 h-2 bg-emerald-500 mt-2"></div><div><div className="text-sm font-bold text-white">Weeks 3-4</div><div className="text-xs text-zinc-500">Tool integration & testing</div></div></div>
                <div className="flex items-start gap-3"><div className="w-2 h-2 bg-emerald-500 mt-2"></div><div><div className="text-sm font-bold text-white">Weeks 5-6</div><div className="text-xs text-zinc-500">Fine-tuning & deployment</div></div></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
