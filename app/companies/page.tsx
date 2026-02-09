'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Building2, Coins, Users, ExternalLink } from 'lucide-react';

const companies = [
  {
    name: 'The Bitcoin Corporation',
    slug: 'bitcoin-corporation',
    description: 'Building the infrastructure for Bitcoin-native applications. Bitcoin OS, bApps Store, Exchange, Wallet, and 25+ productivity apps.',
    logo: '/bitcoin.png',
    color: '#FFA500',
    stats: {
      apps: '25+',
      tokens: '25+',
      status: 'Active'
    },
    externalUrl: 'https://bitcoin-corp.vercel.app'
  },
  {
    name: 'Ninja Punk Girls',
    slug: 'ninjapunkgirls',
    description: 'Digital art collective and NFT brand featuring cyberpunk ninja aesthetics. Art, merchandise, and community-driven creative projects.',
    logo: '/images/clientprojects/ninjapunkgirls-com/NPG-logo.png',
    color: '#FF1493',
    stats: {
      collections: '3',
      community: '1K+',
      status: 'Active'
    },
    externalUrl: 'https://ninjapunkgirls.com'
  }
];

export default function CompaniesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="relative z-10 pb-12 md:pb-16">
        {/* Hero Section */}
        <section className="px-4 md:px-8 py-16">
          <motion.div
            className="mb-12 border-b border-zinc-800 pb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row md:items-end gap-6 mb-6">
              <div className="bg-zinc-900/50 p-4 md:p-6 border border-zinc-800 self-start">
                <Building2 className="text-4xl md:text-6xl text-white" size={48} />
              </div>
              <div className="flex items-end gap-4">
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                  COMPANIES
                </h1>
                <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                  PORTFOLIO
                </div>
              </div>
            </div>

            <p className="text-zinc-400 max-w-2xl mb-6">
              Our portfolio of companies building the future of digital ownership,
              decentralized applications, and creative content on the blockchain.
            </p>
          </motion.div>
        </section>

        {/* Companies Grid */}
        <section className="px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {companies.map((company, index) => (
              <motion.div
                key={company.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={`/companies/${company.slug}`}
                  className="block border border-zinc-800 hover:border-zinc-600 transition-all duration-300 group"
                >
                  <div className="p-6 md:p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div
                        className="w-16 h-16 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${company.color}20` }}
                      >
                        {company.logo.includes('.png') || company.logo.includes('.jpg') ? (
                          <img src={company.logo} alt={company.name} className="w-10 h-10 object-contain" />
                        ) : (
                          <Coins className="w-8 h-8" style={{ color: company.color }} />
                        )}
                      </div>
                      <span
                        className="px-3 py-1 text-xs font-mono uppercase"
                        style={{ backgroundColor: `${company.color}20`, color: company.color }}
                      >
                        {company.stats.status}
                      </span>
                    </div>

                    {/* Title */}
                    <h2
                      className="text-2xl md:text-3xl font-bold mb-3 group-hover:opacity-80 transition-opacity"
                      style={{ color: company.color }}
                    >
                      {company.name}
                    </h2>

                    {/* Description */}
                    <p className="text-zinc-400 mb-6 leading-relaxed">
                      {company.description}
                    </p>

                    {/* Stats */}
                    <div className="flex gap-6 mb-6">
                      {Object.entries(company.stats).filter(([key]) => key !== 'status').map(([key, value]) => (
                        <div key={key}>
                          <div className="text-xl font-bold" style={{ color: company.color }}>{value}</div>
                          <div className="text-xs text-zinc-500 uppercase">{key}</div>
                        </div>
                      ))}
                    </div>

                    {/* Links */}
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                      <span className="text-sm text-zinc-500 group-hover:text-white transition-colors">
                        View Details →
                      </span>
                      <a
                        href={company.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-zinc-500 hover:text-white transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={14} />
                        Website
                      </a>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 md:px-8 mt-16">
          <div className="border border-zinc-800 p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold mb-2">Interested in partnering?</h3>
                <p className="text-zinc-400">We're always looking for innovative projects to collaborate with.</p>
              </div>
              <Link
                href="/contact"
                className="px-6 py-3 bg-white text-black hover:bg-zinc-200 transition-colors text-sm font-bold uppercase"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
