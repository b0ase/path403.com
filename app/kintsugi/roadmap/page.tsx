'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiPackage,
  FiGlobe,
  FiShare2,
  FiCode,
  FiDatabase,
  FiCpu,
  FiLock,
  FiTrendingUp,
  FiShoppingCart,
  FiUsers,
  FiZap,
  FiServer,
  FiShield,
  FiBarChart2,
  FiMessageCircle,
  FiDollarSign,
  FiLayers,
} from 'react-icons/fi';

interface Tranche {
  month: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  deliverables: string[];
  category: 'foundation' | 'brand' | 'marketing' | 'development' | 'ai' | 'blockchain' | 'scale' | 'enterprise';
}

const TRANCHES: Tranche[] = [
  {
    month: 1,
    title: 'Foundation',
    subtitle: 'Everything to raise capital',
    icon: <FiPackage className="w-5 h-5" />,
    category: 'foundation',
    deliverables: [
      'Token deployment (your chain, your supply, your symbol)',
      '2-of-3 multi-sig wallet (you control transfers)',
      'Token listed on b0ase.com/exchange',
      'KYC/Veriff integration for legal fundraising',
      'Marketing website (Next.js, your domain)',
      'Logo, brand colors, social media kit',
      'Twitter/X + LinkedIn accounts with automation',
      'Blog system with 2 launch posts',
      'Technical specification document',
      'Database schema & API architecture',
      'Open Graph images for social sharing',
    ],
  },
  {
    month: 2,
    title: 'Core Product',
    subtitle: 'Your main feature built',
    icon: <FiCode className="w-5 h-5" />,
    category: 'development',
    deliverables: [
      'Primary feature implementation',
      'Feature-specific database models',
      'API endpoints for core functionality',
      'Authentication (email, Google, GitHub)',
      'User dashboard & account settings',
      'Frontend UI components',
      'Form handling & validation',
      'Error handling & loading states',
      'Mobile-responsive design',
      'Analytics tracking (GA4)',
    ],
  },
  {
    month: 3,
    title: 'Launch & Iterate',
    subtitle: 'Ready for users',
    icon: <FiTrendingUp className="w-5 h-5" />,
    category: 'scale',
    deliverables: [
      'User onboarding flow',
      'Notification system',
      'Settings & preferences',
      'Search functionality',
      'Performance optimization',
      'Security hardening',
      'Bug fixes from beta testing',
      'Documentation & help content',
      'Launch support',
      'First iteration based on feedback',
    ],
  },
];

// What's included in the maintenance retainer
const MAINTENANCE_INCLUDES = [
  'Bug fixes & security patches',
  'Hosting & infrastructure management',
  'Dependency updates',
  'Performance monitoring',
  'Database backups',
  'SSL & domain management',
];

const DEVELOPMENT_INCLUDES = [
  'New feature development',
  'UI/UX improvements',
  'Third-party integrations',
  'API enhancements',
  'Mobile optimizations',
  'Analytics & reporting',
];

const CATEGORY_COLORS: Record<string, string> = {
  foundation: 'border-amber-500/30 bg-amber-500/5',
  brand: 'border-purple-500/30 bg-purple-500/5',
  marketing: 'border-blue-500/30 bg-blue-500/5',
  development: 'border-green-500/30 bg-green-500/5',
  ai: 'border-cyan-500/30 bg-cyan-500/5',
  blockchain: 'border-orange-500/30 bg-orange-500/5',
  scale: 'border-pink-500/30 bg-pink-500/5',
  enterprise: 'border-red-500/30 bg-red-500/5',
};


