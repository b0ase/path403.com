'use client';

import React from 'react';
import Link from 'next/link';
import { FaCode, FaMobileAlt, FaServer, FaDatabase, FaRobot, FaBitcoin, FaArrowRight } from 'react-icons/fa';
import ProjectImage from '@/components/ProjectImage';
import ProjectCardImage from '@/components/ProjectCardImage';

export default function SoftwareDevelopmentRedirect() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center max-w-xl mx-auto p-8 bg-gray-900/70 rounded-xl shadow-2xl">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Software Development Has Moved
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          The Software Development service is now part of our new <span className="font-semibold text-blue-300">App Development</span> offering. Click below to explore our modern app development solutions!
        </p>
        <Link href="/services/app-development">
          <button className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 text-lg">
            Go to App Development <FaArrowRight />
          </button>
        </Link>
      </div>
    </div>
  );
} 