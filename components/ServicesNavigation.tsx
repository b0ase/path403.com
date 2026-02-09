'use client';

import React from 'react';
import Link from 'next/link';
import { portfolioData } from '@/lib/data'; // Using alias path

// Mapping from service slug to short display name
const shortServiceTitles: { [key: string]: string } = {
  "wordpress-development": "WordPress",
  "web-development": "Website Design",
  "content-copywriting": "Content",
  "video-production": "Video",
  "logo-branding": "Branding",
  "photography": "Photo",
  "seo-marketing": "SEO",
  "social-media-management": "Social",
  "technical-consulting": "Consulting",
  "support-maintenance": "Support",
};

export default function ServicesNavigation() {
  const services = portfolioData.services;
  // Extract platform links from portfolioData
  const { fiverr, upwork, freelancer } = portfolioData.about.socials;
  const platformLinks = [
    { name: 'Fiverr', href: fiverr, target: '_blank' },
    { name: 'Upwork', href: upwork, target: '_blank' },
    { name: 'Freelancer', href: freelancer, target: '_blank' },
  ].filter(link => link.href); // Filter out any potentially missing links

  // Estimate header height (py-4 is likely around 68px-76px)
  // const headerHeight = '72px'; // This is no longer used

  return (
    // Hidden on mobile, shown on desktop
    <nav 
      className="hidden md:flex sticky top-[60px] z-30 w-full bg-gray-100 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700 shadow-sm px-6 items-center h-10" // Added items-center and h-10 here
    >
      {/* Wrapper div for justify-between */}
      <div className="flex justify-between items-center w-full">
        {/* Left side: Service links */}
        <div className="flex justify-start items-center space-x-5">
          {services.map((service) => (
            <Link 
              key={service.slug}
              href={`/services/${service.slug}`}
              className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors whitespace-nowrap"
            >
              {/* Use short title from map, fallback to original title */}
              {shortServiceTitles[service.slug] || service.title}
            </Link>
          ))}
        </div>

        {/* Right side: Platform links */}
        <div className="flex items-center space-x-4">
           {platformLinks.map((link) => (
             <a 
                key={link.name}
                href={link.href}
                target={link.target}
                rel="noopener noreferrer"
                className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors whitespace-nowrap"
             >
               {link.name}
             </a>
           ))}
        </div>
      </div>
    </nav>
  );
} 