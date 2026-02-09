'use client';

import Link from "next/link";
import { motion } from "framer-motion";

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

export default function TokenPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white font-mono pt-14">
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn}>
              <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-sm mb-4 inline-block">
                &larr; Back to Home
              </Link>
            </motion.div>

            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500 mb-8"
              variants={fadeIn}
            >
              TOKEN MODEL v2 &mdash; POW20
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4"
              variants={fadeIn}
            >
              $402 POW20
            </motion.h1>

            <motion.p
              className="text-zinc-600 dark:text-zinc-400 max-w-2xl mb-12"
              variants={fadeIn}
            >
              The $402 token is now earned by running the network &mdash; not purchased.
              Download the client, serve content, and earn tokens through Proof of Work.
            </motion.p>

            {/* What Changed */}
            <motion.div
              className="border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 p-8 mb-12"
              variants={fadeIn}
            >
              <h2 className="text-sm font-bold uppercase tracking-wide mb-4 text-amber-800 dark:text-amber-400">
                Token Model Update
              </h2>
              <p className="text-sm text-amber-700 dark:text-amber-500 mb-4">
                The original $402 token sale has been replaced by the <strong>$402 POW20</strong> model.
                Tokens are now minted through computational work performed by network participants, not through direct purchase.
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-500">
                If you hold existing $402 tokens from the original sale, they remain valid. The POW20 model distributes
                new supply to operators who actually run the infrastructure.
              </p>
            </motion.div>

            {/* How POW20 Works */}
            <motion.div
              className="mb-12"
              variants={fadeIn}
            >
              <h2 className="text-[10px] font-bold text-zinc-500 mb-6 uppercase tracking-widest">
                How POW20 Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50 dark:bg-zinc-950">
                  <div className="text-2xl font-black mb-3">01</div>
                  <h3 className="text-sm font-bold uppercase tracking-wide mb-2">Run the Client</h3>
                  <p className="text-zinc-500 text-sm">
                    Download and run the $402 desktop client or daemon. Your node indexes the blockchain
                    and serves content to the network.
                  </p>
                </div>
                <div className="border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50 dark:bg-zinc-950">
                  <div className="text-2xl font-black mb-3">02</div>
                  <h3 className="text-sm font-bold uppercase tracking-wide mb-2">Prove Your Work</h3>
                  <p className="text-zinc-500 text-sm">
                    The HTM contract (BRC-114 Proof of Indexing) requires nodes to index BSV-21 tokens.
                    Nodes that index and serve content earn $402 mining rewards.
                  </p>
                </div>
                <div className="border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50 dark:bg-zinc-950">
                  <div className="text-2xl font-black mb-3">03</div>
                  <h3 className="text-sm font-bold uppercase tracking-wide mb-2">Earn $402 Tokens</h3>
                  <p className="text-zinc-500 text-sm">
                    Tokens are minted to your wallet as you contribute to the network.
                    More work = more tokens. No middleman, no purchase required.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Why POW20 */}
            <motion.div
              className="border border-zinc-200 dark:border-zinc-800 p-8 bg-zinc-50 dark:bg-zinc-950 mb-12"
              variants={fadeIn}
            >
              <h2 className="text-[10px] font-bold text-zinc-500 mb-6 uppercase tracking-widest">
                Why POW20
              </h2>
              <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                <p>
                  <strong className="text-zinc-900 dark:text-white">Network bootstrapping:</strong> The $402 protocol
                  needs operators running nodes before it becomes useful. POW20 incentivizes early infrastructure
                  by rewarding the people who actually build and maintain it.
                </p>
                <p>
                  <strong className="text-zinc-900 dark:text-white">Fair distribution:</strong> Tokens go to contributors,
                  not speculators. If you run a node, index transactions, and serve content &mdash; you earn.
                  The more infrastructure you provide, the more you receive.
                </p>
                <p>
                  <strong className="text-zinc-900 dark:text-white">Operator visibility:</strong> POW20 mining requires
                  capital expenditure (hardware, bandwidth). Large operators can&apos;t hide behind anonymous wallets.
                  This creates natural regulatory visibility without KYC overhead.
                </p>
              </div>
            </motion.div>

            {/* Token Properties */}
            <motion.div
              className="mb-12"
              variants={fadeIn}
            >
              <h2 className="text-[10px] font-bold text-zinc-500 mb-6 uppercase tracking-widest">
                Token Properties
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50 dark:bg-zinc-950">
                  <h3 className="text-sm font-bold mb-4 uppercase tracking-wide">$402 Protocol Token</h3>
                  <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <li><strong className="text-zinc-900 dark:text-white">Standard:</strong> BSV-21 (PoW20 HTM)</li>
                    <li><strong className="text-zinc-900 dark:text-white">Supply:</strong> 21,000,000 (mirrors Bitcoin)</li>
                    <li><strong className="text-zinc-900 dark:text-white">Distribution:</strong> 100% mined, 0% pre-mine</li>
                    <li><strong className="text-zinc-900 dark:text-white">Utility:</strong> Stake with $401 KYC to earn serving revenue</li>
                  </ul>
                </div>
                <div className="border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50 dark:bg-zinc-950">
                  <h3 className="text-sm font-bold mb-4 uppercase tracking-wide">Path Tokens ($yourname)</h3>
                  <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <li><strong className="text-zinc-900 dark:text-white">Minted by:</strong> Anyone, for any path</li>
                    <li><strong className="text-zinc-900 dark:text-white">Pricing:</strong> sqrt_decay curve (default)</li>
                    <li><strong className="text-zinc-900 dark:text-white">1 Token:</strong> 1 second of access</li>
                    <li><strong className="text-zinc-900 dark:text-white">Tradeable:</strong> Secondary markets</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              className="flex flex-wrap gap-4"
              variants={fadeIn}
            >
              <Link
                href="/download"
                className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-xs hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Client
              </Link>
              <Link
                href="/whitepaper"
                className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-widest text-xs border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Read the Whitepaper
              </Link>
              <a
                href="https://fnews.online"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-widest text-xs border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                See it in Action &rarr;
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
