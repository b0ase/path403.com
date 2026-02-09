"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FiStar, FiTrendingUp, FiTrendingDown, FiSearch, FiFilter, FiCode, FiTerminal } from "react-icons/fi";
import { FaGithub } from "react-icons/fa";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";

// Developer token interface with market data
interface DeveloperToken {
  id: string;
  rank: number;
  username: string;
  ticker: string;
  avatar: string;
  price: number;
  change24h: number;
  change7d: number;
  volume24h: number;
  marketCap: number;
  circulatingSupply: number;
  totalSupply: number;
  sparkline: number[];
  verified: boolean;
  isDemo?: boolean; // True for example/demo data
  languages: string[];
}

// Generate deterministic mock data from username
function generateMockData(username: string, index: number): Omit<DeveloperToken, 'id' | 'rank'> {
  // Use username chars to seed "random" but consistent values
  const seed = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hash = (n: number) => ((seed * (n + 1) * 9301 + 49297) % 233280) / 233280;

  // Generate ticker from username (first 3-4 chars uppercase)
  const ticker = '$' + username.slice(0, Math.min(4, username.length)).toUpperCase();

  // Price between $0.001 and $500 (log scale for variety)
  const priceRange = hash(1);
  const price = priceRange < 0.3
    ? 0.001 + hash(2) * 0.999
    : priceRange < 0.6
      ? 1 + hash(3) * 49
      : priceRange < 0.9
        ? 50 + hash(4) * 150
        : 200 + hash(5) * 300;

  // 24h change between -25% and +40%
  const change24h = (hash(6) - 0.4) * 65;

  // 7d change between -40% and +80%
  const change7d = (hash(7) - 0.35) * 120;

  // Volume between $10k and $50M
  const volume24h = 10000 + hash(8) * 49990000;

  // Market cap between $100k and $500M
  const marketCap = 100000 + hash(9) * 499900000;

  // Supply
  const totalSupply = Math.floor(1000000 + hash(10) * 999000000);
  const circulatingSupply = Math.floor(totalSupply * (0.3 + hash(11) * 0.7));

  // Generate sparkline (7 days of relative price movement)
  const sparkline: number[] = [];
  let currentPrice = 100;
  for (let i = 0; i < 7; i++) {
    currentPrice = currentPrice * (0.92 + hash(12 + i) * 0.16);
    sparkline.push(currentPrice);
  }
  // Normalize to end at current relative position based on 7d change
  const sparklineEnd = 100 * (1 + change7d / 100);
  const sparklineScale = sparklineEnd / sparkline[sparkline.length - 1];
  const normalizedSparkline = sparkline.map(v => v * sparklineScale);

  // Languages based on hash
  const allLanguages = ['TypeScript', 'JavaScript', 'Python', 'Rust', 'Go', 'Solidity', 'C++', 'Java', 'Ruby', 'PHP'];
  const numLanguages = 1 + Math.floor(hash(20) * 4);
  const languages = allLanguages
    .sort(() => hash(21 + allLanguages.indexOf(allLanguages[0])) - 0.5)
    .slice(0, numLanguages);

  return {
    username,
    ticker,
    avatar: `https://github.com/${username}.png`,
    price,
    change24h,
    change7d,
    volume24h,
    marketCap,
    circulatingSupply,
    totalSupply,
    sparkline: normalizedSparkline,
    verified: false, // Demo data - only real authenticated developers can be verified
    isDemo: true, // Flag to identify demo/example data
    languages,
  };
}

// Format numbers with K, M, B suffixes
function formatNumber(num: number, decimals: number = 2): string {
  if (num >= 1e9) return (num / 1e9).toFixed(decimals) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(decimals) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(decimals) + 'K';
  return num.toFixed(decimals);
}

// Format price with appropriate decimals
function formatPrice(price: number): string {
  if (price < 0.01) return '$' + price.toFixed(6);
  if (price < 1) return '$' + price.toFixed(4);
  if (price < 100) return '$' + price.toFixed(2);
  return '$' + price.toFixed(0);
}

