'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CVSummary from '@/components/boase/CVSummary';
import InvestmentTerminal from '@/components/boase/InvestmentTerminal';
import ShareholderValue from '@/components/boase/ShareholderValue';
import BitcoinSvCard from '@/components/token/BitcoinSvCard';
import SolanaCard from '@/components/token/SolanaCard';
import EthereumCard from '@/components/token/EthereumCard';
import CapTable from '@/components/token/CapTable';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowRight, FiInfo } from 'react-icons/fi';
import { UserCheck, Coins, ArrowUpRight } from 'lucide-react';

interface CapTableEntry {
  holder: string;
  displayName?: string;
  tokens: number;
  percentage: number;
  category: 'treasury' | 'founder' | 'investor' | 'team' | 'public';
}

export default function BoasePage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [capTable, setCapTable] = useState<CapTableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCapTable() {
      try {
        const res = await fetch('/api/treasury?action=captable');
        const data = await res.json();
        if (data.capTable) {
          setCapTable(data.capTable);
        }
      } catch (error) {
        console.error('Failed to fetch cap table:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCapTable();

    // Force scroll to top on mount and after short delays to counteract auto-focus jumps
    window.scrollTo(0, 0);
    const timers = [
      setTimeout(() => window.scrollTo(0, 0), 100),
      setTimeout(() => window.scrollTo(0, 0), 500),
      setTimeout(() => window.scrollTo(0, 0), 1000)
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleInvest = async (packageId: string, amount: number) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/buttons/click/route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buttonSlug: `boase-ipo-${packageId}`,
          amount: amount,
        }),
      });

      const data = await response.json();

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        console.error('No payment URL received');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Investment error:', error);
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-black text-white relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.section
        className="px-4 md:px-8 py-8 md:py-16 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="w-full">
          {/* Standardized Studio Header - RE-ORDERED TO TOP */}
          <motion.div
            className="mb-12 border-b border-gray-800 pb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 mb-8">
              {/* Left Column: Title & Info */}
              <div className="flex flex-col justify-end">
                <div className="flex flex-col md:flex-row md:items-end gap-8 mb-8">
                  <div className="bg-gray-900 border border-gray-800 p-6 md:p-8 self-start shadow-2xl">
                    <Coins className="text-5xl md:text-7xl text-white" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-4">
                      <h1 className="text-5xl md:text-8xl font-black text-white leading-none tracking-tighter">
                        $BOASE
                      </h1>
                      <span className="text-gray-500 font-mono text-xs uppercase tracking-widest mb-2">
                        Studio Asset
                      </span>
                    </div>
                    <p className="text-xl md:text-2xl text-gray-400 font-light mt-2 tracking-tight">
                      Strategic Alignment with the B0ase Studio Network
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-gray-900/40 border border-gray-800/50 p-6 backdrop-blur-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Economic Status</span>
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-sm font-bold text-white uppercase tracking-wider">Live Trading Enabled</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Supply</span>
                    <span className="text-sm font-bold text-white font-mono">1,000,000,000 $BOASE</span>
                  </div>
                  <div className="flex flex-col gap-1 md:w-1/3">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contract (BSV21)</span>
                    <code className="text-[10px] bg-black/60 p-2 rounded border border-gray-800 break-all select-all text-gray-400">
                      c3bf2d7a4519ddc633bc91bbfd1022db1a77da71e16bb582b0acc0d8f7836161_1
                    </code>
                  </div>
                  <a
                    href="https://1sat.market/market/bsv21/c3bf2d7a4519ddc633bc91bbfd1022db1a77da71e16bb582b0acc0d8f7836161_1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white !text-black font-bold py-3 px-6 text-sm uppercase tracking-widest hover:bg-gray-200 transition-all transform hover:scale-[1.02]"
                  >
                    Trade on 1Sat <FiArrowRight size={16} />
                  </a>
                </div>
              </div>

              {/* Right Column: Market Iframe */}
              <div className="h-full min-h-[400px] border border-gray-800 bg-black/40 rounded-sm shadow-2xl relative">
                <div className="absolute -top-3 -left-3 bg-gray-900 border border-gray-800 px-3 py-1 text-[8px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                  Network Diagnostics
                </div>
                {/* 
                  NOTE: The iframe is temporarily commented out or hidden by user request in previous steps if it causes issues,
                  but here we place it as requested. If it causes jump, we rely on the user knowing "Just let it jump".
                */}
                <iframe
                  src="https://1sat.market/market/bsv21/c3bf2d7a4519ddc633bc91bbfd1022db1a77da71e16bb582b0acc0d8f7836161_1"
                  title="$BOASE Live Price Chart"
                  className="w-full h-full min-h-[400px] bg-black"
                  frameBorder="0"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          </motion.div>

          {/* Main Content Areas: Profile & Terminal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-20">
            {/* Left: The Asset (CV) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="border border-gray-800 bg-gray-900/10 p-4 md:p-6"
            >
              <div className="mb-6 flex items-center gap-3 text-gray-500 font-mono text-[10px] uppercase tracking-widest">
                <FiInfo size={12} /> Asset Profile & Objective
              </div>
              <CVSummary />
            </motion.div>

            {/* Right: The Cap Table (Distribution) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="border border-gray-800 bg-gray-900/10 p-4 md:p-6"
            >
              <div className="mb-6 flex items-center gap-3 text-gray-500 font-mono text-[10px] uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live Distribution Logic
              </div>
              {loading ? (
                <div className="p-20 border border-gray-800 text-center text-gray-500 uppercase tracking-widest text-xs">
                  Accessing Treasury Data...
                </div>
              ) : (
                <CapTable
                  entries={capTable}
                  tokenSymbol="BOASE"
                  totalSupply={1_000_000_000}
                />
              )}
            </motion.div>
          </div>

          {/* Value Capture Matrix - Full Width */}
          <div className="mt-32 space-y-8">
            <div className="bg-gray-900/30 border-l-4 border-blue-500 p-8">
              <h2 className="text-2xl font-bold mb-4 uppercase tracking-tighter text-white">
                The Value Capture Matrix
              </h2>
              <p className="text-gray-400 leading-relaxed text-lg">
                $BOASE is not just a token; it's a programmatic stake in the comprehensive B0ase portfolio. It captures value from every corner of our studio's operations, providing holders with broad exposure to AI, Web3, and digital design innovation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 border border-gray-800 bg-gray-900/20 backdrop-blur-sm">
                <h3 className="text-sm font-bold text-green-500 uppercase tracking-widest mb-4">Dividend Yield</h3>
                <p className="text-sm text-gray-400 leading-loose">
                  Holders receive regular distributions derived from client services, service platform earnings, and strategic ecosystem profits.
                </p>
              </div>
              <div className="p-6 border border-gray-800 bg-gray-900/20 backdrop-blur-sm">
                <h3 className="text-sm font-bold text-purple-500 uppercase tracking-widest mb-4">Index Class</h3>
                <p className="text-sm text-gray-400 leading-loose">
                  Diversified exposure across our entire technology stack: from AI automation tools to high-end blockchain interfaces.
                </p>
              </div>
            </div>
          </div>

          {/* Strategic Allocation Section */}
          <div className="mt-32 pt-20 border-t border-gray-800">
            <div className="flex items-center gap-4 mb-12">
              <h2 className="text-4xl font-bold tracking-tighter text-white">STRATEGIC ALLOCATION</h2>
              <div className="h-px flex-1 bg-gray-900" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
              <div className="xl:col-span-2">
                <div className="border border-gray-800 bg-gray-900/10 p-4 md:p-6">
                  <div className="mb-6 flex items-center gap-3 text-gray-500 font-mono text-[10px] uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Strategic Allocation Portal
                  </div>
                  <InvestmentTerminal onInvest={handleInvest} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-8 border border-gray-800 bg-gray-900/40">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Utility Pipeline</h3>
                  <ul className="space-y-6 mb-8">
                    {[
                      { title: 'Governance', desc: 'Vote on R&D prioritization.' },
                      { title: 'Priority Access', desc: 'Early beta access to new studio tools.' },
                      { title: 'Service Credits', desc: 'Holders receive preferential studio rates.' },
                      { title: 'Future Equity', desc: 'Programmatic conversion to equity shares.' }
                    ].map((item, i) => (
                      <li key={i} className="flex gap-4">
                        <span className="text-gray-600 font-mono text-xs">0{i + 1}</span>
                        <div>
                          <p className="text-xs font-bold text-white uppercase tracking-wider mb-1">{item.title}</p>
                          <p className="text-xs text-gray-500 uppercase leading-relaxed">{item.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/dividends"
                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 hover:text-white transition-colors border-t border-gray-800 pt-6 w-full"
                  >
                    View Irrigation Model <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Shareholder Value Model */}
          <div className="mt-32 pt-20 border-t border-gray-800">
            <div className="flex items-center gap-4 mb-12">
              <h2 className="text-4xl font-bold tracking-tighter text-white">ECOSYSTEM ECONOMICS</h2>
              <div className="h-px flex-1 bg-gray-900" />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <ShareholderValue />
            </motion.div>
          </div>

          {/* Network Footprint */}
          <div className="mt-32 space-y-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white tracking-tighter uppercase mb-4">Network Footprint</h2>
              <p className="text-gray-500 uppercase text-[10px] tracking-[0.4em]">Multi-Chain Availability</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { component: BitcoinSvCard, network: 'Bitcoin SV', desc: 'Primary Ledger' },
                { component: SolanaCard, network: 'Solana', desc: 'High Velocity' },
                { component: EthereumCard, network: 'Ethereum', desc: 'Enterprise Bridge' }
              ].map((item, i) => (
                <div key={i} className="group relative">
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl rounded-full" />
                  <item.component />
                </div>
              ))}
            </div>
          </div>

          {/* Footer / Risk Section */}
          <div className="mt-32 p-12 border border-red-900/30 bg-red-950/10 backdrop-blur-md">
            <div className="flex items-start gap-6 max-w-4xl mx-auto">
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center border border-red-500/50 rounded-full text-red-500 font-black">!</div>
              <div>
                <h3 className="text-sm font-bold text-red-500 uppercase tracking-[0.2em] mb-4">Risk Disclosure & Compliance</h3>
                <p className="text-[10px] text-red-300/60 leading-loose uppercase tracking-widest">
                  $BOASE is a utility asset representing governance and diagnostic access to the studio ecosystem. High risk is fundamental to the digital frontier. Past performance involves caffeine, shipping cycles, and late nights—none of which guarantee future results. Proceed with strategic intent.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
            <p className="text-xs font-bold text-white uppercase tracking-[0.4em] animate-pulse">
              INITIALIZING PAYMENT CHANNEL...
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
