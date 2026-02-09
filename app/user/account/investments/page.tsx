'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiPieChart, FiCalendar, FiCheckCircle, FiAlertTriangle,
  FiClock, FiFileText, FiExternalLink, FiArrowRight
} from 'react-icons/fi';
import { FaCoins, FaHandshake, FaGavel } from 'react-icons/fa';

interface DomainToken {
  id: string;
  domain_name: string;
  token_status: 'pending_mint' | 'active' | 'forfeited' | 'redeemed';
  investor_tokens: number;
  total_supply: number;
  minting_txid?: string;
}

interface Agreement {
  id: string;
  investor_name: string;
  investor_email: string;
  agreement_type: string;
  properties: string[];
  investment_amount_bsv: number;
  investment_amount_usd?: number;
  initial_equity_percentage: number;
  current_equity_percentage: number;
  performance_deadline: string;
  performance_status: string;
  performance_obligations: {
    option_a?: { type: string; target_usd?: number; met: boolean };
    option_b?: { type: string; description?: string; met: boolean };
    option_c?: { type: string; description?: string; met: boolean };
    option_d?: { type: string; description?: string; met: boolean };
  };
  clawback_status: 'active' | 'triggered' | 'waived';
  contract_txid?: string;
  next_sync_date?: string;
  six_month_review_date?: string;
  twelve_month_decision_date?: string;
  created_at: string;
  domain_exit_tokens: DomainToken[];
}