function TrancheCard({ tranche, isExpanded, onToggle, isDark }: { tranche: Tranche; isExpanded: boolean; onToggle: () => void; isDark: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${isDark ? CATEGORY_COLORS[tranche.category] : 'bg-white border-zinc-200'}`}
    >
      <button
        onClick={onToggle}
        className={`w-full p-6 flex items-center justify-between text-left hover:bg-zinc-500/5 transition-colors`}
      >
        <div className="flex items-center gap-6">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'}`}>
            {tranche.icon}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>MONTH {tranche.month}</span>
            </div>
            <h3 className={`font-black text-xl uppercase tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>{tranche.title}</h3>
            <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-500'} font-medium`}>{tranche.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className={`text-lg font-black ${isDark ? 'text-zinc-400' : 'text-zinc-900'}`}>£999</div>
            <div className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>1% equity</div>
          </div>
          {isExpanded ? (
            <FiChevronUp className={`w-5 h-5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
          ) : (
            <FiChevronDown className={`w-5 h-5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
          )}
        </div>
      </button>

      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-6 pb-6"
        >
          <div className={`border-t ${isDark ? 'border-zinc-800' : 'border-zinc-100'} pt-6`}>
            <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'} mb-4`}>Deliverables</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {tranche.deliverables.map((item, i) => (
                <li key={i} className={`flex items-start gap-3 text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  <FiCheck className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

import { useColorTheme } from '@/components/ThemePicker';

export default function KintsugiRoadmapPage() {
  const { colorTheme } = useColorTheme();
  const isDark = colorTheme === 'black';
  const [expandedTranches, setExpandedTranches] = useState<Set<number>>(new Set([1, 2, 3]));

  const toggleTranche = (month: number) => {
    setExpandedTranches((prev) => {
      const next = new Set(prev);
      if (next.has(month)) {
        next.delete(month);
      } else {
        next.add(month);
      }
      return next;
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 relative ${isDark ? 'bg-black text-white' : 'bg-zinc-50 text-black'}`}>
      {/* Background Image */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500 pointer-events-none ${isDark ? 'opacity-40' : 'opacity-10'}`}
        style={{ backgroundImage: 'url(/images/blog/kintsugi-bowl.jpg)', filter: isDark ? 'none' : 'grayscale(100%) brightness(0.9)' }}
      />
      {/* Gradient overlay */}
      <div className={`absolute inset-0 pointer-events-none transition-colors duration-500 ${isDark ? 'bg-gradient-to-b from-black/60 via-black/40 to-black/80' : 'bg-white/40'}`} />

      <div className="max-w-6xl mx-auto px-4 pt-40 pb-12 relative z-10">

        {/* Header */}
        <div className="flex items-center gap-6 mb-12">
          <Link
            href="/kintsugi"
            className={`p-3 rounded-xl transition-all ${isDark ? 'bg-zinc-900 text-white hover:bg-zinc-800' : 'bg-white text-black border border-zinc-200 shadow-sm hover:bg-zinc-50'}`}
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className={`text-3xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>Kintsugi Roadmap</h1>
            <p className={`text-sm font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
              £999 setup fee. £999/month for active development.
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className={`${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'} border rounded-2xl p-8 transition-all`}>
            <div className={`text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>£999</div>
            <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Setup Fee</div>
          </div>
          <div className={`${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'} border rounded-2xl p-8 transition-all`}>
            <div className={`text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>99%</div>
            <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Your Equity (on launch)</div>
          </div>
          <div className={`${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'} border rounded-2xl p-8 transition-all`}>
            <div className={`text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>£999</div>
            <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Development / Month</div>
          </div>
        </div>

        {/* Tranches */}
        <div className="space-y-4">
          {TRANCHES.map((tranche) => (
            <TrancheCard
              key={tranche.month}
              tranche={tranche}
              isExpanded={expandedTranches.has(tranche.month)}
              onToggle={() => toggleTranche(tranche.month)}
              isDark={isDark}
            />
          ))}
        </div>

        {/* Maintenance & Development */}
        <div className={`mt-12 p-8 ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'} border rounded-2xl`}>
          <h3 className={`font-black uppercase tracking-tight mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Month 4+: Maintenance & Development</h3>
          <p className={`${isDark ? 'text-zinc-400' : 'text-zinc-600'} text-sm mb-8 leading-relaxed`}>
            After launch, continue with a monthly retainer. Same terms: £999/month, 1% equity per completed month.
            Cancel anytime — month-to-month, no lock-in.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'} mb-4`}>Maintenance</h4>
              <ul className="space-y-3">
                {MAINTENANCE_INCLUDES.map((item, i) => (
                  <li key={i} className={`flex items-center gap-3 text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'} mb-4`}>Development</h4>
              <ul className="space-y-3">
                {DEVELOPMENT_INCLUDES.map((item, i) => (
                  <li key={i} className={`flex items-center gap-3 text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <Link
              href="/problem"
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-black'}`}
            >
              How It Works
            </Link>
            <Link
              href="/kintsugi"
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}
            >
              Start Project
            </Link>
          </div>

          <p className={`${isDark ? 'text-zinc-600' : 'text-zinc-400'} text-[10px] mt-6 font-medium italic`}>
            * Contract rolls over monthly. b0ase equity caps at 49% — you always retain majority control.
          </p>
        </div>

        {/* Footer */}
        <footer className={`mt-16 pt-8 border-t ${isDark ? 'border-zinc-900' : 'border-zinc-200'} text-center ${isDark ? 'text-zinc-600' : 'text-zinc-400'} text-[10px] font-mono uppercase tracking-[0.2em]`}>
          <p>
            Built by <Link href="/" className={`${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-black'} transition-colors`}>b0ase.com</Link>.{' '}
            <Link href="/problem" className={`${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-black'} transition-colors`}>Full details</Link> ·{' '}
            <Link href="/investors" className={`${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-black'} transition-colors`}>Invest in $BOASE</Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
