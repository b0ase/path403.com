'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCheck, FiSearch, FiFilter, FiZap } from 'react-icons/fi';

export default function SearchFunctionalityModule() {
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
              <FiSearch className="text-3xl md:text-4xl text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mb-2">Component Module</p>
              <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter mb-4">
                Search Functionality
              </h1>
              <p className="text-zinc-400 max-w-2xl">
                Implement powerful, fast, and relevant search for your users.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl md:text-3xl font-bold text-white mb-4">
                £300-600
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
            transition={{ delay: 0.2 }}
            className="bg-zinc-950 border border-zinc-900 p-6 space-y-8"
          >
            <section>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
                What You Get
              </h2>
              <p className="text-zinc-400 text-sm mb-6">
                Implement powerful, fast, and relevant search. From simple text search to advanced faceted search, we provide a tailored solution.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FiSearch className="text-emerald-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-white text-sm">Full-Text Search</h3>
                    <p className="text-zinc-500 text-xs">Search through all text content with high relevance.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiFilter className="text-emerald-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-white text-sm">Faceted Search</h3>
                    <p className="text-zinc-500 text-xs">Provide filters and facets to refine search results.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiZap className="text-emerald-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-white text-sm">Autocomplete</h3>
                    <p className="text-zinc-500 text-xs">Provide instant search suggestions as users type.</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
                Core Features
              </h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {[
                  'Full-Text Search', 'Faceted Search', 'Autocomplete', 'Typo Tolerance',
                  'Performance', 'Custom Ranking', 'Multi-language', 'Synonyms'
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <FiCheck className="text-emerald-500 text-xs flex-shrink-0" />
                    <span className="text-zinc-400 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>

          {/* Column 2: Tech & Integration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-950 border border-zinc-900 p-6"
          >
            <section>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
                Technical Implementation
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white mb-3">
                    Technology Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['Elasticsearch', 'Algolia', 'MeiliSearch', 'PostgreSQL'].map((tech) => (
                      <span key={tech} className="text-[10px] uppercase font-bold text-zinc-500 border border-zinc-800 px-2 py-1 bg-zinc-900">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-3">
                    Integration Process
                  </h3>
                  <ul className="space-y-2 text-sm text-zinc-400">
                    <li className="flex items-start gap-2">
                      <span className="text-zinc-600">01.</span>
                      <span>Selection and setup of the optimal search engine</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-zinc-600">02.</span>
                      <span>Data indexing and synchronization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-zinc-600">03.</span>
                      <span>Development of search API and UI</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-zinc-600">04.</span>
                      <span>Implementation of filters and facets</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </motion.div>

          {/* Column 3: Pricing & Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-zinc-950 border border-zinc-900 p-6 space-y-8"
          >
            <section>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
                Pricing Details
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                  <span className="text-zinc-500">Basic Search (Full-text)</span>
                  <span className="font-bold text-white">£300</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                  <span className="text-zinc-500">Faceted Search</span>
                  <span className="font-bold text-white">£150</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                  <span className="text-zinc-500">Autocomplete</span>
                  <span className="font-bold text-white">£150</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="font-bold text-white uppercase text-xs tracking-wider">Total Range</span>
                  <span className="font-bold text-white text-lg">£300-600</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
                Delivery Timeline
              </h2>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
                    01
                  </div>
                  <div>
                    <div className="font-bold text-white">Week 1</div>
                    <div className="text-xs text-zinc-500">Setup & data indexing</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
                    02
                  </div>
                  <div>
                    <div className="font-bold text-white">Weeks 2-3</div>
                    <div className="text-xs text-zinc-500">Frontend & advanced features</div>
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
