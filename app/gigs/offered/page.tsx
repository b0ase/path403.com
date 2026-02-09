'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FiSearch, FiTwitter, FiYoutube, FiInstagram, FiLinkedin,
  FiTrendingUp, FiZap, FiCode, FiMail, FiTarget,
  FiHeadphones, FiGlobe, FiFileText, FiBarChart2, FiLayout,
  FiTool, FiMessageCircle, FiVideo, FiUsers, FiPlus
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
}

const OFFERED_GIGS: Gig[] = [
  // Social Media & Content
  {
    id: 'twitter-manager',
    title: 'Twitter/X Content Manager',
    description: 'Manage our Twitter presence. Create engaging threads, respond to mentions, grow followers, and maintain consistent posting schedule. Crypto/AI/tech focus.',
    category: 'Social Media',
    payRange: '£300-500/mo',
    frequency: 'Monthly',
    commitment: '10-15 hrs/week',
    requirements: ['Crypto/tech audience understanding', 'Strong writing skills', 'Engagement growth experience'],
    icon: <FiTwitter className="text-blue-400 text-xl" />,
    hot: true,
  },
  {
    id: 'linkedin-growth',
    title: 'LinkedIn Growth Specialist',
    description: 'Build our B2B presence on LinkedIn. Create thought leadership content, engage with potential clients, and generate leads for our services.',
    category: 'Social Media',
    payRange: '£250-400/mo',
    frequency: 'Monthly',
    commitment: '8-12 hrs/week',
    requirements: ['B2B marketing experience', 'Professional network', 'Content writing skills'],
    icon: <FiLinkedin className="text-blue-600 text-xl" />,
  },
  {
    id: 'tiktok-creator',
    title: 'TikTok Creator',
    description: 'Create viral short-form content about AI, crypto, startups, and tech. Showcase our products and services in engaging, trend-aware formats.',
    category: 'Social Media',
    payRange: '£50-150/video',
    frequency: 'Per Deliverable',
    commitment: '2-4 videos/week',
    requirements: ['Video editing skills', 'Trend awareness', 'Tech/crypto interest'],
    icon: <FaTiktok className="text-pink-400 text-xl" />,
    hot: true,
  },
  {
    id: 'instagram-manager',
    title: 'Instagram Content Manager',
    description: 'Manage Instagram with Reels, Stories, and posts. Visual storytelling for our portfolio projects, services, and team culture.',
    category: 'Social Media',
    payRange: '£200-350/mo',
    frequency: 'Monthly',
    commitment: '6-10 hrs/week',
    requirements: ['Visual design sense', 'Reels creation', 'Hashtag strategy'],
    icon: <FiInstagram className="text-pink-500 text-xl" />,
  },
  {
    id: 'youtube-editor',
    title: 'YouTube Video Editor',
    description: 'Edit tutorial videos, product demos, and thought leadership content. Create thumbnails, add captions, and optimize for engagement.',
    category: 'Content',
    payRange: '£75-200/video',
    frequency: 'Per Deliverable',
    commitment: '2-3 videos/week',
    requirements: ['Premiere/DaVinci skills', 'Thumbnail design', 'YouTube best practices'],
    icon: <FiYoutube className="text-red-500 text-xl" />,
  },
  // Community Management
  {
    id: 'discord-mod',
    title: 'Discord Community Manager',
    description: 'Build and moderate our Discord server. Welcome new members, answer questions, organize events, and keep conversations active and spam-free.',
    category: 'Community',
    payRange: '£200-400/mo',
    frequency: 'Monthly',
    commitment: '15-20 hrs/week',
    requirements: ['Discord experience', 'Crypto/AI knowledge', 'Moderation skills'],
    icon: <FaDiscord className="text-indigo-400 text-xl" />,
  },
  {
    id: 'telegram-admin',
    title: 'Telegram Group Admin',
    description: 'Manage Telegram community for $BOASE token holders. Share updates, moderate discussions, and maintain engagement.',
    category: 'Community',
    payRange: '£150-300/mo',
    frequency: 'Monthly',
    commitment: '10-15 hrs/week',
    requirements: ['Telegram bots knowledge', 'Crypto community experience', 'Quick response time'],
    icon: <FaTelegram className="text-blue-400 text-xl" />,
  },
  {
    id: 'reddit-advocate',
    title: 'Reddit Community Builder',
    description: 'Grow presence on relevant subreddits. Create quality posts, engage authentically, and build reputation in crypto/AI/startup communities.',
    category: 'Community',
    payRange: '£100-250/mo',
    frequency: 'Monthly',
    commitment: '5-8 hrs/week',
    requirements: ['Aged Reddit account', 'Karma history', 'No shilling - authentic only'],
    icon: <FaReddit className="text-orange-500 text-xl" />,
  },
  // Technical & Automation
  {
    id: 'automation-builder',
    title: 'Automation Specialist',
    description: 'Build and maintain automations using n8n, Zapier, or Make. Connect our tools, automate workflows, and improve operational efficiency.',
    category: 'Technical',
    payRange: '£40-80/hr',
    frequency: 'Ongoing',
    commitment: '5-15 hrs/week',
    requirements: ['n8n/Zapier/Make experience', 'API integration skills', 'Documentation'],
    icon: <SiZapier className="text-orange-400 text-xl" />,
    hot: true,
  },
  {
    id: 'notion-architect',
    title: 'Notion Documentation Manager',
    description: 'Maintain and organize our Notion workspace. Document processes, create templates, and keep our knowledge base current.',
    category: 'Technical',
    payRange: '£25-50/hr',
    frequency: 'Ongoing',
    commitment: '3-8 hrs/week',
    requirements: ['Notion power user', 'Technical writing', 'Systems thinking'],
    icon: <SiNotion className="text-white text-xl" />,
  },
  {
    id: 'qa-tester',
    title: 'Website QA Tester',
    description: 'Test new features, find bugs, and ensure quality across our platforms. Document issues clearly with reproduction steps.',
    category: 'Technical',
    payRange: '£20-40/hr',
    frequency: 'Ongoing',
    commitment: '5-10 hrs/week',
    requirements: ['Attention to detail', 'Bug reporting experience', 'Multiple browsers/devices'],
    icon: <FiTool className="text-yellow-400 text-xl" />,
  },
  {
    id: 'api-integrator',
    title: 'API Integration Specialist',
    description: 'Connect third-party services and APIs to our platform. Build integrations for payments, analytics, CRM, and more.',
    category: 'Technical',
    payRange: '£50-100/hr',
    frequency: 'Ongoing',
    commitment: 'Project-based',
    requirements: ['REST/GraphQL APIs', 'JavaScript/TypeScript', 'Webhook experience'],
    icon: <FiCode className="text-green-400 text-xl" />,
  },
  // Marketing & Growth
  {
    id: 'seo-specialist',
    title: 'SEO Content Writer',
    description: 'Write SEO-optimized blog posts about AI, crypto, startups, and tech. Research keywords, create content briefs, and drive organic traffic.',
    category: 'Marketing',
    payRange: '£50-150/article',
    frequency: 'Per Deliverable',
    commitment: '2-4 articles/week',
    requirements: ['SEO knowledge', 'Research skills', 'Crypto/AI understanding'],
    icon: <FiTrendingUp className="text-green-400 text-xl" />,
    hot: true,
  },
  {
    id: 'newsletter-writer',
    title: 'Newsletter Writer',
    description: 'Write our weekly newsletter covering project updates, industry news, and insights. Engaging voice, clear formatting.',
    category: 'Marketing',
    payRange: '£75-150/issue',
    frequency: 'Weekly',
    commitment: '3-5 hrs/week',
    requirements: ['Email marketing experience', 'Engaging writing', 'Crypto/AI knowledge'],
    icon: <FiMail className="text-purple-400 text-xl" />,
  },
  {
    id: 'influencer-outreach',
    title: 'Influencer Outreach Coordinator',
    description: 'Find and connect with crypto/AI influencers for partnerships. Manage relationships, negotiate deals, and track campaign results.',
    category: 'Marketing',
    payRange: '£300-500/mo',
    frequency: 'Monthly',
    commitment: '10-15 hrs/week',
    requirements: ['Influencer marketing experience', 'Negotiation skills', 'CRM organization'],
    icon: <FiUsers className="text-cyan-400 text-xl" />,
  },
  {
    id: 'lead-gen',
    title: 'Lead Generation Specialist',
    description: 'Generate qualified leads for our services. Research prospects, craft outreach messages, and book discovery calls.',
    category: 'Marketing',
    payRange: '£25-50/qualified lead',
    frequency: 'Per Deliverable',
    commitment: 'Flexible',
    requirements: ['B2B outreach experience', 'LinkedIn/email expertise', 'CRM skills'],
    icon: <FiTarget className="text-red-400 text-xl" />,
  },
  // Creative & Design
  {
    id: 'meme-creator',
    title: 'Meme Lord',
    description: 'Create viral memes for our tokens and projects. Stay on top of crypto Twitter culture and make content that spreads.',
    category: 'Creative',
    payRange: '£10-30/meme',
    frequency: 'Per Deliverable',
    commitment: '5-10 memes/week',
    requirements: ['Crypto culture knowledge', 'Meme tools', 'Quick turnaround'],
    icon: <FiZap className="text-yellow-400 text-xl" />,
  },
  {
    id: 'thumbnail-designer',
    title: 'Thumbnail & Banner Designer',
    description: 'Design eye-catching thumbnails for YouTube, Twitter banners, and promotional graphics. Consistent brand aesthetic.',
    category: 'Creative',
    payRange: '£15-40/design',
    frequency: 'Per Deliverable',
    commitment: '5-10 designs/week',
    requirements: ['Figma/Photoshop', 'Typography skills', 'Brand consistency'],
    icon: <FiLayout className="text-blue-400 text-xl" />,
  },
  {
    id: 'motion-graphics',
    title: 'Motion Graphics Designer',
    description: 'Create animated graphics for social media, explainer videos, and promotional content. Clean, modern style.',
    category: 'Creative',
    payRange: '£100-300/project',
    frequency: 'Per Deliverable',
    commitment: 'Project-based',
    requirements: ['After Effects/Motion', 'Modern animation style', 'Quick iterations'],
    icon: <FiVideo className="text-purple-400 text-xl" />,
  },
  {
    id: 'podcast-editor',
    title: 'Podcast Editor',
    description: 'Edit podcast episodes. Clean audio, add intros/outros, create clips for social, and upload to platforms.',
    category: 'Creative',
    payRange: '£50-100/episode',
    frequency: 'Per Deliverable',
    commitment: '1-2 episodes/week',
    requirements: ['Audio editing (Audition/Logic)', 'Podcast platforms', 'Quick turnaround'],
    icon: <FaPodcast className="text-green-400 text-xl" />,
  },
  // Data & Research
  {
    id: 'market-researcher',
    title: 'Crypto Market Researcher',
    description: 'Research and report on crypto market trends, competitor analysis, and token performance. Weekly reports with actionable insights.',
    category: 'Research',
    payRange: '£200-400/mo',
    frequency: 'Monthly',
    commitment: '8-12 hrs/week',
    requirements: ['Crypto market knowledge', 'Data analysis', 'Report writing'],
    icon: <FiBarChart2 className="text-cyan-400 text-xl" />,
  },
  {
    id: 'competitor-analyst',
    title: 'Competitor Intelligence Analyst',
    description: 'Track competitor activities, product launches, and marketing strategies. Deliver monthly competitive landscape reports.',
    category: 'Research',
    payRange: '£150-300/report',
    frequency: 'Monthly',
    commitment: '6-10 hrs/report',
    requirements: ['Research skills', 'SaaS/crypto industry', 'Analytical mindset'],
    icon: <FiGlobe className="text-blue-400 text-xl" />,
  },
  {
    id: 'translator',
    title: 'Content Translator',
    description: 'Translate marketing content, documentation, and community updates. Spanish, Mandarin, Portuguese, or German priority.',
    category: 'Content',
    payRange: '£0.08-0.15/word',
    frequency: 'Per Deliverable',
    commitment: 'Flexible',
    requirements: ['Native fluency', 'Crypto terminology', 'Fast turnaround'],
    icon: <FiMessageCircle className="text-cyan-400 text-xl" />,
  },
  // Support & Operations
  {
    id: 'customer-support',
    title: 'Customer Support Agent',
    description: 'Handle support tickets and live chat. Help users with platform questions, troubleshoot issues, and escalate when needed.',
    category: 'Support',
    payRange: '£15-25/hr',
    frequency: 'Ongoing',
    commitment: '15-25 hrs/week',
    requirements: ['Support experience', 'Tech-savvy', 'Patient communicator'],
    icon: <FiHeadphones className="text-green-400 text-xl" />,
  },
  {
    id: 'va-assistant',
    title: 'Virtual Assistant',
    description: 'General admin support: email management, scheduling, research tasks, and coordination. Reliable and organized.',
    category: 'Support',
    payRange: '£12-20/hr',
    frequency: 'Ongoing',
    commitment: '10-20 hrs/week',
    requirements: ['Admin experience', 'Google Workspace', 'Excellent communication'],
    icon: <FiFileText className="text-gray-400 text-xl" />,
  },
  // Tutoring
  {
    id: 'vibe-coding-tutor',
    title: '1:1 Vibe-Coding Tutor',
    description: 'Provide personalized tutoring sessions for vibe-coders. Help with setup, debugging, code review, and AI-assisted development techniques.',
    category: 'Tutoring',
    payRange: '$50/hr',
    frequency: 'Ongoing',
    commitment: '5-20 hrs/week',
    requirements: ['Experience with Claude Code/Cursor', 'Next.js/React knowledge', 'Patient communicator'],
    icon: <FiUsers className="text-green-400 text-xl" />,
    hot: true,
  },
];

