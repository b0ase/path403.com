'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiTrash2,
  FiCheck,
  FiLoader,
  FiShield,
  FiExternalLink,
  FiClock,
  FiAlertCircle,
} from 'react-icons/fi';
import { SignatureDisplay } from '@/components/bitsign';

interface UserSignature {
  id: string;
  signature_name: string;
  signature_type: 'drawn' | 'typed';
  svg_data?: string;
  typed_text?: string;
  typed_font?: string;
  wallet_address?: string;
  wallet_type?: string;
  inscription_txid?: string;
  inscription_url?: string;
  inscribed_at?: string;
  is_default: boolean;
  created_at: string;
}

interface SigningHistoryEntry {
  id: string;
  document_type: string;
  document_title?: string;
  document_hash: string;
  wallet_address: string;
  signed_at: string;
  inscription_txid?: string;
  inscription_url?: string;
  signature?: {
    id: string;
    signature_name: string;
    signature_type: string;
  };
}

export default function SignaturesPage() {
  // Signatures state
  const [signatures, setSignatures] = useState<UserSignature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // History state
  const [history, setHistory] = useState<SigningHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Actions state
  const [inscribing, setInscribing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [settingDefault, setSettingDefault] = useState<string | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<'signatures' | 'history'>('signatures');

  // Fetch signatures
  const fetchSignatures = useCallback(async () => {
    try {
      const response = await fetch('/api/signatures');
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSignatures(data.signatures || []);
      }
    } catch (err) {
      setError('Failed to load signatures');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch history
  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/bitsign/history');
      const data = await response.json();

      if (!data.error) {
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSignatures();
    fetchHistory();
  }, [fetchSignatures, fetchHistory]);

  // Set signature as default
  const handleSetDefault = async (id: string) => {
    setSettingDefault(id);
    try {
      const response = await fetch(`/api/signatures/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_default: true }),
      });

      if (response.ok) {
        await fetchSignatures();
      }
    } catch (err) {
      console.error('Failed to set default:', err);
    } finally {
      setSettingDefault(null);
    }
  };

  // Delete signature
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this signature?')) return;

    setDeleting(id);
    try {
      const response = await fetch(`/api/signatures/${id}`, { method: 'DELETE' });

      if (response.ok) {
        setSignatures((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setDeleting(null);
    }
  };

  // Inscribe signature
  const handleInscribe = async (id: string) => {
    setInscribing(id);
    try {
      const response = await fetch(`/api/signatures/${id}/inscribe`, { method: 'POST' });
      const data = await response.json();

      if (response.ok) {
        await fetchSignatures();
        alert(`Signature inscribed! TX: ${data.inscription_txid}`);
      } else {
        alert(data.error || 'Failed to inscribe');
      }
    } catch (err) {
      console.error('Failed to inscribe:', err);
      alert('Failed to inscribe signature');
    } finally {
      setInscribing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <FiLoader className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight">Signatures</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Manage your BitSign digital signatures
          </p>
        </div>
        <Link
          href="/user/account/signatures/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors"
        >
          <FiPlus size={14} />
          New Signature
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('signatures')}
          className={`px-4 py-2 text-xs uppercase tracking-wider font-bold border-b-2 transition-colors ${activeTab === 'signatures'
              ? 'border-white text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
        >
          My Signatures ({signatures.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-xs uppercase tracking-wider font-bold border-b-2 transition-colors ${activeTab === 'history'
              ? 'border-white text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
        >
          Signing History ({history.length})
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* Signatures Tab */}
        {activeTab === 'signatures' && (
          <motion.div
            key="signatures"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {signatures.length === 0 ? (
              <div className="text-center py-16 bg-zinc-900/50 border border-dashed border-zinc-700 rounded-lg">
                <FiShield className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400 mb-4">No signatures yet</p>
                <Link
                  href="/user/account/signatures/create"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors"
                >
                  <FiPlus size={14} />
                  Create Your First Signature
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {signatures.map((sig) => (
                  <div
                    key={sig.id}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden"
                  >
                    {/* Signature Display */}
                    <div className="p-4">
                      <SignatureDisplay signature={sig} size="md" />
                    </div>

                    {/* Info & Actions */}
                    <div className="px-4 pb-4 space-y-3">
                      {/* Name */}
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{sig.signature_name}</span>
                        {sig.is_default && (
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] uppercase tracking-wider rounded">
                            Default
                          </span>
                        )}
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
                        <span className="capitalize">{sig.signature_type}</span>
                        {sig.wallet_address && (
                          <>
                            <span>•</span>
                            <span className="font-mono">
                              {sig.wallet_address.slice(0, 6)}...{sig.wallet_address.slice(-4)}
                            </span>
                          </>
                        )}
                        {sig.inscription_txid && (
                          <>
                            <span>•</span>
                            <a
                              href={sig.inscription_url || `https://whatsonchain.com/tx/${sig.inscription_txid}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline flex items-center gap-1"
                            >
                              On-chain <FiExternalLink size={10} />
                            </a>
                          </>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        {!sig.is_default && (
                          <button
                            onClick={() => handleSetDefault(sig.id)}
                            disabled={settingDefault === sig.id}
                            className="flex-1 px-3 py-2 text-xs bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 border border-zinc-700 rounded transition-colors flex items-center justify-center gap-1"
                          >
                            {settingDefault === sig.id ? (
                              <FiLoader className="animate-spin" size={12} />
                            ) : (
                              <FiCheck size={12} />
                            )}
                            Set Default
                          </button>
                        )}

                        {!sig.inscription_txid && (
                          <button
                            onClick={() => handleInscribe(sig.id)}
                            disabled={inscribing === sig.id}
                            className="flex-1 px-3 py-2 text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded transition-colors flex items-center justify-center gap-1"
                          >
                            {inscribing === sig.id ? (
                              <FiLoader className="animate-spin" size={12} />
                            ) : (
                              <FiShield size={12} />
                            )}
                            Inscribe
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(sig.id)}
                          disabled={deleting === sig.id}
                          className="px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-50 border border-zinc-700 rounded transition-colors"
                        >
                          {deleting === sig.id ? (
                            <FiLoader className="animate-spin" size={12} />
                          ) : (
                            <FiTrash2 size={12} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {historyLoading ? (
              <div className="flex items-center justify-center py-12">
                <FiLoader className="w-6 h-6 animate-spin text-zinc-500" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-16 bg-zinc-900/50 border border-dashed border-zinc-700 rounded-lg">
                <FiClock className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400">No documents signed yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">
                          {entry.document_title || 'Untitled Document'}
                        </h4>
                        <div className="flex flex-wrap gap-2 mt-1 text-xs text-zinc-500">
                          <span className="capitalize">{entry.document_type}</span>
                          <span>•</span>
                          <span className="font-mono">
                            {entry.document_hash.slice(0, 8)}...{entry.document_hash.slice(-8)}
                          </span>
                          <span>•</span>
                          <span>{new Date(entry.signed_at).toLocaleString()}</span>
                        </div>
                      </div>

                      {entry.inscription_txid && (
                        <a
                          href={entry.inscription_url || `https://whatsonchain.com/tx/${entry.inscription_txid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 text-[10px] bg-blue-500/20 text-blue-400 rounded flex items-center gap-1"
                        >
                          <FiShield size={10} />
                          On-chain
                        </a>
                      )}
                    </div>

                    {entry.signature && (
                      <div className="mt-2 pt-2 border-t border-zinc-800 text-xs text-zinc-500">
                        Signed with: {entry.signature.signature_name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
