'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface Purchase {
  id: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  token_ticker: string;
  token_name: string;
  token_amount: string;
  usd_amount: string;
  price_per_token: string;
  payment_method: string;
  payment_currency: string;
  payment_amount: string;
  crypto_address?: string;
  crypto_txid?: string;
  status: string;
  notes?: string;
  created_at: string;
  confirmed_at?: string;
}

export default function AdminPurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('pending');

  const fetchPurchases = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/purchases?status=${filter === 'all' ? '' : filter}`);
      if (!res.ok) throw new Error('Failed to fetch purchases');
      const data = await res.json();
      setPurchases(data.purchases || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load purchases');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const handleConfirm = async (purchaseId: string, txid?: string) => {
    if (!confirm('Are you sure you want to confirm this purchase? This will credit tokens to the user.')) {
      return;
    }

    setConfirming(purchaseId);
    try {
      const res = await fetch('/api/admin/purchases/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseId, cryptoTxid: txid }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to confirm purchase');
      }

      await fetchPurchases();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to confirm purchase');
    } finally {
      setConfirming(null);
    }
  };

  const handleCancel = async (purchaseId: string) => {
    const reason = prompt('Enter cancellation reason:');
    if (!reason) return;

    setConfirming(purchaseId);
    try {
      const res = await fetch('/api/admin/purchases/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseId, reason }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to cancel purchase');
      }

      await fetchPurchases();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to cancel purchase');
    } finally {
      setConfirming(null);
    }
  };

  const formatAmount = (amount: string, currency: string) => {
    const num = parseFloat(amount);
    if (currency === 'USD' || currency === 'GBP' || currency === 'EUR') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
      }).format(num);
    }
    return `${num.toFixed(8)} ${currency}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'confirmed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'refunded': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    if (method === 'stripe') return 'Card (Stripe)';
    if (method === 'wire') return 'Wire Transfer';
    if (method.startsWith('crypto_')) return method.replace('crypto_', '').toUpperCase();
    return method;
  };

  return (
    <motion.div
      className="min-h-screen bg-black text-white selection:bg-cyan-500/30 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.section
        className="px-4 md:px-8 py-16 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <motion.div
          className="mb-12 border-b border-zinc-800 pb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
            <div className="bg-zinc-900/50 p-4 md:p-6 border border-zinc-800 self-start">
              <svg className="w-12 h-12 md:w-16 md:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                ADMIN_PURCHASES
              </h1>
              <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                TOKEN_MANAGEMENT
              </div>
            </div>
          </div>
          <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
            Review and confirm pending token purchases. Confirming a purchase credits tokens to the user account.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex gap-2 mb-8">
          {(['pending', 'confirmed', 'completed', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === f
                  ? 'bg-white text-black'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          {loading ? (
            <div className="text-center py-12 text-zinc-500">Loading purchases...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-400">{error}</div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              No {filter === 'all' ? '' : filter} purchases found.
            </div>
          ) : (
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Purchase Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(purchase.status)}`}>
                          {purchase.status.toUpperCase()}
                        </span>
                        <span className="text-zinc-500 text-sm font-mono">
                          {purchase.id.slice(0, 8)}...
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-xs text-zinc-500 uppercase">User</div>
                          <div className="text-white">
                            {purchase.user_name || purchase.user_email || purchase.user_id.slice(0, 8)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-zinc-500 uppercase">Token</div>
                          <div className="text-white font-bold">${purchase.token_ticker}</div>
                          <div className="text-zinc-400 text-sm">{purchase.token_name}</div>
                        </div>
                        <div>
                          <div className="text-xs text-zinc-500 uppercase">Amount</div>
                          <div className="text-white font-bold">
                            {Number(purchase.token_amount).toLocaleString()} tokens
                          </div>
                          <div className="text-zinc-400 text-sm">
                            {formatAmount(purchase.usd_amount, 'USD')}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-zinc-500 uppercase">Payment</div>
                          <div className="text-white">
                            {getPaymentMethodLabel(purchase.payment_method)}
                          </div>
                          <div className="text-zinc-400 text-sm">
                            {formatAmount(purchase.payment_amount, purchase.payment_currency)}
                          </div>
                        </div>
                      </div>

                      {purchase.crypto_address && (
                        <div className="text-sm">
                          <span className="text-zinc-500">Treasury Address: </span>
                          <code className="text-cyan-400 bg-zinc-800 px-2 py-0.5 rounded">
                            {purchase.crypto_address}
                          </code>
                        </div>
                      )}

                      {purchase.notes && (
                        <div className="text-sm text-zinc-400 italic">
                          Note: {purchase.notes}
                        </div>
                      )}

                      <div className="text-xs text-zinc-500">
                        Created: {new Date(purchase.created_at).toLocaleString()}
                        {purchase.confirmed_at && (
                          <span> | Confirmed: {new Date(purchase.confirmed_at).toLocaleString()}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {purchase.status === 'pending' && (
                      <div className="flex gap-2 lg:flex-col">
                        <button
                          onClick={() => handleConfirm(purchase.id)}
                          disabled={confirming === purchase.id}
                          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                          {confirming === purchase.id ? 'Processing...' : 'Confirm Payment'}
                        </button>
                        <button
                          onClick={() => handleCancel(purchase.id)}
                          disabled={confirming === purchase.id}
                          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.section>
    </motion.div>
  );
}
