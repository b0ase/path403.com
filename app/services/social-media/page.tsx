'use client';

import React from 'react';
import Link from 'next/link';
import { FaTwitter, FaFacebookF, FaInstagram, FaLinkedinIn, FaChartBar, FaComments } from 'react-icons/fa';
import ProjectImage from '@/components/ProjectImage';

export default function SocialMediaPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="w-full px-4 md:px-8 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4"><span className="text-cyan-400">//</span> Social Media Management</h1>
        <p className="text-xl text-gray-300 max-w-4xl">
          Developing strategies, creating content, and managing social media presence to grow engagement and reach.
        </p>
      </header>

      {/* Pricing Information */}
      <section className="px-4 md:px-8 py-6 mb-8">
        <p className="text-gray-300 text-base">
          Est. Rate: £80/hr | Retainer. UK VAT added where applicable. Fixed-price projects negotiable.
        </p>
      </section>

      {/* Services Grid */}
      <section className="px-4 md:px-8 py-8 mb-16">
        <h2 className="text-2xl font-bold mb-6">Our Social Media Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-black p-6 border border-gray-800 shadow-xl flex flex-col">
            <div className="flex items-center mb-4">
              <FaChartBar className="text-white mr-3 text-xl" />
              <h3 className="font-semibold text-xl">Social Strategy</h3>
            </div>
            <p className="text-gray-400 flex-grow">Development of comprehensive social media strategies tailored to your business goals, target audience, and brand identity.</p>
          </div>
          
          <div className="bg-black p-6 border border-gray-800 shadow-xl flex flex-col">
            <div className="flex items-center mb-4">
              <FaComments className="text-white mr-3 text-xl" />
              <h3 className="font-semibold text-xl">Content Creation</h3>
            </div>
            <p className="text-gray-400 flex-grow">Production of engaging, platform-optimized content including graphics, videos, stories, and captions that resonate with your audience.</p>
          </div>
          
          <div className="bg-black p-6 border border-gray-800 shadow-xl flex flex-col">
            <div className="flex items-center mb-4">
              <FaTwitter className="text-white mr-3 text-xl" />
              <h3 className="font-semibold text-xl">Twitter Management</h3>
            </div>
            <p className="text-gray-400 flex-grow">Strategic management of your Twitter presence including tweet scheduling, community engagement, and trend monitoring.</p>
          </div>
          
          <div className="bg-black p-6 border border-gray-800 shadow-xl flex flex-col">
            <div className="flex items-center mb-4">
              <FaFacebookF className="text-white mr-3 text-xl" />
              <h3 className="font-semibold text-xl">Facebook Management</h3>
            </div>
            <p className="text-gray-400 flex-grow">Comprehensive Facebook page management including content strategy, community building, and advertising campaign optimization.</p>
          </div>
          
          <div className="bg-black p-6 border border-gray-800 shadow-xl flex flex-col">
            <div className="flex items-center mb-4">
              <FaInstagram className="text-white mr-3 text-xl" />
              <h3 className="font-semibold text-xl">Instagram Growth</h3>
            </div>
            <p className="text-gray-400 flex-grow">Strategic Instagram management focused on audience growth, content planning, hashtag strategy, and engagement tactics.</p>
          </div>
          
          <div className="bg-black p-6 border border-gray-800 shadow-xl flex flex-col">
            <div className="flex items-center mb-4">
              <FaLinkedinIn className="text-white mr-3 text-xl" />
              <h3 className="font-semibold text-xl">LinkedIn Optimization</h3>
            </div>
            <p className="text-gray-400 flex-grow">Professional LinkedIn content and engagement strategies to position your brand as an industry authority and generate B2B leads.</p>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="px-4 md:px-8 py-8 mb-16">
        <h2 className="text-2xl font-bold mb-6">Social Media Success Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Case Study 1: Retail Brand Growth */}
          <div className="bg-black border border-gray-800 shadow-xl overflow-hidden">
            <div className="h-48 bg-gray-800 relative">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <span className="text-gray-600 text-lg">[Case Study 1]</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-xl mb-2">Retail Brand Growth</h3>
              <p className="text-gray-400 mb-3">
                Increased Instagram following by 320% and engagement by 215% over six months for a retail brand, resulting in a 45% boost in website traffic.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Instagram', 'Retail', 'E-commerce', '+320% Growth'].map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-800 text-cyan-400 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Case Study 2: B2B Thought Leadership */}
          <div className="bg-black border border-gray-800 shadow-xl overflow-hidden">
            <div className="h-48 bg-gray-800 relative">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <span className="text-gray-600 text-lg">[Case Study 2]</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-xl mb-2">B2B Thought Leadership</h3>
              <p className="text-gray-400 mb-3">
                Established a B2B SaaS company as an industry thought leader through strategic LinkedIn content, generating 120+ qualified leads in three months.
              </p>
              <div className="flex flex-wrap gap-2">
                {['LinkedIn', 'B2B', 'Content', 'Lead Generation'].map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-800 text-cyan-400 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Case Study 3: Startup Community Building */}
          <div className="bg-black border border-gray-800 shadow-xl overflow-hidden">
            <div className="h-48 bg-gray-800 relative">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <span className="text-gray-600 text-lg">[Case Study 3]</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-xl mb-2">Startup Community Building</h3>
              <p className="text-gray-400 mb-3">
                Built a vibrant community of 5,000+ followers across platforms for a tech startup, creating a foundation for successful product launch.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Community', 'Multi-Platform', 'Startup', 'Engagement'].map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-800 text-cyan-400 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="px-4 md:px-8 py-8 mb-16 bg-black border border-gray-800 shadow-xl">
        <h2 className="text-2xl font-bold mb-6">Our Social Media Process</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 border-l-2 border-cyan-500">
            <h3 className="font-bold text-xl mb-2">1. Audit & Analysis</h3>
            <p className="text-gray-400">Comprehensive review of your current social media presence, competitor analysis, and audience research to establish a baseline.</p>
          </div>
          
          <div className="p-6 border-l-2 border-cyan-500">
            <h3 className="font-bold text-xl mb-2">2. Strategy Development</h3>
            <p className="text-gray-400">Creation of a tailored social media strategy with platform selection, content pillars, and KPIs aligned with your business objectives.</p>
          </div>
          
          <div className="p-6 border-l-2 border-cyan-500">
            <h3 className="font-bold text-xl mb-2">3. Content Planning</h3>
            <p className="text-gray-400">Development of a content calendar with planned posts, campaigns, and themes to maintain consistent engagement and brand messaging.</p>
          </div>
          
          <div className="p-6 border-l-2 border-cyan-500">
            <h3 className="font-bold text-xl mb-2">4. Content Creation</h3>
            <p className="text-gray-400">Production of high-quality, platform-optimized content including graphics, captions, stories, and videos that resonate with your audience.</p>
          </div>
          
          <div className="p-6 border-l-2 border-cyan-500">
            <h3 className="font-bold text-xl mb-2">5. Community Management</h3>
            <p className="text-gray-400">Active engagement with your audience through comments, messages, and interactions to build relationships and foster community.</p>
          </div>
          
          <div className="p-6 border-l-2 border-cyan-500">
            <h3 className="font-bold text-xl mb-2">6. Analytics & Optimization</h3>
            <p className="text-gray-400">Regular performance tracking, reporting, and strategy refinement based on data to continuously improve results and ROI.</p>
          </div>
        </div>
      </section>

      {/* Client Testimonials */}
      <section className="px-4 md:px-8 py-8 mb-16">
        <h2 className="text-2xl font-bold mb-6">Client Testimonials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-black p-6 border border-gray-800 shadow-xl relative">
            <div className="text-4xl text-cyan-500 opacity-30 absolute top-4 left-4">"</div>
            <div className="relative z-10">
              <p className="text-gray-300 mb-4 italic">"B0ASE completely transformed our social media presence. Their strategic approach and creative content has exponentially increased our engagement and following, translating directly to increased sales."</p>
              <div>
                <p className="font-semibold text-white">Amanda Richards</p>
                <p className="text-gray-400 text-sm">Marketing Manager, Urban Style Co.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-black p-6 border border-gray-800 shadow-xl relative">
            <div className="text-4xl text-cyan-500 opacity-30 absolute top-4 left-4">"</div>
            <div className="relative z-10">
              <p className="text-gray-300 mb-4 italic">"Working with B0ASE on our LinkedIn strategy has been game-changing for our B2B sales pipeline. Their content approach has positioned us as thought leaders in our industry and significantly increased qualified leads."</p>
              <div>
                <p className="font-semibold text-white">Michael Thompson</p>
                <p className="text-gray-400 text-sm">CEO, Enterprise Solutions Inc.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-black p-6 border border-gray-800 shadow-xl relative">
            <div className="text-4xl text-cyan-500 opacity-30 absolute top-4 left-4">"</div>
            <div className="relative z-10">
              <p className="text-gray-300 mb-4 italic">"The B0ASE team not only manages our social media but has built a genuine community around our brand. Their engagement strategies and authentic approach has created a loyal following that truly values our products."</p>
              <div>
                <p className="font-semibold text-white">Sophia Lee</p>
                <p className="text-gray-400 text-sm">Founder, Green Life Products</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="px-4 md:px-8 py-8 mb-16">
        <h2 className="text-2xl font-bold mb-6">Platforms We Specialize In</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {['Instagram', 'Facebook', 'Twitter/X', 'LinkedIn', 'TikTok', 'YouTube',
            'Pinterest', 'Reddit', 'Discord', 'Snapchat', 'Threads', 'Clubhouse'].map((platform, index) => (
            <div key={index} className="bg-black p-4 border border-gray-800 shadow-xl text-center">
              <span className="font-medium text-gray-300">{platform}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-4 md:px-8 py-12 text-center mb-8">
        <Link 
          href="/contact"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 transition duration-200"
        >
          Get in Touch
        </Link>
      </section>
    </div>
  );
} 