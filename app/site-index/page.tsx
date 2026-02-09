'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FaBook, FaCoins, FaUser, FaSearch, FaRobot, FaArrowRight, FaExchangeAlt, FaFileAlt, FaCode } from 'react-icons/fa';

interface PageLink {
  path: string;
  title: string;
  description: string;
}

interface PageCategory {
  name: string;
  description: string;
  icon: typeof FaBook;
  pages: PageLink[];
}

const PAGE_CATEGORIES: PageCategory[] = [
  {
    name: 'Main',
    description: 'Core pages and documentation',
    icon: FaBook,
    pages: [
      { path: '/', title: 'Home', description: 'The $402 Protocol - tokenize any URL path' },
      { path: '/blog', title: 'Blog', description: 'Protocol insights and attention economy essays' },
      { path: '/whitepaper', title: 'Whitepaper', description: 'Technical specification and economics' },
      { path: '/whitepaper/academic', title: 'Academic Paper', description: 'Formal academic specification' },
      { path: '/docs', title: 'Documentation', description: 'Integration guides and API reference' },
      { path: '/docs/domain-verification', title: 'Domain Verification', description: '3-proof verification guide' },
    ],
  },
  {
    name: 'Token & Exchange',
    description: '$402 token and trading',
    icon: FaCoins,
    pages: [
      { path: '/token', title: '$402 Token', description: 'Token details, pricing, and stats' },
      { path: '/exchange', title: 'Exchange', description: 'Buy and trade $402 tokens' },
      { path: '/registry', title: 'Registry', description: 'Global registry of $402 domains' },
      { path: '/402', title: '402 Page', description: 'HTTP 402 Payment Required demo' },
    ],
  },
  {
    name: 'Account',
    description: 'User account and holdings',
    icon: FaUser,
    pages: [
      { path: '/account', title: 'Account', description: 'Your wallet and settings' },
    ],
  },
  {
    name: 'For AI Agents',
    description: 'Machine-readable endpoints',
    icon: FaRobot,
    pages: [
      { path: '/llms.txt', title: 'llms.txt', description: 'AI-readable protocol documentation' },
      { path: '/.well-known/ai-plugin.json', title: 'AI Plugin', description: 'AI plugin manifest for agents' },
      { path: '/.well-known/$402.json', title: '$402 Manifest', description: 'Protocol discovery manifest' },
      { path: '/.well-known/x402.json', title: 'x402 Manifest', description: 'Extended protocol manifest' },
      { path: '/sitemap.xml', title: 'Sitemap', description: 'XML sitemap for crawlers' },
      { path: '/robots.txt', title: 'robots.txt', description: 'Crawler instructions' },
    ],
  },
  {
    name: 'API Endpoints',
    description: 'Developer API',
    icon: FaCode,
    pages: [
      { path: '/api/token/price', title: 'Price API', description: 'GET - Current token pricing' },
      { path: '/api/token/stats', title: 'Stats API', description: 'GET - Token statistics' },
      { path: '/api/tokens', title: 'Tokens API', description: 'GET - List all tokens' },
      { path: '/api/tokens/holdings', title: 'Holdings API', description: 'GET - User holdings' },
      { path: '/api/x402/verify', title: 'Verify API', description: 'POST - Verify $402 proof' },
      { path: '/api/domain/verify', title: 'Domain Verify', description: 'POST - Verify domain ownership' },
      { path: '/api/stake', title: 'Stake API', description: 'POST - Stake tokens' },
      { path: '/api/dividends/pending', title: 'Dividends API', description: 'GET - Pending dividends' },
    ],
  },
];

export default function SiteIndexPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Main');

  const filteredCategories = PAGE_CATEGORIES.map(category => ({
    ...category,
    pages: category.pages.filter(page =>
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.path.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.pages.length > 0);

  const totalPages = PAGE_CATEGORIES.reduce((acc, cat) => acc + cat.pages.length, 0);

  return (
    <div className="min-h-screen bg-black text-white pt-14">
      <div className="px-4 md:px-8 py-16">
        {/* Header */}
        <div className="mb-12 border-b border-zinc-800 pb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl font-bold text-emerald-500">$</span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
              SITE INDEX
            </h1>
          </div>
          <p className="text-zinc-400 max-w-2xl mb-4">
            Navigate all public pages on path402.com. Find documentation, token info,
            and API reference.
          </p>
          <div className="flex items-center gap-4 text-sm text-zinc-600">
            <span className="border border-zinc-800 px-3 py-1">{totalPages} pages</span>
            <span className="border border-zinc-800 px-3 py-1">{PAGE_CATEGORIES.length} categories</span>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input
              type="text"
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-white pl-12 pr-4 py-3 focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-6">
          {filteredCategories.map((category) => {
            const CategoryIcon = category.icon;
            const isExpanded = expandedCategory === category.name || searchQuery;

            return (
              <div key={category.name} className="border border-zinc-800">
                <button
                  onClick={() => setExpandedCategory(isExpanded && !searchQuery ? null : category.name)}
                  className="w-full p-6 flex items-center justify-between hover:bg-zinc-950 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <CategoryIcon className="w-5 h-5 text-zinc-500" />
                    <div className="text-left">
                      <h2 className="text-lg font-bold uppercase tracking-tight">
                        {category.name}
                      </h2>
                      <p className="text-sm text-zinc-600">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-zinc-700 border border-zinc-800 px-2 py-1">
                      {category.pages.length}
                    </span>
                    <FaArrowRight className={`w-4 h-4 text-zinc-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-zinc-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-800">
                      {category.pages.map((page) => (
                        <Link
                          key={page.path}
                          href={page.path}
                          className="p-4 bg-black hover:bg-zinc-950 transition-colors group"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-sm text-white group-hover:text-zinc-300">
                              {page.title}
                            </h3>
                            <FaArrowRight className="w-3 h-3 text-zinc-700 group-hover:text-white" />
                          </div>
                          <p className="text-xs text-zinc-600 mb-1">{page.description}</p>
                          <code className="text-[10px] text-zinc-700">{page.path}</code>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Links */}
        <div className="mt-16 border border-zinc-800 p-8">
          <h3 className="text-lg font-bold mb-6 text-zinc-500 uppercase tracking-tight">
            Quick Links
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { path: '/', label: 'Home' },
              { path: '/whitepaper', label: 'Whitepaper' },
              { path: '/token', label: 'Token' },
              { path: '/docs', label: 'Docs' },
            ].map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="px-4 py-3 border border-zinc-800 text-center text-sm font-bold uppercase tracking-wider text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* MCP Integration */}
        <div className="mt-8 border border-emerald-900/50 bg-emerald-950/20 p-6">
          <h3 className="text-lg font-bold mb-4 text-emerald-400 uppercase tracking-tight">
            For AI Agents
          </h3>
          <p className="text-sm text-zinc-400 mb-4">
            Install the MCP server to integrate $402 protocol capabilities into your AI agent:
          </p>
          <code className="block bg-black border border-zinc-800 p-4 text-emerald-400 text-sm">
            npm install -g path402-mcp-server
          </code>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-zinc-700">
          $402 Protocol - Turn any URL into a priced, tokenized market.
          <br />
          <a href="https://dns-dex.com" className="text-zinc-500 hover:text-white">
            Trade domain tokens at dns-dex.com
          </a>
        </div>
      </div>
    </div>
  );
}
