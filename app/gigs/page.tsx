'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FiSearch, FiTwitter, FiYoutube, FiInstagram, FiLinkedin,
  FiTrendingUp, FiZap, FiCode, FiMail, FiTarget,
  FiHeadphones, FiGlobe, FiFileText, FiBarChart2, FiLayout,
  FiTool, FiHome, FiBriefcase, FiUsers
} from 'react-icons/fi';
import { FaTiktok, FaDiscord, FaTelegram, FaReddit, FaPodcast } from 'react-icons/fa';
import { SiNotion, SiZapier } from 'react-icons/si';

interface Gig {
  id: string;
  title: string;
  description: string;
  category: string;
  payRange: string;
  frequency: 'One-time' | 'Weekly' | 'Monthly' | 'Ongoing' | 'Per Deliverable';
  commitment: string;
  requirements: string[];
  icon: React.ReactNode;
  hot?: boolean;
  type: 'offered' | 'wanted';
}

// Sample offered gigs (hiring)
const OFFERED_GIGS: Gig[] = [
  {
    id: 'twitter-manager',
    title: 'Twitter/X Content Manager',
    description: 'Manage our Twitter presence. Create engaging threads, respond to mentions, grow followers.',
    category: 'Social Media',
    payRange: '£300-500/mo',
    frequency: 'Monthly',
    commitment: '10-15 hrs/week',
    requirements: ['Crypto/tech audience', 'Strong writing'],
    icon: <FiTwitter className="text-blue-400 text-xl" />,
    hot: true,
    type: 'offered',
  },
  {
    id: 'automation-builder',
    title: 'Automation Specialist',
    description: 'Build automations using n8n, Zapier, or Make. Connect tools and improve efficiency.',
    category: 'Technical',
    payRange: '£40-80/hr',
    frequency: 'Ongoing',
    commitment: '5-15 hrs/week',
    requirements: ['n8n/Zapier/Make', 'API integration'],
    icon: <SiZapier className="text-orange-400 text-xl" />,
    hot: true,
    type: 'offered',
  },
  {
    id: 'seo-specialist',
    title: 'SEO Content Writer',
    description: 'Write SEO-optimized blog posts about AI, crypto, startups, and tech.',
    category: 'Marketing',
    payRange: '£50-150/article',
    frequency: 'Per Deliverable',
    commitment: '2-4 articles/week',
    requirements: ['SEO knowledge', 'Crypto/AI understanding'],
    icon: <FiTrendingUp className="text-green-400 text-xl" />,
    hot: true,
    type: 'offered',
  },
];

// Sample wanted gigs (looking for work)
const WANTED_GIGS: Gig[] = [
  {
    id: 'fullstack-dev-wanted',
    title: 'Full Stack Developer Available',
    description: 'Experienced Next.js/React developer looking for contract work. BSV/crypto experience.',
    category: 'Technical',
    payRange: '£50-80/hr',
    frequency: 'Ongoing',
    commitment: '20-40 hrs/week',
    requirements: ['Available immediately', 'Remote preferred'],
    icon: <FiCode className="text-green-400 text-xl" />,
    type: 'wanted',
  },
  {
    id: 'video-editor-wanted',
    title: 'Video Editor Seeking Projects',
    description: 'YouTube content creator specialist. Thumbnails, editing, motion graphics.',
    category: 'Creative',
    payRange: '£30-60/hr',
    frequency: 'Per Deliverable',
    commitment: 'Flexible',
    requirements: ['Portfolio available', 'Quick turnaround'],
    icon: <FiYoutube className="text-red-500 text-xl" />,
    type: 'wanted',
  },
];

const ALL_GIGS = [...OFFERED_GIGS, ...WANTED_GIGS];
const CATEGORIES = ['All', 'Social Media', 'Technical', 'Marketing', 'Creative', 'Community', 'Research'];

