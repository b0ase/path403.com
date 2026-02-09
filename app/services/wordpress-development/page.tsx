'use client';

import React from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaWordpress, FaPalette, FaMobileAlt, FaRocket, FaShieldAlt, FaCog, FaCheck, FaArrowRight, FaStar } from 'react-icons/fa';

export default function WordPressDevelopmentPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <Link href="/services" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <FaArrowLeft />
          Back to Services
        </Link>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <FaWordpress className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-5xl font-bold text-white mb-2">
              WordPress Development
            </h1>
            <p className="text-xl text-gray-400 mb-2">Professional Websites with Elementor Pro</p>
          </div>
        </div>
        <p className="text-lg text-gray-400 max-w-3xl leading-relaxed">
          Create stunning, responsive WordPress websites and landing pages using Elementor Pro. 
          From business websites to e-commerce stores, I deliver pixel-perfect designs that convert visitors into customers.
        </p>
      </div>

      {/* Key Features */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            WordPress & Elementor Pro Expertise
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300">
              <FaPalette className="text-blue-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-blue-300">Custom Design</h3>
              <p className="text-gray-300">Pixel-perfect designs using Elementor Pro with custom styling, animations, and interactive elements.</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-indigo-500/50 transition-all duration-300">
              <FaMobileAlt className="text-indigo-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-indigo-300">Responsive Design</h3>
              <p className="text-gray-300">Mobile-first approach ensuring your website looks and works perfectly on all devices and screen sizes.</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300">
              <FaRocket className="text-purple-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-purple-300">Performance Optimized</h3>
              <p className="text-gray-300">Fast-loading websites with optimized images, caching, and clean code for better user experience and SEO.</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-green-500/50 transition-all duration-300">
              <FaShieldAlt className="text-green-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-green-300">Security & Updates</h3>
              <p className="text-gray-300">Secure WordPress installations with regular updates, backups, and security monitoring to protect your site.</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300">
              <FaCog className="text-cyan-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-cyan-300">Custom Functionality</h3>
              <p className="text-gray-300">Custom plugins, themes, and functionality tailored to your specific business needs and requirements.</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-yellow-500/50 transition-all duration-300">
              <FaStar className="text-yellow-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-yellow-300">SEO Optimized</h3>
              <p className="text-gray-300">Search engine optimized websites with proper meta tags, schema markup, and content structure for better rankings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Packages */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            WordPress Packages
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Choose the perfect WordPress package for your business. All packages include Elementor Pro and responsive design.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Basic Package */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-blue-500/50 transition-all duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-blue-400 mb-2">Basic Website</h3>
                <div className="text-4xl font-bold text-white mb-2">$300</div>
                <p className="text-gray-400">Perfect for small businesses</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">Up to 5 pages</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">Elementor Pro design</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">Responsive design</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">Contact form</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">Basic SEO setup</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">1 month support</span>
                </li>
              </ul>
              
              <Link href="https://www.fiverr.com/richardboase/build-a-responsive-wordpress-website-or-landing-page-with-elementor-pro" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                Order on Fiverr <FaArrowRight />
              </Link>
            </div>

            {/* Professional Package */}
            <div className="bg-gray-900/50 backdrop-blur-sm border-2 border-indigo-500 rounded-xl p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-indigo-400 mb-2">Professional Website</h3>
                <div className="text-4xl font-bold text-white mb-2">$800</div>
                <p className="text-gray-400">For growing businesses</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-indigo-400 text-sm" />
                  <span className="text-gray-300">Up to 10 pages</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-indigo-400 text-sm" />
                  <span className="text-gray-300">Custom Elementor design</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-indigo-400 text-sm" />
                  <span className="text-gray-300">Advanced animations</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-indigo-400 text-sm" />
                  <span className="text-gray-300">Blog functionality</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-indigo-400 text-sm" />
                  <span className="text-gray-300">Advanced SEO optimization</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-indigo-400 text-sm" />
                  <span className="text-gray-300">Performance optimization</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-indigo-400 text-sm" />
                  <span className="text-gray-300">3 months support</span>
                </li>
              </ul>
              
              <Link href="https://www.fiverr.com/richardboase/build-a-responsive-wordpress-website-or-landing-page-with-elementor-pro" 
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                Order on Fiverr <FaArrowRight />
              </Link>
            </div>

            {/* Premium Package */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-purple-500/50 transition-all duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-purple-400 mb-2">Premium Website</h3>
                <div className="text-4xl font-bold text-white mb-2">$1,500</div>
                <p className="text-gray-400">Complete solution</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-purple-400 text-sm" />
                  <span className="text-gray-300">Unlimited pages</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-purple-400 text-sm" />
                  <span className="text-gray-300">Custom theme development</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-purple-400 text-sm" />
                  <span className="text-gray-300">E-commerce integration</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-purple-400 text-sm" />
                  <span className="text-gray-300">Custom plugins</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-purple-400 text-sm" />
                  <span className="text-gray-300">Advanced security</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-purple-400 text-sm" />
                  <span className="text-gray-300">Speed optimization</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-purple-400 text-sm" />
                  <span className="text-gray-300">6 months support</span>
                </li>
              </ul>
              
              <Link href="https://www.fiverr.com/richardboase/build-a-responsive-wordpress-website-or-landing-page-with-elementor-pro" 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                Order on Fiverr <FaArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose WordPress */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Why Choose WordPress with Elementor Pro?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-blue-300">WordPress Benefits</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <FaCheck className="text-blue-400 text-lg mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">User-Friendly CMS</h4>
                    <p className="text-gray-300">Easy content management for non-technical users with intuitive admin interface.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheck className="text-blue-400 text-lg mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">SEO-Friendly</h4>
                    <p className="text-gray-300">Built-in SEO features and clean code structure for better search engine rankings.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheck className="text-blue-400 text-lg mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">Scalable & Flexible</h4>
                    <p className="text-gray-300">Grow your website with plugins and custom functionality as your business expands.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheck className="text-blue-400 text-lg mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">Cost-Effective</h4>
                    <p className="text-gray-300">Open-source platform with affordable hosting and maintenance costs.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-6 text-indigo-300">Elementor Pro Advantages</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <FaCheck className="text-indigo-400 text-lg mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">Visual Page Builder</h4>
                    <p className="text-gray-300">Drag-and-drop interface for creating stunning layouts without coding knowledge.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheck className="text-indigo-400 text-lg mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">Advanced Widgets</h4>
                    <p className="text-gray-300">Professional widgets for forms, sliders, testimonials, and interactive elements.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheck className="text-indigo-400 text-lg mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">Theme Builder</h4>
                    <p className="text-gray-300">Create custom headers, footers, and templates for consistent branding.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheck className="text-indigo-400 text-lg mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">Performance Optimized</h4>
                    <p className="text-gray-300">Clean, optimized code that loads fast and provides excellent user experience.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Ready to Build Your WordPress Website?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Let's create a stunning, professional website that converts visitors into customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="https://www.fiverr.com/richardboase/build-a-responsive-wordpress-website-or-landing-page-with-elementor-pro" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
              Order on Fiverr <FaArrowRight />
            </Link>
            <Link href="/contact" 
                  className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
              Contact Me
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 