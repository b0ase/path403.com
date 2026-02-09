'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/Providers';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  Rocket,
  Globe,
  Smartphone,
  Database,
  Bot,
  Coins,
  Code,
  ArrowRightIcon,
  CheckCircle,
  Clock,
  DollarSign,
  X,
  User,
  Mail,
  Lock,
  Zap,
  Briefcase
} from 'lucide-react';

interface ProjectTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  price: string;
  features: string[];
  tech: string[];
  category: 'Web' | 'Mobile' | 'Blockchain' | 'AI' | 'E-commerce' | 'SaaS';
}

export default function StudioStartProjectPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    name: ''
  });
  const { session } = useAuth();
  const router = useRouter();

  const handleTemplateSelect = (template: ProjectTemplate) => {
    const templateData = {
      name: `${template.title} Project`,
      title: template.title,
      description: template.description,
      category: template.category,
      price: template.price,
      difficulty: template.difficulty,
      duration: template.duration,
      features: template.features,
      tech: template.tech,
      needsTeam: template.category === 'SaaS' || template.category === 'E-commerce',
      needsToken: template.category === 'Blockchain',
      needsAgent: template.category === 'AI',
      needsWebsite: template.category === 'Web' || template.category === 'E-commerce',
    };

    localStorage.setItem('selectedProjectTemplate', JSON.stringify(templateData));

    if (session?.user) {
      router.push('/projects/new?source=template');
    } else {
      setSelectedTemplate(template);
      setShowAuthModal(true);
      setAuthMode('signup');
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowAuthModal(false);
    router.push('/projects/new?source=template');
  };

  const projectTemplates: ProjectTemplate[] = [
    {
      id: 'modern-website',
      title: 'Modern Business Website',
      description: 'Professional website with modern design, responsive layout, and content management.',
      icon: <Globe className="h-6 w-6" />,
      difficulty: 'Beginner',
      duration: '2-4 weeks',
      price: '$2,000 - $5,000',
      features: ['Responsive Design', 'CMS Integration', 'SEO Optimized', 'Contact Forms', 'Analytics'],
      tech: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase'],
      category: 'Web'
    },
    {
      id: 'ecommerce-platform',
      title: 'E-commerce Platform',
      description: 'Complete online store with payment processing, inventory management, and admin dashboard.',
      icon: <Database className="h-6 w-6" />,
      difficulty: 'Advanced',
      duration: '8-12 weeks',
      price: '$10,000 - $25,000',
      features: ['Payment Gateway', 'Inventory System', 'Admin Dashboard', 'Order Management', 'Multi-vendor Support'],
      tech: ['Next.js', 'Stripe', 'PostgreSQL', 'Redis', 'AWS'],
      category: 'E-commerce'
    },
    {
      id: 'mobile-app',
      title: 'Cross-Platform Mobile App',
      description: 'Native-feeling mobile app that works on both iOS and Android platforms.',
      icon: <Smartphone className="h-6 w-6" />,
      difficulty: 'Intermediate',
      duration: '6-10 weeks',
      price: '$8,000 - $15,000',
      features: ['Cross-Platform', 'Push Notifications', 'Offline Support', 'App Store Ready', 'User Authentication'],
      tech: ['React Native', 'Expo', 'Firebase', 'TypeScript'],
      category: 'Mobile'
    },
    {
      id: 'ai-chatbot',
      title: 'AI-Powered Chatbot',
      description: 'Intelligent chatbot with natural language processing and integration capabilities.',
      icon: <Bot className="h-6 w-6" />,
      difficulty: 'Advanced',
      duration: '4-8 weeks',
      price: '$5,000 - $12,000',
      features: ['NLP Processing', 'Multi-Platform', 'Learning Capabilities', 'API Integration', 'Analytics'],
      tech: ['OpenAI', 'Python', 'FastAPI', 'Vector DB', 'Docker'],
      category: 'AI'
    },
    {
      id: 'crypto-token',
      title: 'Cryptocurrency Token',
      description: 'Launch your own token with smart contracts, tokenomics, and trading features.',
      icon: <Coins className="h-6 w-6" />,
      difficulty: 'Advanced',
      duration: '3-6 weeks',
      price: '$7,000 - $20,000',
      features: ['Smart Contracts', 'Tokenomics', 'Trading Features', 'Staking', 'Governance'],
      tech: ['Solidity', 'Ethereum', 'Web3.js', 'Hardhat'],
      category: 'Blockchain'
    },
    {
      id: 'saas-platform',
      title: 'SaaS Platform',
      description: 'Complete software-as-a-service platform with subscriptions and user management.',
      icon: <Code className="h-6 w-6" />,
      difficulty: 'Advanced',
      duration: '12-20 weeks',
      price: '$15,000 - $50,000',
      features: ['Multi-tenancy', 'Subscription Billing', 'User Management', 'API Access', 'Analytics Dashboard'],
      tech: ['Next.js', 'PostgreSQL', 'Stripe', 'Redis', 'Docker'],
      category: 'SaaS'
    }
  ];

  const categories = ['All', 'Web', 'Mobile', 'Blockchain', 'AI', 'E-commerce', 'SaaS'];

  const filteredTemplates = selectedCategory === 'All'
    ? projectTemplates
    : projectTemplates.filter(template => template.category === selectedCategory);

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black">
      <main className="relative z-10 px-4 md:px-8 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 border-b border-zinc-900 pb-12">
            <Link href="/build" className="inline-flex items-center text-zinc-500 hover:text-white transition-colors mb-8 text-xs font-bold uppercase tracking-widest group">
              <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Build
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center mb-6">
                <div className="p-3 bg-zinc-900 border border-zinc-800 mr-4">
                  <Rocket className="h-8 w-8 text-zinc-400" />
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter text-white uppercase leading-none">Venture Initiation</h1>
              </div>
              <p className="text-xl text-zinc-400 max-w-3xl leading-relaxed">
                Deploy specialized infrastructure for your project. Choose a verified baseline blueprint to accelerate your development cycle.
              </p>
            </motion.div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col md:flex-row gap-8 justify-between mb-16 items-end">
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Sector Index</span>
              <div className="flex flex-wrap gap-px bg-zinc-900 border border-zinc-900">
                {categories.map((category) => (
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

          {/* Project Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-900 border border-zinc-900 mb-24">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-black p-10 hover:bg-zinc-950 transition-all duration-300 group cursor-pointer h-full flex flex-col"
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="flex items-start justify-between mb-12">
                  <div className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:bg-white group-hover:text-black group-hover:border-white transition-all w-fit">
                    {template.icon}
                  </div>
                  <span className={`px-2 py-0.5 border border-zinc-900 text-[9px] font-bold uppercase tracking-[0.2em] ${template.difficulty === 'Advanced' ? 'text-white border-white' : 'text-zinc-700'
                    }`}>
                    {template.difficulty}
                  </span>
                </div>

                <h3 className="text-2xl font-bold mb-3 text-white uppercase tracking-tight group-hover:translate-x-1 transition-transform">{template.title}</h3>
                <p className="text-zinc-500 mb-12 text-[10px] font-bold leading-relaxed uppercase tracking-widest flex-1 line-clamp-3">
                  {template.description}
                </p>

                <div className="space-y-4 mb-12 pt-8 border-t border-zinc-900/50">
                  <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-2 text-zinc-700" />
                      {template.duration}
                    </div>
                    <div className="flex items-center text-white font-mono">
                      <DollarSign className="h-3 w-3 mr-1 text-zinc-700" />
                      {template.price}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {template.tech.slice(0, 3).map((tech) => (
                      <span key={tech} className="px-2 py-1 bg-zinc-950 text-zinc-600 text-[8px] font-bold uppercase tracking-widest border border-zinc-900">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <Button className="w-full bg-white text-black hover:bg-zinc-200 rounded-none h-16 font-bold uppercase tracking-widest text-[10px] transition-all">
                  INITIALIZE {template.id.toUpperCase()}
                </Button>
              </div>
            ))}
          </div>

          {/* Custom Project Option */}
          <div className="bg-zinc-950 border border-zinc-900 p-16 mb-24 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Briefcase className="h-32 w-32" />
            </div>

            <div className="relative z-10 text-center">
              <h3 className="text-3xl font-bold mb-6 text-white uppercase tracking-tighter">Custom Structural Logic</h3>
              <p className="text-zinc-500 mb-12 max-w-2xl mx-auto text-[11px] font-bold uppercase tracking-[0.2em] leading-relaxed">
                Unique operational requirements demand custom-architected solutions. Connect with the engineering unit for specialized deployment.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button className="bg-white text-black hover:bg-zinc-200 rounded-none h-16 px-12 font-bold uppercase tracking-widest text-xs">
                  Request Custom Briefing
                </Button>
                <Button variant="outline" className="border-zinc-800 bg-black text-zinc-500 hover:text-white hover:border-white rounded-none h-16 px-12 font-bold uppercase tracking-widest text-xs transition-all">
                  Access Schema Docs
                </Button>
              </div>
            </div>
          </div>

          {/* Logic Flow */}
          <section className="mb-24">
            <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.4em] mb-12 flex items-center">
              <Zap className="h-4 w-4 mr-4 text-white" />
              OPERATIONAL PIPELINE
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-900 border border-zinc-900">
              {[
                { step: '01', title: 'SCHEMATIC', desc: 'Requirements analysis and architectural blueprinting.' },
                { step: '02', title: 'SYNTHESIS', desc: 'High-velocity development cycles with verified milestones.' },
                { step: '03', title: 'DEPLOYMENT', desc: 'Production-ready scaling and final protocol audit.' }
              ].map((item) => (
                <div key={item.step} className="bg-black p-10 hover:bg-zinc-950 transition-colors group">
                  <div className="text-[10px] font-bold text-zinc-800 mb-8 tracking-[0.3em] group-hover:text-white transition-colors">BLOCK [{item.step}]</div>
                  <h4 className="font-bold text-white mb-4 text-xs tracking-widest uppercase">{item.title}</h4>
                  <p className="text-zinc-600 text-[10px] leading-relaxed uppercase tracking-widest">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Authentication Modal */}
          <AnimatePresence>
            {showAuthModal && (
              <div
                className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 font-mono"
                onClick={() => setShowAuthModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-black border border-white rounded-none p-12 w-full max-w-lg relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setShowAuthModal(false)}
                    className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"
                  >
                    CLOSE [X]
                  </button>

                  <div className="mb-12">
                    <h2 className="text-3xl font-bold text-white uppercase tracking-tighter">
                      {authMode === 'signup' ? 'Access Registry' : 'Identity Verification'}
                    </h2>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-4">
                      {selectedTemplate && `To initialize: ${selectedTemplate.title}`}
                    </p>
                  </div>

                  <form onSubmit={handleAuthSubmit} className="space-y-8">
                    {authMode === 'signup' && (
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
                          Operator Identifier
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-700" />
                          <input
                            type="text"
                            value={authForm.name}
                            onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 pl-12 pr-4 py-4 text-white focus:border-white focus:outline-none transition-all uppercase text-xs tracking-widest rounded-none placeholder:text-zinc-900"
                            placeholder="NAME"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
                        Communications Port
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-700" />
                        <input
                          type="email"
                          value={authForm.email}
                          onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-800 pl-12 pr-4 py-4 text-white focus:border-white focus:outline-none transition-all uppercase text-xs tracking-widest rounded-none placeholder:text-zinc-900"
                          placeholder="EMAIL"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
                        Access Key
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-700" />
                        <input
                          type="password"
                          value={authForm.password}
                          onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-800 pl-12 pr-4 py-4 text-white focus:border-white focus:outline-none transition-all text-xs tracking-widest rounded-none placeholder:text-zinc-900"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-white text-black hover:bg-zinc-200 rounded-none h-16 font-bold uppercase tracking-widest text-[10px]"
                    >
                      {authMode === 'signup' ? 'REGISTER PROTOCOL' : 'VERIFY IDENTITY'}
                    </Button>
                  </form>

                  <div className="mt-8 text-center">
                    <button
                      onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                      className="text-zinc-600 hover:text-white text-[9px] font-bold uppercase tracking-widest transition-colors"
                    >
                      {authMode === 'signup' ? 'EXISTING OPERATOR? VERIFY' : 'NEW OPERATOR? REGISTER'}
                    </button>
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