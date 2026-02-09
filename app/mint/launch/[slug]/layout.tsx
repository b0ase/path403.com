'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { portfolioData } from '@/lib/data';
import { motion } from 'framer-motion';
import { ArrowLeft, Rocket, Map, Users, Coins } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const tabs = [
  { id: 'overview', label: 'Overview', icon: Rocket, href: '' },
  { id: 'roadmap', label: 'Roadmap', icon: Map, href: '/roadmap' },
  { id: 'team', label: 'Team', icon: Users, href: '/team' },
  { id: 'invest', label: 'Invest', icon: Coins, href: '/invest' },
];

export default function LaunchLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const slug = params?.slug as string;
  const project = portfolioData.projects.find(p => p.slug === slug);

  if (!project) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-black mb-4">PROJECT NOT FOUND</h1>
        <button
          onClick={() => router.push('/mint')}
          className="flex items-center gap-2 text-gray-400 hover:text-white"
        >
          <ArrowLeft size={20} /> Back to Launchpad
        </button>
      </div>
    );
  }

  const basePath = `/mint/launch/${slug}`;
  const currentTab = tabs.find(tab =>
    tab.href === ''
      ? pathname === basePath
      : pathname === `${basePath}${tab.href}`
  ) || tabs[0];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-8">
          {/* Back button */}
          <button
            onClick={() => router.push('/mint')}
            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest">Launchpad</span>
          </button>

          {/* Project header */}
          <div className="flex items-start gap-6">
            {/* Project image */}
            {project.cardImageUrls?.[0] && (
              <div className="w-20 h-20 bg-gray-900 border border-gray-800 overflow-hidden flex-shrink-0">
                <Image
                  src={project.cardImageUrls[0]}
                  alt={project.title}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 bg-gray-900 border border-gray-800 text-gray-400">
                  {project.status}
                </span>
                {project.tokenName && (
                  <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 bg-blue-900/30 border border-blue-800/50 text-blue-400">
                    {project.tokenName}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
                {project.title}
              </h1>
              <p className="text-gray-400 mt-2 max-w-2xl">
                {project.description}
              </p>
            </div>
          </div>

          {/* Tabs - 2x2 grid on mobile, flex row on desktop */}
          <div className="grid grid-cols-2 md:flex gap-1 mt-8 md:-mb-[1px]">
            {tabs.map((tab) => {
              const isActive = currentTab.id === tab.id;
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  href={`${basePath}${tab.href}`}
                  className={`flex items-center justify-center md:justify-start gap-2 px-3 md:px-4 py-3 text-xs md:text-sm font-bold uppercase tracking-widest border transition-colors ${
                    isActive
                      ? 'bg-black text-white border-gray-800'
                      : 'bg-gray-900/50 text-gray-500 border-gray-800 md:border-transparent hover:text-gray-300'
                  } md:border-b-0`}
                >
                  <Icon size={16} />
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {children}
      </div>
    </div>
  );
}
