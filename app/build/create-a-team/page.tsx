'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowLeftIcon,
  Users,
  UserPlus,
  Code,
  Palette,
  Shield,
  Database,
  ArrowRightIcon,
  CheckCircle,
  Target,
  Globe,
  Smartphone,
  Zap,
  Search
} from 'lucide-react';

interface TeamRole {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  skills: string[];
  responsibilities: string[];
  experience_level: 'Entry' | 'Mid' | 'Senior' | 'Lead';
  availability: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance';
  compensation_range: string;
}

interface TeamTemplate {
  id: string;
  name: string;
  description: string;
  team_size: string;
  roles: string[];
  timeline: string;
  budget_range: string;
  ideal_for: string[];
  success_factors: string[];
}

export default function StudioCreateTeamPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<TeamTemplate | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [teamForm, setTeamForm] = useState({
    teamName: '',
    projectType: '',
    timeline: '',
    budget: '',
    description: ''
  });

  const teamRoles: TeamRole[] = [
    {
      id: 'frontend-dev',
      title: 'Frontend Developer',
      description: 'Creates user interfaces and ensures great user experience across all devices.',
      icon: <Code className="h-6 w-6" />,
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Responsive Design'],
      responsibilities: ['Build UI components', 'Implement responsive design', 'Optimize performance', 'Cross-browser testing'],
      experience_level: 'Mid',
      availability: 'Full-time',
      compensation_range: '$60,000 - $90,000'
    },
    {
      id: 'backend-dev',
      title: 'Backend Developer',
      description: 'Builds server-side logic, APIs, and database architecture.',
      icon: <Database className="h-6 w-6" />,
      skills: ['Node.js', 'PostgreSQL', 'API Design', 'Docker', 'AWS'],
      responsibilities: ['Design APIs', 'Database management', 'Server deployment', 'Security implementation'],
      experience_level: 'Senior',
      availability: 'Full-time',
      compensation_range: '$70,000 - $110,000'
    },
    {
      id: 'ui-designer',
      title: 'UI/UX Designer',
      description: 'Designs intuitive and beautiful user interfaces and experiences.',
      icon: <Palette className="h-6 w-6" />,
      skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Usability Testing'],
      responsibilities: ['User research', 'Create wireframes', 'Design prototypes', 'User testing'],
      experience_level: 'Mid',
      availability: 'Contract',
      compensation_range: '$50,000 - $80,000'
    },
    {
      id: 'project-manager',
      title: 'Project Manager',
      description: 'Coordinates tasks, timelines, and communication within the team.',
      icon: <Target className="h-6 w-6" />,
      skills: ['Agile', 'Scrum', 'Stakeholder Management', 'Risk Assessment', 'Budgeting'],
      responsibilities: ['Manage timelines', 'Coordinate team members', 'Report progress', 'Risk mitigation'],
      experience_level: 'Senior',
      availability: 'Full-time',
      compensation_range: '$80,000 - $120,000'
    }
  ];

  const teamTemplates: TeamTemplate[] = [
    {
      id: 'mvp-team',
      name: 'MVP Launch Unit',
      description: 'Lean team designed to build and launch a minimum viable product quickly.',
      team_size: '3',
      roles: ['Frontend Developer', 'Backend Developer', 'UI/UX Designer'],
      timeline: '2-3 months',
      budget_range: '$20,000 - $45,000',
      ideal_for: ['Startups', 'New Product Ideas', 'Proof of Concepts'],
      success_factors: ['Speed to market', 'Core feature focus', 'Iterative feedback']
    },
    {
      id: 'scale-team',
      name: 'Scalability Division',
      description: 'Full-scale team for mature products needing growth and optimization.',
      team_size: '5-7',
      roles: ['Lead Dev', '2x Frontend', 'Backend', 'DevOps', 'QA Engineer', 'Product Manager'],
      timeline: '6+ months',
      budget_range: '$100,000+',
      ideal_for: ['Established Products', 'High-traffic Apps', 'Enterprise Solutions'],
      success_factors: ['Reliability', 'Performance', 'Scalability', 'Security']
    }
  ];

  const toggleRole = (roleId: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setTeamForm(prev => ({ ...prev, [field]: value }));
  };

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
                  <Users className="h-8 w-8 text-zinc-400" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white uppercase leading-none">Personnel Protocol</h1>
              </div>
              <p className="text-xl text-zinc-400 max-w-3xl leading-relaxed">
                Assemble high-caliber specialized units. Architect your organizational structure with verified domain experts and strategic agents.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column: Config */}
            <div className="lg:col-span-2 space-y-12">
              {/* Template Selection */}
              <section>
                <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-8 flex items-center gap-4">
                  <span className="w-12 h-px bg-zinc-800"></span>
                  Unit Structures
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-900 border border-zinc-900">
                  {teamTemplates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-8 cursor-pointer transition-all duration-300 group ${selectedTemplate?.id === template.id
                          ? 'bg-zinc-900'
                          : 'bg-black hover:bg-zinc-950'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest border border-zinc-800 px-2 py-1">
                          {template.team_size} Units
                        </span>
                        {selectedTemplate?.id === template.id && (
                          <CheckCircle className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-2 group-hover:translate-x-1 transition-transform">{template.name}</h3>
                      <p className="text-zinc-600 text-[10px] uppercase tracking-widest leading-relaxed line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Recruitment Pool */}
              <section>
                <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-8 flex items-center gap-4">
                  <span className="w-12 h-px bg-zinc-800"></span>
                  Active Personnel Registry
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-900 border border-zinc-900">
                  {teamRoles.map((role) => (
                    <div
                      key={role.id}
                      onClick={() => toggleRole(role.id)}
                      className={`p-8 cursor-pointer transition-all duration-300 group relative ${selectedRoles.includes(role.id)
                          ? 'bg-zinc-900 ring-1 ring-inset ring-white/10'
                          : 'bg-black hover:bg-zinc-950'
                        }`}
                    >
                      <div className="flex items-start justify-between mb-8">
                        <div className={`p-3 border border-zinc-800 transition-colors ${selectedRoles.includes(role.id) ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500 group-hover:text-white'}`}>
                          {role.icon}
                        </div>
                        <span className={`text-[9px] font-bold border px-1.5 py-0.5 uppercase tracking-widest ${role.experience_level === 'Senior' || role.experience_level === 'Lead' ? 'text-white border-white' : 'text-zinc-600 border-zinc-900'
                          }`}>
                          {role.experience_level}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-2">{role.title}</h3>
                      <p className="text-zinc-500 text-[10px] uppercase tracking-widest leading-relaxed mb-6 h-12 line-clamp-3">
                        {role.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-8">
                        {role.skills.slice(0, 3).map(skill => (
                          <span key={skill} className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest">{skill}</span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{role.availability}</span>
                        <span className="text-[10px] font-bold text-white font-mono">{role.compensation_range}</span>
                      </div>

                      {selectedRoles.includes(role.id) && (
                        <div className="absolute top-0 right-0 p-2 text-white bg-black border-l border-b border-white">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column: Summary & Deployment */}
            <div>
              <div className="sticky top-32 space-y-8">
                <div className="bg-zinc-950 border border-zinc-900 p-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-white"></div>
                  <h3 className="text-xl font-bold mb-8 text-white uppercase tracking-widest flex items-center">
                    <CheckCircle className="h-5 w-5 mr-3" />
                    Unit Logistics
                  </h3>

                  <div className="space-y-8">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Unit Name</label>
                      <input
                        type="text"
                        value={teamForm.teamName}
                        onChange={(e) => handleInputChange('teamName', e.target.value)}
                        placeholder="ENTER IDENTIFIER"
                        className="w-full bg-zinc-900 border border-zinc-800 p-4 text-xs font-bold uppercase tracking-widest text-white focus:outline-none focus:border-white transition-colors rounded-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Personnel</p>
                        <p className="text-3xl font-bold text-white font-mono">{selectedRoles.length}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Status</p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-4">STANDBY</p>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-zinc-900 space-y-4">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-zinc-600 tracking-[0.2em]">Estimated Overhead</span>
                        <span className="text-white">$350K - $650K</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-zinc-600 tracking-[0.2em]">Assembly Time</span>
                        <span className="text-white">2-4 WKS</span>
                      </div>
                    </div>

                    <Button
                      className={`w-full py-6 rounded-none h-14 font-bold uppercase tracking-widest text-xs transition-all ${selectedRoles.length > 0
                          ? 'bg-white text-black hover:bg-zinc-200'
                          : 'bg-zinc-900 text-zinc-700 border border-zinc-800 cursor-not-allowed'
                        }`}
                      disabled={selectedRoles.length === 0}
                    >
                      Initialize Deployment
                    </Button>
                  </div>
                </div>

                <div className="bg-black border border-zinc-900 p-8">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6">Unit Directives</h4>
                  <ul className="space-y-4">
                    {[
                      'HIGH VELOCITY EXECUTION CYCLES',
                      'DECENTRALIZED RESOURCE ALLOCATION',
                      'AI-AUGMENTED WORKFLOWS',
                      'VERIFIED DOMAIN SPECIALIZATION'
                    ].map(directive => (
                      <li key={directive} className="flex gap-3 text-[10px] font-bold text-zinc-700 uppercase tracking-widest leading-relaxed">
                        <Target className="h-3 w-3 mt-0.5 text-zinc-800" />
                        {directive}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Template Details Modal */}
          <AnimatePresence>
            {selectedTemplate && (
              <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono"
                onClick={() => setSelectedTemplate(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-black border border-white rounded-none p-12 max-w-2xl w-full relative flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"
                  >
                    CLOSE [X]
                  </button>

                  <div className="mb-12">
                    <h3 className="text-3xl font-bold text-white uppercase tracking-tighter">
                      {selectedTemplate.name}
                    </h3>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mt-3">Personnel Structure Specs</p>
                  </div>

                  <div className="space-y-12">
                    <p className="text-zinc-400 text-xs uppercase tracking-widest leading-relaxed">
                      {selectedTemplate.description}
                    </p>

                    <div>
                      <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-6 border-b border-zinc-800 pb-2">Required Slots</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedTemplate.roles.map((role) => (
                          <div key={role} className="flex items-center text-[10px] text-zinc-400 uppercase tracking-widest">
                            <CheckCircle className="h-3 w-3 text-white mr-3" />
                            {role}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12">
                      <div>
                        <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-4">Timeline</h4>
                        <p className="text-lg font-bold text-zinc-400 uppercase tracking-tight">{selectedTemplate.timeline}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-4">Capital Range</h4>
                        <p className="text-lg font-bold text-zinc-400 uppercase tracking-tight">{selectedTemplate.budget_range}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-zinc-900">
                    <Button className="w-full bg-white text-black hover:bg-zinc-200 rounded-none h-16 font-bold uppercase tracking-widest text-xs">
                      Activate Framework
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