'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiUser, FiCheckCircle, FiExternalLink, FiSearch,
  FiTrendingUp, FiAward, FiPlay, FiUsers, FiStar,
  FiYoutube, FiInstagram, FiTwitter, FiMusic, FiMic,
  FiVideo, FiCamera, FiEdit3, FiRadio, FiMonitor
} from 'react-icons/fi';
import { FaTiktok, FaTwitch, FaSpotify, FaPatreon, FaDiscord } from 'react-icons/fa';

interface Creator {
  id: string;
  displayName: string;
  realName?: string;
  photo: string;
  bio: string;
  primaryPlatform: string;
  platformHandle: string;
  platformUrl: string;
  platformVerified: boolean;
  followers: string;
  engagement: string;
  category: string;
  ticker: string;
  tokenized: boolean;
  otherPlatforms: { platform: string; handle: string; followers: string }[];
  contentType: string[];
  joinedDate: string;
}

// Demo creators with realistic data
const DEMO_CREATORS: Creator[] = [
  {
    id: 'creator-001',
    displayName: 'TechWithTim',
    realName: 'Tim Roberts',
    photo: '/images/creators/tech-with-tim.jpg',
    bio: 'Programming tutorials, AI explainers, and tech reviews. Teaching 2M+ developers how to code.',
    primaryPlatform: 'YouTube',
    platformHandle: '@TechWithTim',
    platformUrl: 'https://youtube.com/@TechWithTim',
    platformVerified: true,
    followers: '2.1M',
    engagement: '4.2%',
    category: 'Tech & Programming',
    ticker: '$TWTI',
    tokenized: true,
    otherPlatforms: [
      { platform: 'Twitter', handle: '@TechWithTim', followers: '180K' },
      { platform: 'Discord', handle: 'TechWithTim', followers: '45K' },
    ],
    contentType: ['Tutorials', 'Reviews', 'Live Coding'],
    joinedDate: '2024-06',
  },
  {
    id: 'creator-002',
    displayName: 'CryptoGems',
    realName: 'Alex Chen',
    photo: '/images/creators/crypto-gems.jpg',
    bio: 'Daily crypto analysis, altcoin reviews, and market insights. No financial advice, just vibes.',
    primaryPlatform: 'YouTube',
    platformHandle: '@CryptoGems',
    platformUrl: 'https://youtube.com/@CryptoGems',
    platformVerified: true,
    followers: '890K',
    engagement: '5.8%',
    category: 'Crypto & Finance',
    ticker: '$CGEM',
    tokenized: true,
    otherPlatforms: [
      { platform: 'Twitter', handle: '@CryptoGemsYT', followers: '320K' },
      { platform: 'TikTok', handle: '@cryptogems', followers: '150K' },
    ],
    contentType: ['Analysis', 'News', 'Tutorials'],
    joinedDate: '2024-08',
  },
  {
    id: 'creator-003',
    displayName: 'FitnessByMaya',
    realName: 'Maya Johnson',
    photo: '/images/creators/fitness-maya.jpg',
    bio: 'HIIT workouts, nutrition tips, and wellness content. Certified PT helping millions get fit.',
    primaryPlatform: 'Instagram',
    platformHandle: '@FitnessByMaya',
    platformUrl: 'https://instagram.com/FitnessByMaya',
    platformVerified: true,
    followers: '1.5M',
    engagement: '6.2%',
    category: 'Health & Fitness',
    ticker: '$MAYA',
    tokenized: true,
    otherPlatforms: [
      { platform: 'YouTube', handle: '@FitnessByMaya', followers: '420K' },
      { platform: 'TikTok', handle: '@fitnessbymaya', followers: '890K' },
    ],
    contentType: ['Workouts', 'Nutrition', 'Motivation'],
    joinedDate: '2024-07',
  },
  {
    id: 'creator-004',
    displayName: 'GamerzElite',
    realName: null,
    photo: '/images/creators/gamerz-elite.jpg',
    bio: 'Pro Valorant player and streamer. Daily streams, highlights, and gaming content.',
    primaryPlatform: 'Twitch',
    platformHandle: 'GamerzElite',
    platformUrl: 'https://twitch.tv/GamerzElite',
    platformVerified: true,
    followers: '650K',
    engagement: '8.1%',
    category: 'Gaming',
    ticker: '$GMRZ',
    tokenized: false,
    otherPlatforms: [
      { platform: 'YouTube', handle: '@GamerzElite', followers: '280K' },
      { platform: 'Twitter', handle: '@GamerzEliteTV', followers: '95K' },
    ],
    contentType: ['Streams', 'Highlights', 'Tutorials'],
    joinedDate: '2024-09',
  },
  {
    id: 'creator-005',
    displayName: 'TheDailyDose',
    realName: 'James & Sarah Miller',
    photo: '/images/creators/daily-dose.jpg',
    bio: 'Daily podcast covering tech, culture, and internet trends. 500+ episodes and counting.',
    primaryPlatform: 'Spotify',
    platformHandle: 'The Daily Dose',
    platformUrl: 'https://open.spotify.com/show/thedailydose',
    platformVerified: true,
    followers: '340K',
    engagement: '12.4%',
    category: 'Podcast',
    ticker: '$DOSE',
    tokenized: true,
    otherPlatforms: [
      { platform: 'YouTube', handle: '@TheDailyDosePod', followers: '120K' },
      { platform: 'Patreon', handle: 'thedailydose', followers: '8.5K' },
    ],
    contentType: ['Podcast', 'Interviews', 'Commentary'],
    joinedDate: '2024-05',
  },
  {
    id: 'creator-006',
    displayName: 'ViralVince',
    realName: 'Vincent Lee',
    photo: '/images/creators/viral-vince.jpg',
    bio: 'Comedy skits and viral challenges. 50M+ likes. Making the internet laugh one video at a time.',
    primaryPlatform: 'TikTok',
    platformHandle: '@ViralVince',
    platformUrl: 'https://tiktok.com/@ViralVince',
    platformVerified: true,
    followers: '4.2M',
    engagement: '9.3%',
    category: 'Comedy & Entertainment',
    ticker: '$VINC',
    tokenized: true,
    otherPlatforms: [
      { platform: 'Instagram', handle: '@ViralVince', followers: '890K' },
      { platform: 'YouTube', handle: '@ViralVinceShorts', followers: '1.1M' },
    ],
    contentType: ['Comedy', 'Challenges', 'Vlogs'],
    joinedDate: '2024-10',
  },
  {
    id: 'creator-007',
    displayName: 'ArtByEmma',
    realName: 'Emma Williams',
    photo: '/images/creators/art-emma.jpg',
    bio: 'Digital artist and illustrator. Commissions, tutorials, and behind-the-scenes content.',
    primaryPlatform: 'Instagram',
    platformHandle: '@ArtByEmma',
    platformUrl: 'https://instagram.com/ArtByEmma',
    platformVerified: true,
    followers: '520K',
    engagement: '7.8%',
    category: 'Art & Design',
    ticker: '$EMMA',
    tokenized: false,
    otherPlatforms: [
      { platform: 'YouTube', handle: '@ArtByEmma', followers: '180K' },
      { platform: 'Patreon', handle: 'artbyemma', followers: '3.2K' },
    ],
    contentType: ['Art', 'Tutorials', 'Timelapses'],
    joinedDate: '2024-11',
  },
  {
    id: 'creator-008',
    displayName: 'ChefMarco',
    realName: 'Marco Rossi',
    photo: '/images/creators/chef-marco.jpg',
    bio: 'Italian chef sharing authentic recipes. From pasta to pastries, learn to cook like a pro.',
    primaryPlatform: 'YouTube',
    platformHandle: '@ChefMarco',
    platformUrl: 'https://youtube.com/@ChefMarco',
    platformVerified: true,
    followers: '1.8M',
    engagement: '5.1%',
    category: 'Food & Cooking',
    ticker: '$CHEF',
    tokenized: true,
    otherPlatforms: [
      { platform: 'Instagram', handle: '@ChefMarcoOfficial', followers: '650K' },
      { platform: 'TikTok', handle: '@chefmarco', followers: '920K' },
    ],
    contentType: ['Recipes', 'Tutorials', 'Restaurant Reviews'],
    joinedDate: '2024-04',
  },
];

