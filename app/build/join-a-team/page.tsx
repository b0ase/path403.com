'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowLeftIcon,
  Search,
  MapPin,
  Users,
  CheckCircle,
  Zap,
  Filter,
  Users2,
  AlertCircle,
  Trophy,
  Rocket
} from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
}

interface Team {
  id: string;
  name: string;
  company: string;
  description: string;
  category: string;
  location: 'Remote' | 'Hybrid' | 'On-site' | 'Global';
  team_size: number;
  looking_for: string[];
  tech_stack: string[];
  culture: string[];
  benefits: string[];
  open_positions: number;
  founded: string;
  rating: number;
  members: TeamMember[];
  featured?: boolean;
  hiring_urgently?: boolean;
}

export default function StudioJoinTeamPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const availableTeams: Team[] = [
    {
      id: 'techcorp-web',
      name: 'Frontend Innovation Team',
      company: 'TechCorp Solutions',
      description: 'We are a dynamic team focused on creating cutting-edge user experiences for web applications. We value creativity, collaboration, and continuous learning.',
      category: 'Web Development',
      location: 'Remote',
      team_size: 8,
      looking_for: ['Senior React Developer', 'UI/UX Designer', 'Frontend Engineer'],
      tech_stack: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL'],
      culture: ['Agile', 'Innovative', 'Collaborative', 'Learning-focused'],
      benefits: ['Flexible hours', 'Remote work', 'Learning budget', 'Health insurance'],
      open_positions: 3,
      founded: '2020',
      rating: 4.8,
      members: [
        { name: 'Sarah Chen', role: 'Team Lead' },
        { name: 'Mike Johnson', role: 'Senior Developer' },
        { name: 'Emily Rodriguez', role: 'Designer' }
      ],
      featured: true
    },
    {
      id: 'fintech-mobile',
      name: 'Mobile Banking Squad',
      company: 'FinTech Innovations',
      description: 'Revolutionary mobile banking solutions team. We are building the future of financial technology with secure, user-friendly mobile applications.',
      category: 'Mobile Development',
      location: 'Hybrid',
      team_size: 12,
      looking_for: ['React Native Developer', 'iOS Developer', 'Security Engineer'],
      tech_stack: ['React Native', 'Swift', 'Kotlin', 'Node.js', 'PostgreSQL'],
      culture: ['Security-first', 'Innovation', 'Compliance', 'User-centric'],
      benefits: ['Hybrid work', 'Stock options', 'Professional development', 'Team events'],
      open_positions: 5,
      founded: '2019',
      rating: 4.9,
      members: [
        { name: 'David Lee', role: 'Engineering Manager' },
        { name: 'Lisa Wang', role: 'Product Owner' },
        { name: 'James Wilson', role: 'Senior Mobile Dev' }
      ],
      hiring_urgently: true
    }
  ];

  const filteredTeams = availableTeams.filter(team => {
    const matchesCategory = selectedCategory === 'All' || team.category === selectedCategory;
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black">
      <main className="relative z-10 px-4 md:px-8 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 border-b border-zinc-900 pb-8">
            <Link href="/studio" className="inline-flex items-center text-zinc-500 hover:text-white transition-colors mb-8 text-xs font-bold uppercase tracking-widest group">
              <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Studio
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center mb-6">
                <div className="p-3 bg-zinc-900 border border-zinc-800 mr-4">
                  <Users2 className="h-8 w-8 text-zinc-400" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white uppercase leading-none">Unit Integration</h1>
              </div>
              <p className="text-xl text-zinc-400 max-w-3xl leading-relaxed">
                Embed within established high-performance teams. Discover operational units seeking specialized personnel to scale their project objectives.
              </p>
            </motion.div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-8 justify-between mb-16 items-end">
            <div className="w-full md:max-w-md space-y-4">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Team Search</span>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                <input
                  type="text"
                  placeholder="SEARCH ACTIVE TEAMS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 p-4 pl-12 h-14 text-xs font-bold uppercase tracking-widest text-white focus:outline-none focus:border-white transition-colors rounded-none placeholder:text-zinc-800"
                />
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Category Filter</span>
              <div className="flex flex-wrap gap-px bg-zinc-900 border border-zinc-900">
                {['All', 'Web Development', 'Mobile Development'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${selectedCategory === category
                        ? 'bg-white text-black'
                        : 'bg-black text-zinc-500 hover:text-zinc-300'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTeams.map((team) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="group"
              >
                <div
                  className="bg-zinc-950 border border-zinc-900 hover:border-white transition-all duration-300 cursor-pointer p-8 relative overflow-hidden h-full flex flex-col"
                  onClick={() => setSelectedTeam(team)}
                >
                  {team.hiring_urgently && (
                    <div className="absolute top-0 right-0 p-2 text-black bg-white border-l border-b border-white z-10">
                      <span className="text-[8px] font-bold uppercase tracking-tighter flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> URGENT HIRE
                      </span>
                    </div>
                  )}

                  <div className="mb-8">
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3 block">{team.category}</span>
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-2 group-hover:translate-x-1 transition-transform">{team.name}</h3>
                    <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-6 opacity-60">{team.company}</p>
                  </div>

                  <p className="text-zinc-500 text-[10px] uppercase tracking-widest leading-relaxed mb-8 flex-1 line-clamp-3">
                    {team.description}
                  </p>

                  <div className="space-y-4 pt-8 border-t border-zinc-900">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-[9px] font-bold text-white uppercase tracking-widest">
                        <MapPin className="h-3 w-3 mr-2" />
                        {team.location}
                      </div>
                      <div className="flex items-center text-[9px] font-bold text-white uppercase tracking-widest">
                        <Users className="h-3 w-3 mr-2" />
                        {team.team_size} Units
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                      <span>OPEN POSITIONS</span>
                      <span className="font-mono text-white">{team.open_positions}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Details Modal */}
          <AnimatePresence>
            {selectedTeam && (
              <div
                className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono"
                onClick={() => setSelectedTeam(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-black border border-white rounded-none p-12 max-w-4xl w-full relative h-[90vh] overflow-hidden flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setSelectedTeam(null)}
                    className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"
                  >
                    CLOSE [X]
                  </button>

                  <div className="mb-12">
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-4 block">Unit Profile</span>
                    <h3 className="text-4xl font-bold text-white uppercase tracking-tighter">
                      {selectedTeam.name}
                    </h3>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mt-3">{selectedTeam.company}</p>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-8 space-y-16 custom-scrollbar">
                    <p className="text-zinc-400 text-sm uppercase tracking-widest leading-relaxed">
                      {selectedTeam.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                      <div className="space-y-12">
                        <div>
                          <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-6 border-b border-zinc-900 pb-2">Active Stack</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedTeam.tech_stack.map((tech) => (
                              <span key={tech} className="px-3 py-1.5 bg-zinc-950 border border-zinc-900 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-6 border-b border-zinc-900 pb-2">Hiring For</h4>
                          <div className="space-y-3">
                            {selectedTeam.looking_for.map((role) => (
                              <div key={role} className="flex items-center text-[10px] text-zinc-400 uppercase tracking-widest">
                                <Rocket className="h-3 w-3 text-white mr-3" />
                                {role}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-12">
                        <div>
                          <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-6 border-b border-zinc-900 pb-2">Unit Culture</h4>
                          <div className="grid grid-cols-2 gap-4">
                            {selectedTeam.culture.map((item) => (
                              <div key={item} className="flex items-center text-[10px] text-zinc-500 uppercase tracking-widest">
                                <Trophy className="h-3 w-3 mr-3 text-zinc-700" />
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="p-8 bg-zinc-950 border border-zinc-900">
                          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-4">Engagement Status</p>
                          <div className="flex justify-between items-center text-[10px] text-white uppercase tracking-widest">
                            <span>Open Positions</span>
                            <span className="font-bold text-lg font-mono">{selectedTeam.open_positions}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-zinc-900 flex justify-end items-center gap-8">
                    <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">Founded: {selectedTeam.founded}</span>
                    <Button className="h-16 px-12 bg-white text-black hover:bg-zinc-200 rounded-none font-bold uppercase tracking-widest text-xs">
                      APPLY FOR INTEGRATION [→]
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}