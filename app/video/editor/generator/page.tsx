'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiHome, FiEdit3, FiVideo, FiGrid, FiFilm, FiActivity, FiMusic, FiType, FiDownload, FiSidebar } from 'react-icons/fi';
import type {
  NanoBananaState,
  GeneratedVideo,
  TimelineClip,
  TextOverlay,
  ClipEffects
} from '@/types/nano-banana';

import GeneratorPanel from './components/GeneratorPanel';
import Library from './components/Library';
import Timeline from './components/Timeline';
import { useEffect } from 'react';

export default function NanoBananaEditor() {
  const [mounted, setMounted] = useState(false);

  // State management
  const [state, setState] = useState<NanoBananaState>({
    // Video Generation
    generatedVideos: [],
    isGenerating: false,
    generationError: null,

    // Timeline
    timeline: [],
    selectedClipId: null,

    // Effects
    globalEffects: {
      bananaFilter: true,
      glitch: false,
      glitchIntensity: 40,
      speed: 1.0,
      saturation: 1.2,
      contrast: 1.0
    },
    applyEffectsToAll: true,

    // Music
    music: {
      trackId: null,
      trackUrl: null,
      trackName: null,
      startTime: 0,
      volume: 0.8
    },

    // Text Overlays
    textOverlays: [],

    // Export
    exportSettings: {
      quality: 'standard',
      resolution: '1080p',
      format: 'mp4'
    },
    isExporting: false,
    exportProgress: 0,
    exportDownloadUrl: null,

    // UI
    activeTab: 'generate'
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper functions to update state
  const updateState = (updates: Partial<NanoBananaState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const addVideoToLibrary = (video: GeneratedVideo) => {
    setState(prev => ({
      ...prev,
      generatedVideos: [...prev.generatedVideos, video]
    }));
  };

  const deleteVideoFromLibrary = (videoId: string) => {
    setState(prev => ({
      ...prev,
      generatedVideos: prev.generatedVideos.filter(v => v.id !== videoId),
      timeline: prev.timeline.filter(clip => clip.id !== videoId)
    }));
  };

  const addClipToTimeline = (video: GeneratedVideo) => {
    const newClip: TimelineClip = {
      id: video.id,
      videoUrl: video.url,
      thumbnailUrl: video.thumbnail_url,
      prompt: video.prompt,
      duration: video.duration,
      effects: { ...state.globalEffects }
    };

    updateState({ timeline: [...state.timeline, newClip] });
  };

  const removeClipFromTimeline = (clipId: string) => {
    setState(prev => ({
      ...prev,
      timeline: prev.timeline.filter(clip => clip.id !== clipId),
      selectedClipId: prev.selectedClipId === clipId ? null : prev.selectedClipId
    }));
  };

  const moveClip = (clipId: string, direction: 'up' | 'down') => {
    setState(prev => {
      const index = prev.timeline.findIndex(clip => clip.id === clipId);
      if (index === -1) return prev;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.timeline.length) return prev;

      const newTimeline = [...prev.timeline];
      [newTimeline[index], newTimeline[newIndex]] = [newTimeline[newIndex], newTimeline[index]];

      return { ...prev, timeline: newTimeline };
    });
  };

  // Tab configuration
  const tabs = [
    { id: 'generate', label: 'Generate', icon: <FiVideo /> },
    { id: 'library', label: 'Library', icon: <FiGrid /> },
    { id: 'timeline', label: 'Timeline', icon: <FiFilm /> },
    // { id: 'effects', label: 'Effects', icon: <FiActivity /> },
    // { id: 'music', label: 'Music', icon: <FiMusic /> },
    // { id: 'text', label: 'Text', icon: <FiType /> },
    { id: 'export', label: 'Export', icon: <FiDownload /> }
  ] as const;

  const totalDuration = state.timeline.reduce((sum, clip) => sum + clip.duration, 0);

  if (!mounted) return <div className="min-h-[80vh] bg-black" />;

  return (
    <div className="flex bg-black text-white font-mono selection:bg-white selection:text-black min-h-[800px]">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-zinc-900 bg-black flex flex-col shrink-0">
        {/* Header */}
        <div className="p-6 border-b border-zinc-900 bg-zinc-950/20">
          <Link href="/video" className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-zinc-600 hover:text-white transition-colors mb-6">
            &larr; protocol_back
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-pillar bg-zinc-900 border border-zinc-800 flex items-center justify-center text-orange-500">🍌</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => updateState({ activeTab: tab.id as typeof state.activeTab })}
              className={`
                w-full flex items-center gap-3 px-3 py-3 text-[10px] font-bold uppercase tracking-widest rounded-pillar transition-all
                ${state.activeTab === tab.id
                  ? 'bg-white text-black'
                  : 'text-zinc-600 hover:text-white hover:bg-zinc-900/50'
                }
              `}
            >
              <span className={state.activeTab === tab.id ? 'text-black' : 'text-zinc-600'}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Status */}
        <div className="p-6 border-t border-zinc-900 bg-zinc-950/40">
          <div className="flex items-center justify-between text-[9px] uppercase font-bold tracking-widest text-zinc-600 mb-2">
            <span>UNIT_RECORDS</span>
            <span className="font-mono">{state.timeline.length} PKTS</span>
          </div>
          <div className="h-1 bg-zinc-900 rounded-pillar overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${Math.min(totalDuration * 2, 100)}%` }}
            />
          </div>
          <div className="mt-3 text-[9px] text-zinc-800 font-bold uppercase tracking-widest">
            ELAPSED_SEC: {totalDuration.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-black p-8 overflow-y-auto max-h-[1200px]">
        <div className="w-full">
          <header className="mb-12">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-4">
              {tabs.find(t => t.id === state.activeTab)?.label}<span className="text-zinc-800">.OPS</span>
            </h2>
            <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest">
              {state.activeTab === 'generate' && "INITIALIZE_GENERATIVE_SEQUENCE"}
              {state.activeTab === 'library' && "ASSET_REGISTRY_ACCESS_GRANTED"}
              {state.activeTab === 'timeline' && "LINEAR_EDITOR_ASSEMBLY_MODE"}
              {state.activeTab === 'export' && "COMPILATION_OUTPUT_READY"}
            </p>
          </header>

          <div className="bg-zinc-950/50 border border-zinc-900 rounded-pillar p-8 min-h-[600px] relative overflow-hidden backdrop-blur-sm">
            {/* Header decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-50">
              <div className="text-[10px] font-bold text-zinc-800 tracking-widest uppercase">TERMINAL_01</div>
            </div>

            {/* Content Area */}
            {state.activeTab === 'generate' && (
              <GeneratorPanel
                onVideoGenerated={addVideoToLibrary}
                isGenerating={state.isGenerating}
                setIsGenerating={(value) => updateState({ isGenerating: value })}
              />
            )}

            {state.activeTab === 'library' && (
              <Library
                videos={state.generatedVideos}
                onAddToTimeline={(video) => {
                  addClipToTimeline(video);
                  updateState({ activeTab: 'timeline' });
                }}
                onDeleteVideo={deleteVideoFromLibrary}
              />
            )}

            {state.activeTab === 'timeline' && (
              <Timeline
                clips={state.timeline}
                selectedClipId={state.selectedClipId}
                onSelectClip={(id) => updateState({ selectedClipId: id })}
                onRemoveClip={removeClipFromTimeline}
                onMoveClip={moveClip}
              />
            )}

            {state.activeTab === 'export' && (
              <div className="flex flex-col items-center justify-center h-[400px] text-center max-w-sm mx-auto">
                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 mb-6">
                  <FiDownload size={24} />
                </div>
                <h3 className="text-zinc-100 font-medium mb-2">Export Project</h3>
                <p className="text-zinc-500 text-sm mb-6">
                  Combine your {state.timeline.length} clips into a single video file.
                </p>
                <button className="px-8 py-4 bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-all rounded-pillar w-full">
                  START_RENDER_PROCESS
                </button>
                <p className="mt-8 text-[9px] text-zinc-800 font-bold uppercase tracking-widest">
                  OUTPUT_FORMAT: MP4_1080P
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

