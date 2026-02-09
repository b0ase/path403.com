'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { portfolioData } from '@/lib/data';
import { FiArrowRight, FiCheck, FiSearch, FiPackage } from 'react-icons/fi';
import { ShoppingBag, Repeat, Key, Building2, Store } from 'lucide-react';

// Generate product/service offerings from portfolio projects
const getProductType = (project: any): { type: string; offering: string; startingPrice: string } => {
  const title = project.title.toLowerCase();
  const desc = project.description.toLowerCase();

  if (desc.includes('nft') || desc.includes('collectible')) {
    return { type: 'Digital Collectibles', offering: 'NFT Collection', startingPrice: 'From 0.01 BSV' };
  }
  if (desc.includes('api') || title.includes('api')) {
    return { type: 'API Access', offering: 'Developer API', startingPrice: 'From $29/mo' };
  }
  if (desc.includes('saas') || desc.includes('platform') || desc.includes('tool')) {
    return { type: 'SaaS', offering: 'Platform Access', startingPrice: 'From $49/mo' };
  }
  if (desc.includes('game') || desc.includes('gaming')) {
    return { type: 'Digital Product', offering: 'Game Access', startingPrice: 'From $9.99' };
  }
  if (desc.includes('course') || desc.includes('education') || desc.includes('learn')) {
    return { type: 'Education', offering: 'Online Course', startingPrice: 'From $199' };
  }
  if (desc.includes('design') || desc.includes('3d') || desc.includes('visual')) {
    return { type: 'Design Assets', offering: 'Asset Pack', startingPrice: 'From $39' };
  }
  if (desc.includes('music') || desc.includes('audio')) {
    return { type: 'Audio', offering: 'Music License', startingPrice: 'From $19' };
  }
  if (desc.includes('video') || desc.includes('film')) {
    return { type: 'Video', offering: 'Video License', startingPrice: 'From $99' };
  }
  if (desc.includes('fashion') || desc.includes('clothing') || desc.includes('merch')) {
    return { type: 'Physical Product', offering: 'Merchandise', startingPrice: 'From $25' };
  }
  return { type: 'Service', offering: 'Custom Project', startingPrice: 'Get Quote' };
};

const bottomProjects = ['BSV API', 'BSVEX', 'BitCDN', 'BitDNS', 'Weight', 'Penshun', 'YourCash'];
const products = portfolioData.projects
  .filter(p => p.slug !== 'coffeeguy-commerce-website')
  .sort((a, b) => {
    const aIsBottom = bottomProjects.includes(a.title);
    const bIsBottom = bottomProjects.includes(b.title);
    if (aIsBottom && !bIsBottom) return 1;
    if (!aIsBottom && bIsBottom) return -1;
    if (aIsBottom && bIsBottom) return bottomProjects.indexOf(a.title) - bottomProjects.indexOf(b.title);
    return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
  })
  .map(project => ({
    ...project,
    ...getProductType(project)
  }));

const PRODUCT_TYPES = [
  'All',
  'SaaS',
  'API Access',
  'Digital Product',
  'Digital Collectibles',
  'Design Assets',
  'Service',
  'Physical Product'
];

const SELL_TYPES = [
  {
    icon: ShoppingBag,
    title: 'Products',
    description: 'Physical goods, digital downloads, one-time purchases.'
  },
  {
    icon: Key,
    title: 'Services',
    description: 'Consulting, custom work, professional services.'
  },
  {
    icon: Repeat,
    title: 'Access',
    description: 'Subscriptions, memberships, API access, gated content.'
  },
  {
    icon: Building2,
    title: 'The Business',
    description: 'Equity, acquisitions, investment opportunities.'
  }
];

