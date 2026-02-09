'use client';

import React from 'react';
import Link from 'next/link';
import { FaTwitter, FaFacebookF, FaInstagram, FaLinkedinIn, FaChartBar, FaComments, FaArrowLeft, FaHashtag, FaChartLine, FaArrowRight, FaCheck } from 'react-icons/fa';
import ProjectImage from '@/components/ProjectImage'; // Corrected import path

export default function SocialMediaManagementPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <Link href="/services" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <FaArrowLeft />
          Back to Services
        </Link>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
            <FaComments className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-5xl font-bold text-white mb-2">
              Social Media
            </h1>
            <p className="text-xl text-gray-400 mb-2">Content & Management</p>
          </div>
        </div>
        <p className="text-lg text-gray-400 max-w-3xl leading-relaxed">
          Engage your audience and grow your brand with expert social media management and content creation.
        </p>
      </div>
      {/* Key Features */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Social Media Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300">
              <FaHashtag className="text-blue-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-blue-300">Content Creation</h3>
              <p className="text-gray-300">Platform-specific posts, stories, and campaigns tailored to your brand.</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300">
              <FaChartLine className="text-cyan-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-cyan-300">Analytics & Growth</h3>
              <p className="text-gray-300">Track performance and grow your audience with data-driven strategies.</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-sky-500/50 transition-all duration-300">
              <FaComments className="text-sky-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-sky-300">Community Management</h3>
              <p className="text-gray-300">Engage with your followers and build a loyal online community.</p>
            </div>
          </div>
        </div>
      </section>
      {/* Pricing Packages */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Social Packages
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Choose the perfect social media package for your brand. All packages include strategy and reporting.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter Package */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-blue-500/50 transition-all duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-blue-400 mb-2">Social Starter</h3>
                <div className="text-4xl font-bold text-white mb-2">£500</div>
                <p className="text-gray-400">Content & scheduling</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">12 posts/month</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">2 platforms</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">Basic analytics</span>
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                Get Started <FaArrowRight />
              </button>
            </div>
            {/* Professional Package */}
            <div className="bg-gray-900/50 backdrop-blur-sm border-2 border-cyan-500 rounded-xl p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-cyan-400 mb-2">Social Pro</h3>
                <div className="text-4xl font-bold text-white mb-2">£1,200</div>
                <p className="text-gray-400">Growth & engagement</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-cyan-400 text-sm" />
                  <span className="text-gray-300">30 posts/month</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-cyan-400 text-sm" />
                  <span className="text-gray-300">4 platforms</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-cyan-400 text-sm" />
                  <span className="text-gray-300">Advanced analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-cyan-400 text-sm" />
                  <span className="text-gray-300">Community management</span>
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                Start Social <FaArrowRight />
              </button>
            </div>
            {/* Enterprise Package */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-sky-500/50 transition-all duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-sky-400 mb-2">Enterprise Social</h3>
                <div className="text-4xl font-bold text-white mb-2">£4,000+</div>
                <p className="text-gray-400">Custom social strategy</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-sky-400 text-sm" />
                  <span className="text-gray-300">Unlimited posts</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-sky-400 text-sm" />
                  <span className="text-gray-300">All platforms</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-sky-400 text-sm" />
                  <span className="text-gray-300">Dedicated manager</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-sky-400 text-sm" />
                  <span className="text-gray-300">Monthly strategy review</span>
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                Contact Us <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Call to Action */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Ready to Grow Your Socials?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Let's build your brand and grow your audience with expert social media management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
              Start Social <FaArrowRight />
            </button>
            <button className="border border-gray-600 hover:border-blue-500 text-gray-300 hover:text-blue-300 font-semibold py-3 px-8 rounded-lg transition-all duration-300">
              View Results
            </button>
          </div>
        </div>
      </section>
    </div>
  );
} 