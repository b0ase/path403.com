'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiCircle,
  FiClock,
  FiExternalLink,
  FiGitBranch,
  FiLock,
  FiTarget,
  FiTrendingUp,
} from 'react-icons/fi';
import { FaGithub } from 'react-icons/fa';

interface GitHubIssue {
  id: string;
  number: number;
  title: string;
  body: string | null;
  state: string;
  htmlUrl: string;
  authorLogin: string | null;
  labels: Array<{ name: string; color: string }>;
  assignees: Array<{ login: string; avatar_url: string }>;
  milestone: string | null;
  priority: number;
}

interface Tranche {
  id: string;
  trancheNumber: number;
  name: string;
  description: string | null;
  targetAmountGbp: number;
  raisedAmountGbp: number;
  pricePerPercent: number;
  equityOffered: number;
  status: string;
  milestoneSummary: string | null;
  issues: GitHubIssue[];
}

interface RoadmapData {
  projectSlug: string;
  summary: {
    totalTranches: number;
    totalTargetGbp: number;
    totalRaisedGbp: number;
    totalEquityPercent: number;
    fundingProgress: number;
    totalIssues: number;
    openIssues: number;
    closedIssues: number;
    issueCompletion: number;
  };
  tranches: Tranche[];
}

export default function InvestProjectPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [data, setData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTranche, setSelectedTranche] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await fetch(`/api/projects/${slug}/roadmap`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Project not found or no tranches configured');
          }
          throw new Error('Failed to fetch roadmap');
        }
        const json = await res.json();
        setData(json);
        // Auto-select first open/upcoming tranche
        const openTranche = json.tranches.find((t: Tranche) => t.status === 'open');
        const upcomingTranche = json.tranches.find((t: Tranche) => t.status === 'upcoming');
        if (openTranche) {
          setSelectedTranche(openTranche.id);
        } else if (upcomingTranche) {
          setSelectedTranche(upcomingTranche.id);
        } else if (json.tranches.length > 0) {
          setSelectedTranche(json.tranches[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    if (slug) {
      fetchRoadmap();
    }
  }, [slug]);

  const formatGbp = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTrancheStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'funded':
        return <FiCheckCircle className="text-green-400" size={20} />;
      case 'open':
        return <FiCircle className="text-blue-400" size={20} />;
      case 'upcoming':
        return <FiClock className="text-zinc-400" size={20} />;
      default:
        return <FiLock className="text-zinc-600" size={20} />;
    }
  };

  const getTrancheStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'funded':
        return 'Funded';
      case 'open':
        return 'Open for Investment';
      case 'upcoming':
        return 'Coming Soon';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading roadmap...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <FiTarget size={48} className="mx-auto mb-4 text-zinc-600" />
          <h2 className="text-xl font-bold mb-2">No Roadmap Found</h2>
          <p className="text-zinc-500 mb-6">{error || 'This project does not have tranches configured yet.'}</p>
          <Link
            href="/invest"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold uppercase hover:bg-zinc-200 transition-colors"
          >
            <FiArrowLeft /> Back to Opportunities
          </Link>
        </div>
      </div>
    );
  }

  const { summary, tranches } = data;
  const selectedTrancheData = tranches.find(t => t.id === selectedTranche);

  return (
    <motion.div
      className="min-h-screen bg-black text-white font-mono"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <main className="px-4 md:px-8 py-16">
        {/* Back Link */}
        <Link
          href="/invest"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8"
        >
          <FiArrowLeft /> Back to all opportunities
        </Link>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 border-b border-zinc-800 pb-8"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Investment Roadmap</p>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight uppercase">
                {slug.replace(/-/g, ' ')}
              </h1>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Total Raising</p>
                <p className="text-2xl font-bold">{formatGbp(summary.totalTargetGbp)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Progress</p>
                <p className="text-2xl font-bold text-green-400">{summary.fundingProgress.toFixed(0)}%</p>
              </div>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-zinc-500 mb-1">
              <span>{formatGbp(summary.totalRaisedGbp)} raised</span>
              <span>{summary.totalEquityPercent.toFixed(1)}% equity across {summary.totalTranches} tranches</span>
            </div>
            <div className="h-3 bg-zinc-800">
              <div
                className="h-full bg-green-600 transition-all"
                style={{ width: `${Math.min(summary.fundingProgress, 100)}%` }}
              />
            </div>
          </div>

          {/* Issue Progress */}
          {summary.totalIssues > 0 && (
            <div className="mt-4 flex items-center gap-4 text-sm text-zinc-400">
              <FiGitBranch size={16} />
              <span>
                {summary.closedIssues} of {summary.totalIssues} GitHub issues complete ({summary.issueCompletion.toFixed(0)}%)
              </span>
            </div>
          )}
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tranches List (Left Column) */}
          <div className="lg:col-span-1">
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">
              Funding Tranches
            </h2>
            <div className="space-y-3">
              {tranches.map((tranche, index) => (
                <motion.button
                  key={tranche.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => setSelectedTranche(tranche.id)}
                  className={`w-full text-left p-4 border transition-all ${
                    selectedTranche === tranche.id
                      ? 'border-white bg-zinc-900'
                      : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getTrancheStatusIcon(tranche.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold truncate">
                          {tranche.trancheNumber}. {tranche.name}
                        </p>
                        <span className="text-xs text-zinc-500 whitespace-nowrap">
                          {tranche.equityOffered}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-zinc-500">
                          {formatGbp(tranche.targetAmountGbp)}
                        </span>
                        <span className={`text-xs ${
                          tranche.status === 'open' ? 'text-blue-400' :
                          tranche.status === 'funded' || tranche.status === 'completed' ? 'text-green-400' :
                          'text-zinc-500'
                        }`}>
                          {getTrancheStatusLabel(tranche.status)}
                        </span>
                      </div>
                      {/* Mini progress bar */}
                      <div className="mt-2 h-1 bg-zinc-800">
                        <div
                          className={`h-full ${
                            tranche.status === 'funded' || tranche.status === 'completed'
                              ? 'bg-green-600'
                              : 'bg-blue-600'
                          }`}
                          style={{
                            width: `${Math.min(
                              (tranche.raisedAmountGbp / tranche.targetAmountGbp) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Selected Tranche Detail (Right Column) */}
          <div className="lg:col-span-2">
            {selectedTrancheData ? (
              <motion.div
                key={selectedTrancheData.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Tranche Header */}
                <div className="border border-zinc-800 p-6 mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">
                        Tranche {selectedTrancheData.trancheNumber}
                      </p>
                      <h2 className="text-2xl font-bold">{selectedTrancheData.name}</h2>
                    </div>
                    <span className={`px-3 py-1 text-sm font-bold uppercase ${
                      selectedTrancheData.status === 'open'
                        ? 'bg-blue-900/50 text-blue-400 border border-blue-800'
                        : selectedTrancheData.status === 'funded' || selectedTrancheData.status === 'completed'
                        ? 'bg-green-900/50 text-green-400 border border-green-800'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}>
                      {getTrancheStatusLabel(selectedTrancheData.status)}
                    </span>
                  </div>

                  {selectedTrancheData.description && (
                    <p className="text-zinc-400 mb-4">{selectedTrancheData.description}</p>
                  )}

                  {selectedTrancheData.milestoneSummary && (
                    <p className="text-sm text-zinc-500 border-l-2 border-zinc-700 pl-4">
                      {selectedTrancheData.milestoneSummary}
                    </p>
                  )}

                  {/* Funding Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 bg-zinc-900/50 border border-zinc-800">
                      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Target</p>
                      <p className="text-xl font-bold">{formatGbp(selectedTrancheData.targetAmountGbp)}</p>
                    </div>
                    <div className="text-center p-4 bg-zinc-900/50 border border-zinc-800">
                      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Raised</p>
                      <p className="text-xl font-bold text-green-400">
                        {formatGbp(selectedTrancheData.raisedAmountGbp)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-zinc-900/50 border border-zinc-800">
                      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Equity</p>
                      <p className="text-xl font-bold">{selectedTrancheData.equityOffered}%</p>
                    </div>
                  </div>

                  {/* Investment CTA */}
                  {selectedTrancheData.status === 'open' && (
                    <div className="mt-6 p-4 border border-green-800/50 bg-green-900/20">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <p className="font-bold text-green-400">Open for Investment</p>
                          <p className="text-sm text-zinc-400">
                            {formatGbp(selectedTrancheData.pricePerPercent)} per 1% equity
                          </p>
                        </div>
                        <Link
                          href={`/investors/purchase?tranche=${selectedTrancheData.id}&project=${slug}`}
                          className="px-6 py-3 bg-green-600 text-white font-bold uppercase hover:bg-green-500 transition-colors text-center"
                        >
                          Invest in This Tranche
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* GitHub Issues for this Tranche */}
                <div>
                  <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FiGitBranch /> Deliverables ({selectedTrancheData.issues.length} issues)
                  </h3>

                  {selectedTrancheData.issues.length === 0 ? (
                    <div className="border border-zinc-800 border-dashed p-8 text-center text-zinc-500">
                      <p>No GitHub issues assigned to this tranche yet.</p>
                      <p className="text-xs mt-2">Issues will appear here once they are linked to this funding milestone.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedTrancheData.issues.map((issue, index) => (
                        <motion.div
                          key={issue.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 * index }}
                          className={`border p-4 transition-colors ${
                            issue.state === 'closed'
                              ? 'border-green-800/30 bg-green-900/10'
                              : 'border-zinc-800 hover:border-zinc-600'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {issue.state === 'closed' ? (
                              <FiCheckCircle className="text-green-400 mt-1" size={16} />
                            ) : (
                              <FiCircle className="text-zinc-500 mt-1" size={16} />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <a
                                    href={issue.htmlUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-bold hover:text-blue-400 transition-colors flex items-center gap-2"
                                  >
                                    {issue.title}
                                    <FiExternalLink size={12} className="text-zinc-500" />
                                  </a>
                                  <span className="text-xs text-zinc-500">#{issue.number}</span>
                                </div>
                                <span className={`text-xs px-2 py-1 ${
                                  issue.state === 'closed'
                                    ? 'bg-green-900/50 text-green-400'
                                    : 'bg-zinc-800 text-zinc-400'
                                }`}>
                                  {issue.state}
                                </span>
                              </div>

                              {/* Labels */}
                              {issue.labels.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {issue.labels.map((label, i) => (
                                    <span
                                      key={i}
                                      className="text-xs px-2 py-0.5 rounded"
                                      style={{
                                        backgroundColor: `#${label.color}20`,
                                        color: `#${label.color}`,
                                        border: `1px solid #${label.color}40`,
                                      }}
                                    >
                                      {label.name}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Assignees */}
                              {issue.assignees.length > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs text-zinc-500">Assigned to:</span>
                                  {issue.assignees.map((assignee, i) => (
                                    <span key={i} className="text-xs text-zinc-400">
                                      @{assignee.login}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="border border-zinc-800 border-dashed p-12 text-center text-zinc-500">
                <p>Select a tranche to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* How It Works */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 border border-zinc-800 p-8"
        >
          <h2 className="text-lg font-bold mb-6 uppercase">How Tranche Investing Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-zinc-800 flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <div>
                <p className="font-bold mb-1">Choose a Tranche</p>
                <p className="text-sm text-zinc-400">
                  Each tranche funds specific GitHub issues/features.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-zinc-800 flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <div>
                <p className="font-bold mb-1">Invest & Get Tokens</p>
                <p className="text-sm text-zinc-400">
                  You receive tokens immediately, held in 2-of-2 multisig.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-zinc-800 flex items-center justify-center flex-shrink-0 font-bold">
                3
              </div>
              <div>
                <p className="font-bold mb-1">Funds in Escrow</p>
                <p className="text-sm text-zinc-400">
                  Your investment is held until deliverables are merged.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-zinc-800 flex items-center justify-center flex-shrink-0 font-bold">
                4
              </div>
              <div>
                <p className="font-bold mb-1">PR Merged = Release</p>
                <p className="text-sm text-zinc-400">
                  Developers get paid when PRs are merged by the admin.
                </p>
              </div>
            </div>
          </div>
        </motion.section>
      </main>
    </motion.div>
  );
}
