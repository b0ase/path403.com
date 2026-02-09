'use client';

import { useEffect, useRef } from 'react';
import { createContext, useContext, useState, ReactNode } from 'react';
import { useAudioAnalyzer, AudioData } from './useAudioAnalyzer';

// Music tracks - Local collection
export const musicTracks = [
  // === New Local Tracks ===
  { id: 1, title: 'Cherry Graffiti', url: '/music/Cherry Graffiti.mp3', artist: 'b0ase', album: 'Graffiti Series', source: 'Local' },
  { id: 2, title: 'Cherry Graffiti (Alt 1)', url: '/music/Cherry Graffiti (1).mp3', artist: 'b0ase', album: 'Graffiti Series', source: 'Local' },
  { id: 3, title: 'Cherry Graffiti (Alt 2)', url: '/music/Cherry Graffiti (2).mp3', artist: 'b0ase', album: 'Graffiti Series', source: 'Local' },
  { id: 4, title: 'Digital Ghosts', url: '/music/Digital Ghosts.mp3', artist: 'b0ase', album: 'Digital Series', source: 'Local' },
  { id: 5, title: 'Digital Ghosts (Alt 1)', url: '/music/Digital Ghosts (1).mp3', artist: 'b0ase', album: 'Digital Series', source: 'Local' },
  { id: 6, title: 'Digital Ghosts (Alt 2)', url: '/music/Digital Ghosts (2).mp3', artist: 'b0ase', album: 'Digital Series', source: 'Local' },
  { id: 7, title: 'Echo Chamber', url: '/music/Echo Chamber.mp3', artist: 'b0ase', album: 'Echo Series', source: 'Local' },
  { id: 8, title: 'Fragments of Static', url: '/music/Fragments of Static.mp3', artist: 'b0ase', album: 'Static Series', source: 'Local' },
  { id: 9, title: 'Glitch in the Fog', url: '/music/Glitch in the Fog.mp3', artist: 'b0ase', album: 'Glitch Series', source: 'Local' },
  { id: 10, title: 'Glitch in the Wind', url: '/music/Glitch in the Wind.mp3', artist: 'b0ase', album: 'Glitch Series', source: 'Local' },
  { id: 11, title: 'Glitch in the Wind (Alt)', url: '/music/Glitch in the Wind (1).mp3', artist: 'b0ase', album: 'Glitch Series', source: 'Local' },
  { id: 12, title: 'Midnight Graffiti Symphony', url: '/music/Midnight Graffiti Symphony.mp3', artist: 'b0ase', album: 'Midnight Series', source: 'Local' },
  { id: 13, title: 'Midnight Murals', url: '/music/Midnight Murals.mp3', artist: 'b0ase', album: 'Midnight Series', source: 'Local' },
  { id: 14, title: 'P_XEL _Øptik_ V.2', url: '/music/P_XEL _Øptik_ V.2.mp3', artist: 'b0ase', album: 'Experimental', source: 'Local' },
  { id: 15, title: 'Shadow Steps', url: '/music/Shadow Steps.mp3', artist: 'b0ase', album: 'Shadow Series', source: 'Local' },
  { id: 16, title: 'Shattered Frequencies', url: '/music/Shattered Frequencies.mp3', artist: 'b0ase', album: 'Shattered Series', source: 'Local' },
  { id: 17, title: 'Shattered Frequencies (Alt)', url: '/music/Shattered Frequencies (1).mp3', artist: 'b0ase', album: 'Shattered Series', source: 'Local' },
  { id: 18, title: 'Shattered Signal', url: '/music/Shattered Signal.mp3', artist: 'b0ase', album: 'Shattered Series', source: 'Local' },
  { id: 19, title: 'Shattered Signals', url: '/music/Shattered Signals.mp3', artist: 'b0ase', album: 'Shattered Series', source: 'Local' },
  { id: 20, title: 'Shattered Signals (Alt)', url: '/music/Shattered Signals (1).mp3', artist: 'b0ase', album: 'Shattered Series', source: 'Local' },
  { id: 21, title: 'Static Dreams', url: '/music/Static Dreams.mp3', artist: 'b0ase', album: 'Static Series', source: 'Local' },
  { id: 22, title: 'Static Reverie', url: '/music/Static Reverie.mp3', artist: 'b0ase', album: 'Static Series', source: 'Local' },
  { id: 23, title: 'The Hustle Never Sleeps', url: '/music/The Hustle Never Sleeps.mp4', artist: 'b0ase', album: 'Hustle Series', source: 'Local' },
  { id: 24, title: 'azote spectral', url: '/music/a z o t e $_    r$ . 2 $_.   s p e c t r a l}$.mp3', artist: 'b0ase', album: 'Experimental', source: 'Local' },
  // === VEX V0ID Ambient Tracks ===
  { id: 25, title: 'Ambient Dreams I', url: '/music/ambient1.mp3', artist: 'VEX V0ID', album: 'Ambient Collection', source: 'Local' },
  { id: 26, title: 'Ambient Dreams II', url: '/music/ambient2.mp3', artist: 'VEX V0ID', album: 'Ambient Collection', source: 'Local' },
  { id: 27, title: 'Ambient Dreams III', url: '/music/ambient3.mp3', artist: 'VEX V0ID', album: 'Ambient Collection', source: 'Local' },
  { id: 28, title: 'Ambient Dreams IV', url: '/music/ambient4.mp3', artist: 'VEX V0ID', album: 'Ambient Collection', source: 'Local' },
  { id: 29, title: 'Ambient Dreams V', url: '/music/ambient5.mp3', artist: 'VEX V0ID', album: 'Ambient Collection', source: 'Local' },
];

