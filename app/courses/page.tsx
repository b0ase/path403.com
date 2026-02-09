'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  FiPlay, FiDownload, FiClock, FiUsers, FiStar, FiExternalLink,
  FiTerminal, FiCode, FiGitBranch, FiBox, FiShield, FiZap,
  FiDollarSign, FiArrowRight, FiCheck, FiLock, FiUnlock
} from 'react-icons/fi';
import { FaYoutube, FaGithub, FaDiscord } from 'react-icons/fa';
import { SiClaude } from 'react-icons/si';
import { useNavbar } from '@/components/NavbarProvider';

interface Course {
  id: string;
  module: number;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  lessons: number;
  level: 'Starter' | 'Builder' | 'Pro' | 'Expert';
  category: string;
  topics: string[];
  tools: string[];
  outcome: string;
  videoId?: string;
  comingSoon?: boolean;
  free?: boolean;
}

const courses: Course[] = [
  // MODULE 1: Getting Started
  {
    id: 'vibe-01-intro',
    module: 1,
    title: 'What is Vibe-Coding?',
    description: 'Introduction to the new paradigm of AI-assisted development. Learn how vibe-coders use AI tools to build faster, iterate quicker, and ship products without traditional coding barriers.',
    thumbnail: '/images/courses/vibe-intro.png',
    duration: '25 min',
    lessons: 4,
    level: 'Starter',
    category: 'Getting Started',
    topics: ['AI-First Development', 'The Kintsugi Philosophy', 'Token-Equity Model', 'Open Source Contribution'],
    tools: ['YouTube'],
    outcome: 'Understand the vibe-coding movement and how to earn while learning',
    videoId: 'intro-to-vibe-coding',
    free: true,
  },
  {
    id: 'vibe-02-claude-code',
    module: 1,
    title: 'Installing Claude Code',
    description: 'Step-by-step guide to installing Claude Code CLI - the AI coding assistant that powers the Kintsugi workflow. Learn terminal basics, authentication, and your first AI-assisted code generation.',
    thumbnail: '/images/courses/claude-code-install.png',
    duration: '35 min',
    lessons: 6,
    level: 'Starter',
    category: 'Getting Started',
    topics: ['Terminal Basics', 'Claude Code Installation', 'API Key Setup', 'First Commands', 'Understanding Responses'],
    tools: ['Claude Code', 'Terminal'],
    outcome: 'Have Claude Code running and generate your first AI-assisted code',
    videoId: 'install-claude-code',
    free: true,
  },
  {
    id: 'vibe-03-ide-setup',
    module: 1,
    title: 'Setting Up Your IDE',
    description: 'Connect Claude Code to modern AI-native IDEs like Cursor or Antigravity. Configure extensions, themes, and workflows for maximum productivity.',
    thumbnail: '/images/courses/ide-setup.png',
    duration: '40 min',
    lessons: 7,
    level: 'Starter',
    category: 'Getting Started',
    topics: ['Cursor IDE Setup', 'Antigravity Installation', 'VS Code Alternative', 'Extension Configuration', 'AI Integration'],
    tools: ['Cursor', 'Antigravity', 'VS Code'],
    outcome: 'Have a fully configured AI-native development environment',
    videoId: 'ide-setup-guide',
    free: true,
  },

  // MODULE 2: Development Fundamentals
  {
    id: 'vibe-04-git-basics',
    module: 2,
    title: 'Git & GitHub for Vibe-Coders',
    description: 'Learn Git version control the vibe-coder way. Clone repos, create branches, make commits, and submit pull requests - all with AI assistance.',
    thumbnail: '/images/courses/git-basics.png',
    duration: '50 min',
    lessons: 8,
    level: 'Starter',
    category: 'Dev Fundamentals',
    topics: ['Git Installation', 'Cloning Repos', 'Branching Strategy', 'Commits & Messages', 'Pull Requests', 'Code Review'],
    tools: ['Git', 'GitHub', 'Claude Code'],
    outcome: 'Confidently contribute to any open source project',
    videoId: 'git-for-vibe-coders',
  },
  {
    id: 'vibe-05-node-pnpm',
    module: 2,
    title: 'Node.js & Package Management',
    description: 'Install Node.js, understand npm vs pnpm, and manage dependencies like a pro. Learn why Kintsugi projects use pnpm and how to avoid common pitfalls.',
    thumbnail: '/images/courses/node-packages.png',
    duration: '45 min',
    lessons: 7,
    level: 'Starter',
    category: 'Dev Fundamentals',
    topics: ['Node.js Installation', 'npm vs pnpm', 'Package.json Deep Dive', 'Lock Files', 'Dependency Management', 'Scripts'],
    tools: ['Node.js', 'pnpm', 'npm'],
    outcome: 'Install and manage any JavaScript project dependencies',
    videoId: 'node-package-management',
  },
  {
    id: 'vibe-06-typescript',
    module: 2,
    title: 'TypeScript for AI-Assisted Dev',
    description: 'Why TypeScript makes AI coding better. Learn types, interfaces, and how strong typing helps Claude Code generate more accurate code.',
    thumbnail: '/images/courses/typescript-ai.png',
    duration: '60 min',
    lessons: 10,
    level: 'Builder',
    category: 'Dev Fundamentals',
    topics: ['Why TypeScript', 'Basic Types', 'Interfaces', 'Type Inference', 'AI + Types', 'Strict Mode'],
    tools: ['TypeScript', 'Claude Code'],
    outcome: 'Write type-safe code that AI understands better',
    videoId: 'typescript-for-ai',
  },

  // MODULE 3: The Kintsugi Network
  {
    id: 'vibe-07-kintsugi-intro',
    module: 3,
    title: 'The Kintsugi Network',
    description: 'Understanding the Kintsugi ecosystem - where developers and investors collaborate to build and fund projects. Learn the token-equity model and how contributions are rewarded.',
    thumbnail: '/images/courses/kintsugi-network.png',
    duration: '35 min',
    lessons: 5,
    level: 'Builder',
    category: 'Kintsugi',
    topics: ['Kintsugi Philosophy', 'Token-Equity Model', 'Project Pipeline', 'Funding Phases', 'Contributor Rewards'],
    tools: ['b0ase.com', 'Kintsugi Portal'],
    outcome: 'Understand how to earn tokens by contributing to projects',
    videoId: 'kintsugi-network-intro',
  },
  {
    id: 'vibe-08-first-contribution',
    module: 3,
    title: 'Your First Contribution',
    description: 'Walk through making your first contribution to a Kintsugi project. From finding issues to submitting PRs and receiving token rewards.',
    thumbnail: '/images/courses/first-contribution.png',
    duration: '55 min',
    lessons: 9,
    level: 'Builder',
    category: 'Kintsugi',
    topics: ['Finding Good First Issues', 'Understanding Codebases', 'Making Changes', 'Testing Locally', 'PR Best Practices', 'Token Rewards'],
    tools: ['GitHub', 'Claude Code', 'Kintsugi Portal'],
    outcome: 'Submit your first contribution and earn tokens',
    videoId: 'first-kintsugi-contribution',
  },
  {
    id: 'vibe-09-project-structure',
    module: 3,
    title: 'Kintsugi Project Structure',
    description: 'Deep dive into how Kintsugi projects are organized. Understand the standard folder structure, configuration files, and coding standards.',
    thumbnail: '/images/courses/project-structure.png',
    duration: '45 min',
    lessons: 7,
    level: 'Builder',
    category: 'Kintsugi',
    topics: ['Folder Structure', 'CLAUDE.md Guide', 'Configuration Files', 'Coding Standards', 'Pre-commit Hooks', 'Documentation'],
    tools: ['b0ase Standards', 'Claude Code'],
    outcome: 'Navigate any Kintsugi project with confidence',
    videoId: 'kintsugi-project-structure',
  },

  // MODULE 4: Building on Bitcoin
  {
    id: 'vibe-10-bitcoin-basics',
    module: 4,
    title: 'Bitcoin Development Basics',
    description: 'Introduction to building on Bitcoin. Understand UTXO, transactions, BSV-20 tokens, and why b0ase builds on Bitcoin SV.',
    thumbnail: '/images/courses/bitcoin-basics.png',
    duration: '50 min',
    lessons: 8,
    level: 'Builder',
    category: 'Blockchain',
    topics: ['Bitcoin Architecture', 'UTXO Model', 'BSV vs BTC', 'BSV-20 Tokens', 'On-chain Data', 'Micropayments'],
    tools: ['HandCash', '1sat.market'],
    outcome: 'Understand Bitcoin development fundamentals',
    videoId: 'bitcoin-dev-basics',
  },
  {
    id: 'vibe-11-handcash-integration',
    module: 4,
    title: 'HandCash Wallet Integration',
    description: 'Integrate HandCash authentication and payments into your apps. Build login flows, micropayments, and token transfers.',
    thumbnail: '/images/courses/handcash-integration.png',
    duration: '65 min',
    lessons: 10,
    level: 'Pro',
    category: 'Blockchain',
    topics: ['HandCash Connect', 'OAuth Flow', 'Payment Requests', 'Token Transfers', 'Webhooks', 'Error Handling'],
    tools: ['HandCash SDK', 'Next.js', 'Claude Code'],
    outcome: 'Build apps with Bitcoin authentication and payments',
    videoId: 'handcash-integration',
  },
  {
    id: 'vibe-12-token-creation',
    module: 4,
    title: 'Creating BSV-20 Tokens',
    description: 'Launch your own BSV-20 token. Learn token economics, minting, distribution, and listing on 1sat.market.',
    thumbnail: '/images/courses/token-creation.png',
    duration: '55 min',
    lessons: 8,
    level: 'Pro',
    category: 'Blockchain',
    topics: ['Token Economics', 'BSV-20 Standard', 'Minting Process', 'Distribution Strategy', '1sat.market Listing', 'Community Building'],
    tools: ['1sat.market', 'HandCash', 'Claude Code'],
    outcome: 'Launch and list your own BSV-20 token',
    videoId: 'create-bsv20-token',
  },

  // MODULE 5: Security & Quality
  {
    id: 'vibe-13-security-basics',
    module: 5,
    title: 'Security for Vibe-Coders',
    description: 'Essential security practices for AI-assisted development. Learn to spot vulnerabilities, handle secrets, and write secure code.',
    thumbnail: '/images/courses/security-basics.png',
    duration: '50 min',
    lessons: 8,
    level: 'Builder',
    category: 'Security',
    topics: ['OWASP Top 10', 'Secret Management', 'Input Validation', 'XSS Prevention', 'SQL Injection', 'Auth Best Practices'],
    tools: ['Claude Code', 'Security Scanner'],
    outcome: 'Write code that passes security audits',
    videoId: 'security-for-vibe-coders',
  },
  {
    id: 'vibe-14-shannon-audits',
    module: 5,
    title: 'Security Audits with Shannon',
    description: 'Use Shannon and other AI security tools to audit codebases. Learn to run scans, interpret results, and fix vulnerabilities.',
    thumbnail: '/images/courses/shannon-audits.png',
    duration: '60 min',
    lessons: 9,
    level: 'Pro',
    category: 'Security',
    topics: ['Shannon Setup', 'Running Scans', 'Interpreting Results', 'Fixing Vulnerabilities', 'CI/CD Integration', 'Reporting'],
    tools: ['Shannon', 'Claude Code', 'GitHub Actions'],
    outcome: 'Run professional security audits on any codebase',
    videoId: 'shannon-security-audits',
  },
  {
    id: 'vibe-15-pre-commit',
    module: 5,
    title: 'Pre-commit Hooks & CI/CD',
    description: 'Automate code quality with pre-commit hooks and CI/CD pipelines. Ensure every commit meets standards before it lands.',
    thumbnail: '/images/courses/pre-commit-cicd.png',
    duration: '45 min',
    lessons: 7,
    level: 'Pro',
    category: 'Security',
    topics: ['Pre-commit Hooks', 'Husky Setup', 'Lint-staged', 'GitHub Actions', 'Vercel Deployment', 'Quality Gates'],
    tools: ['Husky', 'GitHub Actions', 'Vercel'],
    outcome: 'Set up automated quality checks for any project',
    videoId: 'pre-commit-cicd',
  },

  // MODULE 6: Advanced Building
  {
    id: 'vibe-16-nextjs-apps',
    module: 6,
    title: 'Building Next.js Apps',
    description: 'Build production-ready Next.js applications the Kintsugi way. App Router, server components, API routes, and deployment.',
    thumbnail: '/images/courses/nextjs-apps.png',
    duration: '90 min',
    lessons: 14,
    level: 'Pro',
    category: 'Advanced',
    topics: ['App Router', 'Server Components', 'API Routes', 'Database Integration', 'Authentication', 'Deployment'],
    tools: ['Next.js', 'Vercel', 'Supabase', 'Claude Code'],
    outcome: 'Build and deploy full-stack web applications',
    videoId: 'building-nextjs-apps',
  },
  {
    id: 'vibe-17-ai-agents',
    module: 6,
    title: 'Building AI Agents',
    description: 'Create autonomous AI agents that can execute tasks, interact with APIs, and work within the Kintsugi ecosystem.',
    thumbnail: '/images/courses/ai-agents.png',
    duration: '75 min',
    lessons: 11,
    level: 'Expert',
    category: 'Advanced',
    topics: ['Agent Architecture', 'Tool Calling', 'Memory Systems', 'Task Scheduling', 'Blockchain Integration', 'Deployment'],
    tools: ['Claude API', 'b0ase Agent System', 'Claude Code'],
    outcome: 'Build and deploy autonomous AI agents',
    videoId: 'building-ai-agents',
    comingSoon: true,
  },
  {
    id: 'vibe-18-full-stack',
    module: 6,
    title: 'Full Kintsugi Stack',
    description: 'Master the complete Kintsugi tech stack. Build a full application from scratch with auth, payments, tokens, and AI features.',
    thumbnail: '/images/courses/full-stack.png',
    duration: '120 min',
    lessons: 18,
    level: 'Expert',
    category: 'Advanced',
    topics: ['Full Stack Architecture', 'Multi-chain Integration', 'AI Features', 'Token Systems', 'Marketplace Building', 'Scaling'],
    tools: ['Next.js', 'Supabase', 'HandCash', 'Claude Code'],
    outcome: 'Build complete Kintsugi-style applications',
    videoId: 'full-kintsugi-stack',
    comingSoon: true,
  },
];

