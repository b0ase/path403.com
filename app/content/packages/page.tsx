'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiEdit3, FiArrowRight, FiClock, FiCheck, FiStar, FiLayers, FiRefreshCw } from 'react-icons/fi';
import Link from 'next/link';
import { calculatePricing, formatPrice, formatDeliveryEstimate } from '@/lib/pricing';
import AddToCartButton from '@/components/AddToCartButton';

// Content packages data
const contentPackages = [
    {
        id: 'content-starter',
        name: 'Content Starter',
        tagline: 'Kickstart your content',
        description: 'Perfect for businesses just starting their content journey. Includes blog posts and social media content.',
        icon: FiEdit3,
        color: 'blue',
        items: ['Blog Articles', 'Social Media Content'],
        features: [
            '10 SEO-optimized Blog Posts',
            '20 Social Media Posts',
            'Content Calendar',
            'Hashtag Research',
            'Basic Analytics Report'
        ],
        basePrice: 640,
        discountPercentage: 20,
        deliveryWeeks: { min: 2, max: 3 },
        complexity: 'Basic' as const,
        isFeatured: true
    },
    {
        id: 'brand-launch',
        name: 'Brand Launch',
        tagline: 'Complete brand content kit',
        description: 'Everything you need to launch your brand online with professional copy and content.',
        icon: FiStar,
        color: 'orange',
        items: ['Website Copy', 'Blog Articles', 'Email Campaigns'],
        features: [
            'Full Website Copy (5 pages)',
            '5 Blog Articles',
            'Email Welcome Sequence',
            'Social Media Bios',
            'Brand Voice Guide'
        ],
        basePrice: 960,
        discountPercentage: 20,
        deliveryWeeks: { min: 2, max: 4 },
        complexity: 'Intermediate' as const,
        isFeatured: true
    },
    {
        id: 'full-content-suite',
        name: 'Full Content Suite',
        tagline: 'Complete content solution',
        description: 'Comprehensive content package covering all channels and formats for established businesses.',
        icon: FiLayers,
        color: 'pink',
        items: ['Website Copy', 'Blog Articles', 'Email Campaigns', 'Social Media Content', 'Video Scripts'],
        features: [
            'Full Website Copy',
            '15 Blog Articles',
            'Email Marketing Campaigns',
            'Social Media Content (30 posts)',
            'Video Scripts (5)',
            'Infographics (3)',
            'Monthly Content Strategy'
        ],
        basePrice: 2400,
        discountPercentage: 15,
        deliveryWeeks: { min: 4, max: 6 },
        complexity: 'Advanced' as const,
        isFeatured: true
    },
    {
        id: 'monthly-retainer',
        name: 'Monthly Retainer',
        tagline: 'Ongoing content partnership',
        description: 'Consistent, high-quality content delivered monthly to keep your brand active and engaging.',
        icon: FiRefreshCw,
        color: 'cyan',
        items: ['Blog Articles', 'Social Media Content', 'Email Campaigns'],
        features: [
            '4 Blog Articles/month',
            '20 Social Posts/month',
            '2 Email Campaigns/month',
            'Content Strategy Updates',
            'Performance Reports',
            'Priority Support'
        ],
        basePrice: 1200,
        discountPercentage: 0,
        deliveryWeeks: { min: 1, max: 1 },
        complexity: 'Intermediate' as const,
        isFeatured: false,
        isRecurring: true
    }
];

