'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiCheck, FiPlus, FiX, FiGlobe, FiUser, FiDollarSign
} from 'react-icons/fi';

interface DomainInput {
  domain_name: string;
  token_symbol: string;
  founder_percentage: number;
  investor_percentage: number;
}

export default function NewAgreementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    investor_name: '',
    investor_email: '',
    investor_wallet_address: '',
    agreement_type: 'domain_exit_rights',
    investment_amount_bsv: '',
    equity_percentage: '50',
    performance_deadline_months: '12',
    obligations: {
      option_a: { enabled: true, description: 'Raise $10,000+ in capital from third-party sources' },
      option_b: { enabled: true, description: 'Complete 60+ hours of documented development work' },
      option_c: { enabled: true, description: 'Participate pro-rata in future capital raises' },
      option_d: { enabled: true, description: 'Fund development at equity-equivalent rates' },
    },
  });

  const [domains, setDomains] = useState<DomainInput[]>([
    { domain_name: '', token_symbol: '', founder_percentage: 50, investor_percentage: 50 }
  ]);

  const addDomain = () => {
    setDomains([...domains, {
      domain_name: '',
      token_symbol: '',
      founder_percentage: parseFloat(formData.equity_percentage) || 50,
      investor_percentage: 100 - (parseFloat(formData.equity_percentage) || 50)
    }]);
  };

  const removeDomain = (index: number) => {
    if (domains.length > 1) {
      setDomains(domains.filter((_, i) => i !== index));
    }
  };

  const updateDomain = (index: number, field: keyof DomainInput, value: string | number) => {
    const updated = [...domains];
    if (field === 'founder_percentage') {
      updated[index].founder_percentage = value as number;
      updated[index].investor_percentage = 100 - (value as number);
    } else if (field === 'investor_percentage') {
      updated[index].investor_percentage = value as number;
      updated[index].founder_percentage = 100 - (value as number);
    } else {
      (updated[index] as Record<string, string | number>)[field] = value;
    }
    setDomains(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate
    if (!formData.investor_name || !formData.investor_email) {
      setError('Investor name and email are required');
      setLoading(false);
      return;
    }

    if (domains.some(d => !d.domain_name || !d.token_symbol)) {
      setError('All domains must have a name and token symbol');
      setLoading(false);
      return;
    }

    try {
      // Calculate deadline
      const deadline = new Date();
      deadline.setMonth(deadline.getMonth() + parseInt(formData.performance_deadline_months));

      // Build obligations object
      const obligations: Record<string, { description: string; met: boolean }> = {};
      Object.entries(formData.obligations).forEach(([key, val]) => {
        if (val.enabled) {
          obligations[key] = { description: val.description, met: false };
        }
      });

      const payload = {
        investor_name: formData.investor_name,
        investor_email: formData.investor_email,
        investor_wallet_address: formData.investor_wallet_address || undefined,
        agreement_type: formData.agreement_type,
        properties: domains.map(d => d.domain_name),
        investment_amount_bsv: parseFloat(formData.investment_amount_bsv) || 0,
        equity_percentage: parseFloat(formData.equity_percentage),
        performance_deadline: deadline.toISOString(),
        performance_obligations: obligations,
        domain_tokens: domains.map(d => ({
          domain_name: d.domain_name,
          token_symbol: d.token_symbol.toUpperCase(),
          founder_percentage: d.founder_percentage,
          investor_percentage: d.investor_percentage,
        })),
      };

      const res = await fetch('/api/investors/agreements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create agreement');
      }

      const data = await res.json();
      setCreatedId(data.agreement.id);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create agreement');
    } finally {
      setLoading(false);
    }
  };

  if (success && createdId) {
    return (
      <div className="text-center py-20">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <FiCheck size={32} />
        </motion.div>
        <h2 className="text-xl font-bold mb-2">Agreement Created</h2>
        <p className="text-zinc-500 mb-4">The investor agreement has been created successfully.</p>
        <div className="flex justify-center gap-4">
          <Link
            href={`/user/account/investments/${createdId}`}
            className="px-6 py-3 bg-white text-black font-mono text-sm hover:bg-zinc-200 transition-colors"
          >
            VIEW AGREEMENT
          </Link>
          <Link
            href="/user/account/investments"
            className="px-6 py-3 border border-zinc-800 hover:border-zinc-600 font-mono text-sm transition-colors"
          >
            BACK TO LIST
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/user/account/investments"
          className="p-2 border border-zinc-800 hover:border-zinc-600 transition-colors"
        >
          <FiArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Investor Agreement</h1>
          <p className="text-zinc-500 text-sm font-mono">DOMAIN EXIT RIGHTS</p>
        </div>
      </div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        {/* Investor Details */}
        <div className="border border-zinc-800 p-6">
          <h3 className="text-sm font-mono text-zinc-500 mb-4 flex items-center gap-2">
            <FiUser size={14} />
            INVESTOR DETAILS
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-2">NAME *</label>
              <input
                type="text"
                value={formData.investor_name}
                onChange={e => setFormData(f => ({ ...f, investor_name: e.target.value }))}
                required
                className="w-full bg-zinc-900 border border-zinc-800 p-3 text-sm focus:outline-none focus:border-zinc-600"
                placeholder="Full legal name"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-2">EMAIL *</label>
              <input
                type="email"
                value={formData.investor_email}
                onChange={e => setFormData(f => ({ ...f, investor_email: e.target.value }))}
                required
                className="w-full bg-zinc-900 border border-zinc-800 p-3 text-sm focus:outline-none focus:border-zinc-600"
                placeholder="investor@email.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-zinc-500 mb-2">BSV WALLET ADDRESS (Optional)</label>
              <input
                type="text"
                value={formData.investor_wallet_address}
                onChange={e => setFormData(f => ({ ...f, investor_wallet_address: e.target.value }))}
                className="w-full bg-zinc-900 border border-zinc-800 p-3 text-sm focus:outline-none focus:border-zinc-600 font-mono"
                placeholder="1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2"
              />
            </div>
          </div>
        </div>

        {/* Investment Terms */}
        <div className="border border-zinc-800 p-6">
          <h3 className="text-sm font-mono text-zinc-500 mb-4 flex items-center gap-2">
            <FiDollarSign size={14} />
            INVESTMENT TERMS
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-2">INVESTMENT (BSV) *</label>
              <input
                type="number"
                step="0.00000001"
                value={formData.investment_amount_bsv}
                onChange={e => setFormData(f => ({ ...f, investment_amount_bsv: e.target.value }))}
                required
                className="w-full bg-zinc-900 border border-zinc-800 p-3 text-sm focus:outline-none focus:border-zinc-600"
                placeholder="3.00000000"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-2">EQUITY % *</label>
              <input
                type="number"
                min="1"
                max="99"
                step="0.01"
                value={formData.equity_percentage}
                onChange={e => setFormData(f => ({ ...f, equity_percentage: e.target.value }))}
                required
                className="w-full bg-zinc-900 border border-zinc-800 p-3 text-sm focus:outline-none focus:border-zinc-600"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-2">DEADLINE (Months)</label>
              <select
                value={formData.performance_deadline_months}
                onChange={e => setFormData(f => ({ ...f, performance_deadline_months: e.target.value }))}
                className="w-full bg-zinc-900 border border-zinc-800 p-3 text-sm focus:outline-none focus:border-zinc-600"
              >
                <option value="6">6 months</option>
                <option value="12">12 months</option>
                <option value="18">18 months</option>
                <option value="24">24 months</option>
              </select>
            </div>
          </div>
        </div>

        {/* Domains */}
        <div className="border border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-mono text-zinc-500 flex items-center gap-2">
              <FiGlobe size={14} />
              DOMAIN PROPERTIES
            </h3>
            <button
              type="button"
              onClick={addDomain}
              className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <FiPlus size={12} /> ADD DOMAIN
            </button>
          </div>

          <div className="space-y-4">
            {domains.map((domain, index) => (
              <div key={index} className="border border-zinc-800 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-zinc-500">DOMAIN #{index + 1}</span>
                  {domains.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDomain(index)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <FiX size={16} />
                    </button>
                  )}
                </div>
                <div className="grid md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs text-zinc-600 mb-1">Domain Name</label>
                    <input
                      type="text"
                      value={domain.domain_name}
                      onChange={e => updateDomain(index, 'domain_name', e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 p-2 text-sm focus:outline-none focus:border-zinc-600"
                      placeholder="example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-600 mb-1">Token Symbol</label>
                    <input
                      type="text"
                      value={domain.token_symbol}
                      onChange={e => updateDomain(index, 'token_symbol', e.target.value.toUpperCase().slice(0, 10))}
                      className="w-full bg-zinc-900 border border-zinc-800 p-2 text-sm focus:outline-none focus:border-zinc-600 font-mono"
                      placeholder="$TOKEN"
                      maxLength={10}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-600 mb-1">Investor %</label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={domain.investor_percentage}
                      onChange={e => updateDomain(index, 'investor_percentage', parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-800 p-2 text-sm focus:outline-none focus:border-zinc-600"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Obligations */}
        <div className="border border-zinc-800 p-6">
          <h3 className="text-sm font-mono text-zinc-500 mb-4">PERFORMANCE OBLIGATIONS (At least 1 must be met)</h3>
          <div className="space-y-3">
            {Object.entries(formData.obligations).map(([key, val]) => (
              <label
                key={key}
                className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${
                  val.enabled ? 'border-green-900 bg-green-950/20' : 'border-zinc-800'
                }`}
              >
                <input
                  type="checkbox"
                  checked={val.enabled}
                  onChange={e => setFormData(f => ({
                    ...f,
                    obligations: {
                      ...f.obligations,
                      [key]: { ...val, enabled: e.target.checked }
                    }
                  }))}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-mono text-xs text-zinc-500 mb-1">{key.toUpperCase()}</div>
                  <input
                    type="text"
                    value={val.description}
                    onChange={e => setFormData(f => ({
                      ...f,
                      obligations: {
                        ...f.obligations,
                        [key]: { ...val, description: e.target.value }
                      }
                    }))}
                    className="w-full bg-transparent text-sm focus:outline-none"
                    disabled={!val.enabled}
                  />
                </div>
              </label>
            ))}
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
            disabled={loading}
            className="px-6 py-3 bg-white text-black font-mono text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'CREATING...' : 'CREATE AGREEMENT'}
          </button>
          <Link
            href="/user/account/investments"
            className="px-6 py-3 border border-zinc-800 hover:border-zinc-600 font-mono text-sm transition-colors"
          >
            CANCEL
          </Link>
        </div>
      </motion.form>
    </div>
  );
}
