"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import getSupabaseBrowserClient from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { FaSpinner, FaLock } from 'react-icons/fa';

export default function LearningPathPage() {
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

  // Define the starting date
  const startDate = new Date('2025-05-08');
  
  // Helper function to add days to a date
  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };
  
  // Helper function to format a date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Color mapping for Tailwind
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { dot: string, text: string, hover: string }> = {
      purple: { dot: 'bg-purple-500', text: 'text-purple-400', hover: 'hover:border-purple-500/50' },
      blue: { dot: 'bg-blue-500', text: 'text-blue-400', hover: 'hover:border-blue-500/50' },
      green: { dot: 'bg-green-500', text: 'text-green-400', hover: 'hover:border-green-500/50' },
      cyan: { dot: 'bg-cyan-500', text: 'text-cyan-400', hover: 'hover:border-cyan-500/50' },
      lime: { dot: 'bg-lime-500', text: 'text-lime-400', hover: 'hover:border-lime-500/50' },
      orange: { dot: 'bg-orange-500', text: 'text-orange-400', hover: 'hover:border-orange-500/50' },
      teal: { dot: 'bg-teal-500', text: 'text-teal-400', hover: 'hover:border-teal-500/50' },
      pink: { dot: 'bg-pink-500', text: 'text-pink-400', hover: 'hover:border-pink-500/50' }
    };
    
    return colorMap[color] || { dot: 'bg-gray-500', text: 'text-gray-400', hover: 'hover:border-gray-500/50' };
  };
  
  // Define the learning path schedule
  const learningPath = [
    {
      id: 'week1',
      platform: 'Figma',
      focus: 'UI/UX Design Fundamentals',
      startDate: formatDate(startDate),
      endDate: formatDate(addDays(startDate, 6)),
      description: 'Start with Figma to build design skills that will support all other development work. Focus on UI principles, wireframing, and prototyping.',
      tasks: [
        'Complete Figma fundamentals course',
        'Design 3 website mockups',
        'Create a small design system',
        'Build an interactive prototype',
        'Study top-rated Figma gigs on Fiverr'
      ],
      color: 'purple'
    },
    {
      id: 'week2',
      platform: 'Figma',
      focus: 'Advanced Design & Portfolio Building',
      startDate: formatDate(addDays(startDate, 7)),
      endDate: formatDate(addDays(startDate, 13)),
      description: 'Continue with advanced Figma skills and build a portfolio of designs that can be showcased in gigs.',
      tasks: [
        'Design a complex web application interface',
        'Create a mobile app design',
        'Build a component library',
        'Practice design handoff workflow',
        'Prepare 3 portfolio pieces for Fiverr'
      ],
      color: 'purple'
    },
    {
      id: 'week3',
      platform: 'HTML/CSS',
      focus: 'Frontend Fundamentals',
      startDate: formatDate(addDays(startDate, 14)),
      endDate: formatDate(addDays(startDate, 20)),
      description: 'Build/refresh core frontend skills before diving into specific platforms.',
      tasks: [
        'Review HTML5 semantics and best practices',
        'Practice responsive design techniques',
        'Study CSS Flexbox and Grid layouts',
        'Build 2-3 responsive landing pages',
        'Practice converting Figma designs to code'
      ],
      color: 'blue'
    },
    {
      id: 'week4',
      platform: 'Shopify',
      focus: 'Store Setup & Configuration',
      startDate: formatDate(addDays(startDate, 21)),
      endDate: formatDate(addDays(startDate, 27)),
      description: 'Learn Shopify basics and store setup processes to prepare for e-commerce gigs.',
      tasks: [
        'Set up a development store',
        'Configure products, collections, and checkout',
        'Explore theme customization basics',
        'Study payment gateway integration',
        'Review top Shopify gigs on Fiverr'
      ],
      color: 'green'
    },
    {
      id: 'week5',
      platform: 'Shopify',
      focus: 'Theme Development & Liquid',
      startDate: formatDate(addDays(startDate, 28)),
      endDate: formatDate(addDays(startDate, 34)),
      description: 'Dive deeper into Shopify development with Liquid templating and theme customization.',
      tasks: [
        'Learn Liquid syntax fundamentals',
        'Customize an existing Shopify theme',
        'Build a simple custom theme section',
        'Practice implementing design from Figma to Shopify',
        'Create first Shopify gig description draft'
      ],
      color: 'green'
    },
    {
      id: 'week6',
      platform: 'WordPress',
      focus: 'Site Building & Configuration',
      startDate: formatDate(addDays(startDate, 35)),
      endDate: formatDate(addDays(startDate, 41)),
      description: 'Learn WordPress fundamentals and site building techniques.',
      tasks: [
        'Set up a local WordPress development environment',
        'Install and configure essential plugins',
        'Explore theme customization options',
        'Set up a WooCommerce store',
        'Study top WordPress gigs on Fiverr'
      ],
      color: 'blue'
    },
    {
      id: 'week7',
      platform: 'WordPress',
      focus: 'Theme Development & PHP',
      startDate: formatDate(addDays(startDate, 42)),
      endDate: formatDate(addDays(startDate, 48)),
      description: 'Advance to theme development and PHP customization for WordPress.',
      tasks: [
        'Learn WordPress theme structure',
        'Practice PHP basics for WordPress',
        'Create a simple custom theme',
        'Build custom page templates',
        'Draft WordPress gig descriptions'
      ],
      color: 'blue'
    },
    {
      id: 'week8',
      platform: 'React.js',
      focus: 'Frontend Development',
      startDate: formatDate(addDays(startDate, 49)),
      endDate: formatDate(addDays(startDate, 55)),
      description: 'Begin modern frontend framework learning with React fundamentals.',
      tasks: [
        'Set up React development environment',
        'Learn component-based architecture',
        'Practice state and props management',
        'Build a small React application',
        'Research React-based gigs on Fiverr'
      ],
      color: 'cyan'
    },
    {
      id: 'week9',
      platform: 'Next.js',
      focus: 'React Framework',
      startDate: formatDate(addDays(startDate, 56)),
      endDate: formatDate(addDays(startDate, 62)),
      description: 'Expand React knowledge with Next.js framework for production applications.',
      tasks: [
        'Set up Next.js project',
        'Learn routing and data fetching',
        'Build a small portfolio or blog project',
        'Practice API integration',
        'Prepare React/Next.js gig descriptions'
      ],
      color: 'cyan'
    },
    {
      id: 'week10',
      platform: 'Node.js',
      focus: 'Backend Development',
      startDate: formatDate(addDays(startDate, 63)),
      endDate: formatDate(addDays(startDate, 69)),
      description: 'Transition to backend development with Node.js and Express.',
      tasks: [
        'Set up Node.js development environment',
        'Build RESTful APIs with Express',
        'Practice database integration (MongoDB/PostgreSQL)',
        'Implement authentication/authorization',
        'Research backend gigs on Fiverr'
      ],
      color: 'lime'
    },
    {
      id: 'week11',
      platform: 'AWS',
      focus: 'Cloud Deployment',
      startDate: formatDate(addDays(startDate, 70)),
      endDate: formatDate(addDays(startDate, 76)),
      description: 'Learn AWS fundamentals for deploying web applications to the cloud.',
      tasks: [
        'Create AWS account and explore console',
        'Deploy a static website to S3',
        'Set up EC2 instance for Node.js app',
        'Explore serverless with Lambda',
        'Draft AWS deployment gig descriptions'
      ],
      color: 'orange'
    },
    {
      id: 'week12',
      platform: 'OpenAI API',
      focus: 'AI Integration',
      startDate: formatDate(addDays(startDate, 77)),
      endDate: formatDate(addDays(startDate, 83)),
      description: 'Finish with AI integration skills using OpenAI API to build cutting-edge features.',
      tasks: [
        'Set up OpenAI API access',
        'Build a simple chatbot',
        'Create content generation tool',
        'Integrate AI features with previous projects',
        'Draft AI integration gig descriptions'
      ],
      color: 'teal'
    },
    {
      id: 'week13',
      platform: 'Gig Launch',
      focus: 'Portfolio Finalization & Gig Launch',
      startDate: formatDate(addDays(startDate, 84)),
      endDate: formatDate(addDays(startDate, 90)),
      description: 'Finalize all portfolio pieces and launch your first set of gigs on Fiverr.',
      tasks: [
        'Finalize 5-7 portfolio pieces',
        'Write and refine all gig descriptions',
        'Create professional gig images/videos',
        'Set up pricing tiers for each gig',
        'Launch initial gigs and begin promotion'
      ],
      color: 'pink'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/gigs" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
          <span>←</span> Back to Gigs Hub
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Gigs - Learning Path</h1>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">3-Month Platform Learning Schedule</h3>
        <p className="text-gray-400 mb-6">
          This structured learning path outlines a strategic approach to master each platform required for our Fiverr gigs.
          Following this schedule will ensure we build skills in a logical order, with each platform allocated sufficient time for proficiency.
        </p>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-gray-700"></div>
          
          {/* Timeline items */}
          <div className="space-y-8">
            {learningPath.map((week) => {
              const colorClasses = getColorClasses(week.color);
              
              return (
                <div key={week.id} className="relative pl-16 md:pl-20">
                  {/* Timeline dot */}
                  <div className={`absolute left-4 md:left-6 top-2 w-5 h-5 rounded-full border-4 border-gray-900 ${colorClasses.dot}`}></div>
                  
                  {/* Content */}
                  <div className={`p-4 border border-gray-700 rounded-lg bg-gray-850 ${colorClasses.hover} transition-colors`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                      <h4 className={`text-lg font-semibold ${colorClasses.text}`}>{week.platform}: {week.focus}</h4>
                      <span className="text-xs text-gray-500 mt-1 md:mt-0">{week.startDate} - {week.endDate}</span>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-4">{week.description}</p>
                    
                    <h5 className="text-sm font-medium mb-2 text-gray-300">Focus Tasks:</h5>
                    <ul className="list-disc list-inside space-y-1 text-xs text-gray-400">
                      {week.tasks.map((task, index) => (
                        <li key={index}>{task}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="mt-12 p-4 border border-gray-700 rounded-lg bg-gray-850">
        <h3 className="text-xl font-semibold mb-3 text-purple-400">Learning Path Strategy</h3>
        <div className="text-sm text-gray-400 space-y-3">
          <p>
            This learning path is designed to maximize skill acquisition in a logical progression:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong className="text-gray-300">Design First:</strong> Starting with Figma builds fundamental design skills that will enhance all future development work and improve portfolio quality.</li>
            <li><strong className="text-gray-300">Platform Progression:</strong> Moving from established platforms (Shopify, WordPress) to modern development (React, Node) allows for gradual skill building.</li>
            <li><strong className="text-gray-300">Frontend to Backend:</strong> Learning frontend skills before backend creates a logical progression in understanding web application architecture.</li>
            <li><strong className="text-gray-300">Deployment & AI Last:</strong> Once core development skills are mastered, learning deployment (AWS) and AI integration rounds out the offering with advanced capabilities.</li>
          </ul>
          <p className="mt-4 italic">
            Each week builds on previous knowledge while focusing deeply on platform-specific skills. Weekly tasks are designed to create portfolio-worthy projects that can be directly used in Fiverr gig examples.
          </p>
        </div>
      </div>
    </div>
  );
} 