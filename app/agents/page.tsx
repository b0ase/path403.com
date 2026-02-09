'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import {
  FaRobot,
  FaHeadset,
  FaShoppingCart,
  FaPencilAlt,
  FaChartLine,
  FaDatabase
} from 'react-icons/fa';

const AGENT_TYPES = [
  {
    id: 'customer-support',
    icon: FaHeadset,
    title: 'Customer Support',
    description: 'Handle inquiries, resolve issues, and provide 24/7 support without human intervention.',
    price: '£800'
  },
  {
    id: 'sales-assistant',
    icon: FaShoppingCart,
    title: 'Sales Assistant',
    description: 'Qualify leads, answer product questions, and guide customers through the buying process.',
    price: '£1,200'
  },
  {
    id: 'content-agent',
    icon: FaPencilAlt,
    title: 'Content Agent',
    description: 'Generate blog posts, social media content, and marketing copy on autopilot.',
    price: '£600'
  },
  {
    id: 'data-analyst',
    icon: FaChartLine,
    title: 'Data Analyst',
    description: 'Process data, generate reports, and surface insights from your business metrics.',
    price: '£1,500'
  },
  {
    id: 'internal-tools',
    icon: FaDatabase,
    title: 'Internal Tools',
    description: 'Automate internal workflows, manage documentation, and streamline operations.',
    price: '£1,000'
  },
  {
    id: 'custom-workflow',
    icon: FaRobot,
    title: 'Custom Workflow',
    description: 'Build a completely custom agent tailored to your specific business needs.',
    price: '£2,000'
  }
];

export default function AgentsPage() {
  return (
    <motion.div
      className="min-h-screen bg-black text-white relative"
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
        {/* Header */}
        <motion.div
          className="mb-12 border-b border-gray-800 pb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
            <div className="bg-gray-900/50 p-4 md:p-6 border border-gray-800 self-start">
              <FaRobot className="text-4xl md:text-6xl text-white" />
            </div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                AGENTS
              </h1>
              <div className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-widest">
                AI AUTOMATION
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-gray-400 max-w-2xl">
              Build custom AI agents for your business. Customer support, sales, content creation,
              or internal tools - purpose-built automation that works.
            </p>
            <div className="flex gap-4">
              <Link
                href="/agent"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold border border-zinc-700 text-zinc-300 hover:text-white hover:border-white transition-colors whitespace-nowrap"
              >
                Talk to AI <FaRobot size={14} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold hover:opacity-80 transition-colors whitespace-nowrap"
                style={{ backgroundColor: '#fff', color: '#000' }}
              >
                Get Started <FiArrowRight size={14} />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Agent Types Grid */}
        <div className="mb-16">
          <h3 className="text-xl font-bold uppercase tracking-tight mb-6 text-gray-400">
            What I Build
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AGENT_TYPES.map((agent, index) => (
              <Link
                key={index}
                href={`/agents/${agent.id}`}
                className="group p-6 border border-gray-800 hover:border-gray-600 bg-black transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <agent.icon className="w-8 h-8 text-white" />
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">From {agent.price}</span>
                </div>
                <h4 className="font-bold uppercase tracking-tight mb-2 text-white group-hover:text-zinc-300 transition-colors">
                  {agent.title}
                </h4>
                <p className="text-gray-500 text-sm mb-4">{agent.description}</p>
                <span className="text-xs text-zinc-600 group-hover:text-white transition-colors flex items-center gap-1">
                  View details <FiArrowRight className="text-[10px]" />
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="border border-gray-800 p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2 text-white">
                Ready to automate?
              </h3>
              <p className="text-gray-400">
                Tell me what you need and I'll build the agent for you.
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/agent"
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-800 text-gray-500 text-sm hover:border-gray-600 hover:text-white transition-colors whitespace-nowrap"
              >
                Try Demo
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                Get a Quote <FiArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
