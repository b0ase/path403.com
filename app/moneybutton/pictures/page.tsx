'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiImage,
  FiDownload,
  FiUser,
  FiSearch,
  FiGrid,
  FiSquare,
} from 'react-icons/fi';
import { formatFileSize } from '@/lib/moneybutton/constants';

interface Picture {
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

export default function PicturesPage() {
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'popular'>('newest');
  const [gridSize, setGridSize] = useState<'small' | 'large'>('large');

  useEffect(() => {
    fetchPictures();
  }, []);

  const fetchPictures = async () => {
    try {
      const res = await fetch('/api/moneybutton/download/list?type=image');
      const data = await res.json();
      if (data.success) {
        // Filter to only images
        const images = data.listings.filter((l: Picture) =>
          l.mime_type.includes('image')
        );
        setPictures(images);
      } else {
        setError(data.error || 'Failed to load pictures');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort
  const filteredPictures = pictures
    .filter(pic =>
      pic.title.toLowerCase().includes(search.toLowerCase()) ||
      (pic.description?.toLowerCase().includes(search.toLowerCase()))
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 text-sm">Loading pictures...</p>
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
            <div className="bg-pink-900/50 p-4 md:p-6 border border-pink-800 self-start">
              <FiImage className="text-4xl md:text-6xl text-pink-400" />
            </div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-500 to-red-500 leading-none tracking-tighter">
                PICTURES
              </h1>
              <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                IMAGE MARKETPLACE
              </div>
            </div>
          </div>
          <p className="text-zinc-400 max-w-2xl">
            Browse and purchase high-quality images. Pay with HandCash, download instantly.
            Photographers earn 95% of every sale.
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
              placeholder="Search pictures..."
              className="w-full bg-black border border-zinc-800 pl-12 pr-4 py-3 text-white placeholder-zinc-600 focus:border-pink-500 focus:outline-none"
            />
          </div>

          {/* Sort and grid size */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-black border border-zinc-800 px-4 py-3 text-white focus:border-pink-500 focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>

            {/* Grid size toggle */}
            <div className="flex border border-zinc-800">
              <button
                onClick={() => setGridSize('large')}
                className={`p-3 ${gridSize === 'large' ? 'bg-pink-500/20 text-pink-400' : 'text-zinc-500 hover:text-white'}`}
              >
                <FiSquare />
              </button>
              <button
                onClick={() => setGridSize('small')}
                className={`p-3 ${gridSize === 'small' ? 'bg-pink-500/20 text-pink-400' : 'text-zinc-500 hover:text-white'}`}
              >
                <FiGrid />
              </button>
            </div>
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
            <span className="text-white font-bold">{filteredPictures.length}</span> pictures
          </span>
        </motion.div>

        {/* Error state */}
        {error && (
          <div className="border border-red-500/30 bg-red-900/10 p-6 mb-8 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchPictures}
              className="mt-4 px-4 py-2 border border-zinc-700 text-sm hover:border-zinc-500 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!error && filteredPictures.length === 0 && (
          <motion.div
            className="border border-zinc-800 bg-black p-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <FiImage className="text-4xl text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No pictures found</h3>
            <p className="text-zinc-500 mb-6">
              {search ? 'Try a different search term' : 'Be the first to upload a picture for sale'}
            </p>
            <Link
              href="/moneybutton/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 text-black font-bold text-sm uppercase tracking-wider hover:bg-pink-400 transition-colors"
            >
              Upload a Picture
            </Link>
          </motion.div>
        )}

        {/* Pictures grid */}
        {filteredPictures.length > 0 && (
          <motion.div
            className={`grid gap-4 ${
              gridSize === 'large'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {filteredPictures.map((pic, i) => (
              <motion.div
                key={pic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * i }}
              >
                <Link
                  href={`/moneybutton/download/${pic.id}`}
                  className="block border border-zinc-800 bg-black hover:border-pink-500/50 transition-all group overflow-hidden"
                >
                  {/* Image placeholder - would show actual thumbnail in production */}
                  <div className={`${gridSize === 'large' ? 'aspect-[4/3]' : 'aspect-square'} bg-zinc-900 relative overflow-hidden`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FiImage className="text-4xl text-zinc-800 group-hover:text-pink-500/30 transition-colors" />
                    </div>
                    {/* Price badge */}
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-pink-400 text-sm font-bold rounded">
                      ${pic.price_usd.toFixed(2)}
                    </div>
                  </div>

                  <div className={`p-3 ${gridSize === 'small' ? 'p-2' : 'p-4'}`}>
                    <h3 className={`font-bold text-white group-hover:text-pink-400 transition-colors truncate ${gridSize === 'small' ? 'text-xs' : 'text-sm'}`}>
                      {pic.title}
                    </h3>
                    <div className={`flex items-center justify-between text-zinc-500 mt-1 ${gridSize === 'small' ? 'text-[10px]' : 'text-xs'}`}>
                      <span className="flex items-center gap-1">
                        <FiUser size={gridSize === 'small' ? 8 : 10} />
                        ${pic.seller_handcash}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiDownload size={gridSize === 'small' ? 8 : 10} />
                        {pic.download_count}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Sell CTA */}
        <motion.div
          className="mt-12 border border-pink-500/30 bg-pink-900/10 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold mb-1 text-white uppercase">
                Sell your photography
              </h3>
              <p className="text-zinc-500 text-sm">
                Upload your images and earn 95% of every sale. Get paid instantly via HandCash.
              </p>
            </div>
            <Link
              href="/moneybutton/upload"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-pink-500 text-black text-sm font-bold uppercase tracking-wider hover:bg-pink-400 transition-colors whitespace-nowrap"
            >
              Upload Pictures
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
