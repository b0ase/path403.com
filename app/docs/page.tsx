'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiTool,
  FiCode,
  FiDollarSign,
  FiBox,
  FiArrowRight,
  FiBook,
  FiGitBranch,
  FiUsers
} from 'react-icons/fi';

const docSections = [
  {
    title: 'Kintsugi Engine',
    description: 'Transform your startup idea into a funded, built product. Learn about our development process, equity structure, and how we turn problems into products.',
    icon: FiBox,
    links: [
      { name: 'How Kintsugi Works', href: '/problem' },
      { name: 'Start a Session', href: '/kintsugi' },
      { name: 'Development Roadmap', href: '/kintsugi/roadmap' },
    ],
    color: 'amber'
  },
  {
    title: 'For Developers',
    description: 'Join our development network. Build equity in real products, access our toolchain, and collaborate on cutting-edge projects.',
    icon: FiCode,
    links: [
      { name: 'Developer Onboarding', href: '/build/join-a-team' },
      { name: 'Available Gigs', href: '/gigs' },
      { name: 'Tech Stack & Tools', href: '/tools' },
    ],
    color: 'blue'
  },
  {
    title: 'For Investors',
    description: 'Invest in early-stage products with transparent tokenized equity. Browse our pipeline, understand our model, and track portfolio performance.',
    icon: FiDollarSign,
    links: [
      { name: 'Investment Model', href: '/invest' },
      { name: 'Project Pipeline', href: '/pipeline' },
      { name: 'Treasury & Tokens', href: '/treasury' },
    ],
    color: 'green'
  },
  {
    title: 'Tools & Resources',
    description: 'Free tools and resources for builders. From token launchers to smart contract templates.',
    icon: FiTool,
    links: [
      { name: 'All Tools', href: '/tools' },
      { name: 'Components Library', href: '/components' },
      { name: 'Brand Kit', href: '/brand-kit' },
    ],
    color: 'purple'
  },
];

const colorClasses = {
  amber: {
    icon: 'text-amber-400',
    border: 'border-amber-500/20 hover:border-amber-500/40',
    bg: 'bg-amber-500/5',
  },
  blue: {
    icon: 'text-blue-400',
    border: 'border-blue-500/20 hover:border-blue-500/40',
    bg: 'bg-blue-500/5',
  },
  green: {
    icon: 'text-green-400',
    border: 'border-green-500/20 hover:border-green-500/40',
    bg: 'bg-green-500/5',
  },
  purple: {
    icon: 'text-purple-400',
    border: 'border-purple-500/20 hover:border-purple-500/40',
    bg: 'bg-purple-500/5',
  },
};

export default function DocsPage() {
  return (
    <motion.div
      className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="w-full px-4 md:px-8 py-16">
        {/* Header */}
        <motion.header
          className="mb-12 border-b border-zinc-800 pb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-6">
            <div className="bg-zinc-900/50 p-4 md:p-6 border border-zinc-800 self-start">
              <FiBook className="text-4xl md:text-6xl text-white" />
            </div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                DOCUMENTATION
              </h1>
              <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                KNOWLEDGE BASE
              </div>
            </div>
          </div>
          <p className="text-zinc-400 max-w-2xl mb-8">
            Comprehensive guides and resources for the entire b0ase ecosystem.
            Whether you are founding a startup, developing on our stack, or investing in our portfolio.
          </p>
        </motion.header>

        {/* Documentation Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {docSections.map((section) => {
            const Icon = section.icon;

            return (
              <div
                key={section.title}
                className="bg-black border border-zinc-800 p-6 hover:border-zinc-500 transition-all group flex flex-col"
              >
                {/* Card Header */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 shrink-0 flex items-center justify-center">
                    <Icon className="text-white text-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-white uppercase tracking-tight mb-1">
                      {section.title}
                    </h2>
                    <div className="h-0.5 w-8 bg-zinc-800 group-hover:bg-white transition-colors" />
                  </div>
                </div>

                {/* Description */}
                <p className="text-zinc-400 text-xs leading-relaxed mb-6 flex-grow">
                  {section.description}
                </p>

                {/* Links */}
                <div className="bg-zinc-900/30 border border-zinc-800 p-4 mt-auto">
                  <div className="space-y-3">
                    {section.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center justify-between text-xs text-zinc-400 hover:text-white group/link transition-colors"
                      >
                        <span className="uppercase tracking-wide font-bold">{link.name}</span>
                        <FiArrowRight className="opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Links */}
        <div className="flex gap-6 justify-start flex-wrap pt-0 text-xs text-zinc-500 font-mono uppercase tracking-widest">
          <span>// End of Documentation Index</span>
        </div>
      </div>
    </motion.div>
  );
}
