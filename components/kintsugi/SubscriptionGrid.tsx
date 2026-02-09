'use client';

import React from 'react';
import SubscriptionTierCard from './SubscriptionTierCard';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '@/lib/subscription-tiers';

interface SubscriptionGridProps {
    onSelectTier: (tier: SubscriptionTier) => void;
}

export default function SubscriptionGrid({ onSelectTier }: SubscriptionGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {SUBSCRIPTION_TIERS.map((tier, index) => (
                <SubscriptionTierCard
                    key={tier.id}
                    tier={tier}
                    index={index}
                    onSelect={onSelectTier}
                />
            ))}
        </div>
    );
}
