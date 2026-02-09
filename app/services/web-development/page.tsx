'use client';

import React from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaCode, FaLaptopCode, FaMobileAlt, FaServer, FaShoppingCart, FaChartLine, FaArrowRight, FaCheck } from 'react-icons/fa';
import ProjectImage from '@/components/ProjectImage';

export default function WebDevelopmentPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <Link href="/services" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <FaArrowLeft />
          Back to Services
        </Link>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <FaLaptopCode className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-5xl font-bold text-white mb-2">
              Web Development
            </h1>
            <p className="text-xl text-gray-400 mb-2">Responsive Websites & Apps</p>
          </div>
        </div>
        <p className="text-lg text-gray-400 max-w-3xl leading-relaxed">
          Building responsive, performant websites & applications using modern technologies, 
          including WordPress with Elementor Pro, Web3, crypto & blockchain integrations. From custom websites to complex web applications.
        </p>
      </div>

      {/* Key Features */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            What We Offer
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300">
              <FaLaptopCode className="text-blue-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-blue-300">Custom Website Development</h3>
              <p className="text-gray-300">Bespoke websites designed and built from scratch to meet your specific requirements and business goals.</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300">
              <FaShoppingCart className="text-cyan-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-cyan-300">E-commerce Solutions</h3>
              <p className="text-gray-300">Fully-featured online stores with secure payment gateways, inventory management, and customer accounts.</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-teal-500/50 transition-all duration-300">
              <FaMobileAlt className="text-teal-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-teal-300">Responsive Web Apps</h3>
              <p className="text-gray-300">Progressive web applications that work seamlessly across all devices and screen sizes.</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300">
              <FaCode className="text-blue-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-blue-300">Web3 & Blockchain</h3>
              <p className="text-gray-300">Integration of Web3 technologies, cryptocurrency payments, and blockchain features into your web solutions.</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300">
              <FaServer className="text-cyan-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-cyan-300">API Development</h3>
              <p className="text-gray-300">Custom RESTful or GraphQL APIs to power your applications and integrate with third-party services.</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-teal-500/50 transition-all duration-300">
              <FaChartLine className="text-teal-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-teal-300">Performance Optimization</h3>
              <p className="text-gray-300">Speed up your existing website with advanced optimization techniques for faster load times and better user experience.</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-green-500/50 transition-all duration-300">
              <FaCode className="text-green-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-green-300">WordPress & Elementor Pro</h3>
              <p className="text-gray-300">Professional WordPress websites and landing pages built with Elementor Pro for stunning, conversion-focused designs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Packages */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Development Packages
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Choose the perfect package for your web development needs. All packages include responsive design and modern technologies.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter Package */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-blue-500/50 transition-all duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-blue-400 mb-2">Starter Website</h3>
                <div className="text-4xl font-bold text-white mb-2">£2,000</div>
                <p className="text-gray-400">Perfect for small businesses</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">Up to 5 pages</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">Responsive design</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">Contact form integration</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">SEO optimization</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">1 month support</span>
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
                <h3 className="text-2xl font-bold text-cyan-400 mb-2">Professional Website</h3>
                <div className="text-4xl font-bold text-white mb-2">£5,000</div>
                <p className="text-gray-400">For growing businesses</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-cyan-400 text-sm" />
                  <span className="text-gray-300">Up to 15 pages</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-cyan-400 text-sm" />
                  <span className="text-gray-300">Custom design & branding</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-cyan-400 text-sm" />
                  <span className="text-gray-300">CMS integration</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-cyan-400 text-sm" />
                  <span className="text-gray-300">E-commerce functionality</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-cyan-400 text-sm" />
                  <span className="text-gray-300">Advanced SEO</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-cyan-400 text-sm" />
                  <span className="text-gray-300">Analytics integration</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-cyan-400 text-sm" />
                  <span className="text-gray-300">3 months support</span>
                </li>
              </ul>
              
              <button className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                Start Project <FaArrowRight />
              </button>
            </div>

            {/* Enterprise Package */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-teal-500/50 transition-all duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-teal-400 mb-2">Enterprise Application</h3>
                <div className="text-4xl font-bold text-white mb-2">£15,000+</div>
                <p className="text-gray-400">Custom quote</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-teal-400 text-sm" />
                  <span className="text-gray-300">Unlimited pages</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-teal-400 text-sm" />
                  <span className="text-gray-300">Custom web application</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-teal-400 text-sm" />
                  <span className="text-gray-300">API development</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-teal-400 text-sm" />
                  <span className="text-gray-300">Database design</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-teal-400 text-sm" />
                  <span className="text-gray-300">Web3 integration</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-teal-400 text-sm" />
                  <span className="text-gray-300">Performance optimization</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-teal-400 text-sm" />
                  <span className="text-gray-300">12 months support</span>
                </li>
              </ul>
              
              <button className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                Contact Us <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Showcase */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Featured Work
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Project 1: E-commerce Platform */}
            <Link href="/featured/ecommerce-platform" className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1">
              <ProjectImage 
                service="web-development"
                projectId="ecommerce-platform"
                title="E-commerce Platform"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-blue-300">E-commerce Platform</h3>
                <p className="text-gray-300 mb-4">
                  E-commerce platform with integrated payment processing and inventory management.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['React', 'Node.js', 'MongoDB', 'Stripe'].map((tech, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
            
            {/* Project 2: Corporate Web Portal */}
            <Link href="/featured/corporate-web-portal" className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-1">
              <ProjectImage 
                service="web-development"
                projectId="corporate-portal"
                title="Corporate Web Portal"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-cyan-300">Corporate Web Portal</h3>
                <p className="text-gray-300 mb-4">
                  Corporate web portal with secure document management and collaboration tools.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Next.js', 'Firebase', 'Auth0', 'Material UI'].map((tech, index) => (
                    <span key={index} className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full border border-cyan-500/30">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
            
            {/* Project 3: Progressive Web App */}
            <Link href="/featured/progressive-web-app" className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden hover:border-teal-500/50 transition-all duration-300 hover:-translate-y-1">
              <ProjectImage 
                service="web-development"
                projectId="progressive-app"
                title="Progressive Web App"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-teal-300">Progressive Web App</h3>
                <p className="text-gray-300 mb-4">
                  Progressive web app with offline functionality and real-time data synchronization.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Vue.js', 'PWA', 'IndexedDB', 'WebSockets'].map((tech, index) => (
                    <span key={index} className="px-3 py-1 bg-teal-500/20 text-teal-300 text-xs rounded-full border border-teal-500/30">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Our Development Process
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-blue-300">Discovery & Planning</h3>
              <p className="text-gray-300">We begin by understanding your business goals, target audience, and specific requirements to create a detailed project plan.</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-cyan-300">Design & Prototyping</h3>
              <p className="text-gray-300">Our designers create wireframes and interactive prototypes to visualize the user journey and interface before development begins.</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-teal-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-teal-300">Development</h3>
              <p className="text-gray-300">Our development team builds your solution using modern frameworks and clean, maintainable code following industry best practices.</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white font-bold text-lg">4</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-blue-300">Testing & QA</h3>
              <p className="text-gray-300">Rigorous testing across devices and browsers ensures your site works flawlessly for all users and scenarios.</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white font-bold text-lg">5</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-cyan-300">Deployment</h3>
              <p className="text-gray-300">We handle the technical aspects of launching your site with proper configuration for optimal performance and security.</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-teal-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white font-bold text-lg">6</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-teal-300">Ongoing Support</h3>
              <p className="text-gray-300">Post-launch maintenance, monitoring, and optimization keep your site running at peak performance as your business grows.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Client Testimonials */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Client Testimonials
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300">
              <div className="text-4xl text-blue-400 opacity-30 mb-4">"</div>
              <p className="text-gray-300 mb-6 italic">"The web development team at B0ASE delivered a site that exceeded our expectations. Our conversion rate increased by 40% within the first month after launch."</p>
              <div>
                <p className="font-semibold text-blue-300">James Wilson</p>
                <p className="text-gray-400 text-sm">CEO, TechStart Inc.</p>
              </div>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300">
              <div className="text-4xl text-cyan-400 opacity-30 mb-4">"</div>
              <p className="text-gray-300 mb-6 italic">"Professional, responsive, and delivered exactly what we needed. The e-commerce platform has transformed our business operations completely."</p>
              <div>
                <p className="font-semibold text-cyan-300">Sarah Chen</p>
                <p className="text-gray-400 text-sm">Founder, StyleCo</p>
              </div>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-teal-500/50 transition-all duration-300">
              <div className="text-4xl text-teal-400 opacity-30 mb-4">"</div>
              <p className="text-gray-300 mb-6 italic">"The Web3 integration was seamless and the performance optimization made our site lightning fast. Outstanding technical expertise."</p>
              <div>
                <p className="font-semibold text-teal-300">Michael Rodriguez</p>
                <p className="text-gray-400 text-sm">CTO, CryptoVentures</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Ready to Build Your Website?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Let's discuss your project and create something amazing together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
              Start Your Project <FaArrowRight />
            </button>
            <button className="border border-gray-600 hover:border-cyan-500 text-gray-300 hover:text-cyan-300 font-semibold py-3 px-8 rounded-lg transition-all duration-300">
              View Portfolio
            </button>
          </div>
        </div>
      </section>
    </div>
  );
} 