const getColorClasses = (color: string) => {
    const colors: Record<string, { border: string; bg: string; text: string }> = {
        blue: { border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-400' },
        orange: { border: 'border-orange-500/30', bg: 'bg-orange-500/10', text: 'text-orange-400' },
        pink: { border: 'border-pink-500/30', bg: 'bg-pink-500/10', text: 'text-pink-400' },
        cyan: { border: 'border-cyan-500/30', bg: 'bg-cyan-500/10', text: 'text-cyan-400' }
    };
    return colors[color] || colors.cyan;
};

export default function ContentPackagesPage() {
    return (
        <motion.div
            className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <motion.section
                className="px-4 md:px-8 py-16 relative z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
            >
                <div className="w-full max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.div
                        className="mb-16 border-b border-zinc-900 pb-8"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                    >
                        <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
                            <div className="bg-zinc-900/50 p-4 md:p-6 border border-zinc-800 self-start">
                                <FiEdit3 className="text-4xl md:text-6xl text-white" />
                            </div>
                            <div className="flex items-end gap-4">
                                <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                                    CONTENT PACKAGES
                                </h1>
                                <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                                    BUNDLED_CONTENT
                                </div>
                            </div>
                        </div>
                        <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
                            Pre-packaged content solutions with built-in discounts. Professional writing
                            and content strategy delivered on schedule.
                        </p>

                        {/* Payment Structure Info */}
                        <div className="mt-8 p-4 border border-zinc-800 bg-zinc-950/50 max-w-xl">
                            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Payment Structure</div>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                    <span className="text-zinc-300">1/3 Deposit</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                    <span className="text-zinc-300">1/3 On Delivery</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                    <span className="text-zinc-300">1/3 Within 30 Days</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Packages Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {contentPackages.map((pkg, index) => {
                            const IconComponent = pkg.icon;
                            const colorClasses = getColorClasses(pkg.color);
                            const pricing = calculatePricing(pkg.basePrice, pkg.deliveryWeeks);
                            const originalPrice = pkg.discountPercentage > 0
                                ? pkg.basePrice / (1 - pkg.discountPercentage / 100)
                                : pkg.basePrice;

                            return (
                                <motion.div
                                    key={pkg.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`group bg-zinc-950 border ${colorClasses.border} hover:border-zinc-600 transition-all duration-300`}
                                >
                                    {/* Header */}
                                    <div className={`p-6 border-b border-zinc-900 ${colorClasses.bg}`}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 border ${colorClasses.border} bg-black`}>
                                                    <IconComponent className={`text-2xl ${colorClasses.text}`} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                                                    <p className={`text-sm ${colorClasses.text}`}>{pkg.tagline}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                {pkg.isFeatured && (
                                                    <span className="px-2 py-1 bg-white text-black text-[10px] uppercase font-bold tracking-wider">
                                                        Popular
                                                    </span>
                                                )}
                                                {'isRecurring' in pkg && pkg.isRecurring && (
                                                    <span className="px-2 py-1 border border-zinc-600 text-zinc-400 text-[10px] uppercase font-bold tracking-wider">
                                                        Monthly
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <p className="text-zinc-400 text-sm mb-6">{pkg.description}</p>

                                        {/* Included Items */}
                                        <div className="mb-6">
                                            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Includes</div>
                                            <div className="flex flex-wrap gap-2">
                                                {pkg.items.map((item, i) => (
                                                    <span
                                                        key={i}
                                                        className="text-xs text-zinc-300 border border-zinc-800 px-2 py-1 bg-zinc-900/50"
                                                    >
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Features */}
                                        <div className="space-y-2 mb-6">
                                            {pkg.features.slice(0, 5).map((feature, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                                                    <FiCheck className={`text-xs ${colorClasses.text}`} />
                                                    {feature}
                                                </div>
                                            ))}
                                            {pkg.features.length > 5 && (
                                                <div className="text-xs text-zinc-500">
                                                    +{pkg.features.length - 5} more features
                                                </div>
                                            )}
                                        </div>

                                        {/* Pricing */}
                                        <div className="border-t border-zinc-900 pt-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl font-bold text-white">
                                                            {formatPrice(pricing.elevatedPrice)}
                                                        </span>
                                                        {'isRecurring' in pkg && pkg.isRecurring && (
                                                            <span className="text-sm text-zinc-500">/month</span>
                                                        )}
                                                        {pkg.discountPercentage > 0 && (
                                                            <span className="text-sm text-zinc-500 line-through">
                                                                {formatPrice(originalPrice * 1.25)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        {pkg.discountPercentage > 0 && (
                                                            <span className={`text-xs font-bold ${colorClasses.text}`}>
                                                                SAVE {pkg.discountPercentage}%
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                                                            <FiClock className="text-[10px]" />
                                                            {formatDeliveryEstimate(pkg.deliveryWeeks)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs text-zinc-500 uppercase tracking-widest">Deposit</div>
                                                    <div className="text-lg font-bold text-emerald-400">
                                                        {formatPrice(pricing.deposit)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Payment Schedule Preview */}
                                            <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-zinc-900/30 border border-zinc-800">
                                                <div className="text-center">
                                                    <div className="text-[10px] text-zinc-500 uppercase">Now</div>
                                                    <div className="text-xs font-bold text-emerald-400">{formatPrice(pricing.deposit)}</div>
                                                </div>
                                                <div className="text-center border-x border-zinc-800">
                                                    <div className="text-[10px] text-zinc-500 uppercase">Delivery</div>
                                                    <div className="text-xs font-bold text-blue-400">{formatPrice(pricing.deliveryPayment)}</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-[10px] text-zinc-500 uppercase">+30 Days</div>
                                                    <div className="text-xs font-bold text-purple-400">{formatPrice(pricing.finalPayment)}</div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <AddToCartButton
                                                    item={{
                                                        item_type: 'package',
                                                        item_id: pkg.id,
                                                        item_name: pkg.name,
                                                        item_description: pkg.description,
                                                        price: pricing.elevatedPrice,
                                                        quantity: 1
                                                    }}
                                                    className="flex-1 bg-white text-black hover:bg-zinc-200 px-4 py-3 text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-2"
                                                />
                                                <Link
                                                    href={`/content/packages/${pkg.id}`}
                                                    className="border border-zinc-700 text-zinc-300 hover:border-white hover:text-white px-4 py-3 text-xs uppercase font-bold tracking-wider flex items-center gap-2"
                                                >
                                                    Details
                                                    <FiArrowRight />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Bottom CTA */}
                    <motion.div
                        className="mt-16 p-8 border border-zinc-800 bg-zinc-950/50 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <h2 className="text-2xl font-bold text-white mb-4">Need Custom Content?</h2>
                        <p className="text-zinc-400 mb-6 max-w-xl mx-auto">
                            Looking for a specific content mix? We can create a tailored package
                            for your unique requirements with the same flexible payment structure.
                        </p>
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 text-xs uppercase font-bold tracking-wider hover:bg-zinc-200 transition-colors"
                        >
                            Discuss Your Content Needs
                            <FiArrowRight />
                        </Link>
                    </motion.div>

                    {/* Back Link */}
                    <div className="mt-8">
                        <Link
                            href="/content"
                            className="text-zinc-500 hover:text-white text-sm flex items-center gap-2 transition-colors"
                        >
                            <FiArrowRight className="rotate-180" />
                            Back to Content Services
                        </Link>
                    </div>
                </div>
            </motion.section>
        </motion.div>
    );
}
