"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { portfolioData } from '@/lib/data';
import ProjectCard from '@/components/ProjectCard';
import SpecialOfferSticker from '@/components/SpecialOfferSticker';

const CTAPage = () => {
  const projects = portfolioData.projects.filter(p => p.type === 'domain');
  const duplicatedProjects = [...projects, ...projects, ...projects, ...projects];

  return (
    <>
      <style jsx global>{`
        @keyframes scroll {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-50%);
          }
        }
        .scrolling-wall {
          animation: scroll 80s linear infinite;
        }
        .scrolling-wall > div {
          break-inside: avoid;
          padding: 0.5rem;
        }
      `}</style>
      <div className="min-h-screen bg-black text-white flex items-start justify-center p-4 pt-8 relative overflow-hidden">
        {/* Scrolling Background Wall */}
        <div className="absolute inset-0 w-full h-full scale-110">
            <div className="absolute top-0 left-0 h-[200%] w-full columns-3 md:columns-4 lg:columns-5 gap-0 scrolling-wall">
                {duplicatedProjects.map((project, index) => (
                    <div key={`${project.id}-${index}`}>
                        <ProjectCard project={project} />
                    </div>
                ))}
            </div>
        </div>
        
        {/* Centered CTA Card */}
        <div className="relative z-10 w-full max-w-6xl">
            <div className="relative overflow-hidden bg-black/70 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 w-full px-8 sm:px-12 pt-12 pb-20 flex flex-col items-center">
            
            <div className="absolute -top-10 -right-10 transform-gpu" style={{ transform: 'rotate(15deg)' }}>
              <SpecialOfferSticker />
            </div>

            <h1 
              className="font-black mb-6 text-center tracking-tighter text-7xl sm:text-[7.5rem] md:text-[12rem] lg:text-[17rem] leading-tight break-words"
            >
              Launch Your Idea in 24 Hours
            </h1>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-8 text-pink-400 text-center">Website, Token, Socials, AI Agent & More</h2>
            
            <p className="text-base sm:text-lg text-gray-200 mb-8 text-center">
              b0ase.com is your all-in-one launchpad for digital innovation. For a single $500 package, we handle everything from idea to launch, making it fast, easy, and affordable.
            </p>
            
            <div className="w-full max-w-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-lg">
                  <div className="flex items-start bg-gray-900/80 p-4 rounded-lg">
                    <span className="text-pink-400 mr-4 mt-1 text-2xl">✔</span>
                    <div>
                      <span className="font-semibold text-white">
                        <span className="text-red-500 line-through mr-2 opacity-70">$1000</span>
                        <span>$500 Package</span>
                      </span>
                      <p className="text-gray-400 text-sm">Limited Time Offer</p>
                    </div>
                  </div>
                  <div className="flex items-start bg-gray-900/80 p-4 rounded-lg">
                    <span className="text-pink-400 mr-4 mt-1 text-2xl">✔</span>
                    <div>
                      <span className="font-semibold text-white">90% of your project tokens</span>
                      <p className="text-gray-400 text-sm">delivered immediately.</p>
                    </div>
                  </div>
                  <div className="flex items-start bg-gray-900/80 p-4 rounded-lg">
                    <span className="text-pink-400 mr-4 mt-1 text-2xl">✔</span>
                    <div>
                      <span className="font-semibold text-white">24-hour turnaround</span>
                      <p className="text-gray-400 text-sm">for most projects.</p>
                    </div>
                  </div>
                  <div className="flex items-start bg-gray-900/80 p-4 rounded-lg">
                    <span className="text-pink-400 mr-4 mt-1 text-2xl">✔</span>
                    <div>
                      <span className="font-semibold text-white">Expert support</span>
                      <p className="text-gray-400 text-sm">from our team.</p>
                    </div>
                  </div>
              </div>
            </div>
            
            <div className="mt-12">
              <Link href="/mint" legacyBehavior>
                <a className="inline-block bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700 text-white font-bold py-4 px-10 rounded-xl text-xl shadow-xl transition-all duration-300 transform hover:scale-105">
                  Get Started Now
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CTAPage; 