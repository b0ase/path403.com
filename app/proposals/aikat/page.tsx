'use client';

import React from 'react';
import Link from 'next/link';
import { FaVideo, FaBolt, FaUsers, FaGlobe, FaChartLine, FaArrowRight, FaCheck, FaArrowUp, FaPaintBrush, FaCode, FaRocket, FaCog } from 'react-icons/fa';

export default function AiKatProposal() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <div className="mb-8">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-sm font-semibold mb-4">
                Partnership Proposal
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                aiKat.ai
              </span>{' '}
              × B0ase
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Next-Gen Video Production Infrastructure
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="#proposal" 
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-8 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
              >
                View Proposal
              </Link>
              <Link 
                href="#services" 
                className="border border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200"
              >
                Our Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Understanding Section */}
      <section id="understanding" className="py-16 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Understanding aiKat's Vision
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              We've analyzed your platform and understand your core mission: 
              <strong className="text-white"> AI-powered video production at scale with human-quality results.</strong>
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black/50 p-6 rounded-lg border border-purple-500/20">
              <div className="flex items-center mb-4">
                <FaBolt className="text-yellow-400 text-2xl mr-3" />
                <h3 className="text-xl font-semibold">80% Faster Production</h3>
              </div>
              <p className="text-gray-400">
                Your AI studio delivers broadcast-ready content in days, not weeks.
              </p>
            </div>
            
            <div className="bg-black/50 p-6 rounded-lg border border-blue-500/20">
              <div className="flex items-center mb-4">
                <FaUsers className="text-blue-400 text-2xl mr-3" />
                <h3 className="text-xl font-semibold">Elite AI Creators</h3>
              </div>
              <p className="text-gray-400">
                Top 50 global AI creators delivering work that doesn't look AI-generated.
              </p>
            </div>
            
            <div className="bg-black/50 p-6 rounded-lg border border-pink-500/20">
              <div className="flex items-center mb-4">
                <FaGlobe className="text-pink-400 text-2xl mr-3" />
                <h3 className="text-xl font-semibold">Brand-Specific Training</h3>
              </div>
              <p className="text-gray-400">
                AI trained on brand DNA for consistent, localized content.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Proposal Section */}
      <section id="proposal" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Our Proposal for aiKat
            </h2>
            <p className="text-xl text-gray-400 max-w-4xl mx-auto">
              B0ase will build the technical infrastructure to supercharge aiKat's production capabilities 
              and scale your AI-powered video studio to serve millions of brands worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-3xl font-bold mb-6 text-purple-400">
                Technical Infrastructure Partnership
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FaCheck className="text-green-400 mt-1 mr-3 flex-shrink-0" />
                  <p className="text-gray-300">
                    <strong className="text-white">Custom Production Pipeline:</strong> Build scalable backend systems for your AI video generation workflow
                  </p>
                </div>
                <div className="flex items-start">
                  <FaCheck className="text-green-400 mt-1 mr-3 flex-shrink-0" />
                  <p className="text-gray-300">
                    <strong className="text-white">Brand DNA Training Platform:</strong> Develop tools for rapid brand-specific AI model training and deployment
                  </p>
                </div>
                <div className="flex items-start">
                  <FaCheck className="text-green-400 mt-1 mr-3 flex-shrink-0" />
                  <p className="text-gray-300">
                    <strong className="text-white">Client Portal & Dashboard:</strong> Create intuitive interfaces for project management and real-time collaboration
                  </p>
                </div>
                <div className="flex items-start">
                  <FaCheck className="text-green-400 mt-1 mr-3 flex-shrink-0" />
                  <p className="text-gray-300">
                    <strong className="text-white">Multi-format Export Engine:</strong> Automated content optimization for all platforms and formats
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-pink-900/30 p-8 rounded-lg border border-purple-500/30">
              <div className="text-center">
                <div className="text-6xl font-bold text-purple-400 mb-2">60%</div>
                <p className="text-xl text-gray-300 mb-4">Faster Time to Market</p>
                <div className="text-4xl font-bold text-blue-400 mb-2">10x</div>
                <p className="text-xl text-gray-300 mb-4">Scalability Improvement</p>
                <div className="text-4xl font-bold text-pink-400 mb-2">100%</div>
                <p className="text-xl text-gray-300">Custom Brand Training</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              What B0ase Brings to aiKat
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Specialized technical services designed to amplify your AI video production capabilities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-black/50 p-8 rounded-lg border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300">
              <FaCode className="text-purple-400 text-3xl mb-4" />
              <h3 className="text-xl font-semibold mb-4">AI Production Backend</h3>
              <ul className="text-gray-400 space-y-2">
                <li>• High-performance video processing pipeline</li>
                <li>• Real-time collaboration infrastructure</li>
                <li>• Automated quality assurance systems</li>
                <li>• Scalable cloud architecture</li>
              </ul>
            </div>

            <div className="bg-black/50 p-8 rounded-lg border border-blue-500/20 hover:border-blue-500/50 transition-all duration-300">
              <FaPaintBrush className="text-blue-400 text-3xl mb-4" />
              <h3 className="text-xl font-semibold mb-4">Brand Training Platform</h3>
              <ul className="text-gray-400 space-y-2">
                <li>• Custom AI model fine-tuning tools</li>
                <li>• Brand asset management system</li>
                <li>• Style consistency validation</li>
                <li>• Multi-market localization engine</li>
              </ul>
            </div>

            <div className="bg-black/50 p-8 rounded-lg border border-pink-500/20 hover:border-pink-500/50 transition-all duration-300">
              <FaUsers className="text-pink-400 text-3xl mb-4" />
              <h3 className="text-xl font-semibold mb-4">Client Experience Portal</h3>
              <ul className="text-gray-400 space-y-2">
                <li>• Intuitive project dashboard</li>
                <li>• Real-time preview and feedback</li>
                <li>• Collaborative review workflows</li>
                <li>• Automated delivery systems</li>
              </ul>
            </div>

            <div className="bg-black/50 p-8 rounded-lg border border-green-500/20 hover:border-green-500/50 transition-all duration-300">
              <FaRocket className="text-green-400 text-3xl mb-4" />
              <h3 className="text-xl font-semibold mb-4">Performance Optimization</h3>
              <ul className="text-gray-400 space-y-2">
                <li>• AI inference optimization</li>
                <li>• Content delivery network</li>
                <li>• Caching and compression</li>
                <li>• Load balancing solutions</li>
              </ul>
            </div>

            <div className="bg-black/50 p-8 rounded-lg border border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300">
              <FaChartLine className="text-yellow-400 text-3xl mb-4" />
              <h3 className="text-xl font-semibold mb-4">Analytics & Insights</h3>
              <ul className="text-gray-400 space-y-2">
                <li>• Production metrics dashboard</li>
                <li>• Performance analytics</li>
                <li>• Client engagement tracking</li>
                <li>• ROI measurement tools</li>
              </ul>
            </div>

            <div className="bg-black/50 p-8 rounded-lg border border-red-500/20 hover:border-red-500/50 transition-all duration-300">
              <FaCog className="text-red-400 text-3xl mb-4" />
              <h3 className="text-xl font-semibold mb-4">Integration & APIs</h3>
              <ul className="text-gray-400 space-y-2">
                <li>• Third-party tool integrations</li>
                <li>• Custom API development</li>
                <li>• Webhook automation</li>
                <li>• Enterprise system connectivity</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Implementation Timeline */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Implementation Timeline
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Rapid deployment with immediate impact on your production capabilities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-purple-600 text-white text-2xl font-bold w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Week 1-2</h3>
              <p className="text-gray-400">Discovery & Architecture Planning</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-600 text-white text-2xl font-bold w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Week 3-6</h3>
              <p className="text-gray-400">Core Infrastructure Development</p>
            </div>
            
            <div className="text-center">
              <div className="bg-pink-600 text-white text-2xl font-bold w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Week 7-10</h3>
              <p className="text-gray-400">AI Integration & Testing</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-600 text-white text-2xl font-bold w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                4
              </div>
              <h3 className="text-xl font-semibold mb-2">Week 11-12</h3>
              <p className="text-gray-400">Launch & Optimization</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Scale Your AI Studio?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Let's discuss how B0ase can accelerate aiKat's growth and help you serve 10x more brands 
            with the same elite quality standards.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:richard@b0ase.com?subject=aiKat Partnership Proposal"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-8 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center"
            >
              Schedule a Call
              <FaArrowRight className="ml-2" />
            </a>
            <Link
              href="/"
              className="border border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200"
            >
              View Our Portfolio
            </Link>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              Response within 24 hours • Free initial consultation • Custom proposal available
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}