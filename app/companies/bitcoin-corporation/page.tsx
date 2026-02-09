'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ExternalLink, Monitor, Package, ArrowUpDown, Wallet, Brain, DollarSign,
  Mail, FileText, HardDrive, Briefcase, Music, Video, MessageCircle, Map,
  Code, Palette, Camera, Calendar, Search, Radio, Globe, Gamepad2, Users,
  Bot, Box, Brush, GraduationCap, Database, Coins, Building2, BookOpen
} from 'lucide-react';

// Main products
const mainProducts = [
  {
    name: 'Bitcoin OS',
    description: 'Web-based operating system with built-in wallet, app store, and developer environment',
    icon: Monitor,
    url: 'https://bitcoin-os.vercel.app',
    token: '$bOS',
    status: 'Live',
    color: '#FFA500'
  },
  {
    name: 'Bitcoin Apps Store',
    description: 'App marketplace featuring productivity tools and Bitcoin-native applications',
    icon: Package,
    url: 'https://www.bitcoinapps.store',
    token: '$bApps',
    status: 'Live',
    color: '#FFA500'
  },
  {
    name: 'Bitcoin Exchange',
    description: 'Decentralized exchange for BSV tokens with instant settlement',
    icon: ArrowUpDown,
    url: 'https://bitcoin-exchange.vercel.app',
    token: '$bExchange',
    status: 'Live',
    color: '#26C6DA'
  },
  {
    name: 'Bitcoin Wallet',
    description: 'Next-generation wallet with token management and BiFi capabilities',
    icon: Wallet,
    url: 'https://bitcoin-wallet-sable.vercel.app',
    token: '$bWallet',
    status: 'Live',
    color: '#4CAF50'
  },
  {
    name: 'Senseii',
    description: 'AI-powered educational platform for building on-chain businesses',
    icon: Brain,
    url: 'https://bitcoin-corp.vercel.app/senseii',
    token: '$SENSEII',
    status: 'Beta',
    color: '#9C27B0'
  },
  {
    name: 'Cashboard',
    description: 'On-chain business management with payments, invoicing, and financial tools',
    icon: DollarSign,
    url: 'https://bitcoin-corp.vercel.app/cashboard',
    token: '$CASH',
    status: 'Beta',
    color: '#FFC107'
  }
];

