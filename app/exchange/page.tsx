'use client';

import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiTrendingDown, FiSearch, FiFileText, FiArrowRight, FiCheck, FiBarChart2, FiGithub, FiExternalLink, FiUser, FiBookOpen, FiKey, FiUsers, FiCheckCircle } from 'react-icons/fi';
import { FaChartLine, FaWallet, FaStar, FaCodeBranch, FaUserTie } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { portfolioData } from '@/lib/data';
import { useUserHandle } from '@/hooks/useUserHandle';
import { MarketSelector, MarketType } from '@/components/exchange/market-selector';
import { WalletPanel } from '@/components/exchange/wallet-panel';
import { AssetList } from '@/components/exchange/asset-list';
import { VaultPanel } from '@/components/custody/vault-panel';
import { TokenAssetButton } from '@/components/exchange/TokenAssetButton';
import { OrderForm } from '@/components/exchange/OrderForm';
import { OrderBook } from '@/components/exchange/OrderBook';
import { OpenOrders } from '@/components/exchange/OpenOrders';
import { TradeHistory } from '@/components/exchange/TradeHistory';
import { TokenCard, PriceChart, AcquireModal, HoldingsPanel } from '@/components/path402';
import type { TokenWithPrice } from '@/lib/path402/types';

// Convert portfolio projects to ordinals format (legacy logic)
const bottomProjects = ['BSV API', 'BSVEX', 'BitCDN', 'BitDNS', 'Weight', 'Penshun', 'YourCash'];
// Deterministic random for hydration consistency
const getDeterministicRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const portfolioTokens = portfolioData.projects
  .filter(project => project.slug !== 'coffeeguy-commerce-website')
  .sort((a, b) => {
    const aIsBottom = bottomProjects.includes(a.title);
    const bIsBottom = bottomProjects.includes(b.title);
    if (aIsBottom && !bIsBottom) return 1;
    if (!aIsBottom && bIsBottom) return -1;
    if (aIsBottom && bIsBottom) return bottomProjects.indexOf(a.title) - bottomProjects.indexOf(b.title);
    return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
  })
  .map((project, index) => {
    const r1 = getDeterministicRandom(index + 1);
    const r2 = getDeterministicRandom(index + 2);
    const r3 = getDeterministicRandom(index + 3);

    return {
      id: index + 1,
      name: project.title,
      ticker: project.tokenName?.replace('$', '') || '',
      price: project.price ? project.price / 1000000000 : r1 * 0.001,
      change24h: (r2 - 0.5) * 100,
      volume24h: Math.floor(r3 * 500000) + 50000,
      marketCap: project.price || Math.floor(r1 * 5000000) + 100000,
      holders: Math.floor(r2 * 10000) + 100,
      status: project.status,
      description: project.description
    };
  })
  // Deduplicate by ticker (keep the first occurrence, which usually aligns with the main project due to sort)
  .filter((token, index, self) =>
    index === self.findIndex((t) => (
      t.ticker === token.ticker && t.ticker !== ''
    ))
  );

