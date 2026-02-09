'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Code, ArrowLeft } from 'lucide-react';

export default function ThemeButtonsPage() {
    const themeButtons = [
        { 
            slug: 'tech', 
            title: 'TECH', 
            description: 'Cyberpunk hacker button with sound effects and animations',
            color: 'from-gray-900 to-black',
            borderColor: 'border-white/30' 
        },
    ];

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="py-16 px-6">
                <Link 
                    href="/buttons"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Portfolio Projects</span>
                </Link>

                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-7xl font-black tracking-tighter mb-4"
                >
                    THEME BUTTONS
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-gray-400 max-w-2xl"
                >
                    Experimental button designs showcasing different themes, aesthetics, and interactions.
                </motion.p>
            </div>

            {/* Theme Buttons Grid */}
            <div className="max-w-6xl mx-auto px-6 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {themeButtons.map((button, index) => (
                        <motion.div
                            key={button.slug}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link href={`/buttons/themes/${button.slug}`}>
                                <div 
                                    className={`group relative overflow-hidden rounded-2xl border ${button.borderColor} 
                                               bg-gradient-to-br ${button.color} p-8 h-64
                                               hover:scale-[1.02] transition-all duration-300 cursor-pointer
                                               hover:shadow-2xl`}
                                >
                                    {/* Icon */}
                                    <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-40 transition-opacity">
                                        <Code className="w-24 h-24" />
                                    </div>

                                    {/* Content */}
                                    <div className="relative z-10 h-full flex flex-col justify-end">
                                        <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-2">
                                            {button.title}
                                        </h2>
                                        <p className="text-sm text-white/70">
                                            {button.description}
                                        </p>
                                    </div>

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Coming Soon */}
                <div className="mt-12 border border-gray-800 rounded-2xl p-8 text-center">
                    <h3 className="text-xl font-bold text-gray-400 mb-2">More themes coming soon...</h3>
                    <p className="text-sm text-gray-600">
                        Experimental button designs and interactive experiences
                    </p>
                </div>
            </div>
        </div>
    );
}
