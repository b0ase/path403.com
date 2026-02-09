'use client';

import React from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { OnboardingWizard } from '@/components/investors/OnboardingWizard';

export default function InvestorOnboardPage() {
  return (
    <motion.div
      className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-mono relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.section
        className="px-4 md:px-8 py-20 lg:py-32 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="w-full max-w-4xl mx-auto">

          {/* Header */}
          <motion.div
            className="mb-12 border-b border-zinc-900 pb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Link href="/investors" className="text-zinc-500 hover:text-white text-sm mb-4 inline-block">
              ← Back to Investor Registry
            </Link>
            <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
              <div className="bg-gray-900/50 p-4 md:p-6 border border-gray-800 self-start">
                <FiTrendingUp className="text-4xl md:text-6xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-bold text-white leading-none tracking-tighter">
                  INVESTOR ONBOARDING
                </h1>
                <p className="text-zinc-500 mt-2">Complete these steps to become a verified $BOASE investor</p>
              </div>
            </div>
          </motion.div>

          {/* Onboarding Wizard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <OnboardingWizard />
          </motion.div>

        </div>
      </motion.section>
    </motion.div>
  );
}
