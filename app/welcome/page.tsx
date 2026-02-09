'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiGrid, FiCode, FiZap, FiBook, FiUsers, FiTool, FiDollarSign,
  FiPackage, FiSettings, FiTrendingUp, FiShoppingCart, FiFileText,
  FiMusic, FiVideo, FiCpu, FiGlobe, FiLayers, FiDatabase, FiSmartphone
} from 'react-icons/fi';

const sitePages = [
  {
    category: 'Core Services',
    pages: [
      { name: 'Agents', path: '/agents', icon: FiCpu, description: 'AI agents and automation' },
      { name: 'Apps', path: '/apps', icon: FiSmartphone, description: 'Mobile and web applications' },
      { name: 'Automation', path: '/automation', icon: FiZap, description: 'Workflow automation solutions' },
      { name: 'Client Portal', path: '/client', icon: FiUsers, description: 'Client project management' },
      { name: 'Components', path: '/components', icon: FiLayers, description: 'Reusable UI components' },
    ]
  },
  {
    category: 'Content & Media',
    pages: [
      { name: 'Blog', path: '/blog', icon: FiBook, description: 'Articles and insights' },
      { name: 'Content', path: '/content', icon: FiFileText, description: 'Content creation services' },
      { name: 'Creative', path: '/creative', icon: FiVideo, description: 'Creative design services' },
      { name: 'Music', path: '/music', icon: FiMusic, description: 'Music and audio production' },
      { name: 'Studio', path: '/studio', icon: FiVideo, description: 'Video editing studio' },
    ]
  },
  {
    category: 'Business & Finance',
    pages: [
      { name: 'Boardrooms', path: '/boardrooms', icon: FiUsers, description: 'Token-gated governance' },
      { name: 'Exchange', path: '/exchange', icon: FiTrendingUp, description: 'Token trading platform' },
      { name: 'Investors', path: '/investors', icon: FiDollarSign, description: 'Investment opportunities' },
      { name: 'Market', path: '/market', icon: FiShoppingCart, description: 'Marketplace' },
      { name: 'Mint', path: '/mint', icon: FiPackage, description: 'Token minting' },
      { name: 'Pricing', path: '/pricing', icon: FiDollarSign, description: 'Service pricing' },
    ]
  },
  {
    category: 'Development & Tech',
    pages: [
      { name: 'Build', path: '/build', icon: FiCode, description: 'Project builder' },
      { name: 'Portfolio', path: '/portfolio', icon: FiGrid, description: 'Project showcase' },
      { name: 'Schematics', path: '/schematics', icon: FiDatabase, description: 'System architecture' },
      { name: 'Services', path: '/services', icon: FiSettings, description: 'All services' },
      { name: 'Skills', path: '/skills', icon: FiCode, description: 'Technical capabilities' },
      { name: 'Smart Contracts', path: '/smart-contracts', icon: FiDatabase, description: 'Blockchain development' },
    ]
  },
  {
    category: 'Tools & Utilities',
    pages: [
      { name: 'Tools', path: '/tools', icon: FiTool, description: 'Developer tools' },
      { name: 'Auto-Book', path: '/tools/auto-book', icon: FiBook, description: 'AI book generator' },
      { name: 'TX Broadcaster', path: '/tx-broadcaster', icon: FiZap, description: 'BSV transaction broadcaster' },
      { name: 'Video Generator', path: '/video/editor/generator', icon: FiVideo, description: 'AI video creation' },
      { name: 'Video Studio', path: '/video/editor/studio', icon: FiVideo, description: 'Professional video editor' },
    ]
  },
  {
    category: 'Token Ecosystem',
    pages: [
      { name: 'Tokens', path: '/tokens', icon: FiPackage, description: 'Token directory' },
      { name: '$BOASE', path: '/boase', icon: FiPackage, description: 'Main platform token' },
      { name: 'Websites', path: '/websites', icon: FiGlobe, description: 'Website portfolio' },
    ]
  }
];

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="px-4 md:px-8 py-20 md:py-32 border-b border-gray-800">
        <motion.div
          className="max-w-6xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight">
            WELCOME TO B0ASE
          </h1>
          <div className="w-24 h-1 bg-white mx-auto mb-8"></div>
          <p className="text-xl md:text-2xl text-gray-400 mb-4 max-w-3xl mx-auto">
            Venture Studio Building Companies from Concept to Exit
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Web development, blockchain integration, AI agents, and digital products
          </p>
        </motion.div>
      </section>

      {/* Site Directory */}
      <section className="px-4 md:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            SITE DIRECTORY
          </h2>

          <div className="space-y-16">
            {sitePages.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
              >
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 border-b border-gray-800 pb-2">
                  {category.category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.pages.map((page, pageIndex) => (
                    <Link
                      key={page.path}
                      href={page.path}
                      className="group"
                    >
                      <motion.div
                        className="border border-gray-800 p-6 hover:border-gray-600 transition-all bg-black hover:bg-gray-900"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (categoryIndex * 0.1) + (pageIndex * 0.05) }}
                        whileHover={{ y: -4 }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="bg-gray-900 p-3 group-hover:bg-white group-hover:text-black transition-colors">
                            <page.icon className="text-xl" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-bold mb-1 group-hover:text-white transition-colors">
                              {page.name}
                            </h4>
                            <p className="text-sm text-gray-500 group-hover:text-gray-400">
                              {page.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="px-4 md:px-8 py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
              <div className="text-sm text-gray-500 uppercase tracking-wider">Projects</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">30+</div>
              <div className="text-sm text-gray-500 uppercase tracking-wider">Pages</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">15+</div>
              <div className="text-sm text-gray-500 uppercase tracking-wider">Services</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
              <div className="text-sm text-gray-500 uppercase tracking-wider">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 md:px-8 py-16 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Build Something Amazing?
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Let's turn your vision into reality with cutting-edge technology and expert execution.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/clients"
              className="bg-white text-black px-8 py-4 font-bold hover:bg-gray-200 transition-all"
            >
              BECOME A CLIENT
            </Link>
            <Link
              href="/portfolio"
              className="border border-white px-8 py-4 font-bold hover:bg-white hover:text-black transition-all"
            >
              VIEW PORTFOLIO
            </Link>
            <Link
              href="/pricing"
              className="border border-gray-600 px-8 py-4 font-bold hover:border-white transition-all"
            >
              SEE PRICING
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
