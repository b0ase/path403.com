'use client';

import React, { useState, useEffect } from 'react';
import { portfolioData } from '@/lib/data';
import { getTokenPricing } from '@/lib/token-pricing';
import { FaGithub, FaSort, FaSortUp, FaSortDown, FaTwitter, FaTelegram } from 'react-icons/fa';
import { FiArrowRight, FiGlobe, FiBriefcase } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PortfolioMoneyButton from '@/components/portfolio/PortfolioMoneyButton';

type SortField = 'title' | 'token' | 'price' | 'supply' | 'circulation' | 'marketCap' | 'volume' | 'status';
type SortDirection = 'asc' | 'desc';

export default function PortfolioPage() {
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [highlightedToken, setHighlightedToken] = useState<string | null>(null);

  // All portfolio projects (excluding $BOASE which is shown separately as the index token)
  const allProjects = portfolioData.projects.filter(p => p.tokenName !== '$BOASE');

  // Handle URL anchors for direct token navigation
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const element = document.getElementById(hash);
      if (element) {
        // Highlight the token temporarily
        setHighlightedToken(hash);
        setTimeout(() => setHighlightedToken(null), 3000); // Remove highlight after 3 seconds

        // Smooth scroll to element at top of page
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, []);

  // Listen for hash changes (if user clicks another token link while on page)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const element = document.getElementById(hash);
        if (element) {
          setHighlightedToken(hash);
          setTimeout(() => setHighlightedToken(null), 3000);
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Helper function to generate financial data for each project using global token pricing
  const getFinancialData = (project: any, index: number) => {
    if (!project.tokenName) return null;

    const tokenPricing = getTokenPricing(project.tokenName);
    if (!tokenPricing) return null;

    return {
      price: tokenPricing.priceFormatted,
      priceGBP: tokenPricing.priceFormattedGBP,
      supply: tokenPricing.supply,
      circulation: tokenPricing.circulation,
      marketCap: tokenPricing.marketCap,
      marketCapGBP: tokenPricing.marketCapGBP,
      volume: tokenPricing.volume,
      volumeGBP: tokenPricing.volumeGBP,
      priceValue: tokenPricing.price,
      supplyValue: tokenPricing.supplyValue,
      circulationValue: tokenPricing.circulationValue,
      marketCapValue: tokenPricing.marketCapValue,
      volumeValue: tokenPricing.volumeValue,
      isReal: tokenPricing.isReal
    };
  };

  // $BOASE index token data
  const boaseIndexData = {
    id: 0,
    title: 'b0ase.com',
    description: 'Venture studio building companies from concept to exit. Web development, blockchain, AI agents, and digital products.',
    tokenName: '$BOASE',
    status: 'Live',
    githubUrl: 'https://github.com/b0ase',
    liveUrl: 'https://1sat.market/market/bsv21/c3bf2d7a4519ddc633bc91bbfd1022db1a77da71e16bb582b0acc0d8f7836161_1',
    tokenMarketUrl: 'https://1sat.market/bsv21/boase',
    slug: 'boase-index'
  };

  // Get BOASE financial data from global pricing system
  const boaseTokenPricing = getTokenPricing('$BOASE');
  const boaseFinancialData = boaseTokenPricing ? {
    price: boaseTokenPricing.priceFormatted,
    priceGBP: boaseTokenPricing.priceFormattedGBP,
    supply: boaseTokenPricing.supply,
    circulation: boaseTokenPricing.circulation,
    marketCap: boaseTokenPricing.marketCap,
    marketCapGBP: boaseTokenPricing.marketCapGBP,
    volume: boaseTokenPricing.volume,
    volumeGBP: boaseTokenPricing.volumeGBP,
    priceValue: boaseTokenPricing.price,
    supplyValue: boaseTokenPricing.supplyValue,
    circulationValue: boaseTokenPricing.circulationValue,
    marketCapValue: boaseTokenPricing.marketCapValue,
    volumeValue: boaseTokenPricing.volumeValue
  } : {
    // Fallback values
    price: '$0.0125',
    priceGBP: '£0.0099',
    supply: '1,000M',
    circulation: '85%',
    marketCap: '$310k',
    marketCapGBP: '£245k',
    volume: '$2,450',
    volumeGBP: '£1,936',
    priceValue: 0.0125,
    supplyValue: 1000000000,
    circulationValue: 85,
    marketCapValue: 310000,
    volumeValue: 2450
  };

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

  // Sort projects - live tokens always at top, then by selected field
  const sortedProjects = [...allProjects].sort((a, b) => {
    const aData = getFinancialData(a, 0);
    const bData = getFinancialData(b, 0);

    // Live tokens always cluster at the top
    const aIsLive = aData?.isReal ? 1 : 0;
    const bIsLive = bData?.isReal ? 1 : 0;
    if (aIsLive !== bIsLive) {
      return bIsLive - aIsLive; // Live tokens first
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
        aValue = aData?.priceValue || 0;
        bValue = bData?.priceValue || 0;
        break;
      case 'supply':
        aValue = aData?.supplyValue || 0;
        bValue = bData?.supplyValue || 0;
        break;
      case 'circulation':
        aValue = aData?.circulationValue || 0;
        bValue = bData?.circulationValue || 0;
        break;
      case 'marketCap':
        aValue = aData?.marketCapValue || 0;
        bValue = bData?.marketCapValue || 0;
        break;
      case 'volume':
        aValue = aData?.volumeValue || 0;
        bValue = bData?.volumeValue || 0;
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
      data-theme="dark"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <style jsx global>{`
        tr[id] {
          scroll-margin-top: 20px;
        }
      `}</style>


      {/* Main Content */}
      <motion.section
        className="px-4 md:px-8 py-16 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="w-full">
          {/* Standardized Header */}
          <motion.div
            className="mb-12 border-b border-zinc-900 pb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="flex flex-col md:flex-row md:items-end gap-8 mb-8">
              <div className="bg-zinc-900/50 p-6 border border-zinc-800 self-start">
                <FiBriefcase className="text-4xl md:text-6xl text-zinc-500" />
              </div>
              <div className="flex items-end gap-6">
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter uppercase">
                  PORTFOLIO_MANIFEST
                </h1>
                <div className="text-[10px] text-zinc-600 mb-2 font-mono uppercase tracking-[0.3em] font-bold">
                  ACTIVE_HOLDINGS
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <p className="text-zinc-400 max-w-2xl text-sm uppercase tracking-tight leading-relaxed">
                b0ase.com's institutional portfolio of entities and protocols. Browse {allProjects.length} strategic holdings,
                analyze tokenomics, and establish positions alongside b0ase.com.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all font-mono whitespace-nowrap"
              >
                ESTABLISH_POSITION <FiArrowRight size={12} />
              </Link>
            </div>
          </motion.div>

          <div className="w-full">
            {/* Disclaimer */}
            <div className="mb-8 p-4 border border-gray-800 bg-gray-900/30 text-xs text-gray-500">
              <strong className="text-gray-400">Disclaimer:</strong> Tokens are sold as-is without any guarantees of return.
              Only tokens marked as "Live" are currently minted and tradeable. Others can be minted on demand.
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-20">
                  <tr className="border-b border-zinc-900 bg-black">
                    <th className="px-4 py-4 text-left text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-mono">
                      {/* MONEY_BUTTON_NODE */}
                    </th>
                    <th
                      className="px-4 py-4 text-left text-[10px] font-bold text-zinc-600 uppercase tracking-widest cursor-pointer hover:text-white transition-colors font-mono"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center gap-2">
                        PROTO_PROJECT
                        {getSortIcon('title')}
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-mono">MANIFEST_DESC</th>
                    <th
                      className="px-4 py-4 text-left text-[10px] font-bold text-zinc-600 uppercase tracking-widest cursor-pointer hover:text-white transition-colors font-mono"
                      onClick={() => handleSort('token')}
                    >
                      <div className="flex items-center gap-2">
                        TOKEN_ID
                        {getSortIcon('token')}
                      </div>
                    </th>
                    <th
                      className="px-4 py-4 text-left text-[10px] font-bold text-zinc-600 uppercase tracking-widest cursor-pointer hover:text-white transition-colors font-mono"
                      onClick={() => handleSort('price')}
                    >
                      <div className="flex items-center gap-2">
                        UNIT_VALUATION
                        {getSortIcon('price')}
                      </div>
                    </th>
                    <th
                      className="px-4 py-4 text-left text-[10px] font-bold text-zinc-600 uppercase tracking-widest cursor-pointer hover:text-white transition-colors font-mono"
                      onClick={() => handleSort('supply')}
                    >
                      <div className="flex items-center gap-2">
                        EMISSIONS
                        {getSortIcon('supply')}
                      </div>
                    </th>
                    <th
                      className="px-4 py-4 text-left text-[10px] font-bold text-zinc-600 uppercase tracking-widest cursor-pointer hover:text-white transition-colors font-mono"
                      onClick={() => handleSort('circulation')}
                    >
                      <div className="flex items-center gap-2">
                        UTILIZATION
                        {getSortIcon('circulation')}
                      </div>
                    </th>
                    <th
                      className="px-4 py-4 text-left text-[10px] font-bold text-zinc-600 uppercase tracking-widest cursor-pointer hover:text-white transition-colors font-mono"
                      onClick={() => handleSort('marketCap')}
                    >
                      <div className="flex items-center gap-2">
                        MARKET_CAP
                        {getSortIcon('marketCap')}
                      </div>
                    </th>
                    <th
                      className="px-4 py-4 text-left text-[10px] font-bold text-zinc-600 uppercase tracking-widest cursor-pointer hover:text-white transition-colors font-mono"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-2">
                        STATUS_ID
                        {getSortIcon('status')}
                      </div>
                    </th>
                    <th className="px-4 py-4 text-center text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-mono">
                      <FiGlobe size={10} className="inline" />
                    </th>
                    <th className="px-4 py-4 text-center text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-mono">
                      <FaTwitter size={10} className="inline" />
                    </th>
                    <th className="px-4 py-4 text-left text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-mono">OPERATIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {/* $BOASE Index Token - Always at the top and sticky */}
                  <tr id="boase" className={`sticky top-[58px] z-10 hover:bg-zinc-900/30 bg-zinc-900/10 border-l border-zinc-500 transition-all duration-1000 ${highlightedToken === 'boase' ? 'ring-1 ring-zinc-500 bg-zinc-900/40' : ''}`}>
                    <td className="px-4 py-6">
                      <PortfolioMoneyButton
                        project={boaseIndexData as any}
                        index={0}
                        isDark={true}
                        size="md"
                      />
                    </td>
                    <td className="px-4 py-6">
                      <div className="flex flex-col">
                        <div className="font-bold text-white mb-1 uppercase tracking-tight text-sm">
                          <a
                            href={boaseIndexData.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-zinc-300 transition-colors"
                          >
                            {boaseIndexData.title}
                          </a>
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">
                          1SAT_DATA_LAYER
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-6 text-[11px] text-zinc-400 max-w-sm uppercase tracking-tight leading-tight">{boaseIndexData.description}</td>
                    <td className="px-4 py-6">
                      <a
                        href={boaseIndexData.tokenMarketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 border border-zinc-800 bg-zinc-900/50 text-zinc-200 font-mono text-[10px] font-bold uppercase tracking-widest hover:border-zinc-600 transition-all"
                      >
                        {boaseIndexData.tokenName}
                      </a>
                    </td>
                    <td className="px-4 py-6 text-sm font-bold font-mono">
                      <span className="text-green-500">{boaseFinancialData.price}</span>
                    </td>
                    <td className="px-4 py-6 text-sm font-bold font-mono text-zinc-300">
                      1,000M
                    </td>
                    <td className="px-4 py-6 text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-widest">
                      {boaseFinancialData.circulation}
                    </td>
                    <td className="px-4 py-6 text-sm font-bold font-mono text-amber-500">
                      {boaseFinancialData.marketCap}
                    </td>
                    <td className="px-4 py-6">
                      <span className="inline-block border border-green-900 bg-green-950/20 px-2 py-1 text-[9px] font-bold text-green-500 uppercase tracking-widest font-mono">
                        STATUS_LIVE
                      </span>
                    </td>
                    <td className="px-4 py-6 text-center">
                      <a href="https://b0ase.com" target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-white transition-colors">
                        <FiGlobe size={14} className="inline" />
                      </a>
                    </td>
                    <td className="px-4 py-6 text-center">
                      <a href="https://twitter.com/b0ase" target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-white transition-colors">
                        <FaTwitter size={14} className="inline" />
                      </a>
                    </td>
                    <td className="px-4 py-6">
                      <a
                        href={boaseIndexData.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all font-mono"
                      >
                        TRADE_PROTOCOL
                      </a>
                    </td>
                  </tr>

                  {/* Portfolio Projects - Sorted */}
                  {sortedProjects.map((project, index) => {
                    const financialData = getFinancialData(project, index);

                    return (
                      <tr
                        key={project.id}
                        id={project.tokenName ? project.tokenName.replace('$', '').toLowerCase() : `project-${project.id}`}
                        className={`hover:bg-zinc-900/30 transition-all duration-500 border-b border-zinc-900/50 ${highlightedToken === (project.tokenName ? project.tokenName.replace('$', '').toLowerCase() : `project-${project.id}`)
                          ? 'bg-zinc-900/40'
                          : ''
                          }`}
                      >
                        <td className="px-4 py-6">
                          <PortfolioMoneyButton
                            project={project}
                            index={index + 1}
                            isDark={true}
                            size="md"
                          />
                        </td>
                        <td className="px-4 py-6">
                          <div className="flex flex-col">
                            <div className="font-bold text-white mb-1 uppercase tracking-tight text-sm">
                              {project.liveUrl ? (
                                <a
                                  href={project.liveUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-zinc-300 transition-colors"
                                >
                                  {project.title}
                                </a>
                              ) : (
                                project.title
                              )}
                            </div>
                            {project.liveUrl && (
                              <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-tighter">
                                {project.liveUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-6 text-[11px] text-zinc-400 max-w-sm uppercase tracking-tight leading-tight">{project.description}</td>
                        <td className="px-4 py-6">
                          {project.tokenName ? (
                            <span className="px-2 py-1 border border-zinc-900/50 bg-zinc-900/20 text-zinc-500 font-mono text-[10px] uppercase tracking-widest font-bold">
                              {project.tokenName}
                            </span>
                          ) : (
                            <span className="text-zinc-800 font-mono text-[10px]">---</span>
                          )}
                        </td>
                        <td className="px-4 py-6 font-mono text-sm">
                          {financialData?.isReal ? (
                            <span className="text-green-500 font-bold">{financialData.price}</span>
                          ) : <span className="text-zinc-700 text-[10px] font-mono uppercase tracking-widest">PRIVATE_VAL</span>}
                        </td>
                        <td className="px-4 py-6 font-mono text-sm text-zinc-400">
                          {financialData?.isReal ? '1,000M' : <span className="text-zinc-700 text-[10px] font-mono uppercase tracking-widest">PRIVATE_EM</span>}
                        </td>
                        <td className="px-4 py-6 font-mono text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                          {financialData?.isReal ? financialData.circulation : <span className="text-zinc-700 font-mono tracking-widest">---</span>}
                        </td>
                        <td className="px-4 py-6 font-mono text-sm">
                          {financialData?.isReal ? (
                            <span className="text-amber-500 font-bold">{financialData.marketCap}</span>
                          ) : <span className="text-zinc-700 text-[10px] font-mono uppercase tracking-widest">PRIVATE_MC</span>}
                        </td>
                        <td className="px-4 py-6">
                          {financialData?.isReal ? (
                            <span className="inline-block border border-green-900/50 bg-green-950/20 px-2 py-1 text-[9px] font-bold text-green-500 uppercase tracking-widest font-mono">
                              STATUS_LIVE
                            </span>
                          ) : project.tokenName ? (
                            <span className="inline-block border border-zinc-900 bg-zinc-900/50 px-2 py-1 text-[9px] font-bold text-zinc-600 uppercase tracking-widest font-mono">
                              MINT_PENDING
                            </span>
                          ) : (
                            <span className={`inline-block border px-2 py-1 text-[9px] font-bold uppercase tracking-widest font-mono ${project.status === 'active' || project.status === 'Live'
                              ? 'border-green-900/50 bg-green-950/20 text-green-500'
                              : 'border-amber-900/50 bg-amber-950/20 text-amber-600'
                              }`}>
                              {project.status === 'active' ? 'STATUS_ACTIVE' : project.status.toUpperCase()}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-6 text-center">
                          {project.liveUrl ? (
                            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-white transition-colors">
                              <FiGlobe size={14} className="inline" />
                            </a>
                          ) : (
                            <span className="text-zinc-800">-</span>
                          )}
                        </td>
                        <td className="px-4 py-6 text-center">
                          {(project as any).twitterUrl ? (
                            <a href={(project as any).twitterUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-white transition-colors">
                              <FaTwitter size={14} className="inline" />
                            </a>
                          ) : (
                            <span className="text-zinc-800">-</span>
                          )}
                        </td>
                        <td className="px-4 py-6">
                          {financialData?.isReal ? (
                            <a
                              href={`https://1sat.market/bsv21/${project.tokenName?.replace('$', '').toLowerCase()}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all font-mono"
                            >
                              TRADE_PROTOCOL
                            </a>
                          ) : project.tokenName ? (
                            <button
                              className="px-4 py-2 border border-zinc-900 text-zinc-700 text-[10px] font-bold uppercase tracking-widest cursor-not-allowed font-mono"
                              title="Coming soon"
                            >
                              MINT_RESOURCE
                            </button>
                          ) : (
                            <Link
                              href={`/portfolio/${project.slug}`}
                              className="px-4 py-2 border border-zinc-800 text-zinc-300 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-900 transition-all font-mono"
                            >
                              VIEW_MANIFEST
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* CTA */}
            <div className="mt-12 border border-zinc-900 bg-zinc-900/20 p-12">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-12">
                <div>
                  <h3 className="text-2xl font-bold uppercase tracking-tight mb-4">
                    INITIALIZE_INVESTMENT_PHASE
                  </h3>
                  <p className="text-zinc-500 text-sm uppercase tracking-tight leading-relaxed max-w-xl">
                    Participate in targeted protocol growth or establish a diversified position across the entire b0ase.com index via $BOASE emissions.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
                  <Link
                    href="/market"
                    className="px-8 py-4 border border-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-900 transition-all font-mono text-center"
                  >
                    BROWSE_SECONDARY_MARKET
                  </Link>
                  <Link
                    href="/contact"
                    className="px-8 py-4 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all font-mono text-center"
                  >
                    ESTABLISH_CONTACT_TUNNEL <FiArrowRight size={12} />
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