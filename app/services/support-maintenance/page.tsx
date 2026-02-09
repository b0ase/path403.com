'use client';

import React from 'react';
import Link from 'next/link';
import { FaServer, FaTools, FaShieldAlt, FaRocket, FaCloudUploadAlt, FaChartLine, FaArrowLeft, FaHandsHelping, FaCog, FaBell, FaArrowRight, FaCheck } from 'react-icons/fa';

export default function SupportMaintenancePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-400 via-pink-400 to-fuchsia-400 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-pink-300 hover:text-pink-200 mb-8 transition-colors">
            <FaArrowLeft />
            Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-600 rounded-xl flex items-center justify-center shadow-2xl">
              <FaHandsHelping className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-5xl font-extrabold text-white drop-shadow-lg flex items-center gap-3 mb-2">
                <FaHandsHelping className="inline-block text-4xl align-middle" />
                Support
              </h1>
              <p className="text-xl font-semibold text-white/80 mb-2">Ongoing Maintenance</p>
            </div>
          </div>
          <p className="text-lg text-gray-300 max-w-3xl leading-relaxed">
            Keep your website, app, or system running smoothly with proactive support and maintenance services.
          </p>
        </div>
      </div>

      {/* Pricing Information */}
      <section className="px-4 md:px-8 py-6 mb-8">
        <p className="text-gray-300 text-base">
          Est. Rate: Retainer based. UK VAT added where applicable. Fixed-price projects negotiable.
        </p>
      </section>

      {/* Services Grid */}
      <section className="px-4 md:px-8 py-8 mb-16">
        <h2 className="text-2xl font-bold mb-6">Our Support Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-900 p-6 rounded-lg flex flex-col">
            <div className="flex items-center mb-4">
              <FaTools className="text-white mr-3 text-xl" />
              <h3 className="font-semibold text-xl">Proactive Maintenance</h3>
            </div>
            <p className="text-gray-400 flex-grow">Regular updates, optimizations, and preventive maintenance to keep your systems running at peak performance.</p>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-lg flex flex-col">
            <div className="flex items-center mb-4">
              <FaServer className="text-white mr-3 text-xl" />
              <h3 className="font-semibold text-xl">Server Management</h3>
            </div>
            <p className="text-gray-400 flex-grow">Comprehensive server monitoring, configuration management, and optimization to ensure reliability and uptime.</p>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-lg flex flex-col">
            <div className="flex items-center mb-4">
              <FaShieldAlt className="text-white mr-3 text-xl" />
              <h3 className="font-semibold text-xl">Security Updates</h3>
            </div>
            <p className="text-gray-400 flex-grow">Regular security patches, vulnerability assessments, and protective measures to safeguard your digital assets.</p>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-lg flex flex-col">
            <div className="flex items-center mb-4">
              <FaRocket className="text-white mr-3 text-xl" />
              <h3 className="font-semibold text-xl">Performance Optimization</h3>
            </div>
            <p className="text-gray-400 flex-grow">Continuous monitoring and optimization of your applications for maximum speed, efficiency, and user experience.</p>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-lg flex flex-col">
            <div className="flex items-center mb-4">
              <FaCloudUploadAlt className="text-white mr-3 text-xl" />
              <h3 className="font-semibold text-xl">Backup & Recovery</h3>
            </div>
            <p className="text-gray-400 flex-grow">Automated backup solutions with regular testing and efficient disaster recovery procedures to protect your data.</p>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-lg flex flex-col">
            <div className="flex items-center mb-4">
              <FaChartLine className="text-white mr-3 text-xl" />
              <h3 className="font-semibold text-xl">Monitoring & Reporting</h3>
            </div>
            <p className="text-gray-400 flex-grow">24/7 system monitoring with detailed performance reports and proactive alerts to address issues before they impact users.</p>
          </div>
        </div>
      </section>

      {/* Support Plans */}
      <section className="px-4 md:px-8 py-8 mb-16">
        <h2 className="text-2xl font-bold mb-6">Support Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Essential Plan */}
          <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
            <div className="bg-gray-800 p-6">
              <h3 className="font-bold text-2xl mb-2 text-white">Essential</h3>
              <p className="text-gray-300">For small websites and basic applications</p>
              <p className="text-2xl font-bold mt-4 text-cyan-400">£250<span className="text-sm font-normal text-gray-400">/month</span></p>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {[
                  'Monthly maintenance',
                  'Security updates',
                  'Weekly backups',
                  'Email support',
                  '4 hour response time (business hours)',
                  'Monthly performance report'
                ].map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-cyan-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Professional Plan */}
          <div className="bg-gray-900 rounded-lg overflow-hidden border border-cyan-500 transform scale-105 shadow-xl">
            <div className="bg-cyan-500 p-6">
              <h3 className="font-bold text-2xl mb-2 text-white">Professional</h3>
              <p className="text-gray-100">For business websites and web applications</p>
              <p className="text-2xl font-bold mt-4 text-white">£600<span className="text-sm font-normal text-gray-100">/month</span></p>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {[
                  'Weekly maintenance',
                  'Priority security patches',
                  'Daily backups',
                  'Email & phone support',
                  '2 hour response time (business hours)',
                  'Weekly performance reports',
                  'Monthly strategy consultation',
                  'Minor feature enhancements'
                ].map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-cyan-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
            <div className="bg-gray-800 p-6">
              <h3 className="font-bold text-2xl mb-2 text-white">Enterprise</h3>
              <p className="text-gray-300">For mission-critical systems and applications</p>
              <p className="text-2xl font-bold mt-4 text-cyan-400">Custom<span className="text-sm font-normal text-gray-400">/month</span></p>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {[
                  '24/7 proactive maintenance',
                  'Immediate security updates',
                  'Continuous backup system',
                  'Dedicated support manager',
                  '1 hour response time (24/7)',
                  'Real-time monitoring dashboard',
                  'Monthly executive reports',
                  'Ongoing development hours included',
                  'Custom SLA options'
                ].map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-cyan-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Client Testimonials */}
      <section className="px-4 md:px-8 py-8 mb-16">
        <h2 className="text-2xl font-bold mb-6">Client Testimonials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gray-900 p-6 rounded-lg relative">
            <div className="text-4xl text-cyan-500 opacity-30 absolute top-4 left-4">"</div>
            <div className="relative z-10">
              <p className="text-gray-300 mb-4 italic">"The ongoing maintenance from B0ASE has been crucial to our business. Their proactive support helps us avoid downtime and keeps our e-commerce platform running smoothly even during peak seasons."</p>
              <div>
                <p className="font-semibold text-white">Jessica Smith</p>
                <p className="text-gray-400 text-sm">Operations Director, Retail Solutions</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-lg relative">
            <div className="text-4xl text-cyan-500 opacity-30 absolute top-4 left-4">"</div>
            <div className="relative z-10">
              <p className="text-gray-300 mb-4 italic">"We switched to B0ASE's Professional support plan after experiencing recurring issues with our previous provider. Their response times are impressive, and they've completely eliminated the security concerns we were having."</p>
              <div>
                <p className="font-semibold text-white">Mark Johnson</p>
                <p className="text-gray-400 text-sm">CTO, FinTech Startup</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-lg relative">
            <div className="text-4xl text-cyan-500 opacity-30 absolute top-4 left-4">"</div>
            <div className="relative z-10">
              <p className="text-gray-300 mb-4 italic">"As an enterprise with critical applications, we can't afford any downtime. B0ASE's Enterprise support package gives us peace of mind knowing our systems are being monitored 24/7 and any issues are resolved immediately."</p>
              <div>
                <p className="font-semibold text-white">Amanda Richards</p>
                <p className="text-gray-400 text-sm">VP of Technology, Global Solutions Inc.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Process */}
      <section className="px-4 md:px-8 py-8 mb-16 bg-gray-900">
        <h2 className="text-2xl font-bold mb-6">Our Support Process</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 border-l-2 border-cyan-500">
            <h3 className="font-bold text-xl mb-2">1. Onboarding</h3>
            <p className="text-gray-400">Comprehensive system audit and documentation to understand your infrastructure, applications, and specific needs.</p>
          </div>
          
          <div className="p-6 border-l-2 border-cyan-500">
            <h3 className="font-bold text-xl mb-2">2. Monitoring Setup</h3>
            <p className="text-gray-400">Implementation of monitoring tools and alert systems tailored to your specific technology stack and business requirements.</p>
          </div>
          
          <div className="p-6 border-l-2 border-cyan-500">
            <h3 className="font-bold text-xl mb-2">3. Preventive Maintenance</h3>
            <p className="text-gray-400">Regular scheduled maintenance activities to optimize performance, apply updates, and prevent potential issues.</p>
          </div>
          
          <div className="p-6 border-l-2 border-cyan-500">
            <h3 className="font-bold text-xl mb-2">4. Issue Resolution</h3>
            <p className="text-gray-400">Rapid response to alerts and reported issues with a systematic approach to troubleshooting and permanent resolution.</p>
          </div>
          
          <div className="p-6 border-l-2 border-cyan-500">
            <h3 className="font-bold text-xl mb-2">5. Reporting & Review</h3>
            <p className="text-gray-400">Regular detailed reports on system performance, incidents, and maintenance activities with recommendations for improvements.</p>
          </div>
          
          <div className="p-6 border-l-2 border-cyan-500">
            <h3 className="font-bold text-xl mb-2">6. Continuous Improvement</h3>
            <p className="text-gray-400">Ongoing refinement of support processes and system optimizations based on performance data and evolving requirements.</p>
          </div>
        </div>
      </section>

      {/* Technologies */}
      <section className="px-4 md:px-8 py-8 mb-16">
        <h2 className="text-2xl font-bold mb-6">Technologies We Support</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {['React/Next.js', 'Vue/Nuxt', 'Angular', 'Node.js', 'PHP/Laravel', 'Python/Django',
            'WordPress', 'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes'].map((tech, index) => (
            <div key={index} className="bg-gray-900 p-4 rounded-lg text-center">
              <span className="font-medium text-gray-300">{tech}</span>
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