// All bApps
const bApps = [
  { name: 'Bitcoin Email', icon: Mail, url: 'https://bitcoin-email.vercel.app', token: '$bMail', category: 'Communication', color: '#E53935' },
  { name: 'Bitcoin Writer', icon: FileText, url: 'https://bitcoin-writer.vercel.app', token: '$bWriter', category: 'Productivity', color: '#FF6600' },
  { name: 'Bitcoin Drive', icon: HardDrive, url: 'https://bitcoin-drive.vercel.app', token: '$bDrive', category: 'Storage', color: '#00FF00' },
  { name: 'Bitcoin Jobs', icon: Briefcase, url: 'https://bitcoin-jobs.vercel.app', token: '$bJobs', category: 'Professional', color: '#00BCD4' },
  { name: 'Bitcoin Books', icon: BookOpen, url: 'https://bitcoin-books.vercel.app', token: '$bBooks', category: 'Publishing', color: '#8D6E63' },
  { name: 'Bitcoin Music', icon: Music, url: 'https://bitcoin-music.vercel.app', token: '$bMusic', category: 'Entertainment', color: '#E91E63' },
  { name: 'Bitcoin Video', icon: Video, url: 'https://bitcoin-video.vercel.app', token: '$bVideo', category: 'Entertainment', color: '#F44336' },
  { name: 'Bitcoin Chat', icon: MessageCircle, url: 'https://bitcoin-chat.vercel.app', token: '$bChat', category: 'Communication', color: '#1E5799' },
  { name: 'Bitcoin Maps', icon: Map, url: 'https://bitcoin-maps.vercel.app', token: '$bMaps', category: 'Utility', color: '#27AE60' },
  { name: 'Bitcoin Code', icon: Code, url: 'https://bitcoin-code.vercel.app', token: '$bCode', category: 'Developer', color: '#00FF00' },
  { name: 'Bitcoin Paint', icon: Palette, url: 'https://bitcoin-paint.vercel.app', token: '$bPaint', category: 'Creative', color: '#E91E63' },
  { name: 'Bitcoin Photos', icon: Camera, url: 'https://bitcoin-photos.vercel.app', token: '$bPhotos', category: 'Media', color: '#E91E63' },
  { name: 'Bitcoin Calendar', icon: Calendar, url: 'https://bitcoin-calendar.vercel.app', token: '$bCalendar', category: 'Productivity', color: '#9C27B0' },
  { name: 'Bitcoin Search', icon: Search, url: 'https://bitcoin-search.vercel.app', token: '$bSearch', category: 'Utility', color: '#2196F3' },
  { name: 'Bitcoin Radio', icon: Radio, url: 'https://bitcoin-radio.vercel.app', token: '$bRadio', category: 'Entertainment', color: '#E74C3C' },
  { name: 'Bitcoin Browser', icon: Globe, url: 'https://bitcoin-browser.vercel.app', token: '$bBrowser', category: 'System', color: '#2196F3' },
  { name: 'Bitcoin Gaming', icon: Gamepad2, url: 'https://bitcoin-gaming.vercel.app', token: '$bGaming', category: 'Entertainment', color: '#FF5722' },
  { name: 'Bitcoin Social', icon: Users, url: 'https://bitcoin-social.vercel.app', token: '$bSocial', category: 'Social', color: '#F7931A' },
  { name: 'Bitcoin AI', icon: Bot, url: 'https://bitcoin-ai.vercel.app', token: '$bAI', category: 'AI', color: '#9C27B0' },
  { name: 'Bitcoin 3D', icon: Box, url: 'https://bitcoin-3d.vercel.app', token: '$b3D', category: 'Creative', color: '#FF1493' },
  { name: 'Bitcoin Art', icon: Brush, url: 'https://bitcoin-art.vercel.app', token: '$bArt', category: 'Creative', color: '#9B59B6' },
  { name: 'Bitcoin Education', icon: GraduationCap, url: 'https://bitcoin-education.vercel.app', token: '$bEdu', category: 'Learning', color: '#F1C40F' },
  { name: 'Bitcoin Sheets', icon: Database, url: 'https://bitcoin-spreadsheets.vercel.app', token: '$bSheets', category: 'Productivity', color: '#2196F3' },
  { name: 'Bitcoin Identity', icon: Users, url: 'https://bitcoin-identity.vercel.app', token: '$bID', category: 'Identity', color: '#1ABC9C' },
  { name: 'Bitcoin DNS', icon: Globe, url: 'https://bitcoin-dns.vercel.app', token: '$bDNS', category: 'Infrastructure', color: '#4CAF50' },
  { name: 'Bitcoin Marketplace', icon: Package, url: 'https://bitcoin-marketplace.vercel.app', token: '$bMarket', category: 'Commerce', color: '#FFC107' },
];

// Links to bitcoin-corp sections
const corpLinks = [
  { name: 'Main Site', url: 'https://bitcoin-corp.vercel.app', description: 'Corporate overview and investor information' },
  { name: 'bApps Store', url: 'https://bitcoin-corp.vercel.app/bapps', description: 'Browse all Bitcoin applications' },
  { name: 'Token Economy', url: 'https://bitcoin-corp.vercel.app/tokens', description: 'Token distribution and economics' },
  { name: 'Investors', url: 'https://bitcoin-corp.vercel.app/investors', description: 'Investment opportunities and documentation' },
  { name: 'Roadmap', url: 'https://bitcoin-corp.vercel.app/roadmap', description: 'Development timeline and milestones' },
  { name: 'Ecosystem', url: 'https://bitcoin-corp.vercel.app/ecosystem', description: 'Partner projects and integrations' },
];

