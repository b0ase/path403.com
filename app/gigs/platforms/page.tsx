"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import getSupabaseBrowserClient from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { FaSpinner, FaLock } from 'react-icons/fa';

export default function PlatformsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await getSupabaseBrowserClient().auth.getUser();
      setUser(user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  // Check if user is admin@b0ase.com
  const isAuthorizedUser = user?.email === 'admin@b0ase.com';

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <FaSpinner className="animate-spin text-4xl text-sky-500 mr-3" />
          <span className="text-xl text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <FaLock className="mx-auto text-6xl text-gray-500 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Access Restricted</h1>
          <p className="text-gray-400 mb-6">You need to be logged in to view this content.</p>
          <Link href="/login" className="bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 px-4 rounded-md transition-colors">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (!isAuthorizedUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <FaLock className="mx-auto text-6xl text-gray-500 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">This content is only available to the authorized user.</p>
          <Link href="/auth/gigs" className="bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 px-4 rounded-md transition-colors">
            Go to Gigs Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/gigs" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
          <span>←</span> Back to Gigs Hub
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Gigs - Platforms</h1>

      <div>
        <h3 className="text-xl font-semibold mb-4">Key Platform Focus Areas</h3>
        <p className="text-gray-400 mb-2">Deep dive into popular platforms to identify expertise needed and potential gig offerings.</p>
        
        <div className="space-y-8">
          {/* Shopify Section */}
          <div className="p-4 border border-gray-700 rounded-lg bg-gray-850">
            <h4 className="text-lg font-semibold mb-3 text-green-400">Shopify</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-md font-medium mb-2 underline">Expertise Needed:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                  <li>Shopify Theme Development (Liquid, HTML, CSS, JS)</li>
                  <li>Shopify App Development (Ruby, Node.js, React, APIs)</li>
                  <li>Store Setup & Configuration (Settings, Payments, Shipping)</li>
                  <li>Product Management & Merchandising</li>
                  <li>Data Migration (from other platforms)</li>
                  <li>API Integration (Third-party services)</li>
                  <li>Conversion Rate Optimization (CRO)</li>
                  <li>Shopify SEO</li>
                  <li>Marketing Automation Integration</li>
                </ul>
              </div>
              <div>
                <h5 className="text-md font-medium mb-2 underline">Potential Fiverr Gig Offerings:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                  <li>Full Shopify Store Setup / Redesign</li>
                  <li>Custom Shopify Theme Development</li>
                  <li>Shopify App Installation & Configuration</li>
                  <li>Custom Shopify App Development</li>
                  <li>PSD/Figma to Shopify Theme</li>
                  <li>Shopify Speed Optimization</li>
                  <li>Shopify SEO Audit & Implementation</li>
                  <li>Product Upload & Configuration</li>
                  <li>Troubleshooting & Bug Fixing</li>
                  <li>Marketing Integration (Email, Ads)</li>
                  <li>Migration to Shopify</li>
                </ul>
              </div>
            </div>
          </div>

          {/* WordPress Section */}
          <div className="p-4 border border-gray-700 rounded-lg bg-gray-850">
            <h4 className="text-lg font-semibold mb-3 text-blue-400">WordPress</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-md font-medium mb-2 underline">Expertise Needed:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                  <li>Theme Development & Customization (PHP, HTML, CSS, JS)</li>
                  <li>Plugin Development & Customization</li>
                  <li>Gutenberg Block Development (React)</li>
                  <li>WooCommerce Setup & Customization</li>
                  <li>WordPress Security & Performance Optimization</li>
                  <li>API Integrations (REST API)</li>
                  <li>Page Builder Expertise (Elementor, Beaver Builder, etc.)</li>
                  <li>Database Management (MySQL)</li>
                  <li>Site Migration & Maintenance</li>
                </ul>
              </div>
              <div>
                <h5 className="text-md font-medium mb-2 underline">Potential Fiverr Gig Offerings:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                  <li>Full WordPress Website Creation/Redesign</li>
                  <li>Custom Theme/Plugin Development</li>
                  <li>PSD/Figma to WordPress</li>
                  <li>WooCommerce Store Setup</li>
                  <li>WordPress Speed & Security Optimization</li>
                  <li>Malware Removal & Site Recovery</li>
                  <li>Custom Gutenberg Blocks</li>
                  <li>Elementor/Page Builder Expert</li>
                  <li>WordPress Migration / Backup / Maintenance</li>
                </ul>
              </div>
            </div>
          </div>

          {/* React.js Section */}
          <div className="p-4 border border-gray-700 rounded-lg bg-gray-850">
            <h4 className="text-lg font-semibold mb-3 text-cyan-400">React.js</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-md font-medium mb-2 underline">Expertise Needed:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                  <li>Component-Based Architecture</li>
                  <li>State Management (Context API, Redux, Zustand)</li>
                  <li>React Hooks</li>
                  <li>Routing (React Router)</li>
                  <li>API Integration (Fetch, Axios)</li>
                  <li>Testing (Jest, React Testing Library)</li>
                  <li>Next.js / Remix Frameworks</li>
                  <li>TypeScript with React</li>
                  <li>Performance Optimization</li>
                </ul>
              </div>
              <div>
                <h5 className="text-md font-medium mb-2 underline">Potential Fiverr Gig Offerings:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                  <li>Custom React Component Development</li>
                  <li>Frontend Development with React</li>
                  <li>Next.js Application Development</li>
                  <li>React Bug Fixing & Troubleshooting</li>
                  <li>API Integration for React Apps</li>
                  <li>State Management Setup (Redux, etc.)</li>
                  <li>React Performance Optimization</li>
                  <li>Convert Design (Figma/PSD) to React</li>
                  <li>React Native App Components (if applicable)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Node.js Section */}
          <div className="p-4 border border-gray-700 rounded-lg bg-gray-850">
            <h4 className="text-lg font-semibold mb-3 text-lime-400">Node.js</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-md font-medium mb-2 underline">Expertise Needed:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                  <li>JavaScript (ES6+) & Asynchronous Programming</li>
                  <li>Express.js / Koa / NestJS Frameworks</li>
                  <li>RESTful API Design & Development</li>
                  <li>Database Integration (MongoDB, PostgreSQL, MySQL)</li>
                  <li>Authentication & Authorization (JWT, OAuth)</li>
                  <li>WebSocket Communication</li>
                  <li>Testing (Mocha, Chai, Jest)</li>
                  <li>Deployment (Docker, Cloud Platforms)</li>
                  <li>Package Management (npm/yarn)</li>
                </ul>
              </div>
              <div>
                <h5 className="text-md font-medium mb-2 underline">Potential Fiverr Gig Offerings:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                  <li>Custom REST API Development</li>
                  <li>Node.js Backend for Web/Mobile Apps</li>
                  <li>Express.js / NestJS Application Build</li>
                  <li>Database Integration with Node.js</li>
                  <li>Real-time Applications (WebSockets)</li>
                  <li>Node.js Bug Fixing & Performance Tuning</li>
                  <li>Microservices with Node.js</li>
                  <li>Server Setup & Deployment for Node Apps</li>
                  <li>Third-Party API Integration</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Figma Section */}
          <div className="p-4 border border-gray-700 rounded-lg bg-gray-850">
            <h4 className="text-lg font-semibold mb-3 text-purple-400">Figma</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-md font-medium mb-2 underline">Expertise Needed:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                  <li>UI Design Principles</li>
                  <li>UX Design Principles & User Flows</li>
                  <li>Wireframing & Prototyping</li>
                  <li>Component Libraries & Design Systems</li>
                  <li>Auto Layout & Constraints</li>
                  <li>Collaboration Features</li>
                  <li>Responsive Design Concepts</li>
                  <li>Handoff to Developers</li>
                  <li>Plugin Usage</li>
                </ul>
              </div>
              <div>
                <h5 className="text-md font-medium mb-2 underline">Potential Fiverr Gig Offerings:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                  <li>Website UI/UX Design</li>
                  <li>Mobile App UI/UX Design</li>
                  <li>Wireframing & Prototyping</li>
                  <li>Convert Sketch/XD/PSD to Figma</li>
                  <li>Create Figma Design System / Style Guide</li>
                  <li>Landing Page Design</li>
                  <li>Dashboard Design</li>
                  <li>Interactive Prototype Creation</li>
                  <li>Figma Consultation & Training</li>
                </ul>
              </div>
            </div>
          </div>

           {/* AWS Section */}
          <div className="p-4 border border-gray-700 rounded-lg bg-gray-850">
            <h4 className="text-lg font-semibold mb-3 text-orange-400">AWS (Amazon Web Services)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-md font-medium mb-2 underline">Expertise Needed:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                  <li>Cloud Computing Fundamentals</li>
                  <li>EC2, S3, Lambda, RDS Services</li>
                  <li>VPC & Security Groups</li>
                  <li>IAM & Security Best Practices</li>
                  <li>CloudFormation / Terraform</li>
                  <li>CI/CD Pipelines (CodePipeline, GitHub Actions)</li>
                  <li>Monitoring & Logging (CloudWatch)</li>
                  <li>Serverless Architecture</li>
                  <li>Cost Optimization</li>
                </ul>
              </div>
              <div>
                <h5 className="text-md font-medium mb-2 underline">Potential Fiverr Gig Offerings:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                  <li>AWS Infrastructure Setup</li>
                  <li>Serverless Application Development</li>
                  <li>Cloud Migration Services</li>
                  <li>AWS Security Audit & Hardening</li>
                  <li>CI/CD Pipeline Setup</li>
                  <li>Cost Optimization Consultation</li>
                  <li>AWS Troubleshooting & Support</li>
                  <li>CloudFormation Templates</li>
                  <li>AWS Training & Consultation</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* OpenAI API Section */}
          <div className="p-4 border border-gray-700 rounded-lg bg-gray-850">
            <h4 className="text-lg font-semibold mb-3 text-teal-400">OpenAI API (GPT Models)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-md font-medium mb-2 underline">Expertise Needed:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                  <li>Understanding GPT Capabilities & Limitations</li>
                  <li>Prompt Engineering</li>
                  <li>API Integration (Python, Node.js, etc.)</li>
                  <li>Handling API Responses</li>
                  <li>Fine-tuning Concepts (if applicable)</li>
                  <li>Cost Management & Token Usage</li>
                  <li>Use Case Identification (Chatbots, Content Gen, Summarization)</li>
                  <li>Integrating with Vector Databases (for RAG)</li>
                  <li>Error Handling & Rate Limiting</li>
                </ul>
              </div>
              <div>
                <h5 className="text-md font-medium mb-2 underline">Potential Fiverr Gig Offerings:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                  <li>Integrate OpenAI API into Existing App</li>
                  <li>Develop Custom AI Chatbot (using GPT)</li>
                  <li>Automated Content Generation Script</li>
                  <li>Text Summarization / Analysis Tool</li>
                  <li>Prompt Engineering Services</li>
                  <li>AI Feature Development for SaaS</li>
                  <li>Consultation on OpenAI API Usage</li>
                  <li>Fine-tuning Assistance (if offering)</li>
                  <li>Develop RAG (Retrieval-Augmented Generation) Systems</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Further Potential Platforms/Tech Areas */}
          <div className="mt-8 pt-6 border-t border-gray-700">
             <h4 className="text-lg font-semibold mb-3 text-gray-400">Other Potential Areas to Explore:</h4>
             <ul className="list-disc list-inside space-y-1 text-sm text-gray-300 columns-2 md:columns-3">
                <li>Webflow</li>
                <li>Wix / Squarespace</li>
                <li>WooCommerce</li>
                <li>Magento / BigCommerce</li>
                <li>Vue.js / Angular / Svelte</li>
                <li>Python (Django/Flask)</li>
                <li>Ruby on Rails</li>
                <li>PHP (Laravel)</li>
                <li>React Native / Flutter</li>
                <li>Swift / Kotlin (Native Mobile)</li>
                <li>Google Cloud / Azure</li>
                <li>Firebase / Supabase</li>
                <li>MongoDB</li>
                <li>Adobe XD / Sketch</li>
                <li>Google Analytics / Tag Manager</li>
                <li>Mailchimp / HubSpot</li>
                <li>Midjourney / Stable Diffusion</li>
                <li>Bubble.io / No-Code Tools</li>
                <li>Zapier / Make (Automation)</li>
             </ul>
          </div>
          
        </div>
      </div>
    </div>
  );
} 