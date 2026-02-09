'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiBookOpen, FiArrowRight, FiClock, FiUser, FiTag } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { blogPosts, BlogPost } from '@/lib/blog';

export default function BlogPage() {
    const router = useRouter();
    const [allPosts, setAllPosts] = useState<BlogPost[]>(blogPosts);
    const [tokenizedSlugs, setTokenizedSlugs] = useState<Set<string>>(new Set());

    useEffect(() => {
        async function loadDbPosts() {
            try {
                const res = await fetch('/api/blog/list');
                if (res.ok) {
                    const { posts } = await res.json();
                    // Merge static posts with DB posts, removing duplicates
                    const combined = [...posts, ...blogPosts];
                    const unique = combined.filter((post, index, self) =>
                        index === self.findIndex((p) => p.slug === post.slug)
                    );
                    // Sort by date descending
                    unique.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    setAllPosts(unique);
                }
            } catch (error) {
                console.error('Error loading DB posts:', error);
            }
        }
        async function loadTokenizedSlugs() {
            try {
                const res = await fetch('/api/path402/blog/tokenized');
                if (res.ok) {
                    const { slugs } = await res.json();
                    setTokenizedSlugs(new Set(slugs));
                }
            } catch {
                // Non-critical — tokenized badge won't show
            }
        }
        loadDbPosts();
        loadTokenizedSlugs();
    }, []);
    return (
        <motion.div
            className="min-h-screen text-white font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <div className="w-full">
                {/* Header */}
                <motion.div
                    className="px-4 md:px-8 py-6 md:py-8 mb-8 border-b border-zinc-900"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
                        <div className="bg-zinc-900/50 p-4 md:p-6 border border-zinc-800 self-start">
                            <FiBookOpen className="text-4xl md:text-6xl text-white" />
                        </div>
                        <div className="flex items-end gap-4">
                            <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                                BLOG
                            </h1>
                            <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                                INSIGHTS
                            </div>
                        </div>
                    </div>
                    <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
                        Tokens, equity, AI agents, and building production-ready systems.
                        How to ship faster and own more of what you build.
                    </p>
                </motion.div>

                {/* Blog Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-8">
                    {allPosts.map((post, index) => (
                        <motion.article
                            key={post.slug}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                            className="group border border-zinc-800 bg-zinc-950 hover:border-zinc-700 transition-all overflow-hidden max-w-sm mx-auto w-full"
                        >
                            <div className="relative h-full flex flex-col">
                                <Link href={tokenizedSlugs.has(post.slug) ? `/blog/$${post.slug}` : `/blog/${post.slug}`} className="block flex-1">
                                    {/* Blog Post Image */}
                                    {post.image && (
                                        <div className="relative w-full h-32 md:h-40 overflow-hidden bg-zinc-900 p-2">
                                            <div className="relative w-full h-full overflow-hidden rounded-lg border border-zinc-800">
                                                <Image
                                                    src={post.image}
                                                    alt={post.title}
                                                    fill
                                                    className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-4 md:p-5">
                                        <div className="flex flex-col gap-2 mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    {post.featured && (
                                                        <span className="inline-block px-1.5 py-0.5 bg-white text-black text-[8px] uppercase font-bold tracking-wider">
                                                            Featured
                                                        </span>
                                                    )}
                                                    <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-tighter bg-zinc-900 px-1.5 py-0.5 border border-zinc-800">
                                                        TOKEN: {post.slug}
                                                    </div>
                                                </div>
                                                <h2 className="text-lg md:text-xl font-bold text-white group-hover:text-zinc-300 transition-colors line-clamp-2">
                                                    {post.title}
                                                </h2>
                                                <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2 mt-1">
                                                    {post.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>

                                {/* Meta Info - Outside main Link */}
                                <div className="px-4 md:px-5 pb-4 md:pb-5 mt-auto">
                                    <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] text-zinc-600">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 font-mono uppercase tracking-tighter">
                                                <FiUser className="text-zinc-700" />
                                                <span>{post.author.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <FiClock className="text-zinc-700" />
                                                <span>{post.readTime}</span>
                                            </div>
                                        </div>
                                        <a
                                            href={`/blog/${post.slug}.md`}
                                            className="text-zinc-500 hover:text-blue-400 font-mono text-[8px] uppercase tracking-tighter bg-zinc-900 px-1 border border-zinc-800 relative z-10"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            .MD
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>

                {/* Empty State */}
                {blogPosts.length === 0 && (
                    <div className="text-center py-20 border border-dashed border-zinc-800">
                        <FiBookOpen className="text-4xl text-zinc-600 mx-auto mb-4" />
                        <p className="text-zinc-500">No blog posts yet. Check back soon.</p>
                    </div>
                )}

                {/* Back to Home */}
                <div className="mt-12 px-4 md:px-8 pb-16">
                    <Link
                        href="/"
                        className="text-zinc-500 hover:text-white text-sm flex items-center gap-2 transition-colors"
                    >
                        <FiArrowRight className="rotate-180" />
                        Back to Home
                    </Link>
                </div>
            </div>
        </motion.div >
    );
}
