'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowRight, FiCheck } from 'react-icons/fi';

export default function VibeDebuggerPage() {
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
        {/* Standardized Header */}
        <motion.div
          className="mb-12 border-b border-gray-800 pb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="flex items-end gap-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
              VIBE_DEBUGGER
            </h1>
            <div className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-widest">
              SERVICE
            </div>
          </div>
        </motion.div>

        {/* Hero */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-4xl font-bold mb-6">
            Your AI-built app is broken.
            <span className="text-gray-500"> Get it fixed.</span>
          </h2>

          <p className="text-gray-400 mb-8 max-w-2xl">
            Vibe coding gets you 80% there. The last 20% is authentication bugs,
            database schema chaos, and "it works on my machine." Professional debugging
            for what Claude, Cursor, and GPT couldn't finish.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="px-6 py-3 bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors"
            >
              Get a Quote
            </Link>
            <a
              href="#how-it-works"
              className="px-6 py-3 border border-gray-800 text-white text-sm font-bold hover:border-gray-600 transition-colors"
            >
              How It Works
            </a>
          </div>
        </div>

        {/* Problem Section */}
        <div className="mb-16">
          <h3 className="text-xl font-bold uppercase tracking-tight mb-6 text-gray-400">
            The Problem
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "It works... mostly",
                description: "The AI got you a working prototype, but edge cases break everything. Users hit errors you never saw in development."
              },
              {
                title: "Spaghetti architecture",
                description: "50 prompts later, your codebase is a maze. No one (including the AI) knows why half of it exists."
              },
              {
                title: "Security? What security?",
                description: "API keys in the frontend. No auth on admin routes. SQL injection waiting to happen."
              },
              {
                title: "It doesn't scale",
                description: "Works for 10 users. Falls over at 100. The AI optimized for 'make it work' not 'make it last.'"
              }
            ].map((item, index) => (
              <div key={index} className="p-6 border border-gray-800 hover:border-gray-600 bg-black hover:bg-gray-900/50 transition-all">
                <h4 className="font-bold uppercase tracking-tight mb-2 text-white">{item.title}</h4>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <div id="how-it-works" className="mb-16">
          <h3 className="text-xl font-bold uppercase tracking-tight mb-6 text-gray-400">
            How It Works
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400 w-16">Step</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Action</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {[
                  {
                    step: "01",
                    title: "Send me your repo",
                    description: "GitHub, GitLab, zip file - whatever you have. I'll review the codebase and identify the issues."
                  },
                  {
                    step: "02",
                    title: "Get a diagnosis",
                    description: "Within 48 hours, you'll receive a detailed report: what's broken, what's risky, and what it'll take to fix."
                  },
                  {
                    step: "03",
                    title: "I fix it",
                    description: "Depending on scope, I'll either fix it myself or guide you through the fixes with pair programming sessions."
                  },
                  {
                    step: "04",
                    title: "Ship with confidence",
                    description: "Clean code, documented decisions, and a codebase you (or the next developer) can actually maintain."
                  }
                ].map((item, index) => (
                  <tr key={index} className="hover:bg-gray-900/50">
                    <td className="px-4 py-4 text-sm font-mono text-gray-500">{item.step}</td>
                    <td className="px-4 py-4 text-sm font-bold text-white">{item.title}</td>
                    <td className="px-4 py-4 text-sm text-gray-400">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mb-16">
          <h3 className="text-xl font-bold uppercase tracking-tight mb-6 text-gray-400">
            Pricing
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                name: "DIAGNOSIS",
                price: "$250",
                description: "Codebase audit with detailed report",
                features: [
                  "Full code review",
                  "Security assessment",
                  "Architecture analysis",
                  "Written report with priorities"
                ]
              },
              {
                name: "FIX",
                price: "$1,500",
                description: "I debug and refactor your project",
                features: [
                  "Everything in Diagnosis",
                  "Up to 20 hours of fixes",
                  "Code cleanup & documentation",
                  "1 week turnaround"
                ],
                featured: true
              },
              {
                name: "REBUILD",
                price: "$5,000+",
                description: "Complete refactor or rewrite",
                features: [
                  "Everything in Fix",
                  "Architecture redesign",
                  "Database optimization",
                  "Deployment & CI/CD setup"
                ]
              }
            ].map((tier, index) => (
              <div
                key={index}
                className={`p-6 border ${
                  tier.featured
                    ? 'border-white bg-gray-900/50'
                    : 'border-gray-800 bg-black hover:border-gray-600'
                } transition-all`}
              >
                <h4 className="font-bold uppercase tracking-tight text-white">{tier.name}</h4>
                <div className="text-4xl font-bold my-4 text-white">{tier.price}</div>
                <p className="text-gray-400 text-sm mb-6">{tier.description}</p>
                <ul className="space-y-2">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="text-sm text-gray-400 flex items-center gap-2">
                      <FiCheck className="text-green-400" size={14} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mb-16 border border-gray-800 p-8">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">
            Stop fighting your own code.
          </h3>
          <p className="text-gray-400 mb-6">
            Send me your repo. I'll tell you exactly what's wrong and what it'll cost to fix.
          </p>
          <Link
            href="/contact"
            className="inline-block px-6 py-3 text-sm font-bold hover:opacity-80 transition-colors"
            style={{ backgroundColor: '#fff', color: '#000' }}
          >
            Get Started <FiArrowRight className="inline ml-2" size={14} />
          </Link>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-white transition-colors text-sm">
              ← Back to b0ase.com
            </Link>
            <div className="text-gray-500 text-xs uppercase tracking-widest">
              A b0ase.com service
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
