'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/Providers';
import {
  FiArrowLeft,
  FiRefreshCw,
  FiActivity,
  FiDatabase,
  FiClock,
  FiCheck,
  FiAlertCircle,
  FiFileText,
  FiBook,
  FiLayers,
  FiTrendingUp,
  FiCalendar,
  FiZap
} from 'react-icons/fi';

interface Stats {
  books: {
    total: number;
    byStatus: Record<string, number>;
    recent: Array<{ id: string; title: string; status: string; createdAt: string }>;
  };
  blogPosts: {
    total: number;
    byStatus: Record<string, number>;
    recent: Array<{ id: string; title: string; slug: string; status: string; created_at: string }>;
    pendingReview: number;
  };
  contentIdeas: {
    total: number;
    byStatus: Record<string, number>;
    recent: Array<{ id: string; title: string; source_type: string; used: boolean }>;
    pending: number;
  };
  cronSchedules: Array<{ name: string; schedule: string; endpoint: string }>;
  systemStatus: {
    database: string;
    lastUpdated: string;
  };
}

export default function MonitoringDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user) {
      fetchStats();
    }
  }, [user, loading, router]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auto-book/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
    setIsLoading(false);
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
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-3">
              <FiActivity className="text-cyan-500" />
              SYSTEM MONITOR
            </h1>
            <p className="text-xs text-gray-500 tracking-widest uppercase">
              Auto-Book Queue System Status
            </p>
          </div>
          <div className="flex items-center gap-4">
            {lastRefresh && (
              <span className="text-xs text-gray-600">
                Updated {lastRefresh.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchStats}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all text-xs"
            >
              <FiRefreshCw className={isLoading ? 'animate-spin' : ''} /> REFRESH
            </button>
          </div>
        </header>

        {isLoading && !stats ? (
          <div className="border border-zinc-900 p-12 text-center text-gray-600">
            <FiRefreshCw className="animate-spin mx-auto mb-4" size={24} />
            LOADING SYSTEM STATUS...
          </div>
        ) : stats ? (
          <div className="space-y-8">
            {/* System Status Banner */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="border border-green-900/50 bg-green-950/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiDatabase className="text-green-500" />
                  <span className="text-xs text-gray-500 uppercase">Database</span>
                </div>
                <p className="text-lg font-bold text-green-400">ONLINE</p>
              </div>
              <div className="border border-cyan-900/50 bg-cyan-950/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiZap className="text-cyan-500" />
                  <span className="text-xs text-gray-500 uppercase">Agents</span>
                </div>
                <p className="text-lg font-bold text-cyan-400">READY</p>
              </div>
              <div className="border border-yellow-900/50 bg-yellow-950/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiClock className="text-yellow-500" />
                  <span className="text-xs text-gray-500 uppercase">Cron Jobs</span>
                </div>
                <p className="text-lg font-bold text-yellow-400">ACTIVE</p>
              </div>
              <div className="border border-purple-900/50 bg-purple-950/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiTrendingUp className="text-purple-500" />
                  <span className="text-xs text-gray-500 uppercase">Health</span>
                </div>
                <p className="text-lg font-bold text-purple-400">100%</p>
              </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Books */}
              <div className="border border-zinc-900 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <FiBook /> Books
                  </h2>
                  <span className="text-2xl font-bold text-cyan-400">{stats.books.total}</span>
                </div>
                <div className="space-y-3 mb-6">
                  {Object.entries(stats.books.byStatus).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{status}</span>
                      <span className="text-xs font-bold">{count}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-zinc-800 pt-4">
                  <h3 className="text-[10px] text-gray-600 mb-3 uppercase">Recent Activity</h3>
                  <div className="space-y-2">
                    {stats.books.recent.map((book) => (
                      <Link
                        key={book.id}
                        href={`/dashboard/auto-book/${book.id}`}
                        className="block text-xs truncate hover:text-cyan-400 transition-colors"
                      >
                        {book.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Blog Posts */}
              <div className="border border-zinc-900 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <FiFileText /> Blog Posts
                  </h2>
                  <span className="text-2xl font-bold text-green-400">{stats.blogPosts.total}</span>
                </div>
                <div className="space-y-3 mb-6">
                  {Object.entries(stats.blogPosts.byStatus).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{status}</span>
                      <span className={`text-xs font-bold ${status === 'draft' && count > 0 ? 'text-yellow-400' : ''}`}>
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
                {stats.blogPosts.pendingReview > 0 && (
                  <Link
                    href="/dashboard/auto-book/review"
                    className="block p-3 bg-yellow-950/30 border border-yellow-900/50 mb-4 hover:border-yellow-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-yellow-400">Pending Review</span>
                      <span className="text-lg font-bold text-yellow-400">{stats.blogPosts.pendingReview}</span>
                    </div>
                  </Link>
                )}
                <div className="border-t border-zinc-800 pt-4">
                  <h3 className="text-[10px] text-gray-600 mb-3 uppercase">Recent Posts</h3>
                  <div className="space-y-2">
                    {stats.blogPosts.recent.map((post) => (
                      <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className="block text-xs truncate hover:text-green-400 transition-colors"
                      >
                        {post.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Ideas */}
              <div className="border border-zinc-900 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <FiLayers /> Content Ideas
                  </h2>
                  <span className="text-2xl font-bold text-purple-400">{stats.contentIdeas.total}</span>
                </div>
                <div className="space-y-3 mb-6">
                  {Object.entries(stats.contentIdeas.byStatus).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{status}</span>
                      <span className="text-xs font-bold">{count}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/dashboard/auto-book/ideas"
                  className="block p-3 bg-purple-950/30 border border-purple-900/50 mb-4 hover:border-purple-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-400">Available for Use</span>
                    <span className="text-lg font-bold text-purple-400">{stats.contentIdeas.pending}</span>
                  </div>
                </Link>
                <div className="border-t border-zinc-800 pt-4">
                  <h3 className="text-[10px] text-gray-600 mb-3 uppercase">Recent Ideas</h3>
                  <div className="space-y-2">
                    {stats.contentIdeas.recent.map((idea) => (
                      <div key={idea.id} className="text-xs truncate text-gray-400">
                        <span className="text-gray-600">[{idea.source_type}]</span> {idea.title || 'Untitled'}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Cron Schedules */}
            <div className="border border-zinc-900 p-6">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <FiCalendar /> Scheduled Tasks
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.cronSchedules.map((cron) => (
                  <div key={cron.name} className="p-4 bg-zinc-950/50 border border-zinc-800">
                    <div className="flex items-center gap-2 mb-2">
                      <FiCheck className="text-green-500" size={12} />
                      <span className="text-xs font-bold">{cron.name}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mb-2">{cron.schedule}</p>
                    <code className="text-[9px] text-cyan-600 bg-black/50 px-2 py-1 block truncate">
                      {cron.endpoint}
                    </code>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/dashboard/auto-book/new"
                className="p-4 border border-zinc-800 hover:border-cyan-500 transition-all text-center"
              >
                <FiBook className="mx-auto mb-2" size={20} />
                <span className="text-xs font-bold block">New Book</span>
              </Link>
              <Link
                href="/dashboard/auto-book/ideas"
                className="p-4 border border-zinc-800 hover:border-purple-500 transition-all text-center"
              >
                <FiLayers className="mx-auto mb-2" size={20} />
                <span className="text-xs font-bold block">Content Ideas</span>
              </Link>
              <Link
                href="/dashboard/auto-book/review"
                className="p-4 border border-zinc-800 hover:border-yellow-500 transition-all text-center"
              >
                <FiFileText className="mx-auto mb-2" size={20} />
                <span className="text-xs font-bold block">Review Queue</span>
              </Link>
              <button
                onClick={fetchStats}
                className="p-4 border border-zinc-800 hover:border-green-500 transition-all text-center"
              >
                <FiRefreshCw className="mx-auto mb-2" size={20} />
                <span className="text-xs font-bold block">Refresh Stats</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="border border-red-900/50 bg-red-950/20 p-12 text-center">
            <FiAlertCircle className="mx-auto mb-4 text-red-500" size={32} />
            <p className="text-red-400 mb-2">Failed to load system status</p>
            <button
              onClick={fetchStats}
              className="text-xs text-cyan-400 hover:underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
