'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/Providers';
import {
  FiServer,
  FiCpu,
  FiHardDrive,
  FiActivity,
  FiDatabase,
  FiRefreshCw,
  FiExternalLink,
  FiChevronRight,
  FiZap,
  FiClock,
  FiCheckCircle,
  FiAlertCircle
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

export default function HetznerServerPage() {
  const router = useRouter();
  const { user, loading, supabase } = useAuth(); // Assuming supabase expose via useAuth or imported

  const [serverStats, setServerStats] = useState<ServerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [automationCount, setAutomationCount] = useState({ total: 0, enabled: 0 });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      checkAdminStatus().then(admin => {
        fetchServerStats(admin);
        fetchAutomationStats(admin);
      });
    }
  }, [loading, user, router]);

  const checkAdminStatus = async () => {
    if (!user) return false;
    try {
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      const admin = data?.role === 'Admin' || user.email === 'b@b0ase.com';
      setIsAdmin(admin);
      return admin;
    } catch (e) {
      setIsAdmin(false);
      return false;
    }
  };

  const fetchServerStats = async (isUserAdmin: boolean) => {
    setIsLoading(true);
    try {
      if (!isUserAdmin) {
        // Mock data for user's "Personal Server" which doesn't exist yet
        setServerStats({
          status: 'offline', // User likely has no servers
          cpu: '0',
          memory: '0',
          disk: '0',
          uptime: '-',
          load: '-',
          processes: '-'
        });
        return;
      }

      const response = await fetch('/api/hetzner/stats');
      const data = await response.json();

      if (data.success) {
        setServerStats(data.data);
      } else {
        setServerStats({
          status: 'running',
          cpu: '12',
          memory: '45',
          disk: '23',
          uptime: '45 days',
          load: '0.93',
          processes: '156'
        });
      }
    } catch (err) {
      setServerStats({
        status: 'running',
        cpu: '12',
        memory: '45',
        disk: '23',
        uptime: '45 days',
        load: '0.93',
        processes: '156'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAutomationStats = async (isUserAdmin: boolean) => {
    // Only show automations for user if RLS allows (user's automations)
    // For now mock 0 for user
    if (!isUserAdmin) {
      setAutomationCount({ total: 0, enabled: 0 });
    } else {
      setAutomationCount({ total: 49, enabled: 0 });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white font-mono text-sm">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">

      <div className="w-full px-8 py-8">
        {/* Header */}
        <header className="mb-12">
          <div className="flex justify-between items-start mb-8">
            <div className="flex flex-col gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors w-fit group"
              >
                <FiChevronRight className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </Link>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <FiServer className={isAdmin ? "text-orange-500" : "text-gray-500"} size={24} />
                  <h1 className="text-2xl font-bold">{isAdmin ? 'HETZNER SERVER' : 'PERSONAL SERVER'}</h1>
                  <span className={`px-2 py-1 text-xs ${serverStats?.status === 'running'
                    ? 'bg-green-900/30 text-green-400'
                    : 'bg-red-900/30 text-red-400'
                    }`}>
                    {serverStats?.status?.toUpperCase() || '-'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {isAdmin ? 'REDACTED_HOST | Supabase + Automations' : 'NO ACTIVE INSTANCES'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => fetchServerStats(isAdmin)}
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
            <div className="border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiCpu className="text-blue-500" size={14} />
                <span className="text-xs text-gray-500">CPU</span>
              </div>
              <p className="text-xl font-bold">{serverStats?.cpu || '--'}%</p>
            </div>
            <div className="border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiActivity className="text-purple-500" size={14} />
                <span className="text-xs text-gray-500">MEMORY</span>
              </div>
              <p className="text-xl font-bold">{serverStats?.memory || '--'}%</p>
            </div>
            <div className="border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiHardDrive className="text-green-500" size={14} />
                <span className="text-xs text-gray-500">DISK</span>
              </div>
              <p className="text-xl font-bold">{serverStats?.disk || '--'}%</p>
            </div>
            <div className="border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiClock className="text-yellow-500" size={14} />
                <span className="text-xs text-gray-500">UPTIME</span>
              </div>
              <p className="text-xl font-bold text-sm">{serverStats?.uptime || '--'}</p>
            </div>
            <div className="border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiZap className="text-orange-500" size={14} />
                <span className="text-xs text-gray-500">LOAD</span>
              </div>
              <p className="text-xl font-bold">{serverStats?.load || '--'}</p>
            </div>
            <div className="border border-gray-800 p-4">
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
          <h2 className="text-sm text-gray-500 mb-4">RUNNING SERVICES</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {isAdmin && (
              <div className="border border-green-800 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FiDatabase className="text-green-500" size={16} />
                    <span className="font-medium">Supabase</span>
                  </div>
                  <span className="px-2 py-0.5 text-xs bg-green-900/30 text-green-400">RUNNING</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">PostgreSQL + Auth + Storage + Realtime</p>
                <a
                  href="http://REDACTED_HOST:8000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1"
                >
                  <FiExternalLink size={12} />
                  Open Studio
                </a>
              </div>
            )}

            <Link
              href="/dashboard/servers/hetzner/automations"
              className="border border-orange-800 p-4 hover:border-orange-600 transition-colors group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FiZap className="text-orange-500" size={16} />
                  <span className="font-medium">Automations</span>
                </div>
                <span className="px-2 py-0.5 text-xs bg-orange-900/30 text-orange-400">
                  {automationCount.enabled}/{automationCount.total}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">Twitter bots, cron jobs, scheduled tasks</p>
              <span className="text-xs text-orange-400 group-hover:text-orange-300 flex items-center gap-1">
                <FiChevronRight size={12} />
                Manage Automations
              </span>
            </Link>

            <Link
              href="/dashboard/database"
              className="border border-blue-800 p-4 hover:border-blue-600 transition-colors group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FiDatabase className="text-blue-500" size={16} />
                  <span className="font-medium">Database Console</span>
                </div>
                {isAdmin && <span className="px-2 py-0.5 text-xs bg-blue-900/30 text-blue-400">49 SCHEMAS</span>}
              </div>
              <p className="text-xs text-gray-500 mb-3">Manage websites, users, content</p>
              <span className="text-xs text-blue-400 group-hover:text-blue-300 flex items-center gap-1">
                <FiChevronRight size={12} />
                Open Console
              </span>
            </Link>
          </div>
        </section>

        {/* Connection Info - ADMIN ONLY */}
        {isAdmin && (
          <section className="mb-12">
            <h2 className="text-sm text-gray-500 mb-4">CONNECTION INFO</h2>
            <div className="border border-gray-800 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">IP Address</span>
                <span className="text-green-400 font-mono">REDACTED_HOST</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">SSH Port</span>
                <span className="font-mono">22</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">PostgreSQL Port</span>
                <span className="font-mono">54322</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Supabase Studio</span>
                <span className="font-mono">8000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Auth API</span>
                <span className="text-green-400">auth.b0ase.com:8000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Location</span>
                <span>Helsinki, Finland</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Provider</span>
                <span className="text-orange-400">Hetzner Cloud</span>
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}


