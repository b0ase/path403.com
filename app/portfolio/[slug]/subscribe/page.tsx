'use client';

import React, { useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import SubscriptionGrid from '@/components/kintsugi/SubscriptionGrid';
import { SubscriptionTier } from '@/lib/subscription-tiers';
import { portfolioData } from '@/lib/data';
import Link from 'next/link';
import { FiArrowLeft, FiTarget, FiZap, FiActivity } from 'react-icons/fi';
import Image from 'next/image';

export default function ProjectSubscribePage() {
    const params = useParams();
    const slug = typeof params.slug === 'string' ? params.slug : '';
    const project = portfolioData.projects.find((p) => p.slug === slug);
    const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);

    if (!project) {
        return notFound();
    }

    const handleSelectTier = (tier: SubscriptionTier) => {
        setSelectedTier(tier);
        // TODO: Initiate payment flow here (e.g. HandCash) with Project context
        console.log(`Subscribing to ${project.title} at tier:`, tier);
        alert(`Initiating subscription for ${project.title} - ${tier.name} (£${tier.price}/mo)`);
    };

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20 px-4">
            {/* Background Glow */}
            <div
                className="fixed top-0 left-0 right-0 h-[500px] pointer-events-none opacity-20"
                style={{
                    background: `radial-gradient(circle at 50% 0%, ${project.themeConfig?.primary || 'purple'} 0%, transparent 70%)`
                }}
            />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Back Link */}
                <div className="mb-8 flex justify-between items-center">
                    <Link href={`/websites/${slug}`} className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium">
                        <FiArrowLeft /> Back to Project
                    </Link>
                    <div className="text-zinc-500 text-xs uppercase tracking-widest font-mono">
                        Kintsugi Engine
                    </div>
                </div>

                {/* Project Header */}
                <div className="text-center max-w-4xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-400">
                        <span className={`w-2 h-2 rounded-full bg-${project.themeConfig?.primary || 'purple'}-500 animate-pulse`} />
                        Funding Active
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold font-orbitron mb-6 uppercase tracking-tighter">
                        Fund <span className={`text-transparent bg-clip-text bg-gradient-to-r from-${project.themeConfig?.primary || 'purple'}-400 to-${project.themeConfig?.secondary || 'blue'}-600`}>
                            {project.title}
                        </span>
                    </h1>

                    <p className="text-xl text-zinc-300 leading-relaxed font-light mb-8">
                        Become a stakeholder in {project.description}
                    </p>

                    <div className="flex flex-wrap justify-center gap-6 text-sm text-zinc-400">
                        <div className="flex items-center gap-2">
                            <FiTarget className="text-blue-400" />
                            <span>Next Tranche: £10,000</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FiActivity className="text-green-400" />
                            <span>Valuation: £{project.price?.toLocaleString() || '100,000'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FiZap className="text-yellow-400" />
                            <span>Status: {project.status}</span>
                        </div>
                    </div>
                </div>

                {/* The Grid */}
                <SubscriptionGrid onSelectTier={handleSelectTier} />
            </div>
        </div>
    );
}
