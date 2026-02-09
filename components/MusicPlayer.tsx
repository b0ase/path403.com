'use client'

import { useState, useRef, useEffect } from 'react'
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiMusic, FiX, FiVolume2 } from 'react-icons/fi'

// b0ase Label - Full Discography
const musicTracks = [
  // === b0ase ===
  { id: 1, title: 'Fragmented Signals', url: 'https://cdn1.suno.ai/40669a72-62ac-48ba-aa64-611e77afc410.mp3', artist: 'b0ase', album: 'Singles', source: 'Suno' },

  // === VEX V0ID ===
  { id: 2, title: 'Echoes in the Abyss', url: '/music/ambient1.mp3', artist: 'VEX V0ID', album: 'Echoes Series', source: 'Local' },
  { id: 3, title: 'Echoes in the Dust', url: '/music/ambient2.mp3', artist: 'VEX V0ID', album: 'Echoes Series', source: 'Local' },
  { id: 4, title: 'Echoes in the Fog', url: '/music/ambient3.mp3', artist: 'VEX V0ID', album: 'Echoes Series', source: 'Local' },
  { id: 5, title: 'Echoes in the Mist', url: '/music/ambient4.mp3', artist: 'VEX V0ID', album: 'Echoes Series', source: 'Local' },
  { id: 6, title: 'Echoes in the Abyss (Alt)', url: '/music/ambient5.mp3', artist: 'VEX V0ID', album: 'Echoes Series', source: 'Local' },

  // === Additional VEX V0ID Tracks ===
  { id: 7, title: 'Digital Phantoms', url: '/music/ambient1.mp3', artist: 'VEX V0ID', album: 'Digital Dreams', source: 'Local' },
  { id: 8, title: 'Neural Dreams', url: '/music/ambient2.mp3', artist: 'VEX V0ID', album: 'Digital Dreams', source: 'Local' },
  { id: 9, title: 'Synthetic Memories', url: '/music/ambient3.mp3', artist: 'VEX V0ID', album: 'Digital Dreams', source: 'Local' },
  { id: 10, title: 'Void Walker', url: '/music/ambient4.mp3', artist: 'VEX V0ID', album: 'Dark Ambient', source: 'Local' },
  { id: 11, title: 'Shadow Protocol', url: '/music/ambient5.mp3', artist: 'VEX V0ID', album: 'Dark Ambient', source: 'Local' },

  // === CherryX ===
  { id: 12, title: 'Cherry Graffiti', url: '/music/Cherry Graffiti.mp3', artist: 'CherryX', album: 'Graffiti Series', source: 'Local' },
  { id: 13, title: 'Digital Ghosts', url: '/music/Digital Ghosts.mp3', artist: 'CherryX', album: 'Urban Dreams', source: 'Local' },
  { id: 14, title: 'Echo Chamber', url: '/music/Echo Chamber.mp3', artist: 'CherryX', album: 'Urban Dreams', source: 'Local' },
  { id: 15, title: 'Glitch in the Fog', url: '/music/Glitch in the Fog.mp3', artist: 'CherryX', album: 'Static Series', source: 'Local' },
  { id: 16, title: 'Midnight Murals', url: '/music/Midnight Murals.mp3', artist: 'CherryX', album: 'Graffiti Series', source: 'Local' },
  { id: 17, title: 'Shadow Steps', url: '/music/Shadow Steps.mp3', artist: 'CherryX', album: 'Urban Dreams', source: 'Local' },
  { id: 18, title: 'Static Dreams', url: '/music/Static Dreams.mp3', artist: 'CherryX', album: 'Static Series', source: 'Local' },
  { id: 19, title: 'Static Reverie', url: '/music/Static Reverie.mp3', artist: 'CherryX', album: 'Static Series', source: 'Local' },
]

interface MusicPlayerProps {
  isDark?: boolean
  isOpen?: boolean
  onToggle?: () => void
  position?: 'bottom-left' | 'top-right'
  autoplay?: boolean
}

