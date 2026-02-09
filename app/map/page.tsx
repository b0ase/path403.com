'use client';

import React from 'react';
import Link from 'next/link';

// List of all PUBLIC routes - No authentication required
const publicPages = [
  // Main public pages
  { path: '/', name: 'Home', description: 'Landing page' },
  { path: '/overview', name: 'Overview', description: 'Project overview' },
  { path: '/services', name: 'Services', description: 'Services offered' },
  { path: '/projects', name: 'Projects', description: 'Project showcase' },
  { path: '/portfolio', name: 'Portfolio', description: 'Portfolio pages' },
  { path: '/welcome', name: 'Welcome', description: 'Welcome page' },
  { path: '/map', name: 'Site Map', description: 'This page' },
  { path: '/market', name: 'Market', description: 'Project marketplace' },
  { path: '/login', name: 'Login', description: 'Login page' },
  { path: '/signup', name: 'Sign Up', description: 'Registration page' },
  
  // Additional public pages
  { path: '/agent', name: 'AI Agent', description: 'AI agent demo' },
  { path: '/ai', name: 'AI Services', description: 'AI services page' },
  { path: '/taas', name: 'TaaS', description: 'Token as a Service' },
  { path: '/studio', name: 'Studio', description: 'Content studio' },
  { path: '/content', name: 'Content', description: 'Content pages' },
  { path: '/exchange', name: 'Exchange', description: 'Token exchange' },
  { path: '/mint', name: 'Mint', description: 'Token minting' },
  { path: '/downloads', name: 'Downloads', description: 'Download center' },
  { path: '/courses', name: 'Courses', description: 'Educational courses' },
  { path: '/checkout', name: 'Checkout', description: 'Payment checkout' },
  { path: '/auth-test', name: 'Auth Test', description: 'Authentication testing' },
  { path: '/myagents', name: 'My Agents', description: 'AI agents showcase' },
  { path: '/mytoken', name: 'My Token', description: 'Token information' },
  { path: '/team', name: 'Team', description: 'Team information' },
  { path: '/trust', name: 'Trust', description: 'Trust and security' },
  { path: '/profile', name: 'Profile', description: 'Public profile' },
  { path: '/teams', name: 'Teams', description: 'Team collaboration' },
  { path: '/token', name: 'Token', description: 'Token details' },
  { path: '/update-password', name: 'Update Password', description: 'Password update' },
  { path: '/teammanagement', name: 'Team Management', description: 'Team management' },
  { path: '/set-password', name: 'Set Password', description: 'Password setup' },
  { path: '/settings', name: 'Settings', description: 'User settings' },
  { path: '/rewards', name: 'Rewards', description: 'Rewards program' },
  { path: '/privacy-policy', name: 'Privacy Policy', description: 'Privacy information' },
  { path: '/private', name: 'Private', description: 'Private content' },
  { path: '/invest', name: 'Invest', description: 'Investment opportunities' },
  { path: '/messages', name: 'Messages', description: 'Message center' },
  { path: '/myagent', name: 'My Agent', description: 'Personal AI agent' },
  { path: '/myprojects', name: 'My Projects', description: 'Personal projects' },
  { path: '/gigs', name: 'Gigs', description: 'Freelance opportunities' },
  { path: '/iframe-test', name: 'iFrame Test', description: 'iFrame testing' },
  { path: '/featured', name: 'Featured', description: 'Featured content' },
  { path: '/finances', name: 'Finances', description: 'Financial information' },
  { path: '/content-samples', name: 'Content Samples', description: 'Sample content' },
  { path: '/authplan', name: 'Auth Plan', description: 'Authentication planning' },
  { path: '/b0aseblueprint', name: 'B0ase Blueprint', description: 'Business blueprint' },
  { path: '/boasetoken', name: 'B0ase Token', description: 'Token information' },
  { path: '/careers', name: 'Careers', description: 'Career opportunities' },
  { path: '/client-login', name: 'Client Login', description: 'Client portal' },
  { path: '/clients', name: 'Clients', description: 'Client information' },
];

