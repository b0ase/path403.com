'use client';

import React from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaTools, FaLightbulb, FaChartLine, FaArrowRight, FaCheck } from 'react-icons/fa';
import ProjectImage from '@/components/ProjectImage';

export default function TechnicalConsultingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-lime-400 via-yellow-400 to-amber-400 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-indigo-300 hover:text-indigo-200 mb-8 transition-colors">
            <FaArrowLeft />
            Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-2xl">
              <FaTools className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-5xl font-extrabold text-white drop-shadow-lg flex items-center gap-3 mb-2">
                <FaTools className="inline-block text-4xl align-middle" />
                Consulting
              </h1>
              <p className="text-xl font-semibold text-white/80 mb-2">Expert Technical Advice</p>
            </div>
          </div>
          <p className="text-lg text-gray-300 max-w-3xl leading-relaxed">
            Get expert advice and hands-on support for your technology projects, from strategy to implementation.
          </p>
        </div>
      </div>
      {/* Key Features */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
            Consulting Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-indigo-500/50 transition-all duration-300">
              <FaLightbulb className="text-indigo-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-indigo-300">Strategy & Planning</h3>
              <p className="text-gray-300">Technology roadmaps, architecture, and digital transformation strategies.</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300">
              <FaChartLine className="text-blue-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-blue-300">Performance Analysis</h3>
              <p className="text-gray-300">System audits, code reviews, and performance optimization.</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300">
              <FaTools className="text-cyan-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-cyan-300">Implementation Support</h3>
              <p className="text-gray-300">Hands-on help with deployment, integration, and troubleshooting.</p>
            </div>
          </div>
        </div>
      </section>
      {/* Pricing Packages */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
            Consulting Packages
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Choose the perfect consulting package for your needs. All packages include strategy sessions and follow-up support.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter Package */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-indigo-500/50 transition-all duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-indigo-400 mb-2">Consult Starter</h3>
                <div className="text-4xl font-bold text-white mb-2">£800</div>
                <p className="text-gray-400">Strategy session</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-indigo-400 text-sm" />
                  <span className="text-gray-300">1-hour strategy call</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-indigo-400 text-sm" />
                  <span className="text-gray-300">Project review</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-indigo-400 text-sm" />
                  <span className="text-gray-300">Action plan</span>
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                Get Started <FaArrowRight />
              </button>
            </div>
            {/* Professional Package */}
            <div className="bg-gray-900/50 backdrop-blur-sm border-2 border-blue-500 rounded-xl p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-blue-400 mb-2">Consult Pro</h3>
                <div className="text-4xl font-bold text-white mb-2">£2,500</div>
                <p className="text-gray-400">Ongoing support</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">3 strategy sessions</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">Performance audit</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">Implementation support</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">Follow-up report</span>
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                Start Consulting <FaArrowRight />
              </button>
            </div>
            {/* Enterprise Package */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-cyan-500/50 transition-all duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-cyan-400 mb-2">Enterprise Consult</h3>
                <div className="text-4xl font-bold text-white mb-2">£8,000+</div>
                <p className="text-gray-400">Custom consulting</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-cyan-400 text-sm" />
                  <span className="text-gray-300">Full project audit</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-cyan-400 text-sm" />
                  <span className="text-gray-300">Ongoing consulting</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-cyan-400 text-sm" />
                  <span className="text-gray-300">Dedicated consultant</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-cyan-400 text-sm" />
                  <span className="text-gray-300">Strategy review</span>
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                Contact Us <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Call to Action */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
            Ready for Expert Advice?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Let's solve your toughest tech challenges and accelerate your success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
              Start Consulting <FaArrowRight />
            </button>
            <button className="border border-gray-600 hover:border-indigo-500 text-gray-300 hover:text-indigo-300 font-semibold py-3 px-8 rounded-lg transition-all duration-300">
              View Results
            </button>
          </div>
        </div>
      </section>
    </div>
  );
} 