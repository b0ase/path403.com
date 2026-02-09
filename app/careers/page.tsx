'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiMapPin, FiClock, FiDollarSign, FiCoffee, FiZap, FiCode,
  FiEdit3, FiMessageCircle, FiGlobe, FiBox, FiTerminal, FiStar,
  FiUsers, FiHome, FiArrowRight, FiBriefcase
} from 'react-icons/fi';

interface Career {
  id: string;
  title: string;
  realTitle: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  perks: string[];
  icon: React.ReactNode;
}

const CAREERS: Career[] = [
  {
    id: 'chief-vibe-officer',
    title: 'Chief Vibe Officer',
    realTitle: 'Creative Director',
    department: 'Leadership',
    location: 'Anywhere with WiFi',
    type: 'Full-time Chaos',
    salary: 'Enough for fancy coffee',
    description: 'You\'ll be responsible for maintaining immaculate vibes across all projects. Must be able to sense when a design "just doesn\'t feel right" and articulate it using only hand gestures and sighs.',
    requirements: [
      'PhD in Vibe Detection (or 5+ years equivalent experience)',
      'Ability to say "make it pop" without irony',
      'Extensive playlist curation experience',
      'Must own at least 3 houseplants that are still alive',
    ],
    perks: ['Unlimited sparkling water', 'Standing desk that actually stands', 'Monthly "creative retreats" (we go to the park)'],
    icon: <FiStar className="text-yellow-400 text-xl" />,
  },
  {
    id: 'pixel-whisperer',
    title: 'Pixel Whisperer',
    realTitle: 'UI/UX Designer',
    department: 'Design',
    location: 'The Grid',
    type: 'Full-time',
    salary: '1px = 1 satoshi',
    description: 'You hear pixels crying out for alignment. You dream in 8-point grids. You\'ve been known to zoom in to 3200% "just to check something." We need you.',
    requirements: [
      'Ability to spot a misaligned element from across the room',
      'Strong opinions about border-radius values',
      'Figma skills that border on witchcraft',
      'Must have cried over a font choice at least once',
    ],
    perks: ['4K monitors (plural)', 'Adobe Creative Cloud subscription', 'Therapy for Comic Sans trauma'],
    icon: <FiEdit3 className="text-pink-400 text-xl" />,
  },
  {
    id: 'bug-exterminator',
    title: 'Professional Bug Exterminator',
    realTitle: 'QA Engineer',
    department: 'Engineering',
    location: 'The Shadow Realm (prod)',
    type: 'Full-time Detective',
    salary: 'Per bug squashed',
    description: 'You find the bugs we swore weren\'t there. You reproduce "unreproducible" issues on the first try. You\'ve seen things in the codebase that would make grown developers weep.',
    requirements: [
      'Eagle eyes and the patience of a saint',
      'Ability to write "Steps to Reproduce" that actually reproduce',
      'Immunity to "it works on my machine"',
      'Experience breaking things that shouldn\'t be breakable',
    ],
    perks: ['Bug bounty bonuses', 'A rubber duck named Gerald', 'Permission to say "I told you so"'],
    icon: <FiZap className="text-red-400 text-xl" />,
  },
  {
    id: 'coffee-to-code-converter',
    title: 'Coffee-to-Code Converter',
    realTitle: 'Full Stack Developer',
    department: 'Engineering',
    location: 'Between npm install and npm audit',
    type: 'Full-time + Overtime',
    salary: 'Competitive + Caffeine stipend',
    description: 'You turn caffeine into features. Your keyboard has worn-out keys from all the typing. You\'ve deployed to production on a Friday and lived to tell the tale.',
    requirements: [
      'React/Next.js fluency (TypeScript preferred, JavaScript tolerated)',
      'Ability to explain "the cloud" to your parents',
      'Git commit messages that tell a story',
      'Survived at least one mass npm vulnerability alert',
    ],
    perks: ['Premium coffee machine', 'Mechanical keyboard allowance', 'No meetings on Wednesdays'],
    icon: <FiCoffee className="text-orange-400 text-xl" />,
  },
  {
    id: 'blockchain-whisperer',
    title: 'Blockchain Whisperer',
    realTitle: 'Web3 Developer',
    department: 'Engineering',
    location: 'On-chain',
    type: 'Full-time Decentralized',
    salary: 'Paid in stablecoins (your choice)',
    description: 'You understand what a UTXO actually is. You can explain BSV vs BTC without starting a civil war. You\'ve written smart contracts that are actually smart.',
    requirements: [
      'Deep knowledge of BSV/Bitcoin protocols',
      'Experience with wallet integrations',
      'Ability to read a transaction without getting a headache',
      'Bonus: You were into Bitcoin before it was cool',
    ],
    perks: ['Company tokens (not financial advice)', 'Hardware wallet provided', 'Permission to say "DYOR" in meetings'],
    icon: <FiBox className="text-blue-400 text-xl" />,
  },
  {
    id: 'ai-wrangler',
    title: 'AI Wrangler',
    realTitle: 'AI/ML Engineer',
    department: 'Innovation',
    location: 'The Singularity (remote)',
    type: 'Full-time + Robot Overlord Insurance',
    salary: 'Before the robots take over',
    description: 'You teach machines to think, then convince them not to take your job. You\'ve fine-tuned models and your prompt engineering is *chef\'s kiss*.',
    requirements: [
      'Experience with LLMs (Claude preferred, obviously)',
      'Ability to explain AI to executives without using the word "magic"',
      'Prompt engineering that borders on poetry',
      'Philosophical acceptance that AI might be smarter than us',
    ],
    perks: ['GPU access that would make gamers jealous', 'AI ethics book club', 'First dibs on the robot bunker'],
    icon: <FiTerminal className="text-green-400 text-xl" />,
  },
  {
    id: 'deadline-dancer',
    title: 'Deadline Dancer',
    realTitle: 'Project Manager',
    department: 'Operations',
    location: 'Between a rock and a hard deadline',
    type: 'Full-time Juggler',
    salary: 'Stress pay included',
    description: 'You turn "we need this yesterday" into achievable milestones. You\'ve mastered the art of the polite follow-up email. Your Gantt charts are legendary.',
    requirements: [
      'Black belt in scope creep prevention',
      'Fluent in developer, designer, AND client',
      'Ability to say "no" nicely (and mean it)',
      'Experience managing chaos with a smile',
    ],
    perks: ['Noise-canceling headphones', 'Unlimited Notion access', 'A door that locks'],
    icon: <FiClock className="text-indigo-400 text-xl" />,
  },
  {
    id: 'word-wizard',
    title: 'Word Wizard',
    realTitle: 'Content Writer',
    department: 'Content',
    location: 'The Prose Zone',
    type: 'Part-time to Full-time',
    salary: 'Per word (just kidding)',
    description: 'You make technical concepts sound simple and boring products sound exciting. You\'ve never met a headline you couldn\'t improve. Oxford comma loyalist.',
    requirements: [
      'Ability to write "engaging copy" about anything',
      'Strong opinions about em dashes vs en dashes',
      'SEO knowledge that doesn\'t compromise soul',
      'Experience explaining blockchain to normal humans',
    ],
    perks: ['Grammarly Premium', 'Book allowance', 'Permission to judge bad copy out loud'],
    icon: <FiMessageCircle className="text-cyan-400 text-xl" />,
  },
  {
    id: 'internet-explorer',
    title: 'Internet Explorer',
    realTitle: 'Digital Marketing Specialist',
    department: 'Marketing',
    location: 'All the platforms',
    type: 'Full-time Scroll Master',
    salary: 'Plus meme budget',
    description: 'You know what\'s trending before it trends. Your engagement rates are suspicious. You can make any brand sound cool on the internet (yes, even enterprise software).',
    requirements: [
      'Native fluency in Twitter/X, LinkedIn, and "the algorithm"',
      'Portfolio of posts that actually got engagement',
      'Ability to explain TikTok to the board',
      'Meme literacy (current certification required)',
    ],
    perks: ['Blue checkmark (we\'ll pay for it)', 'Social media detox days', 'Full creative freedom (within reason)'],
    icon: <FiGlobe className="text-purple-400 text-xl" />,
  },
  {
    id: 'git-commit-poet',
    title: 'Git Commit Poet',
    realTitle: 'Senior Developer',
    department: 'Engineering',
    location: 'main branch',
    type: 'Full-time Artisan',
    salary: 'Senior-level shenanigans',
    description: 'Your commit messages read like haikus. Your code reviews are legendary. You refactor for fun. Junior devs speak your name in hushed, reverent tones.',
    requirements: [
      '7+ years turning coffee into production code',
      'Commit messages that future you will thank you for',
      'Ability to debug by staring at code intensely',
      'Experience mentoring without being condescending',
    ],
    perks: ['Commit of the Month award', 'Conference speaking budget', 'A chair that costs more than a laptop'],
    icon: <FiCode className="text-teal-400 text-xl" />,
  },
];