export default function MusicPlayer({ isDark = true, isOpen: controlledIsOpen, onToggle, position = 'bottom-left', autoplay = false }: MusicPlayerProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Initialize with a random track and attempt autoplay
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * musicTracks.length)
    setCurrentTrack(musicTracks[randomIndex])
    
    // Attempt autoplay if enabled
    if (autoplay && !hasInteracted) {
      const attemptAutoplay = async () => {
        if (!audioRef.current) return
        
        try {
          // Try immediate autoplay
          await audioRef.current.play()
          setIsPlaying(true)
          setHasInteracted(true)
          console.log('Autoplay successful')
        } catch (error) {
          console.log('Autoplay blocked, waiting for user interaction')
          
          // Fallback: Play on first user interaction
          const handleFirstInteraction = async () => {
            if (audioRef.current && !isPlaying && !hasInteracted) {
              try {
                await audioRef.current.play()
                setIsPlaying(true)
                setHasInteracted(true)
                console.log('Autoplay started after interaction')
                
                // Remove all listeners after successful play
                document.removeEventListener('click', handleFirstInteraction)
                document.removeEventListener('scroll', handleFirstInteraction)
                document.removeEventListener('keydown', handleFirstInteraction)
                document.removeEventListener('touchstart', handleFirstInteraction)
              } catch (err) {
                console.log('Failed to autoplay after interaction')
              }
            }
          }
          
          // Add interaction listeners
          document.addEventListener('click', handleFirstInteraction, { once: false })
          document.addEventListener('scroll', handleFirstInteraction, { once: false })
          document.addEventListener('keydown', handleFirstInteraction, { once: false })
          document.addEventListener('touchstart', handleFirstInteraction, { once: false })
          
          // Cleanup listeners after 30 seconds
          setTimeout(() => {
            document.removeEventListener('click', handleFirstInteraction)
            document.removeEventListener('scroll', handleFirstInteraction)
            document.removeEventListener('keydown', handleFirstInteraction)
            document.removeEventListener('touchstart', handleFirstInteraction)
          }, 30000)
        }
      }
      
      // Try autoplay after a short delay
      setTimeout(attemptAutoplay, 500)
    }
  }, [autoplay])

  const togglePlay = async () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      try {
        await audioRef.current.play()
        setIsPlaying(true)
      } catch (error) {
        console.log('Playback failed:', error)
      }
    }
  }

  const nextTrack = () => {
    const currentIndex = musicTracks.findIndex(t => t === currentTrack)
    const nextIndex = (currentIndex + 1) % musicTracks.length
    setCurrentTrack(musicTracks[nextIndex])
    if (isPlaying && audioRef.current) {
      setTimeout(() => {
        audioRef.current?.play().catch(console.error)
      }, 100)
    }
  }

  const prevTrack = () => {
    const currentIndex = musicTracks.findIndex(t => t === currentTrack)
    const prevIndex = currentIndex === 0 ? musicTracks.length - 1 : currentIndex - 1
    setCurrentTrack(musicTracks[prevIndex])
    if (isPlaying && audioRef.current) {
      setTimeout(() => {
        audioRef.current?.play().catch(console.error)
      }, 100)
    }
  }

  const selectTrack = (index: number) => {
    setCurrentTrack(index)
    setShowPlaylist(false)
    if (isPlaying && audioRef.current) {
      setTimeout(() => {
        audioRef.current?.play().catch(console.error)
      }, 100)
    }
  }

  const handleTrackEnd = () => {
    nextTrack()
  }

  // Update audio source when track changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = musicTracks[currentTrack].url
      audioRef.current.load()
    }
  }, [currentTrack])

  const handleToggle = () => {
    if (onToggle) {
      onToggle()
    } else {
      setInternalIsOpen(!internalIsOpen)
    }
  }

  if (!isOpen) {
    // If controlled from parent and position is top-right, don't render the button
    // The parent will handle the button in the nav
    if (controlledIsOpen !== undefined && position === 'top-right') {
      return null
    }
    
    return (
      <button
        onClick={handleToggle}
        className={`fixed bottom-4 left-4 p-3 rounded-full transition-all z-50 ${
          isDark 
            ? 'bg-black border border-white/20 hover:border-white/40 text-white' 
            : 'bg-white border border-black/20 hover:border-black/40 text-black'
        }`}
        title="Open music player"
      >
        <FiMusic size={20} />
      </button>
    )
  }

  const positionClasses = position === 'top-right' 
    ? 'fixed top-20 right-4 z-50' 
    : 'fixed bottom-4 left-4 z-50'

  return (
    <div className={`${positionClasses} ${
      isDark ? 'text-white' : 'text-black'
    }`}>
      {/* Player Box */}
      <div className={`border p-4 w-72 ${
        isDark 
          ? 'bg-black/95 border-white/20' 
          : 'bg-white/95 border-black/20'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FiVolume2 size={14} className="opacity-60" />
            <span className="text-xs font-mono uppercase tracking-wider opacity-60">
              Music Player
            </span>
          </div>
          <button
            onClick={handleToggle}
            className="opacity-60 hover:opacity-100 transition-opacity"
            title="Close player"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Now Playing */}
        <div className="mb-4">
          <div className="text-xs opacity-50 mb-1 font-mono">
            {isPlaying ? 'NOW PLAYING' : 'PAUSED'}
          </div>
          <div className="text-sm font-medium truncate">
            {currentTrack?.title || 'No track'}
          </div>
          <div className="text-xs opacity-60 mt-0.5">
            {currentTrack?.artist || ''} • {currentTrack?.album || ''}
          </div>
          <div className="text-xs opacity-40 mt-1 font-mono">
            Track {musicTracks.findIndex(t => t === currentTrack) + 1} of {musicTracks.length}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={prevTrack}
              className="opacity-60 hover:opacity-100 transition-opacity"
              title="Previous track"
            >
              <FiSkipBack size={18} />
            </button>
            
            <button
              onClick={togglePlay}
              className={`p-2 rounded-full border transition-all ${
                isDark 
                  ? 'border-white/20 hover:border-white/40' 
                  : 'border-black/20 hover:border-black/40'
              }`}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
            </button>
            
            <button
              onClick={nextTrack}
              className="opacity-60 hover:opacity-100 transition-opacity"
              title="Next track"
            >
              <FiSkipForward size={18} />
            </button>
          </div>

          <button
            onClick={() => setShowPlaylist(!showPlaylist)}
            className={`text-xs font-mono px-2 py-1 border transition-all ${
              showPlaylist
                ? isDark 
                  ? 'border-white/40 bg-white/10' 
                  : 'border-black/40 bg-black/10'
                : isDark
                  ? 'border-white/20 hover:border-white/40'
                  : 'border-black/20 hover:border-black/40'
            }`}
          >
            LIST
          </button>
        </div>

        {/* Playlist */}
        {showPlaylist && (
          <div className={`border-t pt-3 ${
            isDark ? 'border-white/10' : 'border-black/10'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs opacity-50 font-mono">PLAYLIST</div>
              <div className="text-xs opacity-40">{musicTracks.length} tracks</div>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {musicTracks.map((track, index) => (
                <button
                  key={track.id}
                  onClick={() => selectTrack(index)}
                  className={`w-full text-left text-xs py-1.5 px-2 transition-all ${
                    index === currentTrack
                      ? isDark
                        ? 'bg-white/10 text-white'
                        : 'bg-black/10 text-black'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <span className="font-mono mr-2">{index + 1}.</span>
                      <span className="truncate">{track.title}</span>
                      {track.source === 'Suno' && (
                        <span className="ml-1 text-[10px] opacity-60">[Suno]</span>
                      )}
                    </div>
                    {index === currentTrack && isPlaying && (
                      <span className="ml-2 flex-shrink-0">♪</span>
                    )}
                  </div>
                  <div className="text-[10px] opacity-50 pl-5 truncate">
                    {track.artist} • {track.album}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onEnded={handleTrackEnd}
        crossOrigin="anonymous"
        style={{ display: 'none' }}
      />
    </div>
  )
}