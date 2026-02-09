'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowRight, FiCheck, FiX, FiMail, FiPackage, FiTarget, FiClock, FiPercent } from 'react-icons/fi';

export default function TokenizePage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-orange-500 selection:text-black">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-orange-600/20 via-orange-500/5 to-transparent blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Price tag */}
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/10">
              <span className="text-orange-400 font-mono text-sm">Fixed Price</span>
              <span className="text-white font-black text-lg">$999</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tight mb-6">
              Tokenize Your App
              <span className="block text-orange-500">for $1,000</span>
            </h1>

            <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl leading-relaxed font-medium">
              Turn a vague token idea into something clear, presentable, and testable — without derailing your main product.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-6 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-lg text-zinc-500 mb-4 font-mono uppercase tracking-wider">The Problem</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
              Most builders don't struggle with ideas.
            </h2>
            <p className="text-xl text-zinc-300 leading-relaxed mb-6">
              They struggle with <em className="text-orange-400 not-italic font-semibold">everything around</em> the idea.
            </p>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Token design has a habit of expanding: mechanics, narratives, landing pages, positioning,
              "what is this actually for?" Suddenly the token becomes a distraction instead of a tool.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What b0ase Does */}
      <section className="py-20 px-6 bg-zinc-900/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-lg text-zinc-500 mb-4 font-mono uppercase tracking-wider">The Solution</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
              b0ase designs and builds <span className="text-orange-500">concrete token artefacts</span>.
            </h2>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="p-6 rounded-2xl border border-zinc-800 bg-black/50">
                <FiX className="text-red-400 text-2xl mb-4" />
                <p className="text-zinc-400 line-through">Not theory</p>
              </div>
              <div className="p-6 rounded-2xl border border-zinc-800 bg-black/50">
                <FiX className="text-red-400 text-2xl mb-4" />
                <p className="text-zinc-400 line-through">Not consulting decks</p>
              </div>
              <div className="p-6 rounded-2xl border border-orange-500/50 bg-orange-500/5">
                <FiCheck className="text-orange-400 text-2xl mb-4" />
                <p className="text-white font-semibold">Finished, usable outputs — delivered quickly</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Offer */}
      <section className="py-20 px-6 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-lg text-zinc-500 mb-4 font-mono uppercase tracking-wider">The Offer (Explicit)</p>

            <div className="p-8 md:p-12 rounded-3xl border-2 border-orange-500 bg-gradient-to-br from-orange-500/10 to-transparent">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8">
                <div>
                  <p className="text-zinc-400 mb-2">Complete token concept design</p>
                  <div className="text-6xl md:text-7xl font-black text-white">$999</div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                      <FiPercent className="text-orange-400 text-xl" />
                    </div>
                    <div>
                      <p className="text-white font-bold">You retain 99%</p>
                      <p className="text-zinc-500 text-sm">Full ownership</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                      <FiTarget className="text-orange-400 text-xl" />
                    </div>
                    <div>
                      <p className="text-white font-bold">b0ase takes 1%</p>
                      <p className="text-zinc-500 text-sm">Alignment stake</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-6 border-t border-orange-500/30">
                <FiClock className="text-orange-400" />
                <p className="text-zinc-300">
                  <span className="font-semibold text-white">Timeframe:</span> Short and bounded — measured in days, not months
                </p>
              </div>

              <p className="text-zinc-400 mt-4 text-sm">
                This is a fixed-scope, fixed-price engagement.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-20 px-6 bg-zinc-900/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-lg text-zinc-500 mb-4 font-mono uppercase tracking-wider">What You Get</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Specific things, not open-ended advice.
            </h2>
            <p className="text-zinc-400 mb-12">
              The output is something real — not production infrastructure, but not a sketch either.
            </p>

            <div className="space-y-4">
              {[
                'A clearly articulated purpose for the token',
                'Basic mechanics and structure',
                'Narrative and positioning',
                'A simple landing page or written explanation',
                'A token concept ready to show, share, or test'
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-5 rounded-xl border border-zinc-800 bg-black/50 hover:border-orange-500/50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <FiPackage className="text-orange-400" />
                  </div>
                  <p className="text-lg text-zinc-200">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Responsibility */}
      <section className="py-20 px-6 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-lg text-zinc-500 mb-4 font-mono uppercase tracking-wider">Clear Boundaries</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">
              b0ase builds the artefact.<br />
              <span className="text-zinc-500">What happens next is your decision.</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 rounded-2xl border border-green-500/30 bg-green-500/5">
                <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                  <FiCheck /> b0ase IS responsible for
                </h3>
                <ul className="space-y-3 text-zinc-300">
                  <li>Design</li>
                  <li>Clarity</li>
                  <li>Coherence</li>
                  <li>Delivery within scope & timeframe</li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl border border-red-500/30 bg-red-500/5">
                <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                  <FiX /> b0ase is NOT responsible for
                </h3>
                <ul className="space-y-3 text-zinc-400">
                  <li>Operating the project</li>
                  <li>Managing users or funds</li>
                  <li>Long-term maintenance</li>
                  <li>Legal, regulatory, or compliance decisions</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why This Pricing */}
      <section className="py-20 px-6 bg-zinc-900/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-lg text-zinc-500 mb-4 font-mono uppercase tracking-wider">Why $999 + 1%</p>

            <div className="space-y-6 text-lg text-zinc-300 leading-relaxed">
              <p>
                The fixed price keeps things <span className="text-white font-semibold">simple and contained</span>.
                <br />
                <span className="text-zinc-500">No retainers. No upsells. No dependency.</span>
              </p>

              <p>
                The 1% exists because tokens are asymmetric — if the experiment works, alignment matters;
                if it doesn't, you've paid for speed and clarity.
              </p>

              <div className="p-6 rounded-xl border border-zinc-700 bg-black/50 mt-8">
                <p className="text-zinc-400 italic">
                  There are no guarantees. That's how experiments work.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-20 px-6 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-lg text-zinc-500 mb-4 font-mono uppercase tracking-wider">Who This Is For</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">
              This works best for:
            </h2>

            <div className="grid md:grid-cols-2 gap-4 mb-12">
              {[
                'Builders who are already shipping',
                'Teams who want to move fast',
                'Founders who don\'t want token design to consume the roadmap',
                'People who value finished work over prolonged discussion'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-zinc-800 bg-black/50">
                  <FiArrowRight className="text-orange-400 flex-shrink-0" />
                  <p className="text-zinc-200">{item}</p>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-xl bg-zinc-800/50 border border-zinc-700">
              <p className="text-zinc-300">
                If you want someone to take ownership of everything, <span className="text-zinc-500">this isn't that.</span>
              </p>
              <p className="text-white font-semibold mt-2">
                If you want someone to handle a specific piece of work and get it done, it is.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 bg-gradient-to-b from-zinc-900/50 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Ready to tokenize?
            </h2>
            <p className="text-xl text-zinc-400 mb-12 max-w-xl mx-auto">
              Offload token design and receive something concrete quickly.
            </p>

            <a
              href="mailto:hello@b0ase.com?subject=Tokenize%20My%20App"
              className="inline-flex items-center gap-3 px-8 py-5 bg-orange-500 hover:bg-orange-400 text-black font-black text-lg rounded-2xl transition-all hover:scale-105 hover:shadow-xl hover:shadow-orange-500/25"
            >
              <FiMail className="text-xl" />
              hello@b0ase.com
            </a>

            <p className="text-zinc-600 mt-8 text-sm">
              $999 · You own 99% · Days, not months
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/" className="text-zinc-500 hover:text-white transition-colors">
            ← Back to b0ase.com
          </Link>
          <p className="text-zinc-600 text-sm">
            b0ase · Token design that ships
          </p>
        </div>
      </footer>
    </div>
  );
}
