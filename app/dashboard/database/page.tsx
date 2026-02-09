'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/Providers';
import {
  FiDatabase,
  FiGrid,
  FiUsers,
  FiLayers,
  FiRefreshCw,
  FiExternalLink,
  FiChevronRight,
  FiTable,
  FiBox,
  FiGlobe
} from 'react-icons/fi';

interface Website {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  live_url: string | null;
  status: string;
  category: string | null;
  is_featured: boolean;
}

interface Subscription {
  id: string;
  user_id: string;
  project_id: string;
  tier: string;
  status: string;
}

interface SchemaInfo {
  schema_name: string;
  table_count: number;
}

export default function DatabaseDashboard() {
  const router = useRouter();
  const { user, loading, supabase } = useAuth();

  const [websites, setWebsites] = useState<Website[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [schemas, setSchemas] = useState<SchemaInfo[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'websites' | 'subscriptions' | 'schemas'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      checkAdminStatus();
      fetchData();
    }
  }, [loading, user, router]);

  const checkAdminStatus = async () => {
    if (!user) return;
    try {
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      setIsAdmin(data?.role === 'Admin' || user.email === 'b@b0ase.com');
    } catch (e) {
      setIsAdmin(false);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch websites from b0ase_com schema (Admin only usually, or mocked for user)
      const { data: websitesData, error: websitesError } = await supabase
        .schema('b0ase_com')
        .from('websites')
        .select('*')
        .order('category', { ascending: true })
        .order('title', { ascending: true });

      if (websitesError) {
        // Fallback: try from public schema projects
        const { data: fallbackData } = await supabase
          .from('projects')
          .select('id, name, description, category, is_active')
          .order('category', { ascending: true });

        if (fallbackData) {
          setWebsites(fallbackData.map((p: any) => ({
            id: p.id,
            title: p.name,
            slug: p.id,
            description: p.description,
            live_url: null,
            status: p.is_active ? 'Live' : 'Inactive',
            category: p.category,
            is_featured: false
          })));
        }
      } else {
        setWebsites(websitesData || []);
      }

      // Fetch subscriptions from public schema - Filter by user if not admin
      let query = supabase.from('user_subscriptions').select('*').order('created_at', { ascending: false });

      // Determine if we should filter (fetch user role freshly or use state logic? simpler to rely on RLS but let's be explicit)
      // Actually, assume RLS handles it, but let's add explicit check to be safe visually
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single();
      const isUserAdmin = profile?.role === 'Admin' || user!.email === 'b@b0ase.com';

      if (!isUserAdmin) {
        query = query.eq('user_id', user!.id);
      }

      const { data: subsData, error: subsError } = await query;

      if (!subsError) {
        setSubscriptions(subsData || []);
      }

      // Build schema list 
      const schemaList: SchemaInfo[] = [];
      if (isUserAdmin) {
        schemaList.push(
          { schema_name: 'public', table_count: 6 },
          { schema_name: 'b0ase_com', table_count: 4 }
        );

        if (websitesData) {
          websitesData.forEach((website: Website) => {
            const schemaName = website.id.replace(/-/g, '_');
            schemaList.push({
              schema_name: schemaName,
              table_count: 3
            });
          });
        }
      } else {
        // Users only see their own "project" schemas if applicable
        // For now, empty or public?
        schemaList.push({ schema_name: 'public', table_count: 6 });
      }

      setSchemas(schemaList);

    } catch (err: any) {
      console.error('Error fetching data:', err);
      // Don't show raw errors to users
      if (!isAdmin) setError("Failed to load database information.");
      else setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white font-mono text-sm">LOADING DATABASE...</div>
      </div>
    );
  }

  const stats = {
    totalWebsites: websites.length,
    liveWebsites: websites.filter(w => w.status === 'Live').length,
    totalSubscriptions: subscriptions.length,
    totalSchemas: schemas.length,
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'live': return 'bg-green-900/30 text-green-400';
      case 'demo': return 'bg-blue-900/30 text-blue-400';
      case 'concept': return 'bg-yellow-900/30 text-yellow-400';
      case 'ltd': return 'bg-purple-900/30 text-purple-400';
      default: return 'bg-gray-800 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono">

      <div className="w-full px-8 py-8">
        {/* Header */}
        <header className="mb-12">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FiDatabase className="text-green-500" size={24} />
                <h1 className="text-2xl font-bold">DATABASE CONSOLE</h1>
              </div>
              <p className="text-sm text-gray-500">PostgreSQL @ REDACTED_HOST:54322</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchData}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors"
              >
                <FiRefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                <span>REFRESH</span>
              </button>
              <a
                href="http://REDACTED_HOST:8000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-green-500 hover:text-green-400 transition-colors"
              >
                <FiExternalLink size={14} />
                <span>STUDIO</span>
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="border border-gray-800 p-4">
              <p className="text-2xl font-bold text-green-500">{stats.totalWebsites}</p>
              <p className="text-xs text-gray-500">WEBSITES</p>
            </div>
            <div className="border border-gray-800 p-4">
              <p className="text-2xl font-bold text-blue-500">{stats.liveWebsites}</p>
              <p className="text-xs text-gray-500">LIVE</p>
            </div>
            <div className="border border-gray-800 p-4">
              <p className="text-2xl font-bold text-purple-500">{stats.totalSchemas}</p>
              <p className="text-xs text-gray-500">SCHEMAS</p>
            </div>
            <div className="border border-gray-800 p-4">
              <p className="text-2xl font-bold text-yellow-500">{stats.totalSubscriptions}</p>
              <p className="text-xs text-gray-500">SUBSCRIPTIONS</p>
            </div>
          </div>
        </header>

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 border border-red-800 bg-red-900/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-gray-800">
          {[
            { id: 'overview', label: 'OVERVIEW', icon: FiGrid },
            { id: 'websites', label: 'WEBSITES', icon: FiGlobe },
            { id: 'subscriptions', label: 'SUBSCRIPTIONS', icon: FiUsers },
            { id: 'schemas', label: 'SCHEMAS', icon: FiLayers },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm transition-colors ${activeTab === tab.id
                ? 'text-green-500 border-b-2 border-green-500'
                : 'text-gray-500 hover:text-white'
                }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <main>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-sm text-gray-500 mb-4">CONNECTION INFO</h2>
                {isAdmin ? (
                  <div className="border border-gray-800 p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Host</span>
                      <span className="text-green-400">REDACTED_HOST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Port</span>
                      <span>54322</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Database</span>
                      <span>postgres</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Auth API</span>
                      <span className="text-green-400">auth.b0ase.com:8000</span>
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-800 p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <span className="text-green-400">CONNECTED</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Access Level</span>
                      <span className="text-blue-400">USER</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Permission</span>
                      <span>READ-ONLY (SCOPED)</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-sm text-gray-500 mb-4">QUICK ACTIONS</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isAdmin && (
                    <a
                      href="http://REDACTED_HOST:8000"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-gray-800 p-4 hover:border-green-500 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium group-hover:text-green-500">Supabase Studio</p>
                          <p className="text-xs text-gray-500">Full database management</p>
                        </div>
                        <FiChevronRight className="text-gray-600 group-hover:text-green-500" />
                      </div>
                    </a>
                  )}
                  <button
                    onClick={() => setActiveTab('websites')}
                    className="border border-gray-800 p-4 hover:border-blue-500 transition-colors group text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium group-hover:text-blue-500">View Websites</p>
                        <p className="text-xs text-gray-500">{stats.totalWebsites} websites configured</p>
                      </div>
                      <FiChevronRight className="text-gray-600 group-hover:text-blue-500" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent websites */}
              <div>
                <h2 className="text-sm text-gray-500 mb-4">FEATURED WEBSITES</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {websites.filter(w => w.is_featured).slice(0, 6).map((website) => (
                    <div key={website.id} className="border border-gray-800 p-4 hover:border-gray-700 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{website.title}</span>
                        <span className={`px-2 py-0.5 text-xs ${getStatusColor(website.status)}`}>
                          {website.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{website.category}</p>
                      {website.live_url && (
                        <a
                          href={website.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 truncate block"
                        >
                          {website.live_url.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Websites Tab */}
          {activeTab === 'websites' && (
            <div>
              <h2 className="text-sm text-gray-500 mb-4">ALL WEBSITES ({websites.length})</h2>
              <div className="border border-gray-800 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-left text-gray-500">
                      <th className="p-3">ID</th>
                      <th className="p-3">TITLE</th>
                      <th className="p-3">CATEGORY</th>
                      <th className="p-3">STATUS</th>
                      <th className="p-3">URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {websites.map((website) => (
                      <tr key={website.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                        <td className="p-3 font-mono text-green-400 text-xs">{website.id}</td>
                        <td className="p-3">{website.title}</td>
                        <td className="p-3 text-gray-500">{website.category || '-'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 text-xs ${getStatusColor(website.status)}`}>
                            {website.status}
                          </span>
                        </td>
                        <td className="p-3">
                          {website.live_url ? (
                            <a
                              href={website.live_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-xs"
                            >
                              {website.live_url.replace(/^https?:\/\//, '').slice(0, 30)}...
                            </a>
                          ) : (
                            <span className="text-gray-600">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subscriptions Tab */}
          {activeTab === 'subscriptions' && (
            <div>
              <h2 className="text-sm text-gray-500 mb-4">USER SUBSCRIPTIONS ({subscriptions.length})</h2>
              {subscriptions.length === 0 ? (
                <div className="border border-gray-800 p-8 text-center text-gray-500">
                  No subscriptions yet
                </div>
              ) : (
                <div className="border border-gray-800">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800 text-left text-gray-500">
                        <th className="p-3">USER ID</th>
                        <th className="p-3">PROJECT</th>
                        <th className="p-3">TIER</th>
                        <th className="p-3">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptions.map((sub) => (
                        <tr key={sub.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                          <td className="p-3 font-mono text-xs text-gray-400">{sub.user_id.slice(0, 8)}...</td>
                          <td className="p-3 text-green-400">{sub.project_id}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 text-xs ${sub.tier === 'admin'
                              ? 'bg-purple-900/30 text-purple-400'
                              : sub.tier === 'premium'
                                ? 'bg-yellow-900/30 text-yellow-400'
                                : 'bg-gray-800 text-gray-400'
                              }`}>
                              {sub.tier.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 text-xs ${sub.status === 'active'
                              ? 'bg-green-900/30 text-green-400'
                              : 'bg-red-900/30 text-red-400'
                              }`}>
                              {sub.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Schemas Tab */}
          {activeTab === 'schemas' && (
            <div>
              <h2 className="text-sm text-gray-500 mb-4">DATABASE SCHEMAS ({schemas.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {schemas.map((schema) => (
                  <div
                    key={schema.schema_name}
                    className={`border p-4 transition-colors ${schema.schema_name === 'public' || schema.schema_name === 'b0ase_com'
                      ? 'border-green-800 hover:border-green-600'
                      : 'border-gray-800 hover:border-gray-700'
                      }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <FiLayers className={
                        schema.schema_name === 'public' || schema.schema_name === 'b0ase_com'
                          ? 'text-green-500'
                          : 'text-gray-500'
                      } size={16} />
                      <span className="font-medium text-sm">{schema.schema_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FiTable size={12} />
                      <span>{schema.table_count} tables</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
