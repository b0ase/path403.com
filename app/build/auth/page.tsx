'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import useUserRole from '@/lib/hooks/useUserRole';
import { useAuth } from '@/components/Providers';
import {
  User,
  ArrowRight,
  CheckCircle,
  LogIn,
  UserPlus,
  ArrowLeft,
  Circle
} from 'lucide-react';

function StudioAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { roleData } = useUserRole();
  const { session, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (mounted && !isLoading && session?.user) {
      if (session.user.email === 'admin@b0ase.com') {
        router.push('/dashboard');
      } else {
        router.push('/user/account');
      }
    }
  }, [mounted, isLoading, session, router]);

  // Show loading while checking auth
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <div className="text-center p-12 border border-zinc-900 bg-zinc-950 max-w-sm w-full mx-4">
          <div className="w-8 h-8 border-2 border-zinc-800 border-t-white animate-spin mx-auto mb-6"></div>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em]">Verifying Authentication Protocol...</p>
        </div>
      </div>
    );
  }

  // If user is already authenticated, don't show this page
  if (session?.user) {
    return null; // Will redirect via useEffect
  }

  const handleLogin = () => {
    const currentPath = '/build/auth';
    router.push(`/login?redirectedFrom=${encodeURIComponent(currentPath)}`);
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black">
      <main className="relative z-10 px-4 md:px-8 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 border-b border-zinc-900 pb-12">
            <button
              onClick={() => router.push('/build/role')}
              className="inline-flex items-center text-zinc-500 hover:text-white transition-colors mb-8 text-xs font-bold uppercase tracking-widest group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Role Selection
            </button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {roleData && (
                <div className="mb-8 inline-flex items-center gap-3 px-4 py-2 bg-zinc-950 border border-zinc-900">
                  <CheckCircle className="h-3 w-3 text-white" />
                  <span className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Active Protocol: {roleData.title}</span>
                </div>
              )}

              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter text-white uppercase leading-none mb-6">
                Identity Authentication
              </h1>
              <p className="text-xl text-zinc-400 max-w-3xl leading-relaxed">
                Verify your identity to finalize the commitment to the {roleData?.pathway || 'selected pathway'}. Access to restricted developer and investor tools requires an authenticated session.
              </p>
            </motion.div>
          </div>

          {/* Auth Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-900 border border-zinc-900 max-w-5xl">
            {/* Login Option */}
            <div
              className="bg-black p-12 cursor-pointer hover:bg-zinc-950 transition-all group flex flex-col h-full"
              onClick={handleLogin}
            >
              <div className="mb-12 p-4 border border-zinc-800 bg-zinc-900 text-zinc-500 group-hover:bg-white group-hover:text-black group-hover:border-white transition-all w-fit">
                <LogIn className="h-8 w-8" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-2xl font-bold uppercase tracking-tight text-white leading-none">Sign In</h3>
                  <span className="px-2 py-0.5 bg-zinc-900 text-zinc-600 text-[8px] font-bold uppercase tracking-widest border border-zinc-900">
                    EXISTING ENTITY
                  </span>
                </div>
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest leading-relaxed mb-12 max-w-sm">
                  Access your existing operative dashboard, projects, and saved configurations.
                </p>
              </div>

              <div className="flex items-center gap-3 text-white font-bold text-xs uppercase tracking-widest group-hover:gap-5 transition-all">
                <span>VERIFY IDENTITY</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>

            {/* Sign Up Option */}
            <div
              className="bg-black p-12 cursor-pointer hover:bg-zinc-950 transition-all group flex flex-col h-full"
              onClick={handleSignUp}
            >
              <div className="mb-12 p-4 border border-zinc-800 bg-zinc-900 text-zinc-500 group-hover:bg-white group-hover:text-black group-hover:border-white transition-all w-fit">
                <UserPlus className="h-8 w-8" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-2xl font-bold uppercase tracking-tight text-white leading-none">Register</h3>
                  <span className="px-2 py-0.5 bg-zinc-900 text-zinc-600 text-[8px] font-bold uppercase tracking-widest border border-zinc-900">
                    NEW OPERATOR
                  </span>
                </div>
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest leading-relaxed mb-12 max-w-sm">
                  Initialize a new persistent identity within the b0ase.com ecosystem.
                </p>
              </div>

              <div className="flex items-center gap-3 text-white font-bold text-xs uppercase tracking-widest group-hover:gap-5 transition-all">
                <span>CREATE ACCOUNT</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Network Status / Info */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-zinc-900 pt-12">
            {[
              { label: 'Network Security', value: 'ECC-256 ENCRYPTED' },
              { label: 'Session State', value: 'NON-PERSISTENT' },
              { label: 'Protocol Access', value: 'ROLE-SPECIFIC' }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col gap-2">
                <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">{stat.label}</span>
                <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                  <Circle className="h-1.5 w-1.5 fill-zinc-800 text-zinc-800" />
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function StudioAuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center font-mono">
        <div className="text-zinc-700 text-[10px] font-bold uppercase tracking-[0.4em] animate-pulse">Initializing Interface...</div>
      </div>
    }>
      <StudioAuthContent />
    </Suspense>
  );
}