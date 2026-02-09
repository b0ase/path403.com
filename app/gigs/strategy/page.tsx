"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import getSupabaseBrowserClient from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { FaSpinner, FaLock } from 'react-icons/fa';

export default function StrategyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await getSupabaseBrowserClient().auth.getUser();
      setUser(user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  // Check if user is admin@b0ase.com
  const isAuthorizedUser = user?.email === 'admin@b0ase.com';

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <FaSpinner className="animate-spin text-4xl text-sky-500 mr-3" />
          <span className="text-xl text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <FaLock className="mx-auto text-6xl text-gray-500 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Access Restricted</h1>
          <p className="text-gray-400 mb-6">You need to be logged in to view this content.</p>
          <Link href="/login" className="bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 px-4 rounded-md transition-colors">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (!isAuthorizedUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <FaLock className="mx-auto text-6xl text-gray-500 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">This content is only available to the authorized user.</p>
          <Link href="/auth/gigs" className="bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 px-4 rounded-md transition-colors">
            Go to Gigs Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/gigs" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
          <span>←</span> Back to Gigs Hub
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Gigs Strategy</h1>
      <p className="text-gray-400 mb-8">Strategic planning and analysis for freelance gig opportunities.</p>
      
      {/* Add your strategy content here */}
      <div className="space-y-6">
        <div className="p-6 border border-gray-700 rounded-lg bg-gray-850">
          <h2 className="text-xl font-semibold mb-4 text-sky-400">Strategy Overview</h2>
          <p className="text-gray-300 mb-4">
            This page contains personalized strategy content for admin@b0ase.com.
          </p>
          {/* Add more strategy content as needed */}
        </div>
      </div>
    </div>
  );
} 