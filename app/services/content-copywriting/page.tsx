'use client';

import React from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaPen, FaNewspaper, FaFileAlt, FaSearchDollar, FaComments, FaBullhorn } from 'react-icons/fa';

export default function ContentCopywritingPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-4">
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <Link href="/services" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <FaArrowLeft />
          Back to Services
        </Link>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <FaPen className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-5xl font-bold text-white mb-2">
              Content & Copywriting
            </h1>
            <p className="text-xl text-gray-400 mb-2">Words That Convert</p>
          </div>
        </div>
        <p className="text-lg text-gray-400 max-w-3xl leading-relaxed">
          Crafting compelling narratives, articles, and website copy tailored to your audience. 
          Transform your brand voice into powerful content that engages and converts.
        </p>
      </div>
      
      <div className="py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Our Content Services
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-green-500/50 transition-all duration-300">
              <FaFileAlt className="text-green-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-green-300">Website Copy</h3>
              <p className="text-gray-300">Compelling homepage, about, and landing page copy that tells your story and drives action.</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-emerald-500/50 transition-all duration-300">
              <FaNewspaper className="text-emerald-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-emerald-300">Blog Content</h3>
              <p className="text-gray-300">SEO-optimized articles and blog posts that establish authority and drive organic traffic.</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-teal-500/50 transition-all duration-300">
              <FaBullhorn className="text-teal-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-teal-300">Email Marketing</h3>
              <p className="text-gray-300">Compelling email campaigns with persuasive copy that nurtures leads, builds relationships, and drives conversions.</p>
            </div>
          </div>
        </div>
      </div>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Content Packages
          </h2>
          <p className="text-center text-gray-400 mb-12">Professional content solutions for every need</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-8 hover:border-green-500/50 transition-all duration-300">
              <h3 className="text-2xl font-bold text-green-300 mb-4">Website Copy</h3>
              <div className="text-4xl font-bold text-white mb-2">£2,500</div>
              <p className="text-gray-400 mb-6">Complete website copywriting</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <FaFileAlt className="text-green-400 flex-shrink-0" />
                  Homepage & key pages
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <FaSearchDollar className="text-green-400 flex-shrink-0" />
                  SEO optimization
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <FaComments className="text-green-400 flex-shrink-0" />
                  Brand voice development
                </li>
              </ul>
            </div>

            <div className="bg-gray-900/50 border border-green-500 rounded-xl p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-black px-4 py-2 rounded-full text-sm font-bold">Most Popular</span>
              </div>
              <h3 className="text-2xl font-bold text-green-300 mb-4">Content Package</h3>
              <div className="text-4xl font-bold text-white mb-2">£5,000</div>
              <p className="text-gray-400 mb-6">Website + blog content</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <FaFileAlt className="text-green-400 flex-shrink-0" />
                  Complete website copy
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <FaNewspaper className="text-green-400 flex-shrink-0" />
                  10 blog articles
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <FaBullhorn className="text-green-400 flex-shrink-0" />
                  Email sequence (5 emails)
                </li>
              </ul>
            </div>

            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-8 hover:border-green-500/50 transition-all duration-300">
              <h3 className="text-2xl font-bold text-green-300 mb-4">Enterprise</h3>
              <div className="text-4xl font-bold text-white mb-2">£10,000+</div>
              <p className="text-gray-400 mb-6">Comprehensive content strategy</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <FaNewspaper className="text-green-400 flex-shrink-0" />
                  Monthly content creation
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <FaBullhorn className="text-green-400 flex-shrink-0" />
                  Multi-channel campaigns
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <FaComments className="text-green-400 flex-shrink-0" />
                  Dedicated content manager
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Ready to Elevate Your Content?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Let's create compelling content that speaks to your audience and drives results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300">
              Get Started
            </button>
            <button className="border border-gray-600 hover:border-green-500 text-gray-300 hover:text-green-300 font-semibold py-3 px-8 rounded-lg transition-all duration-300">
              View Samples
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}