interface MusicContextType {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentTrack: number;
  setCurrentTrack: (track: number) => void;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  audioData: AudioData;
  isAnalyzing: boolean;
}

const MusicContext = createContext<MusicContextType | null>(null);

// Global audio element that persists
let globalAudio: HTMLAudioElement | null = null;

export function PersistentMusicProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  // Start with track 0 to avoid hydration mismatch, randomize after mount
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Add audio analysis - disabled on mobile to save memory
  const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  const { audioData, isAnalyzing } = useAudioAnalyzer(audioRef.current, isPlaying && !isMobile);

  useEffect(() => {
    // Create or reuse the global audio element
    if (!globalAudio) {
      globalAudio = new Audio();
      globalAudio.volume = 0.5;
      globalAudio.preload = 'metadata';
    }
    
    audioRef.current = globalAudio;
    
    // Check if audio is already playing
    if (globalAudio && !globalAudio.paused) {
      setIsPlaying(true);
    }
    
    // Check URL hash for specific track, otherwise randomize
    let initialTrack = Math.floor(Math.random() * musicTracks.length);
    
    if (window.location.hash) {
      const hash = window.location.hash.slice(1);
      const trackIndex = musicTracks.findIndex(track => 
        track.title.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '') === hash
      );
      if (trackIndex !== -1) {
        initialTrack = trackIndex;
      }
    }
    
    setCurrentTrack(initialTrack);

    return () => {
      // Don't destroy the audio element on unmount
    };
  }, []);

  // Handle track changes
  useEffect(() => {
    if (!audioRef.current) return;
    if (currentTrack < 0 || currentTrack >= musicTracks.length) return;
    if (!musicTracks[currentTrack]) return;
    
    const audio = audioRef.current;
    const wasPlaying = !audio.paused;
    const track = musicTracks[currentTrack];
    
    // Only change if track actually changed
    if (track && track.url && audio.src !== track.url) {
      audio.src = track.url;
      audio.load();
      
      // Update URL hash with track title
      if (track.title) {
        const trackName = track.title
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
        // Don't pollute URL with hash - use sessionStorage instead
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('currentTrack', trackName);
        }
      }
      
      if (wasPlaying || isPlaying) {
        audio.play().catch(err => {
          console.log('Playback prevented:', err);
        });
      }
    }
  }, [currentTrack]);

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
    if (isPlaying && audio.paused) {
      audio.play().catch(err => {
        console.log('Play prevented:', err);
        setIsPlaying(false);
      });
    } else if (!isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [isPlaying]);

  // Auto-advance to next track
  useEffect(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
    const handleEnded = () => {
      setCurrentTrack((prev) => (prev + 1) % musicTracks.length);
    };
    
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <MusicContext.Provider value={{ isPlaying, setIsPlaying, currentTrack, setCurrentTrack, audioRef, audioData, isAnalyzing }}>
      {children}
    </MusicContext.Provider>
  );
}

export function usePersistentMusic() {
  const context = useContext(MusicContext);
  
  // Return default values if context is not available
  if (!context) {
    return {
      isPlaying: false,
      setIsPlaying: () => {},
      currentTrack: 0,
      setCurrentTrack: () => {},
      audioRef: { current: null },
      audioData: {
        bass: 0,
        mids: 0,
        highs: 0,
        overall: 0,
        bassNorm: 0,
        midsNorm: 0,
        rightsNorm: 0,
        overallNorm: 0,
      },
      isAnalyzing: false,
      musicTracks
    };
  }
  
  return { ...context, musicTracks };
}