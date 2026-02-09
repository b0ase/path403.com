'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FiHome, FiEdit3, FiPlay, FiPause } from 'react-icons/fi';
import { usePersistentMusic } from '@/hooks/usePersistentMusic';

interface VideoClip {
  id: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
}

export default function CherryVideoEditor() {
  const [videos, setVideos] = useState<VideoClip[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Cherry-themed chaos settings - ALL EFFECTS ENABLED
  const [jumpCutSpeed, setJumpCutSpeed] = useState(250); // Fast cuts
  const [glitchIntensity, setGlitchIntensity] = useState(60);
  const [currentEffects, setCurrentEffects] = useState({
    glitch: true,
    strobe: true,
    rgbShift: true,
    reverse: false,
    cherryFilter: true,
    speedMultiplier: 1.2
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const jumpCutIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number>(0);
  const chaosIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Music system
  const { 
    isPlaying: isMusicPlaying, 
    setIsPlaying: setMusicPlaying, 
    currentTrack, 
    setCurrentTrack,
    audioRef,
    musicTracks 
  } = usePersistentMusic();

  // Load videos on mount and auto-play + auto-start music
  useEffect(() => {
    loadCherryVideos();
    
    // Auto-start music if available
    setTimeout(() => {
      if (musicTracks.length > 0) {
        // Check URL hash for specific track
        const hash = window.location.hash.slice(1); // Remove #
        if (hash) {
          // Find track index by matching the hash with track url or title
          const matchingIndex = musicTracks.findIndex(track => {
            // Normalize track title for comparison
            const trackName = track.title?.toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[()]/g, '') // Remove parentheses
              .replace(/\s*alt\s*/gi, 'alt-') // Normalize "alt" spacing
              .replace(/--+/g, '-'); // Remove double dashes
            
            // Normalize hash for comparison
            const normalizedHash = hash.toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/--+/g, '-');
            
            // Check various matching patterns
            return trackName === normalizedHash || 
                   trackName?.includes(normalizedHash) ||
                   normalizedHash.includes(trackName || '');
          });
          
          if (matchingIndex >= 0) {
            setCurrentTrack(matchingIndex);
          } else if (currentTrack === 0) {
            // If no match found and still at default, keep first track
            setCurrentTrack(0);
          }
        } else if (currentTrack === 0) {
          setCurrentTrack(0);
        }
      }
      if (audioRef.current && !isMusicPlaying) {
        audioRef.current.play().catch(console.error);
        setMusicPlaying(true);
      }
    }, 500);
  }, [musicTracks]); // Re-run when musicTracks are loaded

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && musicTracks.length > 0) {
        const matchingIndex = musicTracks.findIndex(track => {
          // Normalize track title for comparison
          const trackName = track.title?.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[()]/g, '') // Remove parentheses
            .replace(/\s*alt\s*/gi, 'alt-') // Normalize "alt" spacing
            .replace(/--+/g, '-'); // Remove double dashes
          
          // Normalize hash for comparison
          const normalizedHash = hash.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-');
          
          // Check various matching patterns
          return trackName === normalizedHash || 
                 trackName?.includes(normalizedHash) ||
                 normalizedHash.includes(trackName || '');
        });
        
        if (matchingIndex >= 0 && matchingIndex !== currentTrack) {
          setCurrentTrack(matchingIndex);
          // Force replay with new track
          if (audioRef.current) {
            audioRef.current.pause();
            setTimeout(() => {
              audioRef.current?.play().catch(console.error);
              setMusicPlaying(true);
            }, 100);
          }
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [musicTracks, currentTrack, audioRef, setCurrentTrack, setMusicPlaying]);
  
  // Auto-chaos mode - randomly change all parameters
  useEffect(() => {
    chaosIntervalRef.current = setInterval(() => {
      // Randomly toggle effects
      setCurrentEffects(prev => ({
        glitch: Math.random() < 0.7,
        strobe: Math.random() < 0.3,
        rgbShift: Math.random() < 0.6,
        reverse: Math.random() < 0.2,
        cherryFilter: true, // Always keep cherry filter
        speedMultiplier: 0.5 + Math.random() * 2.5
      }));
      
      // Randomly adjust parameters
      setJumpCutSpeed(100 + Math.random() * 500); // 100-600ms
      setGlitchIntensity(20 + Math.random() * 80); // 20-100
      
    }, 3000); // Change every 3 seconds
    
    return () => {
      if (chaosIntervalRef.current) clearInterval(chaosIntervalRef.current);
    };
  }, []);

  const loadCherryVideos = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use public endpoint - no auth required
      const response = await fetch('/api/public/cherry-videos');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch Cherry videos');
      }

      if (!data.videos || !Array.isArray(data.videos)) {
        throw new Error('Invalid response format');
      }

      const videoList: VideoClip[] = data.videos.map((video: any) => ({
        id: video.id,
        name: video.name,
        url: video.streamUrl || video.url, // Try streamUrl first, fallback to url
        thumbnailUrl: video.thumbnailUrl
      }));

      setVideos(videoList);
      
      if (videoList.length === 0) {
        setError('No videos found');
      }
    } catch (error: any) {
      console.error('Failed to load Cherry videos:', error);
      setError(error.message || 'Failed to load videos');
    } finally {
      setIsLoading(false);
    }
  };

  // Load and auto-play videos
  useEffect(() => {
    if (videos.length > 0 && videoRef.current) {
      const video = videos[currentVideoIndex];
      videoRef.current.src = video.url;
      
      // Add error handler
      videoRef.current.onerror = (e) => {
        console.error(`Failed to load video: ${video.name}`, e);
        // Try next video if this one fails
        if (videos.length > 1) {
          const nextIndex = (currentVideoIndex + 1) % videos.length;
          setCurrentVideoIndex(nextIndex);
        }
      };
      
      videoRef.current.onloadeddata = () => {
        videoRef.current?.play().catch(err => {
          console.error('Auto-play failed:', err);
          // Mobile devices often block autoplay, this is okay
        });
      };
      
      videoRef.current.load();
    }
  }, [currentVideoIndex, videos]);

  // Dynamic jump cuts with varying speed
  useEffect(() => {
    if (videos.length > 0) {
      if (jumpCutIntervalRef.current) {
        clearInterval(jumpCutIntervalRef.current);
      }
      
      jumpCutIntervalRef.current = setInterval(() => {
        // 70% chance to switch videos (more aggressive)
        if (Math.random() < 0.7) {
          const newIndex = Math.floor(Math.random() * videos.length);
          setCurrentVideoIndex(newIndex);
          
          if (videoRef.current && videoRef.current.duration) {
            videoRef.current.currentTime = Math.random() * videoRef.current.duration;
          }
        } else if (videoRef.current && videoRef.current.duration) {
          // Jump within current video
          videoRef.current.currentTime = Math.random() * videoRef.current.duration;
        }
      }, jumpCutSpeed);
      
      return () => {
        if (jumpCutIntervalRef.current) {
          clearInterval(jumpCutIntervalRef.current);
        }
      };
    }
  }, [videos, jumpCutSpeed]);
  
  // Update playback speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = currentEffects.speedMultiplier;
    }
  }, [currentEffects.speedMultiplier]);

  // Full effects rendering with all chaos
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;
    
    if (!ctx) return;
    
    const render = () => {
      if (video.readyState >= 2) {
        // Apply reverse if enabled
        if (currentEffects.reverse) {
          ctx.save();
          ctx.scale(-1, 1);
          ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
          ctx.restore();
        } else {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Cherry filter (always on)
        if (currentEffects.cherryFilter) {
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * 1.4);         // R - boost red
            data[i + 1] = Math.max(0, data[i + 1] * 0.7);   // G - reduce green
            data[i + 2] = Math.max(0, data[i + 2] * 0.5);   // B - reduce blue
            
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = Math.min(255, data[i] + avg * 0.15);
            data[i + 1] = Math.max(0, data[i + 1] + avg * 0.05);
          }
        }
        
        // Glitch effect
        if (currentEffects.glitch) {
          for (let i = 0; i < data.length; i += 4) {
            if (Math.random() < glitchIntensity / 10000) {
              data[i] = 255; // Pink/red glitch
              data[i + 1] = Math.random() * 100;
              data[i + 2] = Math.random() * 150;
            }
          }
        }
        
        // RGB Shift effect
        if (currentEffects.rgbShift) {
          const shift = Math.sin(Date.now() / 100) * 10;
          for (let i = 0; i < data.length; i += 4) {
            const shiftIndex = i + Math.floor(shift) * 4;
            if (shiftIndex < data.length && shiftIndex >= 0) {
              data[i] = data[shiftIndex + 1]; // R gets G
            }
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Glitch blocks
        if (currentEffects.glitch && Math.random() < glitchIntensity / 100) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const w = Math.random() * 100;
          const h = Math.random() * 100;
          ctx.fillStyle = `rgba(255,${Math.random()*100},${Math.random()*150},0.4)`;
          ctx.fillRect(x, y, w, h);
        }
        
        // Strobe effect
        if (currentEffects.strobe && Math.random() < 0.1) {
          ctx.fillStyle = 'rgba(255, 182, 193, 0.6)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentEffects, glitchIntensity]);

  const handleVideoEnd = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-950 via-black to-red-950 flex flex-col">
      {/* Minimal header */}
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-2 text-pink-400/50 text-xs">
          <Link href="/video" className="hover:text-pink-400 transition-colors">
            <FiHome size={12} />
          </Link>
          <span>/</span>
          <Link href="/video/editor" className="hover:text-pink-400 transition-colors">
            <FiEdit3 size={12} />
          </Link>
          <span>/</span>
          <span>cherry</span>
        </div>
        <div className="text-2xl">🍒</div>
      </div>

      {/* Main video display - fills remaining space on mobile */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full max-w-xs md:max-w-sm lg:max-w-md h-full max-h-[80vh]">
          <div className="relative w-full h-full bg-black rounded-lg overflow-hidden shadow-2xl border border-pink-500/20">
            <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-contain hidden"
            onEnded={handleVideoEnd}
            muted
            playsInline
            autoPlay
          />
          <canvas
            ref={canvasRef}
            width={720}
            height={1280}
            className="w-full h-full object-cover md:object-contain"
          />
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-pink-300 text-xl animate-pulse">🍒</div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-pink-300 text-sm">{error}</div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}