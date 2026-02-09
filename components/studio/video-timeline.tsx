"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useStudio } from '@/components/studio/studio-context';

// Panel backgrounds for each color theme
const panelBackgrounds: Record<string, string> = {
  black: 'bg-black border-white/10',
  white: 'bg-white border-black/10',
  yellow: 'bg-amber-300 border-amber-600/30',
  red: 'bg-red-400 border-red-700/30',
  green: 'bg-green-400 border-green-700/30',
  blue: 'bg-blue-400 border-blue-700/30',
};

// Inner container backgrounds
const innerBackgrounds: Record<string, string> = {
  black: 'bg-black/50 border-white/10',
  white: 'bg-gray-100 border-black/10',
  yellow: 'bg-amber-200/50 border-amber-600/20',
  red: 'bg-red-300/50 border-red-700/20',
  green: 'bg-green-300/50 border-green-700/20',
  blue: 'bg-blue-300/50 border-blue-700/20',
};

const VideoThumbnail = ({ url, index }: { url: string; index: number }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoaded = () => {
      // Seek to 0.5 seconds to get a good thumbnail frame
      video.currentTime = 0.5;
    };

    const handleSeeked = () => {
      setLoaded(true);
    };

    video.addEventListener('loadedmetadata', handleLoaded);
    video.addEventListener('seeked', handleSeeked);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoaded);
      video.removeEventListener('seeked', handleSeeked);
    };
  }, [url]);

  return (
    <>
      <video
        ref={videoRef}
        src={url}
        className={`w-full h-full object-cover ${loaded ? 'opacity-100' : 'opacity-0'}`}
        muted
        playsInline
        preload="metadata"
      />
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center">
          <span className="text-gray-400 dark:text-zinc-600 text-lg font-bold">{index + 1}</span>
        </div>
      )}
    </>
  );
};

const VideoTimeline = () => {
  const { clips, isPlaying, togglePlay, currentTime, activeClipId, setActiveClipId, colorTheme, isDark } = useStudio();

  // Calculate Playhead Position
  const CLIP_WIDTH = 96; // w-24 = 6rem = 96px
  const CLIP_GAP = 8;    // gap-2 = 0.5rem = 8px
  const CONTAINER_PADDING = 8; // px-2 = 8px

  const activeIndex = clips.findIndex(c => c.id === activeClipId);
  // Default to 0 if not found
  const validIndex = activeIndex === -1 ? 0 : activeIndex;

  // Position = Start Padding + (Full Clips * Pitch) + (Current Progress * Clip Width)
  const playheadLeft = CONTAINER_PADDING + (validIndex * (CLIP_WIDTH + CLIP_GAP)) + (currentTime * CLIP_WIDTH);

  return (
    <div className={`mx-2 mt-2 p-2 border ${panelBackgrounds[colorTheme] || panelBackgrounds.black}`}>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <div className={`flex items-center gap-1.5 font-bold text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          📽️ Video Timeline
        </div>

        <div className="flex gap-1.5 ml-4">
          <button
            type="button"
            onClick={togglePlay}
            className={`px-3 py-1 text-xs transition-colors border ${isPlaying
                ? isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
                : isDark ? 'bg-white/10 text-white border-white/20 hover:bg-white/20' : 'bg-black/10 text-black border-black/20 hover:bg-black/20'
              }`}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          <button type="button" className={`px-3 py-1 text-xs transition-colors border ${isDark ? 'bg-white/10 text-white border-white/20 hover:bg-white/20' : 'bg-black/10 text-black border-black/20 hover:bg-black/20'}`}>⏭ Next</button>
          <button type="button" className={`px-3 py-1 text-xs transition-colors border ${isDark ? 'bg-white/10 text-white border-white/20 hover:bg-white/20' : 'bg-black/10 text-black border-black/20 hover:bg-black/20'}`}>🔄 Reset</button>

          <div className="flex items-center gap-1.5 ml-auto">
            <label htmlFor="speed-control" className={`text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Speed:</label>
            <input id="speed-control" type="range" min="0.25" max="3" defaultValue="1" step="0.25" className="w-20 h-1 rounded-lg appearance-none cursor-pointer" aria-label="Playback speed" />
            <span className={`text-[10px] font-bold w-[30px] ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>1x</span>
          </div>
        </div>
      </div>

      <div className={`h-16 border relative overflow-x-auto overflow-y-hidden flex items-center ${innerBackgrounds[colorTheme] || innerBackgrounds.black}`}>
        <div className="h-full flex items-center px-2 gap-2 min-w-max">
          {clips.length === 0 ? (
            <div className={`text-xs italic px-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>No clips loaded</div>
          ) : (
            clips.map((clip, index) => (
              <div
                key={clip.id}
                onClick={() => setActiveClipId(clip.id)}
                className={`relative flex-none w-24 h-12 rounded border overflow-hidden group cursor-pointer transition-colors ${activeClipId === clip.id
                    ? 'border-current ring-1 ring-current'
                    : isDark ? 'border-white/20 hover:border-white/40' : 'border-black/20 hover:border-black/40'
                  } ${isDark ? 'bg-black' : 'bg-white'}`}
              >
                <VideoThumbnail url={clip.url} index={index} />
                <div className={`absolute bottom-0 left-0 right-0 text-[8px] px-1 truncate ${isDark ? 'bg-black/60 text-white' : 'bg-white/80 text-black'}`}>
                  {clip.filename}
                </div>
              </div>
            ))
          )}
        </div>
        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-[3px] bg-current z-20 pointer-events-none rounded transition-all duration-75 ease-linear"
          style={{ left: `${playheadLeft}px` }}
        ></div>
      </div>
    </div>
  );
};

export default VideoTimeline;
