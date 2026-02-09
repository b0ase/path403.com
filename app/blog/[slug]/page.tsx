import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowLeft, FiClock, FiUser } from 'react-icons/fi';
import { blogPosts, getBlogPost } from '@/lib/blog';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { createClient } from '@/lib/supabase/server';
import BlogContent from '@/components/blog/BlogContent';
import BitcoinSpreadsheetsFloat from '@/components/blog/BitcoinSpreadsheetsFloat';
import NinjaPunkGirlsFloat from '@/components/blog/NinjaPunkGirlsFloat';
import BitcoinWriterFloat from '@/components/blog/BitcoinWriterFloat';
import MoneyButtonFloat from '@/components/blog/MoneyButtonFloat';
import FloopFloat from '@/components/blog/FloopFloat';
import TinyCapitalFloat from '@/components/blog/TinyCapitalFloat';
import Blog402Float from '@/components/blog/Blog402Float';
import BitcoinCorpFloat from '@/components/blog/BitcoinCorpFloat';

// Posts that should show the Bitcoin Spreadsheets floating button
const BITCOIN_SPREADSHEETS_POSTS = [
    'why-are-banks-still-gatekeeping-our-accounts',
    'bitcoin-spreadsheets-token-launch',
];

// Posts that should show the Ninja Punk Girls floating button
const NINJA_PUNK_GIRLS_POSTS = [
    'why-are-banks-still-gatekeeping-our-accounts',
];

// Posts that should show the Bitcoin Writer floating button
const BITCOIN_WRITER_POSTS = [
    'introduction-to-bitcoin-writer',
];

// Posts that should show the MoneyButton floating button
const MONEYBUTTON_POSTS = [
    'moneybutton-path-to-10-million',
];

// Posts that should show the FLOOP floating button
const FLOOP_POSTS = [
    'floop-the-browser-that-pays-you-to-think',
];

// Posts that should show the $TINY Capital floating button
const TINY_CAPITAL_POSTS = [
    'tiny-capital-partners',
    'micro-capital-micro-speculation-economy',
    'micro-capital-worlds-smallest-hedge-fund',
];

// Posts that should show the Bitcoin Corporation floating button
const BITCOIN_CORP_POSTS = [
    'bitcoin-corporation-model',
    'bitcoin-corporation-business-model',
    'blueprint-of-the-bitcoin-corporation',
    'anatomy-of-a-bitcoin-empire',
];

// Allow dynamic params for database posts not in static list
export const dynamicParams = true;

// Force dynamic rendering for this page (no static generation)
export const dynamic = 'force-dynamic';

// Note: We don't use generateStaticParams because:
// 1. We're using dynamic rendering (force-dynamic)
// 2. createClient() requires cookies which aren't available at build time
// 3. Database posts can be added at runtime and don't need pre-generation

async function getPostData(slug: string): Promise<{ content: string; data: any } | null> {
    try {
        // Use process.cwd() for reliable path resolution in all environments
        const relativePath = path.join(process.cwd(), 'content', 'blog', `${slug}.md`);

        if (!fs.existsSync(relativePath)) {
            console.log('Blog post file not found:', relativePath);
            return null;
        }

        const fileContent = fs.readFileSync(relativePath, 'utf-8');
        const { content, data } = matter(fileContent);
        return { content, data };
    } catch (e) {
        console.error('Error reading blog post file:', e);
        return null;
    }
}

import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const rawSlug = (await params).slug;
    const decoded = decodeURIComponent(rawSlug);
    const slug = decoded.startsWith('$') ? decoded.slice(1) : decoded;
    const post = getBlogPost(slug);
    const dbPost = await getDbPost(slug);
    const mdPost = await getPostData(slug);

    const title = mdPost?.data?.title || post?.title || dbPost?.title || 'b0ase.com Blog';
    const description = mdPost?.data?.description || post?.description || dbPost?.description || 'Reading on b0ase.com';

    // Use the post's image if available, otherwise fall back to default
    // IMPORTANT: Use www.b0ase.com to avoid redirect issues with WhatsApp/social crawlers
    let imageUrl = 'https://www.b0ase.com/og-fallback.jpg';

    // Check for post image from markdown frontmatter, static posts, or database posts
    const postImage = mdPost?.data?.image || post?.image || dbPost?.image;

    if (postImage) {
        // Handle relative paths by making them absolute
        if (postImage.startsWith('/')) {
            imageUrl = `https://www.b0ase.com${postImage}`;
        } else if (postImage.startsWith('http')) {
            imageUrl = postImage;
        } else {
            imageUrl = `https://www.b0ase.com/${postImage}`;
        }
    }

    return {
        title: `${title} | b0ase.com`,
        description,
        alternates: {
            types: {
                'text/markdown': `https://www.b0ase.com/blog/${slug}.md`,
            },
        },
        openGraph: {
            title,
            description,
            url: `https://www.b0ase.com/blog/${slug}`,
            siteName: 'b0ase.com',
            images: [{
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: title,
            }],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        }
    };
}

