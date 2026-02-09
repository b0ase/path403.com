'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowRight, FiFolder, FiCalendar, FiStar } from 'react-icons/fi';

export default function LandingArchivePage() {
  const [isDark, setIsDark] = useState(true);

  const archives = [
    {
      id: '1',
      title: 'Original Landing Page',
      description: 'The first iteration with hero section, features, and CTA',
      date: '2024-12',
      featured: false,
      path: '/landing/archive/1'
    },
    {
      id: 'current',
      title: 'Current Landing Page',
      description: 'Interactive 3D wireframe animation with advanced controls',
      date: '2024-12',
      featured: true,
      path: '/'
    },
    {
      id: 'mockup',
      title: 'Mockup Collection',
      description: 'Various mockup designs and experiments',
      date: '2024-12',
      featured: false,
      path: '/mockup'
    },
    {
      id: 'animation',
      title: 'Animation Showcase',
      description: 'Automated transitions and motion graphics',
      date: '2024-12',
      featured: false,
      path: '/mockup/animation'
    },
    {
      id: 'cards',
      title: '3D Cards Demo',
      description: 'Interactive 3D card components with cursor tracking',
      date: '2024-12',
      featured: false,
      path: '/mockup/cards'
    }
  ];

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Landing Page Archive</h1>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Browse through different versions and experiments
              </p>
            </div>
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-3 rounded-full transition-all ${
                isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'
              }`}
            >
              {isDark ? '🌞' : '🌙'}
            </button>
          </div>
        </motion.div>

        {/* Archive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {archives.map((archive, index) => (
            <motion.div
              key={archive.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link href={archive.path}>
                <div className={`
                  relative p-6 rounded-xl border transition-all duration-300 cursor-pointer
                  ${isDark 
                    ? 'bg-gray-900/50 border-gray-800 hover:bg-gray-900 hover:border-gray-700' 
                    : 'bg-gray-50 border-gray-200 hover:bg-white hover:border-gray-300'
                  }
                  ${archive.featured ? 'ring-2 ring-blue-500' : ''}
                `}>
                  {archive.featured && (
                    <div className="absolute -top-3 -right-3">
                      <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <FiStar size={12} />
                        Current
                      </div>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${
                      isDark ? 'bg-white/5' : 'bg-black/5'
                    }`}>
                      <FiFolder size={24} />
                    </div>
                    <FiArrowRight className={`mt-3 transition-transform group-hover:translate-x-1 ${
                      isDark ? 'text-gray-600' : 'text-gray-400'
                    }`} />
                  </div>

                  <h3 className={`text-xl font-bold mb-2 ${
                    isDark ? 'text-white' : 'text-black'
                  }`}>
                    {archive.title}
                  </h3>

                  <p className={`mb-4 line-clamp-2 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {archive.description}
                  </p>

                  <div className={`flex items-center gap-2 text-sm ${
                    isDark ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    <FiCalendar size={14} />
                    <span>{archive.date}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className={`mt-12 p-6 rounded-xl border ${
            isDark 
              ? 'bg-gray-900/30 border-gray-800' 
              : 'bg-gray-50 border-gray-200'
          }`}
        >
          <h2 className="text-lg font-semibold mb-2">About This Archive</h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            This archive contains various iterations and experiments of the landing page design. 
            Each version represents different approaches to presenting the b0ase brand and services.
          </p>
        </motion.div>
      </div>
    </div>
  );
}