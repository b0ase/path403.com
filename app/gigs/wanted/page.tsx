'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FiSearch, FiTwitter, FiYoutube, FiInstagram, FiLinkedin,
  FiCode, FiEdit3, FiCamera, FiHeadphones, FiGlobe,
  FiBarChart2, FiDatabase, FiSmartphone, FiServer, FiPlus,
  FiMail, FiMessageCircle, FiCheckCircle, FiClock
} from 'react-icons/fi';
import { FaDiscord, FaPython, FaReact, FaNodeJs, FaAws } from 'react-icons/fa';
import { SiSolidity, SiTypescript, SiNextdotjs } from 'react-icons/si';

interface WantedGig {
  id: string;
  name: string;
  title: string;
  description: string;
  category: string;
  rateRange: string;
  availability: string;
  skills: string[];
  icon: React.ReactNode;
  verified?: boolean;
  portfolio?: string;
}

// People looking for work
const WANTED_GIGS: WantedGig[] = [
  {
    id: 'fullstack-dev-01',
    name: 'Alex M.',
    title: 'Full Stack Developer',
    description: 'Experienced Next.js/React developer with 5+ years experience. BSV blockchain integration, TypeScript, Node.js. Available for contract work.',
    category: 'Technical',
    rateRange: '£50-80/hr',
    availability: '20-40 hrs/week',
    skills: ['Next.js', 'TypeScript', 'BSV', 'Node.js'],
    icon: <SiNextdotjs className="text-white text-xl" />,
    verified: true,
    portfolio: 'github.com/example',
  },
  {
    id: 'solidity-dev-01',
    name: 'Jordan K.',
    title: 'Smart Contract Developer',
    description: 'Solidity & EVM specialist. Built DeFi protocols and NFT marketplaces. Auditing experience. Available for short-term contracts.',
    category: 'Technical',
    rateRange: '£80-120/hr',
    availability: '10-20 hrs/week',
    skills: ['Solidity', 'EVM', 'DeFi', 'Security Audits'],
    icon: <SiSolidity className="text-gray-400 text-xl" />,
    verified: true,
  },
  {
    id: 'video-editor-01',
    name: 'Sam T.',
    title: 'Video Editor & Motion Graphics',
    description: 'YouTube content specialist. Thumbnails, full video editing, motion graphics, and short-form clips for social.',
    category: 'Creative',
    rateRange: '£30-60/hr',
    availability: 'Flexible',
    skills: ['Premiere Pro', 'After Effects', 'Thumbnails', 'YouTube'],
    icon: <FiYoutube className="text-red-500 text-xl" />,
    portfolio: 'youtube.com/example',
  },
  {
    id: 'social-manager-01',
    name: 'Riley P.',
    title: 'Social Media Manager',
    description: 'Crypto-native social media manager. Grown multiple accounts to 50k+. Twitter, Discord, and Telegram specialist.',
    category: 'Social Media',
    rateRange: '£25-45/hr',
    availability: '15-30 hrs/week',
    skills: ['Twitter/X', 'Discord', 'Community Building', 'Content Strategy'],
    icon: <FiTwitter className="text-blue-400 text-xl" />,
    verified: true,
  },
  {
    id: 'python-dev-01',
    name: 'Morgan L.',
    title: 'Python Developer & Data Engineer',
    description: 'Python specialist with data engineering focus. Built scrapers, APIs, and automation tools. ML/AI experience.',
    category: 'Technical',
    rateRange: '£45-70/hr',
    availability: '20-30 hrs/week',
    skills: ['Python', 'FastAPI', 'Data Engineering', 'ML Basics'],
    icon: <FaPython className="text-yellow-400 text-xl" />,
  },
  {
    id: 'copywriter-01',
    name: 'Casey R.',
    title: 'Crypto Copywriter',
    description: 'Writes for DeFi protocols, NFT projects, and Web3 startups. Landing pages, whitepapers, and social content.',
    category: 'Marketing',
    rateRange: '£40-80/hr',
    availability: '10-25 hrs/week',
    skills: ['Web3 Copy', 'Whitepapers', 'Landing Pages', 'SEO'],
    icon: <FiEdit3 className="text-purple-400 text-xl" />,
  },
  {
    id: 'community-mod-01',
    name: 'Taylor S.',
    title: 'Community Moderator',
    description: 'Experienced Discord and Telegram moderator. Built communities from 0 to 10k. Familiar with bots and automation.',
    category: 'Community',
    rateRange: '£15-25/hr',
    availability: '20-40 hrs/week',
    skills: ['Discord', 'Telegram', 'Bot Setup', 'Moderation'],
    icon: <FaDiscord className="text-indigo-400 text-xl" />,
  },
  {
    id: 'designer-01',
    name: 'Jamie W.',
    title: 'UI/UX & Brand Designer',
    description: 'Product designer with Web3 focus. Figma expert. Created brands for multiple crypto startups.',
    category: 'Creative',
    rateRange: '£50-90/hr',
    availability: '15-25 hrs/week',
    skills: ['Figma', 'Brand Design', 'UI/UX', 'Web3'],
    icon: <FiSmartphone className="text-pink-400 text-xl" />,
    verified: true,
    portfolio: 'dribbble.com/example',
  },
  {
    id: 'devops-01',
    name: 'Chris B.',
    title: 'DevOps & Cloud Engineer',
    description: 'AWS/GCP certified. Kubernetes, Docker, CI/CD pipelines. Available for infrastructure setup and maintenance.',
    category: 'Technical',
    rateRange: '£60-100/hr',
    availability: '10-20 hrs/week',
    skills: ['AWS', 'Kubernetes', 'Docker', 'CI/CD'],
    icon: <FaAws className="text-orange-400 text-xl" />,
    verified: true,
  },
  {
    id: 'researcher-01',
    name: 'Drew M.',
    title: 'Crypto Researcher & Analyst',
    description: 'Deep research into tokenomics, market trends, and competitor analysis. Clear reports with actionable insights.',
    category: 'Research',
    rateRange: '£35-55/hr',
    availability: '15-25 hrs/week',
    skills: ['Market Research', 'Tokenomics', 'Reports', 'Data Analysis'],
    icon: <FiBarChart2 className="text-cyan-400 text-xl" />,
  },
  {
    id: 'vibe-tutor-01',
    name: 'Available Tutors',
    title: 'Vibe-Coding Tutor',
    description: 'Experienced tutors available for 1:1 sessions. Help with Claude Code, Cursor, Next.js, BSV integration, and AI-assisted development.',
    category: 'Tutoring',
    rateRange: '$50/hr',
    availability: 'Flexible',
    skills: ['Claude Code', 'Next.js', 'BSV', 'AI Development'],
    icon: <FiCode className="text-green-400 text-xl" />,
    verified: true,
    portfolio: 'b0ase.com/tutors',
  },
];

