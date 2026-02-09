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
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 }
};

export default function ProtocolPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white font-mono selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black pt-14">
      {/* Header */}
      <section className="py-24 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500 mb-8"
              variants={fadeIn}
            >
              PROTOCOL DETAILS
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6"
              variants={fadeIn}
            >
              Protocol Economics
            </motion.h1>

            <motion.p
              className="text-zinc-600 dark:text-zinc-400 max-w-2xl"
              variants={fadeIn}
            >
              Advanced mechanics: hierarchical ownership, revenue distribution, staking, and the flywheel model.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* The 50% Rule */}
      <section className="py-16 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2
              className="text-[10px] font-bold text-zinc-500 mb-6 uppercase tracking-widest"
              variants={fadeIn}
            >
              Hierarchical Ownership
            </motion.h2>
            <motion.p
              className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl"
              variants={fadeIn}
            >
              Child paths give <strong className="text-zinc-900 dark:text-white">50% of tokens to parent</strong>.
              Revenue flows up the tree. Works for both personal and domain tokens.
            </motion.p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                className="border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50 dark:bg-zinc-950"
                variants={scaleIn}
              >
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Personal Example</div>
                <pre className="text-zinc-600 dark:text-zinc-400 font-mono text-sm">
{`$alice
├── $alice/consulting  → 50%
└── $alice/mentorship  → 50%`}
                </pre>
              </motion.div>
              <motion.div
                className="border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50 dark:bg-zinc-950"
                variants={scaleIn}
              >
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Domain Example</div>
                <pre className="text-zinc-600 dark:text-zinc-400 font-mono text-sm">
{`$example.com
├── $example.com/$api    → 50%
└── $example.com/$blog   → 50%`}
                </pre>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Revenue Split */}
      <section className="py-16 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2
              className="text-[10px] font-bold text-zinc-500 mb-6 uppercase tracking-widest"
              variants={fadeIn}
            >
              Revenue Split
            </motion.h2>
            <div className="border border-zinc-200 dark:border-zinc-800 p-8 bg-zinc-50 dark:bg-zinc-950">
              <p className="text-zinc-400 mb-6">
                Revenue splits are <strong className="text-zinc-900 dark:text-white">configurable by the creator</strong>. A typical split:
              </p>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-zinc-600 dark:text-zinc-400">Creator</span>
                    <span className="font-bold text-2xl text-zinc-900 dark:text-white">80%</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2">
                    <div className="bg-zinc-900 dark:bg-white h-2" style={{ width: '80%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-zinc-600 dark:text-zinc-400">Stakers (dividend pool)</span>
                    <span className="font-bold text-2xl text-zinc-900 dark:text-white">20%</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2">
                    <div className="bg-zinc-500 h-2" style={{ width: '20%' }}></div>
                  </div>
                </div>
              </div>
              <p className="text-zinc-500 text-sm mt-6">
                Creators set their own revenue split when minting tokens. Stakers earn dividends proportional to their stake.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Flywheel */}
      <section className="py-16 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-[10px] font-bold text-zinc-500 mb-6 uppercase tracking-widest">
              The Flywheel
            </h2>
            <div className="border border-zinc-200 dark:border-zinc-800 p-8 bg-zinc-50 dark:bg-zinc-950">
              <pre className="text-zinc-600 dark:text-zinc-400 font-mono text-sm overflow-x-auto">
{`Buy Access → Stake Tokens → Run Infrastructure → Earn Revenue → New Buyers Repeat

Every role is the same person at different stages:
  Visitor → Buyer → Holder → Staker → Partner

No separate classes. The path is open to everyone.`}
              </pre>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Flywheel in Action */}
      <section className="py-16 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2
              className="text-[10px] font-bold text-zinc-500 mb-12 uppercase tracking-widest text-center"
              variants={fadeIn}
            >
              The Flywheel in Action
            </motion.h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {[
                { num: "1", title: "BUY", desc: "Pay entry fee, receive bearer shares" },
                { num: "2", title: "STAKE", desc: "Lock tokens, become partner" },
                { num: "3", title: "SERVE", desc: "Run indexer, maintain registry" },
                { num: "4", title: "EARN", desc: "Entry fees + API fees + dividends" },
                { num: "5", title: "GROW", desc: "New buyers repeat the cycle" },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  className="text-center"
                  variants={scaleIn}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <motion.div
                    className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto mb-4 text-xl font-bold"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      delay: 0.3 + i * 0.1
                    }}
                  >
                    {step.num}
                  </motion.div>
                  <div className="text-[10px] font-bold text-zinc-900 dark:text-white uppercase tracking-widest mb-1">{step.title}</div>
                  <p className="text-xs text-zinc-400 dark:text-zinc-600">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2
              className="text-[10px] font-bold text-zinc-500 mb-6 uppercase tracking-widest"
              variants={fadeIn}
            >
              Advanced Features
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "Bearer Shares", desc: "Pay for access, receive tradeable tokens. Early buyers get more tokens per dollar. Resell to latecomers at profit." },
                { title: "Proof of Serve", desc: "Nodes earn through actual contribution: serve content, relay messages, maintain indexes. No wasted computation." },
                { title: "sqrt_decay Pricing", desc: "Price determined by remaining treasury. Early buyers always get better prices. The curve is your constitution." },
                { title: "AI Agents", desc: "First-class participants. Agents can buy, stake, serve, and earn—becoming self-funding over time." },
                { title: "Multi-Chain", desc: "BSV is the settlement layer. Accept payments from Base, Solana, Ethereum. All inscribed on BSV." },
                { title: "KYC Optional", desc: "Bearer tier: hold and trade freely. Staker tier: complete KYC, stake tokens, receive dividends." },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  className="border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50/50 dark:bg-zinc-900/50"
                  variants={scaleIn}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  whileHover={{
                    borderColor: "rgba(161, 161, 170, 1)",
                    transition: { duration: 0.2 }
                  }}
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-wide">{feature.title}</h3>
                  <p className="text-zinc-500 text-sm">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Back to Home */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-widest text-xs border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </section>
    </div>
  );
}
