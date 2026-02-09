'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FaBullhorn, FaVolumeUp, FaMusic, FaCamera, FaHashtag, FaVideo, FaUser, FaNewspaper, FaFileAlt, FaEnvelope, FaChartPie, FaPenFancy } from 'react-icons/fa';
import { motion } from 'framer-motion';

const contentModules = [
  {
    title: 'Advertising Copy',
    href: '/content/advertising-copy',
    icon: FaBullhorn,
    desc: 'Persuasive ad copy for digital and traditional campaigns',
    category: 'Writing'
  },
  {
    title: 'AI Audio Production',
    href: '/content/ai-audio-production',
    icon: FaVolumeUp,
    desc: 'AI-powered audio creation including voiceovers and podcasts',
    category: 'Audio'
  },
  {
    title: 'AI-Generated Music',
    href: '/content/ai-generated-music',
    icon: FaMusic,
    desc: 'Original music tracks created with AI',
    category: 'Audio'
  },
  {
    title: 'AI-Generated Photos',
    href: '/content/ai-generated-photos',
    icon: FaCamera,
    desc: 'AI-created images for any purpose',
    category: 'Visual'
  },
  {
    title: 'AI-Generated Videos',
    href: '/content/ai-generated-videos',
    icon: FaVideo,
    desc: 'AI video generation for marketing and education',
    category: 'Visual'
  },
  {
    title: 'AI Influencer',
    href: '/content/ai-influencer',
    icon: FaUser,
    desc: 'Complete AI influencer personas with content strategies',
    category: 'Digital'
  },
  {
    title: 'Blog Articles',
    href: '/content/blog-articles',
    icon: FaNewspaper,
    desc: 'SEO-optimized blog posts and articles',
    category: 'Writing'
  },
  {
    title: 'Email Campaigns',
    href: '/content/email-campaigns',
    icon: FaEnvelope,
    desc: 'Complete email sequences from welcome to sales',
    category: 'Marketing'
  },
  {
    title: 'Email Marketing',
    href: '/content/email-marketing',
    icon: FaEnvelope,
    desc: 'Strategic email marketing solutions',
    category: 'Marketing'
  },
  {
    title: 'Infographic Design',
    href: '/content/infographic-design',
    icon: FaChartPie,
    desc: 'Data visualization and infographic creation',
    category: 'Visual'
  },
  {
    title: 'Product Photography',
    href: '/content/product-photography',
    icon: FaCamera,
    desc: 'Professional product photography and editing',
    category: 'Visual'
  },
  {
    title: 'Social Media Automation',
    href: '/content/social-media-automation',
    icon: FaHashtag,
    desc: 'Automated social media posting and engagement',
    category: 'Digital'
  },
  {
    title: 'Social Media Content',
    href: '/content/social-media-content',
    icon: FaHashtag,
    desc: 'Engaging social media posts and stories',
    category: 'Digital'
  },
  {
    title: 'Video Scripts',
    href: '/content/video-scripts',
    icon: FaFileAlt,
    desc: 'Professional video scripts for all platforms',
    category: 'Writing'
  },
  {
    title: 'Website Copy',
    href: '/content/website-copy',
    icon: FaFileAlt,
    desc: 'Conversion-focused website copywriting',
    category: 'Writing'
  }
];

export default function ContentPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const categories = ['All', ...new Set(contentModules.map(m => m.category))];
  const filteredModules = selectedCategory === 'All' 
    ? contentModules 
    : contentModules.filter(m => m.category === selectedCategory);

  return (
    <motion.div 
      className="min-h-screen bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Main Content */}
      <motion.section 
        className="px-4 md:px-8 pt-32 pb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div>
          {/* Page Title */}
          <motion.div
            className="mb-8 flex flex-col md:flex-row md:items-end gap-6 border-b border-zinc-900 pb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="bg-zinc-900/50 p-4 md:p-6 border border-zinc-800 self-start">
              <FaPenFancy className="text-4xl md:text-6xl text-white" />
            </div>
            <div className="flex items-end gap-4">
              <h2 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                CONTENT
              </h2>
              <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                AI_POWERED
              </div>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div 
            className="flex items-baseline gap-8 mb-16"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <div>
              <span className="text-4xl md:text-5xl font-bold text-white">
                {contentModules.length}
              </span>
              <span className="text-sm ml-2 text-gray-400">
                Services
              </span>
            </div>
            <div>
              <span className="text-4xl md:text-5xl font-bold text-white">
                {categories.length - 1}
              </span>
              <span className="text-sm ml-2 text-gray-400">
                Categories
              </span>
            </div>
          </motion.div>

          {/* Category Filter */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 transition-colors ${
                  selectedCategory === category
                    ? 'bg-white text-black'
                    : 'bg-black text-gray-400 border border-gray-800 hover:border-gray-600 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 my-16" />

          {/* Content Services List */}
          <div>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-medium text-gray-400">
                Content Services
              </h3>
              <span className="text-sm text-gray-400">
                {filteredModules.length} Total
              </span>
            </div>

            {/* Service Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredModules.map((module, index) => (
                <motion.div
                  key={module.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.05 }}
                  className="group"
                >
                  <Link href={module.href}>
                    <div className="border border-gray-800 hover:border-gray-600 p-6 transition-all duration-300 h-full">
                      <module.icon className="text-3xl text-gray-400 mb-4 group-hover:text-white transition-colors" />
                      <h3 className="text-lg font-medium text-white mb-2 group-hover:text-white">
                        {module.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {module.desc}
                      </p>
                      <div className="mt-4 text-xs text-gray-500">
                        {module.category}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-20 border-t border-gray-800 pt-12">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Create Content?
              </h3>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                All content is generated using state-of-the-art AI technology with human quality control
              </p>
              <Link 
                href="/contact"
                className="inline-block px-8 py-3 bg-white text-black font-medium hover:bg-gray-200 transition-colors"
              >
                Start Creating
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}