const CATEGORIES = ['All', 'Tutoring', 'Social Media', 'Community', 'Technical', 'Marketing', 'Creative', 'Research', 'Content', 'Support'];

export default function OfferedGigsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGigs = OFFERED_GIGS.filter(gig => {
    const matchesCategory = selectedCategory === 'All' || gig.category === selectedCategory;
    const matchesSearch = gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gig.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const hotGigs = OFFERED_GIGS.filter(g => g.hot);

  return (
    <>
      {/* Hot Gigs Banner */}
      {hotGigs.length > 0 && (
        <div className="bg-zinc-900/50 border border-yellow-500/30 p-4 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <FiZap className="text-yellow-400" />
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Hiring Now</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {hotGigs.map(gig => (
              <a
                key={gig.id}
                href={`#${gig.id}`}
                className="px-3 py-1.5 bg-black border border-yellow-500/30 text-yellow-400 text-xs hover:bg-yellow-500/10 transition-colors"
              >
                {gig.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            type="text"
            placeholder="Search gigs..."
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
          <span className="text-zinc-500">Open Positions:</span> <span className="text-green-400 font-bold">{filteredGigs.length}</span>
        </div>
        <div className="border border-zinc-800 px-3 py-2">
          <span className="text-zinc-500">Payment:</span> <span className="text-white font-bold">Any Currency</span>
        </div>
        <div className="border border-zinc-800 px-3 py-2">
          <span className="text-zinc-500">Location:</span> <span className="text-blue-400 font-bold">100% Remote</span>
        </div>
      </div>

      {/* Gigs Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {filteredGigs.map((gig) => (
          <div
            key={gig.id}
            id={gig.id}
            className={`bg-black border p-5 hover:bg-zinc-900/50 transition-colors ${gig.hot ? 'border-yellow-500/30' : 'border-zinc-800'}`}
          >
            <div className="flex items-start gap-3 mb-3">
              {gig.icon}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold uppercase tracking-tight text-white">{gig.title}</h3>
                  {gig.hot && <span className="text-[9px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 uppercase shrink-0">Hot</span>}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] px-1.5 py-0.5 border border-zinc-700 text-zinc-500">
                    {gig.category}
                  </span>
                  <span className="text-[10px] text-zinc-600">
                    {gig.frequency}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-zinc-500 text-xs line-clamp-2 mb-3">{gig.description}</p>

            <div className="space-y-1 mb-3">
              {gig.requirements.slice(0, 2).map((req, i) => (
                <div key={i} className="flex items-start gap-1 text-[10px] text-zinc-600">
                  <span>•</span> {req}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <div>
                <p className="text-sm font-bold text-green-400">{gig.payRange}</p>
                <p className="text-[10px] text-zinc-600">{gig.commitment}</p>
              </div>
              <Link
                href={`/apply/${gig.id}`}
                className="px-3 py-1.5 bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
              >
                Apply
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredGigs.length === 0 && (
        <div className="text-center py-16 border border-zinc-800 mb-8">
          <p className="text-zinc-500 mb-4">No gigs found matching your search.</p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
            className="text-white hover:underline text-sm"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Post Your Own */}
      <div className="bg-black border border-green-500/30 p-8 text-center mb-8">
        <div className="w-12 h-12 bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
          <FiPlus className="text-green-400 text-xl" />
        </div>
        <h2 className="text-xl font-bold uppercase tracking-tight mb-2">Post a Gig</h2>
        <p className="text-zinc-500 text-sm mb-6 max-w-lg mx-auto">
          Looking to hire? Post your gig and reach freelancers in the crypto/AI space.
        </p>
        <Link
          href="/contact?subject=Post%20a%20Gig"
          className="inline-block px-6 py-3 bg-green-500 text-black font-bold uppercase tracking-wider text-sm hover:bg-green-400 transition-colors"
        >
          Submit Gig
        </Link>
      </div>

      {/* How it works */}
      <div className="bg-black border border-zinc-800 mb-8">
        <div className="bg-zinc-900/50 px-4 py-3 border-b border-zinc-800">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">How_It_Works</span>
        </div>
        <div className="grid md:grid-cols-4 gap-px bg-zinc-800">
          {[
            { step: '01', title: 'Apply', desc: 'Click apply and tell us about yourself' },
            { step: '02', title: 'Chat', desc: 'Quick call to see if we\'re a fit' },
            { step: '03', title: 'Trial', desc: 'Paid trial task to test the waters' },
            { step: '04', title: 'Work', desc: 'Ongoing work with regular payments' },
          ].map((item, i) => (
            <div key={i} className="bg-black p-4">
              <span className="text-2xl font-bold text-zinc-700">{item.step}</span>
              <h4 className="text-sm font-bold uppercase tracking-tight mt-2 mb-1">{item.title}</h4>
              <p className="text-zinc-500 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
