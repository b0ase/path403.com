'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from './Providers';
import { useUserHandle } from '@/hooks/useUserHandle';
import { FiUser, FiLogOut, FiLayout, FiSettings } from 'react-icons/fi';
import { Wallet } from 'lucide-react';

export default function GlobalAuthBar() {
  const { user, loading, signOut } = useAuth();
  const { handle: handcashHandle } = useUserHandle();

  if (loading || (!user && !handcashHandle)) return null;

  const handleLogout = async () => {
    if (handcashHandle) {
      document.cookie = "b0ase_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "b0ase_user_handle=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.location.reload();
    } else {
      await signOut();
      window.location.href = '/login';
    }
  };

  return (
    <div className="h-10 bg-black border-b border-white/10 flex items-center justify-between px-4 w-full z-[100] font-mono text-[10px] tracking-widest uppercase">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors">
          <FiLayout size={12} />
          <span>Dashboard</span>
        </Link>
        <span className="text-white/20">|</span>
        <div className="flex items-center gap-2 text-white/40">
          <span className="hidden sm:inline">Access:</span>
          <span className="text-white/80">{handcashHandle ? `$${handcashHandle}` : user?.email}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/dashboard/profile" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <FiUser size={12} />
          <span className="hidden sm:inline">Profile</span>
        </Link>
        <Link href="/dashboard/settings" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <FiSettings size={12} />
          <span className="hidden sm:inline">Settings</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-400/60 hover:text-red-400 transition-colors border border-red-400/20 px-2 py-0.5 rounded hover:bg-red-400/10"
        >
          <FiLogOut size={12} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
