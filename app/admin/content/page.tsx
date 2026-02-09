'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiArrowLeft, FiPlus, FiLink, FiTag, FiTrash2, FiExternalLink, FiRefreshCw } from 'react-icons/fi';

interface ContentIdea {
  id: string;
  url: string;
  title: string;
  source_type: 'article' | 'tweet' | 'repo' | 'manual';
  tags: string[];
  notes: string;
  used?: boolean;
  created_at: string;
}

export default function AdminContentPage() {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Form state
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [sourceType, setSourceType] = useState<'article' | 'tweet' | 'repo' | 'manual'>('article');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch ideas on mount
  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const response = await fetch('/api/content-ideas');
      if (response.ok) {
        const data = await response.json();
        setIdeas(data);
      } else {
        console.error('Failed to fetch ideas:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch ideas:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/content-ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          title: title || url,
          source_type: sourceType,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          notes,
        }),
      });

      if (response.ok) {
        const newIdea = await response.json();
        setIdeas([newIdea, ...ideas]);

        // Reset form
        setUrl('');
        setTitle('');
        setTags('');
        setNotes('');
        setIsAdding(false);
      } else {
        const errorData = await response.json();
        alert(`Failed to add idea: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to add idea:', error);
      alert('Failed to add idea. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this idea?')) {
      return;
    }

    try {
      const response = await fetch(`/api/content-ideas/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setIdeas(ideas.filter(idea => idea.id !== id));
      } else {
        alert('Failed to delete idea');
      }
    } catch (error) {
      console.error('Failed to delete idea:', error);
      alert('Failed to delete idea. Please try again.');
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-black text-white relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="px-4 md:px-8 py-16">
        {/* Header */}
        <motion.div
          className="mb-12 border-b border-gray-800 pb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm mb-6"
          >
            <FiArrowLeft /> Back to Admin
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold tracking-tighter mb-2">CONTENT IDEAS BUCKET</h1>
              <p className="text-gray-400 text-sm uppercase tracking-widest">
                Collect links for auto-blog generation
              </p>
            </div>

            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-gray-200 transition-colors text-sm font-bold"
            >
              <FiPlus size={16} />
              Add Link
            </button>
          </div>
        </motion.div>

        {/* Add Form */}
        {isAdding && (
          <motion.div
            className="mb-8 bg-gray-900/50 border border-gray-800 p-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h2 className="text-xl font-bold mb-4">Add New Idea</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  URL *
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  required
                  className="w-full bg-gray-900 border border-gray-800 px-4 py-3 text-white focus:outline-none focus:border-gray-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Title (optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Auto-detected from URL if left blank"
                  className="w-full bg-gray-900 border border-gray-800 px-4 py-3 text-white focus:outline-none focus:border-gray-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Source Type
                </label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value as any)}
                  className="w-full bg-gray-900 border border-gray-800 px-4 py-3 text-white focus:outline-none focus:border-gray-600 transition-colors"
                >
                  <option value="article">Article</option>
                  <option value="tweet">Tweet</option>
                  <option value="repo">GitHub Repo</option>
                  <option value="manual">Manual Entry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="AI, blockchain, tutorial"
                  className="w-full bg-gray-900 border border-gray-800 px-4 py-3 text-white focus:outline-none focus:border-gray-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Why is this interesting? Key takeaways?"
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-800 px-4 py-3 text-white focus:outline-none focus:border-gray-600 transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading || !url}
                  className="px-4 py-2 bg-white text-black hover:bg-gray-200 transition-colors text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding...' : 'Add to Bucket'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Ideas List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              {ideas.length} {ideas.length === 1 ? 'Idea' : 'Ideas'} in Bucket
            </h2>
            <button
              onClick={fetchIdeas}
              disabled={initialLoading}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors text-sm disabled:opacity-50"
              title="Refresh list"
            >
              <FiRefreshCw size={14} className={initialLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {initialLoading ? (
            <div className="border border-gray-800 p-12 text-center">
              <FiRefreshCw className="mx-auto text-gray-700 mb-4 animate-spin" size={48} />
              <p className="text-gray-500">Loading ideas...</p>
            </div>
          ) : ideas.length === 0 ? (
            <div className="border border-gray-800 p-12 text-center">
              <FiLink className="mx-auto text-gray-700 mb-4" size={48} />
              <p className="text-gray-500">No ideas in bucket yet</p>
              <p className="text-gray-600 text-sm mt-2">Click "Add Link" to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ideas.map((idea) => (
                <motion.div
                  key={idea.id}
                  className="bg-gray-900/50 border border-gray-800 p-4 hover:border-gray-600 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">{idea.title}</h3>
                        <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs uppercase">
                          {idea.source_type}
                        </span>
                      </div>

                      <a
                        href={idea.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 mb-2"
                      >
                        {idea.url}
                        <FiExternalLink size={12} />
                      </a>

                      {idea.tags.length > 0 && (
                        <div className="flex items-center gap-2 mb-2">
                          <FiTag size={12} className="text-gray-600" />
                          <div className="flex gap-1 flex-wrap">
                            {idea.tags.map((tag, i) => (
                              <span key={i} className="text-xs text-gray-500">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {idea.notes && (
                        <p className="text-gray-400 text-sm mt-2">{idea.notes}</p>
                      )}

                      <div className="text-xs text-gray-600 mt-2">
                        Added {new Date(idea.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(idea.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors p-2"
                      title="Delete"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-12 border border-blue-900/30 bg-blue-900/10 p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-2">
            How It Works
          </h3>
          <ul className="text-sm text-gray-400 space-y-2">
            <li>• Add links to articles, tweets, repos that inspire blog post ideas</li>
            <li>• Tag content to help the AI understand context</li>
            <li>• Daily cron job pulls from this bucket to generate blog posts</li>
            <li>• Access from anywhere - mobile, tablet, or desktop</li>
            <li>• Ideas are marked as "used" after being included in a post</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