async function getDbPost(slug: string) {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('slug', slug)
            .eq('status', 'published')
            .single();

        if (error) {
            // PGRST116 = not found, which is expected for markdown-only posts
            if (error.code !== 'PGRST116') {
                console.error('Error fetching blog post from DB:', error);
            }
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error fetching blog post from DB:', error);
        return null;
    }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const rawSlug = (await params).slug;

    // .md requests should be handled by /blog/[slug].md/route.ts
    // If we reach here with a .md slug, return 404
    if (rawSlug.endsWith('.md')) {
        notFound();
    }

    // Handle $ prefix: /blog/$my-post → strip $ to find the actual post
    // The $ signals tokenization. URL-decode first (%24 = $).
    const decoded = decodeURIComponent(rawSlug);
    const isTokenizedUrl = decoded.startsWith('$');
    const slug = isTokenizedUrl ? decoded.slice(1) : decoded;

    // Try database first
    const dbPost = await getDbPost(slug);

    if (dbPost) {
        // Render database post
        return (
            <div className="min-h-screen text-white">
                <article className="max-w-6xl mx-auto px-4 py-6 md:py-8">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-sm mb-12 transition-colors font-mono"
                    >
                        <FiArrowLeft />
                        Back to Blog
                    </Link>

                    <header className="mb-16">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-8">
                            {dbPost.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 font-mono border-t border-b border-zinc-800 py-4">
                            <div className="flex items-center gap-2">
                                <FiUser className="text-zinc-600" />
                                <span className="text-zinc-300">b0ase</span>
                            </div>
                            <span className="text-zinc-700">|</span>
                            <div className="flex items-center gap-2">
                                <FiClock className="text-zinc-600" />
                                <span>5 min read</span>
                            </div>
                            <span className="text-zinc-700">|</span>
                            <span>{new Date(dbPost.published_at).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}</span>
                            <span className="text-zinc-700">|</span>
                            <div className="flex items-center gap-4 ml-auto">
                                <div className="text-[10px] uppercase tracking-tighter bg-zinc-900 px-2 py-1 border border-zinc-800 text-zinc-400">
                                    TOKEN: {slug}
                                </div>
                                <a
                                    href={`/blog/${slug}.md`}
                                    className="text-[10px] uppercase tracking-tighter bg-zinc-800 px-2 py-1 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    .MD Source
                                </a>
                            </div>
                        </div>

                        {dbPost.tags && (
                            <div className="flex flex-wrap gap-2 mt-6">
                                {dbPost.tags.map((tag: string, i: number) => (
                                    <span
                                        key={i}
                                        className="px-2 py-1 text-[10px] uppercase tracking-wider border border-zinc-800 text-zinc-500 font-mono"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </header>

                    {/* Featured Image */}
                    {dbPost.image && (
                        <div className="relative w-full max-w-6xl mx-auto mb-12 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800">
                            <Image
                                src={dbPost.image}
                                alt={dbPost.title}
                                width={1200}
                                height={675}
                                className="w-full h-auto"
                                priority
                            />
                        </div>
                    )}

                    <BlogContent content={dbPost.content} />

                    <footer className="mt-20 pt-8 border-t border-zinc-800">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                            <Link
                                href="/blog"
                                className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-mono text-sm"
                            >
                                <FiArrowLeft />
                                More Articles
                            </Link>

                            <div className="flex gap-3">
                                {dbPost.title?.includes('Bitcoin Writer') && (
                                    <Link
                                        href="/portfolio/bitcoin-writer?invest=10000"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm uppercase tracking-wider transition-colors rounded-lg"
                                    >
                                        Invest Now
                                    </Link>
                                )}
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold text-sm uppercase tracking-wider hover:bg-zinc-200 transition-colors"
                                >
                                    Get in Touch
                                </Link>
                            </div>
                        </div>
                    </footer>
                </article>
                <Blog402Float slug={slug} />
            </div>
        );
    }

    // Fallback to static posts
    const post = getBlogPost(slug);
    const mdPost = await getPostData(slug);

    if (!post && !mdPost) {
        notFound();
    }

    const content = mdPost?.content;
    const postData = mdPost?.data || post;

    if (!content) {
        notFound();
    }

    return (
        <>
            {/* Float Buttons - Outside all containers */}
            {BITCOIN_WRITER_POSTS.includes(slug) && <BitcoinWriterFloat />}
            {MONEYBUTTON_POSTS.includes(slug) && <MoneyButtonFloat />}
            {FLOOP_POSTS.includes(slug) && <FloopFloat />}
            {TINY_CAPITAL_POSTS.includes(slug) && <TinyCapitalFloat />}
            {BITCOIN_CORP_POSTS.includes(slug) && <BitcoinCorpFloat />}
            <Blog402Float slug={slug} />

            <div className="min-h-screen text-white">
            {/* Centered container */}
            <article className="max-w-6xl mx-auto px-4 py-6 md:py-8">

                {/* Back Link */}
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-sm mb-12 transition-colors font-mono"
                >
                    <FiArrowLeft />
                    Back to Blog
                </Link>

                {/* Header */}
                <header className="mb-16">
                    {postData.featured && (
                        <span className="inline-block px-3 py-1 bg-white text-black text-[10px] uppercase font-bold tracking-wider mb-6 font-mono">
                            Featured
                        </span>
                    )}

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-8">
                        {postData.title}
                    </h1>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 font-mono border-t border-b border-zinc-800 py-4">
                        <div className="flex items-center gap-2">
                            <FiUser className="text-zinc-600" />
                            <span className="text-zinc-300">{postData.author?.name || postData.author}</span>
                        </div>
                        <span className="text-zinc-700">|</span>
                        <div className="flex items-center gap-2">
                            <FiClock className="text-zinc-600" />
                            <span>{postData.readTime || '5 min read'}</span>
                        </div>
                        <span className="text-zinc-700">|</span>
                        <span>{new Date(postData.date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}</span>
                        <span className="text-zinc-700">|</span>
                        <div className="flex items-center gap-4 ml-auto">
                            <div className="text-[10px] uppercase tracking-tighter bg-zinc-900 px-2 py-1 border border-zinc-800 text-zinc-400">
                                TOKEN: {slug}
                            </div>
                            <a
                                href={`/blog/${slug}.md`}
                                className="text-[10px] uppercase tracking-tighter bg-zinc-800 px-2 py-1 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                .MD Source
                            </a>
                        </div>
                    </div>

                    {/* Tags */}
                    {postData.tags && (
                        <div className="flex flex-wrap gap-2 mt-6">
                            {postData.tags.map((tag: string, i: number) => (
                                <span
                                    key={i}
                                    className="px-2 py-1 text-[10px] uppercase tracking-wider border border-zinc-800 text-zinc-500 font-mono"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </header>

                {/* Featured Image */}
                {postData.image && (
                    <div className="relative w-full max-w-6xl mx-auto mb-12 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800">
                        <Image
                            src={postData.image}
                            alt={postData.title}
                            width={1200}
                            height={675}
                            className="w-full h-auto"
                            priority
                        />
                    </div>
                )}

                {/* Article Content */}
                <BlogContent content={content} />

                {/* Floating Buttons for specific posts */}
                {BITCOIN_SPREADSHEETS_POSTS.includes(slug) && <BitcoinSpreadsheetsFloat />}
                {/* NPG float disabled — KYC-restricted token, needs $401 gate */}
                {/* {NINJA_PUNK_GIRLS_POSTS.includes(slug) && <NinjaPunkGirlsFloat />} */}

                {/* Footer */}
                <footer className="mt-20 pt-8 border-t border-zinc-800">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-mono text-sm"
                        >
                            <FiArrowLeft />
                            More Articles
                        </Link>

                        <div className="flex gap-3">
                            {BITCOIN_WRITER_POSTS.includes(slug) && (
                                <Link
                                    href="/portfolio/bitcoin-writer?invest=10000"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm uppercase tracking-wider transition-colors rounded-lg"
                                >
                                    Invest Now
                                </Link>
                            )}
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold text-sm uppercase tracking-wider hover:bg-zinc-200 transition-colors"
                            >
                                Get in Touch
                            </Link>
                        </div>
                    </div>
                </footer>
            </article>
            </div>
        </>
    );
}
