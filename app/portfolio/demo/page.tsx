'use client';

import React, { useState } from 'react';
import { FaGithub, FaSort, FaSortUp, FaSortDown, FaTwitter, FaTelegram } from 'react-icons/fa';
import { FiArrowRight, FiGlobe, FiBriefcase, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';

type SortField = 'title' | 'token' | 'price' | 'supply' | 'circulation' | 'marketCap' | 'volume' | 'status';
type SortDirection = 'asc' | 'desc';

// Demo projects with mock financial data
const DEMO_PROJECTS = [
  {
    id: 1,
    title: 'TokenLaunch Pro',
    slug: 'tokenlaunch-pro',
    description: 'Automated token launch platform with smart contract deployment and liquidity management.',
    tokenName: '$TLP',
    status: 'Live',
    liveUrl: 'https://tokenlaunchpro.io',
    twitterUrl: 'https://twitter.com/tokenlaunchpro',
    telegramUrl: 'https://t.me/tokenlaunchpro',
    financial: {
      price: '$0.0847',
      priceGBP: '£0.0672',
      priceValue: 0.0847,
      supply: '500M',
      supplyValue: 500000000,
      circulation: '62%',
      circulationValue: 62,
      marketCap: '$26.3M',
      marketCapGBP: '£20.8M',
      marketCapValue: 26300000,
      volume: '$1.2M',
      volumeGBP: '£950k',
      volumeValue: 1200000,
      isReal: true,
    },
  },
  {
    id: 2,
    title: 'ChainVault',
    slug: 'chainvault',
    description: 'Decentralized asset custody solution with multi-sig and institutional-grade security.',
    tokenName: '$VAULT',
    status: 'Live',
    liveUrl: 'https://chainvault.finance',
    twitterUrl: 'https://twitter.com/chainvault',
    financial: {
      price: '$0.2340',
      priceGBP: '£0.1856',
      priceValue: 0.234,
      supply: '100M',
      supplyValue: 100000000,
      circulation: '45%',
      circulationValue: 45,
      marketCap: '$10.5M',
      marketCapGBP: '£8.3M',
      marketCapValue: 10500000,
      volume: '$892k',
      volumeGBP: '£707k',
      volumeValue: 892000,
      isReal: true,
    },
  },
  {
    id: 3,
    title: 'NFT Marketplace X',
    slug: 'nft-marketplace-x',
    description: 'Next-gen NFT marketplace with AI-powered curation and cross-chain support.',
    tokenName: '$NFTX',
    status: 'Live',
    liveUrl: 'https://nftmarketplacex.com',
    twitterUrl: 'https://twitter.com/nftmarketplacex',
    telegramUrl: 'https://t.me/nftmarketplacex',
    financial: {
      price: '$0.0156',
      priceGBP: '£0.0124',
      priceValue: 0.0156,
      supply: '1,000M',
      supplyValue: 1000000000,
      circulation: '78%',
      circulationValue: 78,
      marketCap: '$12.2M',
      marketCapGBP: '£9.7M',
      marketCapValue: 12200000,
      volume: '$456k',
      volumeGBP: '£361k',
      volumeValue: 456000,
      isReal: true,
    },
  },
  {
    id: 4,
    title: 'DeFi Yield Hub',
    slug: 'defi-yield-hub',
    description: 'Automated yield optimization across multiple DeFi protocols with risk management.',
    tokenName: '$YIELD',
    status: 'Live',
    liveUrl: 'https://defiyieldhub.io',
    financial: {
      price: '$1.2450',
      priceGBP: '£0.9872',
      priceValue: 1.245,
      supply: '50M',
      supplyValue: 50000000,
      circulation: '34%',
      circulationValue: 34,
      marketCap: '$21.2M',
      marketCapGBP: '£16.8M',
      marketCapValue: 21200000,
      volume: '$2.1M',
      volumeGBP: '£1.7M',
      volumeValue: 2100000,
      isReal: true,
    },
  },
  {
    id: 5,
    title: 'Social Trading App',
    slug: 'social-trading-app',
    description: 'Copy-trading platform connecting retail investors with verified professional traders.',
    tokenName: '$SOCIAL',
    status: 'Development',
    liveUrl: null,
    twitterUrl: 'https://twitter.com/socialtradeapp',
    financial: {
      price: null,
      priceGBP: null,
      priceValue: 0,
      supply: '200M',
      supplyValue: 200000000,
      circulation: '0%',
      circulationValue: 0,
      marketCap: null,
      marketCapGBP: null,
      marketCapValue: 0,
      volume: null,
      volumeGBP: null,
      volumeValue: 0,
      isReal: false,
    },
  },
  {
    id: 6,
    title: 'DAO Governance Suite',
    slug: 'dao-governance-suite',
    description: 'Complete governance toolkit for DAOs with voting, treasury management, and proposals.',
    tokenName: '$DGOV',
    status: 'Development',
    liveUrl: null,
    financial: {
      price: null,
      priceGBP: null,
      priceValue: 0,
      supply: '100M',
      supplyValue: 100000000,
      circulation: '0%',
      circulationValue: 0,
      marketCap: null,
      marketCapGBP: null,
      marketCapValue: 0,
      volume: null,
      volumeGBP: null,
      volumeValue: 0,
      isReal: false,
    },
  },
  {
    id: 7,
    title: 'AI Content Studio',
    slug: 'ai-content-studio',
    description: 'AI-powered content creation platform for marketing teams and creators.',
    tokenName: '$AICS',
    status: 'Live',
    liveUrl: 'https://aicontentstudio.ai',
    twitterUrl: 'https://twitter.com/aicontentstudio',
    financial: {
      price: '$0.0089',
      priceGBP: '£0.0071',
      priceValue: 0.0089,
      supply: '2,000M',
      supplyValue: 2000000000,
      circulation: '55%',
      circulationValue: 55,
      marketCap: '$9.8M',
      marketCapGBP: '£7.8M',
      marketCapValue: 9800000,
      volume: '$234k',
      volumeGBP: '£185k',
      volumeValue: 234000,
      isReal: true,
    },
  },
  {
    id: 8,
    title: 'Web3 Gaming Platform',
    slug: 'web3-gaming-platform',
    description: 'Play-to-earn gaming infrastructure with NFT integration and token rewards.',
    tokenName: '$W3GP',
    status: 'Beta',
    liveUrl: 'https://web3gaming.gg',
    financial: {
      price: '$0.0032',
      priceGBP: '£0.0025',
      priceValue: 0.0032,
      supply: '5,000M',
      supplyValue: 5000000000,
      circulation: '12%',
      circulationValue: 12,
      marketCap: '$1.9M',
      marketCapGBP: '£1.5M',
      marketCapValue: 1900000,
      volume: '$67k',
      volumeGBP: '£53k',
      volumeValue: 67000,
      isReal: true,
    },
  },
];

// Demo index token data
const DEMO_INDEX = {
  id: 0,
  title: 'Demo Portfolio Index',
  description: 'Sample venture studio portfolio showcasing tokenized projects and investments.',
  tokenName: '$DEMO',
  status: 'Live',
  liveUrl: '#',
  tokenMarketUrl: '#',
  slug: 'demo-index',
  financial: {
    price: '$0.0125',
    priceGBP: '£0.0099',
    priceValue: 0.0125,
    supply: '1,000M',
    supplyValue: 1000000000,
    circulation: '85%',
    circulationValue: 85,
    marketCap: '$10.6M',
    marketCapGBP: '£8.4M',
    marketCapValue: 10600000,
    volume: '$2,450',
    volumeGBP: '£1,936',
    volumeValue: 2450,
  },
};

export default function DemoPortfolioPage() {
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Sort function
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <FaSort className="ml-1 text-gray-500" size={12} />;
    return sortDirection === 'asc' ?
      <FaSortUp className="ml-1 text-gray-400" size={12} /> :
      <FaSortDown className="ml-1 text-gray-400" size={12} />;
  };

  // Sort projects - live tokens always at top
  const sortedProjects = [...DEMO_PROJECTS].sort((a, b) => {
    const aIsLive = a.financial.isReal ? 1 : 0;
    const bIsLive = b.financial.isReal ? 1 : 0;
    if (aIsLive !== bIsLive) {
      return bIsLive - aIsLive;
    }

    let aValue: any, bValue: any;

    switch (sortField) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'token':
        aValue = a.tokenName || '';
        bValue = b.tokenName || '';
        break;
      case 'price':
        aValue = a.financial.priceValue || 0;
        bValue = b.financial.priceValue || 0;
        break;
      case 'supply':
        aValue = a.financial.supplyValue || 0;
        bValue = b.financial.supplyValue || 0;
        break;
      case 'circulation':
        aValue = a.financial.circulationValue || 0;
        bValue = b.financial.circulationValue || 0;
        break;
      case 'marketCap':
        aValue = a.financial.marketCapValue || 0;
        bValue = b.financial.marketCapValue || 0;
        break;
      case 'volume':
        aValue = a.financial.volumeValue || 0;
        bValue = b.financial.volumeValue || 0;
        break;
      case 'status':
        aValue = a.status.toLowerCase();
        bValue = b.status.toLowerCase();
        break;
      default:
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  return (
    <motion.div
      className="min-h-screen bg-black text-white relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Main Content */}
      <motion.section
        className="px-4 md:px-8 py-16 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="w-full">
          {/* Back Link */}
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
          >
            <FiArrowLeft />
            <span>Back to Portfolio</span>
          </Link>

          {/* Standardized Header */}
          <motion.div
            className="mb-12 border-b border-gray-800 pb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
              <div className="bg-gray-900/50 p-4 md:p-6 border border-gray-800 self-start">
                <FiBriefcase className="text-4xl md:text-6xl text-white" />
              </div>
              <div className="flex items-end gap-4">
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                  PORTFOLIO DEMO
                </h1>
                <div className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-widest">
                  SAMPLE DATA
                </div>
              </div>
            </div>

            {/* Marketing Pitch */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <p className="text-gray-400 max-w-2xl">
                Sample portfolio demonstrating how token holdings and investments are displayed.
                All data shown is fictional for demonstration purposes.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                Get Your Portfolio <FiArrowRight size={14} />
              </Link>
            </div>
          </motion.div>

          <div className="w-full">
            {/* Demo Notice */}
            <div className="mb-8 p-4 border border-yellow-700/50 bg-yellow-900/20 text-sm">
              <strong className="text-yellow-400">Demo Mode:</strong>{' '}
              <span className="text-gray-400">
                This page shows sample data. Connect your database and configure API keys to see real portfolio data.
              </span>
            </div>

            {/* Disclaimer */}
            <div className="mb-8 p-4 border border-gray-800 bg-gray-900/30 text-xs text-gray-500">
              <strong className="text-gray-400">Disclaimer:</strong> Tokens are sold as-is without any guarantees of return.
              Only tokens marked as "Live" are currently minted and tradeable. Others can be minted on demand.
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-20">
                  <tr className="border-b border-gray-800">
                    <th
                      className="px-4 py-3 text-left text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center">
                        Project
                        {getSortIcon('title')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Description</th>
                    <th
                      className="px-4 py-3 text-left text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('token')}
                    >
                      <div className="flex items-center">
                        Token
                        {getSortIcon('token')}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('price')}
                    >
                      <div className="flex items-center">
                        Price
                        {getSortIcon('price')}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('supply')}
                    >
                      <div className="flex items-center">
                        Supply
                        {getSortIcon('supply')}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('circulation')}
                    >
                      <div className="flex items-center">
                        In Circulation
                        {getSortIcon('circulation')}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('marketCap')}
                    >
                      <div className="flex items-center">
                        Market Cap
                        {getSortIcon('marketCap')}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('volume')}
                    >
                      <div className="flex items-center">
                        Volume
                        {getSortIcon('volume')}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        Status
                        {getSortIcon('status')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">
                      <FiGlobe size={14} className="inline" title="Website" />
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">
                      <FaTwitter size={14} className="inline" title="Twitter" />
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">
                      <FaTelegram size={14} className="inline" title="Telegram" />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {/* Index Token - Always at top */}
                  <tr className="sticky top-[48px] z-10 hover:bg-gray-900/50 bg-gradient-to-r from-gray-900/20 to-gray-800/20 border-l-4 border-gray-500">
                    <td className="px-4 py-4 text-sm">
                      <div className="flex flex-col">
                        <div className="font-bold text-gray-300 mb-1">{DEMO_INDEX.title}</div>
                        <div className="text-xs text-gray-400 font-mono">Index Token</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-300 max-w-md">{DEMO_INDEX.description}</td>
                    <td className="px-4 py-4 text-sm">
                      <span className="px-2 py-1 bg-white/10 text-white font-semibold">
                        {DEMO_INDEX.tokenName}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold">
                      <span className="text-green-400">{DEMO_INDEX.financial.price}</span>
                      <span className="text-gray-500 text-xs ml-1">/ {DEMO_INDEX.financial.priceGBP}</span>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold">{DEMO_INDEX.financial.supply}</td>
                    <td className="px-4 py-4 text-sm text-gray-400 font-semibold">{DEMO_INDEX.financial.circulation}</td>
                    <td className="px-4 py-4 text-sm font-semibold">
                      <span className="text-yellow-400">{DEMO_INDEX.financial.marketCap}</span>
                      <span className="text-gray-500 text-xs ml-1">/ {DEMO_INDEX.financial.marketCapGBP}</span>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold">
                      <span>{DEMO_INDEX.financial.volume}</span>
                      <span className="text-gray-500 text-xs ml-1">/ {DEMO_INDEX.financial.volumeGBP}</span>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className="px-2 py-1 text-xs bg-green-900/50 text-green-300 font-semibold">
                        {DEMO_INDEX.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-center">
                      <span className="text-gray-400">
                        <FiGlobe size={16} className="inline" />
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-center">
                      <span className="text-gray-700">-</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-center">
                      <span className="text-gray-700">-</span>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <button className="px-3 py-1 bg-white text-black text-xs hover:bg-gray-200 transition-colors font-semibold">
                        Trade
                      </button>
                    </td>
                  </tr>

                  {/* Portfolio Projects */}
                  {sortedProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-900/50">
                      <td className="px-4 py-4 text-sm">
                        <div className="flex flex-col">
                          <div className="font-medium text-white mb-1">
                            {project.liveUrl ? (
                              <a
                                href={project.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-gray-300 transition-colors"
                              >
                                {project.title}
                              </a>
                            ) : (
                              project.title
                            )}
                          </div>
                          {project.liveUrl && (
                            <div className="text-xs text-gray-400 font-mono">
                              {project.liveUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-400 max-w-md">{project.description}</td>
                      <td className="px-4 py-4 text-sm">
                        <span className="px-2 py-1 bg-gray-900/50 text-gray-300">
                          {project.tokenName}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {project.financial.isReal ? (
                          <>
                            <span className="text-green-400">{project.financial.price}</span>
                            <span className="text-gray-500 text-xs ml-1">/ {project.financial.priceGBP}</span>
                          </>
                        ) : <span className="text-gray-500 text-xs">Private</span>}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {project.financial.isReal ? project.financial.supply : <span className="text-gray-500 text-xs">Private</span>}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-400">
                        {project.financial.isReal ? project.financial.circulation : <span className="text-gray-500 text-xs">Private</span>}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {project.financial.isReal ? (
                          <>
                            <span className="text-yellow-400">{project.financial.marketCap}</span>
                            <span className="text-gray-500 text-xs ml-1">/ {project.financial.marketCapGBP}</span>
                          </>
                        ) : <span className="text-gray-500 text-xs">Private</span>}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {project.financial.isReal ? (
                          <>
                            <span>{project.financial.volume}</span>
                            <span className="text-gray-500 text-xs ml-1">/ {project.financial.volumeGBP}</span>
                          </>
                        ) : <span className="text-gray-500 text-xs">Private</span>}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {project.financial.isReal ? (
                          <span className="px-2 py-1 text-xs bg-green-900/50 text-green-300">
                            Live
                          </span>
                        ) : (
                          <span className={`px-2 py-1 text-xs ${
                            project.status === 'Development'
                              ? 'bg-yellow-900/50 text-yellow-300'
                              : project.status === 'Beta'
                              ? 'bg-blue-900/50 text-blue-300'
                              : 'bg-gray-800 text-gray-400'
                          }`}>
                            {project.status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-center">
                        {project.liveUrl ? (
                          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                            <FiGlobe size={16} className="inline" />
                          </a>
                        ) : (
                          <span className="text-gray-700">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-center">
                        {project.twitterUrl ? (
                          <a href={project.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                            <FaTwitter size={16} className="inline" />
                          </a>
                        ) : (
                          <span className="text-gray-700">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-center">
                        {project.telegramUrl ? (
                          <a href={project.telegramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                            <FaTelegram size={16} className="inline" />
                          </a>
                        ) : (
                          <span className="text-gray-700">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {project.financial.isReal ? (
                          <button className="px-3 py-1 bg-white text-black text-xs hover:bg-gray-200 transition-colors font-semibold">
                            Trade
                          </button>
                        ) : (
                          <button className="px-3 py-1 bg-gray-800 text-gray-300 text-xs hover:bg-gray-700 transition-colors">
                            Mint
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CTA */}
            <div className="mt-12 border border-gray-800 p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-white">
                    Want your own portfolio page?
                  </h3>
                  <p className="text-gray-400">
                    Get a custom portfolio page to showcase your investments and tokenized projects.
                  </p>
                </div>
                <div className="flex gap-4">
                  <Link
                    href="/portfolio"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-gray-800 text-white font-bold hover:border-gray-600 transition-colors whitespace-nowrap"
                  >
                    View Real Portfolio
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold hover:bg-gray-200 transition-colors whitespace-nowrap"
                  >
                    Contact <FiArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
