'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    FiArrowLeft,
    FiUser,
    FiDollarSign,
    FiTrendingUp,
    FiCheckCircle,
    FiClock,
    FiAlertCircle,
} from 'react-icons/fi';

interface Investor {
    id: string;
    name: string;
    email: string;
    monthlyPledge: number;
    projectsSupported: string[];
    status: 'active' | 'pending' | 'inactive';
    totalInvested: number;
    equityEarned: number;
    joinedAt: string;
}

// Placeholder data - will be replaced with database fetch
const PLACEHOLDER_INVESTORS: Investor[] = [
    {
        id: '1',
        name: 'Investor Pool Empty',
        email: 'setup@b0ase.com',
        monthlyPledge: 0,
        projectsSupported: ['Waiting for pledges'],
        status: 'inactive',
        totalInvested: 0,
        equityEarned: 0,
        joinedAt: new Date().toISOString(),
    },
];

export default function KintsugiInvestorsPage() {
    const [investors, setInvestors] = useState<Investor[]>(PLACEHOLDER_INVESTORS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchInvestors() {
            try {
                // TODO: Fetch from /api/kintsugi/investors
                // const res = await fetch('/api/kintsugi/investors');
                // if (res.ok) {
                //   const data = await res.json();
                //   setInvestors(data.investors);
                // }
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch investors:', error);
                setLoading(false);
            }
        }
        fetchInvestors();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-400 bg-green-400/10';
            case 'pending': return 'text-yellow-400 bg-yellow-400/10';
            default: return 'text-zinc-500 bg-zinc-500/10';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <FiCheckCircle className="w-3 h-3" />;
            case 'pending': return <FiClock className="w-3 h-3" />;
            default: return <FiAlertCircle className="w-3 h-3" />;
        }
    };

    const totalMonthlyPledges = investors.reduce((sum, inv) => sum + inv.monthlyPledge, 0);
    const totalInvested = investors.reduce((sum, inv) => sum + inv.totalInvested, 0);

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/kintsugi"
                        className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors"
                    >
                        <FiArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Kintsugi Investors</h1>
                        <p className="text-zinc-500 text-sm">Internal investor pool for project funding</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                        <div className="text-2xl font-bold">{investors.length}</div>
                        <div className="text-zinc-500 text-sm">Total Investors</div>
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-400">
                            £{totalMonthlyPledges.toLocaleString()}
                        </div>
                        <div className="text-zinc-500 text-sm">Monthly Pledges</div>
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-400">
                            £{totalInvested.toLocaleString()}
                        </div>
                        <div className="text-zinc-500 text-sm">Total Invested</div>
                    </div>
                </div>

                {/* Investor List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-12 text-zinc-500">Loading investors...</div>
                    ) : investors.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-zinc-800 rounded-lg">
                            <FiUser className="w-8 h-8 mx-auto mb-3 text-zinc-600" />
                            <p className="text-zinc-500">No investors signed up yet.</p>
                            <p className="text-zinc-600 text-sm mt-1">
                                Investors can pledge at b0ase.com/investors
                            </p>
                        </div>
                    ) : (
                        investors.map((investor) => (
                            <motion.div
                                key={investor.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold">{investor.name}</h3>
                                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getStatusColor(investor.status)}`}>
                                                {getStatusIcon(investor.status)}
                                                {investor.status}
                                            </span>
                                        </div>
                                        <p className="text-zinc-500 text-sm mb-3">{investor.email}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {investor.projectsSupported.map((project, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-400"
                                                >
                                                    {project}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-right text-sm">
                                        <div className="flex items-center gap-1 text-green-400 mb-1 font-mono">
                                            <FiDollarSign className="w-4 h-4" />
                                            <span>£{investor.monthlyPledge}/mo</span>
                                        </div>
                                        <div className="text-zinc-500">
                                            £{investor.totalInvested.toLocaleString()} invested
                                        </div>
                                        <div className="text-zinc-400 font-mono text-xs">
                                            {investor.equityEarned}% equity
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Actions */}
                <div className="mt-8 pt-8 border-t border-zinc-800">
                    <h3 className="font-semibold mb-4">Actions</h3>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/investors"
                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
                        >
                            View Public Investor Page
                        </Link>
                        <button
                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors opacity-50 cursor-not-allowed"
                            disabled
                        >
                            Invite Investor
                        </button>
                        <button
                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors opacity-50 cursor-not-allowed"
                            disabled
                        >
                            Export List
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-12 pt-6 border-t border-zinc-900 text-center text-zinc-600 text-xs">
                    <p>
                        Internal page — admin access only.{' '}
                        <Link href="/kintsugi" className="text-zinc-400 hover:text-white">Back to Kintsugi</Link>
                    </p>
                </footer>
            </div>
        </div>
    );
}
