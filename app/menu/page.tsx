'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowRight, FiMenu } from 'react-icons/fi';

// All public-facing pages on b0ase.com
const MENU_ITEMS = [
  { href: '/', label: 'Home', description: 'Main landing page' },
  { href: '/agent', label: 'Agent', description: 'AI agent interface' },
  { href: '/agents', label: 'Agents', description: 'Browse AI agents' },
  { href: '/ai', label: 'AI', description: 'AI services overview' },
  { href: '/apps', label: 'Apps', description: 'Application gallery' },
  { href: '/automation', label: 'Automation', description: 'Automation services' },
  { href: '/blog', label: 'Blog', description: 'Articles and insights' },
  { href: '/boardroom', label: 'Boardroom', description: 'Executive hub' },
  { href: '/book-a-tutor', label: 'Book a Tutor', description: 'Tutoring services' },
  { href: '/brand-kit', label: 'Brand Kit', description: 'Brand assets' },
  { href: '/build', label: 'Build', description: 'Build with us' },
  { href: '/buttons', label: 'Buttons', description: 'MoneyButtons gallery' },
  { href: '/bwriter', label: 'bWriter', description: 'Bitcoin Writer platform' },
  { href: '/careers', label: 'Careers', description: 'Job opportunities' },
  { href: '/cashboard', label: 'Cashboard', description: 'Financial dashboard' },
  { href: '/clients', label: 'Clients', description: 'Client portal' },
  { href: '/companies', label: 'Companies', description: 'Company directory' },
  { href: '/contact', label: 'Contact', description: 'Get in touch' },
  { href: '/content-samples', label: 'Content Samples', description: 'Sample content' },
  { href: '/contracts', label: 'Contracts', description: 'Contract templates' },
  { href: '/courses', label: 'Courses', description: 'Learning materials' },
  { href: '/creative', label: 'Creative', description: 'Creative services' },
  { href: '/creators', label: 'Creators', description: 'Creator hub' },
  { href: '/cv', label: 'CV', description: 'Resume/CV page' },
  { href: '/developers', label: 'Developers', description: 'Developer marketplace' },
  { href: '/dividends', label: 'Dividends', description: 'Dividend information' },
  { href: '/docs', label: 'Docs', description: 'Documentation' },
  { href: '/downloads', label: 'Downloads', description: 'Downloadable assets' },
  { href: '/exchange', label: 'Exchange', description: 'Token exchange' },
  { href: '/featured', label: 'Featured', description: 'Featured content' },
  { href: '/founders', label: 'Founders', description: 'Founder resources' },
  { href: '/gigs', label: 'Gigs', description: 'Available gigs' },
  { href: '/incubator-packages', label: 'Incubator Packages', description: 'Startup packages' },
  { href: '/invest', label: 'Invest', description: 'Investment opportunities' },
  { href: '/investors', label: 'Investors', description: 'Investor portal' },
  { href: '/kintsugi', label: 'Kintsugi', description: 'Kintsugi startup builder' },
  { href: '/login', label: 'Login', description: 'Sign in to your account' },
  { href: '/map', label: 'Map', description: 'Site map visualization' },
  { href: '/market', label: 'Market', description: 'Token marketplace' },
  { href: '/metanet', label: 'Metanet', description: 'Metanet explorer' },
  { href: '/mint', label: 'Mint', description: 'Token minting' },
  { href: '/moneybuttons', label: 'MoneyButtons', description: 'MoneyButton store' },
  { href: '/music', label: 'Music', description: 'Music player' },
  { href: '/offers', label: 'Offers', description: 'Current offers' },
  { href: '/packages', label: 'Packages', description: 'Service packages' },
  { href: '/pay', label: 'Pay', description: 'Payment portal' },
  { href: '/pipeline', label: 'Pipeline', description: 'Project pipeline' },
  { href: '/play', label: 'Play', description: 'Interactive playground' },
  { href: '/portfolio', label: 'Portfolio', description: 'Project portfolio' },
  { href: '/pricing', label: 'Pricing', description: 'Service pricing' },
  { href: '/privacy', label: 'Privacy', description: 'Privacy policy' },
  { href: '/problem', label: 'Problem', description: 'Problem we solve' },
  { href: '/projects', label: 'Projects', description: 'All projects' },
  { href: '/proposals', label: 'Proposals', description: 'Project proposals' },
  { href: '/rewards', label: 'Rewards', description: 'Rewards program' },
  { href: '/roadmap', label: 'Roadmap', description: 'Development roadmap' },
  { href: '/search', label: 'Search', description: 'Site search' },
  { href: '/services', label: 'Services', description: 'Our services' },
  { href: '/signup', label: 'Sign Up', description: 'Create account' },
  { href: '/site-index', label: 'Site Index', description: 'Full site index' },
  { href: '/skills', label: 'Skills', description: 'Skill categories' },
  { href: '/smart-contracts', label: 'Smart Contracts', description: 'Blockchain contracts' },
  { href: '/studio', label: 'Studio', description: 'Creative studio' },
  { href: '/styleguide', label: 'Styleguide', description: 'Design system' },
  { href: '/taas', label: 'TaaS', description: 'Tokenization as a Service' },
  { href: '/terms', label: 'Terms', description: 'Terms of service' },
  { href: '/token', label: 'Token', description: 'Token information' },
  { href: '/tokens', label: 'Tokens', description: 'Token directory' },
  { href: '/tools', label: 'Tools', description: 'Utility tools' },
  { href: '/tools/bit-sign', label: 'BitSign', description: 'Blockchain signatures' },
  { href: '/treasury', label: 'Treasury', description: 'Treasury management' },
  { href: '/trust', label: 'Trust', description: 'Trust framework' },
  { href: '/tutors', label: 'Tutors', description: 'Available tutors' },
  { href: '/tx-broadcaster', label: 'TX Broadcaster', description: 'Transaction broadcaster' },
  { href: '/video', label: 'Video', description: 'Video content' },
  { href: '/websites', label: 'Websites', description: 'Website services' },
  { href: '/welcome', label: 'Welcome', description: 'Welcome page' },
  { href: '/work', label: 'Work', description: 'Our work' },
].sort((a, b) => a.label.localeCompare(b.label));

export default function MenuPage() {
  return (
    <motion.div
      className="min-h-screen bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 border-b border-zinc-800 pb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <FiMenu className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Site Menu</h1>
              <p className="text-zinc-500 text-sm">All public pages on b0ase.com</p>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {MENU_ITEMS.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.01 }}
            >
              <Link
                href={item.href}
                className="group block p-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white group-hover:text-white">
                    {item.label}
                  </span>
                  <FiArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-white transition-colors" />
                </div>
                <span className="text-[11px] text-zinc-500 group-hover:text-zinc-400">
                  {item.description}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-zinc-800 text-center">
          <p className="text-zinc-600 text-xs">
            {MENU_ITEMS.length} pages indexed
          </p>
        </div>
      </div>
    </motion.div>
  );
}
