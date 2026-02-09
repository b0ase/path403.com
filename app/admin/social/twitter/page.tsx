'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface SocialAccount {
  id: string;
  site: string;
  platform: string;
  handle: string;
  profile_url: string;
  active: boolean;
}

interface QueuedPost {
  id: string;
  social_account_id: string;
  account_handle?: string;
  post_content: string;
  scheduled_for: string | null;
  status: string;
  created_at: string;
}

interface PostedContent {
  id: string;
  account_handle?: string;
  post_content: string;
  post_url: string;
  platform_post_id: string;
  posted_at: string;
}

export default function AdminTwitterPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [queue, setQueue] = useState<QueuedPost[]>([]);
  const [posted, setPosted] = useState<PostedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState<string | null>(null);
  const [configStatus, setConfigStatus] = useState<{ configured: boolean; message: string } | null>(null);
  const [newPost, setNewPost] = useState({ accountId: '', content: '' });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/social/twitter');
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setAccounts(data.accounts || []);
      setQueue(data.queue || []);
      setPosted(data.posted || []);
      setConfigStatus(data.configStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePostNow = async (queuedPost: QueuedPost) => {
    const account = accounts.find(a => a.id === queuedPost.social_account_id);
    if (!account) {
      alert('Account not found');
      return;
    }

    if (!confirm(`Post this tweet to @${account.handle}?`)) return;

    setPosting(queuedPost.id);
    try {
      const res = await fetch('/api/cron/post-next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site: account.site, account: account.handle }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to post');
      }

      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to post');
    } finally {
      setPosting(null);
    }
  };

  const handleAddToQueue = async () => {
    if (!newPost.accountId || !newPost.content.trim()) {
      alert('Select an account and enter content');
      return;
    }

    try {
      const res = await fetch('/api/admin/social/twitter/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          socialAccountId: newPost.accountId,
          content: newPost.content,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add to queue');
      }

      setNewPost({ accountId: '', content: '' });
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add to queue');
    }
  };

  const handleDeleteFromQueue = async (postId: string) => {
    if (!confirm('Remove this post from queue?')) return;

    try {
      const res = await fetch(`/api/admin/social/twitter/queue?id=${postId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
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
        {/* Header */}
        <motion.div
          className="mb-12 border-b border-zinc-800 pb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
            <div className="bg-zinc-900/50 p-4 md:p-6 border border-zinc-800 self-start">
              <svg className="w-12 h-12 md:w-16 md:h-16 text-[#1DA1F2]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/>
              </svg>
            </div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                TWITTER_MANAGER
              </h1>
              <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                SOCIAL_AUTOMATION
              </div>
            </div>
          </div>
          <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
            Manage Twitter accounts, post queue, and view posting history.
          </p>
        </motion.div>

        {/* Config Status */}
        {configStatus && (
          <div className={`mb-8 p-4 rounded-lg border ${
            configStatus.configured
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
          }`}>
            <span className="font-mono text-sm">{configStatus.message}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-zinc-500">Loading...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-400">{error}</div>
        ) : (
          <div className="space-y-12">
            {/* Accounts */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-zinc-200">Connected Accounts</h2>
              {accounts.length === 0 ? (
                <p className="text-zinc-500">No Twitter accounts configured.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {accounts.map(account => (
                    <div
                      key={account.id}
                      className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${account.active ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div>
                          <div className="font-bold text-white">@{account.handle}</div>
                          <div className="text-sm text-zinc-500">{account.site}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* New Post Form */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-zinc-200">Add to Queue</h2>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Account</label>
                    <select
                      value={newPost.accountId}
                      onChange={e => setNewPost(prev => ({ ...prev, accountId: e.target.value }))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                    >
                      <option value="">Select account...</option>
                      {accounts.filter(a => a.active).map(account => (
                        <option key={account.id} value={account.id}>
                          @{account.handle} ({account.site})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">
                      Tweet Content ({280 - newPost.content.length} chars remaining)
                    </label>
                    <textarea
                      value={newPost.content}
                      onChange={e => setNewPost(prev => ({ ...prev, content: e.target.value.slice(0, 280) }))}
                      placeholder="What's happening?"
                      rows={4}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white resize-none"
                    />
                  </div>
                  <button
                    onClick={handleAddToQueue}
                    disabled={!newPost.accountId || !newPost.content.trim()}
                    className="px-6 py-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add to Queue
                  </button>
                </div>
              </div>
            </section>

            {/* Queue */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-zinc-200">
                Post Queue ({queue.length})
              </h2>
              {queue.length === 0 ? (
                <p className="text-zinc-500">No posts in queue.</p>
              ) : (
                <div className="space-y-4">
                  {queue.map(post => {
                    const account = accounts.find(a => a.id === post.social_account_id);
                    return (
                      <div
                        key={post.id}
                        className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="text-sm text-zinc-500 mb-2">
                              @{account?.handle || 'unknown'} · {post.status}
                              {post.scheduled_for && ` · Scheduled: ${new Date(post.scheduled_for).toLocaleString()}`}
                            </div>
                            <div className="text-white whitespace-pre-wrap">{post.post_content}</div>
                            <div className="text-xs text-zinc-600 mt-2">
                              Added: {new Date(post.created_at).toLocaleString()}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handlePostNow(post)}
                              disabled={posting === post.id || !configStatus?.configured}
                              className="px-3 py-1 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white text-sm rounded transition-colors disabled:opacity-50"
                            >
                              {posting === post.id ? 'Posting...' : 'Post Now'}
                            </button>
                            <button
                              onClick={() => handleDeleteFromQueue(post.id)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-sm rounded transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Posted History */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-zinc-200">
                Recently Posted ({posted.length})
              </h2>
              {posted.length === 0 ? (
                <p className="text-zinc-500">No posts yet.</p>
              ) : (
                <div className="space-y-4">
                  {posted.map(post => (
                    <div
                      key={post.id}
                      className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4"
                    >
                      <div className="text-sm text-zinc-500 mb-2">
                        Posted: {new Date(post.posted_at).toLocaleString()}
                      </div>
                      <div className="text-white whitespace-pre-wrap mb-2">{post.post_content}</div>
                      {post.post_url && (
                        <a
                          href={post.post_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1DA1F2] hover:underline text-sm"
                        >
                          View on Twitter
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </motion.section>
    </motion.div>
  );
}
