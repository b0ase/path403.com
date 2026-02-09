'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiExternalLink, FiClock, FiCheck, FiX,
  FiAlertTriangle, FiDollarSign, FiCode, FiUsers, FiTrendingUp,
  FiFileText, FiShield, FiLink
} from 'react-icons/fi';

interface DomainToken {
  id: string;
  domain_name: string;
  token_name: string;
  token_symbol: string;
  total_supply: number;
  founder_tokens: number;
  investor_tokens: number;
  token_status: 'active' | 'forfeited' | 'transferred';
  minting_txid?: string;
}

interface PerformanceLog {
  id: string;
  log_type: string;
  description: string;
  amount_usd?: number;
  amount_bsv?: number;
  evidence_url?: string;
  logged_by_name: string;
  log_date: string;
}

interface Agreement {
  id: string;
  investor_name: string;
  investor_email: string;
  investor_wallet_address?: string;
  agreement_type: string;
  properties: string[];
  investment_amount_bsv: number;
  initial_equity_percentage: number;
  current_equity_percentage: number;
  performance_deadline: string;
  performance_status: string;
  performance_obligations: {
    option_a?: { description: string; met?: boolean; met_date?: string };
    option_b?: { description: string; met?: boolean; met_date?: string };
    option_c?: { description: string; met?: boolean; met_date?: string };
    option_d?: { description: string; met?: boolean; met_date?: string };
  };
  clawback_status: 'active' | 'triggered' | 'waived';
  clawback_triggered_at?: string;
  clawback_reason?: string;
  contract_txid?: string;
  contract_inscription_id?: string;
  monthly_sync_history?: { date: string; notes: string }[];
  next_sync_date?: string;
  domain_exit_tokens: DomainToken[];
  agreement_performance_logs: PerformanceLog[];
  created_at: string;
}

const obligationIcons: Record<string, React.ReactNode> = {
  option_a: <FiDollarSign size={16} />,
  option_b: <FiCode size={16} />,
  option_c: <FiUsers size={16} />,
  option_d: <FiTrendingUp size={16} />,
};

