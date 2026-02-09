'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiLayers, FiCode, FiGitBranch, FiArrowRight } from 'react-icons/fi'

// Actual portfolio projects with codebases we can map
const portfolioProjects = [
  {
    id: 'ninja-punk-girls',
    title: 'Ninja Punk Girls',
    description: 'NFT platform with 70+ API routes, marketplace, minting, and 3D viewer',
    stack: ['Next.js 14', 'Prisma', 'Supabase', 'BSV', 'Three.js'],
    codebasePath: '/Volumes/2026/Projects/ninja-punk-girls-com',
    status: 'mapped',
    routes: 70,
    components: 86
  },
  {
    id: 'zerodice',
    title: 'Zero Dice',
    description: 'Provably fair blockchain dice gaming platform',
    stack: ['Next.js', 'BSV', 'Supabase'],
    codebasePath: '/Volumes/2026/Projects/zerodice',
    status: 'ready',
    routes: null,
    components: null
  },
  {
    id: 'audex',
    title: 'Audex',
    description: 'Audio exchange platform for decentralized music distribution',
    stack: ['Next.js', 'BSV', 'Supabase'],
    codebasePath: '/Volumes/2026/Projects/audex',
    status: 'ready',
    routes: null,
    components: null
  },
  {
    id: 'oneshotcomics',
    title: 'OneShot Comics',
    description: 'Digital comic book publishing and reading platform',
    stack: ['Next.js', 'BSV'],
    codebasePath: '/Volumes/2026/Projects/oneshotcomics-bsv',
    status: 'ready',
    routes: null,
    components: null
  },
  {
    id: 'osinka-kalaso',
    title: 'Osinka Kalaso',
    description: 'Virtual world and gaming environment',
    stack: ['Next.js', 'Three.js'],
    codebasePath: '/Volumes/2026/Projects/osinka-kalaso',
    status: 'ready',
    routes: null,
    components: null
  },
  {
    id: 'vexvoid',
    title: 'VexVoid',
    description: 'Future-tech fashion brand AV client',
    stack: ['Next.js'],
    codebasePath: '/Volumes/2026/Projects/vexvoid-AV-client',
    status: 'ready',
    routes: null,
    components: null
  },
  {
    id: 'b0ase',
    title: 'b0ase.com',
    description: 'This venture studio platform - 500+ API routes, 100+ models',
    stack: ['Next.js 16', 'Prisma', 'Supabase', 'BSV'],
    codebasePath: '/Volumes/2026/Projects/b0ase.com',
    status: 'ready',
    routes: 500,
    components: 200
  }
]

export default function SchematicsIndex() {
  const [filter, setFilter] = useState<'all' | 'mapped' | 'ready'>('all')

  const filteredProjects = filter === 'all'
    ? portfolioProjects
    : portfolioProjects.filter(p => p.status === filter)

  return (
    <motion.div
      className="min-h-screen bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <section className="px-4 md:px-8 py-16">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-6">
            <div className="bg-zinc-900/50 p-6 border border-zinc-800 self-start">
              <FiLayers className="text-5xl text-zinc-500" />
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                SCHEMATICS
              </h1>
              <p className="text-zinc-500 text-sm uppercase tracking-widest mt-2">
                Codebase Architecture Mapper
              </p>
            </div>
          </div>

          <p className="text-zinc-400 max-w-2xl">
            Interactive software architecture diagrams for portfolio projects.
            Map codebases, visualize data flows, and document technical decisions.
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8 border-b border-zinc-800 pb-2">
          {(['all', 'mapped', 'ready'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 capitalize transition-all ${
                filter === status
                  ? 'border-b-2 border-white text-white font-semibold'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              {status === 'mapped' ? 'Mapped' : status === 'ready' ? 'Ready to Map' : 'All'}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                href={`/schematics/${project.id}`}
                className="block border border-zinc-800 bg-zinc-900/30 rounded-xl p-6 hover:border-zinc-600 hover:bg-zinc-900/60 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FiCode className="text-zinc-600 group-hover:text-white transition-colors" />
                    <h2 className="text-lg font-bold group-hover:text-white transition-colors">
                      {project.title}
                    </h2>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    project.status === 'mapped'
                      ? 'bg-green-900/50 text-green-400 border border-green-800'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                  }`}>
                    {project.status === 'mapped' ? 'Mapped' : 'Ready'}
                  </span>
                </div>

                <p className="text-zinc-500 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>

                {/* Stack */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.stack.slice(0, 4).map(tech => (
                    <span
                      key={tech}
                      className="text-[10px] px-2 py-1 bg-zinc-800 text-zinc-400 rounded font-mono"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                {(project.routes || project.components) && (
                  <div className="flex gap-4 text-xs text-zinc-600">
                    {project.routes && (
                      <span className="flex items-center gap-1">
                        <FiGitBranch size={12} />
                        {project.routes} routes
                      </span>
                    )}
                    {project.components && (
                      <span>{project.components} components</span>
                    )}
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2 text-xs text-zinc-600 group-hover:text-white transition-colors">
                  Open in Editor <FiArrowRight size={12} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-12 p-8 rounded-xl bg-zinc-900/50 border border-zinc-800">
          <h3 className="text-lg font-bold mb-2">About Schematics</h3>
          <p className="text-zinc-400 text-sm mb-4">
            Schematics uses tldraw to create interactive software architecture diagrams.
            Each project's codebase can be analyzed and mapped to visualize:
          </p>
          <ul className="text-zinc-500 text-sm space-y-1 ml-4 list-disc">
            <li>Frontend components and page structure</li>
            <li>API routes and endpoints</li>
            <li>Database models and relationships</li>
            <li>External service integrations</li>
            <li>Data flow between layers</li>
          </ul>
        </div>
      </section>
    </motion.div>
  )
}
