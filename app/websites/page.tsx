'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { portfolioData, Project } from '@/lib/data';
import { generateTempPrice, generateTempChange } from '@/lib/token-pricing';
import { sortProjects } from '@/lib/utils';

import { FaExternalLinkAlt, FaGithub } from 'react-icons/fa';
import { FiGlobe, FiSearch, FiX } from 'react-icons/fi';

// Project video mapping - only load when needed
// SLUG IMAGES: All poster images are standardized at /images/slugs/{project-slug}.{ext}
// This provides a single, predictable location for all project slug images.
const projectVideos: Record<string, { video?: string; poster: string }> = {
  'minecraftparty-website': {
    video: '/images/clientprojects/minecraftparty-website/MINECRAFTPARTY.mp4',
    poster: '/images/slugs/minecraftparty-website.jpg'
  },
  'aigirlfriends-website': {
    video: '/images/clientprojects/aigirlfriends-website/AIGF.mp4',
    poster: '/images/slugs/aigirlfriends-website.jpg'
  },
  'vexvoid-com': {
    video: '/images/clientprojects/vexvoid-com/VEXVOID.mp4',
    poster: '/images/slugs/vexvoid-com.png'
  },
  'audex-website': {
    video: '/images/clientprojects/audex-website/AUDEX.mp4',
    poster: '/images/slugs/audex-website.png'
  },
  'npgx-website': {
    video: '/videos/NPGX.mp4',
    poster: '/images/slugs/npgx-website.jpg'
  },
  'zerodice-store': {
    video: '/videos/zero-dice-02.mp4',
    poster: '/images/slugs/zerodice-store.png'
  },
  'libertascoffee-store': {
    video: '/images/clientprojects/libertascoffee-store/LIBERTAS.mp4',
    poster: '/images/slugs/libertascoffee-store.jpg'
  },
  'beauty-queen-ai-com': {
    video: '/images/clientprojects/beauty-queen-ai-com/BEAUTY-QUEEN.mp4',
    poster: '/images/slugs/beauty-queen-ai-com.jpg'
  },
  'bsvapi-com': {
    video: '/images/clientprojects/bsvapi-com/BSV_API.mp4',
    poster: '/images/slugs/bsvapi-com.jpg'
  },
  'coursekings-website': {
    video: '/images/clientprojects/coursekings-website/COURSE-KINGS.mp4',
    poster: '/images/slugs/coursekings-website.png'
  },
  'metagraph-app': {
    video: '/images/clientprojects/metagraph-app/METAGRAPH.mp4',
    poster: '/images/slugs/metagraph-app.jpg'
  },
  'oneshotcomics': {
    video: '/images/clientprojects/one-shot-comics/oneshotcomics.mp4',
    poster: '/images/slugs/oneshotcomics.png'
  },
  'cashboard-website': {
    video: '/videos/cashboard.mp4',
    poster: '/images/slugs/cashboard-website.png'
  },
  'ninja-punk-girls-website': {
    video: '/images/clientprojects/ninjapunkgirls-website/npg-website-slug-video.mp4',
    poster: '/images/slugs/ninja-punk-girls-website.png'
  },
  'osinka-kalaso': {
    video: '/videos/osinka-kalaso-video.mp4',
    poster: '/images/slugs/osinka-kalaso.png'
  },
  'aivj-website': {
    video: '/images/clientprojects/aivj/AIVJ-video.mp4',
    poster: '/images/slugs/aivj-website.png'
  }
};

// Determine if project is open source based on project type
// Bitcoin apps (bitcoin-*) are OSS via bitcoin-apps-suite org
// EXCEPT: bitcoin-corp, bitcoin-apps (corporate properties)
// All other b0ase projects are commercial/private
const isProjectOpenSource = (project: Project): boolean => {
  const slug = project.slug;

  // Bitcoin apps are open source (on bitcoin-apps-suite org)
  // Exception: bitcoin-corp and bitcoin-apps are corporate properties
  if (slug.startsWith('bitcoin-')) {
    const corporateProperties = ['bitcoin-corp', 'bitcoin-apps'];
    return !corporateProperties.includes(slug);
  }

  // All other projects (b0ase commercial) are private
  return false;
};

