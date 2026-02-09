'use client';

import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiClock, FiXCircle, FiAlertTriangle, FiUser, FiGlobe, FiFileText, FiArrowRight, FiLock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useUserHandle } from '@/hooks/useUserHandle';

interface KYCStatus {
  authenticated: boolean;
  handle?: string;
  displayName?: string;
  kycStatus: 'none' | 'pending' | 'verified' | 'rejected';
  kycSubmittedAt?: string;
  kycVerifiedAt?: string;
  registered?: boolean;
  registeredAt?: string;
}

interface Holding {
  id: string;
  token_id: string;
  token_name: string;
  balance: number;
  registered: boolean;
  confers_dividends: boolean;
  confers_voting: boolean;
}

const NATIONALITIES = [
  'United Kingdom', 'United States', 'Canada', 'Australia', 'Germany', 'France',
  'Japan', 'Singapore', 'Switzerland', 'Netherlands', 'Sweden', 'Norway',
  'Denmark', 'Ireland', 'New Zealand', 'Other'
];

const DOCUMENT_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'national_id', label: 'National ID Card' },
];

export default function RegisterPage() {
  const { handle: userHandle } = useUserHandle();
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [fullLegalName, setFullLegalName] = useState('');
  const [nationality, setNationality] = useState('');
  const [documentType, setDocumentType] = useState('passport');
  const [documentRef, setDocumentRef] = useState('');

  // Registration state
  const [registeringHoldingId, setRegisteringHoldingId] = useState<string | null>(null);

  useEffect(() => {
    fetchKYCStatus();
    fetchHoldings();
  }, [userHandle]);

  const fetchKYCStatus = async () => {
    try {
      const res = await fetch('/api/path402/kyc');
      const data = await res.json();
      setKycStatus(data);
    } catch (err) {
      console.error('Failed to fetch KYC status:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHoldings = async () => {
    if (!userHandle) return;
    try {
      const res = await fetch('/api/path402/holdings');
      const data = await res.json();
      if (data.success && Array.isArray(data.holdings)) {
        // Filter to only show equity-class holdings
        const equityHoldings = data.holdings.filter(
          (h: any) => h.token?.confers_dividends || h.token?.confers_voting
        );
        setHoldings(equityHoldings.map((h: any) => ({
          id: h.id,
          token_id: h.token_id,
          token_name: h.token?.name || h.token_id,
          balance: h.balance,
          registered: h.registered || false,
          confers_dividends: h.token?.confers_dividends || false,
          confers_voting: h.token?.confers_voting || false,
        })));
      }
    } catch (err) {
      console.error('Failed to fetch holdings:', err);
    }
  };

  const handleKYCSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/path402/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullLegalName,
          nationality,
          documentType,
          documentRef: documentRef || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit KYC');
      }

      setSuccess(data.message || 'KYC submitted successfully');
      fetchKYCStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterHolding = async (holdingId: string) => {
    setRegisteringHoldingId(holdingId);
    setError(null);

    try {
      const res = await fetch(`/api/path402/holdings/${holdingId}/register`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register holding');
      }

      setSuccess(data.message || 'Holding registered successfully');
      fetchHoldings();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRegisteringHoldingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <FiCheckCircle className="text-green-400" size={24} />;
      case 'pending':
        return <FiClock className="text-yellow-400" size={24} />;
      case 'rejected':
        return <FiXCircle className="text-red-400" size={24} />;
      default:
        return <FiAlertTriangle className="text-gray-400" size={24} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return 'KYC Verified';
      case 'pending':
        return 'KYC Pending Review';
      case 'rejected':
        return 'KYC Rejected';
      default:
        return 'KYC Not Submitted';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!kycStatus?.authenticated) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="px-4 md:px-8 py-16 max-w-2xl mx-auto text-center">
          <FiLock className="mx-auto text-6xl text-gray-700 mb-6" />
          <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-400 mb-8">
            Connect your HandCash wallet to access registration.
          </p>
          <a
            href="/api/auth/handcash"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold hover:bg-green-500 transition-colors"
          >
            Connect HandCash
          </a>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="px-4 md:px-8 py-16 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-12 border-b border-gray-800 pb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
            <div className="bg-gray-900/50 p-4 md:p-6 border border-gray-800 self-start">
              <FiCheckCircle className="text-4xl md:text-6xl text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-none tracking-tighter">
                REGISTER
              </h1>
              <p className="text-gray-500 mt-2">
                KYC verification and holding registration
              </p>
            </div>
          </div>
        </motion.div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-900/50 border border-green-500 text-green-200">
            {success}
          </div>
        )}

        {/* KYC Status Card */}
        <div className="mb-8 p-6 border border-white/10 rounded-xl bg-gray-900/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">KYC Status</h2>
            {getStatusIcon(kycStatus.kycStatus)}
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-2xl font-bold">{getStatusText(kycStatus.kycStatus)}</div>
          </div>
          {kycStatus.kycStatus === 'verified' && (
            <div className="text-sm text-gray-400">
              Verified on {new Date(kycStatus.kycVerifiedAt!).toLocaleDateString()}
            </div>
          )}
          {kycStatus.kycStatus === 'pending' && (
            <div className="text-sm text-yellow-400">
              Submitted on {new Date(kycStatus.kycSubmittedAt!).toLocaleDateString()}.
              We will review within 24-48 hours.
            </div>
          )}
        </div>

        {/* KYC Form (only show if not submitted or rejected) */}
        {(kycStatus.kycStatus === 'none' || kycStatus.kycStatus === 'rejected') && (
          <div className="mb-8 p-6 border border-white/10 rounded-xl bg-gray-900/30">
            <h2 className="text-xl font-bold mb-6">Submit KYC Application</h2>

            <form onSubmit={handleKYCSubmit} className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  <FiUser className="inline mr-2" />
                  Full Legal Name
                </label>
                <input
                  type="text"
                  value={fullLegalName}
                  onChange={(e) => setFullLegalName(e.target.value)}
                  required
                  placeholder="As it appears on your ID document"
                  className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  <FiGlobe className="inline mr-2" />
                  Nationality
                </label>
                <select
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  required
                  className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-green-500"
                >
                  <option value="">Select nationality...</option>
                  {NATIONALITIES.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  <FiFileText className="inline mr-2" />
                  Document Type
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  required
                  className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-green-500"
                >
                  {DOCUMENT_TYPES.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Document Reference (Optional)
                </label>
                <input
                  type="text"
                  value={documentRef}
                  onChange={(e) => setDocumentRef(e.target.value)}
                  placeholder="Last 4 digits or reference number"
                  className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  We may contact you to verify your identity
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-green-600 text-white font-bold hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit KYC Application'}
              </button>
            </form>
          </div>
        )}

        {/* Holdings Registration (only show if KYC verified) */}
        {kycStatus.kycStatus === 'verified' && (
          <div className="p-6 border border-white/10 rounded-xl bg-gray-900/30">
            <h2 className="text-xl font-bold mb-6">Register Your Holdings</h2>
            <p className="text-gray-400 mb-6">
              Register your equity-class token holdings to receive dividends and voting rights.
            </p>

            {holdings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>You don't have any equity-class tokens yet.</p>
                <Link href="/exchange" className="text-green-400 hover:underline mt-2 inline-block">
                  Acquire tokens on the exchange →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {holdings.map((holding) => (
                  <div
                    key={holding.id}
                    className={`p-4 border rounded-lg flex items-center justify-between ${
                      holding.registered
                        ? 'border-green-500/50 bg-green-900/20'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        {holding.token_id}
                        {holding.registered && (
                          <FiCheckCircle className="text-green-400" size={16} />
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{holding.token_name}</div>
                      <div className="text-sm font-mono text-gray-400 mt-1">
                        {holding.balance.toLocaleString()} tokens
                      </div>
                      <div className="flex gap-2 mt-2">
                        {holding.confers_dividends && (
                          <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                            DIVIDENDS
                          </span>
                        )}
                        {holding.confers_voting && (
                          <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                            VOTING
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      {holding.registered ? (
                        <span className="text-green-400 font-bold">Registered</span>
                      ) : (
                        <button
                          onClick={() => handleRegisterHolding(holding.id)}
                          disabled={registeringHoldingId === holding.id}
                          className="px-4 py-2 bg-green-600 text-white font-bold hover:bg-green-500 disabled:opacity-50 transition-colors"
                        >
                          {registeringHoldingId === holding.id ? 'Registering...' : 'Register'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 p-6 border border-white/10 rounded-xl bg-gray-900/30">
          <h3 className="font-bold text-white mb-4">Why Register?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-400">
            <div>
              <div className="text-white font-bold mb-2">Dividend Rights</div>
              <p>
                Registered holders receive their proportional share of dividend distributions.
                Without registration, you can still buy/sell and serve content, but won't receive dividends.
              </p>
            </div>
            <div>
              <div className="text-white font-bold mb-2">Voting Rights</div>
              <p>
                Participate in governance votes on token policies, distributions, and other decisions.
                Your vote weight depends on your holdings and the vote type.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Link
            href="/exchange"
            className="text-gray-500 hover:text-white transition-colors"
          >
            ← Back to Exchange
          </Link>
          <Link
            href="/exchange/registry"
            className="text-green-400 hover:text-green-300 transition-colors flex items-center gap-2"
          >
            View Public Registry <FiArrowRight />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
