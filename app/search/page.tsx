'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiSearch, FiArrowRight, FiFolder, FiFileText, FiTool, FiBook, FiUsers } from 'react-icons/fi';
import { portfolioData } from '@/lib/data';
import { blogPosts } from '@/lib/blog';

// Define searchable content types
interface SearchResult {
  id: string;
  type: 'project' | 'blog' | 'tool' | 'page' | 'service';
  title: string;
  description: string;
  url: string;
  image?: string;
  tags?: string[];
}

// Static pages to include in search
const staticPages: SearchResult[] = [
  { id: 'home', type: 'page', title: 'Home', description: 'b0ase Full Service Digital Agency - Design meets blockchain innovation', url: '/' },
  { id: 'cv', type: 'page', title: 'CV / Resume', description: 'Professional CV and resume - Full-stack developer, blockchain specialist, AI engineer', url: '/cv', tags: ['cv', 'resume', 'hire', 'experience', 'skills', 'work history'] },
  { id: 'portfolio', type: 'page', title: 'Portfolio', description: 'View our projects and case studies', url: '/portfolio' },
  { id: 'blog', type: 'page', title: 'Blog', description: 'Articles, tutorials, and insights', url: '/blog' },
  { id: 'contact', type: 'page', title: 'Contact', description: 'Get in touch with our team', url: '/contact' },
  { id: 'about', type: 'page', title: 'About', description: 'Learn about b0ase and our mission', url: '/about' },
  { id: 'services', type: 'page', title: 'Services', description: 'Our full range of digital services', url: '/services' },
  { id: 'kintsugi', type: 'page', title: 'Kintsugi Engine', description: 'Your startup in a box - £999 to start, 100% equity', url: '/kintsugi' },
  { id: 'exchange', type: 'page', title: 'Token Exchange', description: 'Trade b0ase ecosystem tokens', url: '/exchange' },
  { id: 'moneybuttons', type: 'page', title: 'MoneyButtons', description: 'Interactive MoneyButtons showcase', url: '/moneybuttons' },
  { id: 'courses', type: 'page', title: 'Courses', description: 'Learn blockchain, AI, and web development', url: '/courses' },
  { id: 'tools', type: 'page', title: 'Tools', description: 'Free tools and utilities', url: '/tools' },
  { id: 'agents', type: 'page', title: 'AI Agents', description: 'Autonomous AI agents marketplace', url: '/agents' },
  { id: 'developers', type: 'page', title: 'Developers', description: 'Hire developers and agents', url: '/developers' },
  { id: 'careers', type: 'page', title: 'Careers', description: 'Join our team - job opportunities at b0ase', url: '/careers', tags: ['jobs', 'hiring', 'work', 'employment'] },
  { id: 'pricing', type: 'page', title: 'Pricing', description: 'Our pricing and packages', url: '/pricing' },
  { id: 'login', type: 'page', title: 'Login', description: 'Sign in to your account', url: '/login' },
  { id: 'dashboard', type: 'page', title: 'Dashboard', description: 'User dashboard and account management', url: '/user/account' },
];

// Tools to include in search
const tools: SearchResult[] = [
  { id: 'scrollpay', type: 'tool', title: 'ScrollPay', description: 'Monetize content with scroll-based micropayments', url: '/tools/scrollpay' },
  { id: 'video-course-maker', type: 'tool', title: 'Video Course Maker', description: 'Automate video course production', url: '/tools/video-course-maker' },
  { id: 'crowdfunding', type: 'tool', title: 'Crowdfunding', description: 'Launch your crowdfunding campaign', url: '/tools/crowdfunding' },
  { id: 'scripts', type: 'tool', title: 'Scripts Generator', description: 'Generate scripts for videos and courses', url: '/tools/scripts' },
  { id: 'button-graphic-creator', type: 'tool', title: 'Button Graphic Creator', description: 'Create custom button graphics', url: '/tools/button-graphic-creator' },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);

  // Build searchable index
  const searchIndex = useMemo(() => {
    const results: SearchResult[] = [...staticPages, ...tools];

    // Add portfolio projects
    portfolioData.projects.forEach(project => {
      results.push({
        id: `project-${project.slug}`,
        type: 'project',
        title: project.title,
        description: project.description,
        url: `/portfolio/${project.slug}`,
        image: project.cardImageUrls?.[0],
        tags: project.tech,
      });
    });

    // Add blog posts
    blogPosts.forEach(post => {
      results.push({
        id: `blog-${post.slug}`,
        type: 'blog',
        title: post.title,
        description: post.excerpt || post.description,
        url: `/blog/${post.slug}`,
        image: post.image,
        tags: post.tags,
      });
    });

    return results;
  }, []);

  // Search function
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const searchTerms = query.toLowerCase().split(' ').filter(Boolean);

    return searchIndex
      .map(item => {
        const titleLower = item.title.toLowerCase();
        const descLower = item.description.toLowerCase();
        const tagsLower = item.tags?.join(' ').toLowerCase() || '';
        const allText = `${titleLower} ${descLower} ${tagsLower}`;

        // Calculate relevance score
        let score = 0;
        searchTerms.forEach(term => {
          if (titleLower.includes(term)) score += 10;
          if (titleLower.startsWith(term)) score += 5;
          if (descLower.includes(term)) score += 3;
          if (tagsLower.includes(term)) score += 2;
        });

        return { ...item, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  }, [query, searchIndex]);

  // Update URL when query changes
  useEffect(() => {
    if (query !== initialQuery) {
      const url = query ? `/search?q=${encodeURIComponent(query)}` : '/search';
      window.history.replaceState({}, '', url);
    }
  }, [query, initialQuery]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project': return <FiFolder className="w-4 h-4" />;
      case 'blog': return <FiFileText className="w-4 h-4" />;
      case 'tool': return <FiTool className="w-4 h-4" />;
      case 'service': return <FiUsers className="w-4 h-4" />;
      default: return <FiBook className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'blog': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'tool': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'service': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="pt-32 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Search</h1>

          {/* Search Input */}
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects, blog posts, tools..."
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-lg outline-none focus:border-white/30 transition-colors"
              autoFocus
            />
          </div>

          {/* Results count */}
          {query && (
            <p className="mt-4 text-white/50 text-sm">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{query}"
            </p>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="px-4 pb-20">
        <div className="max-w-3xl mx-auto">
          {!query ? (
            <div className="text-center py-12">
              <FiSearch className="w-12 h-12 mx-auto mb-4 text-white/20" />
              <p className="text-white/40">Start typing to search across the site</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/40 mb-4">No results found for "{query}"</p>
              <p className="text-white/30 text-sm">Try different keywords or browse our pages</p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Link
                    href={result.url}
                    className="block p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all group"
                  >
                    <div className="flex gap-4">
                      {/* Image */}
                      {result.image && (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                          <Image
                            src={result.image}
                            alt={result.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium uppercase border ${getTypeColor(result.type)}`}>
                            {getTypeIcon(result.type)}
                            {result.type}
                          </span>
                        </div>
                        <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                          {result.title}
                        </h3>
                        <p className="text-sm text-white/50 line-clamp-2 mt-1">
                          {result.description}
                        </p>
                        {result.tags && result.tags.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {result.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded text-white/40">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className="flex items-center">
                        <FiArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {/* Quick Links */}
          {!query && (
            <div className="mt-8">
              <h2 className="text-sm font-medium text-white/50 mb-4">Popular Pages</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {staticPages.slice(0, 9).map(page => (
                  <Link
                    key={page.id}
                    href={page.url}
                    className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-sm"
                  >
                    {page.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
