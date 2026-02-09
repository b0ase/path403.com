'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import { FaFlask } from 'react-icons/fa';

export default function AIForgePage() {
  return (
    <motion.div
      className="min-h-screen bg-black text-white relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.section
        className="max-w-5xl mx-auto px-4 md:px-6 py-12 relative"
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
              <FaFlask className="text-4xl md:text-6xl text-white" />
            </div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                INTERNAL TOOLING
              </h1>
              <div className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-widest">
                OFFER TO AIFORGE
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-gray-400 max-w-2xl">
              Replace spreadsheet chaos with purpose-built tools. Start small, iterate continuously, stop when you're done.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold hover:opacity-80 transition-colors whitespace-nowrap"
              style={{ backgroundColor: '#fff', color: '#000' }}
            >
              Get Started <FiArrowRight size={14} />
            </Link>
          </div>
        </motion.div>

        {/* Context - Tweet Images */}
        <div className="mb-12">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-gray-500">
            Context (from our call last week)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="https://x.com/ms_base44/status/2013291162375696465" target="_blank" rel="noopener noreferrer" className="block border border-gray-800 hover:border-gray-600 transition-colors">
              <img src="/images/tweets/Salesforce_tweet.png" alt="Tweet about $350k Salesforce contract terminated" className="w-full" />
            </a>
            <a href="https://x.com/urieli17/status/2013317267409314036" target="_blank" rel="noopener noreferrer" className="block border border-gray-800 hover:border-gray-600 transition-colors">
              <img src="/images/tweets/Hubspot_Tweet.png" alt="Reply about HubSpot" className="w-full" />
            </a>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Problem & Approach */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h3 className="text-xl font-bold uppercase tracking-tight mb-4 text-white">The Problem</h3>
              <p className="text-gray-400 mb-4">
                Coordination lives in spreadsheets. Information is scattered. Everyone has their own version of the truth.
                Updates get missed. Context gets lost.
              </p>
              <p className="text-gray-400">
                You don't need Salesforce or HubSpot — you need <span className="text-white">tools that match how you actually work</span>.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold uppercase tracking-tight mb-4 text-white">The Approach</h3>
              <p className="text-gray-400 mb-4">
                Start small. Build one thing. See if it helps. Iterate based on real usage.
              </p>
              <ul className="text-gray-500 text-sm space-y-1">
                <li>• Identify the messiest coordination problem</li>
                <li>• Build a focused tool to address it</li>
                <li>• Deploy, test, gather feedback</li>
                <li>• Refine or expand based on what's actually needed</li>
                <li>• Repeat as long as it's adding value</li>
              </ul>
              <p className="text-gray-500 text-sm mt-4">
                No big upfront commitment. No multi-year contracts. <span className="text-white">Build what you need, stop when you're done.</span>
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold uppercase tracking-tight mb-4 text-white">What You Get</h3>
              <ul className="text-gray-500 text-sm space-y-2">
                <li>• <span className="text-white">Leaner software</span> — Custom tools have 10 features, not 10,000. Less bloat, less room for bugs</li>
                <li>• <span className="text-white">Tailored fit</span> — Built for how you actually work, not how a vendor thinks you should</li>
                <li>• <span className="text-white">Cost savings</span> — Custom tools cost less than enterprise SaaS seats</li>
                <li>• <span className="text-white">Tech investment</span> — You own what gets built, it stays with you</li>
                <li>• <span className="text-white">Freedom to experiment</span> — Test new features and ideas without vendor lock-in</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold uppercase tracking-tight mb-4 text-white">How It Works</h3>
              <p className="text-gray-400 mb-4">
                Rolling monthly contract. Keep me on as long as the software needs building, maintaining, or evolving.
                Terminate anytime — no penalty, no lock-in.
              </p>
              <p className="text-gray-500 text-sm">
                This is <span className="text-white">continuous iteration</span>, not a one-off project.
              </p>
            </div>
          </div>

          {/* Right Column - Commercials */}
          <div className="space-y-6">
            <div className="border border-gray-800 p-6">
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Monthly Retainer</div>
              <div className="text-4xl font-bold text-white mb-1">£500</div>
              <p className="text-gray-500 text-sm mb-4">40 hours dedicated dev time. No minimum term.</p>
              <ul className="text-gray-500 text-xs space-y-2">
                <li>• Custom internal tools</li>
                <li>• Dashboards and workflows</li>
                <li>• Integrations and automations</li>
                <li>• Ongoing maintenance and updates</li>
              </ul>
              <p className="text-gray-600 text-xs mt-4">
                Cancel anytime. You keep everything built.
              </p>
            </div>

            <div className="border border-gray-800 p-6">
              <h4 className="text-sm font-bold uppercase tracking-tight mb-3 text-white">Month 1 Example</h4>
              <ol className="text-gray-500 text-xs space-y-1">
                <li>1. Audit current spreadsheet workflows</li>
                <li>2. Identify highest-friction coordination point</li>
                <li>3. Build focused tool to replace it</li>
                <li>4. Deploy and gather feedback</li>
                <li>5. Plan next iteration</li>
              </ol>
            </div>

            <div className="border border-gray-800 p-6">
              <h4 className="text-sm font-bold uppercase tracking-tight mb-3 text-white">On-Going</h4>
              <p className="text-gray-500 text-xs">
                Continue as long as there's value. Add features, fix issues, build new tools.
                When you're happy with the stack, stop the contract.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="border border-gray-800 p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2 text-white">
                Richard Boase
              </h3>
              <p className="text-gray-400">
                Independent Developer · b0ase.com
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              Get in Touch <FiArrowRight size={16} />
            </Link>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
