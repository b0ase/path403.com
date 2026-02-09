'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/Providers';
import Link from 'next/link';
import {
    FiDatabase,
    FiGrid,
    FiUsers,
    FiLayers,
    FiRefreshCw,
    FiGlobe,
    FiArrowLeft
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

export default function UserDatabasePage() {
    const router = useRouter();
    const { user, loading, supabase } = useAuth();

    const [websites, setWebsites] = useState<Website[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [schemas, setSchemas] = useState<SchemaInfo[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'websites' | 'subscriptions' | 'schemas'>('overview');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login?redirectedFrom=/user/account/database');
            return;
        }

        if (user) {
            fetchData();
        }
    }, [loading, user, router]);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Fetch projects instead of websites for regular users
            const { data: fallbackData } = await supabase
                .from('projects')
                .select('id, name, description, category, is_active')
                .eq('owner_user_id', user!.id)
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

            // Fetch subscriptions from public schema - Filter by user
            const { data: subsData, error: subsError } = await supabase
                .from('user_subscriptions')
                .select('*')
                .eq('user_id', user!.id)
                .order('created_at', { ascending: false });

            if (!subsError) {
                setSubscriptions(subsData || []);
            }

            // Build schema list - Regular users see public or specific schemas
            const schemaList: SchemaInfo[] = [
                { schema_name: 'public', table_count: 6 }
            ];
            setSchemas(schemaList);

        } catch (err: any) {
            console.error('Error fetching data:', err);
            setError("Failed to load database information.");
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

    return (
        <div className="min-h-screen bg-black text-white font-mono">

            <div className="w-full px-8 py-8">
                {/* Header */}
                <header className="mb-12">
                    <div className="flex items-center gap-4 mb-6">
                        <Link href="/user/account" className="text-gray-500 hover:text-white transition-colors">
                            <FiArrowLeft size={20} />
                        </Link>
                        <div className="flex justify-between items-start flex-1">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <FiDatabase className="text-green-500" size={24} />
                                    <h1 className="text-2xl font-bold">MY DATABASE</h1>
                                </div>
                                <p className="text-sm text-gray-500">PostgreSQL Access</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={fetchData}
                                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors"
                                >
                                    <FiRefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                                    <span>REFRESH</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="border border-gray-800 p-4">
                            <p className="text-2xl font-bold text-green-500">{stats.totalWebsites}</p>
                            <p className="text-xs text-gray-500">PROJECTS</p>
                        </div>
                        <div className="border border-gray-800 p-4">
                            <p className="text-2xl font-bold text-blue-500">{stats.liveWebsites}</p>
                            <p className="text-xs text-gray-500">ACTIVE</p>
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
                        { id: 'websites', label: 'PROJECTS', icon: FiGlobe },
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
                                <div className="border border-gray-800 p-8 text-center space-y-4">
                                    <FiDatabase className="mx-auto text-gray-700" size={48} />
                                    <p className="text-gray-400">Your personal database connection info will appear here once provisioned.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Websites (Projects) Tab */}
                    {activeTab === 'websites' && (
                        <div>
                            <div className="space-y-2">
                                {websites.map(website => (
                                    <div key={website.id} className="border border-gray-800 p-4 flex justify-between items-center hover:border-gray-600 transition-colors">
                                        <div>
                                            <h3 className="font-bold">{website.title}</h3>
                                            <p className="text-xs text-gray-500">{website.description}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`text-xs px-2 py-1 ${website.status === 'Live' ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                                                {website.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {websites.length === 0 && (
                                    <div className="text-center py-12 text-gray-500 border border-gray-900">
                                        NO PROJECTS FOUND
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Subscriptions Tab */}
                    {activeTab === 'subscriptions' && (
                        <div className="space-y-2">
                            {subscriptions.map(sub => (
                                <div key={sub.id} className="border border-gray-800 p-4">
                                    {sub.tier} - {sub.status}
                                </div>
                            ))}
                            {subscriptions.length === 0 && (
                                <div className="text-center py-12 text-gray-500 border border-gray-900">
                                    NO ACTIVE SUBSCRIPTIONS
                                </div>
                            )}
                        </div>
                    )}

                    {/* Schemas Tab */}
                    {activeTab === 'schemas' && (
                        <div className="space-y-2">
                            {schemas.map(schema => (
                                <div key={schema.schema_name} className="border border-gray-800 p-4 flex justify-between">
                                    <span className="font-mono text-green-500">{schema.schema_name}</span>
                                    <span className="text-gray-500">{schema.table_count} tables</span>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
