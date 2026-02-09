"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { portfolioData } from "@/lib/data";

interface TickerCarouselProps {
  isDark: boolean;
  colorTheme?: string;
}

export default function TickerCarousel({ isDark, colorTheme = 'black' }: TickerCarouselProps) {
  // Filter projects that have a tokenName
  const tokens = portfolioData.projects.filter((p) => p.tokenName);

  // We duplicate the list enough times to fill the screen and allow seamless looping
  const allTokens = [...tokens, ...tokens, ...tokens, ...tokens, ...tokens, ...tokens];

  // We need hydration safe random values.
  const [mounted, setMounted] = useState(false);
  const [randomChanges, setRandomChanges] = useState<{ change: string, isPositive: boolean }[]>([]);

  useEffect(() => {
    // Generate random changes only on client
    const changes = allTokens.map(() => {
      const isPositive = Math.random() > 0.4; // 60% chance of being positive
      const change = (Math.random() * 15 + 1).toFixed(2);
      return { change, isPositive };
    });
    setRandomChanges(changes);
    setMounted(true);
  }, []); // Run once on mount

  if (!mounted) return null; // Prevent hydration mismatch

  // Check if we're in a colored mode
  const isColoredMode = ['red', 'green', 'blue', 'yellow', 'pink'].includes(colorTheme);

  return (
    <div className={`w-full overflow-x-auto no-scrollbar ${isColoredMode ? "bg-transparent" : (isDark ? "bg-black" : "bg-white")} relative`}>
      {/* Container for the sliding track */}
      <div className="flex select-none py-0.5 group/ticker cursor-pointer">
        <div
          className="flex gap-12 whitespace-nowrap animate-marquee group-hover/ticker:[animation-play-state:paused] items-center"
          style={{ willChange: 'transform' }}
        >
          {allTokens.map((project, i) => {
            const { change, isPositive } = randomChanges[i] || { change: "0.00", isPositive: true };
            return (
              <Link
                key={`${project.id}-${i}`}
                href={project.slug ? `/portfolio/${project.slug}` : "/"}
                className={`flex items-center gap-3 transition-opacity hover:opacity-100 opacity-80`}
              >
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-xs font-black tracking-wider ${
                      ['red', 'green', 'blue', 'yellow', 'pink'].includes(colorTheme)
                        ? "text-black"
                        : (isDark ? "text-white" : "text-black")
                    }`}>
                      {project.tokenName}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${isPositive
                          ? (isDark ? "text-green-400/70" : "text-green-700/70")
                          : (isDark ? "text-red-400/70" : "text-red-700/70")
                        }`}
                    >
                      {isPositive ? "▲" : "▼"} {change}%
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>



      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 1920s linear infinite;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
