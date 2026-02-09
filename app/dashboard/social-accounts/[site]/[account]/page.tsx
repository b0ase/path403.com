'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiClock,
  FiExternalLink,
  FiSend,
  FiTrash2,
  FiCheckCircle,
  FiEdit2,
  FiAlertCircle,
  FiCheck,
  FiX,
  FiRefreshCw,
} from 'react-icons/fi';
import { motion } from 'framer-motion';

interface QueuedPost {
  id: string;
  post_content: string;
  scheduled_for: string | null;
  status: string;
  created_at: string;
  metadata?: any;
}

interface PostedContent {
  id: string;
  post_content: string;
  post_url: string | null;
  platform_post_id: string | null;
  posted_at: string;
  metrics: any;
}

interface TweetValidation {
  valid: boolean;
  issues: string[];
  score: number;
}

export default function AccountQueuePage() {
  const params = useParams();
  const site = params.site as string;
  const account = decodeURIComponent(params.account as string);

  const [tab, setTab] = useState<'pending' | 'queue' | 'posted'>('pending');
  const [pending, setPending] = useState<QueuedPost[]>([]);
  const [queue, setQueue] = useState<QueuedPost[]>([]);
  const [posted, setPosted] = useState<PostedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [validation, setValidation] = useState<TweetValidation | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [site, account]);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/cron/queue?site=${site}&account=${encodeURIComponent(account)}`
      );
      if (res.ok) {
        const data = await res.json();
        setPending(data.pending || []);
        setQueue(data.queue || []);
        setPosted(data.posted || []);
        // Auto-switch to pending tab if there are items to review
        if (data.pending?.length > 0) {
          setTab('pending');
        } else if (data.queue?.length > 0) {
          setTab('queue');
        }
      }
    } catch (error) {
      console.error('Error fetching queue data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function postNext() {
    if (queue.length === 0) return;

    setPosting(true);
    try {
      const res = await fetch('/api/cron/post-next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site, account }),
      });

      if (res.ok) {
        await fetchData();
      } else {
        const error = await res.json();
        alert(`Failed to post: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error posting:', error);
      alert('Failed to post');
    } finally {
      setPosting(false);
    }
  }

  async function deleteQueueItem(id: string) {
    if (!confirm('Delete this post?')) return;

    try {
      const res = await fetch(`/api/cron/queue/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error deleting queue item:', error);
    }
  }

  function startEditing(item: QueuedPost) {
    setEditingId(item.id);
    setEditContent(item.post_content);
    validateContent(item.post_content);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditContent('');
    setValidation(null);
  }

  function validateContent(content: string) {
    const issues: string[] = [];
    let score = 100;

    const hashtags = content.match(/#\w+/g) || [];
    if (hashtags.length > 0) {
      issues.push(`Contains ${hashtags.length} hashtag(s) - remove them`);
      score -= hashtags.length * 10;
    }

    const urlMatch = content.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      const urlIndex = content.indexOf(urlMatch[0]);
      if (urlIndex < content.length * 0.7) {
        issues.push('URL should be at the end');
        score -= 15;
      }
    }

    if (!content.includes('?')) {
      issues.push('No question - add one to drive replies');
      score -= 10;
    }

    const cleanContent = content.replace(/https?:\/\/[^\s]+/, '').trim();
    if (cleanContent.length > 270) {
      issues.push('Text exceeds 270 chars (excluding URL)');
      score -= 20;
    }

    setValidation({
      valid: issues.length === 0,
      issues,
      score: Math.max(0, score),
    });
  }

  async function saveEdit(id: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/cron/queue/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_content: editContent }),
      });

      if (res.ok) {
        const data = await res.json();
        setValidation(data.validation);
        await fetchData();
        setEditingId(null);
      } else {
        alert('Failed to save');
      }
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  }

  async function approveItem(id: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/cron/queue/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'queued' }),
      });

      if (res.ok) {
        await fetchData();
      } else {
        alert('Failed to approve');
      }
    } catch (error) {
      console.error('Error approving:', error);
    } finally {
      setSaving(false);
    }
  }

  async function rejectItem(id: string) {
    if (!confirm('Reject this tweet? It will be removed.')) return;

    try {
      const res = await fetch(`/api/cron/queue/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error rejecting:', error);
    }
  }

  function getScoreColor(score: number) {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">
        <div className="text-zinc-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8">
          <Link
            href="/dashboard/social-accounts"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-4 text-sm"
          >
            <FiArrowLeft size={16} />
            Back to Accounts
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{site}</h1>
              <p className="text-zinc-500">{account}</p>
            </div>
            <button
              onClick={fetchData}
              className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors inline-flex items-center gap-2"
            >
              <FiRefreshCw size={16} />
              Refresh
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-zinc-800">
          <button
            onClick={() => setTab('pending')}
            className={`pb-3 px-4 text-sm uppercase tracking-wider transition-colors relative ${
              tab === 'pending'
                ? 'text-white border-b-2 border-orange-500'
                : 'text-zinc-500 hover:text-zinc-400'
            }`}
          >
            Review ({pending.length})
            {pending.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setTab('queue')}
            className={`pb-3 px-4 text-sm uppercase tracking-wider transition-colors ${
              tab === 'queue'
                ? 'text-white border-b-2 border-white'
                : 'text-zinc-500 hover:text-zinc-400'
            }`}
          >
            Ready ({queue.length})
          </button>
          <button
            onClick={() => setTab('posted')}
            className={`pb-3 px-4 text-sm uppercase tracking-wider transition-colors ${
              tab === 'posted'
                ? 'text-white border-b-2 border-white'
                : 'text-zinc-500 hover:text-zinc-400'
            }`}
          >
            Posted ({posted.length})
          </button>
        </div>

        {/* Pending Review Tab */}
        {tab === 'pending' && (
          <div className="space-y-4">
            {pending.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <FiCheckCircle size={48} className="mx-auto mb-4 text-green-600" />
                <p>No tweets pending review</p>
                <p className="text-sm mt-2">
                  New auto-generated tweets will appear here for approval
                </p>
              </div>
            ) : (
              pending.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-orange-900/50 bg-zinc-950 p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 text-xs text-orange-500 uppercase">
                      <FiAlertCircle size={14} />
                      Pending Review
                      {item.metadata?.template && (
                        <span className="ml-2 text-zinc-500">
                          • Template: {item.metadata.template}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {editingId !== item.id && (
                        <>
                          <button
                            onClick={() => startEditing(item)}
                            className="text-zinc-500 hover:text-white transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => approveItem(item.id)}
                            disabled={saving}
                            className="text-green-600 hover:text-green-500 transition-colors"
                            title="Approve"
                          >
                            <FiCheck size={18} />
                          </button>
                          <button
                            onClick={() => rejectItem(item.id)}
                            className="text-red-600 hover:text-red-500 transition-colors"
                            title="Reject"
                          >
                            <FiX size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {editingId === item.id ? (
                    <div className="space-y-4">
                      <textarea
                        value={editContent}
                        onChange={(e) => {
                          setEditContent(e.target.value);
                          validateContent(e.target.value);
                        }}
                        className="w-full h-40 px-4 py-3 bg-black border border-zinc-700 text-white focus:border-orange-500 outline-none resize-none font-mono text-sm"
                        placeholder="Edit tweet content..."
                      />

                      {validation && (
                        <div className="p-4 bg-zinc-900 border border-zinc-800">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-zinc-400">
                              Engagement Score:
                            </span>
                            <span
                              className={`text-lg font-bold ${getScoreColor(validation.score)}`}
                            >
                              {validation.score}/100
                            </span>
                          </div>
                          {validation.issues.length > 0 && (
                            <ul className="space-y-1">
                              {validation.issues.map((issue, i) => (
                                <li
                                  key={i}
                                  className="text-sm text-yellow-500 flex items-center gap-2"
                                >
                                  <FiAlertCircle size={12} />
                                  {issue}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(item.id)}
                          disabled={saving}
                          className="px-4 py-2 bg-white text-black font-bold hover:bg-zinc-200 disabled:bg-zinc-700 disabled:text-zinc-500 transition-colors"
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="px-4 py-2 border border-zinc-800 text-white hover:bg-zinc-900 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-white whitespace-pre-wrap">
                      {item.post_content}
                    </p>
                  )}

                  <div className="mt-4 text-xs text-zinc-600">
                    Generated {new Date(item.created_at).toLocaleString()}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Queue Tab */}
        {tab === 'queue' && (
          <div className="space-y-4">
            {queue.length > 0 && (
              <div className="mb-6">
                <button
                  onClick={postNext}
                  disabled={posting}
                  className="px-6 py-3 bg-white text-black font-bold hover:bg-zinc-200 disabled:bg-zinc-700 disabled:text-zinc-500 transition-colors inline-flex items-center gap-2"
                >
                  <FiSend size={16} />
                  {posting ? 'Posting...' : 'Post Next in Queue'}
                </button>
              </div>
            )}

            {queue.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <p>No approved tweets ready to post</p>
                <p className="text-sm mt-2">
                  Approve tweets from the Review tab to add them here
                </p>
              </div>
            ) : (
              queue.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-zinc-800 bg-zinc-950 p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase">
                      <FiClock size={14} />
                      {index === 0 ? 'Next' : `#${index + 1}`}
                      {item.scheduled_for && (
                        <span className="ml-2">
                          • Scheduled:{' '}
                          {new Date(item.scheduled_for).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => deleteQueueItem(item.id)}
                      className="text-zinc-600 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                  <p className="text-white whitespace-pre-wrap">
                    {item.post_content}
                  </p>
                  <div className="mt-4 text-xs text-zinc-600">
                    Created {new Date(item.created_at).toLocaleString()}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Posted Tab */}
        {tab === 'posted' && (
          <div className="space-y-4">
            {posted.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">No posts yet.</div>
            ) : (
              posted.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-zinc-800 bg-zinc-950 p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 text-xs text-green-600 uppercase">
                      <FiCheckCircle size={14} />
                      Posted {new Date(item.posted_at).toLocaleString()}
                    </div>
                    {item.post_url && (
                      <a
                        href={item.post_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-500 hover:text-white transition-colors inline-flex items-center gap-1"
                      >
                        <span className="text-xs">View</span>
                        <FiExternalLink size={14} />
                      </a>
                    )}
                  </div>
                  <p className="text-white whitespace-pre-wrap">
                    {item.post_content}
                  </p>
                  {item.metrics && (
                    <div className="mt-4 text-xs text-zinc-600">
                      Metrics: {JSON.stringify(item.metrics)}
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
