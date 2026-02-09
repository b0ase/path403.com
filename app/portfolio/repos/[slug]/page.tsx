'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaGithub,
  FaStar,
  FaCodeBranch,
  FaCheck,
  FaLock,
} from 'react-icons/fa';
import {
  FiArrowLeft,
  FiExternalLink,
  FiTrendingUp,
  FiGitCommit,
  FiAlertCircle,
  FiRefreshCw,
} from 'react-icons/fi';

// Wallet types
type ChainType = 'BSV' | 'Solana' | 'Ethereum';

interface WalletState {
  github: boolean;
  handcash: boolean;
  yours: boolean;
  metamask: boolean;
  phantom: boolean;
}

// Verification Badge Component
function VerificationBadge({ level }: { level: 'verified_owner' | 'repo_attested' | 'unverified' | null }) {
  if (!level) return null;

  const badges = {
    verified_owner: {
      icon: '✅',
      label: 'VERIFIED_OWNER',
      color: 'border-green-900 bg-green-950/20 text-green-500',
      tooltip: 'GitHub confirms this user has owner/admin access to the repository',
    },
    repo_attested: {
      icon: '📄',
      label: 'REPO_ATTESTED',
      color: 'border-blue-900 bg-blue-950/20 text-blue-500',
      tooltip: 'Repository contains .well-known/token.json attestation file',
    },
    unverified: {
      icon: '⚠️',
      label: 'UNVERIFIED',
      color: 'border-yellow-900 bg-yellow-950/20 text-yellow-500',
      tooltip: 'No verification proof available. Use caution.',
    },
  };

  const badge = badges[level];

  return (
    <div
      className={`inline-flex items-center gap-1 text-[9px] px-2 py-1 border ${badge.color} font-mono font-bold uppercase tracking-widest`}
      title={badge.tooltip}
    >
      <span>{badge.icon}</span>
      <span>{badge.label}</span>
    </div>
  );
}

