'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowLeftIcon,
  Bot,
  MessageSquare,
  Brain,
  Settings,
  ArrowRightIcon,
  CheckCircle,
  Zap,
  Monitor,
  Headphones,
  BarChart,
  TrendingUp,
  Globe
} from 'lucide-react';

interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  complexity: 'Simple' | 'Moderate' | 'Advanced' | 'Expert';
  features: string[];
  use_cases: string[];
  tech_stack: string[];
  development_time: string;
  cost_range: string;
  deployment_options: string[];
  popular?: boolean;
  new?: boolean;
}

interface AgentCapability {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  implementation_time: string;
}

export default function StudioCreateAgentPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedComplexity, setSelectedComplexity] = useState<string>('All');
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [agentForm, setAgentForm] = useState({
    name: '',
    purpose: '',
    personality: '',
    platform: '',
    budget: ''
  });

  const agentTemplates: AgentTemplate[] = [
    {
      id: 'customer-support',
      name: 'Customer Support Bot',
      description: 'Intelligent customer service agent that handles inquiries, provides instant responses, and escalates complex issues.',
      category: 'Customer Service',
      complexity: 'Moderate',
      features: ['24/7 Availability', 'Multi-language Support', 'Ticket Management', 'Knowledge Base Integration', 'Sentiment Analysis'],
      use_cases: ['E-commerce Support', 'SaaS Help Desk', 'General Inquiries', 'Order Tracking', 'FAQ Automation'],
      tech_stack: ['Natural Language Processing', 'Machine Learning', 'API Integration', 'Cloud Hosting'],
      development_time: '4-6 weeks',
      cost_range: '$15,000 - $30,000',
      deployment_options: ['Website Widget', 'Mobile App', 'Slack Integration', 'WhatsApp Business'],
      popular: true
    },
    {
      id: 'sales-assistant',
      name: 'AI Sales Assistant',
      description: 'Proactive sales agent that qualifies leads, schedules meetings, and nurtures prospects through the sales funnel.',
      category: 'Sales & Marketing',
      complexity: 'Advanced',
      features: ['Lead Qualification', 'Meeting Scheduling', 'CRM Integration', 'Email Automation', 'Sales Analytics'],
      use_cases: ['Lead Generation', 'Appointment Booking', 'Follow-up Automation', 'Product Recommendations', 'Upselling'],
      tech_stack: ['AI/ML', 'CRM APIs', 'Email Integration', 'Calendar APIs', 'Analytics'],
      development_time: '6-10 weeks',
      cost_range: '$25,000 - $50,000',
      deployment_options: ['Website Embed', 'Email Campaigns', 'CRM Integration', 'Mobile App'],
      popular: true
    },
    {
      id: 'content-creator',
      name: 'Content Generation Agent',
      description: 'Creative AI that generates blog posts, social media content, marketing copy, and visual assets.',
      category: 'Content Creation',
      complexity: 'Advanced',
      features: ['Text Generation', 'Image Creation', 'SEO Optimization', 'Brand Voice Matching', 'Multi-format Output'],
      use_cases: ['Blog Writing', 'Social Media Posts', 'Ad Copy', 'Product Descriptions', 'Email Marketing'],
      tech_stack: ['GPT Models', 'Image AI', 'SEO Tools', 'Content APIs', 'Brand Analysis'],
      development_time: '8-12 weeks',
      cost_range: '$30,000 - $60,000',
      deployment_options: ['Web Dashboard', 'API Access', 'CMS Integration', 'Social Media Tools']
    },
    {
      id: 'data-analyst',
      name: 'Business Intelligence Agent',
      description: 'Data-driven AI that analyzes business metrics, generates insights, and creates automated reports.',
      category: 'Analytics',
      complexity: 'Expert',
      features: ['Data Analysis', 'Report Generation', 'Predictive Analytics', 'Dashboard Creation', 'Alert System'],
      use_cases: ['Business Reporting', 'Performance Monitoring', 'Trend Analysis', 'KPI Tracking', 'Anomaly Detection'],
      tech_stack: ['Machine Learning', 'Data Visualization', 'Database Integration', 'Statistical Analysis'],
      development_time: '10-16 weeks',
      cost_range: '$40,000 - $80,000',
      deployment_options: ['Web Dashboard', 'Email Reports', 'Slack Integration', 'Mobile App']
    }
  ];

  const agentCapabilities: AgentCapability[] = [
    {
      id: 'nlp',
      name: 'Natural Language Processing',
      description: 'Understand and process human language with context and intent recognition.',
      icon: <MessageSquare className="h-6 w-6" />,
      difficulty: 'Medium',
      implementation_time: '2-4 weeks'
    },
    {
      id: 'computer-vision',
      name: 'Computer Vision',
      description: 'Analyze and understand visual content including images and videos.',
      icon: <Monitor className="h-6 w-6" />,
      difficulty: 'Hard',
      implementation_time: '4-8 weeks'
    },
    {
      id: 'voice-recognition',
      name: 'Voice Recognition',
      description: 'Convert speech to text and understand voice commands.',
      icon: <Headphones className="h-6 w-6" />,
      difficulty: 'Medium',
      implementation_time: '3-6 weeks'
    },
    {
      id: 'decision-making',
      name: 'Decision Making',
      description: 'Make intelligent decisions based on data and predefined rules.',
      icon: <Brain className="h-6 w-6" />,
      difficulty: 'Hard',
      implementation_time: '4-8 weeks'
    },
    {
      id: 'learning',
      name: 'Machine Learning',
      description: 'Learn from data and improve performance over time.',
      icon: <TrendingUp className="h-6 w-6" />,
      difficulty: 'Hard',
      implementation_time: '6-12 weeks'
    },
    {
      id: 'api-integration',
      name: 'API Integration',
      description: 'Connect with external services and data sources.',
      icon: <Globe className="h-6 w-6" />,
      difficulty: 'Easy',
      implementation_time: '1-3 weeks'
    }
  ];

  const toggleCapability = (capabilityId: string) => {
    setSelectedCapabilities(prev =>
      prev.includes(capabilityId)
        ? prev.filter(id => id !== capabilityId)
        : [...prev, capabilityId]
    );
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
                  <Brain className="h-8 w-8 text-zinc-400" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white uppercase leading-none">Intelligence Synthesis</h1>
              </div>
              <p className="text-xl text-zinc-400 max-w-3xl leading-relaxed">
                Architect and deploy autonomous neural agents. Choose from specialized templates or configure custom cognitive capabilities for your operational requirements.
              </p>
            </motion.div>
          </div>

          {/* Filtering */}
          <div className="flex flex-col md:flex-row gap-8 justify-between mb-16 items-end">
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Protocol Filter</span>
              <div className="flex flex-wrap gap-px bg-zinc-900 border border-zinc-900">
                {['All', 'Customer Service', 'Sales & Marketing', 'Content Creation', 'Analytics'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${selectedCategory === category
                        ? 'bg-white text-black'
                        : 'bg-black text-zinc-500 hover:text-zinc-300'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Complexity Index</span>
              <div className="flex flex-wrap gap-px bg-zinc-900 border border-zinc-900">
                {['All', 'Simple', 'Moderate', 'Advanced', 'Expert'].map((complexity) => (
                  <button
                    key={complexity}
                    onClick={() => setSelectedComplexity(complexity)}
                    className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${selectedComplexity === complexity
                        ? 'bg-white text-black'
                        : 'bg-black text-zinc-500 hover:text-zinc-300'
                      }`}
                  >
                    {complexity}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          <section className="mb-24">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-8 flex items-center gap-4">
              <span className="w-12 h-px bg-zinc-800"></span>
              Core Blueprints
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {agentTemplates
                .filter(t => (selectedCategory === 'All' || t.category === selectedCategory))
                .filter(t => (selectedComplexity === 'All' || t.complexity === selectedComplexity))
                .map((template) => (
                  <motion.div
                    key={template.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group"
                  >
                    <div
                      className="bg-zinc-950 border border-zinc-900 hover:border-white transition-all duration-300 cursor-pointer p-8 relative overflow-hidden h-full flex flex-col"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      {template.popular && (
                        <div className="absolute top-0 right-0 p-2 text-black bg-white border-l border-b border-white z-10">
                          <span className="text-[8px] font-bold uppercase tracking-tighter">POPULAR</span>
                        </div>
                      )}

                      <div className="mb-8 p-3 bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:text-white transition-colors w-fit">
                        <Bot className="h-6 w-6" />
                      </div>

                      <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-3 group-hover:translate-x-1 transition-transform">{template.name}</h3>
                      <p className="text-zinc-500 text-[10px] uppercase tracking-widest leading-relaxed mb-8 flex-1">
                        {template.description}
                      </p>

                      <div className="flex items-center justify-between pt-6 border-t border-zinc-900">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{template.complexity}</span>
                        <span className="text-sm font-bold text-white font-mono">{template.cost_range}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </section>

          {/* Capabilities Selection */}
          <section className="mb-24">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-8 flex items-center gap-4">
              <span className="w-12 h-px bg-zinc-800"></span>
              Neural Modules
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-900 border border-zinc-900">
              {agentCapabilities.map((cap) => (
                <div
                  key={cap.id}
                  onClick={() => toggleCapability(cap.id)}
                  className={`p-8 cursor-pointer transition-all duration-300 group relative ${selectedCapabilities.includes(cap.id)
                      ? 'bg-zinc-900'
                      : 'bg-black hover:bg-zinc-950'
                    }`}
                >
                  <div className={`mb-6 p-3 border border-zinc-800 transition-colors w-fit ${selectedCapabilities.includes(cap.id) ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500 group-hover:text-white'}`}>
                    {cap.icon}
                  </div>
                  <h4 className="font-bold text-white mb-2 text-xs uppercase tracking-widest">{cap.name}</h4>
                  <p className="text-zinc-600 text-[9px] uppercase tracking-widest leading-relaxed mb-4">{cap.description}</p>

                  {selectedCapabilities.includes(cap.id) && (
                    <div className="absolute top-0 right-0 p-2 text-white bg-black border-l border-b border-white">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Deployment Config */}
          <section className="mb-24">
            <div className="bg-zinc-950 border border-zinc-900 p-12">
              <h3 className="text-2xl font-bold mb-12 text-white uppercase tracking-tighter flex items-center gap-4">
                <Settings className="h-6 w-6 text-zinc-500" />
                Operational Parameters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Agent Identifier</label>
                    <input
                      type="text"
                      value={agentForm.name}
                      onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
                      placeholder="ENTER UNIT NAME"
                      className="w-full bg-zinc-900 border border-zinc-800 p-4 text-xs font-bold uppercase tracking-widest text-white focus:outline-none focus:border-white transition-colors rounded-none placeholder:text-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Primary Objective</label>
                    <textarea
                      value={agentForm.purpose}
                      onChange={(e) => setAgentForm({ ...agentForm, purpose: e.target.value })}
                      placeholder="SPECIFY CORE LOGIC PURPOSE"
                      rows={4}
                      className="w-full bg-zinc-900 border border-zinc-800 p-4 text-xs font-bold uppercase tracking-widest text-white focus:outline-none focus:border-white transition-colors rounded-none placeholder:text-zinc-800"
                    />
                  </div>
                </div>
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Neural Architecture</label>
                    <select
                      className="w-full bg-zinc-900 border border-zinc-800 p-4 h-14 text-xs font-bold uppercase tracking-widest text-white focus:outline-none focus:border-white transition-colors rounded-none appearance-none"
                    >
                      <option>GPT-4o OPTIMIZED</option>
                      <option>CLAUDE 3.5 SONNET</option>
                      <option>LLAMA 3.1 400B</option>
                      <option>CUSTOM FINE-TUNE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Capital Allocation</label>
                    <select
                      className="w-full bg-zinc-900 border border-zinc-800 p-4 h-14 text-xs font-bold uppercase tracking-widest text-white focus:outline-none focus:border-white transition-colors rounded-none appearance-none"
                    >
                      <option>EXPERIMENTAL ($500 - $2,000)</option>
                      <option>OPERATIONAL ($2,000 - $10,000)</option>
                      <option>ENTERPRISE ($10,000+)</option>
                    </select>
                  </div>
                  <Button className="w-full h-16 bg-white text-black hover:bg-zinc-200 rounded-none font-bold uppercase tracking-widest text-xs transition-colors mt-auto">
                    Initiate Synthesis Protocol
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Template Details Modal */}
          <AnimatePresence>
            {selectedTemplate && (
              <div
                className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono"
                onClick={() => setSelectedTemplate(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-black border border-white rounded-none p-12 max-w-4xl w-full relative h-[90vh] overflow-hidden flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"
                  >
                    CLOSE [X]
                  </button>

                  <div className="mb-12">
                    <h3 className="text-4xl font-bold text-white uppercase tracking-tighter">
                      {selectedTemplate.name}
                    </h3>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-4">Blueprint Specifications</p>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-8 space-y-16 custom-scrollbar">
                    <p className="text-zinc-400 text-sm uppercase tracking-widest leading-relaxed">
                      {selectedTemplate.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                      <div className="space-y-12">
                        <div>
                          <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-6 border-b border-zinc-900 pb-2">Integrated Features</h4>
                          <div className="grid grid-cols-1 gap-4">
                            {selectedTemplate.features.map((feature, index) => (
                              <div key={index} className="flex items-center text-[10px] text-zinc-400 uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 bg-white mr-3"></span>
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-6 border-b border-zinc-900 pb-2">Technical Foundations</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedTemplate.tech_stack.map((tech) => (
                              <span key={tech} className="px-2 py-1 bg-zinc-950 border border-zinc-900 text-zinc-500 text-[9px] font-bold uppercase tracking-widest">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-12">
                        <div>
                          <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-6 border-b border-zinc-900 pb-2">Deployment Vectors</h4>
                          <div className="grid grid-cols-1 gap-4">
                            {selectedTemplate.deployment_options.map((option, index) => (
                              <div key={index} className="flex items-center text-[10px] text-zinc-400 uppercase tracking-widest">
                                <Zap className="h-3 w-3 text-white mr-3" />
                                {option}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="p-8 bg-zinc-950 border border-zinc-900">
                          <div className="grid grid-cols-2 gap-8">
                            <div>
                              <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Build Duration</p>
                              <p className="text-sm font-bold text-white tracking-widest">{selectedTemplate.development_time}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Estimated Fee</p>
                              <p className="text-sm font-bold text-white font-mono">{selectedTemplate.cost_range}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-zinc-900 flex justify-between items-center">
                    <Link href="/studio" className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
                      VIEW FULL DOCUMENTATION
                    </Link>
                    <Button className="h-16 px-12 bg-white text-black hover:bg-zinc-200 rounded-none font-bold uppercase tracking-widest text-xs">
                      DEPLOY AGENT [→]
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