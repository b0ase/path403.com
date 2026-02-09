'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowLeftIcon,
  Search,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  Code,
  Globe,
  Zap,
  Target,
  Filter,
  Briefcase,
  AlertCircle
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  company: string;
  description: string;
  category: string;
  location: 'Remote' | 'Hybrid' | 'On-site' | 'Global';
  duration: string;
  budget: string;
  skills_needed: string[];
  experience_level: 'Entry' | 'Mid' | 'Senior' | 'Lead';
  team_size: string;
  deadline: string;
  status: 'Open' | 'Almost Full' | 'Interview Stage';
  rating: number;
  applications: number;
  urgent?: boolean;
  featured?: boolean;
}

export default function StudioJoinProjectPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const availableProjects: Project[] = [
    {
      id: 'ecommerce-platform',
      title: 'E-commerce Platform Development',
      company: 'TechCorp Solutions',
      description: 'Build a scalable e-commerce platform with modern payment integration, inventory management, and admin dashboard.',
      category: 'Web Development',
      location: 'Remote',
      duration: '6-8 months',
      budget: '$80,000 - $120,000',
      skills_needed: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'Stripe'],
      experience_level: 'Senior',
      team_size: '5-7 developers',
      deadline: '2024-02-15',
      status: 'Open',
      rating: 4.8,
      applications: 12,
      featured: true
    },
    {
      id: 'mobile-banking-app',
      title: 'Mobile Banking Application',
      company: 'FinTech Innovations',
      description: 'Create a secure mobile banking app with biometric authentication, real-time transactions, and investment features.',
      category: 'Mobile Development',
      location: 'Hybrid',
      duration: '8-12 months',
      budget: '$150,000 - $200,000',
      skills_needed: ['React Native', 'TypeScript', 'Blockchain', 'Security'],
      experience_level: 'Senior',
      team_size: '6-8 developers',
      deadline: '2024-01-30',
      status: 'Almost Full',
      rating: 4.9,
      applications: 28,
      urgent: true
    },
    {
      id: 'ai-chatbot-platform',
      title: 'AI Customer Service Platform',
      company: 'AI Dynamics',
      description: 'Develop an intelligent chatbot platform with natural language processing and multi-channel support.',
      category: 'AI / Machine Learning',
      location: 'Remote',
      duration: '4-6 months',
      budget: '$60,000 - $90,000',
      skills_needed: ['Python', 'PyTorch', 'FastAPI', 'Redis'],
      experience_level: 'Mid',
      team_size: '3-4 developers',
      deadline: '2024-03-01',
      status: 'Open',
      rating: 4.7,
      applications: 8
    }
  ];

  const filteredProjects = availableProjects.filter(project => {
    const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.company.toLowerCase().includes(searchQuery.toLowerCase());
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
                  <Briefcase className="h-8 w-8 text-zinc-400" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white uppercase leading-none">Operation Access</h1>
              </div>
              <p className="text-xl text-zinc-400 max-w-3xl leading-relaxed">
                Connect with active high-stakes projects. Request entry to verified mission deployments and established development units.
              </p>
            </motion.div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-8 justify-between mb-16 items-end">
            <div className="w-full md:max-w-md space-y-4">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Global Search</span>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                <input
                  type="text"
                  placeholder="SEARCH ACTIVE PROJECTS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 p-4 pl-12 h-14 text-xs font-bold uppercase tracking-widest text-white focus:outline-none focus:border-white transition-colors rounded-none placeholder:text-zinc-800"
                />
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Sector Filter</span>
              <div className="flex flex-wrap gap-px bg-zinc-900 border border-zinc-900">
                {['All', 'Web Development', 'Mobile Development', 'AI / Machine Learning'].map((category) => (
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

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="group"
              >
                <div
                  className="bg-zinc-950 border border-zinc-900 hover:border-white transition-all duration-300 cursor-pointer p-8 relative overflow-hidden h-full flex flex-col"
                  onClick={() => setSelectedProject(project)}
                >
                  {project.urgent && (
                    <div className="absolute top-0 right-0 p-2 text-black bg-white border-l border-b border-white z-10">
                      <span className="text-[8px] font-bold uppercase tracking-tighter flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> URGENT
                      </span>
                    </div>
                  )}

                  <div className="mb-8">
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3 block">{project.category}</span>
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-2 group-hover:translate-x-1 transition-transform">{project.title}</h3>
                    <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-6 opacity-60">{project.company}</p>
                  </div>

                  <p className="text-zinc-500 text-[10px] uppercase tracking-widest leading-relaxed mb-8 flex-1 line-clamp-3">
                    {project.description}
                  </p>

                  <div className="space-y-4 pt-8 border-t border-zinc-900">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-[9px] font-bold text-white uppercase tracking-widest">
                        <MapPin className="h-3 w-3 mr-2" />
                        {project.location}
                      </div>
                      <div className="flex items-center text-[9px] font-bold text-white uppercase tracking-widest">
                        <Clock className="h-3 w-3 mr-2" />
                        {project.duration}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                      <span>{project.experience_level}</span>
                      <span className="font-mono text-white">{project.budget}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Details Modal */}
          <AnimatePresence>
            {selectedProject && (
              <div
                className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono"
                onClick={() => setSelectedProject(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-black border border-white rounded-none p-12 max-w-4xl w-full relative h-[90vh] overflow-hidden flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"
                  >
                    CLOSE [X]
                  </button>

                  <div className="mb-12">
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-4 block">Operation Parameters</span>
                    <h3 className="text-4xl font-bold text-white uppercase tracking-tighter">
                      {selectedProject.title}
                    </h3>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mt-3">{selectedProject.company}</p>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-8 space-y-16 custom-scrollbar">
                    <p className="text-zinc-400 text-sm uppercase tracking-widest leading-relaxed">
                      {selectedProject.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                      <div className="space-y-12">
                        <div>
                          <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-6 border-b border-zinc-900 pb-2">Technical Requirements</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedProject.skills_needed.map((skill) => (
                              <span key={skill} className="px-3 py-1.5 bg-zinc-950 border border-zinc-900 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-6 border-b border-zinc-900 pb-2">Unit Structure</h4>
                          <div className="flex items-center text-[10px] text-zinc-400 uppercase tracking-widest">
                            <Users className="h-4 w-4 text-white mr-3" />
                            {selectedProject.team_size}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-12">
                        <div>
                          <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-6 border-b border-zinc-900 pb-2">Engagement Vector</h4>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center text-[10px] text-zinc-400 uppercase tracking-widest">
                              <span>Location</span>
                              <span className="text-white">{selectedProject.location}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-zinc-400 uppercase tracking-widest">
                              <span>Timeframe</span>
                              <span className="text-white">{selectedProject.duration}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-zinc-400 uppercase tracking-widest">
                              <span>Deadline</span>
                              <span className="text-white">{selectedProject.deadline}</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-8 bg-zinc-950 border border-zinc-900">
                          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Capital Budget</p>
                          <p className="text-xl font-bold text-white font-mono">{selectedProject.budget}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-zinc-900 flex justify-end items-center gap-8">
                    <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">Status: {selectedProject.status}</span>
                    <Button className="h-16 px-12 bg-white text-black hover:bg-zinc-200 rounded-none font-bold uppercase tracking-widest text-xs">
                      REQUEST CLEARANCE [→]
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