'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/Providers';
import {
  FiArrowLeft,
  FiPlus,
  FiTrash2,
  FiCheck,
  FiX,
  FiLink,
  FiFileText,
  FiGithub,
  FiTwitter,
  FiRefreshCw,
  FiFilter,
  FiTag,
  FiDownloadCloud,
} from 'react-icons/fi';

interface ContentIdea {
  id: string;
  url: string;
  title: string;
  source_type: 'article' | 'tweet' | 'repo' | 'manual';
  tags: string[];
  notes: string;
  used: boolean;
  created_at: string;
}

const SOURCE_TYPES = [
  { id: 'article', label: 'Article', icon: FiFileText },
  { id: 'tweet', label: 'Tweet', icon: FiTwitter },
  { id: 'repo', label: 'Repository', icon: FiGithub },
  { id: 'manual', label: 'Manual', icon: FiLink },
];

export default function ContentIdeasPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unused' | 'used'>('unused');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  // New idea form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    source_type: 'article' as const,
    tags: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [collectResult, setCollectResult] = useState<string | null>(null);

  const handleCollect = async () => {
    setCollecting(true);
    setCollectResult(null);

    try {
      const response = await fetch('/api/cron/collect-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          github: { topics: ['ai', 'llm', 'typescript', 'blockchain'] },
          twitter: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const added = (data.results?.github?.total?.added || 0) + (data.results?.twitter?.total?.added || 0);
        setCollectResult(`Collected ${added} new ideas`);
        fetchIdeas();
      } else {
        setCollectResult(`Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      setCollectResult('Failed to collect content');
    } finally {
      setCollecting(false);
      setTimeout(() => setCollectResult(null), 5000);
    }
  };

  const fetchIdeas = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.set('used', filter === 'used' ? 'true' : 'false');
      }
      if (sourceFilter !== 'all') {
        params.set('source_type', sourceFilter);
      }

      const response = await fetch(`/api/content-ideas?${params}`);
      if (response.ok) {
        const data = await response.json();
        setIdeas(data);
      }
    } catch (error) {
      console.error('Error fetching ideas:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filter, sourceFilter]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchIdeas();
    }
  }, [user, loading, router, fetchIdeas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/content-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: formData.url,
          title: formData.title || formData.url,
          source_type: formData.source_type,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        setFormData({ url: '', title: '', source_type: 'article', tags: '', notes: '' });
        setShowForm(false);
        fetchIdeas();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add idea');
      }
    } catch (error) {
      console.error('Error adding idea:', error);
      alert('Failed to add idea');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this content idea?')) return;

    try {
      const response = await fetch(`/api/content-ideas/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchIdeas();
      }
    } catch (error) {
      console.error('Error deleting idea:', error);
    }
  };

  const handleToggleUsed = async (id: string, currentUsed: boolean) => {
    try {
      const response = await fetch(`/api/content-ideas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ used: !currentUsed }),
      });

      if (response.ok) {
        fetchIdeas();
      }
    } catch (error) {
      console.error('Error updating idea:', error);
    }
  };

  const getSourceIcon = (type: string) => {
    const source = SOURCE_TYPES.find(s => s.id === type);
    if (!source) return FiLink;
    return source.icon;
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="px-4 md:px-8 py-16">
        <Link
          href="/dashboard/auto-book"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm mb-6"
        >
          <FiArrowLeft /> Back to Auto-Book
        </Link>

        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold mb-2">CONTENT IDEAS</h1>
            <p className="text-xs text-gray-500 tracking-widest uppercase">
              Source material for automated blog generation
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCollect}
              disabled={collecting}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all text-xs disabled:opacity-50"
            >
              <FiDownloadCloud className={collecting ? 'animate-pulse' : ''} />
              {collecting ? 'COLLECTING...' : 'COLLECT'}
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black font-bold hover:bg-gray-200 transition-all text-xs"
            >
              <FiPlus /> ADD IDEA
            </button>
          </div>
        </header>

        {/* Collection Result Toast */}
        {collectResult && (
          <div className={`mb-4 p-3 text-xs font-bold ${
            collectResult.startsWith('Error') || collectResult.startsWith('Failed')
              ? 'bg-red-900/30 border border-red-800 text-red-400'
              : 'bg-green-900/30 border border-green-800 text-green-400'
          }`}>
            {collectResult}
          </div>
        )}

        {/* Add Idea Form */}
        {showForm && (
          <div className="mb-8 border border-zinc-800 p-6 bg-zinc-950">
            <h2 className="text-sm font-bold mb-4 text-gray-400">NEW CONTENT IDEA</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">URL *</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com/article"
                    className="w-full px-3 py-2 bg-black border border-zinc-800 text-white text-sm focus:border-cyan-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Article title (auto-filled if empty)"
                    className="w-full px-3 py-2 bg-black border border-zinc-800 text-white text-sm focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Source Type *</label>
                  <select
                    value={formData.source_type}
                    onChange={e => setFormData({ ...formData, source_type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 text-white text-sm focus:border-cyan-500 outline-none"
                  >
                    {SOURCE_TYPES.map(type => (
                      <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="AI, automation, blockchain"
                    className="w-full px-3 py-2 bg-black border border-zinc-800 text-white text-sm focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="What angle should we take? Key points to include?"
                  rows={3}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 text-white text-sm focus:border-cyan-500 outline-none resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-cyan-500 text-white font-bold text-xs hover:bg-cyan-600 transition-all disabled:opacity-50"
                >
                  {submitting ? 'ADDING...' : 'ADD IDEA'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-zinc-700 text-gray-400 text-xs hover:border-white hover:text-white transition-all"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-500" size={14} />
            <span className="text-xs text-gray-500">Status:</span>
            {['all', 'unused', 'used'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-3 py-1 text-xs font-bold transition-all ${
                  filter === f
                    ? 'bg-white text-black'
                    : 'bg-zinc-900 text-gray-400 hover:text-white'
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <FiTag className="text-gray-500" size={14} />
            <span className="text-xs text-gray-500">Type:</span>
            <button
              onClick={() => setSourceFilter('all')}
              className={`px-3 py-1 text-xs font-bold transition-all ${
                sourceFilter === 'all'
                  ? 'bg-white text-black'
                  : 'bg-zinc-900 text-gray-400 hover:text-white'
              }`}
            >
              ALL
            </button>
            {SOURCE_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => setSourceFilter(type.id)}
                className={`px-3 py-1 text-xs font-bold transition-all flex items-center gap-1 ${
                  sourceFilter === type.id
                    ? 'bg-white text-black'
                    : 'bg-zinc-900 text-gray-400 hover:text-white'
                }`}
              >
                <type.icon size={12} />
                {type.label.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={fetchIdeas}
            className="ml-auto flex items-center gap-1 px-3 py-1 text-xs text-gray-500 hover:text-white transition-all"
          >
            <FiRefreshCw size={12} /> REFRESH
          </button>
        </div>

        {/* Ideas List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Loading ideas...</div>
          ) : ideas.length === 0 ? (
            <div className="border border-zinc-900 p-12 text-center text-gray-600">
              <p className="mb-4">NO CONTENT IDEAS FOUND</p>
              <p className="text-xs">
                Add URLs, articles, tweets, or repos to generate blog posts from.
              </p>
            </div>
          ) : (
            ideas.map(idea => {
              const Icon = getSourceIcon(idea.source_type);
              return (
                <div
                  key={idea.id}
                  className={`border p-4 transition-all ${
                    idea.used
                      ? 'border-zinc-900 bg-zinc-950/50 opacity-60'
                      : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="text-gray-500" size={14} />
                        <span className="text-[10px] text-gray-600 uppercase">{idea.source_type}</span>
                        {idea.used && (
                          <span className="text-[10px] text-green-500 uppercase">USED</span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm mb-1 truncate">
                        {idea.title || idea.url}
                      </h3>
                      <a
                        href={idea.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cyan-500 hover:text-cyan-400 truncate block"
                      >
                        {idea.url}
                      </a>
                      {idea.notes && (
                        <p className="text-xs text-gray-500 mt-2 italic">{idea.notes}</p>
                      )}
                      {idea.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {idea.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-zinc-800 text-gray-400 text-[10px]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleUsed(idea.id, idea.used)}
                        className={`p-2 transition-all ${
                          idea.used
                            ? 'text-green-500 hover:text-yellow-500'
                            : 'text-gray-600 hover:text-green-500'
                        }`}
                        title={idea.used ? 'Mark as unused' : 'Mark as used'}
                      >
                        {idea.used ? <FiX size={16} /> : <FiCheck size={16} />}
                      </button>
                      <button
                        onClick={() => handleDelete(idea.id)}
                        className="p-2 text-gray-600 hover:text-red-500 transition-all"
                        title="Delete"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 border-t border-zinc-900 pt-6">
          <div className="flex gap-8 text-xs text-gray-500">
            <div>
              <span className="text-gray-400">Total:</span>{' '}
              <span className="text-white font-bold">{ideas.length}</span>
            </div>
            <div>
              <span className="text-gray-400">Unused:</span>{' '}
              <span className="text-cyan-500 font-bold">
                {ideas.filter(i => !i.used).length}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Used:</span>{' '}
              <span className="text-green-500 font-bold">
                {ideas.filter(i => i.used).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