export default function MarketPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || product.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <motion.div
      className="min-h-screen bg-black text-white relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.section
        className="px-4 md:px-8 py-16 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        {/* Standardized Header */}
        <motion.div
          className="mb-12 border-b border-gray-800 pb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
            <div className="bg-gray-900/50 p-4 md:p-6 border border-gray-800 self-start">
              <Store className="w-10 h-10 md:w-14 md:h-14 text-white" />
            </div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                MARKET
              </h1>
              <div className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-widest">
                BUY_&_SELL
              </div>
            </div>
          </div>

          {/* Marketing Pitch */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-gray-400 max-w-2xl">
              The b0ase.com marketplace. Buy from portfolio companies or join the club and
              sell your products, services, access, and ultimately your business.
            </p>
            <Link
              href="#join-the-market"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              Join the Market <FiArrowRight size={14} />
            </Link>
          </div>
        </motion.div>

        {/* What You Can Sell */}
        <div className="mb-12">
          <h3 className="text-xl font-bold uppercase tracking-tight mb-6 text-gray-400">
            Sell Everything
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SELL_TYPES.map((item, index) => (
              <div key={index} className="p-6 border border-gray-800 bg-black">
                <item.icon className="w-6 h-6 text-white mb-3" />
                <h4 className="font-bold uppercase tracking-tight text-white text-sm mb-1">
                  {item.title}
                </h4>
                <p className="text-gray-500 text-xs">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Browse Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold uppercase tracking-tight mb-6 text-gray-400">
            Browse the Market
          </h3>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search products and services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black border border-gray-800 text-white placeholder-gray-600 focus:border-gray-600 focus:outline-none transition-colors"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 bg-black border border-gray-800 text-white focus:border-gray-600 focus:outline-none transition-colors"
            >
              {PRODUCT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="mb-6 text-sm text-gray-500">
            Showing {filteredProducts.length} of {products.length} listings
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-16">
          {filteredProducts.map((product) => {
            const formatValuation = (price: number | undefined) => {
              if (!price) return null;
              if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
              if (price >= 1000) return `$${(price / 1000).toFixed(0)}k`;
              return `$${price.toLocaleString()}`;
            };

            return (
              <Link
                key={product.id}
                href={`/portfolio/${product.slug}`}
                className="group border border-gray-800 hover:border-gray-600 bg-black transition-all flex flex-col"
              >
                {/* Image - taller */}
                <div className="relative w-full h-48 bg-gray-900 overflow-hidden flex-shrink-0">
                  {product.cardImageUrls && product.cardImageUrls.length > 0 ? (
                    <Image
                      src={product.cardImageUrls[0]}
                      alt={product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiPackage className="text-gray-700" size={48} />
                    </div>
                  )}
                  {/* Type Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="text-xs px-2 py-1 bg-black/80 text-gray-300 border border-gray-700">
                      {product.type}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-white group-hover:underline mb-1">{product.title}</h3>

                  <p className="text-gray-500 text-sm mb-3 line-clamp-2 flex-grow">
                    {product.description}
                  </p>

                  {/* Pricing Row */}
                  <div className="flex items-center justify-between text-xs mb-3 pb-3 border-b border-gray-800">
                    <span className="text-gray-600 uppercase tracking-wider">
                      {product.offering}
                    </span>
                    <span className="font-mono text-green-400">{product.startingPrice}</span>
                  </div>

                  {/* Valuation */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 uppercase">Valuation</span>
                    <span className="text-sm font-bold text-white">
                      {formatValuation(product.price) || 'Contact'}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 border border-gray-800 mb-16">
            <FiSearch size={48} className="mx-auto mb-4 text-gray-700" />
            <h3 className="text-xl font-bold mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filter</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedType('All'); }}
              className="px-4 py-2 border border-gray-800 text-white hover:border-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Join the Market Section */}
        <div id="join-the-market" className="pt-16 border-t border-gray-800">
          <h3 className="text-xl font-bold uppercase tracking-tight mb-6 text-gray-400">
            Join the Market
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="border border-gray-800 p-8">
              <h4 className="text-2xl md:text-3xl font-bold mb-6 text-white leading-tight">
                Build with b0ase.com. <span className="text-gray-500">Sell on the market.</span>
              </h4>
              <p className="text-gray-400 mb-6">
                b0ase.com helps you build your business from the ground up. When you're ready,
                you get a listing on the market - selling alongside other portfolio companies,
                part of the club.
              </p>
              <p className="text-gray-400 mb-6">
                Start by selling products and services. Build recurring revenue with subscriptions.
                When the time is right, sell the business itself.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-400">
                  <FiCheck className="text-green-400 flex-shrink-0" />
                  <span>Featured listing on the b0ase.com market</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <FiCheck className="text-green-400 flex-shrink-0" />
                  <span>Sell products, services, and subscriptions</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <FiCheck className="text-green-400 flex-shrink-0" />
                  <span>Access to b0ase.com investor network</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <FiCheck className="text-green-400 flex-shrink-0" />
                  <span>Exit support when you're ready to sell</span>
                </li>
              </ul>
            </div>

            <div className="border border-gray-800 p-8">
              <h4 className="font-bold uppercase tracking-tight mb-6 text-white">
                The Journey
              </h4>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 border border-gray-800 flex items-center justify-center text-xs font-mono text-gray-500 flex-shrink-0">1</div>
                  <div>
                    <div className="font-bold text-white mb-1">Build</div>
                    <p className="text-gray-500 text-sm">Work with b0ase.com to develop your product, platform, or service.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 border border-gray-800 flex items-center justify-center text-xs font-mono text-gray-500 flex-shrink-0">2</div>
                  <div>
                    <div className="font-bold text-white mb-1">List</div>
                    <p className="text-gray-500 text-sm">Get your listing on the market. Start selling to b0ase.com's audience.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 border border-gray-800 flex items-center justify-center text-xs font-mono text-gray-500 flex-shrink-0">3</div>
                  <div>
                    <div className="font-bold text-white mb-1">Grow</div>
                    <p className="text-gray-500 text-sm">Scale with products, subscriptions, and recurring revenue.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 border border-gray-800 flex items-center justify-center text-xs font-mono text-gray-500 flex-shrink-0">4</div>
                  <div>
                    <div className="font-bold text-white mb-1">Exit</div>
                    <p className="text-gray-500 text-sm">When you're ready, sell the business - on the same market you've been building on.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="border border-gray-800 p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h4 className="text-2xl font-bold mb-2 text-white">
                  Ready to join?
                </h4>
                <p className="text-gray-400">
                  Build your business with b0ase.com. Sell on the market.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 font-bold hover:opacity-80 transition-colors whitespace-nowrap"
                style={{ backgroundColor: '#fff', color: '#000' }}
              >
                Get Started <FiArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
