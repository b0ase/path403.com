'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function ExecSummaryPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white font-mono selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black pt-14">
      {/* Header */}
      <section className="relative py-24 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn}>
              <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-xs uppercase tracking-widest mb-8 inline-block">
                ← Back to Home
              </Link>
            </motion.div>

            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500 mb-8"
              variants={fadeIn}
            >
              EXECUTIVE_SUMMARY
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-2"
              variants={fadeIn}
            >
              $<span className="text-zinc-500">402</span>
            </motion.h1>

            <motion.p
              className="text-xs text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em] mb-4"
              variants={fadeIn}
            >
              The Tokenized Attention Economy
            </motion.p>

            <motion.p
              className="text-zinc-400 max-w-2xl mb-4 text-lg"
              variants={fadeIn}
            >
              Where every person mints their own access token on Bitcoin
            </motion.p>

            <motion.div
              className="flex items-center gap-4 text-zinc-500 text-sm mb-6"
              variants={fadeIn}
            >
              <a href="https://x.com/b0ase" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                @b0ase
              </a>
              <span>·</span>
              <span>February 2026</span>
            </motion.div>

            <motion.div
              className="flex items-center gap-3"
              variants={fadeIn}
            >
              <Link
                href="/whitepaper"
                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black text-xs uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
              >
                Full Whitepaper →
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-16"
          >
            {/* The Opportunity */}
            <motion.div variants={fadeIn}>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                The Opportunity
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                The attention economy is a <span className="text-zinc-900 dark:text-white font-bold">$1T+ market</span> with no native payment rail.
                Creators rely on ads. AI agents can&apos;t pay humans. There&apos;s no price discovery for expertise.
              </p>
              <p className="text-zinc-900 dark:text-white font-bold text-lg">
                $402 solves this by making attention tradeable.
              </p>
            </motion.div>

            {/* How It Works */}
            <motion.div variants={fadeIn}>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                How It Works
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <span className="text-zinc-400 font-mono text-sm w-6">01</span>
                  <div>
                    <span className="font-bold">You mint $YOURNAME</span>
                    <span className="text-zinc-500"> — 1 billion tokens, fixed supply</span>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="text-zinc-400 font-mono text-sm w-6">02</span>
                  <div>
                    <span className="font-bold">Tokens = access rights</span>
                    <span className="text-zinc-500"> — 1 token = 1 second of your time</span>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="text-zinc-400 font-mono text-sm w-6">03</span>
                  <div>
                    <span className="font-bold">Price rises with demand</span>
                    <span className="text-zinc-500"> — sqrt_decay curve rewards early buyers</span>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="text-zinc-400 font-mono text-sm w-6">04</span>
                  <div>
                    <span className="font-bold">Tokens don&apos;t burn</span>
                    <span className="text-zinc-500"> — they&apos;re reusable passes, not consumables</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Business Model */}
            <motion.div variants={fadeIn}>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                Business Model
              </h2>
              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Creator</span>
                    <span className="font-bold text-2xl">70%</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2">
                    <div className="bg-zinc-900 dark:bg-white h-2" style={{ width: '70%' }}></div>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Stakers (investors)</span>
                    <span className="font-bold text-2xl">20%</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2">
                    <div className="bg-zinc-500 h-2" style={{ width: '20%' }}></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Protocol</span>
                    <span className="font-bold text-2xl">10%</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2">
                    <div className="bg-zinc-400 h-2" style={{ width: '10%' }}></div>
                  </div>
                </div>
                <p className="text-zinc-500 text-sm mt-6">
                  Every token sale, every access request — the protocol earns 10%.
                </p>
              </div>
            </motion.div>

            {/* Traction */}
            <motion.div variants={fadeIn}>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                Traction
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4">
                  <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">npm package</div>
                  <div className="font-mono font-bold">path402</div>
                  <div className="text-zinc-500 text-sm">Live on npm</div>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4">
                  <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">MCP Integration</div>
                  <div className="font-mono font-bold">Claude, GPT</div>
                  <div className="text-zinc-500 text-sm">AI agent native</div>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4">
                  <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Desktop Client</div>
                  <div className="font-mono font-bold">macOS</div>
                  <div className="text-zinc-500 text-sm">Shipping now</div>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4">
                  <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Whitepaper</div>
                  <div className="font-mono font-bold">v3.0.0</div>
                  <div className="text-zinc-500 text-sm">Published</div>
                </div>
              </div>
            </motion.div>

            {/* Why Now */}
            <motion.div variants={fadeIn}>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                Why Now
              </h2>
              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <span className="text-zinc-400">→</span>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    <span className="text-zinc-900 dark:text-white font-bold">AI agents need to pay humans</span> for expertise
                  </p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-zinc-400">→</span>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    <span className="text-zinc-900 dark:text-white font-bold">Creator economy</span> hitting platform fee fatigue
                  </p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-zinc-400">→</span>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    <span className="text-zinc-900 dark:text-white font-bold">BSV provides sub-cent transactions</span> at scale
                  </p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-zinc-400">→</span>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    <span className="text-zinc-900 dark:text-white font-bold">MCP (Model Context Protocol)</span> enables AI-native commerce
                  </p>
                </div>
              </div>
            </motion.div>

            {/* The Ask */}
            <motion.div variants={fadeIn}>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                The Ask
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                Seeking partners to:
              </p>
              <div className="space-y-4">
                <div className="bg-zinc-900 dark:bg-white text-white dark:text-black p-4">
                  <span className="font-bold">Mint early personal tokens</span>
                  <span className="opacity-70"> — first-mover pricing advantage</span>
                </div>
                <div className="bg-zinc-800 dark:bg-zinc-100 text-white dark:text-black p-4">
                  <span className="font-bold">Run network nodes</span>
                  <span className="opacity-70"> — Proof of Serve rewards</span>
                </div>
                <div className="bg-zinc-700 dark:bg-zinc-200 text-white dark:text-black p-4">
                  <span className="font-bold">Integrate $402</span>
                  <span className="opacity-70"> — into existing platforms</span>
                </div>
              </div>
            </motion.div>

            {/* Contact */}
            <motion.div variants={fadeIn} className="border-t border-zinc-200 dark:border-zinc-800 pt-16">
              <div className="text-center">
                <p className="text-zinc-500 text-sm uppercase tracking-widest mb-4">Contact</p>
                <div className="flex justify-center gap-6 mb-8">
                  <a
                    href="https://path402.com"
                    className="text-zinc-900 dark:text-white hover:text-zinc-500 transition-colors font-bold"
                  >
                    path402.com
                  </a>
                  <span className="text-zinc-300 dark:text-zinc-700">|</span>
                  <a
                    href="mailto:hello@b0ase.com"
                    className="text-zinc-900 dark:text-white hover:text-zinc-500 transition-colors font-bold"
                  >
                    hello@b0ase.com
                  </a>
                </div>
                <p className="text-zinc-400 italic text-lg">
                  $402 — The price of attention, discovered.
                </p>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>
    </div>
  );
}
