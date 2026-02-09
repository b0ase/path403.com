'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiShoppingBag,
  FiFile,
  FiDownload,
  FiUser,
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
} from 'react-icons/fi';
import { formatFileSize } from '@/lib/moneybutton/constants';

interface Listing {
  id: string;
  title: string;
  description: string | null;
  file_name: string;
  file_size: number;
  mime_type: string;
  price_usd: number;
  seller_handcash: string;
  download_count: number;
  created_at: string;
}

export default function BuyPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'popular'>('newest');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await fetch('/api/moneybutton/download/list');
      const data = await res.json();
      if (data.success) {
        setListings(data.listings);
      } else {
        setError(data.error || 'Failed to load listings');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort listings
  const filteredListings = listings
    .filter(listing =>
      listing.title.toLowerCase().includes(search.toLowerCase()) ||
      (listing.description?.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.price_usd - b.price_usd;
        case 'price_high':
          return b.price_usd - a.price_usd;
        case 'popular':
          return b.download_count - a.download_count;
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('video')) return '🎬';
    if (mimeType.includes('audio')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
    if (mimeType.includes('text')) return '📝';
    return '📁';
  };

  const getFileType = (mimeType: string) => {
    if (mimeType.includes('image')) return 'Image';
    if (mimeType.includes('video')) return 'Video';
    if (mimeType.includes('audio')) return 'Audio';
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('zip')) return 'Archive';
    if (mimeType.includes('text')) return 'Document';
    return 'File';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 text-sm">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="px-4 md:px-8 py-16">
        {/* Header */}
        <motion.div
          className="mb-8 border-b border-zinc-900 pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
            <div className="bg-green-900/50 p-4 md:p-6 border border-green-800 self-start">
              <FiShoppingBag className="text-4xl md:text-6xl text-green-400" />
            </div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 leading-none tracking-tighter">
                BUY FILES
              </h1>
              <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                MARKETPLACE
              </div>
            </div>
          </div>
          <p className="text-zinc-400 max-w-2xl">
            Browse and purchase digital files. Pay with HandCash, download instantly.
            Sellers earn 95% of every sale.
          </p>
        </motion.div>

        {/* Search and filters */}
        <motion.div
          className="flex flex-col md:flex-row gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files..."
              className="w-full bg-black border border-zinc-800 pl-12 pr-4 py-3 text-white placeholder-zinc-600 focus:border-green-500 focus:outline-none"
            />
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-black border border-zinc-800 px-4 py-3 text-white focus:border-green-500 focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>

            {/* View mode toggle */}
            <div className="flex border border-zinc-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 ${viewMode === 'grid' ? 'bg-green-500/20 text-green-400' : 'text-zinc-500 hover:text-white'}`}
              >
                <FiGrid />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 ${viewMode === 'list' ? 'bg-green-500/20 text-green-400' : 'text-zinc-500 hover:text-white'}`}
              >
                <FiList />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          className="flex gap-6 mb-8 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-zinc-500">
            <span className="text-white font-bold">{filteredListings.length}</span> files available
          </span>
          {search && (
            <span className="text-zinc-500">
              Showing results for "<span className="text-green-400">{search}</span>"
            </span>
          )}
        </motion.div>

        {/* Error state */}
        {error && (
          <div className="border border-red-500/30 bg-red-900/10 p-6 mb-8 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchListings}
              className="mt-4 px-4 py-2 border border-zinc-700 text-sm hover:border-zinc-500 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!error && filteredListings.length === 0 && (
          <motion.div
            className="border border-zinc-800 bg-black p-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <FiFile className="text-4xl text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No files found</h3>
            <p className="text-zinc-500 mb-6">
              {search ? 'Try a different search term' : 'Be the first to upload a file for sale'}
            </p>
            <Link
              href="/moneybutton/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-black font-bold text-sm uppercase tracking-wider hover:bg-green-400 transition-colors"
            >
              Upload a File
            </Link>
          </motion.div>
        )}

        {/* Listings grid */}
        {filteredListings.length > 0 && (
          <motion.div
            className={viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-3'
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {filteredListings.map((listing, i) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <Link
                  href={`/moneybutton/download/${listing.id}`}
                  className={`block border border-zinc-800 bg-black hover:border-green-500/50 hover:bg-green-900/5 transition-all group ${
                    viewMode === 'list' ? 'p-4' : 'p-6'
                  }`}
                >
                  {viewMode === 'grid' ? (
                    // Grid view
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-3xl">{getFileIcon(listing.mime_type)}</span>
                        <span className="text-xs px-2 py-1 bg-zinc-900 text-zinc-500 rounded">
                          {getFileType(listing.mime_type)}
                        </span>
                      </div>
                      <h3 className="font-bold text-white mb-2 group-hover:text-green-400 transition-colors line-clamp-2">
                        {listing.title}
                      </h3>
                      {listing.description && (
                        <p className="text-zinc-500 text-xs mb-4 line-clamp-2">
                          {listing.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-zinc-500 mb-4">
                        <span>{formatFileSize(listing.file_size)}</span>
                        <span className="flex items-center gap-1">
                          <FiDownload size={12} />
                          {listing.download_count}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-green-400">
                          ${listing.price_usd.toFixed(2)}
                        </span>
                        <span className="text-xs text-zinc-600 flex items-center gap-1">
                          <FiUser size={10} />
                          ${listing.seller_handcash}
                        </span>
                      </div>
                    </>
                  ) : (
                    // List view
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{getFileIcon(listing.mime_type)}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white group-hover:text-green-400 transition-colors truncate">
                          {listing.title}
                        </h3>
                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                          <span>{getFileType(listing.mime_type)}</span>
                          <span>{formatFileSize(listing.file_size)}</span>
                          <span className="flex items-center gap-1">
                            <FiDownload size={10} />
                            {listing.download_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiUser size={10} />
                            ${listing.seller_handcash}
                          </span>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-green-400 whitespace-nowrap">
                        ${listing.price_usd.toFixed(2)}
                      </span>
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Sell CTA */}
        <motion.div
          className="mt-12 border border-green-500/30 bg-green-900/10 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold mb-1 text-white uppercase">
                Have something to sell?
              </h3>
              <p className="text-zinc-500 text-sm">
                Upload your files and earn 95% of every sale. Get paid via HandCash.
              </p>
            </div>
            <Link
              href="/moneybutton/upload"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-black text-sm font-bold uppercase tracking-wider hover:bg-green-400 transition-colors whitespace-nowrap"
            >
              Start Selling
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
