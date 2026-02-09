'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowLeft, FiCheck, FiClock, FiSmartphone } from 'react-icons/fi';
import { FaApple, FaAndroid, FaRocket } from 'react-icons/fa';

export default function MobileAppModule() {
  return (
    <motion.div
      className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.section
        className="px-4 md:px-8 py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        {/* Back Link */}
        <Link
          href="/components"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8"
        >
          <FiArrowLeft /> Back to Components
        </Link>

        {/* Header */}
        <motion.div
          className="mb-12 border-b border-zinc-900 pb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-6">
            <div className="bg-zinc-900/50 p-4 md:p-6 border border-zinc-800 self-start">
              <FiSmartphone className="text-4xl md:text-6xl text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-end gap-4 mb-2">
                <h1 className="text-3xl md:text-5xl font-bold text-white leading-none tracking-tighter">
                  MOBILE APP
                </h1>
                <div className="text-xs text-zinc-500 mb-1 font-mono uppercase tracking-widest">
                  CROSS_PLATFORM
                </div>
              </div>
              <p className="text-zinc-400 max-w-2xl">
                Launch on iOS and Android with a beautiful, high-performance native application built with React Native.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white mb-2">£1200-2000</div>
              <Link
                href="/contact"
                className="inline-block bg-white text-black hover:bg-zinc-200 px-6 py-2 text-xs uppercase font-bold tracking-wider transition-colors"
              >
                Get Quote
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: What You Get & Features */}
          <motion.div
            className="bg-zinc-950 border border-zinc-900 p-6 space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div>
              <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">
                What You Get
              </h2>
              <p className="text-zinc-400 text-sm mb-6">
                A ready-to-launch app for iOS and Android, built with React Native for native performance and easy maintenance.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-zinc-900 border border-zinc-800">
                    <FaApple className="text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">iOS App</h3>
                    <p className="text-zinc-500 text-xs">A compiled app ready for the Apple App Store.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-zinc-900 border border-zinc-800">
                    <FaAndroid className="text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Android App</h3>
                    <p className="text-zinc-500 text-xs">A production-ready bundle for the Google Play Store.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-zinc-900 border border-zinc-800">
                    <FaRocket className="text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Native Performance</h3>
                    <p className="text-zinc-500 text-xs">Access to device features like camera and GPS.</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">
                Core Features
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'iOS & Android', 'Push Notifications', 'Offline Capabilities',
                  'User Authentication', 'API Integration', 'App Store Submission',
                  'Custom Branding', 'Analytics'
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <FiCheck className="text-emerald-500 text-xs flex-shrink-0" />
                    <span className="text-zinc-400 text-xs">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Column 2: Tech & Process */}
          <motion.div
            className="bg-zinc-950 border border-zinc-900 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">
              Technical Implementation
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white mb-3">Technology Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {['React Native', 'Expo', 'TypeScript', 'Firebase', 'Zustand', 'React Navigation'].map((tech) => (
                    <span key={tech} className="text-[10px] uppercase font-bold text-zinc-500 border border-zinc-800 px-2 py-1 bg-zinc-900">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-3">Development Process</h3>
                <ul className="space-y-2 text-zinc-400 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-zinc-600 rounded-full" />
                    UI/UX design and prototyping
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-zinc-600 rounded-full" />
                    Iterative development with updates
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-zinc-600 rounded-full" />
                    Backend API integration
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-zinc-600 rounded-full" />
                    Testing on iOS and Android devices
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Column 3: Pricing & Timeline */}
          <motion.div
            className="bg-zinc-950 border border-zinc-900 p-6 space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div>
              <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">
                Pricing Details
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                  <span className="text-zinc-400">Base App (5 screens)</span>
                  <span className="font-bold text-white">£1200</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                  <span className="text-zinc-400">Push Notifications</span>
                  <span className="font-bold text-white">£200</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                  <span className="text-zinc-400">Authentication</span>
                  <span className="font-bold text-white">£300</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="font-bold text-white uppercase tracking-wider">Total Range</span>
                  <span className="text-xl font-bold text-white">£1200-2000</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                <FiClock className="text-zinc-500" />
                Delivery Timeline
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full" />
                  <div>
                    <div className="font-bold text-white text-sm">Weeks 1-2</div>
                    <div className="text-xs text-zinc-500">Design, Prototyping & Setup</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-zinc-600 rounded-full" />
                  <div>
                    <div className="font-bold text-white text-sm">Weeks 3-4</div>
                    <div className="text-xs text-zinc-500">Core Feature Development</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
}
