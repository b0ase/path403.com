'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeftIcon,
  Layers,
  Globe,
  Zap,
  Smartphone,
  Shield,
  Search,
  ArrowRightIcon,
  CheckCircle,
  Star,
  Users,
  Briefcase,
  ShoppingCart,
  Camera,
  Music,
  GraduationCap,
  Heart,
  Code
} from 'lucide-react';

interface WebsiteTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  price: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  features: string[];
  ideal_for: string[];
  demo_url?: string;
  popular?: boolean;
}

interface WebsiteBuilder {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  pros: string[];
  cons: string[];
  best_for: string;
  pricing: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export default function StudioBuildWebsitePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBuilder, setSelectedBuilder] = useState<WebsiteBuilder | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<WebsiteTemplate | null>(null);

  const websiteBuilders: WebsiteBuilder[] = [
    {
      id: 'custom-nextjs',
      name: 'Custom Next.js Development',
      description: 'Fully custom website built with Next.js, TypeScript, and modern web technologies.',
      icon: <Code className="h-6 w-6" />,
      pros: ['100% Custom Design', 'Lightning Fast Performance', 'SEO Optimized', 'Unlimited Scalability', 'Full Control'],
      cons: ['Higher Cost', 'Longer Development Time', 'Requires Technical Maintenance'],
      best_for: 'Businesses needing unique functionality and complete customization',
      pricing: '$3,000 - $15,000+',
      difficulty: 'Advanced'
    },
    {
      id: 'wordpress',
      name: 'WordPress with Custom Theme',
      description: 'Professional WordPress site with custom theme development and plugin integration.',
      icon: <Globe className="h-6 w-6" />,
      pros: ['Easy Content Management', 'Extensive Plugin Ecosystem', 'Cost Effective', 'Quick Setup', 'SEO Friendly'],
      cons: ['Security Concerns', 'Plugin Dependencies', 'Performance Issues', 'Limited Customization'],
      best_for: 'Content-heavy sites, blogs, and small to medium businesses',
      pricing: '$1,500 - $8,000',
      difficulty: 'Beginner'
    },
    {
      id: 'shopify',
      name: 'Shopify E-commerce Store',
      description: 'Complete e-commerce solution with custom Shopify theme and payment integration.',
      icon: <ShoppingCart className="h-6 w-6" />,
      pros: ['Built for E-commerce', 'Secure Payments', 'Mobile Optimized', 'App Integrations', 'Easy Management'],
      cons: ['Monthly Fees', 'Transaction Fees', 'Limited Blog Features', 'Theme Restrictions'],
      best_for: 'Online stores and e-commerce businesses of all sizes',
      pricing: '$2,000 - $10,000 + monthly fees',
      difficulty: 'Intermediate'
    },
    {
      id: 'webflow',
      name: 'Webflow Designer Platform',
      description: 'Visual web design platform that generates clean code without coding knowledge.',
      icon: <Layers className="h-6 w-6" />,
      pros: ['Visual Design', 'Clean Code Output', 'Responsive Design', 'CMS Integration', 'Fast Loading'],
      cons: ['Learning Curve', 'Monthly Hosting Fees', 'Limited E-commerce', 'Export Restrictions'],
      best_for: 'Designers and agencies wanting visual control with clean code',
      pricing: '$1,000 - $5,000 + hosting',
      difficulty: 'Intermediate'
    }
  ];

  const websiteTemplates: WebsiteTemplate[] = [
    {
      id: 'business-pro',
      name: 'Business Professional',
      description: 'Clean, modern design perfect for professional services and corporate websites.',
      category: 'Business',
      image: '/placeholder-business.jpg',
      price: '$2,500',
      difficulty: 'Easy',
      features: ['Contact Forms', 'Service Pages', 'Team Section', 'Blog', 'SEO Ready'],
      ideal_for: ['Consulting Firms', 'Law Offices', 'Accounting Services', 'Real Estate'],
      popular: true
    },
    {
      id: 'ecommerce-modern',
      name: 'Modern E-commerce',
      description: 'Feature-rich online store with advanced product management and checkout.',
      category: 'E-commerce',
      image: '/placeholder-ecommerce.jpg',
      price: '$4,500',
      difficulty: 'Medium',
      features: ['Product Catalog', 'Shopping Cart', 'Payment Gateway', 'Inventory Management', 'Order Tracking'],
      ideal_for: ['Online Retailers', 'Fashion Brands', 'Electronics Stores', 'Handmade Goods'],
      popular: true
    },
    {
      id: 'portfolio-creative',
      name: 'Creative Portfolio',
      description: 'Stunning visual showcase for creative professionals and artists.',
      category: 'Portfolio',
      image: '/placeholder-portfolio.jpg',
      price: '$1,800',
      difficulty: 'Easy',
      features: ['Gallery Showcase', 'Project Pages', 'Contact Form', 'Social Integration', 'Mobile Optimized'],
      ideal_for: ['Photographers', 'Designers', 'Artists', 'Architects']
    },
    {
      id: 'restaurant-deluxe',
      name: 'Restaurant Deluxe',
      description: 'Appetizing design with online ordering and reservation system.',
      category: 'Restaurant',
      image: '/placeholder-restaurant.jpg',
      price: '$3,200',
      difficulty: 'Medium',
      features: ['Online Menu', 'Reservation System', 'Online Ordering', 'Location Map', 'Photo Gallery'],
      ideal_for: ['Restaurants', 'Cafes', 'Food Trucks', 'Catering Services']
    },
    {
      id: 'startup-launch',
      name: 'Startup Launch',
      description: 'Dynamic landing page designed to convert visitors into customers.',
      category: 'Startup',
      image: '/placeholder-startup.jpg',
      price: '$2,000',
      difficulty: 'Easy',
      features: ['Landing Page', 'Lead Capture', 'Pricing Tables', 'Testimonials', 'Analytics'],
      ideal_for: ['SaaS Companies', 'Tech Startups', 'App Launches', 'Product Launches']
    },
    {
      id: 'education-platform',
      name: 'Education Platform',
      description: 'Comprehensive platform for educational institutions and online courses.',
      category: 'Education',
      image: '/placeholder-education.jpg',
      price: '$3,800',
      difficulty: 'Medium',
      features: ['Course Management', 'Student Portal', 'Payment Processing', 'Certificates', 'Progress Tracking'],
      ideal_for: ['Online Schools', 'Training Centers', 'Course Creators', 'Universities']
    }
  ];

  const categories = ['All', 'Business', 'E-commerce', 'Portfolio', 'Restaurant', 'Startup', 'Education'];

  const filteredTemplates = selectedCategory === 'All'
    ? websiteTemplates
    : websiteTemplates.filter(template => template.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-600';
      case 'Medium': return 'bg-yellow-600';
      case 'Advanced': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Business': return <Briefcase className="h-4 w-4" />;
      case 'E-commerce': return <ShoppingCart className="h-4 w-4" />;
      case 'Portfolio': return <Camera className="h-4 w-4" />;
      case 'Restaurant': return <Heart className="h-4 w-4" />;
      case 'Startup': return <Zap className="h-4 w-4" />;
      case 'Education': return <GraduationCap className="h-4 w-4" />;
      case 'Creative': return <Camera className="h-4 w-4" />;
      case 'Personal': return <Heart className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
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
                  <Globe className="h-8 w-8 text-zinc-400" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white uppercase leading-none">Global Deployment</h1>
              </div>
              <p className="text-xl text-zinc-400 max-w-3xl leading-relaxed">
                Architect and deploy high-performance web infrastructures. Choose from custom engineering or managed framework implementations.
              </p>
            </motion.div>
          </div>

          {/* Builder Options */}
          <section className="mb-24">
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-8 flex items-center gap-4">
              <span className="w-12 h-px bg-zinc-800"></span>
              Development Frameworks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-900 border border-zinc-900">
              {websiteBuilders.map((builder) => (
                <div
                  key={builder.id}
                  className="bg-black p-10 hover:bg-zinc-950 transition-all duration-300 group cursor-pointer border-zinc-900"
                  onClick={() => setSelectedBuilder(builder)}
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:text-white transition-colors">
                      {builder.icon}
                    </div>
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest border border-zinc-800 px-2 py-1">
                      {builder.difficulty}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold mb-4 text-white uppercase tracking-tight group-hover:translate-x-1 transition-transform">{builder.name}</h3>
                  <p className="text-zinc-500 mb-8 text-xs uppercase tracking-widest leading-relaxed h-12 line-clamp-2">
                    {builder.description}
                  </p>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Estimated Cost</p>
                      <p className="text-lg font-bold text-white font-mono">{builder.pricing}</p>
                    </div>
                    <Button className="bg-zinc-900 hover:bg-white text-zinc-400 hover:text-black border border-zinc-800 hover:border-transparent rounded-none h-12 font-bold uppercase tracking-widest text-[10px] transition-all">
                      View Spec [→]
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Templates Section */}
          <section className="mb-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
              <div>
                <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-4">
                  <span className="w-12 h-px bg-zinc-800"></span>
                  Project Baselines
                </h2>
                <h3 className="text-4xl font-bold text-white uppercase tracking-tighter">Accelerated Launch Templates</h3>
              </div>

              <div className="flex flex-wrap gap-px bg-zinc-900 border border-zinc-900">
                {categories.map((category) => (
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTemplates
                .map((template) => (
                  <motion.div
                    key={template.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group"
                  >
                    <div
                      className="bg-zinc-950 border border-zinc-900 hover:border-white transition-all duration-300 cursor-pointer overflow-hidden"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="aspect-video relative overflow-hidden bg-zinc-900">
                        {/* Image Placeholder with Terminal Style */}
                        <div className="absolute inset-0 flex items-center justify-center border-b border-zinc-900">
                          <div className="text-[10px] font-bold text-zinc-800 uppercase tracking-[0.5em]">{template.name}</div>
                        </div>
                        {template.popular && (
                          <div className="absolute top-4 left-4">
                            <span className="bg-white text-black text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest">
                              POPULAR
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-8">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                            {template.category}
                          </span>
                          <span className="text-[9px] font-bold text-white uppercase tracking-widest">
                            {template.price}
                          </span>
                        </div>

                        <h4 className="text-lg font-bold text-white uppercase tracking-tight mb-2 group-hover:translate-x-1 transition-transform">{template.name}</h4>
                        <p className="text-zinc-500 text-[10px] uppercase tracking-widest leading-relaxed mb-8 h-8 line-clamp-2">
                          {template.description}
                        </p>

                        <div className="flex flex-wrap gap-2 pt-6 border-t border-zinc-900">
                          {template.features.slice(0, 3).map((feature) => (
                            <span key={feature} className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </section>

          {/* Process Steps */}
          <section className="mb-24">
            <h3 className="text-xl font-bold mb-12 text-white uppercase tracking-widest flex items-center gap-4">
              <CheckCircle className="h-6 w-6 text-zinc-500" />
              Deployment Pipeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-zinc-900 border border-zinc-900">
              {[
                { step: '01', title: 'DISCOVERY', desc: 'REQUIREMENTS ANALYSIS AND ARCHITECTURAL BLUEPRINTING.' },
                { step: '02', title: 'DESIGN', desc: 'UI/UX PROTOCOL DEFINITION AND VISUAL ASSET GENERATION.' },
                { step: '03', title: 'ENGINEERING', desc: 'CORE LOGIC IMPLEMENTATION AND SYSTEM INTEGRATION.' },
                { step: '04', title: 'DEPLOYMENT', desc: 'LATENCY OPTIMIZATION, FINAL AUDIT, AND LIVE PRODUCTION.' }
              ].map((item) => (
                <div key={item.step} className="bg-black p-8 group hover:bg-zinc-950 transition-colors">
                  <div className="text-[10px] font-bold text-zinc-800 mb-6 tracking-widest group-hover:text-white transition-colors">[{item.step}]</div>
                  <h4 className="font-bold text-white mb-2 text-xs tracking-widest uppercase">{item.title}</h4>
                  <p className="text-zinc-600 text-[10px] leading-relaxed uppercase tracking-widest">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Standard Features */}
          <section className="mb-24">
            <h3 className="text-xl font-bold mb-12 text-white uppercase tracking-widest">System Standards</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: <Smartphone className="h-5 w-5" />, title: 'Responsive Protocol', desc: 'DYNAMIC ADAPTATION ACROSS ALL INTERFACE DIMENSIONS.' },
                { icon: <Zap className="h-5 w-5" />, title: 'High Velocity', desc: 'LATENCY-OPTIMIZED ARCHITECTURE FOR MAXIMUM PERFORMANCE.' },
                { icon: <Shield className="h-5 w-5" />, title: 'Secure Cryptography', desc: 'ENCRYPTED DATA CHANNELS AND REDUNDANT SECURITY LAYERS.' },
                { icon: <Search className="h-5 w-5" />, title: 'Indexer Optimization', desc: 'SITEMAP AND SOURCE CODE STRUCTURED FOR MACHINE PARSING.' },
                { icon: <Users className="h-5 w-5" />, title: 'Operator Interface', desc: 'STREAMLINED CONTENT MODIFICATION AND SYSTEM ANALYTICS.' },
                { icon: <CheckCircle className="h-5 w-5" />, title: 'QA Verification', desc: 'RIGOROUS ERROR-HANDLING AND UNIT-TEST VALIDATION.' }
              ].map((feature, index) => (
                <div key={index} className="flex gap-4 p-8 bg-zinc-950 border border-zinc-900 group">
                  <div className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-700 group-hover:text-white transition-colors h-fit">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2 text-xs uppercase tracking-widest group-hover:translate-x-1 transition-transform">{feature.title}</h4>
                    <p className="text-zinc-600 text-[9px] uppercase tracking-widest leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Builder Details Modal */}
          <AnimatePresence>
            {selectedBuilder && (
              <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono"
                onClick={() => setSelectedBuilder(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-black border border-white rounded-none p-12 max-w-2xl w-full relative h-[80vh] overflow-hidden flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setSelectedBuilder(null)}
                    className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"
                  >
                    CLOSE [X]
                  </button>

                  <div className="mb-12">
                    <h3 className="text-3xl font-bold text-white uppercase tracking-tighter">
                      {selectedBuilder.name}
                    </h3>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mt-3">Architectural Specifications</p>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-12 pr-4 custom-scrollbar">
                    <p className="text-zinc-400 text-sm uppercase tracking-widest leading-relaxed">
                      {selectedBuilder.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div>
                        <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-6 border-b border-zinc-800 pb-2">Advantages</h4>
                        <ul className="space-y-4">
                          {selectedBuilder.pros.map((pro, index) => (
                            <li key={index} className="flex items-center text-[10px] text-zinc-400 uppercase tracking-widest">
                              <span className="w-1 h-1 bg-white mr-3"></span>
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-6 border-b border-zinc-800 pb-2">Constraints</h4>
                        <ul className="space-y-4">
                          {selectedBuilder.cons.map((con, index) => (
                            <li key={index} className="flex items-center text-[10px] text-zinc-600 uppercase tracking-widest">
                              <span className="w-1 h-1 bg-zinc-800 mr-3"></span>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-8 bg-zinc-950 border border-zinc-900">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-bold">Optimal Use Case:</p>
                      <p className="text-white text-xs uppercase tracking-widest leading-relaxed">{selectedBuilder.best_for}</p>
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-zinc-900 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-[0.2em]">Estimated Fee</p>
                      <p className="text-2xl font-bold text-white font-mono">{selectedBuilder.pricing}</p>
                    </div>
                    <Button className="bg-white text-black hover:bg-zinc-200 rounded-none h-14 px-10 font-bold uppercase tracking-widest text-xs">
                      Initiate Build
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

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
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mt-3">Template Asset Protocol</p>
                  </div>

                  <div className="space-y-12">
                    <div>
                      <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-6 border-b border-zinc-800 pb-2">Included Modules</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedTemplate.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-[10px] text-zinc-400 uppercase tracking-widest">
                            <CheckCircle className="h-3 w-3 text-white mr-3" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-6 border-b border-zinc-800 pb-2">Target Audience</h4>
                      <div className="flex flex-wrap gap-3">
                        {selectedTemplate.ideal_for.map((ideal) => (
                          <span key={ideal} className="px-3 py-1 bg-zinc-950 border border-zinc-900 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                            {ideal}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-zinc-900 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-[0.2em]">License Fee</p>
                      <p className="text-2xl font-bold text-white font-mono">{selectedTemplate.price}</p>
                    </div>
                    <div className="flex gap-4">
                      {selectedTemplate.demo_url && (
                        <Button variant="outline" className="border-zinc-800 text-zinc-500 hover:text-white hover:border-white rounded-none h-14 px-8 font-bold uppercase tracking-widest text-xs transition-all">
                          Preview
                        </Button>
                      )}
                      <Button className="bg-white text-black hover:bg-zinc-200 rounded-none h-14 px-10 font-bold uppercase tracking-widest text-xs">
                        Select Base
                      </Button>
                    </div>
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