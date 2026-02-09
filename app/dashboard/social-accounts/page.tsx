'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiTwitter, FiArrowRight, FiClock, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface SocialAccount {
  id: string;
  site: string;
  platform: string;
  handle: string;
  profile_url: string;
  active: boolean;
  queue_count?: number;
  posted_count?: number;
}

export default function CronJobsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    site: '',
    platform: 'twitter',
    handle: '',
    profile_url: '',
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      const res = await fetch('/api/cron/accounts');
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error('Error fetching social accounts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddAccount(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch('/api/cron/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowAddForm(false);
        setFormData({ site: '', platform: 'twitter', handle: '', profile_url: '' });
        await fetchAccounts();
      } else {
        const error = await res.json();
        alert(`Failed to add account: ${error.message}`);
      }
    } catch (error) {
      console.error('Error adding account:', error);
      alert('Failed to add account');
    }
  }

  async function handleDeleteAccount(id: string, site: string, handle: string) {
    if (!confirm(`Delete ${site} - ${handle}? This will also delete all queued and posted content for this account.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/cron/accounts/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchAccounts();
      } else {
        alert('Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    }
  }

  async function handleToggleActive(id: string, currentActive: boolean) {
    try {
      const res = await fetch(`/api/cron/accounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (res.ok) {
        await fetchAccounts();
      }
    } catch (error) {
      console.error('Error toggling account:', error);
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return <FiTwitter size={24} />;
      default:
        return <FiClock size={24} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">
        <div className="text-zinc-500">Loading accounts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">CRON JOBS</h1>
              <p className="text-zinc-500">Manage scheduled posts across all sites and accounts</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-white text-black font-bold hover:bg-zinc-200 transition-colors inline-flex items-center gap-2"
            >
              <FiPlus size={16} />
              Add Account
            </button>
          </div>
        </header>

        {/* Add Account Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 border border-zinc-800 bg-zinc-950 p-6"
          >
            <h2 className="text-xl font-bold mb-4">Add Social Account</h2>
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Site/Project Name</label>
                  <input
                    type="text"
                    value={formData.site}
                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                    placeholder="e.g., b0ase.com"
                    className="w-full px-4 py-2 bg-black border border-zinc-800 text-white focus:border-white outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Platform</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full px-4 py-2 bg-black border border-zinc-800 text-white focus:border-white outline-none"
                  >
                    <option value="twitter">Twitter</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Handle</label>
                  <input
                    type="text"
                    value={formData.handle}
                    onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                    placeholder="@username"
                    className="w-full px-4 py-2 bg-black border border-zinc-800 text-white focus:border-white outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Profile URL</label>
                  <input
                    type="url"
                    value={formData.profile_url}
                    onChange={(e) => setFormData({ ...formData, profile_url: e.target.value })}
                    placeholder="https://x.com/username"
                    className="w-full px-4 py-2 bg-black border border-zinc-800 text-white focus:border-white outline-none"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-white text-black font-bold hover:bg-zinc-200 transition-colors"
                >
                  Add Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ site: '', platform: 'twitter', handle: '', profile_url: '' });
                  }}
                  className="px-6 py-2 border border-zinc-800 text-white hover:bg-zinc-900 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Accounts List */}
        <div className="grid grid-cols-1 gap-4">
          {accounts.map((account, index) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-zinc-800 bg-zinc-950 hover:border-zinc-700 transition-all p-6"
            >
              <div className="flex items-center justify-between">
                <Link
                  href={`/dashboard/cron-jobs/${account.site}/${encodeURIComponent(account.handle)}`}
                  className="flex-1 flex items-center gap-4"
                >
                  <div className="text-zinc-400">
                    {getPlatformIcon(account.platform)}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white">{account.site}</h2>
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <span className="uppercase">{account.platform}</span>
                      <span>•</span>
                      <span>{account.handle}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        {account.queue_count || 0}
                      </div>
                      <div className="text-xs text-zinc-500 uppercase">Queued</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-zinc-600">
                        {account.posted_count || 0}
                      </div>
                      <div className="text-xs text-zinc-500 uppercase">Posted</div>
                    </div>
                    <FiArrowRight className="text-zinc-600" size={20} />
                  </div>
                </Link>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleToggleActive(account.id, account.active)}
                    className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                      account.active
                        ? 'bg-green-900/30 text-green-500 border border-green-700'
                        : 'bg-red-900/30 text-red-500 border border-red-700'
                    }`}
                    title={account.active ? 'Deactivate account' : 'Activate account'}
                  >
                    {account.active ? 'Active' : 'Inactive'}
                  </button>
                  <Link
                    href={`/dashboard/cron-jobs/edit/${account.id}`}
                    className="p-2 text-zinc-500 hover:text-white transition-colors"
                    title="Edit account"
                  >
                    <FiEdit2 size={16} />
                  </Link>
                  <button
                    onClick={() => handleDeleteAccount(account.id, account.site, account.handle)}
                    className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                    title="Delete account"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {accounts.length === 0 && !showAddForm && (
          <div className="text-center py-12 text-zinc-500">
            No social accounts configured. Click "Add Account" to get started.
          </div>
        )}
      </div>
    </div>
  );
}
