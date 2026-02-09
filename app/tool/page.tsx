'use client';

import React, { useState } from 'react';
import {
  FaWrench, FaCogs, FaCube, FaCode, FaDatabase, FaPuzzlePiece,
  FaSearch, FaFilter, FaExternalLinkAlt, FaGithub, FaNpm, FaDocker,
  FaAws, FaGoogle, FaMicrosoft, FaApple, FaLinux, FaWindows,
  FaReact, FaNodeJs, FaPython, FaJava, FaPhp, FaRust,
  FaBitcoin, FaEthereum, FaDatabase as FaMongo, FaServer
} from 'react-icons/fa';
import { SiTypescript, SiJavascript, SiNextdotjs, SiSupabase, SiVercel, SiTailwindcss, SiPrisma, SiPostgresql, SiMysql, SiRedis, SiGraphql, SiApollographql } from 'react-icons/si';
import { portfolioData } from '@/lib/data';
import Image from 'next/image';

const BoaseIcon = ({ className }: { className?: string }) => (
  <div className={`relative w-[1em] h-[1em] inline-block ${className || ''}`}>
    <Image
      src="/boase_logo_white.png"
      alt="Boase"
      fill
      className="object-contain"
    />
  </div>
);

const toolCategories = [
  {
    id: 'development',
    name: 'Development Tools',
    icon: FaCode,
    color: 'from-blue-500 to-cyan-500',
    tools: [
      { name: 'Cursor', icon: FaCode, description: 'AI-powered code editor', url: 'https://cursor.sh' },
      { name: 'VS Code', icon: FaCode, description: 'Popular code editor', url: 'https://code.visualstudio.com' },
      { name: 'GitHub Desktop', icon: FaGithub, description: 'Git GUI client', url: 'https://desktop.github.com' },
      { name: 'Git', icon: FaGithub, description: 'Version control system', url: 'https://git-scm.com' },
      { name: 'Terminal', icon: FaCode, description: 'Command line interface', url: null },
      { name: 'Xcode', icon: FaApple, description: 'iOS development IDE', url: 'https://developer.apple.com/xcode' },
      { name: 'Docker Desktop', icon: FaDocker, description: 'Containerization platform', url: 'https://www.docker.com/products/docker-desktop' },
    ]
  },
  {
    id: 'frameworks',
    name: 'Frameworks & Libraries',
    icon: FaCogs,
    color: 'from-purple-500 to-pink-500',
    tools: [
      { name: 'Next.js', icon: SiNextdotjs, description: 'React framework', url: 'https://nextjs.org' },
      { name: 'React', icon: FaReact, description: 'UI library', url: 'https://reactjs.org' },
      { name: 'TypeScript', icon: SiTypescript, description: 'Typed JavaScript', url: 'https://www.typescriptlang.org' },
      { name: 'JavaScript', icon: SiJavascript, description: 'Programming language', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
      { name: 'Node.js', icon: FaNodeJs, description: 'Runtime environment', url: 'https://nodejs.org' },
      { name: 'Tailwind CSS', icon: SiTailwindcss, description: 'Utility-first CSS', url: 'https://tailwindcss.com' },
      { name: 'Prisma', icon: SiPrisma, description: 'Database ORM', url: 'https://www.prisma.io' },
    ]
  },
  {
    id: 'databases',
    name: 'Databases & Storage',
    icon: FaDatabase,
    color: 'from-green-500 to-emerald-500',
    tools: [
      { name: 'Supabase', icon: SiSupabase, description: 'Backend as a service', url: 'https://supabase.com' },
      { name: 'PostgreSQL', icon: SiPostgresql, description: 'Relational database', url: 'https://www.postgresql.org' },
      { name: 'MySQL', icon: SiMysql, description: 'Relational database', url: 'https://www.mysql.com' },
      { name: 'MongoDB', icon: FaMongo, description: 'NoSQL database', url: 'https://www.mongodb.com' },
      { name: 'Redis', icon: SiRedis, description: 'In-memory cache', url: 'https://redis.io' },
      { name: 'TablePlus', icon: FaDatabase, description: 'Database GUI', url: 'https://tableplus.com' },
    ]
  },
  {
    id: 'cloud',
    name: 'Cloud & DevOps',
    icon: FaServer,
    color: 'from-orange-500 to-red-500',
    tools: [
      { name: 'Vercel', icon: BoaseIcon, description: 'Deployment platform', url: 'https://vercel.com' },
      { name: 'AWS', icon: FaAws, description: 'Cloud services', url: 'https://aws.amazon.com' },
      { name: 'Docker', icon: FaDocker, description: 'Containerization', url: 'https://www.docker.com' },
      { name: 'GitHub Actions', icon: FaGithub, description: 'CI/CD', url: 'https://github.com/features/actions' },
      { name: 'Jenkins', icon: FaServer, description: 'CI/CD server', url: 'https://jenkins.io' },
      { name: 'Terraform', icon: FaServer, description: 'Infrastructure as code', url: 'https://www.terraform.io' },
      { name: 'Kubernetes', icon: FaServer, description: 'Container orchestration', url: 'https://kubernetes.io' },
    ]
  },
  {
    id: 'blockchain',
    name: 'Blockchain & Web3',
    icon: FaBitcoin,
    color: 'from-yellow-500 to-orange-500',
    tools: [
      { name: 'Bitcoin SV', icon: FaBitcoin, description: 'Bitcoin blockchain', url: 'https://bitcoinsv.io' },
      { name: 'Ethereum', icon: FaEthereum, description: 'Smart contract platform', url: 'https://ethereum.org' },
      { name: 'Solana', icon: FaEthereum, description: 'High-performance blockchain', url: 'https://solana.com' },
      { name: 'Web3.js', icon: FaEthereum, description: 'Ethereum JavaScript API', url: 'https://web3js.org' },
      { name: 'Hardhat', icon: FaEthereum, description: 'Ethereum development environment', url: 'https://hardhat.org' },
      { name: 'Metamask', icon: FaEthereum, description: 'Crypto wallet', url: 'https://metamask.io' },
    ]
  },
  {
    id: 'design',
    name: 'Design & Creative',
    icon: FaPuzzlePiece,
    color: 'from-pink-500 to-rose-500',
    tools: [
      { name: 'Figma', icon: FaPuzzlePiece, description: 'Design tool', url: 'https://figma.com' },
      { name: 'Photoshop', icon: FaPuzzlePiece, description: 'Image editing', url: 'https://www.adobe.com/products/photoshop.html' },
      { name: 'Miro', icon: FaPuzzlePiece, description: 'Collaborative whiteboard', url: 'https://miro.com' },
    ]
  },
  {
    id: 'communication',
    name: 'Communication & Collaboration',
    icon: FaCube,
    color: 'from-indigo-500 to-blue-500',
    tools: [
      { name: 'Slack', icon: FaCube, description: 'Team communication', url: 'https://slack.com' },
      { name: 'Discord', icon: FaCube, description: 'Community platform', url: 'https://discord.com' },
      { name: 'Zoom', icon: FaCube, description: 'Video conferencing', url: 'https://zoom.us' },
      { name: 'Notion', icon: FaCube, description: 'Workspace tool', url: 'https://notion.so' },
      { name: 'Trello', icon: FaCube, description: 'Project management', url: 'https://trello.com' },
      { name: 'Jira', icon: FaCube, description: 'Project tracking', url: 'https://www.atlassian.com/software/jira' },
      { name: 'Asana', icon: FaCube, description: 'Team collaboration', url: 'https://asana.com' },
    ]
  },
  {
    id: 'monitoring',
    name: 'Monitoring & Analytics',
    icon: FaDatabase,
    color: 'from-teal-500 to-cyan-500',
    tools: [
      { name: 'Grafana', icon: FaDatabase, description: 'Monitoring platform', url: 'https://grafana.com' },
      { name: 'Prometheus', icon: FaDatabase, description: 'Metrics collection', url: 'https://prometheus.io' },
      { name: 'Datadog', icon: FaDatabase, description: 'Monitoring service', url: 'https://www.datadoghq.com' },
      { name: 'Sentry', icon: FaDatabase, description: 'Error tracking', url: 'https://sentry.io' },
    ]
  }
];

export default function ToolsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  const filteredCategories = toolCategories.filter(category =>
    selectedCategory === 'all' || category.id === selectedCategory
  );

  const filteredTools = filteredCategories.flatMap(category =>
    category.tools.filter(tool =>
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
              <FaPuzzlePiece className="text-3xl text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Development Arsenal
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
            Our comprehensive toolkit powers every project, from blockchain development to AI applications.
            Explore the technologies that drive innovation.
          </p>

          {/* Search and Filter */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tools, frameworks, or technologies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
              >
                All Tools
              </button>
              {toolCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Category Sections */}
          {filteredCategories.map(category => {
            const categoryTools = category.tools.filter(tool =>
              tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              tool.description.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (categoryTools.length === 0) return null;

            return (
              <div key={category.id} className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <div className={`p-3 bg-gradient-to-r ${category.color} rounded-xl`}>
                    <category.icon className="text-2xl text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">{category.name}</h2>
                  <span className="text-gray-400 text-lg">({categoryTools.length})</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {categoryTools.map(tool => (
                    <div
                      key={tool.name}
                      className="group relative bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-gray-600 hover:bg-gray-800/50 transition-all duration-300 backdrop-blur-sm"
                      onMouseEnter={() => setHoveredTool(tool.name)}
                      onMouseLeave={() => setHoveredTool(null)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors">
                            <tool.icon className="text-xl text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                              {tool.name}
                            </h3>
                            <p className="text-sm text-gray-400">{tool.description}</p>
                          </div>
                        </div>
                        {tool.url && (
                          <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-blue-400"
                          >
                            <FaExternalLinkAlt className="text-sm" />
                          </a>
                        )}
                      </div>

                      {hoveredTool === tool.name && tool.url && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl border border-blue-500/30 flex items-center justify-center">
                          <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                          >
                            Visit {tool.name}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredTools.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-300 mb-2">No tools found</h3>
              <p className="text-gray-500">Try adjusting your search terms or category filter</p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-20 bg-gradient-to-r from-gray-900/50 to-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {toolCategories.length}
              </div>
              <div className="text-gray-400">Categories</div>
            </div>
            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {toolCategories.flatMap(c => c.tools).length}
              </div>
              <div className="text-gray-400">Total Tools</div>
            </div>
            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {toolCategories.flatMap(c => c.tools).filter(t => t.url).length}
              </div>
              <div className="text-gray-400">External Links</div>
            </div>
            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="text-3xl font-bold text-yellow-400 mb-2">
                24/7
              </div>
              <div className="text-gray-400">Availability</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 