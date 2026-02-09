'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiCheck, FiDollarSign, FiCode, FiUsers,
  FiTrendingUp, FiPhone, FiFileText, FiLink, FiUpload
} from 'react-icons/fi';

const LOG_TYPES = [
  { id: 'capital_raised', label: 'Capital Raised', icon: <FiDollarSign size={16} /> },
  { id: 'work_completed', label: 'Work Completed', icon: <FiCode size={16} /> },
  { id: 'pro_rata_participated', label: 'Pro-Rata Participation', icon: <FiUsers size={16} /> },
  { id: 'equity_funded', label: 'Equity-Funded Development', icon: <FiTrendingUp size={16} /> },
  { id: 'sync_call', label: 'Monthly Sync Call', icon: <FiPhone size={16} /> },
  { id: 'review', label: 'Performance Review', icon: <FiFileText size={16} /> },
  { id: 'other', label: 'Other', icon: <FiFileText size={16} /> },
];

const OBLIGATION_OPTIONS = [
  { id: 'option_a', label: 'Option A: $10K+ Capital Raised' },
  { id: 'option_b', label: 'Option B: 60+ Hours Development Work' },
  { id: 'option_c', label: 'Option C: Pro-Rata Capital Match' },
  { id: 'option_d', label: 'Option D: Equity-Funded Development' },
];

export default function PerformanceLogPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [agreementName, setAgreementName] = useState<string>('');

  const [formData, setFormData] = useState({
    log_type: 'other',
    description: '',
    amount_usd: '',
    amount_bsv: '',
    evidence_url: '',
    evidence_type: '',
    obligation_met: '',
  });

  useEffect(() => {
    // Fetch agreement name for display
    fetch(`/api/investors/agreements/${resolvedParams.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.agreement) {
          setAgreementName(data.agreement.properties?.join(' & ') || 'Agreement');
        }
      })
      .catch(() => {});
  }, [resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        log_type: formData.log_type,
        description: formData.description,
        amount_usd: formData.amount_usd ? parseFloat(formData.amount_usd) : undefined,
        amount_bsv: formData.amount_bsv ? parseFloat(formData.amount_bsv) : undefined,
        evidence_url: formData.evidence_url || undefined,
        evidence_type: formData.evidence_type || undefined,
        obligation_met: formData.obligation_met || undefined,
      };

      const res = await fetch(`/api/investors/agreements/${resolvedParams.id}/performance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to log performance');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/user/account/investments/${resolvedParams.id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log performance');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-20">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <FiCheck size={32} />
        </motion.div>
        <h2 className="text-xl font-bold mb-2">Performance Logged</h2>
        <p className="text-zinc-500">Redirecting back to agreement...</p>
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
          <h1 className="text-2xl font-bold tracking-tight">Log Performance</h1>
          <p className="text-zinc-500 text-sm font-mono">{agreementName}</p>
        </div>
      </div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Log Type Selection */}
        <div>
          <label className="block text-xs font-mono text-zinc-500 mb-3">LOG TYPE</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {LOG_TYPES.map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() => setFormData(f => ({ ...f, log_type: type.id }))}
                className={`p-3 border text-left transition-colors ${
                  formData.log_type === type.id
                    ? 'border-white bg-white text-black'
                    : 'border-zinc-800 hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {type.icon}
                </div>
                <span className="text-xs font-mono">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-mono text-zinc-500 mb-2">DESCRIPTION *</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
            required
            rows={4}
            className="w-full bg-zinc-900 border border-zinc-800 p-3 text-sm focus:outline-none focus:border-zinc-600"
            placeholder="Describe the performance update..."
          />
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-zinc-500 mb-2">AMOUNT (USD)</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount_usd}
              onChange={e => setFormData(f => ({ ...f, amount_usd: e.target.value }))}
              className="w-full bg-zinc-900 border border-zinc-800 p-3 text-sm focus:outline-none focus:border-zinc-600"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-zinc-500 mb-2">AMOUNT (BSV)</label>
            <input
              type="number"
              step="0.00000001"
              value={formData.amount_bsv}
              onChange={e => setFormData(f => ({ ...f, amount_bsv: e.target.value }))}
              className="w-full bg-zinc-900 border border-zinc-800 p-3 text-sm focus:outline-none focus:border-zinc-600"
              placeholder="0.00000000"
            />
          </div>
        </div>

        {/* Evidence */}
        <div>
          <label className="block text-xs font-mono text-zinc-500 mb-2">
            <FiLink className="inline mr-1" size={12} />
            EVIDENCE URL
          </label>
          <input
            type="url"
            value={formData.evidence_url}
            onChange={e => setFormData(f => ({ ...f, evidence_url: e.target.value }))}
            className="w-full bg-zinc-900 border border-zinc-800 p-3 text-sm focus:outline-none focus:border-zinc-600"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-zinc-500 mb-2">EVIDENCE TYPE</label>
          <select
            value={formData.evidence_type}
            onChange={e => setFormData(f => ({ ...f, evidence_type: e.target.value }))}
            className="w-full bg-zinc-900 border border-zinc-800 p-3 text-sm focus:outline-none focus:border-zinc-600"
          >
            <option value="">Select type...</option>
            <option value="screenshot">Screenshot</option>
            <option value="document">Document</option>
            <option value="transaction">Transaction Proof</option>
            <option value="github">GitHub Commit/PR</option>
            <option value="video">Video Recording</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Mark Obligation as Met */}
        <div className="border border-amber-900 bg-amber-950/20 p-4">
          <label className="block text-xs font-mono text-amber-500 mb-3">
            MARK OBLIGATION AS MET (Optional - Founder Only)
          </label>
          <p className="text-xs text-zinc-500 mb-3">
            If this update demonstrates that a performance obligation has been fulfilled,
            select which obligation below. This will waive the clawback provision.
          </p>
          <div className="space-y-2">
            {OBLIGATION_OPTIONS.map(opt => (
              <label
                key={opt.id}
                className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${
                  formData.obligation_met === opt.id
                    ? 'border-green-600 bg-green-950/30'
                    : 'border-zinc-800 hover:border-zinc-600'
                }`}
              >
                <input
                  type="radio"
                  name="obligation_met"
                  value={opt.id}
                  checked={formData.obligation_met === opt.id}
                  onChange={e => setFormData(f => ({ ...f, obligation_met: e.target.value }))}
                  className="sr-only"
                />
                <div className={`w-4 h-4 border-2 rounded-full flex items-center justify-center ${
                  formData.obligation_met === opt.id ? 'border-green-500' : 'border-zinc-600'
                }`}>
                  {formData.obligation_met === opt.id && (
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </div>
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
            {formData.obligation_met && (
              <button
                type="button"
                onClick={() => setFormData(f => ({ ...f, obligation_met: '' }))}
                className="text-xs text-zinc-500 hover:text-white"
              >
                Clear selection
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-950/50 border border-red-900 p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || !formData.description}
            className="px-6 py-3 bg-white text-black font-mono text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'LOGGING...' : 'LOG PERFORMANCE'}
          </button>
          <Link
            href={`/user/account/investments/${resolvedParams.id}`}
            className="px-6 py-3 border border-zinc-800 hover:border-zinc-600 font-mono text-sm transition-colors"
          >
            CANCEL
          </Link>
        </div>
      </motion.form>
    </div>
  );
}
