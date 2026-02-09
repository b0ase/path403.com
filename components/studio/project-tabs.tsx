"use client";

import React, { useState } from "react";
import { ColorTheme } from '@/components/ThemePicker';

// Project display names
const projects = [
  { slug: 'cherry', name: 'Cherry' },
  { slug: 'aivj', name: 'AIVJ' },
  { slug: 'npg', name: 'NPG' },
  { slug: 'zerodice', name: 'ZeroDice' },
];

// Theme background classes for project tabs
const tabBackgrounds: Record<string, string> = {
  black: 'bg-black',
  white: 'bg-white',
  yellow: 'bg-amber-400',
  red: 'bg-red-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
};

interface ProjectTabsProps {
  activeProject?: string;
  onProjectChange?: (slug: string) => void;
  videoCount?: number;
  audioCount?: number;
  colorTheme?: ColorTheme;
  isDark?: boolean;
}

export default function ProjectTabs({
  activeProject: externalActive,
  onProjectChange,
  videoCount = 0,
  audioCount = 0,
  colorTheme = 'black',
  isDark = true
}: ProjectTabsProps) {
  const [internalActive, setInternalActive] = useState('cherry');

  const activeProject = externalActive ?? internalActive;
  const handleClick = (slug: string) => {
    if (onProjectChange) {
      onProjectChange(slug);
    } else {
      setInternalActive(slug);
    }
  };

  return (
    <div className={`w-full border-b-2 border-current px-6 py-3 flex items-center gap-4 ${tabBackgrounds[colorTheme] || tabBackgrounds.black}`}>
      {/* Studio Label */}
      <div className={`font-bold text-sm mr-6 pr-6 border-r ${isDark ? 'border-white/20' : 'border-black/20'}`}>
        STUDIO
      </div>

      {/* Project Tabs */}
      {projects.map((project) => {
        const isActive = activeProject === project.slug;

        return (
          <button
            key={project.slug}
            onClick={() => handleClick(project.slug)}
            className={`px-3 py-1 text-xs font-medium uppercase tracking-wide transition-all ${isActive
                ? isDark ? 'bg-white text-black' : 'bg-black text-white'
                : isDark ? 'bg-white/10 text-gray-400 hover:text-white' : 'bg-black/10 text-gray-600 hover:text-black'
              }`}
          >
            {project.name}
          </button>
        );
      })}

      {/* Media counts */}
      <div className={`ml-auto flex gap-6 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
        <span>{videoCount} videos</span>
        <span>{audioCount} tracks</span>
      </div>
    </div>
  );
}
