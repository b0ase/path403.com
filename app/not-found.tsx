'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiHome, FiArrowRight } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import { useNavbar } from '@/components/NavbarProvider';

const WireframeAnimation = dynamic(
  () => import('@/components/landing/WireframeAnimation'),
  { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-transparent" />
  }
);

export default function NotFound() {
  const [isClient, setIsClient] = useState(false);
  const { isDark } = useNavbar();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="min-h-screen bg-black" />;
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-white text-black'} relative overflow-hidden`}>
      {/* Three.js Background Animation */}
      <div className="fixed inset-0 z-0">
        <WireframeAnimation 
          isDark={isDark}
          colorIntense={false}
          globeStructured={true}
          animationExpanded={false}
          shadeLevel={2}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl"
        >
          {/* 404 */}
          <h1 
            className="text-9xl md:text-[12rem] font-black leading-none mb-4"
            style={{ 
              fontFamily: 'var(--font-space-grotesk)',
              letterSpacing: '-0.02em'
            }}
          >
            404
          </h1>

          {/* Error Message */}
          <h2 
            className={`text-2xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-black'}`}
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Page Not Found
          </h2>

          <p 
            className={`text-base md:text-lg mb-8 ${isDark ? 'text-white/70' : 'text-black/70'}`}
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            The page you're looking for doesn't exist or has been moved.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              className={`group flex items-center gap-2 px-6 py-3 rounded-full border transition-all ${
                isDark 
                  ? 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white' 
                  : 'border-black/20 hover:border-black/40 bg-black/5 hover:bg-black/10 text-black'
              }`}
            >
              <FiHome size={18} />
              <span className="font-medium">Back to Home</span>
            </Link>

            <Link
              href="/components"
              className={`group flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
                isDark 
                  ? 'bg-white text-black hover:bg-gray-100' 
                  : 'bg-black text-white hover:bg-gray-900'
              }`}
            >
              <span className="font-medium">Explore Components</span>
              <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Quick Links */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <p className={`text-sm mb-4 ${isDark ? 'text-white/50' : 'text-black/50'}`}>
              Popular pages:
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {['Portfolio', 'Services', 'Build', 'Contact'].map((page) => (
                <Link
                  key={page}
                  href={`/${page.toLowerCase()}`}
                  className={`text-sm px-4 py-2 rounded-full transition-all ${
                    isDark 
                      ? 'hover:bg-white/10 text-white/70 hover:text-white' 
                      : 'hover:bg-black/10 text-black/70 hover:text-black'
                  }`}
                >
                  {page}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
