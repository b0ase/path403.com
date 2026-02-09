'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiBox, FiSearch, FiArrowRight, FiPackage, FiShoppingCart, FiClock } from 'react-icons/fi';
import Link from 'next/link';
import { components } from '@/lib/modules';
import { calculatePricing, formatPrice, formatDeliveryEstimate } from '@/lib/pricing';
import AddToCartButton from '@/components/AddToCartButton';

const categories = ['All', 'Frontend', 'Backend', 'Mobile', 'E-commerce', 'Security', 'AI/ML', 'Blockchain', 'Content', 'Analytics', 'Communication', 'Utility'];

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

export default function ComponentsPage() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredComponents = components.filter(component => {
        const matchesCategory = selectedCategory === 'All' || component.category === selectedCategory;
        const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            component.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

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
                <div className="w-full">
                    {/* Header */}
                    <motion.div
                        className="mb-16 border-b border-zinc-900 pb-8"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                    >
                        <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
                            <div className="bg-zinc-900/50 p-4 md:p-6 border border-zinc-800 self-start">
                                <FiBox className="text-4xl md:text-6xl text-white" />
                            </div>
                            <div className="flex items-end gap-4">
                                <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                                    COMPONENTS
                                </h1>
                                <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                                    PRE_BUILT
                                </div>
                            </div>
                        </div>
                        <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
                            Production-ready components for your next project. Dashboards, payment systems,
                            AI integrations - delivered as clean, maintainable code.
                        </p>
                    </motion.div>

                    {/* Search & Filter */}
                    <div className="mb-12 space-y-6">
                        <div className="relative max-w-2xl">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search components..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 text-white pl-12 pr-4 py-4 focus:outline-none focus:border-white transition-colors placeholder:text-zinc-600"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-2 text-xs uppercase tracking-wider font-bold border transition-all ${selectedCategory === category
                                        ? 'bg-white text-black border-white'
                                        : 'bg-black text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-white'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredComponents.map((component, index) => {
                            const IconComponent = component.icon;
                            return (
                                <motion.div
                                    key={component.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group flex flex-col bg-zinc-950 border border-zinc-900 hover:border-zinc-700 transition-all duration-300"
                                >
                                    <Link href={`/components/${component.id}`} className="flex-grow p-6 hover:no-underline">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-3 bg-zinc-900 border border-zinc-800 group-hover:bg-zinc-800 transition-colors">
                                                <IconComponent className="text-2xl text-zinc-300 group-hover:text-white" />
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-zinc-300 transition-colors">
                                            {component.name}
                                        </h3>
                                        <p className="text-zinc-500 text-sm mb-6 line-clamp-2">
                                            {component.description}
                                        </p>

                                        <div className="space-y-3 mb-6">
                                            {component.features.slice(0, 3).map((feature, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs text-zinc-400">
                                                    <div className="w-1 h-1 bg-zinc-600 rounded-full" />
                                                    {feature}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex flex-wrap gap-2 mt-auto">
                                            {component.tech.slice(0, 3).map((t, i) => (
                                                <span key={i} className="text-[10px] uppercase font-bold text-zinc-600 border border-zinc-800 px-2 py-1">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </Link>

                                    <div className="p-6 border-t border-zinc-900 bg-black">
                                        {(() => {
                                            const basePrice = parsePriceMin(component.price);
                                            const deliveryWeeks = parseDeliveryWeeks(component.estimatedTime);
                                            const pricing = calculatePricing(basePrice, deliveryWeeks);
                                            return (
                                                <>
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
                                                </>
                                            );
                                        })()}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {filteredComponents.length === 0 && (
                        <div className="py-20 text-center border border-dashed border-zinc-900">
                            <p className="text-zinc-500 mb-4">No components found matching your search.</p>
                            <button
                                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                                className="text-white hover:text-zinc-400 underline underline-offset-4"
                            >
                                Clear filters
                            </button>
                        </div>
                    )}

                </div>
            </motion.section>
        </motion.div>
    );
}