const categories = ['All', 'Getting Started', 'Dev Fundamentals', 'Kintsugi', 'Blockchain', 'Security', 'Advanced'];
const levels = ['All Levels', 'Starter', 'Builder', 'Pro', 'Expert'];

const levelColors: Record<string, string> = {
  'Starter': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Builder': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Pro': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Expert': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

export default function CoursesPage() {
  const { isDark } = useNavbar();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All Levels' || course.level === selectedLevel;
    return matchesCategory && matchesLevel;
  });

  const moduleGroups = filteredCourses.reduce((acc, course) => {
    if (!acc[course.module]) acc[course.module] = [];
    acc[course.module].push(course);
    return acc;
  }, {} as Record<number, Course[]>);

  const moduleNames: Record<number, string> = {
    1: 'Getting Started',
    2: 'Development Fundamentals',
    3: 'The Kintsugi Network',
    4: 'Building on Bitcoin',
    5: 'Security & Quality',
    6: 'Advanced Building',
  };

  return (
    <motion.div
      className={`min-h-screen font-mono transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >

      {/* Hero Section */}
      <div className={`relative py-20 overflow-hidden ${isDark ? 'bg-gradient-to-br from-purple-900/50 via-black to-amber-900/30' : 'bg-gradient-to-br from-purple-100 via-white to-amber-100'}`}>
        <div className={`absolute inset-0 bg-[url('/grid.svg')] ${isDark ? 'opacity-10' : 'opacity-5'}`}></div>
        <div className="relative container mx-auto px-6">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6 ${isDark ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-amber-100 border border-amber-300 text-amber-700'}`}>
              <FiZap className="animate-pulse" />
              <span>Vibe-Coders Series</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
              <span className={isDark ? 'text-white' : 'text-black'}>LEARN TO</span> <span className={isDark ? 'text-amber-400' : 'text-amber-600'}>BUILD</span>
              <br />
              <span className={isDark ? 'text-purple-400' : 'text-purple-600'}>EARN</span> <span className={isDark ? 'text-white' : 'text-black'}>WHILE YOU CODE</span>
            </h1>
            <p className={`text-xl mb-8 leading-relaxed max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Free video courses teaching AI-assisted development on the Kintsugi network.
              Install tools, clone repos, fix bugs, build features — get paid in tokens.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <FaYoutube className="text-red-500 text-xl" />
                <span>@BO4SE Channel</span>
              </div>
              <div className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <FiTerminal className={isDark ? 'text-green-400' : 'text-green-600'} />
                <span>Hands-on Tutorials</span>
              </div>
              <div className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <FiDollarSign className={isDark ? 'text-amber-400' : 'text-amber-600'} />
                <span>Earn Token-Equity</span>
              </div>
            </div>
            {/* Quick Navigation Links */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href="#tools"
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${isDark ? 'bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30' : 'bg-purple-100 border border-purple-300 text-purple-700 hover:bg-purple-200'}`}
              >
                Tools You&apos;ll Master
              </a>
              <a
                href="#tutor"
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${isDark ? 'bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30' : 'bg-green-100 border border-green-300 text-green-700 hover:bg-green-200'}`}
              >
                Book a Tutor
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* YouTube CTA */}
      <div className={`border-y ${isDark ? 'bg-gradient-to-r from-red-900/30 to-red-800/20 border-red-500/20' : 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'}`}>
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <FaYoutube className="text-4xl text-red-500" />
              <div>
                <p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>Subscribe to @BO4SE on YouTube</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>New tutorials every week. Free forever.</p>
              </div>
            </div>
            <a
              href="https://youtube.com/@BO4SE"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
            >
              <FaYoutube />
              Subscribe Now
              <FiExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${selectedCategory === category
                  ? isDark ? 'bg-white text-black' : 'bg-black text-white'
                  : isDark ? 'border border-gray-800 text-gray-500 hover:text-white hover:border-white' : 'border border-gray-300 text-gray-600 hover:text-black hover:border-black'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Level Filter */}
          <div className="flex flex-wrap gap-2 md:ml-auto">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all ${selectedLevel === level
                  ? 'bg-purple-500 text-white'
                  : isDark ? 'border border-gray-800 text-gray-500 hover:text-white hover:border-purple-500' : 'border border-gray-300 text-gray-600 hover:text-purple-700 hover:border-purple-500'
                  }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <p className={`text-sm mb-8 ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
          {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} available
        </p>

        {/* Course Modules */}
        {Object.entries(moduleGroups).map(([moduleNum, moduleCourses]) => (
          <div key={moduleNum} className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-10 h-10 border flex items-center justify-center text-lg font-bold ${isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-100 border-gray-300 text-black'}`}>
                {moduleNum}
              </div>
              <div>
                <h2 className={`text-xl font-bold uppercase tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
                  Module {moduleNum}: {moduleNames[Number(moduleNum)]}
                </h2>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{moduleCourses.length} lessons</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {moduleCourses.map((course) => (
                <div
                  key={course.id}
                  className={`border rounded-lg overflow-hidden transition-all group hover:border-purple-500/50 ${isDark
                    ? `bg-gray-900/50 ${course.comingSoon ? 'border-gray-800 opacity-60' : 'border-gray-800'}`
                    : `bg-gray-50 ${course.comingSoon ? 'border-gray-200 opacity-60' : 'border-gray-200'}`
                    }`}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                    {/* Try to load actual thumbnail image */}
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        // Hide the image on error, fallback will show
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    {/* Fallback play/lock icon overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                      {course.comingSoon ? (
                        <FiLock className="text-4xl text-gray-400" />
                      ) : (
                        <FiPlay className="text-4xl text-white group-hover:scale-110 transition-transform" />
                      )}
                    </div>

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase border rounded ${levelColors[course.level]}`}>
                        {course.level}
                      </span>
                      {course.free && (
                        <span className="px-2 py-1 text-[10px] font-bold uppercase bg-green-500/20 text-green-400 border border-green-500/30 rounded">
                          Free
                        </span>
                      )}
                    </div>

                    {course.comingSoon && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">
                          Coming Soon
                        </span>
                      </div>
                    )}

                    {/* Duration */}
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 text-xs text-gray-300 rounded">
                      {course.duration}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className={`text-lg font-bold mb-2 group-hover:text-purple-400 transition-colors ${isDark ? 'text-white' : 'text-black'}`}>
                      {course.title}
                    </h3>
                    <p className={`text-sm line-clamp-2 mb-4 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                      {course.description}
                    </p>

                    {/* Tools */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {course.tools.slice(0, 3).map((tool) => (
                        <span key={tool} className={`px-2 py-0.5 text-[10px] rounded ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>
                          {tool}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className={`flex items-center justify-between text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                      <span>{course.lessons} lessons</span>
                      <button
                        onClick={() => !course.comingSoon && setSelectedCourse(course)}
                        disabled={course.comingSoon}
                        className={`flex items-center gap-1 font-bold uppercase tracking-wider ${course.comingSoon
                          ? isDark ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed'
                          : isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500'
                          }`}
                      >
                        {course.comingSoon ? 'Coming Soon' : 'Watch Now'}
                        {!course.comingSoon && <FiArrowRight size={12} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-4xl w-full my-8">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase border rounded ${levelColors[selectedCourse.level]}`}>
                      {selectedCourse.level}
                    </span>
                    {selectedCourse.free && (
                      <span className="px-2 py-1 text-[10px] font-bold uppercase bg-green-500/20 text-green-400 border border-green-500/30 rounded">
                        Free
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-white">{selectedCourse.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  {/* Video Placeholder */}
                  <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center mb-6 relative">
                    <FiPlay className="text-6xl text-purple-400" />
                    <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/80 text-sm rounded">
                      {selectedCourse.duration}
                    </div>
                  </div>

                  <p className="text-gray-400 mb-6">{selectedCourse.description}</p>

                  <h3 className="text-lg font-bold mb-4 text-white">What You'll Learn</h3>
                  <ul className="space-y-2 mb-6">
                    {selectedCourse.topics.map((topic, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-300 text-sm">
                        <FiCheck className="text-green-400 mt-0.5 flex-shrink-0" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
                    <div className="text-3xl font-bold text-purple-400 mb-2">
                      {selectedCourse.free ? 'FREE' : 'Coming Soon'}
                    </div>
                    <p className="text-gray-400 mb-6 text-sm">
                      {selectedCourse.free
                        ? 'Watch on YouTube - no sign up required'
                        : 'This course is being produced'}
                    </p>

                    <div className="space-y-3 mb-6 text-sm">
                      <div className="flex items-center gap-3 text-gray-300">
                        <FiClock className="text-purple-400" />
                        <span>{selectedCourse.duration} of content</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-300">
                        <FiPlay className="text-purple-400" />
                        <span>{selectedCourse.lessons} video lessons</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-300">
                        <FaYoutube className="text-red-500" />
                        <span>Available on YouTube</span>
                      </div>
                    </div>

                    <a
                      href={`https://youtube.com/@BO4SE`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg font-bold text-center transition-colors mb-4"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <FaYoutube />
                        Watch on YouTube
                      </span>
                    </a>

                    <p className="text-center text-xs text-gray-500">
                      Subscribe for new tutorials every week
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-4 text-white">Tools Used</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCourse.tools.map((tool) => (
                        <span key={tool} className="px-3 py-1.5 bg-gray-800 text-gray-300 text-sm rounded">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <h4 className="font-bold text-amber-400 mb-1">Outcome</h4>
                    <p className="text-sm text-gray-300">{selectedCourse.outcome}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1:1 Tutoring */}
      <div id="tutor" className={`container mx-auto px-6 py-16 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-4 ${isDark ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-green-100 border border-green-300 text-green-700'}`}>
                <FiUsers />
                <span>1:1 Sessions</span>
              </div>
              <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Book a Tutor</h2>
              <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Stuck on something? Need hands-on help getting set up? Book a 1:1 video call with a Kintsugi developer.
                We'll walk through your specific questions, debug issues together, and get you unstuck fast.
              </p>
              <ul className={`space-y-2 mb-6 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li className="flex items-center gap-2"><FiCheck className={isDark ? 'text-green-400' : 'text-green-600'} /> Environment setup & troubleshooting</li>
                <li className="flex items-center gap-2"><FiCheck className={isDark ? 'text-green-400' : 'text-green-600'} /> Code review & best practices</li>
                <li className="flex items-center gap-2"><FiCheck className={isDark ? 'text-green-400' : 'text-green-600'} /> Bitcoin/BSV development guidance</li>
                <li className="flex items-center gap-2"><FiCheck className={isDark ? 'text-green-400' : 'text-green-600'} /> AI-assisted coding workflows</li>
              </ul>
            </div>
            <div className={`rounded-lg p-6 text-center min-w-[280px] ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-gray-100 border border-gray-200'}`}>
              <p className={`text-5xl font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>$50</p>
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>per hour</p>
              <p className={`text-xs mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Via Zoom/Google Meet<br />Pay with card or crypto</p>
              <Link
                href="/book-a-tutor"
                className="block w-full bg-green-500 hover:bg-green-600 text-black py-3 rounded-lg font-bold transition-colors"
              >
                Book a Session
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* External Resources */}
      <div className={`container mx-auto px-6 py-16 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>External Resources</h2>
          <p className={`max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Learn from the best in the Bitcoin ecosystem. These courses and communities
            will help you master blockchain development.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* BSVA */}
          <a
            href="https://bitcoinsv.academy/"
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded-lg p-6 transition-all group ${isDark ? 'bg-gray-900/50 border border-gray-800 hover:border-orange-500/50' : 'bg-gray-50 border border-gray-200 hover:border-orange-400'}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDark ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                <span className={`font-bold text-lg ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>BSV</span>
              </div>
              <div>
                <h3 className={`font-bold transition-colors ${isDark ? 'text-white group-hover:text-orange-400' : 'text-black group-hover:text-orange-600'}`}>Bitcoin SV Academy</h3>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Official BSV Education</p>
              </div>
            </div>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Free courses on Bitcoin theory, development, and infrastructure. Get certified in Bitcoin fundamentals.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className={`px-2 py-1 text-[10px] rounded ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>Free Courses</span>
              <span className={`px-2 py-1 text-[10px] rounded ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>Certifications</span>
              <span className={`px-2 py-1 text-[10px] rounded ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>Theory + Practice</span>
            </div>
          </a>

          {/* Babbage */}
          <a
            href="https://docs.babbage.systems/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-blue-500/50 transition-all group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-blue-400 font-bold text-lg">B</span>
              </div>
              <div>
                <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">Babbage SDK</h3>
                <p className="text-xs text-gray-500">Build Bitcoin Apps</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Developer documentation for building Bitcoin applications. MetaNet protocol, overlays, and tooling.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-gray-800 text-[10px] text-gray-400 rounded">SDK Docs</span>
              <span className="px-2 py-1 bg-gray-800 text-[10px] text-gray-400 rounded">MetaNet</span>
              <span className="px-2 py-1 bg-gray-800 text-[10px] text-gray-400 rounded">Tutorials</span>
            </div>
          </a>

          {/* Project Babbage YouTube */}
          <a
            href="https://www.youtube.com/@ProjectBabbage"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-red-500/50 transition-all group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <FaYoutube className="text-red-400 text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-white group-hover:text-red-400 transition-colors">Babbage YouTube</h3>
                <p className="text-xs text-gray-500">Video Tutorials</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Video walkthroughs, conference talks, and developer tutorials from the Babbage team.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-gray-800 text-[10px] text-gray-400 rounded">Videos</span>
              <span className="px-2 py-1 bg-gray-800 text-[10px] text-gray-400 rounded">Walkthroughs</span>
              <span className="px-2 py-1 bg-gray-800 text-[10px] text-gray-400 rounded">Conf Talks</span>
            </div>
          </a>

          {/* HandCash Docs */}
          <a
            href="https://docs.handcash.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-green-500/50 transition-all group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <FiDollarSign className="text-green-400 text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-white group-hover:text-green-400 transition-colors">HandCash Connect</h3>
                <p className="text-xs text-gray-500">Payment Integration</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Integrate Bitcoin payments and auth into your apps. SDKs, webhooks, and API documentation.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-gray-800 text-[10px] text-gray-400 rounded">Payments</span>
              <span className="px-2 py-1 bg-gray-800 text-[10px] text-gray-400 rounded">OAuth</span>
              <span className="px-2 py-1 bg-gray-800 text-[10px] text-gray-400 rounded">SDK</span>
            </div>
          </a>

          {/* 1Sat Ordinals */}
          <a
            href="https://docs.1satordinals.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-amber-500/50 transition-all group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <span className="text-amber-400 font-bold text-lg">1S</span>
              </div>
              <div>
                <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors">1Sat Ordinals</h3>
                <p className="text-xs text-gray-500">BSV-20 Tokens & NFTs</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Learn to create and trade BSV-20 tokens, ordinals, and NFTs on Bitcoin SV.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-gray-800 text-[10px] text-gray-400 rounded">BSV-20</span>
              <span className="px-2 py-1 bg-gray-800 text-[10px] text-gray-400 rounded">Ordinals</span>
              <span className="px-2 py-1 bg-gray-800 text-[10px] text-gray-400 rounded">NFTs</span>
            </div>
          </a>

          {/* sCrypt */}
          <a
            href="https://docs.scrypt.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-purple-500/50 transition-all group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <FiCode className="text-purple-400 text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors">sCrypt</h3>
                <p className="text-xs text-gray-500">Smart Contracts</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Write smart contracts on Bitcoin. TypeScript-based contract language with full tooling.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-gray-800 text-[10px] text-gray-400 rounded">Contracts</span>
              <span className="px-2 py-1 bg-gray-800 text-[10px] text-gray-400 rounded">TypeScript</span>
              <span className="px-2 py-1 bg-gray-800 text-[10px] text-gray-400 rounded">Testing</span>
            </div>
          </a>
        </div>

        {/* Community Links */}
        <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 text-center">Join the Communities</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://atlantis-slack.babbage.systems/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/30 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" /></svg>
              Babbage Slack
            </a>
            <a
              href="https://discord.gg/bsv"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-400 hover:bg-indigo-500/30 transition-colors"
            >
              <FaDiscord className="text-lg" />
              BSV Discord
            </a>
            <a
              href="https://t.me/bitcoinsvdevs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
              BSV Devs Telegram
            </a>
            <a
              href="https://github.com/bitcoin-sv"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
            >
              <FaGithub className="text-lg" />
              BSV GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Kintsugi CTA */}
      <div className={`py-16 border-t ${isDark ? 'bg-gradient-to-r from-purple-900/50 to-amber-900/30 border-purple-500/20' : 'bg-gradient-to-r from-purple-100 to-amber-100 border-purple-200'}`}>
        <div className="container mx-auto px-6 text-center">
          <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Ready to Start Earning?</h2>
          <p className={`text-xl mb-8 max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Join the Kintsugi network. Pick a project, fix an issue, earn tokens.
            Your code contributions become equity in the things you build.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/pipeline"
              className={`flex items-center gap-2 px-8 py-4 rounded-lg font-bold transition-colors ${isDark ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-800'}`}
            >
              <FiCode />
              Browse Projects
            </Link>
            <Link
              href="/gigs"
              className={`flex items-center gap-2 border px-8 py-4 rounded-lg font-bold transition-colors ${isDark ? 'border-white text-white hover:bg-white hover:text-black' : 'border-black text-black hover:bg-black hover:text-white'}`}
            >
              <FiDollarSign />
              View Gigs
            </Link>
            <a
              href="https://discord.gg/b0ase"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 border px-8 py-4 rounded-lg font-bold transition-colors ${isDark ? 'border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white' : 'border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white'}`}
            >
              <FaDiscord />
              Join Discord
            </a>
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <div id="tools" className="container mx-auto px-6 py-16">
        <h2 className={`text-2xl font-bold mb-8 text-center ${isDark ? 'text-white' : 'text-black'}`}>Tools You&apos;ll Master</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { name: 'Claude Code', icon: FiTerminal, color: isDark ? 'text-amber-400' : 'text-amber-600' },
            { name: 'Cursor IDE', icon: FiCode, color: isDark ? 'text-blue-400' : 'text-blue-600' },
            { name: 'Git/GitHub', icon: FaGithub, color: isDark ? 'text-white' : 'text-black' },
            { name: 'Node.js/pnpm', icon: FiBox, color: isDark ? 'text-green-400' : 'text-green-600' },
            { name: 'Next.js', icon: FiZap, color: isDark ? 'text-white' : 'text-black' },
            { name: 'HandCash', icon: FiDollarSign, color: isDark ? 'text-green-400' : 'text-green-600' },
            { name: 'Supabase', icon: FiShield, color: isDark ? 'text-emerald-400' : 'text-emerald-600' },
            { name: 'Shannon', icon: FiShield, color: isDark ? 'text-red-400' : 'text-red-600' },
            { name: 'TypeScript', icon: FiCode, color: isDark ? 'text-blue-400' : 'text-blue-600' },
            { name: 'Vercel', icon: FiZap, color: isDark ? 'text-white' : 'text-black' },
            { name: '1sat.market', icon: FiDollarSign, color: isDark ? 'text-amber-400' : 'text-amber-600' },
            { name: 'BSV-20', icon: FiGitBranch, color: isDark ? 'text-orange-400' : 'text-orange-600' },
          ].map((tool) => (
            <div key={tool.name} className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-colors ${isDark ? 'bg-gray-900/50 border border-gray-800 hover:border-gray-700' : 'bg-gray-100 border border-gray-200 hover:border-gray-300'}`}>
              <tool.icon className={`text-2xl ${tool.color}`} />
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{tool.name}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
