'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface BlogPost {
  slug: string;
  title: string;
  source: 'markdown' | 'database' | 'both';
  queued: boolean;
  live: boolean;
  formatted: boolean;
  publishedAt: string | null;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function BlogDashboard() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/dashboard/blog');
      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [formatting, setFormatting] = useState<Record<string, boolean>>({});

  const toggleStatus = async (slug: string, field: 'queued' | 'live' | 'formatted') => {
    const post = posts.find(p => p.slug === slug);
    if (!post) return;

    const newValue = !post[field];

    // Optimistically update UI
    const updatedPosts = posts.map(p =>
      p.slug === slug ? { ...p, [field]: newValue } : p
    );
    setPosts(updatedPosts);

    // Save to database
    setSaving(prev => ({ ...prev, [slug]: true }));
    try {
      const response = await fetch(`/api/dashboard/blog/${slug}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...post,
          [field]: newValue,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save status');
      }
    } catch (error) {
      console.error('Error saving status:', error);
      // Revert on error
      setPosts(posts);
      alert('Failed to save status. Please try again.');
    } finally {
      setSaving(prev => ({ ...prev, [slug]: false }));
    }
  };

  const formatPost = async (slug: string) => {
    if (!confirm(`Format and republish "${slug}"? This will:\n- Fix heading spacing\n- Populate empty frontmatter\n- Mark as formatted\n\nContinue?`)) {
      return;
    }

    setFormatting(prev => ({ ...prev, [slug]: true }));
    try {
      const response = await fetch(`/api/dashboard/blog/${slug}/format`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to format post');
      }

      // Update local state to mark as formatted
      setPosts(posts.map(p =>
        p.slug === slug ? { ...p, formatted: true } : p
      ));

      alert(`✅ Successfully formatted "${slug}"!\n\nResults:\n${JSON.stringify(data.results, null, 2)}\n\nYou may need to commit and push the changes.`);
    } catch (error: any) {
      console.error('Error formatting post:', error);
      alert(`❌ Failed to format post: ${error.message}`);
    } finally {
      setFormatting(prev => ({ ...prev, [slug]: false }));
    }
  };

  const stats = {
    total: posts.length,
    queued: posts.filter(p => p.queued).length,
    live: posts.filter(p => p.live).length,
    formatted: posts.filter(p => p.formatted).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-zinc-500">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-zinc-500 hover:text-white text-sm mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-4">Blog Post Manager</h1>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-zinc-900 p-4 rounded border border-zinc-800">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-zinc-500">Total Posts</div>
            </div>
            <div className="bg-zinc-900 p-4 rounded border border-zinc-800">
              <div className="text-2xl font-bold text-yellow-500">{stats.queued}</div>
              <div className="text-sm text-zinc-500">Queued</div>
            </div>
            <div className="bg-zinc-900 p-4 rounded border border-zinc-800">
              <div className="text-2xl font-bold text-green-500">{stats.live}</div>
              <div className="text-sm text-zinc-500">Live</div>
            </div>
            <div className="bg-zinc-900 p-4 rounded border border-zinc-800">
              <div className="text-2xl font-bold text-blue-500">{stats.formatted}</div>
              <div className="text-sm text-zinc-500">Formatted</div>
            </div>
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-zinc-900 rounded border border-zinc-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950">
                <th className="text-left p-4 text-sm font-mono text-zinc-400">Published</th>
                <th className="text-left p-4 text-sm font-mono text-zinc-400">Title</th>
                <th className="text-left p-4 text-sm font-mono text-zinc-400">Slug</th>
                <th className="text-center p-4 text-sm font-mono text-zinc-400">Source</th>
                <th className="text-center p-4 text-sm font-mono text-zinc-400">Queued</th>
                <th className="text-center p-4 text-sm font-mono text-zinc-400">Live</th>
                <th className="text-center p-4 text-sm font-mono text-zinc-400">Formatted</th>
                <th className="text-center p-4 text-sm font-mono text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post, index) => (
                <tr
                  key={post.slug}
                  className={`border-b border-zinc-800 hover:bg-zinc-800/50 ${
                    index % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-900/50'
                  }`}
                >
                  <td className="p-4">
                    <span className={`text-sm ${post.publishedAt ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      {formatDate(post.publishedAt)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{post.title}</div>
                  </td>
                  <td className="p-4">
                    <code className="text-sm text-zinc-400">{post.slug}</code>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`text-xs px-2 py-1 rounded font-mono ${
                      post.source === 'markdown' ? 'bg-blue-500/20 text-blue-400' :
                      post.source === 'database' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {post.source}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={post.queued}
                      onChange={() => toggleStatus(post.slug, 'queued')}
                      disabled={saving[post.slug]}
                      className="w-5 h-5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </td>
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={post.live}
                      onChange={() => toggleStatus(post.slug, 'live')}
                      disabled={saving[post.slug]}
                      className="w-5 h-5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </td>
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={post.formatted}
                      onChange={() => toggleStatus(post.slug, 'formatted')}
                      disabled={saving[post.slug]}
                      className="w-5 h-5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="text-sm text-blue-400 hover:text-blue-300"
                      >
                        View
                      </Link>
                      <span className="text-zinc-700">|</span>
                      {post.source !== 'database' && (
                        <button
                          onClick={() => formatPost(post.slug)}
                          disabled={formatting[post.slug]}
                          className="text-sm text-green-400 hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {formatting[post.slug] ? 'Formatting...' : 'Format'}
                        </button>
                      )}
                      {saving[post.slug] && (
                        <span className="text-xs text-zinc-500">Saving...</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-8 text-sm text-zinc-500">
          <h3 className="font-bold mb-2">Source Legend:</h3>
          <ul className="space-y-1">
            <li><span className="text-blue-400">markdown</span> - Served from content/blog/ directory</li>
            <li><span className="text-purple-400">database</span> - Stored in blog_posts table</li>
            <li><span className="text-green-400">both</span> - Exists in both locations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
