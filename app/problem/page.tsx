'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FiArrowRight,
  FiMessageCircle,
  FiPackage,
  FiGlobe,
  FiShare2,
  FiLock,
  FiUsers,
} from 'react-icons/fi';

import { useColorTheme } from '@/components/ThemePicker';

export default function ProblemLandingPage() {
  const { colorTheme } = useColorTheme();
  const isDark = colorTheme === 'black';

  return (
    <div className={`min-h-screen transition-colors duration-500 relative ${isDark ? 'bg-black text-white' : 'bg-zinc-50 text-black'}`}>
      {/* Background Image */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500 pointer-events-none ${isDark ? 'opacity-40' : 'opacity-10'}`}
        style={{ backgroundImage: 'url(/images/blog/kintsugi-bowl.jpg)', filter: isDark ? 'none' : 'grayscale(100%) brightness(0.9)' }}
      />
      {/* Overlay for readability */}
      <div className={`absolute inset-0 pointer-events-none transition-colors duration-500 ${isDark ? 'bg-gradient-to-b from-black/60 via-black/40 to-black/80' : 'bg-white/40'}`} />

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto px-4 pt-40 pb-12 relative z-10"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
          Your Startup in a Box
        </h1>

        <p className={`${isDark ? 'text-zinc-400' : 'text-zinc-600'} mb-6 max-w-2xl`}>
          <strong className={isDark ? 'text-white' : 'text-black'}>£999 to start. 100% equity.</strong> We build your product,
          you own everything. Pay monthly to continue — b0ase earns equity through delivered work.
        </p>

        {/* What You Get Cards - moved up */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
          <div className={`${isDark ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white/70 border-zinc-200 shadow-sm'} border rounded-lg p-4 transition-all duration-300`}>
            <div className="flex items-center gap-2 mb-1">
              <FiPackage className={`w-4 h-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
              <h3 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-zinc-900'}`}>Your Own Token</h3>
            </div>
            <p className={`${isDark ? 'text-zinc-500' : 'text-zinc-500'} text-xs`}>
              Listed on b0ase.com/exchange. Sellable to investors.
            </p>
          </div>

          <div className={`${isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200'} border rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group`}>
            <div className="flex items-center gap-3 mb-2">
              <FiLock className={`w-5 h-5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'} group-hover:text-amber-500 transition-colors`} />
              <h3 className={`font-bold text-base uppercase tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>2-of-3 Multi-Sig</h3>
            </div>
            <p className={`${isDark ? 'text-zinc-500' : 'text-zinc-500'} text-xs leading-relaxed`}>
              You control transfers. Your approval required.
            </p>
          </div>

          <div className={`${isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200'} border rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group`}>
            <div className="flex items-center gap-3 mb-2">
              <FiGlobe className={`w-5 h-5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'} group-hover:text-blue-500 transition-colors`} />
              <h3 className={`font-bold text-base uppercase tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>Marketing Website</h3>
            </div>
            <p className={`${isDark ? 'text-zinc-500' : 'text-zinc-500'} text-xs leading-relaxed`}>
              Landing page with domain hosting included.
            </p>
          </div>

          <div className={`${isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200'} border rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group`}>
            <div className="flex items-center gap-3 mb-2">
              <FiShare2 className={`w-5 h-5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'} group-hover:text-green-500 transition-colors`} />
              <h3 className={`font-bold text-base uppercase tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>Social Media</h3>
            </div>
            <p className={`${isDark ? 'text-zinc-500' : 'text-zinc-500'} text-xs leading-relaxed`}>
              Twitter/X and LinkedIn with automation.
            </p>
          </div>

          <div className={`${isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200'} border rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group`}>
            <div className="flex items-center gap-3 mb-2">
              <FiUsers className={`w-5 h-5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'} group-hover:text-purple-500 transition-colors`} />
              <h3 className={`font-bold text-base uppercase tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>KYC Integration</h3>
            </div>
            <p className={`${isDark ? 'text-zinc-500' : 'text-zinc-500'} text-xs leading-relaxed`}>
              Veriff verification. Raise capital legally.
            </p>
          </div>

          <div className={`${isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200'} border rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group`}>
            <div className="flex items-center gap-3 mb-2">
              <FiMessageCircle className={`w-5 h-5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'} group-hover:text-cyan-500 transition-colors`} />
              <h3 className={`font-bold text-base uppercase tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>AI Architect</h3>
            </div>
            <p className={`${isDark ? 'text-zinc-500' : 'text-zinc-500'} text-xs leading-relaxed`}>
              Define your product before you pay anything.
            </p>
          </div>
        </div>

        {/* CTA - early */}
        <div className="mb-12">
          <Link
            href="/kintsugi"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}
          >
            Describe Your Idea <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Details below */}
        <div className={`space-y-5 ${isDark ? 'text-zinc-400' : 'text-zinc-600'} leading-relaxed text-sm`}>
          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>How It Works</h2>
          <p>
            We call it the <Link href="/kintsugi" className={`${isDark ? 'text-white' : 'text-black'} hover:underline font-semibold`}>Kintsugi Engine</Link> — the Japanese art of repairing broken
            pottery with gold. You bring us your broken process, your messy workflow, your idea that should exist
            but doesn't. We build it.
          </p>

          <p>
            <strong className={isDark ? 'text-white' : 'text-black'}>First payment: £999.</strong> You receive 100% equity in your project.
            Tokens are created, listed on our exchange, and locked in a 2-of-3 multi-sig wallet you control.
          </p>

          <p>
            We build for one month. You test and approve. Then you decide: continue or stop.
          </p>

          <p>
            <strong className={isDark ? 'text-white' : 'text-black'}>Second payment: £999.</strong> When you pay for month two, b0ase
            receives 1% equity for the completed first month's work. Each payment releases the previous month's equity.
          </p>

          <p>
            If you stop after month one, you keep 100%. Continue for ten months and stop — b0ase has 9%, you have 91%.
          </p>

          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-black'} pt-4`}>Pricing</h2>

          <p>
            <strong className={isDark ? 'text-white' : 'text-black'}>£999/month. Every month. No escalation.</strong> Each payment buys one month
            of development and releases 1% equity to b0ase for the previous month's work.
          </p>

          <p>
            Infrastructure and running costs (hosting, APIs, services) are billed separately at cost — fully transparent.
            You see exactly what you're paying for.
          </p>

          <p>
            b0ase equity caps at 49% — you always retain majority control, no matter how long the contract runs.
          </p>

          <p>
            <Link href="/kintsugi/roadmap" className={`${isDark ? 'text-white' : 'text-black'} hover:underline`}>
              See the full development roadmap →
            </Link>
          </p>

          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-black'} pt-4`}>What We Build</h2>

          <p>
            Internal tools, consumer apps, automation systems, data products, AI agents, blockchain applications,
            dashboards, integrations. If it's software, we build it.
          </p>

          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-black'} pt-4`}>Why This Model</h2>

          <p>
            You own 100% from day one. Raise capital from your network — they buy tokens representing equity.
            Use that capital to fund development. b0ase earns equity through delivered work, not promises.
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-zinc-900 text-center text-zinc-600 text-xs">
          <p>
            Built by <Link href="/" className="text-zinc-400 hover:text-white">b0ase.com</Link>.
            {' '}<Link href="/build" className="text-zinc-400 hover:text-white">Development services</Link> ·{' '}
            <Link href="/investors" className="text-zinc-400 hover:text-white">Invest in $BOASE</Link>
          </p>
        </footer>
      </motion.article>
    </div>
  );
}
