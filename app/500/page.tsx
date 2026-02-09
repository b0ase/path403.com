'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import { useNavbar } from '@/components/NavbarProvider';

const WireframeAnimation = dynamic(
    () => import('@/components/landing/WireframeAnimation'),
    {
        ssr: false,
        loading: () => <div className="w-full h-full bg-transparent" />
    }
);

export default function ServerError() {
    const [isClient, setIsClient] = useState(false);
    const { isDark } = useNavbar();

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <div className="min-h-screen bg-black" />;
    }

    return (
        <div className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-white text-black'} relative overflow-hidden`}>
            {/* Three.js Background Animation */}
            <div className="fixed inset-0 z-0">
                <WireframeAnimation
                    isDark={isDark}
                    colorTheme={isDark ? 'black' : 'white'}
                    colorIntense={true} // Intense for error?
                    structured={false} // Different look for chaos/error?
                    animationExpanded={true}
                    shadeLevel={4}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 md:px-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-2xl"
                >
                    {/* 500 */}
                    <div className="relative inline-block">
                        <h1
                            className="text-9xl md:text-[12rem] font-black leading-none mb-4 tracking-tighter glitched-text"
                            style={{
                                fontFamily: 'var(--font-space-grotesk)',
                                letterSpacing: '-0.02em',
                                textShadow: isDark ? '2px 2px 0px rgba(255,0,0,0.5)' : '2px 2px 0px rgba(255,0,0,0.2)'
                            }}
                        >
                            500
                        </h1>
                    </div>

                    {/* Error Message */}
                    <h2
                        className={`text-2xl md:text-3xl font-bold mb-4 uppercase tracking-wide flex items-center justify-center gap-3 ${isDark ? 'text-white' : 'text-black'}`}
                        style={{ fontFamily: 'var(--font-space-grotesk)' }}
                    >
                        <FiAlertTriangle className="mb-1 text-red-500" />
                        System Malfunction
                    </h2>

                    <p
                        className={`text-base md:text-lg mb-8 ${isDark ? 'text-white/70' : 'text-black/70'}`}
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    >
                        Our servers encountered an unexpected condition. <br />
                        The team has been notified. Please try again shortly.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={() => window.location.reload()}
                            className={`group flex items-center gap-2 px-8 py-4 rounded-full transition-all text-sm font-bold uppercase tracking-wider ${isDark
                                ? 'bg-white text-black hover:bg-gray-200'
                                : 'bg-black text-white hover:bg-gray-800'
                                }`}
                        >
                            <FiRefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                            <span>Reload Page</span>
                        </button>

                        <Link
                            href="/"
                            className={`group flex items-center gap-2 px-8 py-4 rounded-full border transition-all text-sm font-bold uppercase tracking-wider ${isDark
                                ? 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white'
                                : 'border-black/20 hover:border-black/40 bg-black/5 hover:bg-black/10 text-black'
                                }`}
                        >
                            <FiHome size={16} />
                            <span>Return Home</span>
                        </Link>
                    </div>

                    {/* System Status */}
                    <div className="mt-12 pt-8 border-t border-white/10">
                        <div className={`flex items-center justify-center gap-2 text-xs uppercase tracking-widest ${isDark ? 'text-white/50' : 'text-black/50'}`}>
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            System Status: Degraded
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
