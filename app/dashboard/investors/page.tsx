'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/Providers';
import { CapTable, CapTableStats } from '@/components/investors/CapTable';
import { FiArrowLeft, FiUsers, FiDownload, FiPlus } from 'react-icons/fi';
import Link from 'next/link';

export default function DashboardInvestorsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <div className="text-zinc-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="w-full px-8 py-8">
        {/* Header */}
        <header className="mb-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-6"
          >
            <FiArrowLeft size={14} />
            <span className="text-sm">Back to Dashboard</span>
          </Link>

          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <FiUsers className="text-white" size={20} />
                </div>
                <h1 className="text-2xl font-bold">INVESTOR REGISTRY</h1>
              </div>
              <p className="text-sm text-gray-500">Manage $BOASE shareholders and cap table</p>
            </div>

            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors text-sm">
                <FiDownload size={14} />
                Export CSV
              </button>
              <Link
                href="/investors/onboard"
                className="flex items-center gap-2 px-4 py-2 bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-colors"
              >
                <FiPlus size={14} />
                Add Investor
              </Link>
            </div>
          </div>
        </header>

        {/* Stats */}
        <section className="mb-12">
          <h2 className="text-sm text-gray-500 mb-6">PORTFOLIO OVERVIEW</h2>
          <CapTableStats />
        </section>

        {/* Cap Table */}
        <section className="mb-12">
          <h2 className="text-sm text-gray-500 mb-6">SHAREHOLDER REGISTRY</h2>
          <CapTable limit={100} showHeader={false} />
        </section>

        {/* Quick Actions */}
        <section className="mb-12">
          <h2 className="text-sm text-gray-500 mb-6">QUICK ACTIONS</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/dashboard/fundraising"
              className="border border-zinc-800 p-6 hover:border-zinc-600 transition-colors group"
            >
              <h3 className="font-bold text-white mb-2 group-hover:text-zinc-300">Fundraising</h3>
              <p className="text-xs text-zinc-500">Manage funding rounds</p>
            </Link>
            <Link
              href="/api/investors/cap-table?format=csv"
              className="border border-zinc-800 p-6 hover:border-zinc-600 transition-colors group"
            >
              <h3 className="font-bold text-white mb-2 group-hover:text-zinc-300">Export Data</h3>
              <p className="text-xs text-zinc-500">Download cap table CSV</p>
            </Link>
            <Link
              href="/investors/onboard"
              className="border border-zinc-800 p-6 hover:border-zinc-600 transition-colors group"
            >
              <h3 className="font-bold text-white mb-2 group-hover:text-zinc-300">Onboard</h3>
              <p className="text-xs text-zinc-500">Add new investor</p>
            </Link>
            <Link
              href="/dashboard/database"
              className="border border-zinc-800 p-6 hover:border-zinc-600 transition-colors group"
            >
              <h3 className="font-bold text-white mb-2 group-hover:text-zinc-300">Database</h3>
              <p className="text-xs text-zinc-500">View raw data</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