export default function AgreementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [userRole, setUserRole] = useState<'founder' | 'investor' | null>(null);
  const [daysUntilDeadline, setDaysUntilDeadline] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAgreement();
  }, [resolvedParams.id]);

  const fetchAgreement = async () => {
    try {
      const res = await fetch(`/api/investors/agreements/${resolvedParams.id}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError('Agreement not found');
        } else if (res.status === 403) {
          setError('Access denied');
        } else {
          setError('Failed to load agreement');
        }
        return;
      }
      const data = await res.json();
      setAgreement(data.agreement);
      setUserRole(data.user_role);
      setDaysUntilDeadline(data.days_until_deadline);
    } catch (err) {
      setError('Failed to load agreement');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waived': return 'text-green-400 bg-green-950/50 border-green-900';
      case 'triggered': return 'text-red-400 bg-red-950/50 border-red-900';
      default: return 'text-amber-400 bg-amber-950/50 border-amber-900';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !agreement) {
    return (
      <div className="text-center py-20">
        <FiAlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-bold mb-2">{error || 'Agreement not found'}</h2>
        <Link href="/user/account/investments" className="text-blue-400 hover:underline">
          Back to Investments
        </Link>
      </div>
    );
  }

  const obligationsMet = Object.entries(agreement.performance_obligations)
    .filter(([_, v]) => v?.met).length;
  const totalObligations = Object.keys(agreement.performance_obligations).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/user/account/investments"
          className="p-2 border border-zinc-800 hover:border-zinc-600 transition-colors"
        >
          <FiArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {agreement.properties.join(' & ')}
          </h1>
          <p className="text-zinc-500 text-sm font-mono">
            {agreement.agreement_type.replace(/_/g, ' ').toUpperCase()} • {agreement.investor_name}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={`px-3 py-1 text-xs font-mono border ${getStatusColor(agreement.clawback_status)}`}>
            {agreement.clawback_status === 'waived' && <FiCheck className="inline mr-1" />}
            {agreement.clawback_status === 'triggered' && <FiX className="inline mr-1" />}
            {agreement.clawback_status === 'active' && <FiClock className="inline mr-1" />}
            CLAWBACK_{agreement.clawback_status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-zinc-800 p-4"
        >
          <div className="text-xs text-zinc-500 font-mono mb-1">INVESTMENT</div>
          <div className="text-2xl font-bold">{agreement.investment_amount_bsv} BSV</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border border-zinc-800 p-4"
        >
          <div className="text-xs text-zinc-500 font-mono mb-1">CURRENT EQUITY</div>
          <div className="text-2xl font-bold">{agreement.current_equity_percentage}%</div>
          {agreement.current_equity_percentage !== agreement.initial_equity_percentage && (
            <div className="text-xs text-zinc-600">
              (was {agreement.initial_equity_percentage}%)
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border border-zinc-800 p-4"
        >
          <div className="text-xs text-zinc-500 font-mono mb-1">DEADLINE</div>
          <div className="text-lg font-bold">{formatDate(agreement.performance_deadline)}</div>
          <div className={`text-xs ${daysUntilDeadline > 30 ? 'text-green-500' : daysUntilDeadline > 0 ? 'text-amber-500' : 'text-red-500'}`}>
            {daysUntilDeadline > 0 ? `${daysUntilDeadline} days remaining` : 'PAST DEADLINE'}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border border-zinc-800 p-4"
        >
          <div className="text-xs text-zinc-500 font-mono mb-1">OBLIGATIONS MET</div>
          <div className="text-2xl font-bold">{obligationsMet} / {totalObligations}</div>
          <div className="w-full bg-zinc-900 h-1 mt-2">
            <div
              className="bg-green-500 h-1 transition-all"
              style={{ width: `${(obligationsMet / totalObligations) * 100}%` }}
            />
          </div>
        </motion.div>
      </div>

      {/* Performance Obligations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="border border-zinc-800 p-6"
      >
        <h3 className="text-sm font-mono text-zinc-500 mb-4 flex items-center gap-2">
          <FiShield size={14} />
          PERFORMANCE OBLIGATIONS
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(agreement.performance_obligations).map(([key, obligation]) => (
            <div
              key={key}
              className={`p-4 border ${obligation?.met ? 'border-green-900 bg-green-950/20' : 'border-zinc-800'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 ${obligation?.met ? 'bg-green-900/50 text-green-400' : 'bg-zinc-900 text-zinc-500'}`}>
                  {obligationIcons[key] || <FiFileText size={16} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-zinc-500">{key.toUpperCase()}</span>
                    {obligation?.met ? (
                      <span className="text-green-500 flex items-center gap-1 text-xs">
                        <FiCheck size={12} /> MET
                      </span>
                    ) : (
                      <span className="text-zinc-600 text-xs">PENDING</span>
                    )}
                  </div>
                  <p className="text-sm mt-1">{obligation?.description}</p>
                  {obligation?.met_date && (
                    <p className="text-xs text-zinc-600 mt-2">
                      Completed: {formatDate(obligation.met_date)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Domain Tokens */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="border border-zinc-800 p-6"
      >
        <h3 className="text-sm font-mono text-zinc-500 mb-4 flex items-center gap-2">
          <FiLink size={14} />
          DOMAIN EXIT TOKENS
        </h3>
        <div className="space-y-4">
          {agreement.domain_exit_tokens.map((token) => (
            <div key={token.id} className="border border-zinc-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-bold">{token.domain_name}</span>
                  <span className="text-zinc-500 ml-2 text-sm">({token.token_symbol})</span>
                </div>
                <span className={`px-2 py-1 text-xs font-mono ${
                  token.token_status === 'active' ? 'bg-green-950/50 text-green-400 border border-green-900' :
                  token.token_status === 'forfeited' ? 'bg-red-950/50 text-red-400 border border-red-900' :
                  'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}>
                  {token.token_status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-xs text-zinc-500 mb-1">Total Supply</div>
                  <div className="font-mono">{token.total_supply.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 mb-1">Founder Tokens</div>
                  <div className="font-mono">{token.founder_tokens.toLocaleString()}</div>
                  <div className="text-xs text-zinc-600">
                    ({((token.founder_tokens / token.total_supply) * 100).toFixed(0)}%)
                  </div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 mb-1">Investor Tokens</div>
                  <div className="font-mono">{token.investor_tokens.toLocaleString()}</div>
                  <div className="text-xs text-zinc-600">
                    ({((token.investor_tokens / token.total_supply) * 100).toFixed(0)}%)
                  </div>
                </div>
              </div>

              {token.minting_txid && (
                <a
                  href={`https://whatsonchain.com/tx/${token.minting_txid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:underline mt-3 inline-flex items-center gap-1"
                >
                  <FiExternalLink size={10} />
                  View on WhatsOnChain
                </a>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Performance History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="border border-zinc-800 p-6"
      >
        <h3 className="text-sm font-mono text-zinc-500 mb-4 flex items-center gap-2">
          <FiFileText size={14} />
          PERFORMANCE HISTORY
        </h3>
        {agreement.agreement_performance_logs.length === 0 ? (
          <p className="text-zinc-600 text-sm">No performance logs yet.</p>
        ) : (
          <div className="space-y-3">
            {agreement.agreement_performance_logs.slice(0, 10).map((log) => (
              <div key={log.id} className="border-l-2 border-zinc-800 pl-4 py-2">
                <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                  <span className="font-mono">{log.log_type.toUpperCase()}</span>
                  <span>•</span>
                  <span>{formatDate(log.log_date)}</span>
                  <span>•</span>
                  <span>{log.logged_by_name}</span>
                </div>
                <p className="text-sm">{log.description}</p>
                {log.amount_usd && (
                  <p className="text-xs text-green-500 mt-1">${log.amount_usd.toLocaleString()} USD</p>
                )}
                {log.evidence_url && (
                  <a
                    href={log.evidence_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:underline mt-1 inline-flex items-center gap-1"
                  >
                    <FiExternalLink size={10} />
                    View Evidence
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Actions */}
      {userRole === 'founder' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="border border-zinc-800 p-6"
        >
          <h3 className="text-sm font-mono text-zinc-500 mb-4">FOUNDER ACTIONS</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/user/account/investments/${agreement.id}/performance`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-mono transition-colors"
            >
              LOG PERFORMANCE
            </Link>
            {agreement.clawback_status === 'active' && daysUntilDeadline <= 0 && obligationsMet === 0 && (
              <Link
                href={`/user/account/investments/${agreement.id}/clawback`}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-mono transition-colors"
              >
                EXECUTE CLAWBACK
              </Link>
            )}
            {!agreement.contract_txid && (
              <button
                className="px-4 py-2 border border-zinc-700 hover:border-zinc-500 text-sm font-mono transition-colors"
                onClick={() => alert('Inscription feature coming soon')}
              >
                INSCRIBE ON CHAIN
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Contract Details */}
      {agreement.contract_txid && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="border border-green-900 bg-green-950/20 p-6"
        >
          <h3 className="text-sm font-mono text-green-500 mb-4 flex items-center gap-2">
            <FiLink size={14} />
            ON-CHAIN CONTRACT
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-zinc-500">Transaction ID:</span>
              <a
                href={`https://whatsonchain.com/tx/${agreement.contract_txid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-blue-400 hover:underline font-mono text-xs break-all"
              >
                {agreement.contract_txid}
              </a>
            </div>
            {agreement.contract_inscription_id && (
              <div>
                <span className="text-zinc-500">Inscription ID:</span>
                <span className="ml-2 font-mono text-xs break-all">{agreement.contract_inscription_id}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
