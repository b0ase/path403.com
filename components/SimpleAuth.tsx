'use client';

import React, { useState, useEffect } from 'react';
import { FaGoogle, FaTwitter, FaDiscord, FaGithub, FaLinkedin, FaWallet } from 'react-icons/fa';
import { FiZap } from 'react-icons/fi';
import { useTheme } from 'next-themes';
import { useAuth } from './Providers';
import { useRouter } from 'next/navigation';

import EmailAuth from '@/components/EmailAuth';

interface SimpleAuthProps {
  mode?: 'login' | 'signup';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function SimpleAuth({ mode = 'login', onSuccess, onError }: SimpleAuthProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const router = useRouter();

  const { signInWithGoogle, signInWithDiscord, signInWithGithub, signInWithLinkedin } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOAuthSignIn = async (provider: string, signInFn: () => Promise<{ error?: any }>) => {
    setIsLoading(provider);
    setError(null);

    try {
      const { error } = await signInFn();
      if (error) {
        setError(error.message);
        onError?.(error.message);
        setIsLoading(null);
      }
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}`);
      onError?.(err.message || `Failed to sign in with ${provider}`);
      setIsLoading(null);
    }
  };

  if (!mounted) {
    return <div className="w-full h-32" />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <div className="w-full space-y-6">
      {error && (
        <div className={`p-4 border border-red-500/50 text-xs uppercase tracking-wide ${isDark ? 'bg-red-950/30 text-red-400' : 'bg-red-50 text-red-600'}`}>
          <span className="font-bold block mb-1">Error:</span>
          {error}
        </div>
      )}

      {/* Primary - Email/Password */}
      <EmailAuth
        mode={mode}
        onSuccess={() => {
          if (onSuccess) onSuccess();
        }}
        onError={(msg) => setError(msg)}
      />

      {/* Divider */}
      <div className="flex items-center gap-3 my-2">
        <div className={`flex-1 h-px ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
        <span className="text-[10px] text-gray-500 uppercase tracking-widest">or continue with</span>
        <div className={`flex-1 h-px ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
      </div>

      {/* Secondary - Google */}
      <button
        onClick={() => handleOAuthSignIn('google', signInWithGoogle)}
        disabled={isLoading !== null}
        className={`w-full flex items-center justify-center gap-3 py-3 px-6 font-bold uppercase tracking-wide text-xs transition-colors disabled:opacity-50 border ${isDark
          ? 'bg-transparent text-white border-gray-700 hover:bg-gray-900'
          : 'bg-white text-black border-gray-300 hover:bg-gray-50'
          }`}
      >
        <FaGoogle className="text-sm" />
        {isLoading === 'google' ? 'Redirecting...' : 'Google'}
      </button>

      {/* Tertiary providers */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => {
            setIsLoading('twitter');
            window.location.href = '/api/auth/twitter';
          }}
          disabled={isLoading !== null}
          className={`flex items-center justify-center p-3 transition-colors disabled:opacity-50 border rounded-none ${isDark
            ? 'text-white border-gray-800 hover:bg-gray-900'
            : 'text-black border-gray-200 hover:bg-gray-50'
            }`}
          title="Sign in with X"
        >
          <FaTwitter className="text-sm" />
        </button>

        <button
          onClick={() => handleOAuthSignIn('discord', signInWithDiscord)}
          disabled={isLoading !== null}
          className={`flex items-center justify-center p-3 transition-colors disabled:opacity-50 border rounded-none ${isDark
            ? 'text-white border-gray-800 hover:bg-gray-900'
            : 'text-black border-gray-200 hover:bg-gray-50'
            }`}
          title="Sign in with Discord"
        >
          <FaDiscord className="text-sm" />
        </button>

        <button
          onClick={() => handleOAuthSignIn('github', signInWithGithub)}
          disabled={isLoading !== null}
          className={`flex items-center justify-center p-3 transition-colors disabled:opacity-50 border rounded-none ${isDark
            ? 'text-white border-gray-800 hover:bg-gray-900'
            : 'text-black border-gray-200 hover:bg-gray-50'
            }`}
          title="Sign in with GitHub"
        >
          <FaGithub className="text-sm" />
        </button>

        <button
          onClick={() => handleOAuthSignIn('linkedin', signInWithLinkedin)}
          disabled={isLoading !== null}
          className={`flex items-center justify-center p-3 transition-colors disabled:opacity-50 border rounded-none ${isDark
            ? 'text-white border-gray-800 hover:bg-gray-900'
            : 'text-black border-gray-200 hover:bg-gray-50'
            }`}
          title="Sign in with LinkedIn"
        >
          <FaLinkedin className="text-sm" />
        </button>
      </div>
    </div>
  );
}
