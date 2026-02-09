'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/Providers';
import Link from 'next/link';
import {
  FiUsers,
  FiMail,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiArrowLeft,
  FiExternalLink,
  FiCopy,
  FiSearch
} from 'react-icons/fi';
import { FaBitcoin, FaEthereum, FaGoogle, FaGithub } from 'react-icons/fa';

interface AdminUser {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  provider: string;
  providers: string[];
  full_name: string | null;
  avatar_url: string | null;
  handcash_handle: string | null;
  username: string | null;
  is_confirmed: boolean;
  profile?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    handcash_handle: string | null;
    bsv_address: string | null;
    eth_address: string | null;
    sol_address: string | null;
    role: string | null;
  };
}

interface Stats {
  total: number;
  email: number;
  handcash: number;
  google: number;
  github: number;
  withProfile: number;
  confirmed: number;
}

// HandCash icon component
const HandCashIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
  </svg>
);

const providerIcons: Record<string, React.ReactNode> = {
  email: <FiMail className="w-4 h-4" />,
  handcash: <span className="text-green-400 font-bold text-xs">$</span>,
  google: <FaGoogle className="w-4 h-4 text-red-400" />,
  github: <FaGithub className="w-4 h-4" />,
};

const providerColors: Record<string, string> = {
  email: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  handcash: 'bg-green-500/20 text-green-400 border-green-500/30',
  google: 'bg-red-500/20 text-red-400 border-red-500/30',
  github: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

// Generate a consistent color based on string hash
const getAvatarColor = (str: string): string => {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-green-500 to-green-600',
    'from-amber-500 to-amber-600',
    'from-pink-500 to-pink-600',
    'from-cyan-500 to-cyan-600',
    'from-red-500 to-red-600',
    'from-indigo-500 to-indigo-600',
    'from-teal-500 to-teal-600',
    'from-orange-500 to-orange-600',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Get initials from name or email
const getInitials = (user: AdminUser): string => {
  if (user.full_name) {
    const parts = user.full_name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0]?.substring(0, 2).toUpperCase() || '?';
  }
  if (user.username) {
    return user.username.substring(0, 2).toUpperCase();
  }
  if (user.handcash_handle) {
    return user.handcash_handle.replace('$', '').substring(0, 2).toUpperCase();
  }
  if (user.email) {
    return user.email.substring(0, 2).toUpperCase();
  }
  return '??';
};

// Default avatar component
const DefaultAvatar = ({ user }: { user: AdminUser }) => {
  const initials = getInitials(user);
  const colorClass = getAvatarColor(user.id);

  return (
    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg`}>
      <span className="text-sm font-bold text-white drop-shadow-sm">
        {initials}
      </span>
    </div>
  );
};

export default function UsersAdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvider, setFilterProvider] = useState<string>('all');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/dashboard-users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data.users);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredUsers = users.filter(u => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      u.email?.toLowerCase().includes(searchLower) ||
      u.full_name?.toLowerCase().includes(searchLower) ||
      u.username?.toLowerCase().includes(searchLower) ||
      u.handcash_handle?.toLowerCase().includes(searchLower);

    // Provider filter
    const matchesProvider =
      filterProvider === 'all' || u.providers.includes(filterProvider);

    return matchesSearch && matchesProvider;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <FiRefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-4 md:px-8 py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <FiUsers className="w-8 h-8" />
                User Accounts
              </h1>
              <p className="text-white/60 text-sm mt-1">
                Manage and view all registered users
              </p>
            </div>
          </div>
          <button
            onClick={fetchUsers}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title="Refresh"
          >
            <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-xs text-white/60 uppercase tracking-wider">Total Users</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-3xl font-bold text-blue-400">{stats.email}</p>
              <p className="text-xs text-white/60 uppercase tracking-wider">Email</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-3xl font-bold text-green-400">{stats.handcash}</p>
              <p className="text-xs text-white/60 uppercase tracking-wider">HandCash</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-3xl font-bold text-red-400">{stats.google}</p>
              <p className="text-xs text-white/60 uppercase tracking-wider">Google</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-3xl font-bold text-purple-400">{stats.github}</p>
              <p className="text-xs text-white/60 uppercase tracking-wider">GitHub</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-3xl font-bold text-amber-400">{stats.withProfile}</p>
              <p className="text-xs text-white/60 uppercase tracking-wider">Has Profile</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-3xl font-bold text-emerald-400">{stats.confirmed}</p>
              <p className="text-xs text-white/60 uppercase tracking-wider">Confirmed</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search by email, name, username, or handle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
            />
          </div>
          <select
            value={filterProvider}
            onChange={(e) => setFilterProvider(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
          >
            <option value="all">All Providers</option>
            <option value="email">Email</option>
            <option value="handcash">HandCash</option>
            <option value="google">Google</option>
            <option value="github">GitHub</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-xs font-bold text-white/60 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-xs font-bold text-white/60 uppercase tracking-wider">Provider</th>
                  <th className="px-4 py-3 text-xs font-bold text-white/60 uppercase tracking-wider">Connections</th>
                  <th className="px-4 py-3 text-xs font-bold text-white/60 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-bold text-white/60 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-xs font-bold text-white/60 uppercase tracking-wider">Last Sign In</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    {/* User Info */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {u.avatar_url ? (
                          <img
                            src={u.avatar_url}
                            alt={u.full_name || 'User'}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <DefaultAvatar user={u} />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {u.full_name || u.username || 'Unnamed'}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-white/60">
                            {u.email && (
                              <span className="truncate max-w-[200px]">{u.email}</span>
                            )}
                            {u.handcash_handle && (
                              <span className="text-green-400 font-mono">{u.handcash_handle}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Primary Provider */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-medium ${providerColors[u.provider] || 'bg-white/10 text-white/60 border-white/20'}`}>
                        {providerIcons[u.provider] || <FiMail className="w-4 h-4" />}
                        {u.provider}
                      </span>
                    </td>

                    {/* Connections */}
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {u.profile?.bsv_address && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded text-xs cursor-pointer"
                            onClick={() => copyToClipboard(u.profile!.bsv_address!)}
                            title={u.profile.bsv_address}
                          >
                            <FaBitcoin className="w-3 h-3" /> BSV
                          </span>
                        )}
                        {u.profile?.eth_address && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs cursor-pointer"
                            onClick={() => copyToClipboard(u.profile!.eth_address!)}
                            title={u.profile.eth_address}
                          >
                            <FaEthereum className="w-3 h-3" /> ETH
                          </span>
                        )}
                        {u.profile?.sol_address && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded text-xs cursor-pointer"
                            onClick={() => copyToClipboard(u.profile!.sol_address!)}
                            title={u.profile.sol_address}
                          >
                            SOL
                          </span>
                        )}
                        {u.handcash_handle && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-xs">
                            $ {u.handcash_handle.replace('$', '')}
                          </span>
                        )}
                        {!u.profile?.bsv_address && !u.profile?.eth_address && !u.profile?.sol_address && !u.handcash_handle && (
                          <span className="text-white/40 text-xs">None</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {u.is_confirmed ? (
                          <span className="inline-flex items-center gap-1 text-green-400 text-xs">
                            <FiCheck className="w-4 h-4" /> Confirmed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-yellow-400 text-xs">
                            <FiX className="w-4 h-4" /> Unconfirmed
                          </span>
                        )}
                        {u.profile && (
                          <span className="inline-flex items-center gap-1 text-blue-400 text-xs">
                            Profile
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Created */}
                    <td className="px-4 py-4 text-sm text-white/60">
                      {formatDate(u.created_at)}
                    </td>

                    {/* Last Sign In */}
                    <td className="px-4 py-4 text-sm text-white/60">
                      {formatDate(u.last_sign_in_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <FiUsers className="w-12 h-12 mx-auto text-white/20 mb-4" />
              <p className="text-white/60">No users found</p>
            </div>
          )}
        </div>

        {/* User count */}
        <p className="text-sm text-white/40 mt-4">
          Showing {filteredUsers.length} of {users.length} users
        </p>
      </div>
    </div>
  );
}