export default function InvestmentsPage() {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'investor' | 'founder'>('investor');

  useEffect(() => {
    async function fetchAgreements() {
      try {
        const res = await fetch('/api/investors/agreements');
        if (res.ok) {
          const data = await res.json();
          setAgreements(data.agreements || []);
          setUserRole(data.user_role || 'investor');
        } else if (res.status === 401) {
          setError('Please sign in to view your investments');
        } else {
          setError('Failed to load investments');
        }
      } catch (err) {
        console.error('Error fetching agreements:', err);
        setError('Failed to load investments');
      } finally {
        setLoading(false);
      }
    }

    fetchAgreements();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'option_a_met':
      case 'option_b_met':
      case 'option_c_met':
      case 'option_d_met':
      case 'multiple_met': return 'text-green-400';
      case 'failed': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };

  const getClawbackBadge = (status: string) => {
    switch (status) {
      case 'active': return { text: 'Active', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' };
      case 'waived': return { text: 'Waived', color: 'bg-green-500/20 text-green-400 border-green-500/50' };
      case 'triggered': return { text: 'Executed', color: 'bg-red-500/20 text-red-400 border-red-500/50' };
      default: return { text: 'Unknown', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/50' };
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    return Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getObligationsMet = (obligations: Agreement['performance_obligations']) => {
    return Object.entries(obligations || {}).filter(([_, v]) => v?.met).length;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-600 border-t-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <FiAlertTriangle className="text-4xl text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">{error}</h2>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            Sign in <FiArrowRight />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FiPieChart className="text-zinc-500" />
            My Investments
          </h1>
          <p className="text-zinc-500 mt-1">
            {userRole === 'founder' ? 'Agreements you have created' : 'Your investment agreements and domain exit rights'}
          </p>
        </div>
        {userRole === 'founder' && (
          <Link
            href="/user/account/investments/new"
            className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 text-sm font-bold uppercase hover:bg-zinc-200 transition-colors"
          >
            New Agreement <FiArrowRight />
          </Link>
        )}
      </div>

      {/* No Agreements */}
      {agreements.length === 0 && (
        <div className="border border-zinc-800 p-12 text-center">
          <FaHandshake className="text-5xl text-zinc-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Investment Agreements</h2>
          <p className="text-zinc-500 mb-6">
            {userRole === 'founder'
              ? "You haven't created any investor agreements yet."
              : "You don't have any active investment agreements."}
          </p>
          {userRole === 'founder' && (
            <Link
              href="/user/account/investments/new"
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 font-bold uppercase hover:bg-zinc-200 transition-colors"
            >
              Create Agreement <FiArrowRight />
            </Link>
          )}
        </div>
      )}

      {/* Agreements Grid */}
      <div className="grid gap-6">
        {agreements.map((agreement) => {
          const daysUntilDeadline = getDaysUntilDeadline(agreement.performance_deadline);
          const obligationsMet = getObligationsMet(agreement.performance_obligations);
          const clawbackBadge = getClawbackBadge(agreement.clawback_status);

          return (
            <motion.div
              key={agreement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 transition-colors"
            >
              {/* Agreement Header */}
              <div className="p-6 border-b border-zinc-800">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <FaCoins className="text-yellow-500" />
                      <h3 className="text-lg font-bold text-white">
                        Domain Exit Rights Agreement
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {agreement.properties.map((domain) => (
                        <span
                          key={domain}
                          className="px-2 py-1 bg-zinc-800 text-zinc-300 text-sm font-mono"
                        >
                          {domain}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs font-bold uppercase border ${clawbackBadge.color}`}>
                      Clawback: {clawbackBadge.text}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid md:grid-cols-4 gap-4 p-6 border-b border-zinc-800">
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Investment</div>
                  <div className="text-xl font-bold text-white font-mono">
                    {agreement.investment_amount_bsv} BSV
                  </div>
                  {agreement.investment_amount_usd && (
                    <div className="text-xs text-zinc-500">~${agreement.investment_amount_usd}</div>
                  )}
                </div>
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Current Equity</div>
                  <div className={`text-xl font-bold font-mono ${agreement.current_equity_percentage > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {agreement.current_equity_percentage}%
                  </div>
                  <div className="text-xs text-zinc-500">per domain</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Deadline</div>
                  <div className={`text-xl font-bold font-mono ${daysUntilDeadline < 30 ? 'text-red-400' : daysUntilDeadline < 90 ? 'text-yellow-400' : 'text-white'}`}>
                    {daysUntilDeadline > 0 ? `${daysUntilDeadline} days` : 'Passed'}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {new Date(agreement.performance_deadline).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Obligations Met</div>
                  <div className={`text-xl font-bold font-mono ${obligationsMet > 0 ? 'text-green-400' : 'text-zinc-400'}`}>
                    {obligationsMet} / 4
                  </div>
                  <div className="text-xs text-zinc-500">
                    {obligationsMet > 0 ? 'On track' : 'Pending'}
                  </div>
                </div>
              </div>

              {/* Performance Obligations */}
              <div className="p-6 border-b border-zinc-800">
                <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">
                  Performance Obligations (Must satisfy at least 1)
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {Object.entries(agreement.performance_obligations || {}).map(([key, obligation]) => (
                    <div
                      key={key}
                      className={`flex items-start gap-3 p-3 border ${obligation?.met ? 'border-green-500/30 bg-green-500/10' : 'border-zinc-700 bg-zinc-800/30'}`}
                    >
                      {obligation?.met ? (
                        <FiCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <FiClock className="text-zinc-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <div className={`text-sm font-medium ${obligation?.met ? 'text-green-400' : 'text-zinc-300'}`}>
                          {key === 'option_a' && 'Raise $10K+ Capital'}
                          {key === 'option_b' && 'Development Work'}
                          {key === 'option_c' && 'Pro-Rata Capital Raises'}
                          {key === 'option_d' && 'Equity-Funded Development'}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {obligation?.description || (key === 'option_a' ? `Target: $${obligation?.target_usd?.toLocaleString()}` : '')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Domain Tokens */}
              <div className="p-6 border-b border-zinc-800">
                <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">
                  Domain Exit Tokens
                </h4>
                <div className="space-y-3">
                  {agreement.domain_exit_tokens?.map((token) => (
                    <div
                      key={token.id}
                      className="flex items-center justify-between p-3 border border-zinc-700 bg-zinc-800/30"
                    >
                      <div className="flex items-center gap-3">
                        <FaCoins className={token.token_status === 'active' ? 'text-yellow-500' : token.token_status === 'forfeited' ? 'text-red-500' : 'text-zinc-500'} />
                        <div>
                          <div className="font-mono text-white">{token.domain_name}</div>
                          <div className="text-xs text-zinc-500">
                            {token.investor_tokens?.toLocaleString()} tokens ({((token.investor_tokens / token.total_supply) * 100).toFixed(0)}%)
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 text-xs font-bold uppercase ${token.token_status === 'active' ? 'bg-green-500/20 text-green-400' : token.token_status === 'forfeited' ? 'bg-red-500/20 text-red-400' : 'bg-zinc-500/20 text-zinc-400'}`}>
                          {token.token_status}
                        </span>
                        {token.minting_txid && (
                          <a
                            href={`https://whatsonchain.com/tx/${token.minting_txid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-500 hover:text-white"
                          >
                            <FiExternalLink />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 flex flex-wrap gap-3">
                <Link
                  href={`/user/account/investments/${agreement.id}`}
                  className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 text-sm font-bold uppercase hover:bg-zinc-200 transition-colors"
                >
                  View Details <FiArrowRight />
                </Link>
                {agreement.contract_txid && (
                  <a
                    href={`https://whatsonchain.com/tx/${agreement.contract_txid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border border-zinc-600 text-zinc-300 px-4 py-2 text-sm font-bold uppercase hover:border-white hover:text-white transition-colors"
                  >
                    View on Chain <FiExternalLink />
                  </a>
                )}
                <Link
                  href={`/user/account/investments/${agreement.id}/performance`}
                  className="inline-flex items-center gap-2 border border-zinc-600 text-zinc-300 px-4 py-2 text-sm font-bold uppercase hover:border-white hover:text-white transition-colors"
                >
                  <FiFileText /> Performance Log
                </Link>
                {userRole === 'founder' && agreement.clawback_status === 'active' && daysUntilDeadline <= 0 && obligationsMet === 0 && (
                  <Link
                    href={`/user/account/investments/${agreement.id}/clawback`}
                    className="inline-flex items-center gap-2 border border-red-600 text-red-400 px-4 py-2 text-sm font-bold uppercase hover:bg-red-600 hover:text-white transition-colors"
                  >
                    <FaGavel /> Execute Clawback
                  </Link>
                )}
              </div>

              {/* Next Sync */}
              {agreement.next_sync_date && (
                <div className="px-6 pb-6">
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <FiCalendar />
                    <span>Next sync call: {new Date(agreement.next_sync_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Quick Links */}
      {agreements.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            href="/investors"
            className="border border-zinc-800 p-4 hover:border-zinc-600 transition-colors group"
          >
            <FiPieChart className="text-xl text-zinc-500 group-hover:text-white mb-2 transition-colors" />
            <h3 className="font-bold text-white">Cap Table</h3>
            <p className="text-sm text-zinc-500">View all shareholders</p>
          </Link>
          <Link
            href="/investors/dashboard"
            className="border border-zinc-800 p-4 hover:border-zinc-600 transition-colors group"
          >
            <FaCoins className="text-xl text-zinc-500 group-hover:text-white mb-2 transition-colors" />
            <h3 className="font-bold text-white">Investor Dashboard</h3>
            <p className="text-sm text-zinc-500">Full investor portal</p>
          </Link>
          <Link
            href="/user/account/contracts"
            className="border border-zinc-800 p-4 hover:border-zinc-600 transition-colors group"
          >
            <FiFileText className="text-xl text-zinc-500 group-hover:text-white mb-2 transition-colors" />
            <h3 className="font-bold text-white">Contracts</h3>
            <p className="text-sm text-zinc-500">View all contracts</p>
          </Link>
        </div>
      )}
    </motion.div>
  );
}
