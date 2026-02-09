'use client';

import React, { useState, useEffect } from 'react';
import { FaGithub, FaStar, FaCodeBranch, FaSort, FaSortUp, FaSortDown, FaFire, FaUser, FaLock } from 'react-icons/fa';
import { FiArrowRight, FiArrowLeft, FiTrendingUp, FiPlus, FiCheck, FiExternalLink } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/components/Providers';

type SortField = 'name' | 'stars' | 'forks' | 'updated' | 'language';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'my-repos' | 'trending' | 'tokenized';

// Demo: User's own repos (would come from GitHub API after OAuth)
const DEMO_USER_REPOS = [
  {
    id: 'user-1',
    name: 'my-saas-app',
    fullName: 'alexdev/my-saas-app',
    description: 'A SaaS boilerplate with auth, payments, and dashboard.',
    language: 'TypeScript',
    languageColor: '#3178c6',
    stars: 234,
    forks: 45,
    updatedAt: '2026-01-15',
    isPrivate: false,
    isTokenized: false,
    topics: ['saas', 'nextjs', 'stripe'],
  },
  {
    id: 'user-2',
    name: 'ai-code-reviewer',
    fullName: 'alexdev/ai-code-reviewer',
    description: 'AI-powered code review tool using Claude API.',
    language: 'Python',
    languageColor: '#3572A5',
    stars: 1247,
    forks: 189,
    updatedAt: '2026-01-14',
    isPrivate: false,
    isTokenized: true,
    tokenData: {
      symbol: '$AIREV',
      price: 0.0089,
      marketCap: 11000,
      chain: 'BSV',
    },
    topics: ['ai', 'code-review', 'developer-tools'],
  },
  {
    id: 'user-3',
    name: 'crypto-portfolio-tracker',
    fullName: 'alexdev/crypto-portfolio-tracker',
    description: 'Track your crypto portfolio across multiple wallets and exchanges.',
    language: 'TypeScript',
    languageColor: '#3178c6',
    stars: 567,
    forks: 78,
    updatedAt: '2026-01-10',
    isPrivate: false,
    isTokenized: false,
    topics: ['crypto', 'portfolio', 'defi'],
  },
  {
    id: 'user-4',
    name: 'private-trading-bot',
    fullName: 'alexdev/private-trading-bot',
    description: 'Automated trading strategies for BSV markets.',
    language: 'Go',
    languageColor: '#00ADD8',
    stars: 0,
    forks: 0,
    updatedAt: '2026-01-12',
    isPrivate: true,
    isTokenized: false,
    topics: ['trading', 'automation'],
  },
  {
    id: 'user-5',
    name: 'react-component-library',
    fullName: 'alexdev/react-component-library',
    description: 'A collection of reusable React components with Tailwind CSS.',
    language: 'TypeScript',
    languageColor: '#3178c6',
    stars: 89,
    forks: 12,
    updatedAt: '2025-12-20',
    isPrivate: false,
    isTokenized: false,
    topics: ['react', 'components', 'tailwind'],
  },
];

// Trending repos for discovery
const TRENDING_REPOS = [
  {
    id: 'trend-1',
    name: 'superpowers',
    fullName: 'obra/superpowers',
    description: 'An agentic skills framework & software development methodology.',
    language: 'Shell',
    languageColor: '#89e051',
    stars: 24396,
    forks: 1814,
    todayStars: 2053,
    topics: ['ai', 'agents', 'productivity'],
  },
  {
    id: 'trend-2',
    name: 'LocalAI',
    fullName: 'mudler/LocalAI',
    description: 'The free, Open Source alternative to OpenAI, Claude and others.',
    language: 'Go',
    languageColor: '#00ADD8',
    stars: 41926,
    forks: 3433,
    todayStars: 390,
    topics: ['ai', 'llm', 'self-hosted'],
  },
  {
    id: 'trend-3',
    name: 'the-algorithm',
    fullName: 'twitter/the-algorithm',
    description: 'Source code for the X Recommendation Algorithm',
    language: 'Scala',
    languageColor: '#c22d40',
    stars: 70233,
    forks: 12935,
    todayStars: 370,
    topics: ['recommendation', 'ml', 'algorithm'],
  },
];

