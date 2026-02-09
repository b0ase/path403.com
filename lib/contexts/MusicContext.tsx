'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface Track {
  title: string;
  artist: string;
  url: string;
}

interface MusicContextType {
  currentTrack: number;
  setCurrentTrack: (track: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentTime: number;
  duration: number;
  audioRef: React.RefObject<HTMLAudioElement>;
  musicTracks: Track[];
  volume: number;
  setVolume: (volume: number) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const musicTracks: Track[] = [
  // === b0ase ===
  { title: 'Fragmented Signals', url: 'https://cdn1.suno.ai/40669a72-62ac-48ba-aa64-611e77afc410.mp3', artist: 'b0ase' },
  { title: 'Echoes of the Hollow Bamboo', url: 'https://cdn1.suno.ai/929f9b6a-56f2-4349-8ed5-b7411d59e1df.mp3', artist: 'b0ase' },
  { title: 'Digital Reverie', url: 'https://cdn1.suno.ai/7b613644-bd1f-472d-964f-03dc2d332fbb.mp3', artist: 'b0ase' },
  { title: 'A Deeper Chaos', url: 'https://cdn1.suno.ai/b7df49bb-0ab3-4c23-9bbc-4cca5917bc7e.mp3', artist: 'b0ase' },
  { title: 'Digital Haiku', url: 'https://cdn1.suno.ai/30f8712c-585f-4438-8717-284b41cd1bc0.mp3', artist: 'b0ase' },
  { title: 'Digital Haiku (Alt)', url: 'https://cdn1.suno.ai/4d163863-9ebd-493e-bb8e-8723294a8365.mp3', artist: 'b0ase' },
  // === VEX V0ID ===
  { title: 'Echoes in the Abyss', url: '/music/ambient1.mp3', artist: 'VEX V0ID' },
  { title: 'Echoes in the Dust', url: '/music/ambient2.mp3', artist: 'VEX V0ID' },
  { title: 'Echoes in the Fog', url: '/music/ambient3.mp3', artist: 'VEX V0ID' },
  { title: 'Echoes in the Mist', url: '/music/ambient4.mp3', artist: 'VEX V0ID' },
  { title: 'Echoes in the Abyss (Alt)', url: '/music/ambient5.mp3', artist: 'VEX V0ID' },
  // === Additional VEX V0ID Tracks ===
  { title: 'Digital Phantoms', url: '/music/ambient1.mp3', artist: 'VEX V0ID' },
  { title: 'Neural Dreams', url: '/music/ambient2.mp3', artist: 'VEX V0ID' },
  { title: 'Synthetic Memories', url: '/music/ambient3.mp3', artist: 'VEX V0ID' },
  { title: 'Void Walker', url: '/music/ambient4.mp3', artist: 'VEX V0ID' },
  { title: 'Shadow Protocol', url: '/music/ambient5.mp3', artist: 'VEX V0ID' }
];

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Create audio element once on mount
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audio.preload = 'metadata';
    (audioRef as any).current = audio;

    // Handle time updates
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    // Handle metadata loaded
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    // Handle track end
    const handleEnded = () => {
      const nextIndex = (currentTrack + 1) % musicTracks.length;
      setCurrentTrack(nextIndex);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Handle track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const wasPlaying = isPlaying;
    
    // Pause and reset
    audio.pause();
    setIsPlaying(false);
    
    // Load new track
    audio.src = musicTracks[currentTrack].url;
    audio.load();

    // Resume playing if it was playing before
    if (wasPlaying) {
      audio.play().catch(err => {
        console.log('Auto-play prevented:', err);
      });
      setIsPlaying(true);
    }
  }, [currentTrack]);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(err => {
        console.log('Play prevented:', err);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Handle volume changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        setCurrentTrack,
        isPlaying,
        setIsPlaying,
        currentTime,
        duration,
        audioRef,
        musicTracks,
        volume,
        setVolume
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusicContext() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusicContext must be used within a MusicProvider');
  }
  return context;
}