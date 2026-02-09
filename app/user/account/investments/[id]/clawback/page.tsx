'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiAlertTriangle, FiCheck, FiX, FiShield
} from 'react-icons/fi';

interface ClawbackStatus {
  agreement_id: string;
  investor_name: string;
  clawback_status: 'active' | 'triggered' | 'waived';
  performance_deadline: string;
  days_until_deadline: number;
  is_past_deadline: boolean;
  obligations_met: string[];
  can_execute_clawback: boolean;
  why_clawback_blocked: string | null;
  current_equity_percentage: number;
}

export default function ClawbackPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [status, setStatus] = useState<ClawbackStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [reason, setReason] = useState('');
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    fetchClawbackStatus();
  }, [resolvedParams.id]);

  const fetchClawbackStatus = async () => {
    try {
      const res = await fetch(`/api/investors/agreements/${resolvedParams.id}/clawback`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch clawback status');
      }
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const executeClawback = async () => {
    if (confirmText !== 'CLAWBACK') {
      setError('Please type CLAWBACK to confirm');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason for the clawback');
      return;
    }

    setExecuting(true);
    setError(null);

    try {
      const res = await fetch(`/api/investors/agreements/${resolvedParams.id}/clawback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to execute clawback');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/user/account/investments/${resolvedParams.id}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute clawback');
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-20">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <FiCheck size={32} />
        </motion.div>
        <h2 className="text-xl font-bold mb-2">Clawback Executed</h2>
        <p className="text-zinc-500">Investor tokens have been forfeited.</p>
        <p className="text-zinc-500 mt-2">Redirecting...</p>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="text-center py-20">
        <FiAlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-bold mb-2">{error || 'Failed to load clawback status'}</h2>
        <Link href={`/user/account/investments/${resolvedParams.id}`} className="text-blue-400 hover:underline">
          Back to Agreement
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/user/account/investments/${resolvedParams.id}`}
          className="p-2 border border-zinc-800 hover:border-zinc-600 transition-colors"
        >
          <FiArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-red-500">Clawback Execution</h1>
          <p className="text-zinc-500 text-sm font-mono">{status.investor_name}</p>
        </div>
      </div>

      {/* Warning Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-2 border-red-900 bg-red-950/30 p-6"
      >
        <div className="flex items-start gap-4">
          <FiAlertTriangle size={24} className="text-red-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-red-400 mb-2">Irreversible Action</h3>
            <p className="text-sm text-zinc-300 mb-2">
              Executing a clawback will:
            </p>
            <ul className="text-sm text-zinc-400 space-y-1 list-disc list-inside">
              <li>Forfeit all investor tokens permanently</li>
              <li>Set investor equity to 0%</li>
              <li>Record the action on the blockchain (if inscribed)</li>
              <li>Send notification to the investor</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Current Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border border-zinc-800 p-6"
      >
        <h3 className="text-sm font-mono text-zinc-500 mb-4 flex items-center gap-2">
          <FiShield size={14} />
          CLAWBACK STATUS
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs text-zinc-500 mb-1">Current Status</div>
            <span className={`px-2 py-1 font-mono text-xs ${
              status.clawback_status === 'active' ? 'bg-amber-950/50 text-amber-400 border border-amber-900' :
              status.clawback_status === 'waived' ? 'bg-green-950/50 text-green-400 border border-green-900' :
              'bg-red-950/50 text-red-400 border border-red-900'
            }`}>
              {status.clawback_status.toUpperCase()}
            </span>
          </div>
          <div>
            <div className="text-xs text-zinc-500 mb-1">Performance Deadline</div>
            <div>{new Date(status.performance_deadline).toLocaleDateString()}</div>
            <div className={`text-xs ${status.is_past_deadline ? 'text-red-500' : 'text-green-500'}`}>
              {status.is_past_deadline ? 'PAST DEADLINE' : `${status.days_until_deadline} days remaining`}
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 mb-1">Obligations Met</div>
            <div>{status.obligations_met.length > 0 ? status.obligations_met.join(', ') : 'None'}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 mb-1">Current Equity</div>
            <div>{status.current_equity_percentage}%</div>
          </div>
        </div>

        {!status.can_execute_clawback && status.why_clawback_blocked && (
          <div className="mt-4 p-3 bg-zinc-900 border border-zinc-800 text-sm">
            <span className="text-amber-500 font-mono text-xs">BLOCKED: </span>
            {status.why_clawback_blocked}
          </div>
        )}
      </motion.div>

      {/* Execution Form */}
      {status.can_execute_clawback ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border border-red-900 p-6"
        >
          <h3 className="text-sm font-mono text-red-500 mb-4">EXECUTE CLAWBACK</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-2">REASON FOR CLAWBACK *</label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-800 p-3 text-sm focus:outline-none focus:border-red-600"
                placeholder="Describe why the clawback is being executed..."
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-2">
                TYPE "CLAWBACK" TO CONFIRM *
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value.toUpperCase())}
                className="w-full bg-zinc-900 border border-zinc-800 p-3 text-sm focus:outline-none focus:border-red-600 font-mono"
                placeholder="CLAWBACK"
              />
            </div>

            {error && (
              <div className="bg-red-950/50 border border-red-900 p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                onClick={executeClawback}
                disabled={executing || confirmText !== 'CLAWBACK' || !reason.trim()}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-mono text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {executing ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    EXECUTING...
                  </>
                ) : (
                  <>
                    <FiX size={16} />
                    EXECUTE CLAWBACK
                  </>
                )}
              </button>
              <Link
                href={`/user/account/investments/${resolvedParams.id}`}
                className="px-6 py-3 border border-zinc-800 hover:border-zinc-600 font-mono text-sm transition-colors"
              >
                CANCEL
              </Link>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border border-zinc-800 p-6 text-center"
        >
          <FiShield size={48} className="mx-auto mb-4 text-zinc-600" />
          <h3 className="text-lg font-bold mb-2">Clawback Not Available</h3>
          <p className="text-zinc-500 text-sm mb-4">
            {status.why_clawback_blocked || 'Clawback conditions have not been met.'}
          </p>
          <Link
            href={`/user/account/investments/${resolvedParams.id}`}
            className="inline-block px-6 py-3 border border-zinc-800 hover:border-zinc-600 font-mono text-sm transition-colors"
          >
            BACK TO AGREEMENT
          </Link>
        </motion.div>
      )}
    </div>
  );
}
