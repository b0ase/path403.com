'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, User } from 'lucide-react';
import { useState } from 'react';

export default function PersonalHandlesPage() {
    const [searchHandle, setSearchHandle] = useState('');

    const exampleHandles = [
        { handle: 'Craig', color: 'from-blue-600 to-cyan-600' },
        { handle: 'Alice', color: 'from-pink-600 to-purple-600' },
        { handle: 'Bob', color: 'from-green-600 to-emerald-600' },
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
                    PERSONAL HANDLE BUTTONS
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-gray-400 max-w-2xl mb-8"
                >
                    Support individuals directly through their HandCash handle buttons. Each person can have their own custom button.
                </motion.p>

                {/* Search */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-xl"
                >
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search for a handle..."
                            value={searchHandle}
                            onChange={(e) => setSearchHandle(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                        />
                    </div>
                </motion.div>
            </div>

            {/* Example Handles */}
            <div className="max-w-6xl mx-auto px-6 pb-20">
                <h2 className="text-2xl font-bold mb-6">Example Handles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {exampleHandles.map((item, index) => (
                        <motion.div
                            key={item.handle}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link href={`/buttons/handles/${item.handle.toLowerCase()}`}>
                                <div 
                                    className={`group relative overflow-hidden rounded-2xl border border-white/10
                                               bg-gradient-to-br ${item.color} p-8 h-48
                                               hover:scale-[1.02] transition-all duration-300 cursor-pointer
                                               hover:shadow-2xl hover:border-white/20`}
                                >
                                    {/* Icon */}
                                    <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-40 transition-opacity">
                                        <User className="w-20 h-20" />
                                    </div>

                                    {/* Content */}
                                    <div className="relative z-10 h-full flex flex-col justify-end">
                                        <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-1">
                                            ${item.handle}
                                        </h2>
                                        <p className="text-sm text-white/70">
                                            Personal handle button
                                        </p>
                                    </div>

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Info Section */}
                <div className="border border-gray-800 rounded-2xl p-8">
                    <h3 className="text-2xl font-bold mb-4">Create Your Own Button</h3>
                    <p className="text-gray-400 mb-6">
                        Want your own personal handle button? Connect your HandCash account and create a custom button that others can use to support you directly.
                    </p>
                    <Link 
                        href="/user/account"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-100 transition-colors"
                    >
                        <User size={18} />
                        <span>Create My Button</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
