"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { portfolioData } from '@/lib/data';
import ProjectCard from '@/components/ProjectCard';
import SpecialOfferSticker from '@/components/SpecialOfferSticker';

const OneFeexPage = () => {
  const projects = portfolioData.projects.filter(p => p.type === 'domain');
  const duplicatedProjects = [...projects, ...projects, ...projects, ...projects];
  const [autoScrollActive, setAutoScrollActive] = useState(true);



  useEffect(() => {
    if (!autoScrollActive) return;

    // Auto-scroll the page slowly
    const autoScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const maxScroll = scrollHeight - windowHeight;
      
      let currentScroll = 0;
      const scrollSpeed = 0.5; // pixels per frame
      let animationId: number;
      
      const scroll = () => {
        if (!autoScrollActive) return; // Check if auto-scroll should continue
        
        if (currentScroll < maxScroll) {
          currentScroll += scrollSpeed;
          window.scrollTo(0, currentScroll);
          animationId = requestAnimationFrame(scroll);
        } else {
          // Reset to top and start again
          setTimeout(() => {
            if (autoScrollActive) {
              window.scrollTo(0, 0);
              currentScroll = 0;
              setTimeout(() => {
                if (autoScrollActive) scroll();
              }, 2000); // Wait 2 seconds before starting again
            }
          }, 3000); // Stay at bottom for 3 seconds
        }
      };
      
      // Start scrolling after 3 seconds
      setTimeout(() => {
        if (autoScrollActive) scroll();
      }, 3000);

      return () => {
        if (animationId) cancelAnimationFrame(animationId);
      };
    };
    
    const cleanup = autoScroll();
    return cleanup;
  }, [autoScrollActive]);

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
        @keyframes gentleGlow {
          0%, 100% {
            box-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.8);
            transform: scale(1.02);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .scrolling-wall {
          animation: scroll 80s linear infinite;
        }
        .scrolling-wall > div {
          break-inside: avoid;
          padding: 0.5rem;
        }
        .gentle-glow {
          animation: gentleGlow 3s ease-in-out infinite;
        }

        .heart-mask {
          clip-path: circle(50% at 50% 50%);
          animation: float 3s ease-in-out infinite;
        }
        .bee-mask {
          clip-path: circle(50% at 50% 50%);
          animation: float 4s ease-in-out infinite;
        }
        .honey-pot-mask {
          clip-path: circle(50% at 50% 50%);
          animation: float 5s ease-in-out infinite;
        }
        .hexagon-mask {
          clip-path: circle(50% at 50% 50%);
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
      


      <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-black to-orange-900 text-white flex items-start justify-center p-2 md:p-4 pt-4 md:pt-8 relative overflow-hidden overflow-y-auto">
        {/* Scrolling Background Wall */}
        <div className="absolute inset-0 w-full h-full scale-110 opacity-30">
            <div className="absolute top-0 left-0 h-[200%] w-full columns-3 md:columns-4 lg:columns-5 gap-0 scrolling-wall">
                {duplicatedProjects.map((project, index) => (
                    <div key={`${project.id}-${index}`}>
                        <ProjectCard project={project} />
                    </div>
                ))}
            </div>
        </div>

        {/* Decorative Images - Border Layout - Two Columns Each Side - Hidden on Mobile */}
        <div className="absolute inset-0 pointer-events-none z-20 hidden lg:block">
          {/* Left Border Images - Column 1 (closer to edge) */}
          <div className="absolute top-16 left-2 w-40 h-40 heart-mask">
            <Image 
              src="/1feex-offer/download-3.jpg" 
              alt="Honey decoration" 
              width={160} 
              height={160} 
              className="object-cover w-full h-full"
            />
          </div>
          
          <div className="absolute top-56 left-4 w-44 h-44 honey-pot-mask">
            <Image 
              src="/1feex-offer/download-5.jpg" 
              alt="Honey decoration" 
              width={176} 
              height={176} 
              className="object-cover w-full h-full"
            />
          </div>

          <div className="absolute top-[28rem] left-2 w-48 h-48 heart-mask">
            <Image 
              src="/1feex-offer/download-7.jpg" 
              alt="Honey decoration" 
              width={192} 
              height={192} 
              className="object-cover w-full h-full"
            />
          </div>

          <div className="absolute top-[44rem] left-4 w-56 h-56 honey-pot-mask">
            <Image 
              src="/1feex-offer/download-9.jpg" 
              alt="Honey decoration" 
              width={224} 
              height={224} 
              className="object-cover w-full h-full"
            />
          </div>

          {/* Left Border Images - Column 2 (further from edge) */}
          <div className="absolute top-32 left-12 w-48 h-48 bee-mask">
            <Image 
              src="/1feex-offer/download-4.jpg" 
              alt="Honey decoration" 
              width={192} 
              height={192} 
              className="object-cover w-full h-full"
            />
          </div>
          
          <div className="absolute top-80 left-16 w-52 h-52 hexagon-mask">
            <Image 
              src="/1feex-offer/download-6.jpg" 
              alt="Honey decoration" 
              width={208} 
              height={208} 
              className="object-cover w-full h-full"
            />
          </div>

          <div className="absolute top-[36rem] left-12 w-40 h-40 bee-mask">
            <Image 
              src="/1feex-offer/download-8.jpg" 
              alt="Honey decoration" 
              width={160} 
              height={160} 
              className="object-cover w-full h-full"
            />
          </div>

          <div className="absolute top-[52rem] left-16 w-44 h-44 hexagon-mask">
            <Image 
              src="/1feex-offer/download-10.jpg" 
              alt="Honey decoration" 
              width={176} 
              height={176} 
              className="object-cover w-full h-full"
            />
          </div>

          {/* Right Border Images - Column 1 (closer to edge) */}
          <div className="absolute top-20 right-2 w-48 h-48 bee-mask">
            <Image 
              src="/1feex-offer/download-11.jpg" 
              alt="Honey decoration" 
              width={192} 
              height={192} 
              className="object-cover w-full h-full"
            />
          </div>

          <div className="absolute top-64 right-4 w-52 h-52 heart-mask">
            <Image 
              src="/1feex-offer/download-4.jpg" 
              alt="Honey decoration" 
              width={208} 
              height={208} 
              className="object-cover w-full h-full"
            />
          </div>

          <div className="absolute top-[30rem] right-2 w-40 h-40 bee-mask">
            <Image 
              src="/1feex-offer/download-6.jpg" 
              alt="Honey decoration" 
              width={160} 
              height={160} 
              className="object-cover w-full h-full"
            />
          </div>

          <div className="absolute top-[46rem] right-4 w-56 h-56 heart-mask">
            <Image 
              src="/1feex-offer/download-8.jpg" 
              alt="Honey decoration" 
              width={224} 
              height={224} 
              className="object-cover w-full h-full"
            />
          </div>

          {/* Right Border Images - Column 2 (further from edge) */}
          <div className="absolute top-40 right-12 w-40 h-40 honey-pot-mask">
            <Image 
              src="/1feex-offer/download-3.jpg" 
              alt="Honey decoration" 
              width={160} 
              height={160} 
              className="object-cover w-full h-full"
            />
          </div>

          <div className="absolute top-88 right-16 w-44 h-44 hexagon-mask">
            <Image 
              src="/1feex-offer/download-5.jpg" 
              alt="Honey decoration" 
              width={176} 
              height={176} 
              className="object-cover w-full h-full"
            />
          </div>

          <div className="absolute top-[38rem] right-12 w-48 h-48 honey-pot-mask">
            <Image 
              src="/1feex-offer/download-7.jpg" 
              alt="Honey decoration" 
              width={192} 
              height={192} 
              className="object-cover w-full h-full"
            />
          </div>

          <div className="absolute top-[54rem] right-16 w-44 h-44 hexagon-mask">
            <Image 
              src="/1feex-offer/download-9.jpg" 
              alt="Honey decoration" 
              width={176} 
              height={176} 
              className="object-cover w-full h-full"
            />
          </div>
        </div>
        
        {/* Centered CTA Card */}
        <div className="relative z-10 w-full max-w-6xl">
            <div className="relative overflow-hidden bg-black/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-yellow-400/20 w-full px-4 sm:px-8 lg:px-12 pt-8 sm:pt-12 pb-12 sm:pb-20 flex flex-col items-center">
            
            <div className="absolute -top-10 -right-10 transform-gpu z-50" style={{ transform: 'rotate(15deg)' }}>
              <SpecialOfferSticker />
            </div>

            {/* Decorative Images within Content - Hidden on Mobile */}
            <div className="absolute top-20 left-8 w-16 h-16 heart-mask opacity-60 hidden lg:block">
              <Image 
                src="/1feex-offer/download-3.jpg" 
                alt="Honey decoration" 
                width={64} 
                height={64} 
                className="object-cover w-full h-full"
              />
            </div>

            <div className="absolute top-32 right-12 w-20 h-20 honey-pot-mask opacity-60 hidden lg:block">
              <Image 
                src="/1feex-offer/download-4.jpg" 
                alt="Honey decoration" 
                width={80} 
                height={80} 
                className="object-cover w-full h-full"
              />
            </div>

            {/* Big Bold Offer at Top */}
            <div className="mb-6 sm:mb-8 text-center mt-8 sm:mt-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-yellow-300 mb-4 tracking-wider">
                🍯 EXCLUSIVE HONEY-TRAP OFFER 🍯
              </h2>
              <div className="flex items-center justify-center mb-4">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-red-500 line-through mr-2 sm:mr-4">$500</span>
                <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400">
                  $200
                </div>
              </div>
              <p className="text-lg sm:text-xl text-red-400 font-bold mb-2">💥 PRICE SLASHED! 💥</p>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-300 mb-2">COMPLETE LAUNCH PACKAGE</h3>
              <p className="text-base sm:text-lg text-gray-300">Everything You Need to Launch 1FeeX.com</p>
            </div>

            {/* Target Company Branding */}
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-3xl">🍯</span>
              </div>
              <h3 className="text-2xl font-bold text-yellow-400">1FeeX</h3>
              <span className="mx-4 text-gray-400">×</span>
              <h3 className="text-2xl font-bold text-blue-400">b0ase.com</h3>
            </div>

            {/* Images around main heading - Hidden on Mobile */}
            <div className="absolute top-96 left-4 w-24 h-24 bee-mask opacity-50 hidden lg:block">
              <Image 
                src="/1feex-offer/download-5.jpg" 
                alt="Honey decoration" 
                width={96} 
                height={96} 
                className="object-cover w-full h-full"
              />
            </div>

            <div className="absolute top-[28rem] right-8 w-28 h-28 hexagon-mask opacity-50 hidden lg:block">
              <Image 
                src="/1feex-offer/download-6.jpg" 
                alt="Honey decoration" 
                width={112} 
                height={112} 
                className="object-cover w-full h-full"
              />
            </div>

            <h1 
              className="font-black mb-4 sm:mb-6 text-center tracking-tighter text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl leading-tight break-words text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400"
            >
              Sweet Honey, Lost Bitcoin Found
            </h1>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-6 sm:mb-8 text-center px-2">
              <span className="text-yellow-400">One Foreign Exchange</span> + 
              <span className="text-orange-400"> Bitcoin Base Layer</span> + 
              <span className="text-red-400"> Digital Fiat Tokens</span> = 
              <span className="text-pink-400"> $8bn Satoshi Power</span>
            </h2>
            
            <p className="text-sm sm:text-base lg:text-lg text-gray-200 mb-6 sm:mb-8 text-center max-w-4xl px-2">
              Your revolutionary One Foreign Exchange platform (1FeeX.com) deserves a honey-sweet website that's as powerful as your $8 billion satoshi fortune and as smart as your Bitcoin base layer technology. 
              Let b0ase.com build you a digital ecosystem that attracts forex traders like bees to honey while processing digital fiat currency exchanges on Bitcoin.
            </p>
            
            {/* Images around features section - Hidden on Mobile */}
            <div className="absolute top-[42rem] left-12 w-20 h-20 heart-mask opacity-40 hidden lg:block">
              <Image 
                src="/1feex-offer/download-7.jpg" 
                alt="Honey decoration" 
                width={80} 
                height={80} 
                className="object-cover w-full h-full"
              />
            </div>

            <div className="absolute top-[50rem] right-16 w-24 h-24 honey-pot-mask opacity-40 hidden lg:block">
              <Image 
                src="/1feex-offer/download-8.jpg" 
                alt="Honey decoration" 
                width={96} 
                height={96} 
                className="object-cover w-full h-full"
              />
            </div>

            <div className="w-full max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-lg">
                  <div className="flex items-start bg-gradient-to-r from-yellow-900/60 to-orange-900/60 p-4 rounded-lg border border-yellow-400/20">
                    <span className="text-yellow-400 mr-4 mt-1 text-2xl">💱</span>
                    <div>
                      <span className="font-semibold text-white">FX Trading Platform</span>
                      <p className="text-gray-300 text-sm">Professional foreign exchange interface with Bitcoin base layer infrastructure</p>
                    </div>
                  </div>
                  <div className="flex items-start bg-gradient-to-r from-orange-900/60 to-red-900/60 p-4 rounded-lg border border-orange-400/20">
                    <span className="text-orange-400 mr-4 mt-1 text-2xl">🪙</span>
                    <div>
                      <span className="font-semibold text-white">Digital Fiat Token Engine</span>
                      <p className="text-gray-300 text-sm">Seamless conversion between fiat currencies as Bitcoin-backed digital tokens</p>
                    </div>
                  </div>
                  <div className="flex items-start bg-gradient-to-r from-red-900/60 to-pink-900/60 p-4 rounded-lg border border-red-400/20">
                    <span className="text-red-400 mr-4 mt-1 text-2xl">⚡</span>
                    <div>
                      <span className="font-semibold text-white">Satoshi Fortune Dashboard</span>
                      <p className="text-gray-300 text-sm">Real-time management and tracking of your $8 billion satoshi treasury reserves</p>
                    </div>
                  </div>
                  <div className="flex items-start bg-gradient-to-r from-purple-900/60 to-blue-900/60 p-4 rounded-lg border border-purple-400/20">
                    <span className="text-purple-400 mr-4 mt-1 text-2xl">🔗</span>
                    <div>
                      <span className="font-semibold text-white">Bitcoin Base Layer API</span>
                      <p className="text-gray-300 text-sm">Enterprise-grade Bitcoin infrastructure for secure fiat token settlements</p>
                    </div>
                  </div>
                  <div className="flex items-start bg-gradient-to-r from-blue-900/60 to-cyan-900/60 p-4 rounded-lg border border-blue-400/20">
                    <span className="text-blue-400 mr-4 mt-1 text-2xl">📊</span>
                    <div>
                      <span className="font-semibold text-white">FX Intelligence Hub</span>
                      <p className="text-gray-300 text-sm">Advanced analytics and market intelligence for foreign exchange operations</p>
                    </div>
                  </div>
                  <div className="flex items-start bg-gradient-to-r from-green-900/60 to-emerald-900/60 p-4 rounded-lg border border-green-400/20">
                    <span className="text-green-400 mr-4 mt-1 text-2xl">🍯</span>
                    <div>
                      <span className="font-semibold text-white">Sweet Trading Support</span>
                      <p className="text-gray-300 text-sm">AI chatbot for FX trading assistance & satoshi fortune optimization</p>
                    </div>
                  </div>
                  <div className="flex items-start bg-gradient-to-r from-pink-900/60 to-red-900/60 p-4 rounded-lg border border-pink-400/20">
                    <span className="text-pink-400 mr-4 mt-1 text-2xl">🚀</span>
                    <div>
                      <span className="font-semibold text-white">Complete Exchange Ecosystem</span>
                      <p className="text-gray-300 text-sm">1FeeX token, trading platform, settlements & digital fiat exchange infrastructure</p>
                    </div>
                  </div>
              </div>
            </div>

            {/* Images around pricing section - Hidden on Mobile */}
            <div className="absolute top-[72rem] left-6 w-18 h-18 bee-mask opacity-45 hidden lg:block">
              <Image 
                src="/1feex-offer/download-9.jpg" 
                alt="Honey decoration" 
                width={72} 
                height={72} 
                className="object-cover w-full h-full"
              />
            </div>

            <div className="absolute top-[84rem] right-10 w-22 h-22 hexagon-mask opacity-45 hidden lg:block">
              <Image 
                src="/1feex-offer/download-10.jpg" 
                alt="Honey decoration" 
                width={88} 
                height={88} 
                className="object-cover w-full h-full"
              />
            </div>

            {/* Our Offer to Them */}
            <div className="mt-12 p-6 bg-gradient-to-r from-green-900/40 to-blue-900/40 rounded-xl border border-green-400/30 w-full max-w-4xl">
              <h3 className="text-2xl font-bold text-center mb-6 text-green-300">🍯 1FeeX Launch Packages 🍯</h3>
              
              {/* Starter Package - $200 */}
              <div className="bg-yellow-900/30 p-5 rounded-lg border border-yellow-400/40 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-bold text-yellow-300">🌟 STARTER PACKAGE</h4>
                  <div className="text-3xl font-black text-yellow-400">$200</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center">
                    <span className="text-yellow-400 mr-2">💱</span>
                    <span>Professional 1FeeX.com FX platform</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-orange-400 mr-2">📱</span>
                    <span>Complete trading interface setup</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-400 mr-2">⚡</span>
                    <span>24-hour delivery guarantee</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-pink-400 mr-2">🪙</span>
                    <span>1FeeX token creation & launch</span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-yellow-800/40 rounded border border-yellow-400/30">
                  <h5 className="text-sm font-bold text-yellow-300 mb-2">🍯 SWEET FX BONUSES:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">👑</span>
                      <span>Satoshi Fortune Management Strategy</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-orange-400 mr-1">🎯</span>
                      <span>Digital Fiat Token Optimization</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-1">📊</span>
                      <span>Bitcoin Base Layer Analytics</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-pink-400 mr-1">🚀</span>
                      <span>FX Platform Success Consulting</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Package - $500 */}
              <div className="bg-purple-900/30 p-5 rounded-lg border border-purple-400/40 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-bold text-purple-300">💎 PROFESSIONAL PACKAGE</h4>
                  <div className="text-3xl font-black text-purple-400">$500</div>
                </div>
                <p className="text-sm text-gray-300 mb-3">Everything in Starter Package, PLUS:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center">
                    <span className="text-orange-400 mr-2">⚡</span>
                    <span>Advanced Bitcoin base layer API</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-red-400 mr-2">💰</span>
                    <span>Satoshi fortune management portal</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-purple-400 mr-2">🤖</span>
                    <span>AI FX trading intelligence agent</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-pink-400 mr-2">🪙</span>
                    <span>Advanced digital fiat token system</span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-purple-800/40 rounded border border-purple-400/30">
                  <h5 className="text-sm font-bold text-purple-300 mb-2">🍯 PREMIUM FX MADNESS:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">🛡️</span>
                      <span>Enterprise Security Infrastructure</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-orange-400 mr-1">⚡</span>
                      <span>Lightning-Fast Settlement System</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-purple-400 mr-1">🎭</span>
                      <span>Advanced Trading Algorithms</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-pink-400 mr-1">🌪️</span>
                      <span>Viral FX Marketing Engine</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-cyan-400 mr-1">👑</span>
                      <span>VIP $8bn Fortune Support</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-1">🎯</span>
                      <span>Automated Trading Operations</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Requirements */}
              <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 p-5 rounded-lg border-2 border-purple-400/50 relative">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-400 to-indigo-500 text-white px-3 py-1 text-xs font-bold transform rotate-12 translate-x-2 -translate-y-2">
                  UNLIMITED!
                </div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-bold text-purple-300">🌟 CUSTOM REQUIREMENTS</h4>
                  <div className="text-2xl font-black text-purple-400">Contact Sales</div>
                </div>
                <p className="text-sm text-gray-300 mb-3">Need something beyond our packages? We can build anything:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center">
                    <span className="text-blue-400 mr-2">⛓️</span>
                    <span>Full Bitcoin infrastructure dashboard</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-cyan-400 mr-2">💰</span>
                    <span>Advanced satoshi fortune tools</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-400 mr-2">📊</span>
                    <span>AI-powered FX analytics & reporting</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-yellow-400 mr-2">👑</span>
                    <span>Custom trading integrations & APIs</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-pink-400 mr-2">🎯</span>
                    <span>Enterprise-grade security</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-orange-400 mr-2">🔧</span>
                    <span>Whatever your FX vision requires!</span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-indigo-800/40 rounded border border-indigo-400/30">
                  <h5 className="text-sm font-bold text-indigo-300 mb-2">🍯 ABSOLUTELY INSANE HONEY EXTRAS:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">🕴️</span>
                      <span>Secret Agent Bee Recruitment</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-orange-400 mr-1">🌐</span>
                      <span>Global Honey Conspiracy Network</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-purple-400 mr-1">🛸</span>
                      <span>Alien Bee Communication Protocol</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-pink-400 mr-1">⚗️</span>
                      <span>Honey-Based Mind Control Serum</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-cyan-400 mr-1">🌋</span>
                      <span>Underground Hive Command Center</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-1">🎪</span>
                      <span>Interdimensional Honey Portal</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-red-400 mr-1">🦄</span>
                      <span>Mythical Honey Unicorn Summoning</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-300 mr-1">🚁</span>
                      <span>Helicopter Bee Surveillance Squad</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <a href="mailto:admin@b0ase.com?subject=Custom 1FeeX Requirements - Let's Talk!" className="inline-block bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-2 px-6 rounded-full hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 shadow-lg">
                    💬 Discuss Your Vision
                  </a>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center mt-6">
                <p className="text-gray-400 text-sm mb-2">🎯 Start with our $200 package and upgrade anytime!</p>
                <p className="text-green-300 font-semibold">Most clients upgrade to Professional within 30 days 📈</p>
              </div>
            </div>

            {/* Featured: 1FeeX Token Launch */}
            <div className="mt-8 p-6 bg-gradient-to-r from-yellow-900/60 to-orange-900/60 rounded-xl border-2 border-yellow-400/50 w-full max-w-4xl relative overflow-hidden" id="token">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-400 to-orange-500 text-black px-4 py-1 text-sm font-bold transform rotate-12 translate-x-2 -translate-y-2">
                NEW TOKEN!
              </div>
              
              {/* Token section decorative image - Hidden on Mobile */}
              <div className="absolute top-4 left-4 w-24 h-24 honey-pot-mask hidden lg:block">
                <Image 
                  src="/1feex-offer/download-5.jpg" 
                  alt="Honey decoration" 
                  width={96} 
                  height={96} 
                  className="object-cover w-full h-full"
                />
              </div>
              
              <div className="flex items-center justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center mr-4 animate-pulse">
                  <span className="text-4xl">🪙</span>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-yellow-300 mb-1">1FeeX TOKEN</h3>
                  <p className="text-orange-300 font-semibold">Official Honey-Crypto Currency</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-4">
                <div className="bg-black/40 p-4 rounded-lg">
                  <h4 className="font-bold text-yellow-400 mb-2">🍯 Honey Rewards</h4>
                  <p className="text-sm text-gray-300">Earn tokens for every yogurt purchase</p>
                </div>
                <div className="bg-black/40 p-4 rounded-lg">
                  <h4 className="font-bold text-orange-400 mb-2">₿ Recovery Fees</h4>
                  <p className="text-sm text-gray-300">Pay for bitcoin recovery services</p>
                </div>
                <div className="bg-black/40 p-4 rounded-lg">
                  <h4 className="font-bold text-red-400 mb-2">📈 Investment</h4>
                  <p className="text-sm text-gray-300">Trade on exchanges as demand grows</p>
                </div>
              </div>
              
              <div className="text-center mb-4">
                <p className="text-yellow-200 font-semibold text-lg mb-2">
                  🚀 Launch Supply: 1,000,000 1FeeX tokens
                </p>
                <p className="text-gray-300 text-sm">
                  You get 90% ownership + full token management system
                </p>
              </div>

              {/* 1Sat Market Link */}
              <div className="text-center">
                <a 
                  href="https://1sat.market/market/bsv21/fa6cf4066dadfd9e9d64dcd1f86edbf5bb4a31ce4a1e6ba4c0f889c509f5fa34_1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-xl transition-all duration-300 transform hover:scale-105 border border-purple-400/30"
                >
                  🌟 Trade 1FeeX on 1Sat.Market 🌟
                </a>
              </div>
            </div>

            {/* Images around bottom sections - Hidden on Mobile */}
            <div className="absolute bottom-80 left-8 w-20 h-20 heart-mask opacity-35 hidden lg:block">
              <Image 
                src="/1feex-offer/download-11.jpg" 
                alt="Honey decoration" 
                width={80} 
                height={80} 
                className="object-cover w-full h-full"
              />
            </div>

            <div className="absolute bottom-40 right-12 w-24 h-24 bee-mask opacity-35 hidden lg:block">
              <Image 
                src="/1feex-offer/download-3.jpg" 
                alt="Honey decoration" 
                width={96} 
                height={96} 
                className="object-cover w-full h-full"
              />
            </div>

            {/* Why 1FeeX Needs This */}
            <div className="mt-8 p-6 bg-gradient-to-r from-yellow-900/40 to-orange-900/40 rounded-xl border border-yellow-400/30 w-full max-w-4xl">
              <h3 className="text-xl font-bold text-center mb-4 text-yellow-300">🎯 Why 1FeeX Needs This Sweet Deal Now</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <h4 className="font-semibold text-yellow-400 mb-2">Untapped Market</h4>
                  <p className="text-gray-300">First honey yogurt company in crypto recovery - ZERO competition!</p>
                </div>
                <div>
                  <h4 className="font-semibold text-orange-400 mb-2">Bitcoin Boom</h4>
                  <p className="text-gray-300">$140+ billion in lost bitcoin waiting to be recovered</p>
                </div>
                <div>
                  <h4 className="font-semibold text-red-400 mb-2">Honey-Trap Strategy</h4>
                  <p className="text-gray-300">Sweet yogurt business attracts clients, crypto recovery pays the bills</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <a 
                href="mailto:admin@b0ase.com?subject=Yes! Please build 1FeeX.com for me! :-)"
                className="inline-block bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 hover:from-yellow-600 hover:via-orange-600 hover:to-red-700 text-white font-bold py-4 px-10 rounded-xl text-xl shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Yes! Give Me The $200 Deal
              </a>
              <Link href="/services" legacyBehavior>
                <a className="inline-block bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white font-bold py-4 px-10 rounded-xl text-xl shadow-xl transition-all duration-300 transform hover:scale-105 border border-yellow-400/30">
                  See Our Sweet Portfolio
                </a>
              </Link>
            </div>

            {/* Urgency Footer */}
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm mb-2">🕒 Sweet deal expires in 7 days - limited to first 5 honey businesses</p>
              <p className="text-yellow-300 font-semibold">Don't let other yogurt companies steal your crypto thunder! 🍯₿</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OneFeexPage; 