'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/Providers';
import Link from 'next/link';
import {
    FiServer,
    FiCpu,
    FiHardDrive,
    FiActivity,
    FiRefreshCw,
    FiZap,
    FiClock,
    FiArrowLeft
} from 'react-icons/fi';

interface ServerStats {
    status: string;
    cpu: string;
    memory: string;
    disk: string;
    uptime: string;
    load: string;
    processes: string;
}

export default function UserServersPage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    const [serverStats, setServerStats] = useState<ServerStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login?redirectedFrom=/user/account/servers');
            return;
        }

        if (user) {
            // Mock fetch for personal server
            setTimeout(() => {
                setServerStats({
                    status: 'offline',
                    cpu: '0',
                    memory: '0',
                    disk: '0',
                    uptime: '-',
                    load: '-',
                    processes: '-'
                });
                setIsLoading(false);
            }, 500);
        }
    }, [loading, user, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white font-mono text-sm">LOADING SERVERS...</div>
            </div>
        );
    }

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
                                    <FiServer className="text-gray-500" size={24} />
                                    <h1 className="text-2xl font-bold">MY SERVERS</h1>
                                    <span className="px-2 py-1 text-xs bg-red-900/30 text-red-400">OFFLINE</span>
                                </div>
                                <p className="text-sm text-gray-500">NO ACTIVE INSTANCES</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsLoading(true)} // Mock refresh
                                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors"
                                >
                                    <FiRefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                                    <span>REFRESH</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Server Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <div className="border border-gray-800 p-4 opacity-50">
                            <div className="flex items-center gap-2 mb-2">
                                <FiCpu className="text-blue-500" size={14} />
                                <span className="text-xs text-gray-500">CPU</span>
                            </div>
                            <p className="text-xl font-bold">{serverStats?.cpu || '--'}%</p>
                        </div>
                        <div className="border border-gray-800 p-4 opacity-50">
                            <div className="flex items-center gap-2 mb-2">
                                <FiActivity className="text-purple-500" size={14} />
                                <span className="text-xs text-gray-500">MEMORY</span>
                            </div>
                            <p className="text-xl font-bold">{serverStats?.memory || '--'}%</p>
                        </div>
                        <div className="border border-gray-800 p-4 opacity-50">
                            <div className="flex items-center gap-2 mb-2">
                                <FiHardDrive className="text-green-500" size={14} />
                                <span className="text-xs text-gray-500">DISK</span>
                            </div>
                            <p className="text-xl font-bold">{serverStats?.disk || '--'}%</p>
                        </div>
                        <div className="border border-gray-800 p-4 opacity-50">
                            <div className="flex items-center gap-2 mb-2">
                                <FiClock className="text-yellow-500" size={14} />
                                <span className="text-xs text-gray-500">UPTIME</span>
                            </div>
                            <p className="text-xl font-bold text-sm">{serverStats?.uptime || '--'}</p>
                        </div>
                        <div className="border border-gray-800 p-4 opacity-50">
                            <div className="flex items-center gap-2 mb-2">
                                <FiZap className="text-orange-500" size={14} />
                                <span className="text-xs text-gray-500">LOAD</span>
                            </div>
                            <p className="text-xl font-bold">{serverStats?.load || '--'}</p>
                        </div>
                        <div className="border border-gray-800 p-4 opacity-50">
                            <div className="flex items-center gap-2 mb-2">
                                <FiActivity className="text-cyan-500" size={14} />
                                <span className="text-xs text-gray-500">PROCESSES</span>
                            </div>
                            <p className="text-xl font-bold">{serverStats?.processes || '--'}</p>
                        </div>
                    </div>
                </header>

                {/* Services */}
                <section className="mb-12">
                    <h2 className="text-sm text-gray-500 mb-4">AVAILABLE SERVICES</h2>
                    <div className="border border-gray-900 p-8 text-center text-gray-500">
                        <p>You have no active servers provisioned.</p>
                        <p className="text-xs mt-2">Contact support to deploy a private instance.</p>
                    </div>
                </section>

            </div>
        </div>
    );
}
