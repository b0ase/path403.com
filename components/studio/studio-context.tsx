"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useColorTheme, ColorTheme } from '@/components/ThemePicker';

interface Clip {
  id: string;
  filename: string;
  url: string;
}

interface AudioTrack {
  id: string;
  filename: string;
  url: string;
  duration?: number;
}

interface EffectsState {
  // Filters
  sepia: boolean;
  vintage: boolean;
  noir: boolean;
  vibrant: boolean;
  cool: boolean;
  warm: boolean;
  // Values
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  // Glitch
  glitchEnabled: boolean;
  glitchIntensity: number;
}

interface StudioContextType {
  isPlaying: boolean;
  togglePlay: () => void;
  clips: Clip[];
  activeClipId: string | null;
  setActiveClipId: (id: string) => void;
  currentTime: number; // 0 to 1 (percentage) of ACTIVE clip
  setCurrentTime: (time: number) => void;
  duration: number;
  playNextClip: () => void;
  activeProject: string;
  setActiveProject: (slug: string) => void;
  projects: string[];
  // Audio
  audioTracks: AudioTrack[];
  activeAudioId: string | null;
  setActiveAudioId: (id: string | null) => void;
  isAudioPlaying: boolean;
  toggleAudioPlay: () => void;
  playNextAudio: () => void;
  // Effects
  effects: EffectsState;
  setEffects: React.Dispatch<React.SetStateAction<EffectsState>>;
  toggleEffect: (key: keyof EffectsState) => void;
  // Random Seek
  randomSeekEnabled: boolean;
  setRandomSeekEnabled: (enabled: boolean) => void;
  randomSeekSpeed: number;
  setRandomSeekSpeed: (speed: number) => void;
  randomSeekRange: number;
  setRandomSeekRange: (range: number) => void;
  // Theme
  colorTheme: ColorTheme;
  isDark: boolean;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colorTheme } = useColorTheme();
  const isDark = colorTheme === 'black';

  const [isPlaying, setIsPlaying] = useState(true);
  const [clips, setClips] = useState<Clip[]>([]);
  const [activeClipId, setActiveClipId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeProject, setActiveProject] = useState('cherry');

  // Audio state
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Effects state
  const [effects, setEffects] = useState<EffectsState>({
    sepia: false,
    vintage: false,
    noir: false,
    vibrant: false,
    cool: false,
    warm: false,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    glitchEnabled: false,
    glitchIntensity: 20,
  });

  const toggleEffect = (key: keyof EffectsState) => {
    setEffects(prev => ({
      ...prev,
      [key]: typeof prev[key] === 'boolean' ? !prev[key] : prev[key]
    }));
  };

  // Random Seek state
  const [randomSeekEnabled, setRandomSeekEnabled] = useState(false);
  const [randomSeekSpeed, setRandomSeekSpeed] = useState(5); // percentage 0-100
  const [randomSeekRange, setRandomSeekRange] = useState(10); // percentage 0-100

  const projects = ['cherry', 'vexvoid', 'aivj', 'npg', 'zerodice'];

  // Fallback data for when Supabase is not connected
  const fallbackClips: Record<string, Clip[]> = {
    cherry: [
      { id: 'c1', filename: 'Extended_Video.mp4', url: '/videos/Extended_Video.mp4' },
      { id: 'c2', filename: 'Professional_Mode_2.mp4', url: '/videos/Professional_Mode_Generated_Video%20(2).mp4' },
      { id: 'c3', filename: 'Standard_Mode.mp4', url: '/videos/Standard_Mode_Generated_Video.mp4' },
    ],
    npg: [
      { id: 'n1', filename: 'NPGX.mp4', url: '/videos/NPGX.mp4' },
      { id: 'n2', filename: 'npg-red-slug.mp4', url: '/videos/npg-red-slug.mp4' },
      { id: 'n3', filename: 'osinka-kalaso.mp4', url: '/videos/osinka-kalaso-video.mp4' },
    ],
    zerodice: [
      { id: 'z1', filename: 'zero-dice-02.mp4', url: '/videos/zero-dice-02.mp4' },
      { id: 'z2', filename: 'zero-dice-03.mp4', url: '/videos/zero-dice-03.mp4' },
      { id: 'z3', filename: 'zero-dice-slug.mp4', url: '/videos/zero-dice-slug-video-01.mp4' },
    ],
    vexvoid: [
      { id: 'v1', filename: 'A_train_rushes.mp4', url: '/videos/A_train_rushes_past_while_urban_.mp4' },
      { id: 'v2', filename: 'fade_letters.mp4', url: '/videos/fade_the_letters_so_see_the_sing.mp4' },
      { id: 'v3', filename: 'zoom_party.mp4', url: '/videos/zoom_around_the_party_picnic_and.mp4' },
    ],
    aivj: [
      { id: 'a1', filename: 'cashboard.mp4', url: '/videos/cashboard.mp4' },
      { id: 'a2', filename: 'NPGX.mp4', url: '/videos/NPGX.mp4' },
    ]
  };

  // Store supabase client in ref to avoid recreating
  const supabaseRef = useRef<any>(null);
  const initRef = useRef(false);

  // Fetch Clips and Audio with lazy-loaded Supabase
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.warn('Supabase env vars not configured - using fallback data');
      const fallbackData = fallbackClips[activeProject] || [];
      setClips(fallbackData);
      if (fallbackData.length > 0) setActiveClipId(fallbackData[0].id);
      return;
    }

    // Reset state when project changes
    setClips([]);
    setAudioTracks([]);
    setActiveClipId(null);
    setActiveAudioId(null);
    setIsPlaying(false);
    setIsAudioPlaying(false);
    setCurrentTime(0);

    const fetchData = async () => {
      // Always try Supabase first, fallback if needed
      // Lazy load Supabase only when needed
      if (!supabaseRef.current) {
        const { createBrowserClient } = await import('@supabase/ssr');
        supabaseRef.current = createBrowserClient(url, key);
      }

      const supabase = supabaseRef.current;

      // Fetch videos
      const { data: videoData, error: videoError } = await supabase
        .from('Video')
        .select('*')
        .eq('projectSlug', activeProject)
        .order('createdAt', { ascending: true }); // Ascending for sequential playback

      if (videoData && videoData.length > 0) {
        const processedClips = videoData.map((clip: any) => {
          let url = clip.url;

          // Handle different URL types
          if (url.startsWith('file://')) {
            // Local file path - only works in development
            if (process.env.NODE_ENV === 'development') {
              url = `/api/video/stream?path=${encodeURIComponent(url.replace('file://', ''))}`;
            } else {
              // In production, try to map to public folder
              // Extract filename and look for it in /videos/
              const filename = url.split('/').pop();
              // Encode filename to handle spaces/special chars
              url = `/videos/${encodeURIComponent(filename)}`;
              console.warn(`Mapped local file to public URL: ${url}`);
            }
          } else if (url.startsWith('http://') || url.startsWith('https://')) {
            // Already a public URL - use as is
            url = url;
          } else if (url.startsWith('/')) {
            // Relative path - assume it's in public folder
            url = url;
          } else {
            // Fallback: assume it's a filename in /videos/
            url = `/videos/${encodeURIComponent(url)}`;
          }

          return {
            ...clip,
            url
          };
        });

        console.log('📦 Loaded', processedClips.length, 'videos from Supabase for project:', activeProject);
        setClips(processedClips);
        setActiveClipId(processedClips[0].id);
        setCurrentTime(0);
        setIsPlaying(true); // Auto-play
      } else {
        // Fallback if DB returns empty
        console.warn('No videos found in DB - using fallback');
        const fallbackData = fallbackClips[activeProject] || [];
        setClips(fallbackData);
        if (fallbackData.length > 0) setActiveClipId(fallbackData[0].id);
      }
      if (videoError && videoError.message) console.warn('Videos not available:', videoError.message);

      // Fetch audio
      const { data: audioData, error: audioError } = await supabase
        .from('Audio')
        .select('*')
        .eq('projectSlug', activeProject)
        .order('createdAt', { ascending: true }); // Ascending for sequential playback

      if (audioData && audioData.length > 0) {
        const processedTracks = audioData.map((track: any) => {
          let url = track.url;

          // Handle different URL types
          if (url.startsWith('file://')) {
            // Local file path - only works in development
            if (process.env.NODE_ENV === 'development') {
              url = `/api/audio/stream?path=${encodeURIComponent(url.replace('file://', ''))}`;
            } else {
              // In production, try to map to public folder
              const filename = url.split('/').pop();
              url = `/music/${filename}`;
              console.warn(`Mapped local audio to public URL: ${url}`);
            }
          } else if (url.startsWith('http://') || url.startsWith('https://')) {
            // Already a public URL - use as is
            url = url;
          } else if (url.startsWith('/')) {
            // Relative path - assume it's in public folder
            url = url;
          } else {
            // Fallback: assume it's a filename in /music/
            url = `/music/${url}`;
          }

          return {
            ...track,
            url
          };
        });

        console.log('🎵 Loaded', processedTracks.length, 'audio tracks from Supabase for project:', activeProject);
        setAudioTracks(processedTracks);
        setActiveAudioId(processedTracks[0].id);
      }
      if (audioError && audioError.message) console.warn('Audio not available:', audioError.message);
    };

    // Defer data fetch slightly to let UI render first
    const timer = setTimeout(fetchData, 100);
    return () => clearTimeout(timer);
  }, [activeProject]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleAudioPlay = () => setIsAudioPlaying(!isAudioPlaying);

  const playNextClip = () => {
    if (!activeClipId || clips.length === 0) return;
    const currentIndex = clips.findIndex(c => c.id === activeClipId);
    if (currentIndex >= 0 && currentIndex < clips.length - 1) {
      // Move to next clip
      setActiveClipId(clips[currentIndex + 1].id);
      setCurrentTime(0);
    } else {
      // Loop back to first clip
      setActiveClipId(clips[0].id);
      setCurrentTime(0);
    }
  };

  const playNextAudio = () => {
    if (!activeAudioId || audioTracks.length === 0) return;
    const currentIndex = audioTracks.findIndex(t => t.id === activeAudioId);
    if (currentIndex >= 0 && currentIndex < audioTracks.length - 1) {
      // Move to next track
      setActiveAudioId(audioTracks[currentIndex + 1].id);
    } else {
      // Loop back to first track
      setActiveAudioId(audioTracks[0].id);
    }
  };

  return (
    <StudioContext.Provider value={{
      isPlaying,
      togglePlay,
      clips,
      activeClipId,
      setActiveClipId,
      currentTime,
      setCurrentTime,
      duration: 10,
      activeProject,
      setActiveProject,
      projects,
      playNextClip,
      // Audio
      audioTracks,
      activeAudioId,
      setActiveAudioId,
      isAudioPlaying,
      toggleAudioPlay,
      playNextAudio,
      // Effects
      effects,
      setEffects,
      toggleEffect,
      // Random Seek
      randomSeekEnabled,
      setRandomSeekEnabled,
      randomSeekSpeed,
      setRandomSeekSpeed,
      randomSeekRange,
      setRandomSeekRange,
      // Theme
      colorTheme,
      isDark
    }}>
      {children}
    </StudioContext.Provider>
  );
};

export const useStudio = () => {
  const context = useContext(StudioContext);
  if (context === undefined) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
};
