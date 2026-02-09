'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiArrowRight, FiClock, FiCheck, FiShield, FiCpu, FiShoppingCart, FiLayers } from 'react-icons/fi';
import Link from 'next/link';
import { calculatePricing, formatPrice, formatDeliveryEstimate } from '@/lib/pricing';
import AddToCartButton from '@/components/AddToCartButton';

// Component packages data
const componentPackages = [
    {
        id: 'startup-bundle',
        name: 'Startup Bundle',
        tagline: 'Everything you need to launch',
        description: 'Complete foundation for your startup including admin dashboard, authentication, and payment processing.',
        icon: FiPackage,
        color: 'cyan',
        items: ['React Admin Dashboard', 'Authentication System', 'Payment Processing'],
        features: [
            'React Admin Dashboard with Analytics',
            'Secure Authentication with 2FA',
            'Stripe/Crypto Payment Integration',
            'User Management System',
            'Role-based Access Control'
        ],
        basePrice: 1280,
        discountPercentage: 20,
        deliveryWeeks: { min: 4, max: 6 },
        complexity: 'Intermediate' as const,
        isFeatured: true
    },
    {
        id: 'ecommerce-complete',
        name: 'E-commerce Complete',
        tagline: 'Full online store solution',
        description: 'Everything needed to run a professional e-commerce operation from storefront to fulfillment.',
        icon: FiShoppingCart,
        color: 'green',
        items: ['E-commerce Store', 'Payment System', 'Inventory Management', 'Analytics Dashboard'],
        features: [
            'Full E-commerce Storefront',
            'Multi-gateway Payment Processing',
            'Real-time Inventory Tracking',
            'Sales Analytics & Reporting',
            'Customer Management',
            'Order Fulfillment System'
        ],
        basePrice: 2400,
        discountPercentage: 15,
        deliveryWeeks: { min: 6, max: 10 },
        complexity: 'Advanced' as const,
        isFeatured: true
    },
    {
        id: 'ai-suite',
        name: 'AI Suite',
        tagline: 'Intelligent automation package',
        description: 'Comprehensive AI integration including chatbot, custom AI agents, and intelligent analytics.',
        icon: FiCpu,
        color: 'purple',
        items: ['AI Chatbot Integration', 'AI Agent Builder', 'Analytics Dashboard'],
        features: [
            'Custom AI Chatbot',
            'AI Agent Development',
            'Intelligent Analytics',
            'Natural Language Processing',
            'Automated Responses',
            'Learning & Adaptation'
        ],
        basePrice: 2800,
        discountPercentage: 10,
        deliveryWeeks: { min: 5, max: 8 },
        complexity: 'Advanced' as const,
        isFeatured: true
    },
    {
        id: 'enterprise-security',
        name: 'Enterprise Security',
        tagline: 'Bank-grade security suite',
        description: 'Complete security infrastructure for enterprises requiring the highest levels of protection.',
        icon: FiShield,
        color: 'red',
        items: ['Authentication System', 'Two-Factor Auth', 'Encryption Module', 'Audit Logging'],
        features: [
            'Multi-factor Authentication',
            'End-to-end Encryption',
            'Comprehensive Audit Logging',
            'Role-based Access Control',
            'Security Monitoring',
            'Compliance Ready'
        ],
        basePrice: 1800,
        discountPercentage: 15,
        deliveryWeeks: { min: 4, max: 6 },
        complexity: 'Enterprise' as const,
        isFeatured: false
    }
];

const getColorClasses = (color: string) => {
    const colors: Record<string, { border: string; bg: string; text: string }> = {
        cyan: { border: 'border-cyan-500/30', bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
        green: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
        purple: { border: 'border-purple-500/30', bg: 'bg-purple-500/10', text: 'text-purple-400' },
        red: { border: 'border-rose-500/30', bg: 'bg-rose-500/10', text: 'text-rose-400' }
    };
    return colors[color] || colors.cyan;
};

export default function ComponentPackagesPage() {
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
                                <FiLayers className="text-4xl md:text-6xl text-white" />
                            </div>
                            <div className="flex items-end gap-4">
                                <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                                    PACKAGES
                                </h1>
                                <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                                    BUNDLED_SAVINGS
                                </div>
                            </div>
                        </div>
                        <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
                            Pre-configured component bundles with built-in discounts. Get everything you need
                            for your project at a fraction of individual costs.
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
                        {componentPackages.map((pkg, index) => {
                            const IconComponent = pkg.icon;
                            const colorClasses = getColorClasses(pkg.color);
                            const pricing = calculatePricing(pkg.basePrice, pkg.deliveryWeeks);
                            const originalPrice = pkg.basePrice / (1 - pkg.discountPercentage / 100);

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
                                            {pkg.isFeatured && (
                                                <span className="px-2 py-1 bg-white text-black text-[10px] uppercase font-bold tracking-wider">
                                                    Popular
                                                </span>
                                            )}
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
                                        </div>

                                        {/* Pricing */}
                                        <div className="border-t border-zinc-900 pt-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl font-bold text-white">
                                                            {formatPrice(pricing.elevatedPrice)}
                                                        </span>
                                                        <span className="text-sm text-zinc-500 line-through">
                                                            {formatPrice(originalPrice * 1.25)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className={`text-xs font-bold ${colorClasses.text}`}>
                                                            SAVE {pkg.discountPercentage}%
                                                        </span>
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
                                                    href={`/components/packages/${pkg.id}`}
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
                        <h2 className="text-2xl font-bold text-white mb-4">Need a Custom Package?</h2>
                        <p className="text-zinc-400 mb-6 max-w-xl mx-auto">
                            Don't see exactly what you need? We can create a custom bundle tailored
                            to your specific requirements with the same flexible payment terms.
                        </p>
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 text-xs uppercase font-bold tracking-wider hover:bg-zinc-200 transition-colors"
                        >
                            Discuss Your Project
                            <FiArrowRight />
                        </Link>
                    </motion.div>

                    {/* Back Link */}
                    <div className="mt-8">
                        <Link
                            href="/components"
                            className="text-zinc-500 hover:text-white text-sm flex items-center gap-2 transition-colors"
                        >
                            <FiArrowRight className="rotate-180" />
                            Back to Individual Components
                        </Link>
                    </div>
                </div>
            </motion.section>
        </motion.div>
    );
}
