'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiDollarSign, FiBriefcase, FiUsers } from 'react-icons/fi';

export default function GigsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { href: '/gigs', label: 'All Gigs', exact: true },
    { href: '/gigs/offered', label: 'Hiring', icon: <FiBriefcase size={14} /> },
    { href: '/gigs/wanted', label: 'Looking for Work', icon: <FiUsers size={14} /> },
  ];

  const isActive = (tab: typeof tabs[0]) => {
    if (tab.exact) return pathname === tab.href;
    return pathname?.startsWith(tab.href);
  };

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
        {/* Header - matches /agents style */}
        <motion.div
          className="mb-12 border-b border-gray-800 pb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-6">
            <div className="bg-gray-900/50 p-4 md:p-6 border border-gray-800 self-start">
              <FiDollarSign className="text-4xl md:text-6xl text-white" />
            </div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                GIGS
              </h1>
              <div className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-widest">
                WORK BOARD
              </div>
            </div>
          </div>

          <p className="text-gray-400 max-w-2xl mb-6">
            Find freelance opportunities or post your skills. Small jobs, big impact.
            Payment terms are flexible — GBP, USD, ETH, SOL, BTC, BSV, USDC, MNEE, or any token.
            Contracts inscribed on-chain. No bureaucracy, just results.
          </p>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 px-4 py-2 border text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive(tab)
                    ? 'bg-white text-black border-white'
                    : 'border-zinc-800 text-zinc-500 hover:text-white hover:border-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        {children}
      </motion.section>
    </motion.div>
  );
}
