'use client';

import React from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaCheckCircle, FaSpinner, FaExclamationTriangle, FaLightbulb, FaListUl, FaQuestionCircle, FaExclamationCircle } from 'react-icons/fa';

const statusIcons: { [key: string]: JSX.Element } = {
  DONE: <FaCheckCircle className="text-green-500" />,
  IN_PROGRESS: <FaSpinner className="text-blue-500 animate-spin" />,
  TO_DO: <FaListUl className="text-yellow-500" />,
  PLANNED: <FaLightbulb className="text-purple-500" />,
  ISSUE: <FaExclamationTriangle className="text-red-500" />,
  PARTIAL: <FaExclamationCircle className="text-orange-500" />
};

const blueprintSections = [
  {
    title: 'Core Public Website & Navigation',
    items: [
      { name: 'Homepage', path: '/', status: 'PLANNED', details: 'Overall site structure, hero section, service summaries, call to actions.' },
      { name: 'Main Navigation (Header/Footer)', path: 'Global', status: 'PARTIAL', details: 'Visible in screenshots: About, Services, Skills, Projects, Contact, Studio, Client Login. Sub-nav for services. Fiverr/Upwork links. Footer content?' },
      { name: 'About Page', path: '/about', status: 'PLANNED', details: 'Company story, mission, values, team (if applicable).' },
      { name: 'Services Hub Page', path: '/services', status: 'PLANNED', details: 'Overview of all service categories.' },
      { name: 'Individual Service Pages', path: '/services/*', status: 'PLANNED', details: 'Dedicated pages for Website Design, Software Development, Content, Video, Branding, SEO, Social, Consulting, Support. (Visible in nav screenshot)' },
      { name: 'Skills Page', path: '/skills', status: 'PLANNED', details: 'Detailed breakdown of technical and soft skills offered.' },
      { name: 'Projects/Portfolio Page', path: '/projects', status: 'PLANNED', details: 'Showcase of past work, case studies.' },
      { name: 'Contact Page', path: '/contact', status: 'PLANNED', details: 'Contact form, contact details, map (if applicable).' },
      { name: 'Client Login Page', path: '/client-login', status: 'PLANNED', details: 'Portal for clients to access project updates, files, etc.' },
    ]
  },
  {
    title: 'Gig Planning Hub (Private)',
    items: [
      { name: 'Gigs Hub Main Page', path: '/gigs', status: 'DONE', details: 'Central navigation page for all gig planning sections. Implemented with card links.'},
      { name: 'Research Page', path: '/gigs/research', status: 'DONE', details: 'Page created for Fiverr trends, popular gigs, pricing, and keywords. Back navigation added.'},
      { name: 'Strategy Page', path: '/gigs/strategy', status: 'DONE', details: 'Page created for defining gig offerings, USPs, target audiences. Back navigation added.'},
      { name: 'Action Plan Page', path: '/gigs/action', status: 'DONE', details: 'Page created for detailed steps to create/launch gigs. Back navigation added.'},
      { name: 'Platforms Page', path: '/gigs/platforms', status: 'DONE', details: 'Page created to review key platforms, required expertise. Back navigation added.'},
      { name: 'Learning Path Page', path: '/gigs/learning-path', status: 'DONE', details: 'Detailed 13-week, 3-month learning schedule (Figma, Shopify, WordPress, React, Node, AWS, OpenAI) starting May 8th, 2025. Includes tasks, dates, timeline visualization. Linked from Gigs Hub.'},
      { name: 'Work Path Page', path: '/gigs/work-path', status: 'DONE', details: 'Extensive page for daily operations, balancing earning/learning. Multiple iterations: schedule templates (Client-Focused, Balanced, Learning, Night Owl, 45/15 Sprint Cycle), decision frameworks, weekly rhythm, evening strategies (Habit Replacement, Financial Discipline, Productive Late Nights, 9PM Decision Point), morning routine integration. Linked from Gigs Hub.'},
      { name: 'Calendar Page (Gigs)', path: '/gigs/calendar', status: 'PLANNED', details: 'Link exists on Studio page. Functionality to visualize deadlines, learning sessions, financial check-ins discussed but page not yet built.'},
      { name: 'Fiverr Explorer Page', path: '/gigs/fiverr-explorer', status: 'PLANNED', details: 'Link exists on Studio page. Functionality to browse Fiverr categories and scrape gig data discussed but page not yet built.'},
    ]
  },
  {
    title: 'Studio & Private Tools (Private)',
    items: [
      { name: 'Studio Hub Page', path: '/studio', status: 'DONE', details: 'Central private hub. Password authenticated. Unified, numbered, color-coded card links to various private sections. Logout functionality.'},
      { name: 'Studio Links Color Issue', path: '/studio', status: 'ISSUE', details: 'Dynamic Tailwind CSS color classes for card titles are not rendering as expected; titles default to a standard link color. Troubleshooting attempts made (simplifying colors, checking JIT hints). Likely needs tailwind.config.js safelisting.'},
      { name: 'Financial Overview Page', path: '/finances', status: 'PARTIAL', details: 'Password authenticated. Structure for bank accounts, crypto wallets, transactions, spending categories. Dummy data used. Open Banking connection initiated (mocked). Link to The Boase Trust integrated.'},
      { name: 'The Boase Trust Page', path: '/trust', status: 'PLANNED', details: 'Page for trust documents, asset ledger, balance sheet. Linked from /finances. Content not yet defined.'},
      { name: 'Work In Progress Page', path: '/workinprogress', status: 'DONE', details: 'Dashboard with two action lists: \"b0ase.com Blueprint\" (links to /b0aseblueprint) and \"Other\". Dummy action items with status styling. Back link to Studio.'},
      { name: 'Diary Page', path: '/diary', status: 'PLANNED', details: 'Link created on Studio page. Page intended for personal journal, daily notes, reflections. Content and structure not yet built.'},
    ]
  },
  {
    title: 'Core Platform Features & Backlog',
    items: [
      { name: 'Studio', path: '/studio', status: 'DONE', details: 'Public access - no authentication required.'},
      { name: 'Finances', path: '/user/account', status: 'DONE', details: 'OAuth-protected via user account dashboard.'},
      { name: 'General Google Authentication', feature: 'Auth', status: 'TO_DO', details: 'User mentioned wanting Google Auth for b0ase.com (possibly for client login or broader site access).'},
      { name: 'Google Sheets API Integration', feature: 'Finances', status: 'TO_DO', details: 'Desired for /finances page to provide financial overview data.'},
      { name: 'Editable Daily Schedule Modal', feature: 'Work Path', status: 'TO_DO', details: 'Requested for /gigs/work-path to allow more granular, on-the-fly task adjustments to schedules.'},
      { name: 'Consideration for Environmental Factors in Schedules', feature: 'Work Path', status: 'PLANNED', details: 'Idea to adjust Work Path schedules based on weather, air pressure, etc.'},
      { name: 'Custom Schedule Templates (Work Path)', feature: 'Work Path', status: 'PLANNED', details: 'Ability to save custom versions of Work Path daily schedules.'},
      { name: 'Task Management/Calendar Integration', feature: 'Work Path / Studio', status: 'PLANNED', details: 'Potential integration of Work Path or other Studio tools with external task managers or calendars.'},
    ]
  },
];

