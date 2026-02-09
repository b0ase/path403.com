'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FiPlay, FiPause, FiSkipForward, FiSkipBack, FiShuffle, FiZap, FiDownload, FiRefreshCw, FiSliders, FiActivity, FiCpu, FiLayers, FiVolume2, FiVolumeX, FiFileText, FiFilm, FiHome, FiArrowLeft, FiFolder } from 'react-icons/fi';
import { usePersistentMusic } from '@/hooks/usePersistentMusic';
import ChaosControls from './ChaosControls';

interface VideoClip {
  id: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
}

export default function VideoEditor() {
  const [videos, setVideos] = useState<VideoClip[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedCount, setLoadedCount] = useState(0);
  const BATCH_SIZE = 10; // Load 10 videos at a time

  // Chaos controls - ALL ENABLED BY DEFAULT
  const [jumpCutMode, setJumpCutMode] = useState(true);
  const [jumpCutSpeed, setJumpCutSpeed] = useState(250); // Faster cuts - 250ms
  const [glitchMode, setGlitchMode] = useState(true);
  const [glitchIntensity, setGlitchIntensity] = useState(75);
  const [reverseMode, setReverseMode] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.5);
  const [randomSeek, setRandomSeek] = useState(true);
  const [strobeMode, setStrobeMode] = useState(true);
  const [rgbShift, setRgbShift] = useState(true);
  const [videoMuted, setVideoMuted] = useState(true);
  const [autoChaos, setAutoChaos] = useState(true); // Auto-randomize controls
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomSpeed, setZoomSpeed] = useState(0.02);
  const [randomZoom, setRandomZoom] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const jumpCutIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number>(0);
  const supabaseRef = useRef<any>(null);

  // Project tabs
  const projects = ['cherry', 'vexvoid', 'aivj', 'npg', 'zerodice'];
  const [activeProject, setActiveProject] = useState('aivj');

  // Use music system
  const {
    isPlaying: isMusicPlaying,
    setIsPlaying: setMusicPlaying,
    currentTrack,
    setCurrentTrack,
    audioRef,
    musicTracks
  } = usePersistentMusic();

  // Auto-start music if not playing
  useEffect(() => {
    setTimeout(() => {
      if (!isMusicPlaying && musicTracks.length > 0) {
        if (!currentTrack) {
          setCurrentTrack(0);
        }
        audioRef.current?.play().catch(console.error);
        setMusicPlaying(true);
      }
    }, 1000);
  }, []);

  // Video drawing logic
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawFrame = () => {
      if (video.paused || video.ended) return;

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Random Zoom Logic
      let currentZoom = zoomLevel;
      if (randomZoom) {
        currentZoom = zoomLevel + Math.sin(Date.now() * zoomSpeed) * 0.1;
      }

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(currentZoom, currentZoom);
      ctx.translate(-w / 2, -h / 2);

      // Glitch effect logic
      if (glitchMode && Math.random() > (1 - (glitchIntensity / 100))) {
        // Horizontal slices
        for (let i = 0; i < 5; i++) {
          const sliceY = Math.random() * h;
          const sliceH = Math.random() * 50;
          const offsetX = (Math.random() - 0.5) * 50;
          ctx.drawImage(video, 0, sliceY, w, sliceH, offsetX, sliceY, w, sliceH);
        }
      } else if (rgbShift && Math.random() > 0.8) {
        // RGB shift
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = 'rgba(255,0,0,0.5)';
        ctx.drawImage(video, -5, 0, w, h);
        ctx.fillStyle = 'rgba(0,255,0,0.5)';
        ctx.drawImage(video, 5, 0, w, h);
        ctx.globalCompositeOperation = 'source-over';
      } else {
        ctx.drawImage(video, 0, 0, w, h);
      }

      // Strobe effect
      if (strobeMode && Math.random() > 0.95) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, w, h);
      }

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(drawFrame);
    };

    if (isVideoPlaying) {
      drawFrame();
    } else {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [isVideoPlaying, glitchMode, glitchIntensity, strobeMode, rgbShift, zoomLevel, randomZoom, zoomSpeed]);

  // Jump cut logic
  useEffect(() => {
    if (jumpCutMode && isVideoPlaying) {
      jumpCutIntervalRef.current = setInterval(() => {
        if (videoRef.current) {
          const duration = videoRef.current.duration;
          if (duration) {
            videoRef.current.currentTime = Math.random() * duration;
          }
        }
      }, jumpCutSpeed);
    } else {
      if (jumpCutIntervalRef.current) {
        clearInterval(jumpCutIntervalRef.current);
      }
    }

    return () => {
      if (jumpCutIntervalRef.current) {
        clearInterval(jumpCutIntervalRef.current);
      }
    };
  }, [jumpCutMode, jumpCutSpeed, isVideoPlaying]);

  // Auto-chaos mode
  useEffect(() => {
    if (!autoChaos || !isVideoPlaying) return;

    const chaosInterval = setInterval(() => {
      if (Math.random() < 0.3) setJumpCutMode(prev => !prev);
      if (Math.random() < 0.2) setGlitchMode(prev => !prev);
      if (Math.random() < 0.2) setStrobeMode(prev => !prev);
      if (Math.random() < 0.2) setRgbShift(prev => !prev);
      if (Math.random() < 0.15) setReverseMode(prev => !prev);
      if (Math.random() < 0.25) setRandomSeek(prev => !prev);

      if (Math.random() < 0.3) setJumpCutSpeed(100 + Math.random() * 900);
      if (Math.random() < 0.2) setGlitchIntensity(20 + Math.random() * 80);
      if (Math.random() < 0.2) setSpeedMultiplier(0.5 + Math.random() * 3);
    }, 2000);

    return () => clearInterval(chaosInterval);
  }, [autoChaos, isVideoPlaying]);

  const loadVideos = async (project: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/video/assets?project=${project}`);
      if (!response.ok) throw new Error('Failed to fetch video assets');
      const data = await response.json();
      setVideos(data.assets || []);
      setCurrentVideoIndex(0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVideos(activeProject);
  }, [activeProject]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speedMultiplier;
    }
  }, [speedMultiplier]);

  const playPauseVideo = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(console.error);
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const nextVideo = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
  };

  const prevVideo = () => {
    setCurrentVideoIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const randomVideo = () => {
    setCurrentVideoIndex(Math.floor(Math.random() * videos.length));
  };

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
    };
  }, [currentVideoIndex]);

  useEffect(() => {
    const video = videoRef.current;
    const currentVideo = videos[currentVideoIndex];

    if (video && currentVideo) {
      // Add error handling for video loading
      video.onerror = (e) => {
        console.error(`Failed to load video: ${currentVideo.name}`, e);
        console.error('Video element error:', video.error);
        console.log('Auto-skipping to next video...');

        // Auto-skip if there's more than one video
        if (videos.length > 1) {
          nextVideo();
        }
      };

      video.src = currentVideo.url;
      if (isVideoPlaying) {
        video.play().catch(err => {
          console.warn('Auto-play blocked or failed:', err);
        });
      }
    }
  }, [currentVideoIndex, videos]);

  const handleVideoEnd = () => {
    if (randomSeek) {
      randomVideo();
    } else {
      nextVideo();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const exportFCPXML = () => {
    if (videos.length === 0) return;

    const clips = Array.from({ length: 40 }).map((_, i) => {
      const video = videos[Math.floor(Math.random() * videos.length)];
      const start = Math.random() * 2;
      return {
        id: video.id,
        name: video.name,
        start: i * 30, // 1 second intervals at 30fps
        sourceStart: start,
        end: (i + 1) * 30
      };
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.10">
  <resources>
    ${videos.map((v, i) => `<asset id="r${i + 1}" name="${v.name}" src="${v.url}" />`).join('\n    ')}
  </resources>
  <library>
    <event name="Chaos Mixer Export">
      <project name="Chaos Sequence">
        <sequence duration="${clips.length}/30s" format="r1">
          <spine>
            ${clips.map((clip, i) => {
      const assetIndex = videos.findIndex(v => v.id === clip.id);
      return `
            <asset-clip ref="r${assetIndex + 1}" offset="${clip.start}/30s" name="${clip.name}" duration="${(clip.end - clip.start)}/30s" start="${clip.sourceStart}/30s" />`;
    }).join('')}
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chaos-mix-${Date.now()}.fcpxml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('FCP XML exported! Import this into Premiere, Resolve, or FCPX to refine your edit offline.');
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black">
      {/* Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-black/90 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link
              href="/video"
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Video</span>
            </Link>

            <div className="h-4 w-px bg-zinc-800" />

            <div className="flex items-center gap-2">
              <FiZap className="w-4 h-4 text-white" />
              <span className="text-sm font-bold uppercase tracking-wider text-white">Chaos Mixer</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-1 border border-zinc-800 p-0.5">
              {projects.map((project) => (
                <button
                  key={project}
                  onClick={() => setActiveProject(project)}
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-all ${activeProject === project
                    ? 'bg-white text-black'
                    : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
                    }`}
                >
                  {project}
                </button>
              ))}
            </div>

            <Link
              href="/video/library"
              className="flex items-center gap-2 px-3 py-1.5 border border-zinc-800 hover:border-zinc-400 text-zinc-400 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all"
            >
              <FiLayers className="w-3 h-3" />
              Library
            </Link>
            <Link
              href="/video/editor/studio"
              className="flex items-center gap-2 px-3 py-1.5 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all"
            >
              <FiFilm className="w-3 h-3" />
              Studio
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-1.5 border border-zinc-800 hover:border-zinc-400 text-zinc-400 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all"
            >
              <FiHome className="w-3 h-3" />
              Home
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 pt-24 pb-8">
        <div className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-900 rounded-pillar overflow-hidden flex flex-col h-[calc(100vh-12rem)] relative">
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            {error && (
              <div className="bg-red-950 border border-red-900 text-red-400 p-6 mb-8 relative font-mono text-sm max-w-2xl mx-auto">
                <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-red-500" />
                <div className="absolute top-1 right-1">
                  <FiActivity className="animate-pulse text-red-500" />
                </div>
                <p className="uppercase font-bold mb-4 tracking-widest text-xs opacity-70">// SYSTEM_ERROR</p>
                {error}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-800 text-red-400 uppercase font-bold text-xs tracking-widest transition-all"
                  >
                    Diagnostic Restart [F5]
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
              {/* Video Player */}
              <div className="lg:col-span-2 flex justify-center">
                <div className="w-full max-w-md">
                  <div className="relative aspect-[9/16] bg-zinc-950 border border-zinc-800 overflow-hidden max-h-[70vh]">
                    <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-zinc-600 z-20 pointer-events-none" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-zinc-600 z-20 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-zinc-600 z-20 pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-zinc-600 z-20 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-20 w-full animate-scan z-10 pointer-events-none" />
                    <video
                      ref={videoRef}
                      className="absolute inset-0 w-full h-full object-contain hidden"
                      onEnded={handleVideoEnd}
                      muted={videoMuted}
                      playsInline
                      autoPlay={false}
                      preload="auto"
                      crossOrigin="anonymous"
                    />
                    <canvas
                      ref={canvasRef}
                      width={720}
                      height={1280}
                      className="w-full h-full object-contain"
                    />
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                        <div className="text-white text-xl animate-pulse">Loading videos...</div>
                      </div>
                    )}
                  </div>

                  {/* Video Controls */}
                  <div className="mt-2 space-y-2">
                    <div className="w-full mt-6">
                      <div
                        className="w-full h-4 bg-zinc-900 border border-zinc-800 cursor-crosshair relative overflow-hidden"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const percentage = Math.max(0, Math.min(1, x / rect.width));
                          const time = percentage * duration;
                          seekTo(time);
                        }}
                      >
                        <div
                          className="absolute inset-0 h-full bg-white/5 pointer-events-none transition-all duration-150"
                          style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                        />
                        <div
                          className="absolute top-0 left-0 h-full bg-white pointer-events-none transition-all duration-150"
                          style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-2 uppercase tracking-widest font-bold">
                        <span>TC: {formatTime(currentTime)}</span>
                        <span>DUR: {formatTime(duration)}</span>
                      </div>
                    </div>

                    <div className="flex gap-1 justify-center">
                      {[0.1, 0.25, 0.5, 0.75, 0.9].map((percentage) => (
                        <button
                          key={percentage}
                          onClick={() => seekTo(duration * percentage)}
                          className="px-2 py-1 bg-zinc-900 hover:bg-white hover:text-black border border-zinc-800 text-[10px] font-bold text-zinc-500 transition-all uppercase tracking-tighter"
                        >
                          {Math.floor(percentage * 100)}%
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2 justify-center">
                      <button onClick={prevVideo} className="p-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-400 text-white transition-all active:scale-95">
                        <FiSkipBack size={24} />
                      </button>
                      <button onClick={playPauseVideo} className="p-3 bg-white text-black border border-white hover:bg-zinc-200 transition-all active:scale-95">
                        {isVideoPlaying ? <FiPause size={24} /> : <FiPlay size={24} />}
                      </button>
                      <button onClick={nextVideo} className="p-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-400 text-white transition-all active:scale-95">
                        <FiSkipForward size={24} />
                      </button>
                      <button onClick={randomVideo} className="p-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-400 text-white transition-all active:scale-95">
                        <FiShuffle size={24} />
                      </button>
                      <button
                        onClick={() => setVideoMuted(!videoMuted)}
                        className={`p-3 border transition-all active:scale-95 ${videoMuted ? 'bg-red-900/20 border-red-900 text-red-500' : 'bg-zinc-950 border-zinc-800 text-white'}`}
                      >
                        {videoMuted ? <FiVolumeX size={24} /> : <FiVolume2 size={24} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Selection & Controls */}
              <div className="space-y-4 h-full overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <h3 className="text-white font-bold mb-2 text-sm">VIDEO SELECTION</h3>
                  <div className="space-y-1">
                    {videos.map((video, index) => (
                      <button
                        key={video.id}
                        onClick={() => setCurrentVideoIndex(index)}
                        className={`w-full text-left p-2 text-[10px] transition-all font-mono border-b border-zinc-900 ${currentVideoIndex === index
                          ? 'bg-zinc-100 text-black font-black'
                          : 'bg-zinc-950 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                          }`}
                      >
                        <div className="truncate flex justify-between">
                          <span>{index + 1}. {video.name}</span>
                          {currentVideoIndex === index && <FiActivity className="animate-pulse" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-900 p-4 space-y-3">
                  <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest font-mono">SUB_MANAGEMENT</h3>
                  <button
                    onClick={exportFCPXML}
                    disabled={videos.length === 0}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-black hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 transition-all group"
                  >
                    <FiDownload className="w-4 h-4 group-hover:animate-bounce" />
                    <span className="text-xs font-black uppercase tracking-widest">EXPORT_FCPXML</span>
                  </button>
                  <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase tracking-tighter">
                    <span>FORMAT: FCPXML 1.10</span>
                    <span>STATUS: READY</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 pb-12">
                  <ChaosControls
                    jumpCutMode={jumpCutMode} setJumpCutMode={setJumpCutMode}
                    jumpCutSpeed={jumpCutSpeed} setJumpCutSpeed={setJumpCutSpeed}
                    glitchMode={glitchMode} setGlitchMode={setGlitchMode}
                    glitchIntensity={glitchIntensity} setGlitchIntensity={setGlitchIntensity}
                    reverseMode={reverseMode} setReverseMode={setReverseMode}
                    speedMultiplier={speedMultiplier} setSpeedMultiplier={setSpeedMultiplier}
                    randomSeek={randomSeek} setRandomSeek={setRandomSeek}
                    strobeMode={strobeMode} setStrobeMode={setStrobeMode}
                    rgbShift={rgbShift} setRgbShift={setRgbShift}
                    autoChaos={autoChaos} setAutoChaos={setAutoChaos}
                    randomZoom={randomZoom} setRandomZoom={setRandomZoom}
                    zoomSpeed={zoomSpeed} setZoomSpeed={setZoomSpeed}
                    zoomLevel={zoomLevel} setZoomLevel={setZoomLevel}
                  />

                  <div className="text-center py-2 border-t border-white/10 mt-4">
                    <p className="text-[10px] font-mono text-white/40">{videos.length} VIDEOS LOADED</p>
                    <p className="text-[10px] font-mono text-white/30 truncate">{videos[currentVideoIndex]?.name || 'NO VIDEO'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-4 flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-zinc-600 px-2 font-mono">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              CHAOS_ENGINE_ACTIVE
            </span>
            <span>OS_VERSION: 2.1.0_STABLE</span>
          </div>
          <div className="flex items-center gap-6">
            <span>UPTIME: {Math.floor(currentTime)}S</span>
            <span>PROC: 128T/S</span>
          </div>
        </div>
      </main>
    </div>
  );
}