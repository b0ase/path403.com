'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowRight, FiExternalLink, FiFolder, FiGithub, FiGlobe } from 'react-icons/fi';
import { FaRocket, FaCode, FaDatabase, FaCubes } from 'react-icons/fa';
import { portfolioData } from '@/lib/data';
import { createClient } from '@/lib/supabase/client';

interface DatabaseProject {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  url: string | null;
  status: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  'Live': 'text-green-500',
  'Demo': 'text-blue-500',
  'Concept': 'text-yellow-500',
  'LTD': 'text-purple-500',
  'Development': 'text-orange-500',
};

const STATUS_ICONS: Record<string, typeof FaRocket> = {
  'Live': FaRocket,
  'Demo': FaCode,
  'Concept': FaCubes,
  'LTD': FaDatabase,
};

export default function ProjectsPage() {
  const [dbProjects, setDbProjects] = useState<DatabaseProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Get static projects from portfolioData
  const staticProjects = portfolioData.projects;

  // Fetch database projects
  useEffect(() => {
    async function fetchProjects() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, slug, description, url, status, created_at')
        .neq('status', 'pending_setup')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setDbProjects(data);
      }
      setLoading(false);
    }
    fetchProjects();
  }, []);

  // Get unique statuses for filter
  const allStatuses = [...new Set([
    ...staticProjects.map(p => p.status),
    ...dbProjects.map(p => p.status || 'Unknown')
  ])].filter(Boolean);

  // Filter projects
  const filteredStaticProjects = activeFilter === 'all'
    ? staticProjects
    : staticProjects.filter(p => p.status === activeFilter);

  const filteredDbProjects = activeFilter === 'all'
    ? dbProjects
    : dbProjects.filter(p => p.status === activeFilter);

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
        {/* Header */}
        <motion.div
          className="mb-12 border-b border-gray-800 pb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
            <div className="flex gap-2 self-start">
              <div className="bg-gray-900/50 p-4 md:p-6 border border-gray-800">
                <FiFolder className="text-2xl md:text-4xl text-red-500" />
              </div>
              <div className="bg-gray-900/50 p-4 md:p-6 border border-gray-800">
                <FiFolder className="text-2xl md:text-4xl text-orange-500" />
              </div>
              <div className="bg-gray-900/50 p-4 md:p-6 border border-gray-800">
                <FiFolder className="text-2xl md:text-4xl text-yellow-500" />
              </div>
              <div className="bg-gray-900/50 p-4 md:p-6 border border-gray-800">
                <FiFolder className="text-2xl md:text-4xl text-green-500" />
              </div>
              <div className="bg-gray-900/50 p-4 md:p-6 border border-gray-800">
                <FiFolder className="text-2xl md:text-4xl text-blue-500" />
              </div>
            </div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                PROJECTS
              </h1>
              <div className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-widest">
                PORTFOLIO
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-gray-400 max-w-2xl">
              Explore our portfolio of projects spanning blockchain applications, web platforms,
              AI integrations, and decentralized systems. Each project represents innovation in action.
            </p>
            <div className="flex gap-4">
              <Link
                href="/projects/new"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold border border-zinc-700 text-zinc-300 hover:text-white hover:border-white transition-colors whitespace-nowrap"
              >
                Start Project <FiArrowRight size={14} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold hover:opacity-80 transition-colors whitespace-nowrap"
                style={{ backgroundColor: '#fff', color: '#000' }}
              >
                Discuss Ideas <FiArrowRight size={14} />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="border border-gray-800 p-4">
            <div className="text-3xl font-bold text-white">{staticProjects.length}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Total Projects</div>
          </div>
          <div className="border border-gray-800 p-4">
            <div className="text-3xl font-bold text-green-500">
              {staticProjects.filter(p => p.status === 'Live').length}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Live</div>
          </div>
          <div className="border border-gray-800 p-4">
            <div className="text-3xl font-bold text-blue-500">
              {staticProjects.filter(p => p.status === 'Demo').length}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Demos</div>
          </div>
          <div className="border border-gray-800 p-4">
            <div className="text-3xl font-bold text-yellow-500">
              {staticProjects.filter(p => p.status === 'Concept').length}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Concepts</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${activeFilter === 'all'
              ? 'bg-white text-black'
              : 'border border-gray-800 text-gray-500 hover:text-white hover:border-gray-600'
              }`}
          >
            All
          </button>
          {allStatuses.map(status => (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${activeFilter === status
                ? 'bg-white text-black'
                : 'border border-gray-800 text-gray-500 hover:text-white hover:border-gray-600'
                }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Portfolio Projects Grid */}
        <div className="mb-16">
          <h3 className="text-xl font-bold uppercase tracking-tight mb-6 text-gray-400">
            Portfolio Projects
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStaticProjects.map((project, index) => {
              const StatusIcon = STATUS_ICONS[project.status] || FaCubes;
              return (
                <Link
                  key={project.id}
                  href={`/portfolio/${project.slug}`}
                  className="group border border-gray-800 hover:border-gray-600 bg-black transition-all overflow-hidden"
                >
                  {/* Project Image */}
                  {project.cardImageUrls?.[0] && (
                    <div className="h-32 bg-gray-900 overflow-hidden">
                      <img
                        src={project.cardImageUrls[0]}
                        alt={project.title}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <StatusIcon className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                      <span className={`text-[10px] uppercase tracking-wider ${STATUS_COLORS[project.status] || 'text-gray-500'}`}>
                        {project.status}
                      </span>
                    </div>
                    <h4 className="font-bold uppercase tracking-tight mb-1 text-white group-hover:text-zinc-300 transition-colors text-sm">
                      {project.title}
                    </h4>
                    <p className="text-gray-600 text-xs line-clamp-2 mb-3">{project.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {project.liveUrl && (
                          <FiGlobe className="w-3 h-3 text-gray-600" />
                        )}
                        {project.githubUrl && project.githubUrl !== '#' && (
                          <FiGithub className="w-3 h-3 text-gray-600" />
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-700 group-hover:text-white transition-colors flex items-center gap-1">
                        View <FiArrowRight className="text-[10px]" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {filteredStaticProjects.length > 24 && (
            <div className="mt-6 text-center">
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white transition-colors text-sm"
              >
                View All {filteredStaticProjects.length} Projects <FiArrowRight />
              </Link>
            </div>
          )}
        </div>

        {/* Community Projects from Database */}
        {dbProjects.length > 0 && (
          <div className="mb-16">
            <h3 className="text-xl font-bold uppercase tracking-tight mb-6 text-gray-400">
              Community Projects
            </h3>
            {loading ? (
              <div className="text-gray-500 text-sm">Loading projects...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDbProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.slug || project.id}`}
                    className="group p-6 border border-gray-800 hover:border-gray-600 bg-black transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <FiFolder className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" />
                      <span className={`text-xs uppercase tracking-wider ${STATUS_COLORS[project.status || ''] || 'text-gray-500'}`}>
                        {project.status || 'Active'}
                      </span>
                    </div>
                    <h4 className="font-bold uppercase tracking-tight mb-2 text-white group-hover:text-zinc-300 transition-colors">
                      {project.name}
                    </h4>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {project.description || 'Client project in progress'}
                    </p>
                    <div className="flex items-center justify-between">
                      {project.url && (
                        <FiExternalLink className="w-4 h-4 text-gray-600" />
                      )}
                      <span className="text-xs text-zinc-600 group-hover:text-white transition-colors flex items-center gap-1 ml-auto">
                        View details <FiArrowRight className="text-[10px]" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="border border-gray-800 p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2 text-white">
                Have a project idea?
              </h3>
              <p className="text-gray-400">
                From concept to deployment, let's build something exceptional together.
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/gigs"
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-800 text-gray-500 text-sm hover:border-gray-600 hover:text-white transition-colors whitespace-nowrap"
              >
                View Gigs
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                Start Building <FiArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
