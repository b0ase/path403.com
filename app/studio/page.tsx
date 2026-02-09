"use client";

import React, { Component, ErrorInfo, ReactNode, Suspense, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiArrowRight, FiVideo, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { StudioProvider, useStudio } from '@/components/studio/studio-context';
import ProjectTabs from "@/components/studio/project-tabs";

// Color theme background classes mapping
const themeBackgrounds: Record<string, string> = {
  black: 'bg-black text-white',
  white: 'bg-white text-black',
  yellow: 'bg-amber-400 text-black',
  red: 'bg-red-500 text-black',
  green: 'bg-green-500 text-black',
  blue: 'bg-blue-500 text-black',
};

// Lazy load heavy components
const VideoTimeline = dynamic(() => import("@/components/studio/video-timeline"), {
  ssr: false,
  loading: () => <div className="p-2 bg-[#050505] rounded-lg border border-white/5 h-[88px] animate-pulse" />
});

const AudioTimeline = dynamic(() => import("@/components/studio/audio-timeline"), {
  ssr: false,
  loading: () => <div className="mt-2 p-2 bg-[#050505] rounded-lg border border-white/5 h-[88px] animate-pulse" />
});

const SuperEffects = dynamic(() => import("@/components/studio/super-effects"), {
  ssr: false,
  loading: () => <div className="bg-[#050505] rounded-lg border border-white/5 h-64 animate-pulse" />
});

const Effects = dynamic(() => import("@/components/studio/effects"), {
  ssr: false,
  loading: () => <div className="bg-[#050505] rounded-lg border border-white/5 h-64 animate-pulse" />
});

const Preview = dynamic(() => import("@/components/studio/preview"), {
  ssr: false,
  loading: () => <div className="bg-[#050505] rounded-lg border border-white/5 h-full animate-pulse" />
});

const Settings = dynamic(() => import("@/components/studio/settings"), {
  ssr: false,
  loading: () => <div className="bg-[#050505] rounded-lg border border-white/5 h-64 animate-pulse" />
});

// Error boundary to catch any crashes
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Studio Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-900/20 border border-red-500 rounded m-4">
          <h2 className="text-red-400 font-bold">Something went wrong</h2>
          <p className="text-red-300 text-sm mt-2">{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Inner component that uses the context
function StudioContent() {
  const { activeProject, setActiveProject, clips, audioTracks, colorTheme, isDark } = useStudio();

  return (
    <div className={`flex-1 flex flex-col font-sans overflow-hidden relative ${themeBackgrounds[colorTheme] || themeBackgrounds.black}`}>
      {/* Project Tabs */}
      <ProjectTabs
        activeProject={activeProject}
        onProjectChange={setActiveProject}
        videoCount={clips.length}
        audioCount={audioTracks.length}
        colorTheme={colorTheme}
        isDark={isDark}
      />

      {/* Main Layout: Left (Timelines + Controls) | Right (Preview) */}
      <div className="flex-1 flex gap-3 overflow-hidden">
        {/* Left Column: Timelines + Control Panels */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Timelines */}
          <div className="flex-none">
            <ErrorBoundary>
              <VideoTimeline />
            </ErrorBoundary>
            <ErrorBoundary>
              <AudioTimeline />
            </ErrorBoundary>
          </div>

          {/* Control Panels Row: SuperEffects | Effects | Settings - fill available space */}
          <div className="flex-1 flex gap-2 mt-2 min-h-0">
            {/* 1. Super Effects */}
            <div className="flex-1 min-w-[200px] overflow-y-auto no-scrollbar scroll-smooth">
              <ErrorBoundary><SuperEffects /></ErrorBoundary>
            </div>

            {/* 2. Effects (includes Filters + Text) */}
            <div className="flex-1 min-w-[200px] overflow-y-auto no-scrollbar scroll-smooth">
              <ErrorBoundary><Effects /></ErrorBoundary>
            </div>

            {/* 3. Settings */}
            <div className="flex-1 min-w-[200px] overflow-y-auto no-scrollbar scroll-smooth">
              <ErrorBoundary><Settings /></ErrorBoundary>
            </div>
          </div>
        </div>

        {/* Right Column: Preview (full height) */}
        <div className="flex-none w-[300px] flex flex-col overflow-hidden">
          <ErrorBoundary><Preview /></ErrorBoundary>
        </div>
      </div>

      {/* Global Scrollbar Styles for this page */}
      <style jsx global>{`
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

export default function StudioPage() {
  const [headerExpanded, setHeaderExpanded] = useState(false);

  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 min-h-screen bg-black">
          <div className="bg-red-900/20 border border-red-500 rounded p-4 mb-4">
            <h2 className="text-red-400 font-bold">Context Error</h2>
            <p className="text-red-300 text-sm mt-2">Failed to load studio context. Check console for details.</p>
          </div>
          <ProjectTabs />
        </div>
      }
    >
      <motion.div
        className="min-h-screen bg-black text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="px-4 md:px-12 pt-40 pb-8">
          {/* Main Content Card - contains header and studio app */}
          <motion.div
            className="bg-black/90 border border-white/10 backdrop-blur-md rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Page Header inside content card */}
            <div className="px-4 md:px-8 py-6 border-b border-white/10">
              <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
                <div className="bg-white/5 p-4 md:p-6 border border-white/10 self-start">
                  <FiVideo className="text-4xl md:text-6xl text-white" />
                </div>
                <div className="flex items-end gap-4">
                  <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                    STUDIO
                  </h1>
                  <div className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-widest">
                    Video Editor
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <p className="text-gray-400 max-w-2xl">
                  Professional video editing suite with timeline, effects, filters, and real-time preview.
                  Drag clips, apply effects, and export your creations.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setHeaderExpanded(!headerExpanded)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold border border-zinc-700 text-zinc-300 hover:text-white hover:border-white transition-colors rounded-lg"
                  >
                    {headerExpanded ? 'Hide Info' : 'Show Info'}
                    {headerExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                  </button>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold bg-white text-black hover:bg-zinc-200 transition-colors rounded-lg"
                  >
                    Get Custom Edit <FiArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Expandable Info Section */}
              {headerExpanded && (
                <motion.div
                  className="mt-6 grid md:grid-cols-3 gap-6 p-6 border border-white/10 bg-white/5 rounded-xl"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <div>
                    <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Features</h3>
                    <ul className="text-sm text-gray-400 space-y-2">
                      <li>• Video timeline with clips</li>
                      <li>• Audio track management</li>
                      <li>• Super effects & filters</li>
                      <li>• Real-time preview</li>
                      <li>• Multi-project support</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Usage</h3>
                    <ul className="text-sm text-gray-400 space-y-2">
                      <li>• Drag clips to timeline</li>
                      <li>• Apply effects from panel</li>
                      <li>• Adjust settings per clip</li>
                      <li>• Preview in real-time</li>
                      <li>• Export when ready</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Token</h3>
                    <p className="text-sm text-gray-400 mb-3">
                      $STUDIO tokens give you access to premium features and export credits.
                    </p>
                    <Link
                      href="/exchange"
                      className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                    >
                      Get $STUDIO tokens <FiArrowRight size={12} />
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Studio App Content */}
            <div
              className="p-4 md:p-6"
              style={{ height: 'calc(100vh - 320px)', minHeight: '500px' }}
            >
              <StudioProvider>
                <StudioContent />
              </StudioProvider>
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            className="mt-6 bg-black/90 border border-white/10 backdrop-blur-md rounded-xl p-6 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">
                  Need professional video editing?
                </h3>
                <p className="text-gray-400">
                  Let us handle your video projects. Professional editing, effects, and delivery.
                </p>
              </div>
              <div className="flex gap-4">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 text-gray-400 text-sm hover:border-white/30 hover:text-white transition-colors whitespace-nowrap"
                >
                  View Services
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold hover:bg-gray-200 transition-colors whitespace-nowrap"
                >
                  Get a Quote <FiArrowRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </ErrorBoundary>
  );
}