export default function GigsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGigs = ALL_GIGS.filter(gig => {
    const matchesCategory = selectedCategory === 'All' || gig.category === selectedCategory;
    const matchesSearch = gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gig.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const offeredGigs = filteredGigs.filter(g => g.type === 'offered');
  const wantedGigs = filteredGigs.filter(g => g.type === 'wanted');

  return (
    <>
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            type="text"
            placeholder="Search all gigs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black border border-zinc-800 pl-10 pr-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                selectedCategory === category
                  ? 'bg-white text-black'
                  : 'border border-zinc-800 text-zinc-500 hover:text-white hover:border-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4 text-xs mb-8">
        <div className="border border-zinc-800 px-3 py-2">
          <span className="text-zinc-500">Hiring:</span> <span className="text-green-400 font-bold">{offeredGigs.length}</span>
        </div>
        <div className="border border-zinc-800 px-3 py-2">
          <span className="text-zinc-500">Looking for Work:</span> <span className="text-blue-400 font-bold">{wantedGigs.length}</span>
        </div>
        <div className="border border-zinc-800 px-3 py-2">
          <span className="text-zinc-500">Payment:</span> <span className="text-white font-bold">Any Currency</span>
        </div>
      </div>

      {/* Offered Gigs Section */}
      {offeredGigs.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiBriefcase className="text-green-400" />
              <h2 className="text-lg font-bold uppercase tracking-tight">We're Hiring</h2>
              <span className="text-xs text-zinc-500">({offeredGigs.length})</span>
            </div>
            <Link href="/gigs/offered" className="text-xs text-zinc-500 hover:text-white">
              View all →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offeredGigs.slice(0, 3).map((gig) => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>
        </div>
      )}

      {/* Wanted Gigs Section */}
      {wantedGigs.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiUsers className="text-blue-400" />
              <h2 className="text-lg font-bold uppercase tracking-tight">Looking for Work</h2>
              <span className="text-xs text-zinc-500">({wantedGigs.length})</span>
            </div>
            <Link href="/gigs/wanted" className="text-xs text-zinc-500 hover:text-white">
              View all →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wantedGigs.slice(0, 3).map((gig) => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {filteredGigs.length === 0 && (
        <div className="text-center py-16 border border-zinc-800">
          <p className="text-zinc-500 mb-4">No gigs found matching your search.</p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
            className="text-white hover:underline text-sm"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* CTA Sections */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Link href="/gigs/offered" className="bg-black border border-zinc-800 p-6 hover:border-green-500/50 transition-colors group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-500/10 border border-green-500/30 flex items-center justify-center">
              <FiBriefcase className="text-green-400" />
            </div>
            <div>
              <h3 className="font-bold uppercase tracking-tight">Post a Gig</h3>
              <p className="text-xs text-zinc-500">Hire freelancers for your project</p>
            </div>
          </div>
          <p className="text-zinc-500 text-sm">Find talented people to help with social media, content, development, and more.</p>
        </Link>

        <Link href="/gigs/wanted" className="bg-black border border-zinc-800 p-6 hover:border-blue-500/50 transition-colors group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <FiUsers className="text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold uppercase tracking-tight">Find Work</h3>
              <p className="text-xs text-zinc-500">Post your skills and availability</p>
            </div>
          </div>
          <p className="text-zinc-500 text-sm">Let companies know you're available for freelance gigs in the crypto/AI space.</p>
        </Link>
      </div>

      {/* Footer Links */}
      <div className="flex gap-4 justify-center flex-wrap pt-8 border-t border-zinc-800">
        <Link href="/services" className="px-4 py-2 border border-zinc-800 text-zinc-500 hover:text-white hover:border-white text-xs uppercase tracking-wider transition-colors">
          Services
        </Link>
        <Link href="/developers" className="px-4 py-2 border border-zinc-800 text-zinc-500 hover:text-white hover:border-white text-xs uppercase tracking-wider transition-colors">
          Developers
        </Link>
        <Link href="/" className="px-4 py-2 border border-zinc-800 text-zinc-500 hover:text-white hover:border-white text-xs uppercase tracking-wider transition-colors flex items-center gap-2">
          <FiHome size={12} />
          Home
        </Link>
      </div>
    </>
  );
}

function GigCard({ gig }: { gig: Gig }) {
  const isOffered = gig.type === 'offered';

  return (
    <div
      className={`bg-black border p-5 hover:bg-zinc-900/50 transition-colors ${
        gig.hot ? 'border-yellow-500/30' : 'border-zinc-800'
      }`}
    >
      <div className="flex items-start gap-3 mb-3">
        {gig.icon}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold uppercase tracking-tight text-white truncate">{gig.title}</h3>
            {gig.hot && <span className="text-[9px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 uppercase shrink-0">Hot</span>}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] px-1.5 py-0.5 border ${isOffered ? 'border-green-500/30 text-green-400' : 'border-blue-500/30 text-blue-400'}`}>
              {isOffered ? 'Hiring' : 'Available'}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 border border-zinc-700 text-zinc-500">
              {gig.category}
            </span>
          </div>
        </div>
      </div>

      <p className="text-zinc-500 text-xs line-clamp-2 mb-3">{gig.description}</p>

      <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
        <div>
          <p className="text-sm font-bold text-green-400">{gig.payRange}</p>
          <p className="text-[10px] text-zinc-600">{gig.commitment}</p>
        </div>
        <Link
          href={isOffered ? `/apply/${gig.id}` : `/gigs/wanted#${gig.id}`}
          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
            isOffered
              ? 'bg-white text-black hover:bg-zinc-200'
              : 'bg-blue-600 text-white hover:bg-blue-500'
          }`}
        >
          {isOffered ? 'Apply' : 'Contact'}
        </Link>
      </div>
    </div>
  );
}
