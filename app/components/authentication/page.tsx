'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCheck, FiShield, FiMail, FiLink } from 'react-icons/fi';
import { FaGoogle, FaGithub } from 'react-icons/fa';

export default function AuthenticationModule() {
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
          <FiArrowLeft />
          <span>Back to Components</span>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-start gap-6 mb-6">
            <div className="bg-zinc-900/50 p-4 md:p-6 border border-zinc-800">
              <FiShield className="text-3xl md:text-4xl text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mb-2">Security</p>
              <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter mb-4">
                Authentication System
              </h1>
              <p className="text-zinc-400 max-w-2xl">
                Secure user authentication with social logins, password recovery, and email verification.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl md:text-3xl font-bold text-white mb-4">
                £400-800
              </div>
              <Link href="/contact" className="bg-white text-black hover:bg-zinc-200 px-6 py-2 text-xs uppercase font-bold tracking-wider inline-block">
                Get Quote
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="text-[10px] uppercase font-bold text-zinc-500 border border-zinc-800 px-2 py-1 bg-zinc-900">
              1-2 weeks delivery
            </span>
            <span className="text-[10px] uppercase font-bold text-zinc-500 border border-zinc-800 px-2 py-1 bg-zinc-900">
              Medium complexity
            </span>
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: What You Get & Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-950 border border-zinc-900 p-6 space-y-6"
          >
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
                What You Get
              </h2>
              <p className="text-zinc-400 text-sm mb-6">
                Manage user accounts safely and efficiently for any web or mobile application.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FiMail className="text-emerald-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-white text-sm mb-1">Email & Password Login</h3>
                    <p className="text-zinc-500 text-xs">Standard, secure login using email and a hashed password.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaGoogle className="text-emerald-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-white text-sm mb-1">Social Logins (OAuth)</h3>
                    <p className="text-zinc-500 text-xs">Sign up and log in via Google, GitHub, etc.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiLink className="text-emerald-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-white text-sm mb-1">Magic Links</h3>
                    <p className="text-zinc-500 text-xs">Passwordless login with a secure, one-time link via email.</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
                Core Features
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Email & Password',
                  'Social Logins (OAuth)',
                  'Magic Links',
                  'Secure Password Reset',
                  'Email Verification',
                  'Role-Based Access',
                  'MFA Support',
                  'User Profile Management'
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <FiCheck className="text-emerald-500 flex-shrink-0" />
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
            transition={{ delay: 0.3 }}
            className="bg-zinc-950 border border-zinc-900 p-6"
          >
            <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
              Technical Implementation
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                  Technology Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Next.js', 'Supabase Auth', 'Auth0', 'Firebase Auth', 'JWT', 'OAuth 2.0'].map((tech) => (
                    <span key={tech} className="text-[10px] uppercase font-bold text-zinc-500 border border-zinc-800 px-2 py-1 bg-zinc-900">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                  Integration Process
                </h3>
                <ul className="space-y-2 text-zinc-400 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-zinc-600">-</span>
                    Configuration of auth providers
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-zinc-600">-</span>
                    Implementation of login/signup flows
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-zinc-600">-</span>
                    Secure handling of user sessions
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-zinc-600">-</span>
                    Testing of all auth flows
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Column 3: Pricing & Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-zinc-950 border border-zinc-900 p-6 space-y-6"
          >
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
                Pricing Details
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                  <span className="text-zinc-500 text-sm">Base Authentication</span>
                  <span className="font-bold text-white">£400</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                  <span className="text-zinc-500 text-sm">Social Logins (ea)</span>
                  <span className="font-bold text-white">£100</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                  <span className="text-zinc-500 text-sm">Magic Links / MFA</span>
                  <span className="font-bold text-white">£150</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-white">Total Range</span>
                  <span className="font-bold text-emerald-500">£400-800</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
                Delivery Timeline
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 mt-2"></div>
                  <div>
                    <div className="text-sm font-bold text-white">Week 1</div>
                    <div className="text-xs text-zinc-500">Core setup & email/password login</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 mt-2"></div>
                  <div>
                    <div className="text-sm font-bold text-white">Week 2</div>
                    <div className="text-xs text-zinc-500">Social logins & advanced features</div>
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