// Mini sparkline SVG component
function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-24 h-8" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? '#22c55e' : '#ef4444'}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default function DevelopersPage() {
  const [developers, setDevelopers] = useState<DeveloperToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'marketCap' | 'price' | 'change24h' | 'volume24h'>('marketCap');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchDevelopers() {
      try {
        const response = await fetch('/api/developers');
        let data: { id: string; username: string | null; full_name: string | null; github_verified?: boolean; is_marketplace_developer?: boolean; }[] = [];

        if (response.ok) {
          data = await response.json();
        }

        // Transform real developers (from database)
        const realTokenData: DeveloperToken[] = data
          .filter(dev => dev.username)
          .map((dev, index) => {
            const mockData = generateMockData(dev.username!, index);
            return {
              id: dev.id,
              rank: index + 1,
              ...mockData,
              verified: dev.github_verified || false, // Real verification from DB
              isDemo: false, // Real developer, not demo
            };
          });

        // Combine and sort
        const allTokenData = [...realTokenData]
          .sort((a, b) => b.marketCap - a.marketCap)
          .map((dev, index) => ({ ...dev, rank: index + 1 }));

        // Ensure @b0ase is in the list (manual addition if not in DB)
        if (!allTokenData.find(d => d.username.toLowerCase() === 'b0ase')) {
          const b0aseData = generateMockData('b0ase', 0);
          // Customize b0ase data slightly to be top tier
          const b0aseDev = {
            id: 'manual-b0ase',
            rank: 1,
            ...b0aseData,
            ticker: '$BOASE',
            verified: true,
            isDemo: false,
            price: 420.69,
            marketCap: 1000000000,
            change24h: 100,
            languages: ['TypeScript', 'Rust', 'Solidity', 'Bitcoin Script']
          };
          allTokenData.unshift(b0aseDev);
          // Re-rank
          allTokenData.forEach((d, i) => d.rank = i + 1);
        }

        setDevelopers(allTokenData);
      } catch (err: any) {
        setDevelopers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchDevelopers();
  }, []);

  // Filter and sort developers
  const filteredDevelopers = developers
    .filter(dev =>
      dev.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.ticker.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const multiplier = sortOrder === 'desc' ? -1 : 1;
      return multiplier * (a[sortBy] - b[sortBy]);
    });

  const toggleWatchlist = (id: string) => {
    setWatchlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm">LOADING_TOKENS...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">
        <p className="text-red-500">ERROR: {error}</p>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-mono relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <section className="px-4 md:px-8 py-16 relative z-10">
        <div className="w-full">
          {/* Standardized Header */}
          <motion.div
            className="mb-12 border-b border-zinc-900 pb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="flex flex-col md:flex-row md:items-end gap-6 mb-6">
              <div className="bg-zinc-900/50 p-4 md:p-6 border border-zinc-800 self-start">
                <FiTerminal className="text-4xl md:text-6xl text-white" />
              </div>
              <div className="flex items-end gap-4">
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                  DEVELOPERS
                </h1>
                <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                  TOKENIZED_CONTRIBUTORS
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mt-6">
              <p className="text-zinc-400 max-w-2xl text-sm leading-relaxed">
                Trade and invest in open-source contributors. Every developer on b0ase.com has a personal token that captures their value creation in the ecosystem.
              </p>

              <Link
                href="/developers/contracts"
                className="text-zinc-500 hover:text-white text-xs uppercase tracking-widest font-bold border-b border-zinc-800 hover:border-white pb-1 transition-all"
              >
                View Active Contracts →
              </Link>
            </div>
          </motion.div>

          {/* Mint Your Token Card */}
          <div className="mb-12 border border-zinc-800 bg-zinc-900/10 p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <FiCode className="text-zinc-400 text-xl" />
                  <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-white">
                    Mint Your Token
                  </h3>
                </div>
                <p className="text-zinc-500 text-sm mb-4 max-w-xl">
                  Sign up and mint your <span className="text-white font-bold">$HANDLE</span>. Earn from trading volume and get funded for open source work.
                </p>
                <div className="flex gap-4 text-xs text-zinc-600 uppercase tracking-widest">
                  <span>• Instant Liquidity</span>
                  <span>• Revenue Share</span>
                  <span>• Auto-Listing</span>
                </div>
              </div>

              <div className="w-full lg:w-auto">
                <SocialLoginButtons />
              </div>
            </div>
          </div>

          {/* Search and Sort Toolbar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <input
                type="text"
                placeholder="SEARCH_DEVELOPERS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border border-zinc-800 pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors uppercase font-mono"
              />
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-zinc-800 text-zinc-500 text-xs uppercase tracking-widest hover:border-zinc-600 hover:text-white transition-colors bg-black">
                <FiFilter size={14} className="inline mr-2" />
                Filters
              </button>
            </div>
          </div>

          {/* Developer List / Table */}
          <div className="border border-zinc-800 bg-black overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-[50px_60px_minmax(200px,2fr)_120px_100px_100px_140px_140px_120px] gap-4 px-6 py-4 border-b border-zinc-800 bg-zinc-900/30 text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
              <div></div>
              <div># Rank</div>
              <div>Developer</div>
              <button onClick={() => handleSort('price')} className="text-left hover:text-white transition-colors">
                Price
              </button>
              <button onClick={() => handleSort('change24h')} className="text-left hover:text-white transition-colors">
                24h %
              </button>
              <div>7d %</div>
              <button onClick={() => handleSort('marketCap')} className="text-left hover:text-white transition-colors">
                Market Cap
              </button>
              <button onClick={() => handleSort('volume24h')} className="text-left hover:text-white transition-colors">
                Volume
              </button>
              <div>Trend</div>
            </div>

            {/* Table Body */}
            <div>
              {filteredDevelopers.map((dev, index) => (
                <div
                  key={dev.id}
                  className="grid md:grid-cols-[50px_60px_minmax(200px,2fr)_120px_100px_100px_140px_140px_120px] gap-4 px-6 py-4 border-b border-zinc-900 hover:bg-zinc-900/20 transition-colors group items-center"
                >
                  {/* Watchlist */}
                  <div className="hidden md:flex justify-center">
                    <button onClick={() => toggleWatchlist(dev.id)}>
                      <FiStar
                        size={14}
                        className={`transition-colors ${watchlist.has(dev.id) ? 'fill-white text-white' : 'text-zinc-800 group-hover:text-zinc-600'}`}
                      />
                    </button>
                  </div>

                  {/* Rank */}
                  <div className="text-zinc-600 font-mono text-xs hidden md:block">
                    {String(dev.rank).padStart(2, '0')}
                  </div>

                  {/* Developer Info */}
                  <div className="col-span-1 md:col-span-1">
                    <Link href={`/developers/${dev.id}`} className="flex items-center gap-4 group/link">
                      <div className="relative">
                        <img
                          src={dev.avatar}
                          alt={dev.username}
                          className="w-10 h-10 bg-zinc-900 border border-zinc-800 grayscale group-hover/link:grayscale-0 transition-all"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${dev.username}`;
                          }}
                        />
                        {dev.verified && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rotate-45 border border-black transform" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-white text-sm group-hover/link:underline decoration-zinc-800 underline-offset-4 tracking-tight">
                            {dev.username}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">{dev.ticker}</span>
                          {dev.isDemo && <span className="text-[9px] text-zinc-700 uppercase tracking-tighter border border-zinc-800 px-1">Demo</span>}
                        </div>
                      </div>
                    </Link>

                    {/* Mobile Stats */}
                    <div className="grid grid-cols-2 gap-y-2 mt-4 md:hidden">
                      <div>
                        <div className="text-[9px] text-zinc-600 uppercase tracking-wider">Price</div>
                        <div className="text-sm text-white font-mono">{formatPrice(dev.price)}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-zinc-600 uppercase tracking-wider">24h</div>
                        <div className={`text-sm font-mono flex items-center gap-1 ${dev.change24h >= 0 ? 'text-zinc-300' : 'text-zinc-600'}`}>
                          {dev.change24h >= 0 ? '+' : ''}{dev.change24h.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Columns - Hidden on Mobile */}
                  <div className="text-sm font-mono text-white hidden md:block">
                    {formatPrice(dev.price)}
                  </div>

                  <div className={`text-sm font-mono hidden md:flex items-center gap-1 ${dev.change24h >= 0 ? 'text-zinc-300' : 'text-zinc-600'}`}>
                    {dev.change24h >= 0 ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
                    {dev.change24h.toFixed(2)}%
                  </div>

                  <div className={`text-sm font-mono hidden md:block ${dev.change7d >= 0 ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {dev.change7d >= 0 ? '+' : ''}{dev.change7d.toFixed(2)}%
                  </div>

                  <div className="text-sm font-mono text-zinc-400 hidden md:block">
                    ${formatNumber(dev.marketCap)}
                  </div>

                  <div className="text-sm font-mono text-zinc-500 hidden md:block">
                    ${formatNumber(dev.volume24h)}
                  </div>

                  <div className="hidden md:flex items-center opacity-50 group-hover:opacity-100 transition-opacity">
                    <Sparkline data={dev.sparkline} positive={dev.change7d >= 0} />
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredDevelopers.length === 0 && (
              <div className="text-center py-24 border-t border-zinc-900">
                <p className="text-zinc-600 text-sm uppercase tracking-widest mb-4">No tokens found</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-white text-xs underline decoration-zinc-700 underline-offset-4 hover:decoration-white transition-all"
                >
                  Clear search filters
                </button>
              </div>
            )}
          </div>

          {/* Footer Call to Action */}
          <div className="mt-16 border border-zinc-800 p-12 text-center bg-zinc-900/5">
            <h2 className="text-3xl font-bold text-white mb-4 uppercase tracking-tight">
              Join the Economy
            </h2>
            <p className="text-zinc-500 mb-8 max-w-xl mx-auto text-sm leading-relaxed">
              Every line of code you write adds value to your personal token.
              Start building your on-chain reputation today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/login"
                className="px-8 py-4 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors"
              >
                Create Account
              </Link>
              <Link
                href="/docs/tokenomics"
                className="px-8 py-4 border border-zinc-700 text-zinc-300 font-bold text-xs uppercase tracking-widest hover:border-white hover:text-white transition-colors"
              >
                Read Whitepaper
              </Link>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