export default function CareersPage() {
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);

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
        {/* Header - matches /agents style */}
        <motion.div
          className="mb-12 border-b border-gray-800 pb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-6">
            <div className="bg-gray-900/50 p-4 md:p-6 border border-gray-800 self-start">
              <FiBriefcase className="text-4xl md:text-6xl text-white" />
            </div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                CAREERS
              </h1>
              <div className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-widest">
                JOIN THE CHAOS
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-gray-400 max-w-2xl">
              We&apos;re looking for talented humans who don&apos;t take themselves too seriously
              but take their craft very seriously. Remote-first, async-friendly, meme-tolerant.
            </p>
            <div className="flex gap-4">
              <Link
                href="/gigs"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold border border-zinc-700 text-zinc-300 hover:text-white hover:border-white transition-colors whitespace-nowrap"
              >
                View Gigs <FiUsers size={14} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold hover:opacity-80 transition-colors whitespace-nowrap bg-white text-black"
              >
                Apply <FiArrowRight size={14} />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-black border border-zinc-800 p-4 text-center">
            <p className="text-2xl font-bold text-white">100%</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Remote</p>
          </div>
          <div className="bg-black border border-zinc-800 p-4 text-center">
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Pointless meetings</p>
          </div>
          <div className="bg-black border border-zinc-800 p-4 text-center">
            <p className="text-2xl font-bold text-white">&infin;</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Coffee budget</p>
          </div>
          <div className="bg-black border border-zinc-800 p-4 text-center">
            <p className="text-2xl font-bold text-white">42</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">The answer</p>
          </div>
        </div>

        {/* Open Positions Header */}
        <div className="bg-zinc-900/50 px-4 py-3 border border-zinc-800 border-b-0">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Open_Positions ({CAREERS.length})</span>
        </div>

        {/* Careers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-800 border border-zinc-800 mb-8">
          {CAREERS.map((career) => (
            <div
              key={career.id}
              onClick={() => setSelectedCareer(career)}
              className="bg-black p-5 cursor-pointer hover:bg-zinc-900/50 transition-colors"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0">
                  {career.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold uppercase tracking-tight text-white">{career.title}</h3>
                  <p className="text-[10px] text-zinc-600">aka {career.realTitle}</p>
                </div>
              </div>
              <p className="text-zinc-500 text-xs line-clamp-2 mb-3">{career.description}</p>
              <div className="flex flex-wrap gap-2 text-[10px]">
                <span className="flex items-center gap-1 text-zinc-600 px-2 py-1 border border-zinc-800">
                  <FiMapPin size={10} /> {career.location}
                </span>
                <span className="flex items-center gap-1 text-zinc-600 px-2 py-1 border border-zinc-800">
                  <FiClock size={10} /> {career.type}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Career Modal */}
        {selectedCareer && (
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCareer(null)}
          >
            <div
              className="bg-black border border-zinc-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-zinc-900/50 px-4 py-3 border-b border-zinc-800 flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Position_Details</span>
                <button onClick={() => setSelectedCareer(null)} className="text-zinc-600 hover:text-white text-xs">
                  [ESC]
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-zinc-900 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                    {selectedCareer.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold uppercase tracking-tight">{selectedCareer.title}</h2>
                    <p className="text-zinc-600 text-xs">aka {selectedCareer.realTitle}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs">
                      <span className="flex items-center gap-1 text-zinc-500">
                        <FiMapPin size={12} /> {selectedCareer.location}
                      </span>
                      <span className="flex items-center gap-1 text-zinc-500">
                        <FiClock size={12} /> {selectedCareer.type}
                      </span>
                      <span className="flex items-center gap-1 text-green-400">
                        <FiDollarSign size={12} /> {selectedCareer.salary}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-zinc-400 text-sm mb-6">{selectedCareer.description}</p>

                <div className="mb-6">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Requirements (mostly serious)</p>
                  <div className="space-y-1">
                    {selectedCareer.requirements.map((req, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                        <span className="text-zinc-600">•</span>
                        {req}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Perks (definitely serious)</p>
                  <div className="space-y-1">
                    {selectedCareer.perks.map((perk, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                        <span className="text-green-500">&#x2713;</span>
                        {perk}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/apply/${selectedCareer.id}`}
                    className="flex-1 py-3 bg-white text-black font-bold uppercase tracking-wider text-xs text-center hover:bg-zinc-200 transition-colors"
                  >
                    Apply Now (We Dare You)
                  </Link>
                  <button
                    onClick={() => setSelectedCareer(null)}
                    className="px-4 py-3 border border-zinc-700 text-zinc-500 hover:text-white hover:border-white text-xs uppercase tracking-wider transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="bg-black border border-zinc-800 p-8 text-center mb-8">
          <h2 className="text-xl font-bold uppercase tracking-tight mb-2">Don&apos;t see your role?</h2>
          <p className="text-zinc-500 text-sm mb-6 max-w-lg mx-auto">
            We&apos;re always looking for exceptional people. If you think you&apos;d be a great fit
            but don&apos;t see the perfect role, reach out anyway.
          </p>
          <Link
            href="/contact"
            className="inline-block px-6 py-3 bg-white text-black font-bold uppercase tracking-wider text-sm hover:bg-zinc-200 transition-colors"
          >
            Say Hello
          </Link>
        </div>

        {/* Footer Links */}
        <div className="flex gap-4 justify-center flex-wrap pt-8 border-t border-zinc-800">
          <Link href="/gigs" className="px-4 py-2 border border-zinc-800 text-zinc-500 hover:text-white hover:border-white text-xs uppercase tracking-wider transition-colors">
            Gigs
          </Link>
          <Link href="/developers" className="px-4 py-2 border border-zinc-800 text-zinc-500 hover:text-white hover:border-white text-xs uppercase tracking-wider transition-colors">
            Developers
          </Link>
          <Link href="/" className="px-4 py-2 border border-zinc-800 text-zinc-500 hover:text-white hover:border-white text-xs uppercase tracking-wider transition-colors flex items-center gap-2">
            <FiHome size={12} />
            Home
          </Link>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-zinc-700 text-[10px] mt-8">
          b0ase is an equal opportunity employer. We don&apos;t discriminate based on
          your preferred text editor, tabs vs spaces stance, or whether you think
          CSS is a programming language. (It&apos;s not. Fight me.)
        </p>
      </motion.section>
    </motion.div>
  );
}
