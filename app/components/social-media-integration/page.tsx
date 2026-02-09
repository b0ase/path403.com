'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCheck, FiShare2, FiTwitter, FiFacebook, FiInstagram } from 'react-icons/fi';

export default function SocialMediaIntegrationModule() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black"
    >
      <div className="px-4 md:px-8 py-16">
        {/* Back Link */}
        <Link href="/components" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8">
          <FiArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Components</span>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-start gap-6 mb-6">
            <div className="bg-zinc-900/50 p-4 md:p-6 border border-zinc-800">
              <FiShare2 className="w-8 h-8 md:w-12 md:h-12 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mb-2">Component Module</p>
              <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter mb-4">
                Social Media Integration
              </h1>
              <p className="text-zinc-400 max-w-2xl">
                Connect your application with major social media platforms.
              </p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-2xl md:text-3xl font-bold text-white mb-4">£400-800</p>
              <Link href="/contact" className="bg-white text-black hover:bg-zinc-200 px-6 py-2 text-xs uppercase font-bold tracking-wider inline-block transition-colors">
                Get Quote
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: What You Get & Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-zinc-950 border border-zinc-900 p-6">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">What You Get</h2>
              <p className="text-zinc-400 text-sm mb-6">
                Connect your app with major social platforms to enable social logins, content sharing, and embedding live feeds directly.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FiTwitter className="text-emerald-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-white text-sm uppercase">Social Login (OAuth)</h3>
                    <p className="text-zinc-500 text-xs">Allow users to sign up and log in via social accounts.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiFacebook className="text-emerald-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-white text-sm uppercase">Content Sharing</h3>
                    <p className="text-zinc-500 text-xs">Enable users to share content to their profiles.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiInstagram className="text-emerald-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-white text-sm uppercase">Automated Posting</h3>
                    <p className="text-zinc-500 text-xs">Set up automated posting to your own channels.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-900 p-6">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Core Features</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Social Login', 'Content Sharing', 'Embedded Feeds', 'Automated Posting',
                  'Profile Data Sync', 'Analytics', 'Multi-Platform', 'Custom Buttons'
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <FiCheck className="text-emerald-500 text-xs flex-shrink-0" />
                    <span className="text-zinc-400 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Column 2: Tech & Integration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="bg-zinc-950 border border-zinc-900 p-6">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Technical Implementation</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Technology Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Node.js', 'OAuth 2.0', 'Twitter API', 'Facebook API', 'LinkedIn API'].map((tech) => (
                      <span key={tech} className="text-[10px] uppercase font-bold text-zinc-500 border border-zinc-800 px-2 py-1 bg-zinc-900">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Integration Process</h3>
                  <ul className="space-y-2 text-zinc-400 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-zinc-600">01.</span>
                      <span>Setup of developer accounts and API keys</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-zinc-600">02.</span>
                      <span>Implementation of OAuth flows</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-zinc-600">03.</span>
                      <span>Backend endpoints for API interactions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-zinc-600">04.</span>
                      <span>Frontend components for sharing</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Column 3: Pricing & Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-zinc-950 border border-zinc-900 p-6">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Pricing Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                  <span className="text-zinc-500 text-sm">Base (1 platform)</span>
                  <span className="font-bold text-white">£400</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                  <span className="text-zinc-500 text-sm">Additional Platform</span>
                  <span className="font-bold text-white">£150</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                  <span className="text-zinc-500 text-sm">Automated Posting</span>
                  <span className="font-bold text-white">£250</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="font-bold text-white uppercase text-sm">Total Range</span>
                  <span className="font-bold text-white text-lg">£400-800</span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-900 p-6">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Delivery Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-emerald-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <div className="font-bold text-white text-sm uppercase">Week 1</div>
                    <div className="text-xs text-zinc-500">API setup & basic integration</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-emerald-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <div className="font-bold text-white text-sm uppercase">Weeks 2-3</div>
                    <div className="text-xs text-zinc-500">Advanced features & testing</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
