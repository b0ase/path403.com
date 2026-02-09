'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiBox, FiArrowRight, FiCheck, FiClock, FiCode, FiZap, FiShield, FiPackage } from 'react-icons/fi';
import Link from 'next/link';
import { components } from '@/lib/modules';
import { calculatePricing, formatPrice, formatDeliveryEstimate } from '@/lib/pricing';
import AddToCartButton from '@/components/AddToCartButton';

// Parse price string like "£500-800" to get min value
function parsePriceMin(priceStr: string): number {
    const match = priceStr.match(/£([\d,]+)/);
    return match ? parseInt(match[1].replace(',', '')) : 0;
}

// Parse delivery time like "1-2 weeks" to get min/max
function parseDeliveryWeeks(timeStr: string): { min: number; max: number } {
    const match = timeStr.match(/(\d+)-?(\d+)?/);
    if (match) {
        return {
            min: parseInt(match[1]),
            max: match[2] ? parseInt(match[2]) : parseInt(match[1])
        };
    }
    return { min: 2, max: 4 };
}

const valueProps = [
    {
        icon: FiCode,
        title: 'Production Ready',
        description: 'Clean, tested code ready for immediate deployment. No prototypes.'
    },
    {
        icon: FiZap,
        title: 'Fast Delivery',
        description: 'Most components delivered within 1-2 weeks. Complex builds in 3-4.'
    },
    {
        icon: FiShield,
        title: 'Battle Tested',
        description: 'Built on proven tech stacks used by thousands of companies.'
    },
    {
        icon: FiPackage,
        title: 'Full Ownership',
        description: 'You own the code. No subscriptions, no vendor lock-in.'
    }
];

const stats = [
    { value: components.length + '+', label: 'Components' },
    { value: '12', label: 'Categories' },
    { value: '1-4', label: 'Weeks Delivery' },
    { value: '100%', label: 'Code Ownership' }
];

const getComplexityColor = (complexity: string) => {
    switch (complexity) {
        case 'Basic': return 'text-emerald-500';
        case 'Intermediate': return 'text-amber-500';
        case 'Advanced': return 'text-rose-500';
        default: return 'text-zinc-500';
    }
};

