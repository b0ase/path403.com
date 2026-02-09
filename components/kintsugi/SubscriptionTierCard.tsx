'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiArrowRight } from 'react-icons/fi';
import { SubscriptionTier } from '@/lib/subscription-tiers';

interface SubscriptionTierCardProps {
    tier: SubscriptionTier;
    onSelect: (tier: SubscriptionTier) => void;
    index: number;
}

const colorMap: Record<string, string> = {
    purple: 'border-purple-500/30 hover:border-purple-500 text-purple-400',
    blue: 'border-blue-500/30 hover:border-blue-500 text-blue-400',
    green: 'border-green-500/30 hover:border-green-500 text-green-400',
    yellow: 'border-yellow-500/30 hover:border-yellow-500 text-yellow-400',
    pink: 'border-pink-500/30 hover:border-pink-500 text-pink-400',
    zinc: 'border-zinc-500/30 hover:border-zinc-500 text-zinc-400',
};

const bgMap: Record<string, string> = {
    purple: 'bg-purple-500/10 hover:bg-purple-500/20',
    blue: 'bg-blue-500/10 hover:bg-blue-500/20',
    green: 'bg-green-500/10 hover:bg-green-500/20',
    yellow: 'bg-yellow-500/10 hover:bg-yellow-500/20',
    pink: 'bg-pink-500/10 hover:bg-pink-500/20',
    zinc: 'bg-zinc-500/10 hover:bg-zinc-500/20',
};

export default function SubscriptionTierCard({ tier, onSelect, index }: SubscriptionTierCardProps) {
    const colorClass = colorMap[tier.color] || colorMap['zinc'];
    const bgClass = bgMap[tier.color] || bgMap['zinc'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative group flex flex-col h-full rounded-2xl border bg-black/40 backdrop-blur-sm transition-all duration-300 ${colorClass}`}
        >
            {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-purple-900/40">
                    Most Popular
                </div>
            )}

            <div className="p-6 md:p-8 flex-grow flex flex-col">
                <div className="mb-4">
                    <span className={`text-xs font-bold uppercase tracking-widest opacity-80 ${tier.color === 'purple' ? 'text-purple-400' : 'text-zinc-500'}`}>
                        {tier.label}
                    </span>
                    <h3 className="text-2xl font-bold text-white mt-1">{tier.name}</h3>
                </div>

                <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white">£{tier.price}</span>
                        <span className="text-zinc-500 font-medium">/mo</span>
                    </div>
                    <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
                        {tier.description}
                    </p>
                </div>

                <div className="flex-grow space-y-3 mb-8">
                    {tier.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm">
                            <FiCheck className={`mt-0.5 flex-shrink-0 ${tier.color === 'purple' ? 'text-purple-400' : 'text-zinc-500'}`} />
                            <span className="text-zinc-300">{benefit}</span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => onSelect(tier)}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${bgClass} ${colorClass.split(' ')[2]} border border-transparent hover:border-current`}
                >
                    Subscribe <FiArrowRight />
                </button>
            </div>
        </motion.div>
    );
}
