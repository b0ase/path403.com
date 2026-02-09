'use client';

import React from 'react';
import Link from 'next/link';
import { FaVideo, FaCamera, FaEdit, FaPlane, FaLightbulb, FaFilm, FaArrowLeft, FaArrowRight, FaCheck } from 'react-icons/fa';
import ProjectImage from '@/components/ProjectImage';

export default function VideoProductionPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <Link href="/services" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <FaArrowLeft />
          Back to Services
        </Link>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-600 rounded-xl flex items-center justify-center">
            <FaVideo className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-5xl font-bold text-white mb-2">
              Video & Photo
            </h1>
            <p className="text-xl text-gray-400 mb-2">Production & Photography</p>
          </div>
        </div>
        <p className="text-lg text-gray-400 max-w-3xl leading-relaxed">
          Captivate your audience with high-quality video production, from concept to final cut. We bring your story to life with creativity and technical excellence.
        </p>
      </div>

      {/* Pricing Information */}
      <section className="px-4 md:px-8 py-6 mb-8">
        <p className="text-gray-300 text-base">
          Est. Rate: £110/hr | £450/day. UK VAT added where applicable. Fixed-price projects negotiable.
        </p>
      </section>

      {/* Services Grid */}
      <section className="px-4 md:px-8 py-8 mb-16">
        <h2 className="text-2xl font-bold mb-6">Our Visual Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-black p-6 border border-gray-800 shadow-xl flex flex-col">
            <div className="flex items-center mb-4">
              <FaVideo className="text-white mr-3 text-xl" />
              <h3 className="font-semibold text-xl">Promotional Videos</h3>
            </div>
            <p className="text-gray-400 flex-grow">Engaging videos that showcase your brand, products, or services with professional storytelling and high production value.</p>
          </div>
          
          <div className="bg-black p-6 border border-gray-800 shadow-xl flex flex-col">
            <div className="flex items-center mb-4">
              <FaCamera className="text-white mr-3 text-xl" />
              <h3 className="font-semibold text-xl">Product Photography</h3>
            </div>
            <p className="text-gray-400 flex-grow">High-quality product images for e-commerce, catalogs, and marketing materials with perfect lighting and composition.</p>
          </div>
          
          <div className="bg-black p-6 border border-gray-800 shadow-xl flex flex-col">
            <div className="flex items-center mb-4">
              <FaEdit className="text-white mr-3 text-xl" />
              <h3 className="font-semibold text-xl">Post-Production</h3>
            </div>
            <p className="text-gray-400 flex-grow">Professional editing, color grading, and visual effects that elevate your video content to a cinematic level.</p>
          </div>
          
          <div className="bg-black p-6 border border-gray-800 shadow-xl flex flex-col">
            <div className="flex items-center mb-4">
              <FaPlane className="text-white mr-3 text-xl" />
              <h3 className="font-semibold text-xl">Aerial Photography</h3>
            </div>
            <p className="text-gray-400 flex-grow">Breathtaking drone footage and photography that provides unique perspectives for real estate, events, and landscape showcases.</p>
          </div>
          
          <div className="bg-black p-6 border border-gray-800 shadow-xl flex flex-col">
            <div className="flex items-center mb-4">
              <FaLightbulb className="text-white mr-3 text-xl" />
              <h3 className="font-semibold text-xl">Creative Direction</h3>
            </div>
            <p className="text-gray-400 flex-grow">Strategic visual concept development that aligns with your brand identity and achieves your specific marketing objectives.</p>
          </div>
          
          <div className="bg-black p-6 border border-gray-800 shadow-xl flex flex-col">
            <div className="flex items-center mb-4">
              <FaFilm className="text-white mr-3 text-xl" />
              <h3 className="font-semibold text-xl">Corporate Videos</h3>
            </div>
            <p className="text-gray-400 flex-grow">Professional corporate videos including company profiles, interviews, event documentation, and internal communication videos.</p>
          </div>
        </div>
      </section>

      {/* Portfolio Showcase */}
      <section className="px-4 md:px-8 py-8 mb-16">
        <h2 className="text-2xl font-bold mb-6">Featured Work</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Project 1: Product Launch Video */}
          <div className="bg-black border border-gray-800 shadow-xl overflow-hidden">
            <ProjectImage 
              service="video-production"
              projectId="product-launch-video"
              title="Product Launch Video"
            />
            <div className="p-6">
              <h3 className="font-bold text-xl mb-2">Product Launch Video</h3>
              <p className="text-gray-400 mb-3">
                Cinematic product reveal video that generated over 100,000 views and contributed to a successful launch campaign.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Product', 'Cinematic', 'Marketing', 'Commercial'].map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-800 text-cyan-400 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Project 2: Corporate Brand Photography */}
          <div className="bg-black border border-gray-800 shadow-xl overflow-hidden">
            <ProjectImage 
              service="video-production"
              projectId="corporate-brand-photo"
              title="Corporate Brand Photography"
            />
            <div className="p-6">
              <h3 className="font-bold text-xl mb-2">Corporate Brand Photography</h3>
              <p className="text-gray-400 mb-3">
                Complete visual identity photography package including team portraits, office environment, and product imagery.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Corporate', 'Photography', 'Branding', 'Portrait'].map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-800 text-cyan-400 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Project 3: Event Highlight Reel */}
          <div className="bg-black border border-gray-800 shadow-xl overflow-hidden">
            <ProjectImage 
              service="video-production"
              projectId="event-highlight-reel"
              title="Event Highlight Reel"
            />
            <div className="p-6">
              <h3 className="font-bold text-xl mb-2">Event Highlight Reel</h3>
              <p className="text-gray-400 mb-3">
                Dynamic event video capturing key moments, presentations, and attendee experiences for a major industry conference.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Event', 'Documentary', 'Highlights', 'Social Media'].map((tag, index) => (
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
        <h2 className="text-2xl font-bold mb-6">Our Production Process</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 border-l-2 border-cyan-500">
            <h3 className="font-bold text-xl mb-2">1. Concept Development</h3>
            <p className="text-gray-400">We begin by understanding your objectives and developing a creative concept that aligns with your brand and messaging.</p>
          </div>
          
          <div className="p-6 border-l-2 border-cyan-500">
            <h3 className="font-bold text-xl mb-2">2. Pre-Production</h3>
            <p className="text-gray-400">Detailed planning including storyboarding, location scouting, talent casting, and equipment preparation ensures smooth execution.</p>
          </div>
          
          <div className="p-6 border-l-2 border-cyan-500">
            <h3 className="font-bold text-xl mb-2">3. Production</h3>
            <p className="text-gray-400">Professional filming or photography session with experienced crew, high-end equipment, and meticulous attention to detail.</p>
          </div>
          
          <div className="p-6 border-l-2 border-cyan-500">
            <h3 className="font-bold text-xl mb-2">4. Post-Production</h3>
            <p className="text-gray-400">Expert editing, color grading, sound design, and visual effects to create a polished final product that exceeds expectations.</p>
          </div>
          
          <div className="p-6 border-l-2 border-cyan-500">
            <h3 className="font-bold text-xl mb-2">5. Review & Refinement</h3>
            <p className="text-gray-400">Collaborative review process with opportunities for feedback and refinements to ensure the final result meets your vision.</p>
          </div>
          
          <div className="p-6 border-l-2 border-cyan-500">
            <h3 className="font-bold text-xl mb-2">6. Delivery & Distribution</h3>
            <p className="text-gray-400">Final delivery in optimal formats for your intended platforms, with guidance on effective distribution strategies if needed.</p>
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
              <p className="text-gray-300 mb-4 italic">"B0ASE's video production team transformed our vision into a stunning visual story. The quality of the final product far exceeded our expectations and helped us establish a strong brand presence."</p>
              <div>
                <p className="font-semibold text-white">Jonathan Peters</p>
                <p className="text-gray-400 text-sm">Marketing Director, Innovate Tech</p>
              </div>
            </div>
          </div>
          
          <div className="bg-black p-6 border border-gray-800 shadow-xl relative">
            <div className="text-4xl text-cyan-500 opacity-30 absolute top-4 left-4">"</div>
            <div className="relative z-10">
              <p className="text-gray-300 mb-4 italic">"The product photography B0ASE created for our e-commerce store has dramatically improved our conversion rates. Their attention to detail and ability to highlight our products' best features is remarkable."</p>
              <div>
                <p className="font-semibold text-white">Emily Watson</p>
                <p className="text-gray-400 text-sm">Founder, Artisan Goods</p>
              </div>
            </div>
          </div>
          
          <div className="bg-black p-6 border border-gray-800 shadow-xl relative">
            <div className="text-4xl text-cyan-500 opacity-30 absolute top-4 left-4">"</div>
            <div className="relative z-10">
              <p className="text-gray-300 mb-4 italic">"We hired B0ASE to document our annual conference, and the highlight video they produced perfectly captured the energy and key moments. It's become an invaluable marketing asset for our next event."</p>
              <div>
                <p className="font-semibold text-white">Daniel Kim</p>
                <p className="text-gray-400 text-sm">Event Coordinator, Global Summits</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Equipment */}
      <section className="px-4 md:px-8 py-8 mb-16">
        <h2 className="text-2xl font-bold mb-6">Our Equipment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['Sony Cinema Cameras', 'RED Digital Cinema', 'DJI Drone Systems', 'Professional Lighting',
            'Canon DSLR Systems', 'Cinema Lenses', 'Studio Audio Equipment', 'Stabilization Gear'].map((equipment, index) => (
            <div key={index} className="bg-black p-4 border border-gray-800 shadow-xl text-center">
              <span className="font-medium text-gray-300">{equipment}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Packages */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Video Packages
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Choose the perfect video package for your needs. All packages include consultation and revisions.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter Package */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-red-500/50 transition-all duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-red-400 mb-2">Video Starter</h3>
                <div className="text-4xl font-bold text-white mb-2">£1,000</div>
                <p className="text-gray-400">Short promo video</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-red-400 text-sm" />
                  <span className="text-gray-300">1-minute video</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-red-400 text-sm" />
                  <span className="text-gray-300">Basic editing</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-red-400 text-sm" />
                  <span className="text-gray-300">Royalty-free music</span>
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                Get Started <FaArrowRight />
              </button>
            </div>
            {/* Professional Package */}
            <div className="bg-gray-900/50 backdrop-blur-sm border-2 border-orange-500 rounded-xl p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-orange-400 mb-2">Video Pro</h3>
                <div className="text-4xl font-bold text-white mb-2">£3,000</div>
                <p className="text-gray-400">Full production</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-orange-400 text-sm" />
                  <span className="text-gray-300">Up to 5 minutes</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-orange-400 text-sm" />
                  <span className="text-gray-300">On-location shoot</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-orange-400 text-sm" />
                  <span className="text-gray-300">Advanced editing</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-orange-400 text-sm" />
                  <span className="text-gray-300">2 rounds of revisions</span>
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                Start Video <FaArrowRight />
              </button>
            </div>
            {/* Enterprise Package */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-yellow-500/50 transition-all duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-yellow-400 mb-2">Enterprise Video</h3>
                <div className="text-4xl font-bold text-white mb-2">£10,000+</div>
                <p className="text-gray-400">Custom cinematic</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-yellow-400 text-sm" />
                  <span className="text-gray-300">Full creative team</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-yellow-400 text-sm" />
                  <span className="text-gray-300">Scriptwriting & storyboarding</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-yellow-400 text-sm" />
                  <span className="text-gray-300">Multiple locations</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-yellow-400 text-sm" />
                  <span className="text-gray-300">Unlimited revisions</span>
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-yellow-600 to-red-600 hover:from-yellow-500 hover:to-red-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                Contact Us <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Ready to Tell Your Story?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Let's create a video that inspires, informs, and drives results for your brand.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
              Start Video <FaArrowRight />
            </button>
            <button className="border border-gray-600 hover:border-red-500 text-gray-300 hover:text-red-300 font-semibold py-3 px-8 rounded-lg transition-all duration-300">
              View Portfolio
            </button>
          </div>
        </div>
      </section>
    </div>
  );
} 