export default function RepoDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [repo, setRepo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setIsGitHubConnected] = useState(false);

  // Tokenization form states
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenSupply, setTokenSupply] = useState(1000000);
  const [handcashHandle, setHandcashHandle] = useState('');
  const [yoursAddress, setYoursAddress] = useState('');

  const [, setWallets] = useState<WalletState>({
    github: false,
    handcash: false,
    yours: false,
    metamask: false,
    phantom: false,
  });

  const [isTokenizing, setIsTokenizing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    fetchRepoData();
  }, [slug]);

  async function fetchRepoData() {
    setLoading(true);
    setError(null);
    try {
      // Try authenticated repos first
      const res = await fetch('/api/user/github/repos');

      if (res.ok) {
        const data = await res.json();
        setIsGitHubConnected(true);
        setWallets(prev => ({ ...prev, github: true }));

        const foundRepo = data.repos?.find((r: any) =>
          r.name.toLowerCase() === slug.toLowerCase() ||
          r.fullName.toLowerCase().endsWith(`/${slug.toLowerCase()}`)
        );

        if (foundRepo) {
          setRepo(foundRepo);
          if (foundRepo.isTokenized) {
            setTokenSymbol(foundRepo.tokenSymbol || '');
          } else if (!foundRepo.isClaimed) {
            // AUTO-CLAIM: If it's in our own repo list but not claimed in DB, claim it automatically
            console.log('🔄 Auto-claiming owned repository...');
            handleClaimByRepoId(foundRepo.id);
          }
          setLoading(false);
          return;
        }
      }

      // Fall back to fetching public repo directly from GitHub
      console.log('Fetching public repo from GitHub API...');
      const [owner, repoName] = slug.includes('/') ? slug.split('/') : ['b0ase', slug];

      const githubRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}`);

      if (!githubRes.ok) {
        throw new Error('Repository not found');
      }

      const githubData = await githubRes.json();

      // Transform GitHub API response to our format
      const transformedRepo = {
        id: githubData.id,
        name: githubData.name,
        fullName: githubData.full_name,
        description: githubData.description,
        language: githubData.language,
        stars: githubData.stargazers_count,
        forks: githubData.forks_count,
        watchers: githubData.watchers_count,
        openIssues: githubData.open_issues_count,
        updatedAt: githubData.updated_at,
        createdAt: githubData.created_at,
        url: githubData.html_url,
        topics: githubData.topics || [],
        license: githubData.license?.spdx_id || null,
        isClaimed: false,
        isTokenized: false,
      };

      setRepo(transformedRepo);
      setIsGitHubConnected(false);

    } catch (err: any) {
      console.error('Error fetching repo:', err);
      setError(err.message || 'Failed to load repository');
    } finally {
      setLoading(false);
    }
  }

  const handleClaimByRepoId = async (repoId: string) => {
    if (isClaiming) return;
    setIsClaiming(true);
    setError(null);

    try {
      const res = await fetch(`/api/repos/${repoId}/claim`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to claim repository');
      }

      const data = await res.json();

      setRepo((prev: any) => ({
        ...prev,
        isClaimed: true,
        verificationLevel: data.repo.verificationLevel,
        verificationMethod: data.repo.verificationMethod,
        verifiedAt: data.repo.verifiedAt,
        hasRepoAttestation: data.repo.hasRepoAttestation,
      }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsClaiming(false);
    }
  };

  const handleClaim = async () => {
    if (!repo || isClaiming) return;
    handleClaimByRepoId(repo.id);
  };

  const canTokenize = () => {
    return tokenSymbol && /^[A-Z]{3,6}$/.test(tokenSymbol) && (handcashHandle || yoursAddress);
  };

  const handleTokenize = async () => {
    if (!canTokenize() || !repo || isTokenizing) return;

    setIsTokenizing(true);
    setError(null);

    try {
      const res = await fetch(`/api/repos/${repo.id}/tokenize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenSymbol,
          tokenSupply,
          handcashHandle,
          yoursAddress
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Tokenization failed');
      }

      const data = await res.json();
      setRepo({
        ...repo,
        isTokenized: true,
        tokenSymbol: data.repo.tokenSymbol,
        tokenChain: 'BSV',
        tokenContractAddress: data.repo.contractAddress
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsTokenizing(false);
    }
  };

  const formatNumber = (num: number) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <motion.div
      className="min-h-screen bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="px-4 md:px-8 py-16">
        <Link
          href="/portfolio/repos"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white mb-12 transition-colors font-mono"
        >
          <FiArrowLeft size={10} />
          <span>BACK_TO_REPOS</span>
        </Link>

        {loading && (
          <div className="flex flex-col items-center justify-center py-32 border border-zinc-900 bg-zinc-900/10">
            <FiRefreshCw className="animate-spin text-2xl text-zinc-700 mb-4" />
            <p className="text-zinc-500 uppercase tracking-[0.2em] font-mono text-[10px]">VERIFYING_OWNERSHIP_ID...</p>
          </div>
        )}

        {!loading && error && (
          <div className="mb-12 border border-red-900/50 bg-red-950/20 p-6">
            <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-red-500 mb-2">SYSTEM_ERROR</h2>
            <p className="text-zinc-400 text-xs mb-6 uppercase tracking-tight">{error}</p>
            <button
              onClick={fetchRepoData}
              className="bg-red-900 text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-red-800 transition-colors font-mono"
            >
              Retry_Verify
            </button>
          </div>
        )}

        {!loading && !repo && !error && (
          <div className="text-center py-24 border border-zinc-900">
            <h2 className="text-xl font-bold uppercase tracking-tighter mb-4">Repo Not Found</h2>
            <p className="text-zinc-500 text-xs uppercase font-mono mb-8 tracking-tight">The requested repository ID was not identified in the current session.</p>
            <Link href="/portfolio/repos" className="px-6 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 font-mono transition-all">Return_to_Repos</Link>
          </div>
        )}

        {!loading && repo && (
          <>
            <div className="mb-12 border-b border-zinc-900 pb-12">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-zinc-900/50 border border-zinc-800 flex items-center justify-center">
                      <FaGithub size={24} className="text-zinc-500" />
                    </div>
                    <div>
                      <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-1">
                        {repo.name}
                      </h1>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                          {repo.fullName}
                        </span>
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-600 hover:text-white transition-colors"
                          title="View on GitHub"
                        >
                          <FiExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                  <p className="text-zinc-400 text-sm max-w-2xl mb-6 uppercase tracking-tight leading-relaxed">
                    {repo.description || "NO_DESCRIPTION_PROVIDED"}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {repo.topics?.map((topic: string) => (
                      <span
                        key={topic}
                        className="text-[9px] font-mono border border-zinc-900 text-zinc-600 px-2 py-0.5 uppercase tracking-tighter"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                  {repo.isClaimed && (
                    <div className="mt-4">
                      <VerificationBadge level={repo.verificationLevel} />
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0">
                  {repo.isTokenized ? (
                    <div className="border border-green-900 bg-green-950/10 px-6 py-4">
                      <div className="flex items-center gap-2 mb-1">
                        <FaCheck className="text-green-500" size={12} />
                        <span className="text-[10px] font-bold text-green-500 uppercase tracking-[0.2em] font-mono">STATUS: TOKENIZED</span>
                      </div>
                      <p className="text-[10px] text-zinc-600 uppercase font-mono tracking-tight text-right">ON_BSV_NETWORK</p>
                    </div>
                  ) : (
                    <div className="border border-zinc-900 bg-zinc-900/10 px-6 py-4">
                      <div className="flex items-center gap-2 mb-1">
                        <FaLock className="text-zinc-700" size={12} />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] font-mono">STATUS: UNLOCKED</span>
                      </div>
                      <p className="text-[10px] text-zinc-700 uppercase font-mono tracking-tight text-right">READY_FOR_MINT</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 border border-zinc-900 bg-zinc-900/10 group hover:border-zinc-700 transition-colors">
                    <div className="flex items-center gap-2 text-zinc-300 mb-1">
                      <FaStar size={10} className="text-amber-500" />
                      <span className="text-xl font-bold font-mono tracking-tighter">{formatNumber(repo.stars)}</span>
                    </div>
                    <p className="text-[10px] text-zinc-600 uppercase font-mono tracking-widest font-bold">GITHUB_STARS</p>
                  </div>
                  <div className="p-4 border border-zinc-900 bg-zinc-900/10 group hover:border-zinc-700 transition-colors">
                    <div className="flex items-center gap-2 text-zinc-300 mb-1">
                      <FaCodeBranch size={10} className="text-zinc-500" />
                      <span className="text-xl font-bold font-mono tracking-tighter">{formatNumber(repo.forks)}</span>
                    </div>
                    <p className="text-[10px] text-zinc-600 uppercase font-mono tracking-widest font-bold">FORK_COUNT</p>
                  </div>
                  <div className="p-4 border border-zinc-900 bg-zinc-900/10 group hover:border-zinc-700 transition-colors">
                    <div className="flex items-center gap-2 text-green-500 mb-1">
                      <FiTrendingUp size={10} />
                      <span className="text-xl font-bold font-mono tracking-tighter">+{formatNumber(repo.todayStars || 0)}</span>
                    </div>
                    <p className="text-[10px] text-zinc-600 uppercase font-mono tracking-widest font-bold">TREND_24H</p>
                  </div>
                  <div className="p-4 border border-zinc-900 bg-zinc-900/10 group hover:border-zinc-700 transition-colors">
                    <div className="flex items-center gap-2 text-zinc-400 mb-1">
                      <FiGitCommit size={10} />
                      <span className="text-xl font-bold font-mono tracking-tighter">{formatNumber(repo.openIssues || 0)}</span>
                    </div>
                    <p className="text-[10px] text-zinc-600 uppercase font-mono tracking-widest font-bold">ISSUE_LOG</p>
                  </div>
                </div>

                <div className="p-8 border border-zinc-900 bg-zinc-900/10">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6 font-mono">REPOSITRY_SPECIFICATION</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase font-mono tracking-widest mb-1">Language</p>
                      <p className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                        <span className="w-2 h-2" style={{ backgroundColor: repo.languageColor || '#888' }} />
                        {repo.language || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase font-mono tracking-widest mb-1">License</p>
                      <p className="text-sm font-bold uppercase tracking-tight">{repo.license || 'NONE'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase font-mono tracking-widest mb-1">Commit_Log</p>
                      <p className="text-sm font-bold font-mono tracking-tighter">{formatNumber(repo.commits || 0)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase font-mono tracking-widest mb-1">Timestamp</p>
                      <p className="text-sm font-bold uppercase tracking-tight font-mono">
                        {repo.updatedAt ? new Date(repo.updatedAt).toLocaleDateString() : 'UNKNOWN'}
                      </p>
                    </div>
                  </div>
                </div>

                {repo.isTokenized && (
                  <div className="border border-purple-900 bg-purple-950/10 p-8">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-500 mb-8 font-mono">
                      TOKEN_ECONOMIC_DATA
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                      <div>
                        <p className="text-[10px] text-zinc-600 uppercase font-mono tracking-widest mb-1">Ticker</p>
                        <p className="text-2xl font-bold tracking-tighter text-purple-400 font-mono">${repo.tokenSymbol}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-600 uppercase font-mono tracking-widest mb-1">Valuation</p>
                        <p className="text-2xl font-bold tracking-tighter text-green-500 font-mono">$0.00</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-600 uppercase font-mono tracking-widest mb-1">Cap_Table</p>
                        <p className="text-2xl font-bold tracking-tighter text-amber-500 font-mono">$0.00</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-600 uppercase font-mono tracking-widest mb-1">Total_Supply</p>
                        <p className="text-2xl font-bold tracking-tighter text-zinc-200 font-mono">{formatNumber(repo.tokenSupply || 1000000)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12 pt-12 border-t border-zinc-900">
                      <div>
                        <p className="text-[10px] text-zinc-600 uppercase font-mono tracking-widest mb-2">Network_Layer</p>
                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-300">
                          BSV_1SAT_ORDINALS
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-600 uppercase font-mono tracking-widest mb-2">Inscription_ID</p>
                        <p className="text-[10px] font-mono break-all text-zinc-500 uppercase tracking-tighter">{repo.tokenContractAddress}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-12">
                {!repo.isTokenized ? (
                  <div className="border border-zinc-900 bg-zinc-900/10 p-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6 font-mono">TOKENIZATION_PROTO</h3>

                    {/* Step 1: Claim */}
                    <div className={`p-6 border mb-6 ${repo.isClaimed ? 'border-green-900/50 bg-green-950/10' : 'border-zinc-900'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest font-mono flex items-center gap-3">
                          <span className={`w-8 h-8 flex items-center justify-center border ${repo.isClaimed ? 'bg-green-600 border-green-600' : 'border-zinc-800'}`}>
                            {repo.isClaimed ? <FaCheck size={10} className="text-white" /> : '01'}
                          </span>
                          Ownership Verification
                        </span>
                      </div>
                      {!repo.isClaimed ? (
                        <button
                          onClick={handleClaim}
                          disabled={isClaiming}
                          className="w-full bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold uppercase tracking-widest py-3 mt-4 transition-all disabled:opacity-50 font-mono"
                        >
                          {isClaiming ? 'PROCESSING...' : 'EXECUTE_CLAIM'}
                        </button>
                      ) : (
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-green-500 text-[10px] font-mono uppercase tracking-widest border border-green-900 px-2 py-0.5">
                            VERIFIED_OK
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Step 2: Config */}
                    <div className={`p-6 border mb-6 ${repo.isClaimed ? 'border-zinc-800' : 'border-zinc-900 opacity-20'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest font-mono flex items-center gap-3">
                          <span className={`w-8 h-8 flex items-center justify-center border ${tokenSymbol ? 'bg-green-600 border-green-600' : 'border-zinc-800'}`}>
                            {tokenSymbol ? <FaCheck size={10} className="text-white" /> : '02'}
                          </span>
                          Configuration
                        </span>
                      </div>
                      <div className="space-y-6 mt-6">
                        <div>
                          <label className="text-[9px] text-zinc-600 uppercase font-mono mb-2 block tracking-widest font-bold">Ticker_Symbol_ID (3-6 chars)</label>
                          <input
                            type="text"
                            value={tokenSymbol}
                            onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                            placeholder="E.G. REPO"
                            disabled={!repo.isClaimed}
                            className="w-full bg-black border border-zinc-900 px-4 py-3 text-sm font-mono focus:outline-none focus:border-zinc-600 transition-colors disabled:opacity-50 uppercase tracking-tighter"
                            maxLength={6}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-zinc-600 uppercase font-mono mb-2 block tracking-widest font-bold">Initial_Emissions_Limit</label>
                          <select
                            value={tokenSupply}
                            onChange={(e) => setTokenSupply(Number(e.target.value))}
                            disabled={!repo.isClaimed}
                            className="w-full bg-black border border-zinc-900 px-4 py-3 text-sm font-mono focus:outline-none focus:border-zinc-600 transition-colors disabled:opacity-50 uppercase tracking-tighter appearance-none"
                          >
                            <option value={1000000}>1,000,000_UNITS</option>
                            <option value={10000000}>10,000,000_UNITS</option>
                            <option value={21000000}>21,000,000_TOTAL</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Payout */}
                    <div className={`p-6 border mb-12 ${repo.isClaimed ? 'border-zinc-800' : 'border-zinc-900 opacity-20'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest font-mono flex items-center gap-3">
                          <span className={`w-8 h-8 flex items-center justify-center border ${handcashHandle || yoursAddress ? 'bg-green-600 border-green-600' : 'border-zinc-800'}`}>
                            {handcashHandle || yoursAddress ? <FaCheck size={10} className="text-white" /> : '03'}
                          </span>
                          Wallet_Node
                        </span>
                      </div>
                      <div className="space-y-6 mt-6">
                        <div>
                          <label className="text-[9px] text-zinc-600 uppercase font-mono mb-2 block tracking-widest font-bold">HandCash_Protocol_Handle</label>
                          <input
                            type="text"
                            value={handcashHandle}
                            disabled={!repo.isClaimed}
                            onChange={(e) => setHandcashHandle(e.target.value)}
                            placeholder="$HANDLE"
                            className="w-full bg-black border border-zinc-900 px-4 py-3 text-sm font-mono focus:outline-none focus:border-zinc-600 transition-colors disabled:opacity-50 uppercase tracking-tighter"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-zinc-600 uppercase font-mono mb-2 block tracking-widest font-bold">Yours_Network_Address</label>
                          <input
                            type="text"
                            value={yoursAddress}
                            disabled={!repo.isClaimed}
                            onChange={(e) => setYoursAddress(e.target.value)}
                            placeholder="BSV_ADDR..."
                            className="w-full bg-black border border-zinc-900 px-4 py-3 text-sm font-mono focus:outline-none focus:border-zinc-600 transition-colors disabled:opacity-50 tracking-tighter"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleTokenize}
                      disabled={!canTokenize() || isTokenizing || !repo.isClaimed}
                      className={`w-full py-5 text-[10px] font-bold uppercase tracking-[0.3em] transition-all font-mono ${canTokenize() && repo.isClaimed && !isTokenizing
                        ? 'bg-white text-black hover:bg-zinc-200'
                        : 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800'
                        }`}
                    >
                      {isTokenizing ? 'PROCESSING_MINT...' : 'INITIALIZE_TOKEN_MINT'}
                    </button>
                  </div>
                ) : (
                  <div className="border border-purple-900 bg-purple-950/10 p-8">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400 mb-8 font-mono">ASSET_OPERATIONS</h3>
                    <div className="space-y-4">
                      <Link href="/exchange?tab=repos" className="block w-full bg-white text-black px-6 py-4 font-bold text-[10px] tracking-widest uppercase text-center hover:bg-zinc-200 transition-all font-mono">Trade_Asset_b0ase</Link>
                      <a href={`https://whatsonchain.com/tx/${repo.tokenContractAddress?.split('_')[0]}`} target="_blank" rel="noopener noreferrer" className="block w-full border border-zinc-800 text-zinc-400 px-6 py-4 font-bold text-[10px] tracking-widest uppercase text-center hover:bg-zinc-900 transition-all font-mono">Network_Verification</a>
                    </div>
                  </div>
                )}

                <div className="border border-zinc-900 bg-zinc-900/10 p-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-4 font-mono text-zinc-400">
                    <FiAlertCircle size={10} className="text-zinc-600" />
                    TOKEN_UTILITY_MANIFEST
                  </h4>
                  <ul className="space-y-3 font-mono">
                    <li className="text-[10px] text-zinc-600 uppercase tracking-tight flex items-start gap-2">
                      <span className="text-zinc-800">•</span>
                      <span>Monetize open core intelligence</span>
                    </li>
                    <li className="text-[10px] text-zinc-600 uppercase tracking-tight flex items-start gap-2">
                      <span className="text-zinc-800">•</span>
                      <span>Protocolized ownership verification</span>
                    </li>
                    <li className="text-[10px] text-zinc-600 uppercase tracking-tight flex items-start gap-2">
                      <span className="text-zinc-800">•</span>
                      <span>On-chain reputation scoring</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
