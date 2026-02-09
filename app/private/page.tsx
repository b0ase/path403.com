'use client';

import React from 'react';
import Link from 'next/link';
import { FaLock, FaArrowLeft } from 'react-icons/fa';

interface PrivatePageLink {
  href: string;
  title: string;
  description: string;
  icon?: React.ReactNode; // Optional icon for each link
}

const privatePages: PrivatePageLink[] = [
  { href: '/studio', title: 'Studio', description: 'Your central private hub and dashboard.', icon: <FaLock /> },
  { href: '/diary', title: 'Diary', description: 'Collaborative log of discussions, decisions, and action items.', icon: <FaLock /> },
  { href: '/workinprogress', title: 'Work In Progress', description: 'Track current tasks and project statuses.', icon: <FaLock /> },
  { href: '/b0aseblueprint', title: 'b0ase.com Blueprint', description: 'Detailed overview of b0ase.com components and features.', icon: <FaLock /> },
  { href: '/calendar', title: 'Calendar (Gigs)', description: 'Visualize deadlines, learning, and financial check-ins for gigs.', icon: <FaLock /> }, // Assuming this is /gigs/calendar
  { href: '/finances', title: 'Financial Overview', description: 'View income, expenses, and financial reports.', icon: <FaLock /> },
  { href: '/gigs/learning-path', title: 'Gig Learning Path', description: 'Structured 3-month schedule to master gig platforms.', icon: <FaLock /> },
  { href: '/gigs/work-path', title: 'Gig Work Path', description: 'Manage daily workflow for client work and skill development.', icon: <FaLock /> },
  // Note: /private itself is not listed here as it's this page.
];

export default function PrivateSitemapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-gray-300 flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <div className="mb-8">
          <Link href="/studio" className="inline-flex items-center text-sky-400 hover:text-sky-300 transition-colors">
            <FaArrowLeft className="mr-2" />
            Back to Studio
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Protected Area Directory</h1>
          <p className="mt-4 text-lg text-gray-400">
            This is a directory of private pages within b0ase.com. Access requires authentication.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {privatePages.map((page) => (
            <Link 
              key={page.href} 
              href={page.href} 
              className="block bg-gray-850 hover:bg-gray-800 p-6 border border-gray-700 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 group"
            >
              <div className="flex items-center mb-3">
                {page.icon && <span className="mr-3 text-sky-400 text-xl">{page.icon}</span>}
                <h2 className="text-xl font-semibold text-sky-400 group-hover:text-sky-300">{page.title}</h2>
              </div>
              <p className="text-sm text-gray-400 group-hover:text-gray-300">{page.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
} 