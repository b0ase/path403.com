'use client';

import React from 'react';
import Link from 'next/link';

export const sections = [
  { name: '/ web design', href: '/services/web-development' },
  { name: '/ software development', href: '/services/software-development' },
  { name: '/ content', href: '/services/content-copywriting' },
  { name: '/ video', href: '/services/video-production' },
  { name: '/ branding', href: '/services/logo-branding' },
  { name: '/ seo', href: '/services/seo-marketing' },
  { name: '/ social', href: '/services/social-media-management' },
  { name: '/ consulting', href: '/services/technical-consulting' },
  { name: '/ support', href: '/services/support-maintenance' },
];

export default function SubNavigation() {
  return (
    // Hidden on mobile (e.g., hidden md:flex), shown on desktop
    // Adjust sticky top value based on Header height
    <nav className="hidden md:flex sticky top-[60px] z-30 w-full bg-background border-b border-border shadow-sm px-4">
      <div className="w-full flex justify-between items-center h-12 space-x-6 text-foreground">
        {/* Left group: Studio button and Service links */}
        <div className="flex items-center space-x-8 ml-6">
          {/* Studio Button */}
          <Link
            href="/studio"
            className="inline-flex items-center px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 text-blue-300 text-sm font-medium hover:bg-blue-600/30 hover:text-blue-200 transition-colors shadow-sm rounded"
          >
            Studio
            <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          
          {/* Service links */}
          <ul className="flex space-x-4 md:space-x-6">
            {sections.map((section) => (
              <li key={section.name}>
                <Link
                  href={section.href}
                  className="text-sm font-medium text-white hover:text-gray-200 transition-colors"
                >
                  {section.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right group: External platform links */}
        <ul className="flex space-x-4 md:space-x-5 ml-auto">
          <li>
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-white hover:text-gray-200 transition-colors flex items-center">
              Fiverr
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </a>
          </li>
          <li>
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-white hover:text-gray-200 transition-colors flex items-center">
              Upwork
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </a>
          </li>
          <li>
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-white hover:text-gray-200 transition-colors flex items-center">
              Freelancer
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
} 