// Already tokenized repos on the platform
const TOKENIZED_ON_PLATFORM = [
  {
    id: 'token-1',
    name: 'the-algorithm',
    fullName: 'twitter/the-algorithm',
    ownerAvatar: '/avatars/twitter.png',
    description: 'Source code for the X Recommendation Algorithm',
    language: 'Scala',
    stars: 70233,
    tokenData: {
      symbol: '$TWALGO',
      price: 0.0351,
      marketCap: 2467000,
      chain: 'BSV',
      holders: 1234,
    },
  },
  {
    id: 'token-2',
    name: 'LocalAI',
    fullName: 'mudler/LocalAI',
    ownerAvatar: '/avatars/mudler.png',
    description: 'Self-hosted OpenAI alternative',
    language: 'Go',
    stars: 41926,
    tokenData: {
      symbol: '$LOCAI',
      price: 0.0209,
      marketCap: 876000,
      chain: 'Solana',
      holders: 567,
    },
  },
];

export default function ReposPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('my-repos');
  const [isGitHubConnected, setIsGitHubConnected] = useState(false);
  const [sortField, setSortField] = useState<SortField>('stars');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [userRepos, setUserRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { linkGithub } = useAuth();
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  // Fetch user's repos on mount
  useEffect(() => {
    fetchUserRepos();
  }, []);

  async function fetchUserRepos() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/user/github/repos');

      if (res.ok) {
        const data = await res.json();
        setUserRepos(data.repos || []);
        setIsGitHubConnected(true);
        console.log(`✅ Loaded ${data.repos?.length || 0} repos from GitHub`);
      } else if (res.status === 400 || res.status === 401) {
        // GitHub not connected
        setIsGitHubConnected(false);
        setUserRepos([]);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || 'Failed to load repositories');
      }
    } catch (err: any) {
      console.error('Error fetching repos:', err);
      setError(err.message || 'Failed to load repositories');
    } finally {
      setLoading(false);
    }
  }

  const connectGitHub = async () => {
    // Use the linkGithub from useAuth instead of non-existent API route
    if (linkGithub) {
      await linkGithub('/portfolio/repos');
    }
  };

  // Sort function
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <FaSort className="ml-1 text-gray-500" size={12} />;
    return sortDirection === 'asc' ?
      <FaSortUp className="ml-1 text-gray-400" size={12} /> :
      <FaSortDown className="ml-1 text-gray-400" size={12} />;
  };

  const sortedUserRepos = [...userRepos].sort((a, b) => {
    let aVal: any, bVal: any;
    switch (sortField) {
      case 'name': aVal = a.name; bVal = b.name; break;
      case 'stars': aVal = a.stars; bVal = b.stars; break;
      case 'forks': aVal = a.forks; bVal = b.forks; break;
      case 'updated': aVal = a.updatedAt; bVal = b.updatedAt; break;
      case 'language': aVal = a.language; bVal = b.language; break;
      default: aVal = a.stars; bVal = b.stars;
    }
    if (sortDirection === 'asc') return aVal < bVal ? -1 : 1;
    return aVal > bVal ? -1 : 1;
  });

  return (
    <motion.div
      className="min-h-screen bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="px-4 md:px-8 py-16">
        {/* Back Link */}
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white mb-12 transition-colors font-mono"
        >
          <FiArrowLeft size={10} />
          <span>BACK_TO_PORTFOLIO</span>
        </Link>

        {/* Header */}
        <div className="mb-12 border-b border-zinc-900 pb-12">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-6 mb-6">
                <div className="bg-zinc-900/50 p-6 border border-zinc-800">
                  <FaGithub size={32} className="text-zinc-500" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-2">
                    REPO_TOKENIZER
                  </h1>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-mono font-bold">
                    CAPITALIZE_CODE_BASE
                  </p>
                </div>
              </div>
              <p className="text-zinc-400 max-w-2xl text-sm uppercase tracking-tight leading-relaxed">
                Connect your GitHub, tokenize your repositories, and let investors back your work.
                Turn your open source projects into protocolized assets.
              </p>
            </div>

            <div className="flex-shrink-0">
              {isGitHubConnected ? (
                <div className="p-6 border border-green-900/50 bg-green-950/10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 border border-zinc-800 flex items-center justify-center">
                      <FaUser className="text-green-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest font-mono">STATUS: CONNECTED</p>
                      <p className="text-[10px] text-zinc-500 uppercase font-mono mt-0.5 tracking-tight">GitHub Identity Verified</p>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={connectGitHub}
                  className="px-8 py-4 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all font-mono"
                >
                  Connect_GitHub_Protocol
                </button>
              )}
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-4 mb-12 border-b border-zinc-900">
          <button
            onClick={() => setViewMode('my-repos')}
            className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest transition-all font-mono ${viewMode === 'my-repos'
              ? 'text-white border-b-2 border-white'
              : 'text-zinc-600 hover:text-white'
              }`}
          >
            <span className="flex items-center gap-3">
              <FaUser size={10} /> OWNED_ASSETS
            </span>
          </button>
          <button
            onClick={() => setViewMode('trending')}
            className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest transition-all font-mono ${viewMode === 'trending'
              ? 'text-white border-b-2 border-white'
              : 'text-zinc-600 hover:text-white'
              }`}
          >
            <span className="flex items-center gap-3">
              <FiTrendingUp size={10} /> TRENDING_ALPHA
            </span>
          </button>
          <button
            onClick={() => setViewMode('tokenized')}
            className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest transition-all font-mono ${viewMode === 'tokenized'
              ? 'text-white border-b-2 border-white'
              : 'text-zinc-600 hover:text-white'
              }`}
          >
            <span className="flex items-center gap-3">
              <FiCheck size={10} /> TOKENIZED_PROTOCOL
            </span>
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-8 p-4 border border-red-700/50 bg-red-900/20 text-sm">
            <strong className="text-red-400">Error:</strong>{' '}
            <span className="text-gray-400">{error}</span>
          </div>
        )}

        {/* MY REPOS VIEW */}
        {viewMode === 'my-repos' && (
          <>
            {loading ? (
              <div className="text-center py-24 border border-gray-800 rounded-lg">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-gray-400">Loading your repositories...</p>
              </div>
            ) : !isGitHubConnected ? (
              <div className="text-center py-24 border border-gray-800 rounded-lg">
                <FaGithub size={64} className="mx-auto text-gray-700 mb-6" />
                <h2 className="text-2xl font-bold mb-4">Connect Your GitHub</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Sign in with GitHub to see your repositories and tokenize them on BSV, Solana, or Ethereum.
                </p>
                <button
                  onClick={connectGitHub}
                  className="px-8 py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
                >
                  <FaGithub /> Connect GitHub
                </button>
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="p-4 border border-gray-800 bg-gray-900/30">
                    <p className="text-3xl font-bold">{userRepos.length}</p>
                    <p className="text-xs text-gray-500 uppercase">Your Repos</p>
                  </div>
                  <div className="p-4 border border-gray-800 bg-gray-900/30">
                    <p className="text-3xl font-bold text-yellow-400">
                      {formatNumber(userRepos.reduce((sum, r) => sum + r.stars, 0))}
                    </p>
                    <p className="text-xs text-gray-500 uppercase">Total Stars</p>
                  </div>
                  <div className="p-4 border border-gray-800 bg-gray-900/30">
                    <p className="text-3xl font-bold text-green-400">
                      {userRepos.filter(r => r.isTokenized).length}
                    </p>
                    <p className="text-xs text-gray-500 uppercase">Tokenized</p>
                  </div>
                  <div className="p-4 border border-gray-800 bg-gray-900/30">
                    <p className="text-3xl font-bold text-purple-400">
                      {userRepos.filter(r => !r.isTokenized).length}
                    </p>
                    <p className="text-xs text-gray-500 uppercase">Ready to Tokenize</p>
                  </div>
                </div>

                {/* Repos Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-900">
                        <th
                          className="px-4 py-4 text-left text-[10px] font-bold text-zinc-600 uppercase tracking-widest cursor-pointer hover:text-white font-mono"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center gap-2">SPEC_OWNERSHIP {getSortIcon('name')}</div>
                        </th>
                        <th className="px-4 py-4 text-left text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-mono">MANIFEST_DESCRIPTION</th>
                        <th
                          className="px-4 py-4 text-left text-[10px] font-bold text-zinc-600 uppercase tracking-widest cursor-pointer hover:text-white font-mono"
                          onClick={() => handleSort('language')}
                        >
                          <div className="flex items-center gap-2">CORE_LANGUAGE {getSortIcon('language')}</div>
                        </th>
                        <th
                          className="px-4 py-4 text-left text-[10px] font-bold text-zinc-600 uppercase tracking-widest cursor-pointer hover:text-white font-mono"
                          onClick={() => handleSort('stars')}
                        >
                          <div className="flex items-center gap-2">STAR_SIGNAL {getSortIcon('stars')}</div>
                        </th>
                        <th className="px-4 py-4 text-left text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-mono">ASSET_STATUS</th>
                        <th className="px-4 py-4 text-left text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-mono">OPERATIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900 border-b border-zinc-900">
                      {sortedUserRepos.map((repo) => (
                        <tr key={repo.id} className="hover:bg-zinc-900/30 transition-colors group">
                          <td className="px-4 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 bg-zinc-900/50 border border-zinc-800 flex items-center justify-center text-zinc-600 group-hover:text-zinc-400 transition-colors">
                                {repo.isPrivate ? <FaLock size={12} /> : <FaGithub size={12} />}
                              </div>
                              <div>
                                <p className="font-bold uppercase tracking-tight text-sm">{repo.name}</p>
                                <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-tighter">{repo.fullName}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-6 text-[11px] text-zinc-400 max-w-sm uppercase tracking-tight leading-tight">
                            <p className="line-clamp-2">{repo.description || "NO_DESCRIPTION"}</p>
                          </td>
                          <td className="px-4 py-6">
                            <span className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-300">
                              <span className="w-1.5 h-1.5" style={{ backgroundColor: repo.languageColor }} />
                              {repo.language || "N/A"}
                            </span>
                          </td>
                          <td className="px-4 py-6 text-sm font-bold font-mono text-zinc-300">
                            {formatNumber(repo.stars)}
                          </td>
                          <td className="px-4 py-6">
                            {repo.isTokenized ? (
                              <div className="border border-green-900 bg-green-950/20 px-2 py-1 inline-block">
                                <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest font-mono">STATUS_TOKENIZED</p>
                                <p className="text-[8px] text-zinc-600 font-mono uppercase tracking-tighter mt-0.5">{repo.tokenData?.symbol}</p>
                              </div>
                            ) : repo.isPrivate ? (
                              <div className="border border-zinc-800 bg-zinc-900/50 px-2 py-1 inline-block">
                                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest font-mono">PRIVATE_SCOPE</p>
                              </div>
                            ) : (
                              <div className="border border-zinc-800 bg-zinc-900/10 px-2 py-1 inline-block">
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">MINT_READY</p>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-6">
                            {repo.isTokenized ? (
                              <Link
                                href={`/portfolio/repos/${repo.name}`}
                                className="px-4 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all font-mono"
                              >
                                MANAGE_PROTOCOL
                              </Link>
                            ) : repo.isPrivate ? (
                              <span className="text-[9px] text-zinc-700 uppercase font-mono tracking-widest">REQUIRE_PUBLIC</span>
                            ) : (
                              <Link
                                href={`/portfolio/repos/${repo.name}`}
                                className="px-4 py-2 border border-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-900 transition-all font-mono"
                              >
                                INITIALIZE_MINT
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}

        {/* TRENDING VIEW */}
        {viewMode === 'trending' && (
          <>
            <div className="mb-12 p-6 border border-zinc-900 bg-zinc-900/10">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] font-mono mb-2">DISCOVERY_STREAM</p>
              <p className="text-sm text-zinc-400 uppercase tracking-tight leading-relaxed max-w-3xl">
                Trending repositories represent high-potential alpha intelligence. Protocolized ownership is often in the exploration phase—monitor for tokenization signals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TRENDING_REPOS.map((repo) => (
                <div key={repo.id} className="p-8 border border-zinc-900 bg-zinc-900/10 hover:border-zinc-700 transition-all group">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="font-bold text-lg uppercase tracking-tight mb-1">{repo.name}</h3>
                      <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-tighter">{repo.fullName}</p>
                    </div>
                    <div className="flex items-center gap-2 text-green-500 font-mono text-[10px] font-bold">
                      <FiTrendingUp size={10} />
                      +{formatNumber(repo.todayStars)}
                    </div>
                  </div>
                  <p className="text-zinc-400 text-xs mb-8 uppercase tracking-tight leading-relaxed line-clamp-3 h-12">
                    {repo.description}
                  </p>
                  <div className="flex items-center gap-6 text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-8">
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5" style={{ backgroundColor: repo.languageColor }} />
                      {repo.language}
                    </span>
                    <span className="flex items-center gap-2 text-amber-500 font-bold">
                      <FaStar size={10} /> {formatNumber(repo.stars)}
                    </span>
                    <span className="flex items-center gap-2">
                      <FaCodeBranch size={10} /> {formatNumber(repo.forks)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {repo.topics.slice(0, 3).map((topic) => (
                      <span key={topic} className="text-[9px] font-mono border border-zinc-900 text-zinc-600 px-2 py-0.5 uppercase tracking-tighter">
                        {topic}
                      </span>
                    ))}
                  </div>
                  <a
                    href={`https://github.com/${repo.fullName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full border border-zinc-800 text-zinc-400 px-6 py-4 font-bold text-[10px] tracking-widest uppercase text-center hover:bg-zinc-900 transition-all font-mono"
                  >
                    GITHUB_MANIFEST <FiExternalLink className="inline ml-1" size={10} />
                  </a>
                </div>
              ))}
            </div>
          </>
        )}

        {/* TOKENIZED VIEW */}
        {viewMode === 'tokenized' && (
          <>
            <div className="mb-12 p-6 border border-zinc-900 bg-zinc-900/10">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] font-mono mb-2">TOKENIZED_RESOURCES</p>
              <p className="text-sm text-zinc-400 uppercase tracking-tight leading-relaxed max-w-3xl">
                Active repository assets secured on-chain. Capitalized entities are eligible for secondary market trading on the b0ase exchange.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Repository</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Token</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Market Cap</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Holders</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Chain</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {TOKENIZED_ON_PLATFORM.map((repo) => (
                    <tr key={repo.id} className="hover:bg-zinc-900/30 transition-colors group">
                      <td className="px-4 py-6">
                        <div>
                          <p className="font-bold text-sm uppercase tracking-tight">{repo.fullName}</p>
                          <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-tighter mt-1 flex items-center gap-2">
                            <FaStar className="text-amber-500" size={10} /> {formatNumber(repo.stars)}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-6">
                        <span className="px-3 py-1 border border-purple-900/50 bg-purple-950/20 text-purple-400 font-mono text-[10px] font-bold tracking-widest">
                          {repo.tokenData.symbol}
                        </span>
                      </td>
                      <td className="px-4 py-6 font-mono text-sm text-green-500 font-bold">
                        ${repo.tokenData.price.toFixed(4)}
                      </td>
                      <td className="px-4 py-6 font-mono text-sm text-amber-500 font-bold">
                        ${(repo.tokenData.marketCap / 1000000).toFixed(2)}M
                      </td>
                      <td className="px-4 py-6 text-[10px] font-mono text-zinc-400 uppercase font-bold">
                        {formatNumber(repo.tokenData.holders)}
                      </td>
                      <td className="px-4 py-6">
                        <span className={`px-2 py-1 text-[9px] font-bold font-mono uppercase tracking-widest ${repo.tokenData.chain === 'BSV' ? 'text-zinc-300 border border-zinc-800' :
                          repo.tokenData.chain === 'Solana' ? 'text-purple-400 border border-purple-900/50' :
                            'text-blue-400 border border-blue-900/50'
                          }`}>
                          {repo.tokenData.chain}
                        </span>
                      </td>
                      <td className="px-4 py-6">
                        <Link
                          href="/exchange?tab=repos"
                          className="px-4 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all font-mono"
                        >
                          TRADE_ASSET
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {TOKENIZED_ON_PLATFORM.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                No tokenized repos yet. Be the first!
              </div>
            )}
          </>
        )}

        {/* How It Works */}
        <div className="mt-24 pt-12 border-t border-zinc-900">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] font-mono text-zinc-500 mb-12">PROTOCOL_WORKFLOW</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="p-8 border border-zinc-900 bg-zinc-900/10">
              <div className="text-4xl font-bold text-zinc-800 mb-6 font-mono">01</div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest font-mono mb-4 text-zinc-300">Identity_Verification</h3>
              <p className="text-xs text-zinc-500 uppercase tracking-tight leading-relaxed">
                Establish protocol connection via OAuth. We verify cryptographic ownership certificates for all targeted codebases.
              </p>
            </div>
            <div className="p-8 border border-zinc-900 bg-zinc-900/10">
              <div className="text-4xl font-bold text-zinc-800 mb-6 font-mono">02</div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest font-mono mb-4 text-zinc-300">Target_Selection</h3>
              <p className="text-xs text-zinc-500 uppercase tracking-tight leading-relaxed">
                Identify high-value public repositories. Secure local scope and establish intellectual property parameters.
              </p>
            </div>
            <div className="p-8 border border-zinc-900 bg-zinc-900/10">
              <div className="text-4xl font-bold text-zinc-800 mb-6 font-mono">03</div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest font-mono mb-4 text-zinc-300">Network_Sync</h3>
              <p className="text-xs text-zinc-500 uppercase tracking-tight leading-relaxed">
                Connect Wallet_Node (BSV, SOL, or ETH). Configure emissions curves and initial distribution manifests.
              </p>
            </div>
            <div className="p-8 border border-zinc-900 bg-zinc-900/10">
              <div className="text-4xl font-bold text-zinc-800 mb-6 font-mono">04</div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest font-mono mb-4 text-zinc-300">Asset_Liquidity</h3>
              <p className="text-xs text-zinc-500 uppercase tracking-tight leading-relaxed">
                Broadcast mint transaction. Open secondary market channels for immediate capitalization and discovery.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 border border-zinc-900 bg-zinc-900/20 p-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-12">
            <div>
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-4">DEPLOY_PROTOCOL_NOW</h3>
              <p className="text-zinc-500 text-sm uppercase tracking-tight leading-relaxed max-w-xl">
                Join the tier-1 intelligence layer of open source founders. Protocolize your intellectual property and establish global code liquidity.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
              <Link
                href="/exchange?tab=repos"
                className="px-8 py-4 border border-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-900 transition-all font-mono text-center"
              >
                BROWSE_ACTIVE_TOKENS
              </Link>
              {!isGitHubConnected ? (
                <button
                  onClick={connectGitHub}
                  className="px-8 py-4 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all font-mono"
                >
                  INITIALIZE_GET_STARTED
                </button>
              ) : (
                <Link
                  href="/contact"
                  className="px-8 py-4 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all font-mono text-center"
                >
                  ESTABLISH_CONTACT_TUNNEL
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
