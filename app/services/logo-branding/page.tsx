'use client';

import React from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaPencilRuler, FaPalette, FaStar, FaArrowRight, FaCheck } from 'react-icons/fa';
import ProjectImage from '@/components/ProjectImage';

export default function LogoBrandingPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <Link href="/services" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <FaArrowLeft />
          Back to Services
        </Link>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
            <FaPencilRuler className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-5xl font-bold text-white mb-2">
              Logo & Branding
            </h1>
            <p className="text-xl text-gray-400 mb-2">Distinctive Visual Identity</p>
          </div>
        </div>
        <p className="text-lg text-gray-400 max-w-3xl leading-relaxed">
          Stand out with a unique logo and cohesive branding. We create memorable visual identities that capture your brand's essence.
        </p>
      </div>
      {/* Key Features */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
            Branding Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300">
              <FaPencilRuler className="text-purple-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-purple-300">Logo Design</h3>
              <p className="text-gray-300">Custom logo concepts, revisions, and final files for all uses.</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-fuchsia-500/50 transition-all duration-300">
              <FaPalette className="text-fuchsia-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-fuchsia-300">Brand Guidelines</h3>
              <p className="text-gray-300">Color palettes, typography, and usage rules for brand consistency.</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-violet-500/50 transition-all duration-300">
              <FaStar className="text-violet-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-violet-300">Visual Identity</h3>
              <p className="text-gray-300">Complete visual identity systems for digital and print.</p>
            </div>
          </div>
        </div>
      </section>
      {/* Pricing Packages */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
            Branding Packages
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Choose the perfect branding package for your business. All packages include consultation and revisions.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter Package */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-purple-500/50 transition-all duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-purple-400 mb-2">Logo Starter</h3>
                <div className="text-4xl font-bold text-white mb-2">£600</div>
                <p className="text-gray-400">Logo & basic brand kit</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-purple-400 text-sm" />
                  <span className="text-gray-300">2 logo concepts</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-purple-400 text-sm" />
                  <span className="text-gray-300">2 rounds of revisions</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-purple-400 text-sm" />
                  <span className="text-gray-300">Basic brand guidelines</span>
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                Get Started <FaArrowRight />
              </button>
            </div>
            {/* Professional Package */}
            <div className="bg-gray-900/50 backdrop-blur-sm border-2 border-fuchsia-500 rounded-xl p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-fuchsia-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-fuchsia-400 mb-2">Brand Pro</h3>
                <div className="text-4xl font-bold text-white mb-2">£1,500</div>
                <p className="text-gray-400">Full branding system</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-fuchsia-400 text-sm" />
                  <span className="text-gray-300">4 logo concepts</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-fuchsia-400 text-sm" />
                  <span className="text-gray-300">Unlimited revisions</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-fuchsia-400 text-sm" />
                  <span className="text-gray-300">Comprehensive brand guidelines</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-fuchsia-400 text-sm" />
                  <span className="text-gray-300">Business card & social templates</span>
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                Start Branding <FaArrowRight />
              </button>
            </div>
            {/* Enterprise Package */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-violet-500/50 transition-all duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-violet-400 mb-2">Enterprise Brand</h3>
                <div className="text-4xl font-bold text-white mb-2">£5,000+</div>
                <p className="text-gray-400">Custom brand strategy</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-violet-400 text-sm" />
                  <span className="text-gray-300">Full visual identity system</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-violet-400 text-sm" />
                  <span className="text-gray-300">Brand strategy & consulting</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-violet-400 text-sm" />
                  <span className="text-gray-300">Collateral design</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-violet-400 text-sm" />
                  <span className="text-gray-300">Dedicated brand manager</span>
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                Contact Us <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Call to Action */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
            Ready to Elevate Your Brand?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Let's create a brand identity that sets you apart and drives business growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
              Start Branding <FaArrowRight />
            </button>
            <button className="border border-gray-600 hover:border-purple-500 text-gray-300 hover:text-purple-300 font-semibold py-3 px-8 rounded-lg transition-all duration-300">
              View Portfolio
            </button>
          </div>
        </div>
      </section>
    </div>
  );
} 