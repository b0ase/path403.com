'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiFileText, FiCheck, FiX, FiClock, FiUser, FiMail,
  FiDollarSign, FiLink, FiEdit3, FiShield, FiLock,
  FiCheckCircle, FiAlertCircle, FiExternalLink, FiCopy
} from 'react-icons/fi';
import { SiBitcoin } from 'react-icons/si';

interface ContractParty {
  name: string;
  email: string;
  wallet?: string;
  companyName?: string;
  signed: boolean;
  signedAt?: string;
}

interface ContractData {
  id: string;
  title: string;
  description: string;
  status: string;
  phase: string;
  client: ContractParty;
  contractor: ContractParty;
  content: string;
  contentHash: string;
  paymentAmount: number;
  paymentCurrency: string;
  paymentSchedule: string;
  deliverables: { title: string; description: string }[];
  createdAt: string;
  inscribed: boolean;
  inscriptionTxId?: string;
  inscriptionUrl?: string;
}

export default function SignContractPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.contractId as string;

  const [contract, setContract] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signMethod, setSignMethod] = useState<'wallet' | 'email'>('email');
  const [walletType, setWalletType] = useState<'bsv' | 'eth' | 'sol'>('bsv');
  const [emailCode, setEmailCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch contract details
  useEffect(() => {
    async function fetchContract() {
      try {
        const res = await fetch(`/api/contracts/${contractId}`);
        if (res.ok) {
          const data = await res.json();
          setContract(data);
        } else {
          // Demo contract for testing
          setContract({
            id: contractId,
            title: 'Twitter/X Content Manager - Service Agreement',
            description: 'Social media management contract',
            status: 'pending_sign',
            phase: 'marketing',
            client: {
              name: 'b0ase Ventures',
              email: 'contracts@b0ase.com',
              companyName: 'b0ase Ltd',
              signed: false,
            },
            contractor: {
              name: 'Demo Applicant',
              email: 'applicant@example.com',
              signed: false,
            },
            content: `# Twitter/X Content Manager - Service Agreement

**Contract ID:** ${contractId}
**Date:** ${new Date().toLocaleDateString()}

## SCOPE OF WORK

The Contractor agrees to provide social media management services including:

1. **Content Creation**
   - 5 posts per week
   - Engaging threads and commentary
   - Graphics and visuals

2. **Community Management**
   - Daily monitoring
   - Response to mentions within 4 hours
   - Growth tactics

3. **Reporting**
   - Weekly metrics
   - Monthly analytics

## PAYMENT TERMS

**Total:** £400/month
**Schedule:** Monthly
**Escrow:** Yes (Stripe)`,
            contentHash: 'a1b2c3d4e5f6789...',
            paymentAmount: 400,
            paymentCurrency: 'GBP',
            paymentSchedule: 'Monthly',
            deliverables: [
              { title: 'Content Calendar', description: 'Monthly content plan' },
              { title: 'Daily Posts', description: '5 posts per week' },
              { title: 'Monthly Report', description: 'Analytics and insights' },
            ],
            createdAt: new Date().toISOString(),
            inscribed: false,
          });
        }
      } catch (err) {
        setError('Failed to load contract');
      } finally {
        setLoading(false);
      }
    }
    fetchContract();
  }, [contractId]);

  const handleSendCode = async () => {
    setError(null);
    try {
      const res = await fetch('/api/contracts/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId, method: 'email' }),
      });
      if (res.ok) {
        setCodeSent(true);
      } else {
        // Demo: simulate code sent
        setCodeSent(true);
      }
    } catch {
      // Demo mode
      setCodeSent(true);
    }
  };

  const handleSign = async () => {
    setSigning(true);
    setError(null);

    try {
      const res = await fetch('/api/contracts/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId,
          method: signMethod,
          walletType: signMethod === 'wallet' ? walletType : undefined,
          verificationCode: signMethod === 'email' ? emailCode : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update local state
        setContract(prev => prev ? {
          ...prev,
          contractor: { ...prev.contractor, signed: true, signedAt: new Date().toISOString() },
          status: prev.client.signed ? 'signed' : 'partially_signed',
          inscribed: data.inscribed || false,
          inscriptionTxId: data.inscriptionTxId,
          inscriptionUrl: data.inscriptionUrl,
        } : null);
      } else {
        // Demo: simulate successful sign
        setContract(prev => prev ? {
          ...prev,
          contractor: { ...prev.contractor, signed: true, signedAt: new Date().toISOString() },
          status: 'partially_signed',
        } : null);
      }
    } catch {
      // Demo mode: simulate sign
      setContract(prev => prev ? {
        ...prev,
        contractor: { ...prev.contractor, signed: true, signedAt: new Date().toISOString() },
        status: 'partially_signed',
      } : null);
    } finally {
      setSigning(false);
    }
  };

  const copyHash = () => {
    if (contract?.contentHash) {
      navigator.clipboard.writeText(contract.contentHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-zinc-500">Loading contract...</p>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="text-red-400 text-4xl mx-auto mb-4" />
          <p className="text-zinc-400">Contract not found</p>
          <Link href="/gigs" className="text-white hover:underline mt-4 inline-block">
            Back to Gigs
          </Link>
        </div>
      </div>
    );
  }

  const allSigned = contract.client.signed && contract.contractor.signed;

  return (
    <motion.div
      className="min-h-screen bg-black text-white font-mono"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="px-4 md:px-8 py-16">
        {/* Header */}
        <div className="mb-8 border-b border-zinc-800 pb-8">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 border flex items-center justify-center shrink-0 ${
              allSigned ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'
            }`}>
              <FiFileText className={allSigned ? 'text-emerald-400 text-xl' : 'text-amber-400 text-xl'} />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">
                {contract.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className={`text-xs px-2 py-1 border ${
                  allSigned
                    ? 'border-emerald-500/50 text-emerald-400'
                    : contract.status === 'partially_signed'
                    ? 'border-amber-500/50 text-amber-400'
                    : 'border-zinc-700 text-zinc-400'
                }`}>
                  {allSigned ? 'FULLY SIGNED' : contract.status.toUpperCase().replace('_', ' ')}
                </span>
                <span className="text-xs text-zinc-500">ID: {contract.id}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contract Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Parties */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Client */}
              <div className={`border p-4 ${contract.client.signed ? 'border-emerald-500/30 bg-emerald-900/10' : 'border-zinc-800'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-zinc-500 uppercase">Client</span>
                  {contract.client.signed ? (
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                      <FiCheck size={10} /> Signed
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-500 flex items-center gap-1">
                      <FiClock size={10} /> Pending
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold">{contract.client.name}</p>
                {contract.client.companyName && (
                  <p className="text-xs text-zinc-500">{contract.client.companyName}</p>
                )}
                <p className="text-xs text-zinc-600 mt-1">{contract.client.email}</p>
              </div>

              {/* Contractor */}
              <div className={`border p-4 ${contract.contractor.signed ? 'border-emerald-500/30 bg-emerald-900/10' : 'border-zinc-800'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-zinc-500 uppercase">Contractor</span>
                  {contract.contractor.signed ? (
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                      <FiCheck size={10} /> Signed
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-500 flex items-center gap-1">
                      <FiClock size={10} /> Pending
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold">{contract.contractor.name}</p>
                <p className="text-xs text-zinc-600 mt-1">{contract.contractor.email}</p>
              </div>
            </div>

            {/* Contract Content Preview */}
            <div className="border border-zinc-800">
              <div className="bg-zinc-900/50 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase">Contract Terms</span>
                <button
                  onClick={copyHash}
                  className="text-[10px] text-zinc-500 hover:text-white flex items-center gap-1"
                >
                  <FiCopy size={10} />
                  {copied ? 'Copied!' : 'Copy Hash'}
                </button>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                <pre className="text-xs text-zinc-400 whitespace-pre-wrap font-mono">
                  {contract.content}
                </pre>
              </div>
            </div>

            {/* Deliverables */}
            <div className="border border-zinc-800">
              <div className="bg-zinc-900/50 px-4 py-3 border-b border-zinc-800">
                <span className="text-xs font-bold text-zinc-400 uppercase">Deliverables</span>
              </div>
              <div className="divide-y divide-zinc-800">
                {contract.deliverables.map((del, i) => (
                  <div key={i} className="p-4">
                    <p className="text-sm font-bold">{del.title}</p>
                    <p className="text-xs text-zinc-500 mt-1">{del.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Hash */}
            <div className="bg-zinc-900/30 border border-zinc-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiShield className="text-amber-400" size={14} />
                <span className="text-xs text-zinc-400 uppercase">Content Hash (SHA-256)</span>
              </div>
              <p className="text-xs text-zinc-500 font-mono break-all">{contract.contentHash}</p>
            </div>
          </div>

          {/* Signing Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              {/* Payment Summary */}
              <div className="border border-zinc-800 p-6">
                <h3 className="text-sm font-bold uppercase text-zinc-400 mb-4">Payment Terms</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 text-sm">Amount</span>
                    <span className="text-emerald-400 font-bold">
                      {contract.paymentCurrency === 'GBP' ? '£' : ''}{contract.paymentAmount} {contract.paymentCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 text-sm">Schedule</span>
                    <span className="text-white text-sm">{contract.paymentSchedule}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 text-sm">Escrow</span>
                    <span className="text-emerald-400 text-sm">Protected</span>
                  </div>
                </div>
              </div>

              {/* Signing Section */}
              {!contract.contractor.signed ? (
                <div className="border border-emerald-500/30 bg-emerald-900/10 p-6">
                  <h3 className="text-sm font-bold uppercase text-emerald-400 mb-4 flex items-center gap-2">
                    <FiEdit3 size={14} /> Sign Contract
                  </h3>

                  {/* Sign Method Selection */}
                  <div className="space-y-3 mb-4">
                    <label className="block text-xs text-zinc-500 uppercase">Signature Method</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSignMethod('email')}
                        className={`p-3 border text-xs font-bold uppercase ${
                          signMethod === 'email'
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                            : 'border-zinc-700 text-zinc-500 hover:border-zinc-500'
                        }`}
                      >
                        <FiMail className="mx-auto mb-1" />
                        Email
                      </button>
                      <button
                        onClick={() => setSignMethod('wallet')}
                        className={`p-3 border text-xs font-bold uppercase ${
                          signMethod === 'wallet'
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                            : 'border-zinc-700 text-zinc-500 hover:border-zinc-500'
                        }`}
                      >
                        <SiBitcoin className="mx-auto mb-1" />
                        Wallet
                      </button>
                    </div>
                  </div>

                  {signMethod === 'email' && (
                    <div className="space-y-3">
                      {!codeSent ? (
                        <button
                          onClick={handleSendCode}
                          className="w-full py-2 border border-zinc-700 text-zinc-400 text-xs uppercase hover:border-white hover:text-white"
                        >
                          Send Verification Code
                        </button>
                      ) : (
                        <div>
                          <label className="block text-xs text-zinc-500 uppercase mb-1">Verification Code</label>
                          <input
                            type="text"
                            value={emailCode}
                            onChange={(e) => setEmailCode(e.target.value)}
                            className="w-full bg-black border border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                            placeholder="Enter 6-digit code"
                          />
                          <p className="text-[10px] text-zinc-600 mt-1">Code sent to your email (demo: use any code)</p>
                        </div>
                      )}
                    </div>
                  )}

                  {signMethod === 'wallet' && (
                    <div className="space-y-3">
                      <label className="block text-xs text-zinc-500 uppercase">Wallet Type</label>
                      <select
                        value={walletType}
                        onChange={(e) => setWalletType(e.target.value as any)}
                        className="w-full bg-black border border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                      >
                        <option value="bsv">BSV (HandCash/Yours)</option>
                        <option value="eth">ETH (MetaMask)</option>
                        <option value="sol">SOL (Phantom)</option>
                      </select>
                    </div>
                  )}

                  {error && (
                    <div className="mt-3 p-2 bg-red-900/20 border border-red-500/30 text-xs text-red-400">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleSign}
                    disabled={signing || (signMethod === 'email' && !codeSent)}
                    className="w-full mt-4 py-3 bg-emerald-600 text-white font-bold uppercase tracking-wider hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {signing ? 'Signing...' : (
                      <>
                        <FiCheck /> Sign Contract
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-zinc-600 mt-3 text-center">
                    By signing, you agree to the contract terms and authorize blockchain inscription.
                  </p>
                </div>
              ) : (
                <div className="border border-emerald-500/30 bg-emerald-900/10 p-6 text-center">
                  <FiCheckCircle className="text-emerald-400 text-3xl mx-auto mb-3" />
                  <h3 className="text-sm font-bold uppercase text-emerald-400 mb-2">You've Signed</h3>
                  <p className="text-xs text-zinc-400">
                    {allSigned
                      ? 'Contract is fully executed and will be inscribed on-chain.'
                      : 'Waiting for the other party to sign.'}
                  </p>
                  {contract.contractor.signedAt && (
                    <p className="text-[10px] text-zinc-600 mt-2">
                      Signed: {new Date(contract.contractor.signedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Inscription Status */}
              {contract.inscribed && (
                <div className="border border-amber-500/30 bg-amber-900/10 p-6">
                  <h3 className="text-sm font-bold uppercase text-amber-400 mb-3 flex items-center gap-2">
                    <FiLink size={14} /> On-Chain Inscription
                  </h3>
                  <p className="text-xs text-zinc-400 mb-3">
                    This contract has been inscribed on the BSV blockchain.
                  </p>
                  {contract.inscriptionUrl && (
                    <a
                      href={contract.inscriptionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      View on Explorer <FiExternalLink size={10} />
                    </a>
                  )}
                  {contract.inscriptionTxId && (
                    <p className="text-[10px] text-zinc-600 mt-2 font-mono break-all">
                      TxID: {contract.inscriptionTxId}
                    </p>
                  )}
                </div>
              )}

              {/* Help */}
              <div className="border border-zinc-800 p-4">
                <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Need Help?</h4>
                <p className="text-[10px] text-zinc-600">
                  Questions about this contract? Contact{' '}
                  <a href="mailto:support@b0ase.com" className="text-white hover:underline">
                    support@b0ase.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
