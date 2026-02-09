'use client';

import React, { useState } from 'react';
import SubscriptionGrid from '@/components/kintsugi/SubscriptionGrid';
import { SubscriptionTier } from '@/lib/subscription-tiers';
import Link from 'next/link';
import { FiArrowLeft, FiInfo } from 'react-icons/fi';

export default function KintsugiSubscribePage() {
    const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);

    const handleSelectTier = (tier: SubscriptionTier) => {
        setSelectedTier(tier);
        // TODO: Initiate payment flow here (e.g. HandCash)
        console.log('Selected tier:', tier);
        alert(`Initiating subscription for ${tier.name} (£${tier.price}/mo)`);
    };

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Back Link */}
                <div className="mb-8">
                    <Link href="/kintsugi" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium">
                        <FiArrowLeft /> Back to Dashboard
                    </Link>
                </div>

                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-5xl md:text-6xl font-bold font-orbitron mb-6 uppercase tracking-tighter">
                        Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-600">Track</span>
                    </h1>
                    <p className="text-xl text-zinc-400 leading-relaxed font-light">
                        Subscribe to the Kintsugi Engine. Receive <span className="text-white font-medium">Liquid Credits</span> monthly.
                        Allocate them to the projects you believe in.
                    </p>
                </div>

                {/* Proportional Equity Explainer */}
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 mb-16 max-w-4xl mx-auto flex items-start gap-4">
                    <div className="bg-blue-500/10 p-3 rounded-full text-blue-400">
                        <FiInfo size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1">How Proportional Equity Works</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Your subscription buys you "Tranche Credits".
                            If you subscribe at the <strong>Founder Tier (£1,000)</strong>, you get 1 Full Tranche (1% Equity) per month.
                            If you subscribe at the <strong>Co-Pilot Tier (£500)</strong>, you get 0.5 Tranches per month (or 1 Full Tranche every 2 months).
                            You can split your allocation across multiple projects or double-down on one.
                        </p>
                    </div>
                </div>

                {/* The Grid */}
                <SubscriptionGrid onSelectTier={handleSelectTier} />
            </div>
        </div>
    );
}
