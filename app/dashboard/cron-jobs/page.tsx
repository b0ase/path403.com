'use client';

import React, { useEffect, useState } from 'react';

interface CronJob {
  id: string;
  name: string;
  path: string;
  schedule: string;
  description: string;
  twitter_account: string | null;
  status: 'active' | 'manual' | 'disabled';
}

interface SocialAccount {
  id: string;
  site: string;
  platform: string;
  handle: string;
  profile_url: string;
  active: boolean;
  queue_count?: number;
  failed_count?: number;
}

interface CronStatus {
  cronJobs: CronJob[];
  accounts: SocialAccount[];
  timestamp: string;
}

export default function CronJobsPage() {
  const [status, setStatus] = useState<CronStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    try {
      const res = await fetch('/api/cron/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      } else {
        console.error('Failed to fetch cron status:', await res.text());
      }
    } catch (error) {
      console.error('Error fetching cron status:', error);
    } finally {
      setLoading(false);
    }
  }

  async function triggerCronJob(cronId: string, path: string) {
    if (triggering) return;

    if (!confirm(`TRIGGER: ${cronId}?`)) return;

    setTriggering(cronId);

    try {
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        const result = await res.json();
        alert(`SUCCESS\n\n${JSON.stringify(result, null, 2)}`);
        await fetchStatus();
      } else {
        const error = await res.json();
        alert(`FAILED\n\n${error.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      alert(`ERROR\n\n${error.message}`);
    } finally {
      setTriggering(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-mono p-8">
        <div className="text-sm text-gray-500">LOADING...</div>
      </div>
    );
  }

  const activeAccounts = status?.accounts.filter(a => a.active) || [];
  const totalQueued = activeAccounts.reduce((sum, acc) => sum + (acc.queue_count || 0), 0);

  return (
    <div className="min-h-screen bg-black text-white font-mono p-8">
      <div className="w-full">
        {/* Header */}
        <header className="mb-12">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">CRON JOBS</h1>
              <p className="text-sm text-gray-500">AUTOMATED TASK MONITORING</p>
            </div>
            <button
              onClick={fetchStatus}
              className="text-sm text-gray-500 hover:text-white border-b border-gray-900 hover:border-gray-700 transition-all"
            >
              REFRESH
            </button>
          </div>
        </header>

        {/* Stats */}
        <div className="mb-12">
          <h2 className="text-sm text-gray-500 mb-6">SYSTEM STATUS</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <p className="text-2xl font-bold mb-1">{status?.cronJobs.filter(j => j.status === 'active').length || 0}</p>
              <p className="text-xs text-gray-500">ACTIVE CRON JOBS</p>
            </div>
            <div>
              <p className="text-2xl font-bold mb-1">{activeAccounts.length}</p>
              <p className="text-xs text-gray-500">ACTIVE ACCOUNTS</p>
            </div>
            <div>
              <p className="text-2xl font-bold mb-1">{totalQueued}</p>
              <p className="text-xs text-gray-500">QUEUED POSTS</p>
            </div>
            <div>
              <p className="text-2xl font-bold mb-1">
                {status?.timestamp ? new Date(status.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </p>
              <p className="text-xs text-gray-500">LAST UPDATED</p>
            </div>
          </div>
        </div>

        {/* Cron Jobs List */}
        <div className="mb-12">
          <h2 className="text-sm text-gray-500 mb-6">SCHEDULED JOBS</h2>
          <div className="space-y-2">
            {status?.cronJobs.map((job, index) => (
              <div
                key={job.id}
                className="border-b border-gray-900 hover:border-gray-700 transition-all"
              >
                <div className="py-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs text-gray-600">{String(index + 1).padStart(2, '0')}</span>
                        <h3 className="font-medium">{job.name}</h3>
                        {job.status === 'active' && (
                          <span className="text-xs text-green-500">● ACTIVE</span>
                        )}
                        {job.status === 'manual' && (
                          <span className="text-xs text-blue-500">● MANUAL</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{job.description}</p>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>SCHEDULE: <span className="text-white">{job.schedule}</span></div>
                        {job.twitter_account && job.twitter_account !== 'Not configured' && (
                          <div>ACCOUNT: <span className="text-white">{job.twitter_account}</span></div>
                        )}
                        <div>ENDPOINT: <span className="text-gray-500">{job.path}</span></div>
                      </div>
                    </div>
                    <button
                      onClick={() => triggerCronJob(job.id, job.path)}
                      disabled={triggering !== null}
                      className={`text-xs px-3 py-1 border transition-all ${
                        triggering === job.id
                          ? 'border-gray-700 text-gray-600 cursor-wait'
                          : 'border-gray-800 hover:border-white text-gray-400 hover:text-white'
                      }`}
                    >
                      {triggering === job.id ? 'RUNNING...' : 'TRIGGER'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Twitter Accounts */}
        {activeAccounts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-sm text-gray-500 mb-6">CONNECTED ACCOUNTS</h2>
            <div className="space-y-2">
              {activeAccounts.map((account, index) => (
                <div key={account.id} className="border-b border-gray-900 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <span className="text-xs text-gray-600">{String(index + 1).padStart(2, '0')}</span>
                      <div>
                        <div className="font-medium">{account.handle}</div>
                        <div className="text-xs text-gray-600">{account.site} • {account.platform}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">
                      QUEUED: <span className="text-white">{account.queue_count || 0}</span>
                      {account.failed_count > 0 && (
                        <span className="ml-4">FAILED: <span className="text-red-500">{account.failed_count}</span></span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-16">
          <h2 className="text-sm text-gray-500 mb-6">INFORMATION</h2>
          <div className="border border-gray-900 p-6">
            <div className="text-sm text-gray-600 space-y-2">
              <p>• SCHEDULED JOBS run automatically on Vercel</p>
              <p>• MANUAL JOBS must be triggered using TRIGGER button</p>
              <p>• Blog generation pulls from /admin/content ideas bucket</p>
              <p>• Twitter posting uses configured accounts from /dashboard/social-accounts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