// Clean project card - image on top, content below
function ProjectCard({ project }: { project: Project }) {
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoData = projectVideos[project.slug];
  const isOpenSource = isProjectOpenSource(project);
  const tokenSymbol = project.tokenName || `$${project.slug.split('-')[0].toUpperCase()}`;

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => { });
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, []);

  const getObjectPosition = (slug: string) => {
    switch (slug) {
      case 'coursekings-website':
      case 'libertascoffee-store':
        return 'center 70%';
      case 'zerodice-store':
        return 'center 20%';
      case 'ninja-punk-girls-website':
        return 'center 38%';
      default:
        return 'center center';
    }
  };

  return (
    <div
      className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-all duration-300 flex flex-col overflow-hidden group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image Section - Clean, no overlay */}
      <Link href={`/portfolio/${project.slug}`} className="relative h-32 block overflow-hidden">
        {videoData ? (
          <>
            <Image
              src={videoData.poster}
              alt={project.title}
              fill
              className={`object-cover transition-opacity duration-300 ${isHovering ? 'opacity-0' : 'opacity-100'}`}
              style={{ objectPosition: getObjectPosition(project.slug) }}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {isHovering && (
              <video
                ref={videoRef}
                src={videoData.video}
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: getObjectPosition(project.slug) }}
              />
            )}
          </>
        ) : project.cardImageUrls?.[0] ? (
          <Image
            src={project.cardImageUrls[0]}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
            <FiGlobe className="text-zinc-700" size={32} />
          </div>
        )}
      </Link>

      {/* Content Section - All info below image */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        {/* Title Row */}
        <div className="flex items-start justify-between gap-2">
          <Link href={`/portfolio/${project.slug}`} className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white truncate hover:text-zinc-300 transition-colors">
              {project.title}
            </h3>
          </Link>
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-white transition-colors shrink-0"
              title="Visit Live Site"
            >
              <FaExternalLinkAlt size={10} />
            </a>
          )}
        </div>

        {/* Badges Row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Token Badge - Always shown */}
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/30">
            {tokenSymbol}
          </span>

          {/* Open Source Badge */}
          {isOpenSource ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <FaGithub size={8} />
              OSS
            </a>
          ) : (
            <span className="text-[10px] px-1.5 py-0.5 bg-zinc-700/50 text-zinc-400 border border-zinc-600">
              Private
            </span>
          )}

          {/* Status Badge */}
          {project.status && (
            <span className={`text-[10px] px-1.5 py-0.5 border ${project.status === 'Live' || project.status === 'Production'
              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              : project.status === 'Beta' || project.status === 'Demo'
                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                : 'bg-zinc-700/50 text-zinc-400 border-zinc-600'
              }`}>
              {project.status}
            </span>
          )}
        </div>

        {/* Token Price */}
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="text-zinc-400">${generateTempPrice(tokenSymbol)}</span>
          <span className={generateTempChange(tokenSymbol).startsWith('+') ? 'text-green-400' : 'text-red-400'}>
            {generateTempChange(tokenSymbol)}
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
          <Link
            href={`/invest/${project.slug}`}
            className="flex-1 text-center text-[10px] font-bold uppercase tracking-wide py-1.5 bg-white text-black hover:bg-zinc-200 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Invest
          </Link>
          <Link
            href={`/portfolio/${project.slug}`}
            className="flex-1 text-center text-[10px] font-bold uppercase tracking-wide py-1.5 border border-zinc-600 text-zinc-300 hover:border-white hover:text-white transition-colors"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function WebsitesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const projects: Project[] = portfolioData.projects as Project[];
  const sortedProjects = sortProjects(projects).filter(p => p.slug !== 'coffeeguy-commerce-website');

  // Filter projects based on search query
  const filteredProjects = sortedProjects.filter(project => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      project.title.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      project.tokenName?.toLowerCase().includes(query) ||
      project.tech?.some(t => t.toLowerCase().includes(query)) ||
      project.status?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="relative z-10 pb-12 md:pb-16">
        {/* Hero Section */}
        <section className="px-4 md:px-8 py-16">
          <motion.div
            className="mb-12 border-b border-zinc-800 pb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row md:items-end gap-6 mb-6">
              <div className="bg-zinc-900/50 p-4 md:p-6 border border-zinc-800 self-start">
                <FiGlobe className="text-4xl md:text-6xl text-white" />
              </div>
              <div className="flex items-end gap-4">
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                  WEBSITES
                </h1>
                <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                  INVESTMENT_PIPELINE
                </div>
              </div>
            </div>

            <p className="text-zinc-400 max-w-2xl mb-6">
              Invest in web projects with automated contract execution. Your investment funds
              developer contracts, work is delivered via PRs, and equity is released on merge.
              Each project has its own token economy.
            </p>

            <div className="flex flex-wrap gap-3">
              {['Contract-Based Development', 'Escrow Protection', 'PR-Triggered Equity', 'Token Economy'].map((tag) => (
                <span key={tag} className="px-3 py-1.5 text-xs border border-zinc-700 text-zinc-400 hover:border-zinc-500 transition-colors">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Projects Grid */}
        <section className="px-4 md:px-8">
          {/* Header with Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-zinc-800 pb-4">
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">
              Projects ({filteredProjects.length}{searchQuery && ` / ${sortedProjects.length}`})
            </h2>

            {/* Search Bar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 md:w-64 pl-9 pr-8 py-2 bg-zinc-900 border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    <FiX size={14} />
                  </button>
                )}
              </div>
              <Link
                href="/pipeline"
                className="hidden sm:block text-xs text-orange-500 hover:text-orange-400 transition-colors uppercase tracking-wider"
              >
                Pipeline
              </Link>
              <Link
                href="/portfolio"
                className="hidden sm:block text-xs text-zinc-500 hover:text-white transition-colors uppercase tracking-wider"
              >
                Portfolio
              </Link>
            </div>
          </div>

          {/* Projects Grid */}
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-zinc-800">
              <FiSearch className="mx-auto text-zinc-600 mb-4" size={32} />
              <p className="text-zinc-400 mb-2">No projects found for "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-sm text-orange-500 hover:text-orange-400 transition-colors"
              >
                Clear search
              </button>
            </div>
          )}
        </section>

        {/* How It Works */}
        <section className="px-4 md:px-8 mt-16">
          <div className="border border-zinc-800 p-6 md:p-8">
            <h3 className="text-xl font-bold mb-6">How Investment Works</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <div className="text-2xl font-bold text-orange-500 mb-2">1</div>
                <h4 className="font-bold mb-1">Invest</h4>
                <p className="text-sm text-zinc-400">Choose a project and invest. Funds are held in escrow.</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-500 mb-2">2</div>
                <h4 className="font-bold mb-1">Contract Created</h4>
                <p className="text-sm text-zinc-400">Investment matches with roadmap contracts for developers.</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-500 mb-2">3</div>
                <h4 className="font-bold mb-1">Work Delivered</h4>
                <p className="text-sm text-zinc-400">Developers complete work, submit PRs. Payment released on completion.</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-500 mb-2">4</div>
                <h4 className="font-bold mb-1">Equity Released</h4>
                <p className="text-sm text-zinc-400">PR merged = tokens released to your wallet automatically.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 md:px-8 mt-8">
          <div className="border border-zinc-800 p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold mb-2">Want to build with us?</h3>
                <p className="text-zinc-400">Apply as a developer or propose a new project for the pipeline.</p>
              </div>
              <div className="flex gap-4">
                <Link
                  href="/pipeline"
                  className="px-6 py-3 border border-zinc-700 text-zinc-300 hover:border-white hover:text-white transition-colors text-sm font-bold uppercase"
                >
                  View Contracts
                </Link>
                <Link
                  href="/contact"
                  className="px-6 py-3 bg-white text-black hover:bg-zinc-200 transition-colors text-sm font-bold uppercase"
                >
                  Apply
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
