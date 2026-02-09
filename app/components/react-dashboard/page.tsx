'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCheck, FiGrid, FiTable, FiUsers } from 'react-icons/fi';

export default function ReactDashboardModule() {
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
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-start gap-6 mb-6">
            <div className="bg-zinc-900/50 p-4 md:p-6 border border-zinc-800">
              <FiGrid className="text-3xl md:text-4xl text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mb-2">Admin Interface</p>
              <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter mb-4">
                React Admin Dashboard
              </h1>
              <p className="text-zinc-400 max-w-2xl">
                Professional admin interface with charts, data tables, and user management.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl md:text-3xl font-bold text-white mb-4">
                £500-800
              </div>
              <Link href="/contact" className="bg-white text-black hover:bg-zinc-200 px-6 py-2 text-xs uppercase font-bold tracking-wider inline-block">
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
            className="bg-zinc-950 border border-zinc-900 p-6 space-y-8"
          >
            <section>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
                What You Get
              </h2>
              <p className="text-zinc-400 text-sm mb-6">
                A comprehensive admin dashboard to manage your application, from user management to analytics, all in a clean, professional interface.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FiGrid className="text-white mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-white text-sm uppercase">Interactive Charts</h3>
                    <p className="text-zinc-500 text-xs">Beautiful, interactive charts for data visualization.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiTable className="text-white mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-white text-sm uppercase">Data Tables</h3>
                    <p className="text-zinc-500 text-xs">Advanced tables with sorting, filtering, and pagination.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiUsers className="text-white mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-white text-sm uppercase">User Management</h3>
                    <p className="text-zinc-500 text-xs">Complete system with roles and permissions.</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
                Core Features
              </h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  'Responsive Design', 'Dark/Light Theme', 'Interactive Charts',
                  'Advanced Data Tables', 'User Management', 'Role-Based Access',
                  'Search & Filter', 'Export Data'
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <FiCheck className="text-emerald-500 text-xs flex-shrink-0" />
                    <span className="text-zinc-400 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>

          {/* Column 2: Tech & Components */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-zinc-950 border border-zinc-900 p-6"
          >
            <section>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
                Technical Implementation
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                    Technology Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['React 18', 'TypeScript', 'Tailwind CSS', 'Chart.js', 'React Query', 'Zustand'].map((tech) => (
                      <span key={tech} className="text-[10px] uppercase font-bold text-zinc-500 border border-zinc-800 px-2 py-1 bg-zinc-900">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                    Reusable Components
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['Data Table', 'Chart', 'Modal', 'Form Builder', 'Card', 'Navigation'].map((component) => (
                      <span key={component} className="text-[10px] uppercase font-bold text-zinc-500 border border-zinc-800 px-2 py-1 bg-zinc-900">
                        {component}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </motion.div>

          {/* Column 3: Pricing & Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-zinc-950 border border-zinc-900 p-6 space-y-8"
          >
            <section>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
                Pricing Details
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                  <span className="text-zinc-500">Basic Dashboard</span>
                  <span className="font-bold text-white">£500</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                  <span className="text-zinc-500">User Management</span>
                  <span className="font-bold text-white">£150</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                  <span className="text-zinc-500">Advanced Charts</span>
                  <span className="font-bold text-white">£150</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-white uppercase">Total Range</span>
                  <span className="font-bold text-white text-lg">£500-800</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
                Delivery Timeline
              </h2>
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-white"></div>
                  <div>
                    <div className="font-bold text-white uppercase">Week 1</div>
                    <div className="text-xs text-zinc-500">Component setup and layout</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-white"></div>
                  <div>
                    <div className="font-bold text-white uppercase">Week 2</div>
                    <div className="text-xs text-zinc-500">Data integration and features</div>
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
