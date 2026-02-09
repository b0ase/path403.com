'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiSmile,
  FiDownload,
  FiUser,
  FiSearch,
  FiTrendingUp,
  FiClock,
  FiDollarSign,
} from 'react-icons/fi';
import { formatFileSize } from '@/lib/moneybutton/constants';

interface Meme {
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

// Demo meme categories
const MEME_CATEGORIES = [
  { id: 'trending', label: '🔥 Trending', color: 'text-orange-400' },
  { id: 'classic', label: '👴 Classic', color: 'text-yellow-400' },
  { id: 'dank', label: '💀 Dank', color: 'text-purple-400' },
  { id: 'wholesome', label: '🥰 Wholesome', color: 'text-pink-400' },
  { id: 'crypto', label: '🚀 Crypto', color: 'text-green-400' },
  { id: 'cats', label: '🐱 Cats', color: 'text-blue-400' },
];

export default function MemeIndexPage() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'trending' | 'newest' | 'cheapest'>('trending');

  useEffect(() => {
    fetchMemes();
  }, []);

  const fetchMemes = async () => {
    try {
      const res = await fetch('/api/moneybutton/download/list?type=meme');
      const data = await res.json();
      if (data.success) {
        // Filter to images (memes are images)
        const memeList = data.listings.filter((l: Meme) =>
          l.mime_type.includes('image')
        );
        setMemes(memeList);
      } else {
        setError(data.error || 'Failed to load memes');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort
  const filteredMemes = memes
    .filter(meme =>
      meme.title.toLowerCase().includes(search.toLowerCase()) ||
      (meme.description?.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'cheapest':
          return a.price_usd - b.price_usd;
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'trending':
        default:
          return b.download_count - a.download_count;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">😂</div>
          <p className="text-zinc-500 text-sm">Loading memes...</p>
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
            <div className="bg-yellow-900/50 p-4 md:p-6 border border-yellow-800 self-start">
              <span className="text-4xl md:text-6xl">😂</span>
            </div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 leading-none tracking-tighter">
                MEME INDEX
              </h1>
              <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                INVEST IN CULTURE
              </div>
            </div>
          </div>
          <p className="text-zinc-400 max-w-2xl">
            The internet's finest memes, tokenized and tradeable.
            Buy exclusive memes, support creators. 95% goes to the meme lord.
          </p>
        </motion.div>

        {/* Categories */}
        <motion.div
          className="flex flex-wrap gap-2 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              !selectedCategory
                ? 'bg-yellow-500 text-black'
                : 'border border-zinc-800 text-zinc-500 hover:border-zinc-600'
            }`}
          >
            All Memes
          </button>
          {MEME_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-yellow-500 text-black'
                  : 'border border-zinc-800 text-zinc-500 hover:border-zinc-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Search and sort */}
        <motion.div
          className="flex flex-col md:flex-row gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search memes..."
              className="w-full bg-black border border-zinc-800 pl-12 pr-4 py-3 text-white placeholder-zinc-600 focus:border-yellow-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('trending')}
              className={`flex items-center gap-2 px-4 py-3 border transition-colors ${
                sortBy === 'trending'
                  ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                  : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'
              }`}
            >
              <FiTrendingUp size={14} />
              <span className="text-sm">Trending</span>
            </button>
            <button
              onClick={() => setSortBy('newest')}
              className={`flex items-center gap-2 px-4 py-3 border transition-colors ${
                sortBy === 'newest'
                  ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                  : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'
              }`}
            >
              <FiClock size={14} />
              <span className="text-sm">New</span>
            </button>
            <button
              onClick={() => setSortBy('cheapest')}
              className={`flex items-center gap-2 px-4 py-3 border transition-colors ${
                sortBy === 'cheapest'
                  ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                  : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'
              }`}
            >
              <FiDollarSign size={14} />
              <span className="text-sm">Cheap</span>
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="flex gap-6 mb-8 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-zinc-500">
            <span className="text-white font-bold">{filteredMemes.length}</span> memes indexed
          </span>
        </motion.div>

        {/* Error state */}
        {error && (
          <div className="border border-red-500/30 bg-red-900/10 p-6 mb-8 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchMemes}
              className="mt-4 px-4 py-2 border border-zinc-700 text-sm hover:border-zinc-500 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!error && filteredMemes.length === 0 && (
          <motion.div
            className="border border-zinc-800 bg-black p-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-4">🥲</div>
            <h3 className="text-xl font-bold text-white mb-2">No memes found</h3>
            <p className="text-zinc-500 mb-6">
              {search ? 'Try a different search term' : 'Be the first to upload a meme'}
            </p>
            <Link
              href="/moneybutton/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-black font-bold text-sm uppercase tracking-wider hover:bg-yellow-400 transition-colors"
            >
              Upload a Meme
            </Link>
          </motion.div>
        )}

        {/* Memes grid - masonry-style */}
        {filteredMemes.length > 0 && (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {filteredMemes.map((meme, i) => (
              <motion.div
                key={meme.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.03 * i }}
                className={i % 5 === 0 ? 'row-span-2' : ''}
              >
                <Link
                  href={`/moneybutton/download/${meme.id}`}
                  className="block border border-zinc-800 bg-black hover:border-yellow-500/50 transition-all group h-full"
                >
                  {/* Meme image placeholder */}
                  <div className={`${i % 5 === 0 ? 'aspect-[3/4]' : 'aspect-square'} bg-zinc-900 relative overflow-hidden`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl opacity-30 group-hover:opacity-50 transition-opacity">
                        {['😂', '💀', '🔥', '👀', '🚀', '😭'][i % 6]}
                      </span>
                    </div>
                    {/* Hot badge for top memes */}
                    {meme.download_count > 10 && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-orange-500 text-black text-[10px] font-bold rounded">
                        🔥 HOT
                      </div>
                    )}
                    {/* Price badge */}
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-yellow-400 text-sm font-bold rounded">
                      ${meme.price_usd.toFixed(2)}
                    </div>
                  </div>

                  <div className="p-3">
                    <h3 className="font-bold text-white text-sm group-hover:text-yellow-400 transition-colors line-clamp-2">
                      {meme.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-zinc-500 mt-2">
                      <span className="flex items-center gap-1">
                        <FiUser size={10} />
                        ${meme.seller_handcash}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiDownload size={10} />
                        {meme.download_count}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Upload CTA */}
        <motion.div
          className="mt-12 border border-yellow-500/30 bg-yellow-900/10 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold mb-1 text-white uppercase">
                Got a spicy meme?
              </h3>
              <p className="text-zinc-500 text-sm">
                Upload your finest memes and earn 95% when people buy. Become a meme lord.
              </p>
            </div>
            <Link
              href="/moneybutton/upload"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 text-black text-sm font-bold uppercase tracking-wider hover:bg-yellow-400 transition-colors whitespace-nowrap"
            >
              Upload Meme 😂
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