const CATEGORIES = ['All', 'Tech & Programming', 'Crypto & Finance', 'Health & Fitness', 'Gaming', 'Podcast', 'Comedy & Entertainment', 'Art & Design', 'Food & Cooking'];
const PLATFORMS = ['All', 'YouTube', 'TikTok', 'Instagram', 'Twitch', 'Spotify', 'Twitter'];

const getPlatformIcon = (platform: string, className: string = '') => {
  switch (platform.toLowerCase()) {
    case 'youtube': return <FiYoutube className={`text-red-500 ${className}`} />;
    case 'tiktok': return <FaTiktok className={`text-white ${className}`} />;
    case 'instagram': return <FiInstagram className={`text-pink-500 ${className}`} />;
    case 'twitch': return <FaTwitch className={`text-purple-500 ${className}`} />;
    case 'spotify': return <FaSpotify className={`text-green-500 ${className}`} />;
    case 'twitter': return <FiTwitter className={`text-blue-400 ${className}`} />;
    case 'discord': return <FaDiscord className={`text-indigo-400 ${className}`} />;
    case 'patreon': return <FaPatreon className={`text-orange-500 ${className}`} />;
    default: return <FiPlay className={`text-zinc-400 ${className}`} />;
  }
};

export default function CreatorsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCreators = DEMO_CREATORS.filter(creator => {
    const matchesCategory = selectedCategory === 'All' || creator.category === selectedCategory;
    const matchesPlatform = selectedPlatform === 'All' || creator.primaryPlatform === selectedPlatform;
    const matchesSearch = creator.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          creator.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          creator.platformHandle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesPlatform && matchesSearch;
  });

  const verifiedCount = DEMO_CREATORS.filter(c => c.platformVerified).length;
  const tokenizedCount = DEMO_CREATORS.filter(c => c.tokenized).length;
  const totalFollowers = '12.5M+';

  return (
    <motion.div
      className="min-h-screen bg-black text-white relative font-mono selection:bg-white selection:text-black"
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
        {/* Header */}
        <motion.div
          className="mb-12 border-b border-gray-800 pb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-6">
            <div className="bg-gray-900/50 p-4 md:p-6 border border-gray-800 self-start">
              <FiVideo className="text-4xl md:text-6xl text-white" />
            </div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                CREATORS
              </h1>
              <div className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-widest">
                VERIFIED CHANNELS
              </div>
            </div>
          </div>

          <p className="text-gray-400 max-w-2xl mb-6">
            YouTube influencers, TikTok stars, Twitch streamers, and podcasters.
            Verify your channels, tokenize your audience, and let your community invest in your success.
          </p>
        </motion.div>

        {/* Platform Verification Banner */}
        <div className="bg-purple-900/20 border border-purple-500/30 p-4 mb-8">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <FiCheckCircle className="text-purple-400" />
              <span className="text-purple-400 font-bold uppercase">Platform Verification</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <FiYoutube size={12} className="text-red-500" />
              <span>YouTube</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <FaTiktok size={12} />
              <span>TikTok</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <FiInstagram size={12} className="text-pink-500" />
              <span>Instagram</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <FaTwitch size={12} className="text-purple-500" />
              <span>Twitch</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <FaSpotify size={12} className="text-green-500" />
              <span>Spotify</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input
              type="text"
              placeholder="Search creators, channels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black border border-zinc-800 pl-10 pr-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-black border border-zinc-800 px-3 py-2 text-xs text-zinc-400 focus:outline-none focus:border-white"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
              ))}
            </select>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="bg-black border border-zinc-800 px-3 py-2 text-xs text-zinc-400 focus:outline-none focus:border-white"
            >
              {PLATFORMS.map(plat => (
                <option key={plat} value={plat}>{plat === 'All' ? 'All Platforms' : plat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 text-xs mb-8">
          <div className="border border-zinc-800 px-3 py-2">
            <span className="text-zinc-500">Creators:</span> <span className="text-white font-bold">{filteredCreators.length}</span>
          </div>
          <div className="border border-zinc-800 px-3 py-2">
            <span className="text-zinc-500">Verified:</span> <span className="text-purple-400 font-bold">{verifiedCount}</span>
          </div>
          <div className="border border-zinc-800 px-3 py-2">
            <span className="text-zinc-500">Tokenized:</span> <span className="text-emerald-400 font-bold">{tokenizedCount}</span>
          </div>
          <div className="border border-zinc-800 px-3 py-2">
            <span className="text-zinc-500">Combined Reach:</span> <span className="text-cyan-400 font-bold">{totalFollowers}</span>
          </div>
        </div>

        {/* Creators Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {filteredCreators.map((creator) => (
            <div
              key={creator.id}
              className={`bg-black border p-5 hover:bg-zinc-900/50 transition-colors ${
                creator.tokenized ? 'border-purple-500/30' : 'border-zinc-800'
              }`}
            >
              {/* Creator Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-14 h-14 bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden rounded-full">
                  <FiUser className="text-zinc-500 text-2xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-white">{creator.displayName}</h3>
                    {creator.platformVerified && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-purple-500/20 text-purple-400 uppercase shrink-0 flex items-center gap-1">
                        <FiCheckCircle size={8} /> Verified
                      </span>
                    )}
                  </div>
                  {creator.realName && (
                    <p className="text-[10px] text-zinc-600">{creator.realName}</p>
                  )}
                  <a
                    href={creator.platformUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 mt-1"
                  >
                    {getPlatformIcon(creator.primaryPlatform, 'text-sm')}
                    {creator.platformHandle}
                    <FiExternalLink size={10} />
                  </a>
                </div>
              </div>

              <p className="text-zinc-500 text-xs line-clamp-2 mb-3">{creator.bio}</p>

              {/* Stats Row */}
              <div className="flex items-center gap-3 mb-3 text-xs">
                <div className="flex items-center gap-1 text-cyan-400">
                  <FiUsers size={12} />
                  <span className="font-bold">{creator.followers}</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400">
                  <FiTrendingUp size={12} />
                  <span>{creator.engagement} eng.</span>
                </div>
                {creator.tokenized && (
                  <span className="text-purple-400 font-mono font-bold">{creator.ticker}</span>
                )}
              </div>

              {/* Content Types */}
              <div className="flex flex-wrap gap-1 mb-3">
                {creator.contentType.map((type, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400">
                    {type}
                  </span>
                ))}
              </div>

              {/* Other Platforms */}
              <div className="bg-zinc-900/50 border border-zinc-800 p-2 mb-4">
                <div className="text-[10px] text-zinc-600 uppercase mb-2">Also on</div>
                <div className="flex flex-wrap gap-2">
                  {creator.otherPlatforms.map((plat, i) => (
                    <div key={i} className="flex items-center gap-1 text-[10px] text-zinc-400">
                      {getPlatformIcon(plat.platform, 'text-xs')}
                      <span>{plat.followers}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 border border-zinc-700 text-zinc-500">
                    {creator.category}
                  </span>
                </div>
                <div className="flex gap-2">
                  {creator.tokenized ? (
                    <Link
                      href={`/exchange?token=${creator.ticker.replace('$', '')}`}
                      className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-purple-500 transition-colors"
                    >
                      Trade {creator.ticker}
                    </Link>
                  ) : (
                    <Link
                      href={`/contact?creator=${creator.id}&name=${encodeURIComponent(creator.displayName)}`}
                      className="px-3 py-1.5 border border-purple-500/50 text-purple-400 text-xs font-bold uppercase tracking-wider hover:bg-purple-500/10 transition-colors"
                    >
                      Connect
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredCreators.length === 0 && (
          <div className="text-center py-16 border border-zinc-800 mb-8">
            <p className="text-zinc-500 mb-4">No creators found matching your search.</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setSelectedPlatform('All'); }}
              className="text-white hover:underline text-sm"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Become a Creator CTA */}
        <div className="bg-black border border-purple-500/30 p-8 text-center mb-8">
          <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
            <FiVideo className="text-purple-400 text-xl" />
          </div>
          <h2 className="text-xl font-bold uppercase tracking-tight mb-2">Tokenize Your Channel</h2>
          <p className="text-zinc-500 text-sm mb-6 max-w-lg mx-auto">
            Connect your YouTube, TikTok, Twitch, or other platforms. Verify your audience and create a
            token that lets your community invest in your success.
          </p>
          <Link
            href="/contact?subject=Creator%20Verification"
            className="inline-block px-6 py-3 bg-purple-600 text-white font-bold uppercase tracking-wider text-sm hover:bg-purple-500 transition-colors"
          >
            Apply to Join
          </Link>
        </div>

        {/* How It Works */}
        <div className="bg-black border border-zinc-800 mb-8">
          <div className="bg-zinc-900/50 px-4 py-3 border-b border-zinc-800">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">How_Creator_Tokens_Work</span>
          </div>
          <div className="grid md:grid-cols-4 gap-px bg-zinc-800">
            {[
              { step: '01', title: 'Connect Platforms', desc: 'Link your YouTube, TikTok, Instagram, or Twitch accounts', icon: <FiMonitor className="text-cyan-400" /> },
              { step: '02', title: 'Verify Audience', desc: 'We verify your follower count and engagement metrics', icon: <FiCheckCircle className="text-purple-400" /> },
              { step: '03', title: 'Create Token', desc: 'Mint your creator token with your chosen ticker', icon: <FiStar className="text-amber-400" /> },
              { step: '04', title: 'Community Invests', desc: 'Fans buy your token to support and invest in you', icon: <FiUsers className="text-emerald-400" /> },
            ].map((item, i) => (
              <div key={i} className="bg-black p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-zinc-600 font-mono">{item.step}</span>
                  {item.icon}
                </div>
                <h4 className="text-sm font-bold uppercase tracking-tight mb-1">{item.title}</h4>
                <p className="text-zinc-500 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Supported Platforms */}
        <div className="bg-black border border-zinc-800 mb-8">
          <div className="bg-zinc-900/50 px-4 py-3 border-b border-zinc-800">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Supported_Platforms</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-800">
            {[
              { name: 'YouTube', icon: <FiYoutube className="text-red-500 text-2xl" />, desc: 'Videos, Shorts, Live' },
              { name: 'TikTok', icon: <FaTiktok className="text-white text-2xl" />, desc: 'Short-form videos' },
              { name: 'Instagram', icon: <FiInstagram className="text-pink-500 text-2xl" />, desc: 'Reels, Posts, Stories' },
              { name: 'Twitch', icon: <FaTwitch className="text-purple-500 text-2xl" />, desc: 'Live streaming' },
              { name: 'Spotify', icon: <FaSpotify className="text-green-500 text-2xl" />, desc: 'Podcasts, Music' },
              { name: 'Twitter/X', icon: <FiTwitter className="text-blue-400 text-2xl" />, desc: 'Threads, Spaces' },
              { name: 'Patreon', icon: <FaPatreon className="text-orange-500 text-2xl" />, desc: 'Memberships' },
              { name: 'Discord', icon: <FaDiscord className="text-indigo-400 text-2xl" />, desc: 'Communities' },
            ].map((platform, i) => (
              <div key={i} className="bg-black p-4 flex items-center gap-3">
                {platform.icon}
                <div>
                  <h4 className="text-sm font-bold">{platform.name}</h4>
                  <p className="text-zinc-500 text-[10px]">{platform.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex gap-4 justify-center flex-wrap pt-8 border-t border-zinc-800">
          <Link href="/developers" className="px-4 py-2 border border-zinc-800 text-zinc-500 hover:text-white hover:border-white text-xs uppercase tracking-wider transition-colors">
            Developers
          </Link>
          <Link href="/founders" className="px-4 py-2 border border-zinc-800 text-zinc-500 hover:text-white hover:border-white text-xs uppercase tracking-wider transition-colors">
            Founders
          </Link>
          <Link href="/exchange" className="px-4 py-2 border border-zinc-800 text-zinc-500 hover:text-white hover:border-white text-xs uppercase tracking-wider transition-colors">
            Exchange
          </Link>
          <Link href="/mint" className="px-4 py-2 border border-zinc-800 text-zinc-500 hover:text-white hover:border-white text-xs uppercase tracking-wider transition-colors">
            Mint Tokens
          </Link>
        </div>
      </motion.section>
    </motion.div>
  );
}
