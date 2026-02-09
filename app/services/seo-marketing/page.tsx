'use client';

import React from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaBullhorn, FaSearch, FaChartLine, FaArrowRight, FaCheck } from 'react-icons/fa';
import ProjectImage from '@/components/ProjectImage';

export default function SEOMarketingPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <Link href="/services" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <FaArrowLeft />
          Back to Services
        </Link>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-xl flex items-center justify-center">
            <FaBullhorn className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-5xl font-bold text-white mb-2">
              SEO & Marketing
            </h1>
            <p className="text-xl text-gray-400 mb-2">Online Presence Optimization</p>
          </div>
        </div>
        <p className="text-lg text-gray-400 max-w-3xl leading-relaxed">
          Drive more traffic and conversions with expert SEO and digital marketing strategies tailored to your business.
        </p>
      </div>
      {/* Key Features */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
            SEO & Marketing Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-orange-500/50 transition-all duration-300">
              <FaSearch className="text-orange-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-orange-300">SEO Optimization</h3>
              <p className="text-gray-300">On-page and off-page SEO to improve your search rankings and visibility.</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-yellow-500/50 transition-all duration-300">
              <FaChartLine className="text-yellow-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-yellow-300">Analytics & Reporting</h3>
              <p className="text-gray-300">Detailed analytics and regular reports to track your marketing performance.</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-amber-500/50 transition-all duration-300">
              <FaBullhorn className="text-amber-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-amber-300">Digital Campaigns</h3>
              <p className="text-gray-300">Targeted digital marketing campaigns to drive traffic and conversions.</p>
            </div>
          </div>
        </div>
      </section>
      {/* Pricing Packages */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
            Marketing Packages
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Choose the perfect marketing package for your business. All packages include strategy and reporting.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter Package */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-orange-500/50 transition-all duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-orange-400 mb-2">SEO Starter</h3>
                <div className="text-4xl font-bold text-white mb-2">£700</div>
                <p className="text-gray-400">SEO audit & quick wins</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-orange-400 text-sm" />
                  <span className="text-gray-300">SEO audit & recommendations</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-orange-400 text-sm" />
                  <span className="text-gray-300">Keyword research</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-orange-400 text-sm" />
                  <span className="text-gray-300">On-page optimization</span>
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                Get Started <FaArrowRight />
              </button>
            </div>
            {/* Professional Package */}
            <div className="bg-gray-900/50 backdrop-blur-sm border-2 border-yellow-500 rounded-xl p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-yellow-400 mb-2">Marketing Pro</h3>
                <div className="text-4xl font-bold text-white mb-2">£2,000</div>
                <p className="text-gray-400">Ongoing SEO & campaigns</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-yellow-400 text-sm" />
                  <span className="text-gray-300">Monthly SEO optimization</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-yellow-400 text-sm" />
                  <span className="text-gray-300">Content marketing</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-yellow-400 text-sm" />
                  <span className="text-gray-300">Digital ad campaigns</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-yellow-400 text-sm" />
                  <span className="text-gray-300">Monthly analytics report</span>
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                Start Marketing <FaArrowRight />
              </button>
            </div>
            {/* Enterprise Package */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-amber-500/50 transition-all duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-amber-400 mb-2">Enterprise Marketing</h3>
                <div className="text-4xl font-bold text-white mb-2">£7,000+</div>
                <p className="text-gray-400">Custom marketing strategy</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-amber-400 text-sm" />
                  <span className="text-gray-300">Full SEO & marketing plan</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-amber-400 text-sm" />
                  <span className="text-gray-300">Custom campaigns</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-amber-400 text-sm" />
                  <span className="text-gray-300">Dedicated account manager</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-amber-400 text-sm" />
                  <span className="text-gray-300">Quarterly strategy review</span>
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                Contact Us <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Call to Action */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
            Ready to Grow Your Business?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Let's boost your online presence and drive real results with expert SEO and marketing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
              Start Marketing <FaArrowRight />
            </button>
            <button className="border border-gray-600 hover:border-orange-500 text-gray-300 hover:text-orange-300 font-semibold py-3 px-8 rounded-lg transition-all duration-300">
              View Results
            </button>
          </div>
        </div>
      </section>
    </div>
  );
} 