export default function ComponentsIndexPage() {
    const featuredComponents = components.slice(0, 6);

    return (
        <motion.div
            className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            {/* Hero Section */}
            <section className="px-4 md:px-8 py-20 md:py-32 border-b border-zinc-900">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs uppercase tracking-widest mb-8">
                            <FiBox className="text-white" />
                            Pre-Built Components
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.9] tracking-tighter mb-6">
                            SHIP FASTER<br />
                            <span className="text-zinc-500">WITH PROVEN CODE</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-12 leading-relaxed">
                            Production-ready components for modern web applications.
                            Dashboards, payment systems, AI integrations — delivered as clean,
                            maintainable code you own forever.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/components"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm uppercase font-bold tracking-wider transition-all hover:opacity-80"
                                style={{ backgroundColor: '#fff', color: '#000' }}
                            >
                                Browse Components
                                <FiArrowRight />
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-zinc-700 text-white text-sm uppercase font-bold tracking-wider hover:border-white transition-colors"
                            >
                                Get Custom Quote
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="px-4 md:px-8 py-12 bg-zinc-950 border-b border-zinc-900">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center"
                            >
                                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-widest">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Value Props */}
            <section className="px-4 md:px-8 py-20 border-b border-zinc-900">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Pre-Built Components?</h2>
                        <p className="text-zinc-400 max-w-2xl mx-auto">
                            Stop reinventing the wheel. Get production-quality code that would take months to build from scratch.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {valueProps.map((prop, index) => (
                            <motion.div
                                key={prop.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6 bg-zinc-950 border border-zinc-900 hover:border-zinc-700 transition-colors"
                            >
                                <div className="p-3 bg-zinc-900 border border-zinc-800 inline-block mb-4">
                                    <prop.icon className="text-2xl text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{prop.title}</h3>
                                <p className="text-sm text-zinc-500">{prop.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Components */}
            <section className="px-4 md:px-8 py-20 border-b border-zinc-900">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col md:flex-row md:items-end justify-between mb-12"
                    >
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Featured Components</h2>
                            <p className="text-zinc-400">Our most popular pre-built solutions</p>
                        </div>
                        <Link
                            href="/components"
                            className="mt-4 md:mt-0 text-sm text-zinc-400 hover:text-white flex items-center gap-2 transition-colors"
                        >
                            View All {components.length} Components
                            <FiArrowRight />
                        </Link>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredComponents.map((component, index) => {
                            const IconComponent = component.icon;
                            const basePrice = parsePriceMin(component.price);
                            const deliveryWeeks = parseDeliveryWeeks(component.estimatedTime);
                            const pricing = calculatePricing(basePrice, deliveryWeeks);

                            return (
                                <motion.div
                                    key={component.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group flex flex-col bg-zinc-950 border border-zinc-900 hover:border-zinc-700 transition-all duration-300"
                                >
                                    <Link href={`/components/${component.id}`} className="flex-grow p-6 hover:no-underline">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-3 bg-zinc-900 border border-zinc-800 group-hover:bg-zinc-800 transition-colors">
                                                <IconComponent className="text-2xl text-zinc-300 group-hover:text-white" />
                                            </div>
                                            <span className={`text-xs uppercase font-bold tracking-wider px-2 py-1 border border-zinc-900 bg-zinc-950 ${getComplexityColor(component.complexity)}`}>
                                                {component.complexity}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-zinc-300 transition-colors">
                                            {component.name}
                                        </h3>
                                        <p className="text-zinc-500 text-sm mb-6 line-clamp-2">
                                            {component.description}
                                        </p>

                                        <div className="space-y-2 mb-6">
                                            {component.features.slice(0, 3).map((feature, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs text-zinc-400">
                                                    <FiCheck className="text-emerald-500 flex-shrink-0" />
                                                    {feature}
                                                </div>
                                            ))}
                                        </div>
                                    </Link>

                                    <div className="p-6 border-t border-zinc-900 bg-black">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-zinc-500 uppercase tracking-widest">From</span>
                                                <span className="text-lg font-bold text-white">{formatPrice(pricing.elevatedPrice)}</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                                                    <FiClock className="text-[10px]" />
                                                    {formatDeliveryEstimate(deliveryWeeks)}
                                                </span>
                                                <span className="text-xs text-emerald-500">
                                                    Deposit: {formatPrice(pricing.deposit)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <AddToCartButton
                                                item={{
                                                    item_type: 'module',
                                                    item_id: component.id,
                                                    item_name: component.name,
                                                    item_description: component.description,
                                                    price: pricing.elevatedPrice,
                                                    quantity: 1
                                                }}
                                                className="flex-1 bg-white text-black hover:bg-zinc-200 px-4 py-2 text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-2"
                                            />
                                            <Link
                                                href={`/components/${component.id}`}
                                                className="border border-zinc-700 text-zinc-300 hover:border-white hover:text-white px-4 py-2 text-xs uppercase font-bold tracking-wider flex items-center gap-2"
                                            >
                                                Details
                                                <FiArrowRight />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="px-4 md:px-8 py-20 bg-zinc-950 border-b border-zinc-900">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
                        <p className="text-zinc-400 max-w-2xl mx-auto">
                            Simple process, fast delivery
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: '01', title: 'Choose Components', desc: 'Browse our catalog and select the components you need for your project.' },
                            { step: '02', title: 'Pay Deposit', desc: 'Pay 30% upfront to start. We begin work immediately after payment.' },
                            { step: '03', title: 'Receive Code', desc: 'Get production-ready code delivered to your repo within the estimated time.' }
                        ].map((item, index) => (
                            <motion.div
                                key={item.step}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="relative"
                            >
                                <div className="text-6xl font-bold text-zinc-900 mb-4">{item.step}</div>
                                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-sm text-zinc-500">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="px-4 md:px-8 py-20">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                            Ready to Ship Faster?
                        </h2>
                        <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
                            Stop building from scratch. Get production-ready components and launch your product in weeks, not months.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/components"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm uppercase font-bold tracking-wider transition-all hover:opacity-80"
                                style={{ backgroundColor: '#fff', color: '#000' }}
                            >
                                Browse All Components
                                <FiArrowRight />
                            </Link>
                            <Link
                                href="/pricing"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-zinc-700 text-white text-sm uppercase font-bold tracking-wider hover:border-white transition-colors"
                            >
                                View Pricing
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </motion.div>
    );
}
