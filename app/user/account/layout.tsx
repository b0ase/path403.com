'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useColorTheme } from '@/components/ThemePicker';
import { useUserHandle } from '@/hooks/useUserHandle';
import { useAuth } from '@/components/Providers';
import {
    FiGrid, FiUser, FiMessageSquare, FiCpu,
    FiPieChart, FiServer, FiDatabase,
    FiShield, FiSettings, FiCheck, FiGlobe, FiFileText, FiHardDrive, FiEdit3, FiHash
} from 'react-icons/fi';
import {
    FaFacebook, FaGithub, FaGoogle, FaLinkedin, FaTwitter,
    FaDiscord, FaYoutube, FaInstagram, FaTiktok, FaTwitch,
    FaRobot, FaUsers, FaBuilding, FaCoins, FaImage
} from 'react-icons/fa';

// Re-export icons needed for page.tsx if they were used there,
// strictly speaking layout doesn't need to re-export but keeping imports clean.

const themeBackgrounds: Record<string, string> = {
    black: 'bg-black text-white',
    white: 'bg-white text-black',
    yellow: 'bg-amber-400 text-black',
    red: 'bg-red-500 text-black',
    green: 'bg-green-500 text-black',
    blue: 'bg-blue-500 text-black',
};

type TabType = 'overview' | 'account' | 'repos' | 'projects' | 'investments' | 'boardroom' | 'companies' | 'tokens' | 'kyc' | 'connections' | 'settings' | 'agents' | 'messages' | 'servers' | 'database' | 'automations' | 'domains' | 'brand' | 'infrastructure' | 'contracts' | 'content' | 'signatures' | 'hashes';