const CATEGORIES = ['All', 'Tutoring', 'Technical', 'Creative', 'Social Media', 'Marketing', 'Community', 'Research'];

export default function WantedGigsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGigs = WANTED_GIGS.filter(gig => {
    const matchesCategory = selectedCategory === 'All' || gig.category === selectedCategory;
    const matchesSearch = gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gig.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gig.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const verifiedCount = WANTED_GIGS.filter(g => g.verified).length;

  return (
    <>
      {/* Intro Banner */}
      <div className="bg-zinc-900/50 border border-blue-500/30 p-4 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <FiCheckCircle className="text-blue-400" />
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Verified Freelancers Available</span>
        </div>
        <p className="text-zinc-400 text-sm">
          Browse talented freelancers in the crypto/AI space. Verified profiles have completed identity checks.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            type="text"
            placeholder="Search skills, roles..."
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
              className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${selectedCategory === category
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
          <span className="text-zinc-500">Available:</span> <span className="text-blue-400 font-bold">{filteredGigs.length}</span>
        </div>
        <div className="border border-zinc-800 px-3 py-2">
          <span className="text-zinc-500">Verified:</span> <span className="text-green-400 font-bold">{verifiedCount}</span>
        </div>
        <div className="border border-zinc-800 px-3 py-2">
          <span className="text-zinc-500">Payment:</span> <span className="text-white font-bold">Any Currency</span>
        </div>
      </div>

      {/* Freelancers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {filteredGigs.map((gig) => (
          <div
            key={gig.id}
            id={gig.id}
            className={`bg-black border p-5 hover:bg-zinc-900/50 transition-colors ${gig.verified ? 'border-blue-500/30' : 'border-zinc-800'}`}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-zinc-900 border border-zinc-700 flex items-center justify-center rounded-full shrink-0">
                {gig.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-white">{gig.name}</h3>
                  {gig.verified && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 uppercase shrink-0 flex items-center gap-1">
                      <FiCheckCircle size={8} /> Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400">{gig.title}</p>
              </div>
            </div>

            <p className="text-zinc-500 text-xs line-clamp-2 mb-3">{gig.description}</p>

            {/* Skills */}
            <div className="flex flex-wrap gap-1 mb-3">
              {gig.skills.map((skill, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400">
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <div>
                <p className="text-sm font-bold text-green-400">{gig.rateRange}</p>
                <div className="flex items-center gap-1 text-[10px] text-zinc-600">
                  <FiClock size={10} />
                  {gig.availability}
                </div>
              </div>
              <Link
                href={`/contact?hire=${gig.id}&name=${encodeURIComponent(gig.name)}&role=${encodeURIComponent(gig.title)}`}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-500 transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredGigs.length === 0 && (
        <div className="text-center py-16 border border-zinc-800 mb-8">
          <p className="text-zinc-500 mb-4">No freelancers found matching your search.</p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
            className="text-white hover:underline text-sm"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Post Your Profile */}
      <div className="bg-black border border-blue-500/30 p-8 text-center mb-8">
        <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
          <FiPlus className="text-blue-400 text-xl" />
        </div>
        <h2 className="text-xl font-bold uppercase tracking-tight mb-2">List Your Skills</h2>
        <p className="text-zinc-500 text-sm mb-6 max-w-lg mx-auto">
          Looking for work in the crypto/AI space? Add your profile to get discovered by projects.
        </p>
        <Link
          href="/contact?subject=List%20My%20Skills"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-bold uppercase tracking-wider text-sm hover:bg-blue-500 transition-colors"
        >
          Add Your Profile
        </Link>
      </div>

      {/* What We Look For */}
      <div className="bg-black border border-zinc-800 mb-8">
        <div className="bg-zinc-900/50 px-4 py-3 border-b border-zinc-800">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">What_Projects_Look_For</span>
        </div>
        <div className="grid md:grid-cols-3 gap-px bg-zinc-800">
          {[
            { title: 'Crypto Native', desc: 'Understanding of Web3, tokens, and blockchain' },
            { title: 'Self-Starter', desc: 'Can work independently with minimal oversight' },
            { title: 'Fast Communicator', desc: 'Responsive on Discord, Telegram, or Slack' },
            { title: 'Portfolio Ready', desc: 'Can show examples of previous work' },
            { title: 'Flexible Payment', desc: 'Comfortable with GBP or crypto payments' },
            { title: 'Remote Pro', desc: 'Experience working async across timezones' },
          ].map((item, i) => (
            <div key={i} className="bg-black p-4">
              <h4 className="text-sm font-bold uppercase tracking-tight mb-1">{item.title}</h4>
              <p className="text-zinc-500 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