// List of pages that require authentication
const authenticatedPages = [
  // Auth-protected pages
  { path: '/auth/dashboard', name: 'Dashboard', description: 'User dashboard' },
  { path: '/auth/profile', name: 'Profile', description: 'User profile' },
  { path: '/auth/settings', description: 'User settings' },
  { path: '/auth/projects', name: 'My Projects', description: 'User projects' },
  { path: '/auth/messages', name: 'Messages', description: 'User messages' },
  { path: '/auth/teams', name: 'Teams', description: 'User teams' },
  { path: '/auth/skills', name: 'Skills', description: 'User skills' },
  { path: '/auth/tokens', name: 'Tokens', description: 'User tokens' },
  { path: '/auth/gigs', name: 'Gigs', description: 'User gigs' },
  { path: '/auth/finances', name: 'Finances', description: 'User finances' },
  { path: '/auth/diary', name: 'Diary', description: 'User diary' },
  { path: '/auth/agents', name: 'Agents', description: 'User agents' },
  { path: '/login', name: 'Sign Up', description: 'User registration' },
  { path: '/auth/workinprogress', name: 'Work in Progress', description: 'User task management' },
  
  // Admin pages
  { path: '/admin', name: 'Admin', description: 'Admin dashboard' },
  { path: '/admin/analytics', name: 'Analytics', description: 'Admin analytics' },
  { path: '/admin/clients', name: 'Clients', description: 'Admin clients' },
  { path: '/admin/projects', name: 'Projects', description: 'Admin projects' },
  { path: '/admin/users', name: 'Users', description: 'Admin users' },
  { path: '/admin/settings', name: 'Settings', description: 'Admin settings' },
  { path: '/admin/n8n', name: 'N8N', description: 'Admin automation' },
  { path: '/admin/notion', name: 'Notion', description: 'Admin notion' },
  { path: '/admin/project-logins', name: 'Project Logins', description: 'Admin logins' },
  { path: '/admin/authplan', name: 'Auth Plan', description: 'Authentication refactor plan' },
  { path: '/admin/fiverrscraper', name: 'Fiverr Scraper', description: 'Competitor analysis tool' },
];

export default function MapPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Site Map</h1>
      <p className="text-gray-400 mb-8 text-center max-w-2xl">
        Complete overview of all pages on the site, showing which require authentication.
      </p>
      
      {/* Public Pages Section */}
      <div className="w-full max-w-7xl mb-12">
        <h2 className="text-2xl font-bold mb-4 text-green-400">Public Pages ({publicPages.length})</h2>
        <p className="text-gray-400 mb-4 text-sm">No authentication required</p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {publicPages.map((page) => (
            <Link key={page.path} href={page.path}>
              <div
                className="bg-green-100 border-green-300 text-green-800 hover:bg-green-200 rounded-lg p-3 text-xs font-semibold shadow-md border-2 transition-all duration-300 text-center cursor-pointer hover:scale-105 hover:-translate-y-1"
                style={{ minWidth: 0 }}
              >
                <div className="truncate mb-1 font-bold">{page.name}</div>
                <div className="truncate text-[10px] opacity-70 mb-1">{page.path}</div>
                <div className="truncate text-[9px] opacity-60">{page.description}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Authenticated Pages Section */}
      <div className="w-full max-w-7xl">
        <h2 className="text-2xl font-bold mb-4 text-orange-400">Authenticated Pages ({authenticatedPages.length})</h2>
        <p className="text-gray-400 mb-4 text-sm">Login required to access</p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {authenticatedPages.map((page) => (
            <Link key={page.path} href={page.path}>
              <div
                className="bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200 rounded-lg p-3 text-xs font-semibold shadow-md border-2 transition-all duration-300 text-center cursor-pointer hover:scale-105 hover:-translate-y-1"
                style={{ minWidth: 0 }}
              >
                <div className="truncate mb-1 font-bold">{page.name}</div>
                <div className="truncate text-[10px] opacity-70 mb-1">{page.path}</div>
                <div className="truncate text-[9px] opacity-60">{page.description}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-8 text-gray-400 text-xs text-center">
        <div className="flex items-center justify-center gap-4 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded"></div>
            <span>Public Pages</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-400 rounded"></div>
            <span>Authentication Required</span>
          </div>
        </div>
        <p className="mb-4">Total: {publicPages.length + authenticatedPages.length} pages</p>
        <p>Click any page to navigate | Public pages accessible to everyone</p>
      </div>
    </div>
  );
} 