export default function UserAccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const { handle, isClient } = useUserHandle();
    const { user, loading } = useAuth();
    const { colorTheme } = useColorTheme();

    const [mounted, setMounted] = useState(false);
    const [greeting, setGreeting] = useState('Welcome');

    // KYC Status (simulated or fetched)
    const [kycStatus, setKycStatus] = useState<'none' | 'pending' | 'verified' | 'rejected'>('none');

    useEffect(() => {
        setMounted(true);

        // Greeting
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');

        // Load KYC status
        if (typeof window !== 'undefined') {
            const savedStatus = localStorage.getItem('kycStatus');
            if (savedStatus) setKycStatus(savedStatus as any);
        }
    }, []);

    // Tabs Configuration - Alphabetically sorted (excluding Profile and Settings)
    const tabs: { id: TabType; label: string; icon: React.ReactNode; href?: string }[] = [
        { id: 'account', label: 'Profile', icon: <FiUser size={14} /> },
        { id: 'settings', label: 'Settings', icon: <FiSettings size={14} /> },
        // Alphabetically arranged tabs
        { id: 'agents', label: 'Agents', icon: <FaRobot size={14} />, href: '/user/account/agents' },
        { id: 'automations', label: 'Automations', icon: <FiCpu size={14} />, href: '/user/account/automations' },
        { id: 'boardroom', label: 'Boardroom', icon: <FaUsers size={14} /> },
        { id: 'brand', label: 'Brand Assets', icon: <FaImage size={14} /> },
        { id: 'companies', label: 'Companies', icon: <FaBuilding size={14} /> },
        { id: 'connections', label: 'Connections', icon: <FiCpu size={14} /> },
        { id: 'contracts', label: 'Contracts', icon: <FiFileText size={14} /> },
        { id: 'content', label: 'Content', icon: <FiCpu size={14} /> },
        { id: 'database', label: 'Database', icon: <FiDatabase size={14} />, href: '/user/account/database' },
        { id: 'domains', label: 'Domains', icon: <FiGlobe size={14} /> },
        { id: 'hashes', label: 'File Hashes', icon: <FiHash size={14} />, href: '/user/account/hashes' },
        { id: 'infrastructure', label: 'Infrastructure', icon: <FiHardDrive size={14} /> },
        { id: 'investments', label: 'Investments', icon: <FiPieChart size={14} />, href: '/user/account/investments' },
        { id: 'kyc', label: 'KYC', icon: <FiShield size={14} /> },
        { id: 'messages', label: 'Messages', icon: <FiMessageSquare size={14} />, href: '/user/account/messages' },
        { id: 'projects', label: 'Projects', icon: <FaRobot size={14} /> },
        { id: 'repos', label: 'Repos', icon: <FaGithub size={14} /> },
        { id: 'servers', label: 'Servers', icon: <FiServer size={14} />, href: '/user/account/servers' },
        { id: 'signatures', label: 'Signatures', icon: <FiEdit3 size={14} />, href: '/user/account/signatures' },
        { id: 'tokens', label: 'Tokens', icon: <FaCoins size={14} /> },
    ];

    // Split alphabetical tabs into two rows (A-C and D-T)
    const alphabeticalTabs = tabs.filter(t => t.id !== 'account' && t.id !== 'settings');
    const topRowTabs = alphabeticalTabs.slice(0, 9); // Agents through Database
    const bottomRowTabs = alphabeticalTabs.slice(9); // Domains through Tokens

    if (!mounted || !isClient || loading) {
        return null; // Or a loading spinner matching page.tsx
    }

    // Determine active tab
    // 1. Check pathname for sub-routes
    let activeTab: TabType = 'account';

    // Check if current path matches any external href
    const matchingTab = tabs.find(t => t.href && pathname?.startsWith(t.href));
    if (matchingTab) {
        activeTab = matchingTab.id;
    } else {
        // 2. Fallback to search param for internal tabs
        const tabParam = searchParams.get('tab');
        if (tabParam) activeTab = tabParam as TabType;
    }

    const isDark = colorTheme === 'black';
    const displayName = handle || user?.email?.split('@')[0] || 'User';

    return (
        <div className={`min-h-screen relative ${themeBackgrounds[colorTheme] || themeBackgrounds.black}`}>
            <section className="px-4 md:px-8 py-8 relative">
                <div className="w-full">
                    {/* Header */}
                    <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-900 pb-8 gap-6">
                        <div className="flex items-end gap-6">
                            <h2 className="text-4xl md:text-5xl font-bold text-white leading-none tracking-tighter uppercase">
                                {displayName}
                            </h2>
                            <div className="text-[10px] text-zinc-600 mb-1 font-mono uppercase tracking-[0.3em] font-bold">
                                {greeting}_MANIFEST
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 text-[9px] font-bold font-mono tracking-widest flex items-center gap-2 border ${kycStatus === 'verified' ? 'bg-green-950/20 border-green-900 text-green-500' :
                                kycStatus === 'pending' ? 'bg-amber-950/20 border-amber-900 text-amber-500' :
                                    'bg-zinc-900/50 border-zinc-800 text-zinc-500'
                                }`}>
                                {kycStatus === 'verified' ? <FiCheck size={10} /> : <FiShield size={10} />}
                                STATUS_KYC_{kycStatus === 'none' ? 'UNVERIFIED' : kycStatus.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Persistent Tabs - 2 Horizontal Rows with Grid Alignment */}
                    <div className="flex flex-col gap-2 mb-12 border-b border-zinc-900 pb-8">
                        {/* Row 1: Profile | Alphabetical Tabs (A-D) */}
                        <div className="flex flex-wrap items-center gap-1">
                            <Link
                                href="/user/account?tab=account"
                                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all font-mono border ${activeTab === 'account'
                                    ? 'bg-white text-black border-white'
                                    : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-white hover:border-zinc-700'
                                    }`}
                            >
                                <FiUser size={12} />
                                IDENTITY_PROFILE
                            </Link>
                            <div className="h-4 w-[1px] bg-zinc-800 mx-2 hidden sm:block" />
                            {topRowTabs.map(tab => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <Link
                                        key={tab.id}
                                        href={tab.href || `/user/account?tab=${tab.id}`}
                                        className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all font-mono border ${isActive
                                            ? 'bg-white text-black border-white'
                                            : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-white hover:border-zinc-700'
                                            }`}
                                    >
                                        {tab.icon}
                                        <span className="hidden xl:inline">{tab.label.toUpperCase().replace(/\s+/g, '_')}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Row 2: Settings | Alphabetical Tabs (D-T) */}
                        <div className="flex flex-wrap items-center gap-1">
                            <Link
                                href="/user/account?tab=settings"
                                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all font-mono border ${activeTab === 'settings'
                                    ? 'bg-white text-black border-white'
                                    : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-white hover:border-zinc-700'
                                    }`}
                            >
                                <FiSettings size={12} />
                                PROTOCOL_SETTINGS
                            </Link>
                            <div className="h-4 w-[1px] bg-zinc-800 mx-2 hidden sm:block" />
                            {bottomRowTabs.map(tab => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <Link
                                        key={tab.id}
                                        href={tab.href || `/user/account?tab=${tab.id}`}
                                        className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all font-mono border ${isActive
                                            ? 'bg-white text-black border-white'
                                            : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-white hover:border-zinc-700'
                                            }`}
                                    >
                                        {tab.icon}
                                        <span className="hidden xl:inline">{tab.label.toUpperCase().replace(/\s+/g, '_')}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Children Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab} // Unique key based on active tab/route
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </section>
        </div>
    );
}
