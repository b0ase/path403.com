'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/Providers';
import {
  FiArrowLeft,
  FiCheck,
  FiX,
  FiEdit,
  FiEye,
  FiCalendar,
  FiTag,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp,
  FiFileText
} from 'react-icons/fi';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  featured_image_url: string | null;
}

export default function ReviewQueuePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user) {
      fetchPosts();
    }
  }, [user, loading, router]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/blog/review');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
    setIsLoading(false);
  };

  const handleAction = async (postId: string, action: 'approve' | 'reject') => {
    setActionLoading(postId);
    try {
      const response = await fetch('/api/blog/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, action }),
      });

      if (response.ok) {
        // Remove post from list after action
        setPosts(posts.filter(p => p.id !== postId));
        setExpandedPost(null);
      }
    } catch (error) {
      console.error('Error performing action:', error);
    }
    setActionLoading(null);
  };

  const handleSaveEdit = async (postId: string) => {
    setActionLoading(postId);
    try {
      const response = await fetch('/api/blog/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, action: 'edit', content: editContent }),
      });

      if (response.ok) {
        // Update post in list
        setPosts(posts.map(p =>
          p.id === postId ? { ...p, content: editContent } : p
        ));
        setEditingPost(null);
        setEditContent('');
      }
    } catch (error) {
      console.error('Error saving edit:', error);
    }
    setActionLoading(null);
  };

  const startEditing = (post: BlogPost) => {
    setEditingPost(post.id);
    setEditContent(post.content);
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-black text-white font-mono relative">
      <div className="px-4 md:px-8 py-16">
        <Link
          href="/dashboard/auto-book"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm mb-6"
        >
          <FiArrowLeft /> Back to Auto-Book
        </Link>

        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold mb-2">CONTENT REVIEW QUEUE</h1>
            <p className="text-xs text-gray-500 tracking-widest uppercase">
              {posts.length} post{posts.length !== 1 ? 's' : ''} pending review
            </p>
          </div>
          <button
            onClick={fetchPosts}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all text-xs"
          >
            <FiRefreshCw className={isLoading ? 'animate-spin' : ''} /> REFRESH
          </button>
        </header>

        {isLoading ? (
          <div className="border border-zinc-900 p-12 text-center text-gray-600">
            LOADING REVIEW QUEUE...
          </div>
        ) : posts.length === 0 ? (
          <div className="border border-zinc-900 p-12 text-center">
            <FiFileText className="w-12 h-12 mx-auto mb-4 text-gray-700" />
            <p className="text-gray-600 mb-2">NO POSTS PENDING REVIEW</p>
            <p className="text-xs text-gray-700">
              Generated blog posts will appear here for approval
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="border border-zinc-900 bg-zinc-950/20"
              >
                {/* Post Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-zinc-900/30 transition-colors"
                  onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1">{post.title}</h3>
                      <p className="text-xs text-gray-500">/blog/{post.slug}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-[10px] text-gray-600 text-right">
                        <div className="flex items-center gap-1">
                          <FiCalendar />
                          {new Date(post.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      {expandedPost === post.id ? (
                        <FiChevronUp className="text-gray-500" />
                      ) : (
                        <FiChevronDown className="text-gray-500" />
                      )}
                    </div>
                  </div>

                  {post.excerpt && (
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}

                  {post.tags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <FiTag className="text-gray-600 w-3 h-3" />
                      {post.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 bg-zinc-800 text-gray-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Expanded Content */}
                {expandedPost === post.id && (
                  <div className="border-t border-zinc-900">
                    {/* Content Preview / Editor */}
                    <div className="p-6">
                      {editingPost === post.id ? (
                        <div className="space-y-4">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full h-96 bg-black border border-zinc-800 p-4 text-sm text-gray-300 font-mono resize-none focus:border-cyan-500 focus:outline-none"
                            placeholder="Edit content..."
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveEdit(post.id)}
                              disabled={actionLoading === post.id}
                              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition-all disabled:opacity-50"
                            >
                              <FiCheck /> SAVE CHANGES
                            </button>
                            <button
                              onClick={() => {
                                setEditingPost(null);
                                setEditContent('');
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white text-xs hover:bg-zinc-700 transition-all"
                            >
                              CANCEL
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-black border border-zinc-800 p-4 max-h-96 overflow-y-auto">
                            <pre className="text-sm text-gray-400 whitespace-pre-wrap font-mono">
                              {post.content.slice(0, 2000)}
                              {post.content.length > 2000 && '...\n\n[Content truncated]'}
                            </pre>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3 pt-4 border-t border-zinc-900">
                            <button
                              onClick={() => handleAction(post.id, 'approve')}
                              disabled={actionLoading === post.id}
                              className="flex items-center gap-2 px-6 py-3 bg-green-500 text-black font-bold text-xs hover:bg-green-400 transition-all disabled:opacity-50"
                            >
                              <FiCheck /> APPROVE & PUBLISH
                            </button>
                            <button
                              onClick={() => startEditing(post)}
                              disabled={actionLoading === post.id}
                              className="flex items-center gap-2 px-6 py-3 bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition-all disabled:opacity-50"
                            >
                              <FiEdit /> EDIT
                            </button>
                            <button
                              onClick={() => handleAction(post.id, 'reject')}
                              disabled={actionLoading === post.id}
                              className="flex items-center gap-2 px-6 py-3 bg-red-500/20 text-red-400 border border-red-500/30 text-xs hover:bg-red-500/30 transition-all disabled:opacity-50"
                            >
                              <FiX /> REJECT
                            </button>
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              className="flex items-center gap-2 px-6 py-3 bg-zinc-800 text-white text-xs hover:bg-zinc-700 transition-all ml-auto"
                            >
                              <FiEye /> PREVIEW
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-zinc-900 p-6">
            <h3 className="text-xs text-gray-500 mb-2 uppercase tracking-widest">Pending Review</h3>
            <p className="text-3xl font-bold text-yellow-400">{posts.length}</p>
          </div>
          <div className="border border-zinc-900 p-6">
            <h3 className="text-xs text-gray-500 mb-2 uppercase tracking-widest">Review Rate</h3>
            <p className="text-sm text-gray-400">Approve or reject posts to clear the queue</p>
          </div>
          <div className="border border-zinc-900 p-6">
            <h3 className="text-xs text-gray-500 mb-2 uppercase tracking-widest">Auto-Generate</h3>
            <p className="text-sm text-gray-400">Posts generated daily at 2 PM UTC</p>
          </div>
        </div>
      </div>
    </div>
  );
}
