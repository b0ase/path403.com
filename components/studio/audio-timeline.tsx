"use client";

import React, { useRef, useEffect } from 'react';
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

const AudioTimeline = () => {
  const {
    audioTracks,
    activeAudioId,
    setActiveAudioId,
    isAudioPlaying,
    toggleAudioPlay,
    playNextAudio,
    colorTheme,
    isDark
  } = useStudio();

  const audioRef = useRef<HTMLAudioElement>(null);
  const activeTrack = audioTracks.find(t => t.id === activeAudioId);

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    if (isAudioPlaying) {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }
  }, [isAudioPlaying, activeAudioId]);

  return (
    <div className={`mx-2 mt-2 p-2 border ${panelBackgrounds[colorTheme] || panelBackgrounds.black}`}>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <div className={`flex items-center gap-1.5 font-bold text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          🎵 Audio Timeline
        </div>

        <div className="flex gap-1.5 ml-4">
          <button
            type="button"
            onClick={toggleAudioPlay}
            disabled={!activeTrack}
            className={`px-3 py-1 text-xs transition-colors border ${
              isAudioPlaying
                ? isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
                : isDark ? 'bg-white/10 text-white border-white/20 hover:bg-white/20' : 'bg-black/10 text-black border-black/20 hover:bg-black/20'
            } ${!activeTrack ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isAudioPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
              }
            }}
            className={`px-3 py-1 text-xs transition-colors border ${isDark ? 'bg-white/10 text-white border-white/20 hover:bg-white/20' : 'bg-black/10 text-black border-black/20 hover:bg-black/20'}`}
          >
            ⏹ Stop
          </button>
          <label className={`px-3 py-1 text-xs transition-colors border flex items-center gap-2 cursor-pointer select-none ${isDark ? 'bg-white/10 text-white border-white/20 hover:bg-white/20' : 'bg-black/10 text-black border-black/20 hover:bg-black/20'}`}>
            <input type="checkbox" className="accent-pink-500 w-3 h-3" />
            <span>Loop</span>
          </label>
        </div>

        <div className="ml-auto">
          <span className={`px-3 py-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {activeTrack ? activeTrack.filename : 'No audio selected'}
          </span>
        </div>
      </div>

      {/* Audio tracks display */}
      <div className={`h-16 border relative overflow-x-auto overflow-y-hidden flex items-center ${innerBackgrounds[colorTheme] || innerBackgrounds.black}`}>
        <div className="h-full flex items-center px-2 gap-2 min-w-max">
          {audioTracks.length === 0 ? (
            <div className={`text-xs italic px-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>No audio tracks loaded</div>
          ) : (
            audioTracks.map((track) => (
              <div
                key={track.id}
                onClick={() => setActiveAudioId(track.id)}
                className={`relative flex-none h-12 px-4 border overflow-hidden group cursor-pointer transition-all flex items-center gap-2 ${
                  activeAudioId === track.id
                    ? 'border-current ring-1 ring-current'
                    : isDark ? 'border-white/20 hover:border-white/40' : 'border-black/20 hover:border-black/40'
                } ${isDark ? 'bg-black' : 'bg-white'}`}
              >
                <div className="text-lg">🎵</div>
                <div className="text-[10px] truncate max-w-[120px]">
                  {track.filename}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Playhead indicator */}
        {activeTrack && (
          <div className="absolute top-0 bottom-0 left-2 w-[3px] bg-current z-20 pointer-events-none rounded" />
        )}
      </div>

      {/* Hidden audio element */}
      {activeTrack && (
        <audio
          ref={audioRef}
          src={activeTrack.url}
          onEnded={playNextAudio}
        />
      )}
    </div>
  );
};

export default AudioTimeline;
