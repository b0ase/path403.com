'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowLeft, FiCheck, FiClock, FiTool } from 'react-icons/fi';

export default function LLMSEOPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Back Navigation */}
        <Link 
          href="/work" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <FiArrowLeft />
          Back to Work
        </Link>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            LLM-Powered SEO & Content Generation
          </h1>
          <p className="text-xl text-gray-400 mb-8 leading-relaxed">
            AI-driven SEO strategies using large language models for content creation, keyword optimization, 
            and automated blog generation. Scale your content marketing with intelligent automation.
          </p>
          
          <div className="flex flex-wrap gap-4 mb-12">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-400">£800 - £2,500</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <FiClock />
              <span>3-5 weeks</span>
            </div>
          </div>
        </motion.div>

        {/* What's Included */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold mb-6">What's Included</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'AI content generation system',
              'Automated blog posting',
              'SEO keyword optimization',
              'Content performance analytics',
              'Multi-platform publishing'
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <FiCheck className="text-green-400 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Technologies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <FiTool />
            Technologies
          </h2>
          <div className="flex flex-wrap gap-3">
            {['GPT-4', 'Claude', 'Python', 'SEO Tools', 'WordPress'].map((tech, index) => (
              <span key={index} className="px-4 py-2 bg-gray-800 rounded-full text-sm">
                {tech}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Process */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold mb-6">Our Process</h2>
          <div className="space-y-6">
            {[
              {
                step: "1",
                title: "SEO Strategy & Keyword Research",
                description: "Comprehensive analysis of your niche and competitor landscape to identify high-value keywords."
              },
              {
                step: "2", 
                title: "AI Model Training & Setup",
                description: "Configure and fine-tune language models specifically for your brand voice and industry."
              },
              {
                step: "3",
                title: "Content Generation Pipeline",
                description: "Build automated workflows for creating, optimizing, and publishing SEO-friendly content."
              },
              {
                step: "4",
                title: "Performance Monitoring",
                description: "Set up analytics and reporting to track content performance and ROI."
              }
            ].map((process, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">
                  {process.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{process.title}</h3>
                  <p className="text-gray-400">{process.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-gray-900 rounded-2xl p-8 text-center"
        >
          <h2 className="text-2xl font-bold mb-4">Ready to Scale Your Content?</h2>
          <p className="text-gray-400 mb-6">
            Let's discuss how AI can transform your content marketing strategy.
          </p>
          <Link 
            href="/contact"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Get Started
          </Link>
        </motion.div>
      </div>
    </div>
  );
}