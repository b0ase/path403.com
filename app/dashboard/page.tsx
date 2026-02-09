'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/Providers';
import {
  FiUser,
  FiFolder,
  FiServer,
  FiUsers,
  FiMessageSquare,
  FiBook,
  FiDollarSign,
  FiSettings,
  FiArrowRight,
  FiEdit,
  FiLoader
} from 'react-icons/fi';


export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = React.useState(false);
  const [displayName, setDisplayName] = React.useState<string>('User');

  // Ensure consistent hydration
  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (mounted && !loading && !user) {
      console.log('Dashboard: No user found, redirecting to login');
      router.replace('/login');
      return;
    }

    if (user) {
      console.log('Dashboard: User logged in:', user.email);
      setDisplayName(user.email || 'Richard Boase');
    }
  }, [mounted, loading, user, router]);

  // Always render the same structure on server and initial client render
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <FiLoader className="w-8 h-8 animate-spin text-white/40" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <FiLoader className="w-8 h-8 animate-spin text-white/40" />
      </div>
    );
  }

  const menuItems = [
    { href: '/dashboard/agents', icon: FiUsers, title: 'Agents' },
    { href: '/dashboard/auto-book', icon: FiBook, title: 'Auto-Book' },
    { href: '/dashboard/servers/hetzner/automations', icon: FiSettings, title: 'Automations' },
    { href: '/dashboard/blog', icon: FiEdit, title: 'Blog' },
    { href: '/dashboard/business-plan', icon: FiSettings, title: 'Business Plan' },
    { href: '/dashboard/cron-jobs', icon: FiSettings, title: 'Cron Jobs' },
    { href: '/dashboard/database', icon: FiFolder, title: 'Database' },
    { href: '/dashboard/finances', icon: FiDollarSign, title: 'Finances' },
    { href: '/dashboard/fundraising', icon: FiDollarSign, title: 'Fundraising' },
    { href: '/dashboard/investors', icon: FiUsers, title: 'Investors' },
    { href: '/dashboard/kintsugi', icon: FiMessageSquare, title: 'Kintsugi Proposals' },
    { href: '/dashboard/marketing-plan', icon: FiSettings, title: 'Marketing' },
    { href: '/dashboard/projects', icon: FiFolder, title: 'Projects' },
    { href: '/dashboard/projections', icon: FiDollarSign, title: 'Projections' },
    { href: '/dashboard/servers/hetzner', icon: FiServer, title: 'Servers' },
    { href: '/dashboard/social-accounts', icon: FiSettings, title: 'Social Accounts' },
    { href: '/dashboard/teams', icon: FiUsers, title: 'Teams' },
    { href: '/dashboard/users', icon: FiUsers, title: 'Users' },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-mono">

      <div className="w-full px-8 py-8">
        {/* Dashboard Header */}
        <header className="mb-16">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-2xl font-bold mb-2">B0ASE DASHBOARD</h1>
              <p className="text-sm text-gray-500">SYSTEM ACCESS: {displayName}</p>
            </div>
          </div>
        </header>

        {/* Main Navigation */}
        <main>
          <div className="mb-12">
            <h2 className="text-sm text-gray-500 mb-6">SYSTEM MODULES</h2>
            <div className="space-y-2">
              {menuItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="group block border-b border-gray-900 hover:border-gray-700 transition-all"
                >
                  <div className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <item.icon className="text-gray-500 group-hover:text-white" size={16} />
                      <span className="font-medium group-hover:text-white transition-colors">
                        {item.title.toUpperCase()}
                      </span>
                    </div>
                    <FiArrowRight className="text-gray-700 group-hover:text-gray-500 transition-all group-hover:translate-x-1" size={14} />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="mt-16">
            <h2 className="text-sm text-gray-500 mb-6">SYSTEM STATUS</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <p className="text-2xl font-bold mb-1">0</p>
                <p className="text-xs text-gray-500">ACTIVE PROJECTS</p>
              </div>
              <div>
                <p className="text-2xl font-bold mb-1">0</p>
                <p className="text-xs text-gray-500">TEAM MEMBERS</p>
              </div>
              <div>
                <p className="text-2xl font-bold mb-1">0</p>
                <p className="text-xs text-gray-500">MESSAGES</p>
              </div>
              <div>
                <p className="text-2xl font-bold mb-1">1</p>
                <p className="text-xs text-gray-500">DAYS ACTIVE</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-16">
            <h2 className="text-sm text-gray-500 mb-6">RECENT ACTIVITY</h2>
            <div className="border border-gray-900 p-8">
              <p className="text-sm text-gray-600 text-center">
                NO RECENT ACTIVITY
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 