'use client';

import React, { useState } from 'react';
import { useAuth } from './Providers';
import { FiMail, FiLock, FiArrowRight, FiLoader } from 'react-icons/fi';
import { useTheme } from 'next-themes';

interface EmailAuthProps {
    mode: 'login' | 'signup';
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

export default function EmailAuth({ mode, onSuccess, onError }: EmailAuthProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signInWithEmail, signUpWithEmail } = useAuth();
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let result;
            if (mode === 'signup') {
                result = await signUpWithEmail(email, password);
            } else {
                result = await signInWithEmail(email, password);
            }

            if (result.error) {
                throw result.error;
            }

            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error('Auth error:', error);
            if (onError) onError(error.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500">
                    Email Address
                </label>
                <div className={`flex items-center px-4 py-3 border rounded-none transition-colors ${isDark
                        ? 'bg-black/50 border-gray-700 focus-within:border-white'
                        : 'bg-white border-gray-300 focus-within:border-black'
                    }`}>
                    <FiMail className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="flex-1 ml-3 bg-transparent outline-none text-sm font-mono"
                        placeholder="you@example.com"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500">
                    Password
                </label>
                <div className={`flex items-center px-4 py-3 border rounded-none transition-colors ${isDark
                        ? 'bg-black/50 border-gray-700 focus-within:border-white'
                        : 'bg-white border-gray-300 focus-within:border-black'
                    }`}>
                    <FiLock className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="flex-1 ml-3 bg-transparent outline-none text-sm font-mono"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-6 flex items-center justify-center gap-3 font-bold uppercase tracking-wide text-sm transition-all ${isDark
                        ? 'bg-white text-black hover:bg-gray-200'
                        : 'bg-black text-white hover:bg-gray-800'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {loading ? (
                    <FiLoader className="animate-spin text-lg" />
                ) : (
                    <>
                        {mode === 'signup' ? 'Create Account' : 'Sign In'}
                        <FiArrowRight />
                    </>
                )}
            </button>
        </form>
    );
}
