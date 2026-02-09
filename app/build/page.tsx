'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import {
  FaTools,
  FaTable,
  FaCogs,
  FaPlug,
  FaChartBar,
  FaUsers,
  FaRobot,
  FaLock
} from 'react-icons/fa';

const BUILD_OPTIONS = [
  {
    icon: FaTable,
    title: 'Replace Spreadsheet Chaos',
    description: 'Turn scattered tabs and diverging versions into a single source of truth. Custom tools that match how you actually work.',
  },
  {
    icon: FaCogs,
    title: 'Internal Tools',
    description: 'Dashboards, admin panels, workflow tools. Purpose-built for your team, not a vendor\'s assumptions.',
  },
  {
    icon: FaPlug,
    title: 'Integrations',
    description: 'Connect your existing systems. APIs, webhooks, data sync. Make your tools talk to each other.',
  },
  {
    icon: FaChartBar,
    title: 'Reporting & Analytics',
    description: 'Surface the metrics that matter. Automated reports, live dashboards, data pipelines.',
  },
  {
    icon: FaUsers,
    title: 'Multi-Party Coordination',
    description: 'Tools that help multiple organisations work together. Suppliers, clients, partners — shared workflows without shared chaos.',
  },
  {
    icon: FaRobot,
    title: 'AI Automation',
    description: 'Agents that handle repetitive tasks. Support, content, data processing — automation that actually works.',
  },
  {
    icon: FaLock,
    title: 'Compliance & Audit',
    description: 'Immutable records, audit trails, verification systems. Infrastructure for parties who don\'t fully trust each other.',
  },
  {
    icon: FaTools,
    title: 'Something Else',
    description: 'Got a problem that doesn\'t fit a category? Start with the friction, we\'ll figure out the tool.',
  },
];

export default function BuildPage() {
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
                <FaTools className="text-4xl md:text-6xl text-white" />
              </div>
              <div className="flex items-end gap-4">
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                  BUILD
                </h1>
                <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                  Custom Tools
                </div>
              </div>
            </div>

            <p className="text-lg text-zinc-400 max-w-3xl mb-4">
              Start with the problem. The workflow, the friction, the cost you're already paying.
              I'll build a small tool that removes it.
            </p>

            <p className="text-zinc-500 text-sm">
              No 10,000-feature platforms. No multi-year contracts. Just purpose-built tools,
              iterated continuously until you're done.
            </p>
          </motion.div>

          {/* Options Grid */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <h3 className="text-xl font-bold uppercase tracking-tight mb-6 text-zinc-400">
              What I Build
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {BUILD_OPTIONS.map((option, index) => (
                <motion.div
                  key={option.title}
                  className="border border-zinc-800 bg-black p-4 hover:border-zinc-600 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.05 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-zinc-900/50 p-2 border border-zinc-800">
                      <option.icon className="text-lg text-zinc-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1 uppercase">{option.title}</h3>
                      <p className="text-zinc-600 text-xs leading-relaxed">{option.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* How It Works */}
          <motion.div
            className="mb-12 border border-zinc-800 bg-black"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="bg-zinc-900/50 px-4 py-3 border-b border-zinc-800">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Process_Flow</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-900">
              <div className="p-4">
                <div className="text-2xl font-bold text-zinc-700 mb-2">01</div>
                <h3 className="text-sm font-bold text-white mb-1 uppercase">Identify the friction</h3>
                <p className="text-zinc-600 text-xs">
                  We find the messiest coordination problem, the spreadsheet everyone hates,
                  the workflow that wastes hours every week.
                </p>
              </div>
              <div className="p-4">
                <div className="text-2xl font-bold text-zinc-700 mb-2">02</div>
                <h3 className="text-sm font-bold text-white mb-1 uppercase">Build a focused tool</h3>
                <p className="text-zinc-600 text-xs">
                  Small, purpose-built, designed for how you actually work.
                  Deploy it, test it, gather feedback.
                </p>
              </div>
              <div className="p-4">
                <div className="text-2xl font-bold text-zinc-700 mb-2">03</div>
                <h3 className="text-sm font-bold text-white mb-1 uppercase">Iterate or stop</h3>
                <p className="text-zinc-600 text-xs">
                  If it works, we refine it or build the next thing.
                  If you're happy with what you have, stop. No lock-in.
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            className="border border-zinc-800 bg-black p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold mb-1 text-white uppercase">
                  What's the friction?
                </h3>
                <p className="text-zinc-500 text-sm">
                  Tell me about the problem. We'll figure out the tool.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors whitespace-nowrap"
              >
                Get in Touch <FiArrowRight size={12} />
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
}