export default function B0aseBlueprintPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-gray-300 flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <div className="mb-8">
          <Link href="/workinprogress" className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors">
            <FaArrowLeft className="mr-2" />
            Back to Work In Progress
          </Link>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-10 text-center">B0ase.com Blueprint & Status</h1>

        <div className="space-y-12">
          {blueprintSections.map((section, sectionIndex) => (
            <section key={sectionIndex} className="bg-gray-900 p-6 md:p-8 border border-gray-800 shadow-xl">
              <h2 className="text-2xl font-semibold text-white mb-6 border-b border-gray-700 pb-3">{section.title}</h2>
              <div className="space-y-4">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="p-4 bg-gray-850 border border-gray-750 rounded-md shadow-sm">
                    <div className="flex items-center mb-2">
                      <div className="mr-3 w-6 h-6 flex items-center justify-center">
                        {statusIcons[item.status] || <FaQuestionCircle className="text-gray-500" />}
                      </div>
                      <h3 className="text-xl font-medium text-gray-100">{item.name}</h3>
                      {item.path && <span className="ml-3 text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-400">{item.path}</span>}
                      {item.feature && <span className="ml-3 text-xs bg-purple-700/50 px-2 py-0.5 rounded text-purple-300">Feature: {item.feature}</span>}
                    </div>
                    <p className="text-sm text-gray-400 ml-9">{item.details}</p>
                    <p className="text-xs text-gray-500 ml-9 mt-1">Status: <span className={`font-semibold ${item.status === 'DONE' ? 'text-green-400' : item.status === 'IN_PROGRESS' ? 'text-blue-400' : item.status === 'TO_DO' ? 'text-yellow-400' : item.status === 'PLANNED' ? 'text-purple-400' : 'text-red-400'}`}>{item.status.replace('_',' ')}</span></p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
} 