export default function BitcoinCorporationPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="relative z-10 pb-12 md:pb-16">
        {/* Hero Section */}
        <section className="px-4 md:px-8 py-16">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
              <Link href="/companies" className="hover:text-white transition-colors">Companies</Link>
              <span>/</span>
              <span className="text-orange-500">The Bitcoin Corporation</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end gap-6 mb-6 border-b border-zinc-800 pb-8">
              <div className="bg-orange-500/10 p-4 md:p-6 border border-orange-500/30 self-start">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 4091.27 4091.73"
                  className="opacity-90"
                >
                  <path fill="#FFA500" fillRule="nonzero" d="M4030.06 2540.77c-273.24,1096.01 -1383.32,1763.02 -2479.46,1489.71 -1095.68,-273.24 -1762.69,-1383.39 -1489.33,-2479.31 273.12,-1096.13 1383.2,-1763.19 2479,-1489.95 1096.06,273.24 1763.03,1383.51 1489.76,2479.57l0.02 -0.02z"/>
                  <path fill="white" fillRule="nonzero" d="M2947.77 1754.38c40.72,-272.26 -166.56,-418.61 -450,-516.24l91.95 -368.8 -224.5 -55.94 -89.51 359.09c-59.02,-14.72 -119.63,-28.59 -179.87,-42.34l90.16 -361.46 -224.36 -55.94 -92 368.68c-48.84,-11.12 -96.81,-22.11 -143.35,-33.69l0.26 -1.16 -309.59 -77.31 -59.72 239.78c0,0 166.56,38.18 163.05,40.53 90.91,22.69 107.35,82.87 104.62,130.57l-104.74 420.15c6.26,1.59 14.38,3.89 23.34,7.49 -7.49,-1.86 -15.46,-3.89 -23.73,-5.87l-146.81 588.57c-11.11,27.62 -39.31,69.07 -102.87,53.33 2.25,3.26 -163.17,-40.72 -163.17,-40.72l-111.46 256.98 292.15 72.83c54.35,13.63 107.61,27.89 160.06,41.3l-92.9 373.03 224.24 55.94 92 -369.07c61.26,16.63 120.71,31.97 178.91,46.43l-91.69 367.33 224.51 55.94 92.89 -372.33c382.82,72.45 670.67,43.24 791.83,-303.02 97.63,-278.78 -4.86,-439.58 -206.26,-544.44 146.69,-33.83 257.18,-130.31 286.64,-329.61l-0.07 -0.05zm-512.93 719.26c-69.38,278.78 -538.76,128.08 -690.94,90.29l123.28 -494.2c152.17,37.99 640.17,113.17 567.67,403.91zm69.43 -723.3c-63.29,253.58 -453.96,124.75 -580.69,93.16l111.77 -448.21c126.73,31.59 534.85,90.55 468.94,355.05l-0.02 0z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-bold leading-none tracking-tighter mb-2">
                  The <span className="text-orange-500">Bitcoin</span> Corporation
                </h1>
                <p className="text-zinc-400 text-lg">
                  Building infrastructure for Bitcoin-native applications
                </p>
              </div>
            </div>

            <p className="text-zinc-400 max-w-3xl mb-8">
              The Bitcoin Corporation is developing a complete ecosystem of Bitcoin-native applications,
              from operating systems to productivity tools. Each app has its own token economy where
              contributors become owners, creating aligned incentives across the entire platform.
            </p>

            {/* Quick Links */}
            <div className="flex flex-wrap gap-3">
              {corpLinks.slice(0, 4).map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 border border-zinc-700 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all text-sm"
                >
                  <ExternalLink size={14} className="text-orange-500" />
                  {link.name}
                </a>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="px-4 md:px-8 mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Live Apps', value: '25+' },
              { label: 'App Tokens', value: '25+' },
              { label: 'Main Products', value: '6' },
              { label: 'Open Source', value: '100%' },
            ].map((stat) => (
              <div key={stat.label} className="border border-zinc-800 p-4 text-center">
                <div className="text-2xl md:text-3xl font-bold text-orange-500">{stat.value}</div>
                <div className="text-xs text-zinc-500 uppercase mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Main Products */}
        <section className="px-4 md:px-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Building2 className="text-orange-500" size={24} />
            Core Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mainProducts.map((product, index) => (
              <motion.a
                key={product.name}
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-zinc-800 p-6 hover:border-orange-500/30 transition-all group block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${product.color}20` }}>
                    <product.icon className="w-6 h-6" style={{ color: product.color }} />
                  </div>
                  <span className={`px-2 py-1 text-xs ${
                    product.status === 'Live' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {product.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-1 group-hover:text-orange-500 transition-colors">{product.name}</h3>
                <p className="text-xs text-orange-500/70 mb-2">{product.token}</p>
                <p className="text-sm text-zinc-400">{product.description}</p>
                <div className="mt-4 flex items-center gap-1 text-xs text-zinc-500 group-hover:text-orange-500 transition-colors">
                  Open <ExternalLink size={12} />
                </div>
              </motion.a>
            ))}
          </div>
        </section>

        {/* All bApps */}
        <section className="px-4 md:px-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Package className="text-orange-500" size={24} />
            Bitcoin Applications ({bApps.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {bApps.map((app, index) => (
              <motion.a
                key={app.name}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-zinc-800 p-4 hover:border-zinc-600 transition-all group block"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
              >
                <app.icon className="w-5 h-5 mb-2" style={{ color: app.color }} />
                <h3 className="text-sm font-medium mb-0.5 group-hover:text-orange-500 transition-colors truncate">
                  {app.name.replace('Bitcoin ', '')}
                </h3>
                <p className="text-[10px] text-zinc-500">{app.token}</p>
              </motion.a>
            ))}
          </div>
        </section>

        {/* Token Economy */}
        <section className="px-4 md:px-8 mb-12">
          <div className="border border-zinc-800 p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Coins className="text-orange-500" size={24} />
              Token Economy
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-3 text-orange-500">How It Works</h3>
                <p className="text-zinc-400 mb-4">
                  Every Bitcoin application has its own token. Contributors earn tokens for:
                </p>
                <ul className="space-y-2 text-zinc-400">
                  <li className="flex items-center gap-2">
                    <span className="text-orange-500">•</span> Code contributions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-500">•</span> Bug fixes and improvements
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-500">•</span> Documentation and content
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-500">•</span> Community building
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-3 text-orange-500">Token Utility</h3>
                <ul className="space-y-2 text-zinc-400">
                  <li className="flex items-center gap-2">
                    <span className="text-orange-500">•</span> Governance voting rights
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-500">•</span> Revenue sharing from app usage
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-500">•</span> Access to premium features
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-500">•</span> Trade on Bitcoin Exchange
                  </li>
                </ul>
                <a
                  href="https://bitcoin-corp.vercel.app/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-orange-500 hover:text-orange-400 transition-colors text-sm"
                >
                  View Token Details <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Corporate Links */}
        <section className="px-4 md:px-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Corporate Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {corpLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-zinc-800 p-4 hover:border-orange-500/30 transition-all group"
              >
                <h3 className="font-bold mb-1 group-hover:text-orange-500 transition-colors flex items-center gap-2">
                  {link.name}
                  <ExternalLink size={14} className="text-zinc-500" />
                </h3>
                <p className="text-sm text-zinc-400">{link.description}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Related on b0ase */}
        <section className="px-4 md:px-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Related on b0ase Portfolio</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/portfolio/bitcoin-os"
              className="border border-zinc-800 p-4 hover:border-orange-500/30 transition-all group"
            >
              <h3 className="font-bold mb-1 group-hover:text-orange-500 transition-colors">Bitcoin OS</h3>
              <p className="text-sm text-zinc-400">Operating system project details</p>
            </Link>
            <Link
              href="/portfolio/bitcoin-writer"
              className="border border-zinc-800 p-4 hover:border-orange-500/30 transition-all group"
            >
              <h3 className="font-bold mb-1 group-hover:text-orange-500 transition-colors">Bitcoin Writer</h3>
              <p className="text-sm text-zinc-400">Document editor project</p>
            </Link>
            <Link
              href="/portfolio/bitcoin-drive"
              className="border border-zinc-800 p-4 hover:border-orange-500/30 transition-all group"
            >
              <h3 className="font-bold mb-1 group-hover:text-orange-500 transition-colors">Bitcoin Drive</h3>
              <p className="text-sm text-zinc-400">Decentralized storage project</p>
            </Link>
          </div>
        </section>

        {/* Back Link */}
        <section className="px-4 md:px-8">
          <Link
            href="/companies"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
          >
            ← Back to Companies
          </Link>
        </section>
      </main>
    </div>
  );
}