const BSVOrdinalsExchange: React.FC = () => {
  const [activeMarket, setActiveMarket] = useState<MarketType>('PROJECTS');
  // Initialize with a project token (not a company)
  const COMPANY_TICKERS = ['BOASE', 'BCORP', 'NPG'];
  const [selectedAsset, setSelectedAsset] = useState<any>(
    portfolioTokens.find(t => t.ticker && !COMPANY_TICKERS.includes(t.ticker.toUpperCase())) || portfolioTokens[0]
  );

  const [buyAmount, setBuyAmount] = useState('1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [tradeMessage, setTradeMessage] = useState('');

  // Site is always dark theme
  const isDark = true;
  const { handle: userHandle } = useUserHandle();
  const walletConnected = !!userHandle;

  const handleAssetSelect = (asset: any) => {
    setSelectedAsset(asset);
    setTradeMessage('');
  };

  const handleBuyShare = async () => {
    if (!walletConnected) {
      window.location.href = '/api/auth/handcash';
      return;
    }
    setIsProcessing(true);
    setTradeMessage('');

    try {
      const res = await fetch(`/api/video/${selectedAsset.id}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'BUY_SHARE', amountShares: Number(buyAmount) })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Trade Failed');

      setTradeMessage(`Success! Purchased ${buyAmount} shares. New Balance: ${data.balance} sats`);
    } catch (error: any) {
      setTradeMessage(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const [repos, setRepos] = useState<any[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [developers, setDevelopers] = useState<any[]>([]);

  // $402 Access Tokens state
  const [accessTokens, setAccessTokens] = useState<TokenWithPrice[]>([]);
  const [loadingAccessTokens, setLoadingAccessTokens] = useState(false);
  const [selectedAccessToken, setSelectedAccessToken] = useState<TokenWithPrice | null>(null);
  const [showAcquireModal, setShowAcquireModal] = useState(false);
  const [holdingsRefresh, setHoldingsRefresh] = useState(0);
  const [userHoldings, setUserHoldings] = useState<Record<string, number>>({});

  // Order Book state
  const [showOrderBook, setShowOrderBook] = useState(false);
  const [userBalance, setUserBalance] = useState<{ sats: number; tokens: number }>({ sats: 0, tokens: 0 });
  const [orderBookKey, setOrderBookKey] = useState(0); // Force refresh

  // Fetch user balance when wallet connected
  useEffect(() => {
    if (!walletConnected) return;

    const fetchBalance = async () => {
      try {
        const res = await fetch('/api/exchange/balance');
        if (res.ok) {
          const data = await res.json();
          const tokenBalance = data.tokens?.find(
            (t: any) => t.token_symbol === selectedAsset?.ticker
          );
          setUserBalance({
            sats: data.clearing?.available_sats || 0,
            tokens: tokenBalance?.available_amount || 0
          });
        }
      } catch (err) {
        console.error('Failed to fetch balance:', err);
      }
    };

    fetchBalance();
  }, [walletConnected, selectedAsset?.ticker]);

  useEffect(() => {
    if (activeMarket === 'DEVELOPERS') {
      setIsProcessing(true);
      fetch('/api/developers/tokens')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setDevelopers(data);
          } else {
            // Demo data if DB is empty
            setDevelopers([
              { id: 'dev-1', name: 'Sarah Chen', handle: 'sarahdev', ticker: 'SARAH', avatar: null, skills: ['React', 'TypeScript'], price: 0.0025, change24h: 12.5, marketCap: 250000, holders: 47, verified: true },
              { id: 'dev-2', name: 'Marcus Johnson', handle: 'marcusj', ticker: 'MARCUS', avatar: null, skills: ['Solidity', 'Web3'], price: 0.0018, change24h: -3.2, marketCap: 180000, holders: 32, verified: true },
              { id: 'dev-3', name: 'Alex Rivera', handle: 'alexr', ticker: 'ALEX', avatar: null, skills: ['Python', 'AI/ML'], price: 0.0042, change24h: 8.7, marketCap: 420000, holders: 89, verified: false },
            ]);
          }
        })
        .catch(err => {
          console.error('Failed to fetch developers:', err);
          setDevelopers([]);
        })
        .finally(() => setIsProcessing(false));
    }
    if (activeMarket === 'REPOS') {
      setIsProcessing(true); // Re-using loading state or create new one
      fetch('/api/repos')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            const formatted = data.map((repo: any) => ({
              id: repo.id,
              name: repo.github_repo_name,
              fullName: repo.github_full_name,
              ticker: repo.token_symbol || 'PENDING',
              stars: repo.github_stars || 0,
              price: Number(repo.price_per_star) || ((repo.github_stars || 0) * 0.000001),
              change24h: (Math.random() - 0.5) * 10, // Mock volatility
              marketCap: Number(repo.token_supply || 1000000) * (Number(repo.price_per_star) || 0.01),
              chain: repo.token_chain || 'BSV'
            }));
            setRepos(formatted);
          } else {
            // Fallback to demo data if DB is empty
            setRepos([
              { id: 'repo-1', name: 'the-algorithm', fullName: 'twitter/the-algorithm', ticker: 'TWALGO', stars: 70233, price: 0.0351, change24h: 5.2, marketCap: 2467000, chain: 'BSV' },
              { id: 'repo-2', name: 'LocalAI', fullName: 'mudler/LocalAI', ticker: 'LOCAI', stars: 41926, price: 0.0209, change24h: -2.1, marketCap: 876000, chain: 'Solana' },
              { id: 'repo-3', name: 'ultralytics', fullName: 'ultralytics/ultralytics', ticker: 'ULTRA', stars: 51438, price: 0.0257, change24h: 8.7, marketCap: 1321000, chain: 'BSV' },
              { id: 'repo-4', name: 'mediapipe', fullName: 'google-ai-edge/mediapipe', ticker: 'MEDPIP', stars: 33209, price: 0.0166, change24h: 1.3, marketCap: 551000, chain: 'Ethereum' },
            ]);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setIsProcessing(false));
    }

    // Fetch $402 Access tokens
    if (activeMarket === 'ACCESS') {
      setLoadingAccessTokens(true);
      fetch('/api/path402/tokens')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.tokens)) {
            setAccessTokens(data.tokens);
          }
        })
        .catch(err => console.error('Failed to fetch $402 tokens:', err))
        .finally(() => setLoadingAccessTokens(false));

      // Also fetch user holdings if connected
      if (walletConnected) {
        fetch('/api/path402/holdings')
          .then(res => res.json())
          .then(data => {
            if (data.success && Array.isArray(data.holdings)) {
              const holdings: Record<string, number> = {};
              data.holdings.forEach((h: { token_id: string; balance: number }) => {
                holdings[h.token_id] = h.balance;
              });
              setUserHoldings(holdings);
            }
          })
          .catch(err => console.error('Failed to fetch holdings:', err));
      }
    }
  }, [activeMarket, walletConnected]);

  // Handler for $402 token acquisition
  const handleAcquireToken = (token: TokenWithPrice) => {
    setSelectedAccessToken(token);
    setShowAcquireModal(true);
  };

  const handleAcquisitionSuccess = () => {
    // Refresh holdings after successful acquisition
    setHoldingsRefresh(prev => prev + 1);
    // Refresh tokens to update supply/price
    fetch('/api/path402/tokens')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.tokens)) {
          setAccessTokens(data.tokens);
        }
      })
      .catch(err => console.error('Failed to refresh tokens:', err));
    // Refresh user holdings
    if (walletConnected) {
      fetch('/api/path402/holdings')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.holdings)) {
            const holdings: Record<string, number> = {};
            data.holdings.forEach((h: { token_id: string; balance: number }) => {
              holdings[h.token_id] = h.balance;
            });
            setUserHoldings(holdings);
          }
        })
        .catch(err => console.error('Failed to refresh holdings:', err));
    }
  };

  return (
    <motion.div
      className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.section className="px-4 md:px-8 py-16 relative">
        <div className="w-full">
          {/* Standardized Header */}
          <motion.div
            className="mb-12 border-b border-gray-800 pb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
              <div className="bg-gray-900/50 p-4 md:p-6 border border-gray-800 self-start">
                <FiBarChart2 className="text-4xl md:text-6xl text-white" />
              </div>
              <div className="flex items-end gap-4">
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                  EXCHANGE
                </h1>
                <div className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-widest">
                  CLEARING_HOUSE
                </div>
              </div>
            </div>

            {/* Marketing Pitch */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <p className="text-gray-400 max-w-2xl">
                List your business on the b0ase.com exchange. Get exposure, attract investment,
                and let the market discover what you're building.
              </p>
              <Link
                href="#list-your-business"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                List Your Business <FiArrowRight size={14} />
              </Link>
            </div>
          </motion.div>

          <MarketSelector activeMarket={activeMarket} onChange={setActiveMarket} isDark={isDark} />

          {/* Vault gets its own full-width layout */}
          {activeMarket === 'VAULT' ? (
            <VaultPanel userId={userHandle || 'custody-test-user-v2'} isDark={isDark} />
          ) : (
            <>
              {/* Wallet Connection Banner */}
              {!walletConnected && (
                <div className="mb-6 p-4 border border-yellow-500/50 bg-yellow-500/10 flex items-center justify-between">
                  <p className="text-yellow-500 font-bold">Connect Wallet to Trade</p>
                  <a href="/api/auth/handcash" className="px-6 py-2 bg-yellow-500 text-black font-bold hover:bg-yellow-400 transition-colors">
                    Connect HandCash
                  </a>
                </div>
              )}

              {/* Full-width Asset Table */}
              <div className="border border-white/10 rounded-xl overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-900/50 border-b border-white/10 text-xs text-gray-500 uppercase tracking-wider font-bold">
                  <div className="col-span-4">Asset</div>
                  <div className="col-span-2 text-right">Price</div>
                  <div className="col-span-2 text-right">24h Change</div>
                  <div className="col-span-2 text-right">Market Cap</div>
                  <div className="col-span-2 text-right">Action</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-white/5">
                  {(activeMarket === 'COMPANIES' || activeMarket === 'PROJECTS') && portfolioTokens
                    .filter(t => {
                      const COMPANY_TICKERS = ['BOASE', 'BCORP', 'NPG'];
                      if (activeMarket === 'COMPANIES') return COMPANY_TICKERS.includes(t.ticker?.toUpperCase());
                      return !COMPANY_TICKERS.includes(t.ticker?.toUpperCase());
                    })
                    .map((token) => (
                      <div
                        key={token.id}
                        className={`grid grid-cols-12 gap-4 px-6 py-5 hover:bg-white/5 transition-colors cursor-pointer ${selectedAsset?.id === token.id ? 'bg-yellow-900/20 border-l-2 border-yellow-500' : ''
                          }`}
                        onClick={() => handleAssetSelect(token)}
                      >
                        <div className="col-span-4 flex items-center gap-4">
                          <TokenAssetButton
                            ticker={token.ticker || ''}
                            isCompany={activeMarket === 'COMPANIES'}
                            size={44}
                          />
                          <div>
                            <div className="font-bold flex items-center gap-2">
                              ${token.ticker}
                              {activeMarket === 'COMPANIES' && (
                                <span className="text-[10px] bg-yellow-500 text-black px-1.5 py-0.5 rounded font-bold">LTD</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{token.name}</div>
                          </div>
                        </div>
                        <div className="col-span-2 text-right font-mono self-center">
                          ${token.price?.toFixed(6) || '0.000000'}
                        </div>
                        <div className={`col-span-2 text-right font-mono self-center ${token.change24h > 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                          {token.change24h > 0 ? '+' : ''}{token.change24h?.toFixed(2)}%
                        </div>
                        <div className="col-span-2 text-right font-mono text-gray-400 self-center">
                          ${(token.marketCap / 1000000).toFixed(2)}M
                        </div>
                        <div className="col-span-2 text-right self-center">
                          <button
                            disabled={!walletConnected}
                            className="px-4 py-2 bg-white text-black text-sm font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Trade
                          </button>
                        </div>
                      </div>
                    ))}

                  {activeMarket === 'DEVELOPERS' && (
                    <>
                      {developers.map((dev) => (
                        <div
                          key={dev.id}
                          className={`grid grid-cols-12 gap-4 px-6 py-5 hover:bg-white/5 transition-colors cursor-pointer ${selectedAsset?.id === dev.id ? 'bg-emerald-900/20 border-l-2 border-emerald-500' : ''}`}
                          onClick={() => handleAssetSelect(dev)}
                        >
                          <div className="col-span-4 flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
                              {dev.avatar ? (
                                <img src={dev.avatar} alt={dev.name} className="w-full h-full object-cover" />
                              ) : (
                                <FaUserTie className="text-emerald-400 text-xl" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold flex items-center gap-2">
                                ${dev.ticker}
                                {dev.verified && (
                                  <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-bold">VERIFIED</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-2">
                                {dev.name}
                                <span className="text-emerald-400">@{dev.handle}</span>
                              </div>
                            </div>
                          </div>
                          <div className="col-span-2 text-right font-mono self-center">
                            ${dev.price?.toFixed(4) || '0.0000'}
                          </div>
                          <div className={`col-span-2 text-right font-mono self-center ${dev.change24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {dev.change24h > 0 ? '+' : ''}{dev.change24h?.toFixed(2)}%
                          </div>
                          <div className="col-span-2 text-right font-mono text-gray-400 self-center">
                            ${(dev.marketCap / 1000).toFixed(0)}K
                          </div>
                          <div className="col-span-2 text-right self-center">
                            <Link
                              href={`/developers/${dev.handle}`}
                              className="inline-block px-4 py-2 bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-500 transition-colors"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      ))}
                      <div className="px-6 py-4 text-center border-t border-white/10">
                        <Link href="/developers" className="text-emerald-400 hover:text-emerald-300 text-sm font-bold">
                          Become a Tokenized Developer →
                        </Link>
                      </div>
                    </>
                  )}

                  {activeMarket === 'REPOS' && (
                    <>
                      {/* Fetched Repos data */}
                      {repos.map((repo) => (
                        <div
                          key={repo.id}
                          className={`grid grid-cols-12 gap-4 px-6 py-5 hover:bg-white/5 transition-colors cursor-pointer ${selectedAsset?.id === repo.id ? 'bg-purple-900/20 border-l-2 border-purple-500' : ''
                            }`}
                          onClick={() => handleAssetSelect(repo)}
                        >
                          <div className="col-span-4 flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                              <FiGithub className="text-white text-xl" />
                            </div>
                            <div>
                              <div className="font-bold flex items-center gap-2">
                                ${repo.ticker}
                                <span className="text-[10px] bg-purple-500 text-white px-1.5 py-0.5 rounded font-bold">{repo.chain}</span>
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-2">
                                {repo.fullName}
                                <FaStar className="text-yellow-500" size={10} />
                                <span>{(repo.stars / 1000).toFixed(1)}k</span>
                              </div>
                            </div>
                          </div>
                          <div className="col-span-2 text-right font-mono self-center">
                            ${repo.price.toFixed(4)}
                          </div>
                          <div className={`col-span-2 text-right font-mono self-center ${repo.change24h > 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                            {repo.change24h > 0 ? '+' : ''}{repo.change24h.toFixed(2)}%
                          </div>
                          <div className="col-span-2 text-right font-mono text-gray-400 self-center">
                            ${(repo.marketCap / 1000000).toFixed(2)}M
                          </div>
                          <div className="col-span-2 text-right self-center">
                            <Link
                              href={`/portfolio/repos/${repo.name.toLowerCase()}`}
                              className="inline-block px-4 py-2 bg-purple-600 text-white text-sm font-bold hover:bg-purple-500 transition-colors"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      ))}
                      <div className="px-6 py-4 text-center border-t border-white/10">
                        <Link href="/portfolio/repos" className="text-purple-400 hover:text-purple-300 text-sm font-bold">
                          Tokenize Your Own Repo →
                        </Link>
                      </div>
                    </>
                  )}

                  {(activeMarket === 'VIDEOS' || activeMarket === 'AUDIO' || activeMarket === 'WRITING') && (
                    <div className="px-6 py-16 text-center text-gray-500">
                      <FaChartLine className="text-4xl mx-auto mb-4 text-gray-700" />
                      <p className="text-lg font-bold mb-2">{activeMarket} Market</p>
                      <p className="text-sm">Content assets coming soon. Check back for video, audio, and writing tokenization.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* $402 ACCESS Market */}
              {activeMarket === 'ACCESS' && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <FiKey className="text-green-400" />
                        $402 Access Tokens
                      </h2>
                      <p className="text-gray-500 mt-1">
                        Acquire tokens for content access. Price decreases as supply grows (sqrt_decay).
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Link
                        href="/exchange/registry"
                        className="flex items-center gap-2 px-4 py-2 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                      >
                        <FiUsers size={16} />
                        Registry
                      </Link>
                      <Link
                        href="/exchange/register"
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-500 transition-colors"
                      >
                        <FiCheckCircle size={16} />
                        Register
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Token list */}
                    <div className="lg:col-span-2 space-y-4">
                      {loadingAccessTokens ? (
                        <div className="text-center py-16 text-gray-500">
                          Loading access tokens...
                        </div>
                      ) : accessTokens.length === 0 ? (
                        <div className="text-center py-16">
                          <FiKey className="mx-auto text-4xl text-gray-700 mb-4" />
                          <p className="text-gray-500">No access tokens available yet</p>
                        </div>
                      ) : (
                        accessTokens.map((token) => (
                          <TokenCard
                            key={token.token_id}
                            token={token}
                            userBalance={userHoldings[token.token_id] || 0}
                            onAcquire={handleAcquireToken}
                            selected={selectedAccessToken?.token_id === token.token_id}
                          />
                        ))
                      )}
                    </div>

                    {/* Holdings panel */}
                    <div className="space-y-6">
                      <HoldingsPanel
                        userHandle={userHandle || undefined}
                        onSelectToken={(tokenId) => {
                          const token = accessTokens.find(t => t.token_id === tokenId);
                          if (token) setSelectedAccessToken(token);
                        }}
                        refreshTrigger={holdingsRefresh}
                      />

                      {/* Price chart for selected token */}
                      {selectedAccessToken && (
                        <PriceChart token={selectedAccessToken} height={180} />
                      )}
                    </div>
                  </div>

                  {/* Info footer */}
                  <div className="mt-8 p-6 border border-white/10 rounded-xl bg-gray-900/30">
                    <h3 className="font-bold text-white mb-4">How $402 Access Works</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm text-gray-400">
                      <div>
                        <div className="text-white font-bold mb-2">1. Acquire Tokens</div>
                        <p>Purchase access tokens at the current price. Earlier buyers get better prices.</p>
                      </div>
                      <div>
                        <div className="text-white font-bold mb-2">2. Access Content</div>
                        <p>Token holders can access protected content and APIs. One token = permanent access.</p>
                      </div>
                      <div>
                        <div className="text-white font-bold mb-2">3. Register Holdings</div>
                        <p>Complete KYC and register to receive dividends and participate in governance votes.</p>
                      </div>
                      <div>
                        <div className="text-white font-bold mb-2">4. Earn Dividends</div>
                        <p>Registered holders of equity tokens receive their share of revenue distributions.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Acquire Modal */}
              <AcquireModal
                token={selectedAccessToken}
                isOpen={showAcquireModal}
                onClose={() => setShowAcquireModal(false)}
                onSuccess={handleAcquisitionSuccess}
                userHandle={userHandle || undefined}
              />

              {/* Selected Asset Quick Trade Bar */}
              {selectedAsset && (activeMarket === 'COMPANIES' || activeMarket === 'PROJECTS') && (
                <div className="mt-6 border border-white/10 rounded-xl p-6 bg-gray-900/30">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <TokenAssetButton
                        ticker={selectedAsset.ticker || ''}
                        isCompany={activeMarket === 'COMPANIES'}
                        size={64}
                      />
                      <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          ${selectedAsset.ticker}
                          {activeMarket === 'COMPANIES' && (
                            <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded font-bold">LTD</span>
                          )}
                        </h3>
                        <p className="text-gray-500">{selectedAsset.name}</p>
                        {selectedAsset.description && (
                          <p className="text-sm text-gray-400 mt-1 max-w-xl">{selectedAsset.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-2xl font-mono font-bold">${selectedAsset.price?.toFixed(6)}</div>
                        <div className={`text-sm ${selectedAsset.change24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {selectedAsset.change24h > 0 ? '+' : ''}{selectedAsset.change24h?.toFixed(2)}% (24h)
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowOrderBook(!showOrderBook)}
                          className={`px-4 py-3 border font-bold transition-colors ${
                            showOrderBook
                              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                              : 'border-gray-600 text-gray-400 hover:border-gray-500'
                          }`}
                        >
                          <FiBookOpen className="inline mr-2" />
                          Order Book
                        </button>
                        <button
                          disabled={!walletConnected}
                          onClick={() => setShowOrderBook(true)}
                          className="px-6 py-3 bg-green-600 text-white font-bold hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Trade
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Book Trading Panel */}
                  {showOrderBook && selectedAsset?.ticker && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pt-6 border-t border-white/10"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Order Book */}
                        <div className="lg:col-span-1">
                          <OrderBook
                            key={`orderbook-${selectedAsset.ticker}-${orderBookKey}`}
                            tokenId={selectedAsset.ticker}
                            tokenSymbol={selectedAsset.ticker}
                            refreshInterval={5000}
                          />
                        </div>

                        {/* Order Form */}
                        <div className="lg:col-span-1">
                          <OrderForm
                            tokenId={selectedAsset.ticker}
                            tokenSymbol={selectedAsset.ticker}
                            currentPrice={Math.floor((selectedAsset.price || 0.0001) * 100000000)}
                            userBalance={userBalance}
                            onOrderCreated={() => setOrderBookKey(k => k + 1)}
                          />
                        </div>

                        {/* Trade History & Open Orders */}
                        <div className="lg:col-span-1 space-y-6">
                          <OpenOrders
                            refreshInterval={10000}
                            onOrderCancelled={() => setOrderBookKey(k => k + 1)}
                          />
                          <TradeHistory
                            tokenId={selectedAsset.ticker}
                            limit={10}
                            refreshInterval={10000}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Market Stats Row */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border border-white/10 rounded-lg bg-gray-900/30">
                  <div className="text-xs text-gray-500 uppercase mb-1">24h Volume</div>
                  <div className="text-xl font-bold font-mono">2.4M Sats</div>
                </div>
                <div className="p-4 border border-white/10 rounded-lg bg-gray-900/30">
                  <div className="text-xs text-gray-500 uppercase mb-1">Total Market Cap</div>
                  <div className="text-xl font-bold font-mono">$12.8M</div>
                </div>
                <div className="p-4 border border-white/10 rounded-lg bg-gray-900/30">
                  <div className="text-xs text-gray-500 uppercase mb-1">Listed Assets</div>
                  <div className="text-xl font-bold font-mono">{portfolioTokens.length}</div>
                </div>
                <div className="p-4 border border-white/10 rounded-lg bg-gray-900/30">
                  <div className="text-xs text-gray-500 uppercase mb-1">Active Traders</div>
                  <div className="text-xl font-bold font-mono">1,247</div>
                </div>
              </div>
            </>
          )}

          {/* List Your Business Section */}
          <div id="list-your-business" className="mt-16 pt-16 border-t border-gray-800">
            <h3 className="text-xl font-bold uppercase tracking-tight mb-6 text-gray-400">
              List Your Business
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="border border-gray-800 p-8">
                <h4 className="text-2xl md:text-3xl font-bold mb-6 text-white leading-tight">
                  Get discovered by investors <span className="text-gray-500">who get it.</span>
                </h4>
                <p className="text-gray-400 mb-6">
                  The b0ase.com exchange connects ambitious projects with investors looking for the next
                  big thing. Tokenize your equity, list your shares, and let the market find you.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-gray-400">
                    <FiCheck className="text-green-400 flex-shrink-0" />
                    <span>Exposure to b0ase.com's investor network</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-400">
                    <FiCheck className="text-green-400 flex-shrink-0" />
                    <span>Professional tokenization and listing support</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-400">
                    <FiCheck className="text-green-400 flex-shrink-0" />
                    <span>Transparent, blockchain-verified ownership</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-400">
                    <FiCheck className="text-green-400 flex-shrink-0" />
                    <span>24/7 trading for your token holders</span>
                  </li>
                </ul>
              </div>

              <div className="border border-gray-800 p-8">
                <h4 className="font-bold uppercase tracking-tight mb-6 text-white">
                  The Listing Process
                </h4>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 border border-gray-800 flex items-center justify-center text-xs font-mono text-gray-500 flex-shrink-0">1</div>
                    <div>
                      <div className="font-bold text-white mb-1">Build</div>
                      <p className="text-gray-500 text-sm">Work with b0ase.com to develop your product or refine your existing business.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 border border-gray-800 flex items-center justify-center text-xs font-mono text-gray-500 flex-shrink-0">2</div>
                    <div>
                      <div className="font-bold text-white mb-1">Tokenize</div>
                      <p className="text-gray-500 text-sm">Convert equity into tokens. Define your cap table, vesting schedules, and governance.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 border border-gray-800 flex items-center justify-center text-xs font-mono text-gray-500 flex-shrink-0">3</div>
                    <div>
                      <div className="font-bold text-white mb-1">List</div>
                      <p className="text-gray-500 text-sm">Go live on the exchange. Your token appears alongside other b0ase.com projects.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 border border-gray-800 flex items-center justify-center text-xs font-mono text-gray-500 flex-shrink-0">4</div>
                    <div>
                      <div className="font-bold text-white mb-1">Grow</div>
                      <p className="text-gray-500 text-sm">Attract investment, distribute dividends, and use the boardroom to engage your shareholders.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="border border-gray-800 p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h4 className="text-2xl font-bold mb-2 text-white">
                    Ready to list?
                  </h4>
                  <p className="text-gray-400">
                    Get your business in front of investors. Build, tokenize, and list with b0ase.com.
                  </p>
                </div>
                <div className="flex gap-4">
                  <Link
                    href="/tokens"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-gray-800 text-white font-bold hover:border-gray-600 transition-colors whitespace-nowrap"
                  >
                    Learn About Tokens
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold hover:bg-gray-200 transition-colors whitespace-nowrap"
                  >
                    Get Listed <FiArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </motion.section>
    </motion.div >
  );
};

export default BSVOrdinalsExchange;