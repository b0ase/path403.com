'use client'
import { useState, useRef, useEffect, useContext } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import TickerCarousel from './Navbar/TickerCarousel'
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiVolume2, FiType, FiDroplet, FiGrid, FiLayers, FiMaximize2, FiMinimize2, FiCode, FiRefreshCw, FiGithub, FiLinkedin, FiMail, FiUser, FiPlus, FiChrome, FiDownload, FiMove, FiBox, FiEye, FiHome, FiActivity, FiSquare, FiLogOut, FiLayout, FiLock, FiChevronLeft, FiChevronRight, FiSearch, FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi'
import { FaWallet, FaWhatsapp, FaTelegramPlane, FaDiscord, FaYoutube, FaGoogle, FaTwitter } from 'react-icons/fa'
import { AnimatePresence } from 'framer-motion'
import { motion } from 'framer-motion'
import { usePersistentMusic } from '@/hooks/usePersistentMusic'
import { portfolioData } from '@/lib/data';
// Import music tracks from the persistent music hook
import { musicTracks } from '@/hooks/usePersistentMusic'
import dynamic from 'next/dynamic'
import { useAuth } from './Providers'
import { useUserHandle } from '@/hooks/useUserHandle'
import { useColorTheme, COLOR_THEMES, ColorTheme } from '@/components/ThemePicker'
import ThemePicker from '@/components/ThemePicker'
import SmartTokenButton from '@/components/SmartTokenButton'
import { b0aseSocialLinks } from '@/lib/social-links'

// Dynamically import WaveformVisualizer
const WaveformVisualizer = dynamic(
  () => import('@/components/WaveformVisualizer'),
  { ssr: false }
)
interface NavbarWithMusicProps {
  isDark: boolean
  setIsDark: (dark: boolean) => void
  activeCategory?: string
  setActiveCategory?: (category: string) => void
  selectedFont?: number
  setSelectedFont?: (font: number) => void
  showFontMenu?: boolean
  setShowFontMenu?: (show: boolean) => void
  fontOptions?: any[]
  colorIntense?: boolean
  setColorIntense?: (intense: boolean) => void
  globeStructured?: boolean
  setGlobeStructured?: (structured: boolean) => void
  animationExpanded?: boolean
  setAnimationExpanded?: (expanded: boolean) => void
  zoomLevel?: number
  autoCycle?: boolean
  setAutoCycle?: (auto: boolean) => void
  mouseHover?: boolean
  setMouseHover?: (hover: boolean) => void
  hideNavbar?: boolean
  shadeLevel?: number
  cycleShadeLevel?: () => void
  allAnimationsActive?: boolean
  toggleAllAnimations?: () => void
  isStacked?: boolean
}
export default function NavbarWithMusic({
  isDark,
  setIsDark,
  activeCategory,
  setActiveCategory,
  selectedFont = 0,
  setSelectedFont,
  showFontMenu = false,
  setShowFontMenu,
  fontOptions = [],
  colorIntense = false,
  setColorIntense,
  globeStructured = false,
  setGlobeStructured,
  animationExpanded = true,
  setAnimationExpanded,
  zoomLevel = 50,
  autoCycle = false,
  setAutoCycle,
  mouseHover = false,
  setMouseHover,
  hideNavbar = false,
  shadeLevel = 2,
  cycleShadeLevel,
  allAnimationsActive = true,
  toggleAllAnimations,
  isStacked = false,
}: NavbarWithMusicProps) {
  // Use persistent music context
  const { isPlaying, setIsPlaying, currentTrack, setCurrentTrack, audioRef, musicTracks: contextTracks } = usePersistentMusic()
  const pathname = usePathname()

  // Color theme for multi-color themes
  const { colorTheme, setColorTheme } = useColorTheme()

  // Check if we're in a colored mode (not black or white) - needs white text for legibility
  const isColoredMode = ['red', 'green', 'blue', 'yellow', 'pink'].includes(colorTheme)

  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false)
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [boaseTokens, setBoaseTokens] = useState(0)
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)

  const timeoutRefs = useRef<NodeJS.Timeout[]>([])
  const interactionListenersRef = useRef<Array<{ event: string; handler: (e: Event) => void }>>([])
  const prevTrackRef = useRef<number | null>(null)
  // Cleanup function for all timeouts
  const cleanupTimeouts = () => {
    timeoutRefs.current.forEach(timeout => {
      if (timeout) clearTimeout(timeout)
    })
    timeoutRefs.current = []
  }
  // Cleanup function for all event listeners
  const cleanupListeners = () => {
    interactionListenersRef.current.forEach(({ event, handler }) => {
      if (event.startsWith('window:')) {
        window.removeEventListener(event.replace('window:', ''), handler as EventListener)
      } else {
        document.removeEventListener(event, handler)
      }
    })
    interactionListenersRef.current = []
  }

  // Read $BOASE token count from localStorage
  useEffect(() => {
    const readTokens = () => {
      const saved = localStorage.getItem('teleport_tokens')
      if (saved) setBoaseTokens(parseInt(saved))
    }
    readTokens()
    // Listen for storage changes (from FloatingTeleportButton)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'teleport_tokens') readTokens()
    }
    window.addEventListener('storage', handleStorage)
    // Poll less frequently for same-tab updates (every 10s instead of 1s)
    const interval = setInterval(readTokens, 10000)
    return () => {
      window.removeEventListener('storage', handleStorage)
      clearInterval(interval)
    }
  }, [])

  // Close color menu when clicking outside
  useEffect(() => {
    if (!isColorMenuOpen) return
    const handleClick = () => setIsColorMenuOpen(false)
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [isColorMenuOpen])

  // Clean up on component mount to prevent accumulation
  useEffect(() => {
    cleanupTimeouts()
    cleanupListeners()
    return () => {
      cleanupTimeouts()
      cleanupListeners()
    }
  }, [])
  // Initialize audio element (no autoplay - only manual play)
  useEffect(() => {
    // Simply set up the audio element without any autoplay attempts
    if (audioRef.current) {
      audioRef.current.volume = 0.5
      console.log('Audio element initialized - ready for manual play')
    }

    // Cleanup on unmount
    return () => {
      cleanupTimeouts()
      cleanupListeners()
      // Don't cleanup global audio element to maintain persistence
    }
  }, [])
  // Update audio source when track changes
  useEffect(() => {
    if (!audioRef.current) return
    if (prevTrackRef.current === currentTrack) return // Skip if track hasn't actually changed
    const audio = audioRef.current
    const wasPlaying = isPlaying
    // Stop any currently playing audio immediately and reset
    audio.pause()
    audio.currentTime = 0
    // Clear the source first
    audio.src = ''
    audio.load()
    // Small delay to ensure cleanup completes before loading new source
    const loadTimeout = setTimeout(() => {
      if (!audioRef.current) return
      try {
        // Set new source
        audioRef.current.src = musicTracks[currentTrack].url
        audioRef.current.load()
        // Update previous track reference
        prevTrackRef.current = currentTrack
        // Add error handler for failed audio loads
        const handleError = (event: Event) => {
          const audioElement = event.target as HTMLAudioElement
          const errorCode = audioElement.error?.code
          const errorMessage = audioElement.error?.message || 'Unknown error'

          console.warn(`Audio load failed for track: ${musicTracks[currentTrack]?.title || 'Unknown'}`, {
            error: errorMessage,
            code: errorCode,
            src: audioElement.src
          })

          setIsLoading(false)
          setIsPlaying(false)

          // Try reloading the track up to 3 times before skipping
          const retryCount = parseInt(audioRef.current?.dataset.retryCount || '0', 10)
          if (audioRef.current && retryCount < 3) {
            audioRef.current.dataset.retryCount = String(retryCount + 1)
            setTimeout(() => {
              if (audioRef.current) {
                console.log(`Retrying track load (attempt ${retryCount + 1}/3):`, musicTracks[currentTrack]?.title)
                audioRef.current.load()
              }
            }, 1000 * (retryCount + 1)) // Progressive delay
          } else {
            // Reset retry count and skip to next track
            if (audioRef.current) {
              audioRef.current.dataset.retryCount = '0'
            }
            console.warn(`Skipping track after ${retryCount + 1} failed attempts:`, musicTracks[currentTrack]?.title)
            const nextIndex = (currentTrack + 1) % musicTracks.length
            setCurrentTrack(nextIndex)
          }
        }
        // Add success handler to reset retry count
        const handleCanPlay = () => {
          if (audioRef.current) {
            audioRef.current.dataset.retryCount = '0'
            console.log('Track loaded successfully:', musicTracks[currentTrack]?.title)
          }
        }

        // Remove any existing handlers first
        audioRef.current.removeEventListener('error', handleError)
        audioRef.current.removeEventListener('canplay', handleCanPlay)

        // Add new handlers
        audioRef.current.addEventListener('error', handleError, { once: true })
        audioRef.current.addEventListener('canplay', handleCanPlay, { once: true })
        // If we were playing, wait for track to load then play
        if (wasPlaying) {
          const playWhenReady = () => {
            if (audioRef.current && audioRef.current.readyState >= 2) {
              audioRef.current.play().catch((error) => {
                console.error('Failed to play track:', error)
                setIsPlaying(false)
                setIsLoading(false)
              })
            } else if (audioRef.current) {
              audioRef.current.addEventListener('canplay', () => {
                if (audioRef.current && wasPlaying) {
                  audioRef.current.play().catch((error) => {
                    console.error('Failed to play track:', error)
                    setIsPlaying(false)
                    setIsLoading(false)
                  })
                }
              }, { once: true })
            }
          }
          playWhenReady()
        }
      } catch (error) {
        console.error('Error loading track:', error)
        setIsLoading(false)
        setIsPlaying(false)
      }
    }, 100)
    timeoutRefs.current.push(loadTimeout)
    return () => {
      clearTimeout(loadTimeout)
      // Ensure audio is stopped when component unmounts or track changes
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }
  }, [currentTrack, isPlaying])
  const togglePlay = async () => {
    if (!audioRef.current) return
    setIsLoading(true)
    try {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        // Ensure audio is loaded before playing
        if (audioRef.current.readyState < 2) {
          audioRef.current.load()
          await new Promise((resolve) => {
            const handleCanPlay = () => {
              audioRef.current?.removeEventListener('canplay', handleCanPlay)
              resolve(undefined)
            }
            audioRef.current?.addEventListener('canplay', handleCanPlay, { once: true })
            // Timeout after 5 seconds
            setTimeout(() => {
              audioRef.current?.removeEventListener('canplay', handleCanPlay)
              resolve(undefined)
            }, 5000)
          })
        }
        await audioRef.current.play()
        setIsPlaying(true)
        setHasInteracted(true)
      }
    } catch (error) {
      console.error('Playback failed:', error)
      setIsPlaying(false)
      // Try to recover by reloading the audio
      if (audioRef.current) {
        try {
          audioRef.current.load()
        } catch (loadError) {
          console.error('Failed to reload audio:', loadError)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }
  const nextTrack = () => {
    const nextIndex = (currentTrack + 1) % musicTracks.length
    setCurrentTrack(nextIndex)
  }
  const prevTrack = () => {
    const prevIndex = currentTrack === 0 ? musicTracks.length - 1 : currentTrack - 1
    setCurrentTrack(prevIndex)
  }
  const { user, signOut, signInWithGoogle, signInWithGithub, signInWithTwitter, signInWithDiscord } = useAuth()
  const { handle: handcashHandle } = useUserHandle()
  const isUserLoggedIn = !!user
  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL

  // Handle social login
  const handleSocialLogin = async (provider: 'google' | 'github' | 'twitter' | 'discord') => {
    try {
      switch (provider) {
        case 'google':
          await signInWithGoogle()
          break
        case 'github':
          await signInWithGithub()
          break
        case 'twitter':
          await signInWithTwitter()
          break
        case 'discord':
          await signInWithDiscord()
          break
      }
    } catch (err) {
      console.error(`${provider} login error:`, err)
    }
  }
  const [isNavHovered, setIsNavHovered] = useState(false);
  const [manualScrollOffset, setManualScrollOffset] = useState(0);
  const navScrollRef = useRef<HTMLDivElement>(null);
  const navScrollElRef = useRef<HTMLDivElement | null>(null);
  const navAnimationIdRef = useRef<number>(0);

  // Handle manual scroll left
  const scrollLeft = () => {
    setManualScrollOffset(prev => Math.min(prev + 200, 0));
  };

  // Handle manual scroll right
  const scrollRight = () => {
    setManualScrollOffset(prev => prev - 200);
  };

  const toggleTheme = () => {
    setColorTheme(isDark ? 'white' : 'black');
  };

  // Handle wheel scrolling
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setManualScrollOffset(prev => prev - e.deltaY);
  };

  // Cleanup nav scroll animation on unmount
  useEffect(() => {
    return () => {
      if (navAnimationIdRef.current) {
        cancelAnimationFrame(navAnimationIdRef.current);
      }
    };
  }, []);

  const handleLogout = async () => {
    try {
      console.log('🔍 Logging out...');

      // Sign out from Supabase
      const { error } = await signOut();
      if (error) {
        console.error('❌ Supabase signOut error:', error);
      } else {
        console.log('✅ Supabase signOut successful');
      }

      // Clear wallet cookies
      await fetch('/api/auth/wallet', { method: 'DELETE' }).catch((e) => {
        console.error('❌ Wallet cookie clear error:', e);
      });

      // Clear HandCash cookies
      document.cookie = 'b0ase_auth_token=; Path=/; Max-Age=0';
      document.cookie = 'b0ase_user_handle=; Path=/; Max-Age=0';

      // Clear Twitter cookie
      document.cookie = 'b0ase_twitter_user=; Path=/; Max-Age=0';

      console.log('✅ All cookies cleared, redirecting to home...');

      // Force redirect
      window.location.href = '/';
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Force redirect even if there's an error
      window.location.href = '/';
    }
  };

  // All nav pages - Home first, then alphabetical (scrollable so we can fit many)
  const allPages = [
    { name: 'Home', path: '/', isHome: true },
    { name: 'Agents', path: '/agents' },
    { name: 'Apps', path: '/apps' },
    { name: 'Automation', path: '/automation' },
    { name: 'Blog', path: '/blog' },
    { name: 'Boardroom', path: '/boardroom' },
    { name: 'Build', path: '/build' },
    { name: 'Buttons', path: '/buttons' },
    { name: 'Careers', path: '/careers' },
    { name: 'Cashboard', path: '/cashboard' },
    { name: 'Clients', path: '/clients' },
    { name: 'Components', path: '/components' },
    { name: 'Contact', path: '/contact' },
    { name: 'Content', path: '/content' },
    { name: 'Contracts', path: '/contracts' },
    { name: 'Courses', path: '/courses' },
    { name: 'Creative', path: '/creative' },
    { name: 'Developers', path: '/developers' },
    { name: 'Dividends', path: '/dividends' },
    { name: 'Docs', path: '/docs' },
    { name: 'Exchange', path: '/exchange' },
    { name: 'Founders', path: '/founders' },
    { name: 'Gigs', path: '/gigs' },
    { name: 'Invest', path: '/invest' },
    { name: 'Investors', path: '/investors' },
    { name: 'Kintsugi', path: '/kintsugi' },
    { name: 'Market', path: '/market' },
    { name: 'Metanet', path: '/metanet' },
    { name: 'Mint', path: '/mint' },
    { name: 'MoneyButton', path: '/moneybutton' },
    { name: 'Music', path: '/music' },
    { name: 'Packages', path: '/packages' },
    { name: 'Pipeline', path: '/pipeline' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Projects', path: '/projects' },
    { name: 'Rewards', path: '/rewards' },
    { name: 'Roadmap', path: '/roadmap' },
    { name: 'Schematics', path: '/schematics' },
    { name: 'Services', path: '/services' },
    { name: 'Skills', path: '/skills' },
    { name: 'Smart Contracts', path: '/smart-contracts' },
    { name: 'Studio', path: '/studio' },
    { name: 'TaaS', path: '/taas' },
    { name: 'Tokens', path: '/tokens' },
    { name: 'Tools', path: '/tools' },
    { name: 'Treasury', path: '/treasury' },
    { name: 'Video', path: '/video' },
    { name: 'Websites', path: '/websites' },
    { name: 'Work', path: '/work' },
  ];



  return (
    <>
      {!hideNavbar && (
        <motion.header
          className={`${isStacked ? 'relative' : 'fixed top-2 left-2 right-2 md:top-6 md:left-12 md:right-12'} z-[60] ${isDark ? 'bg-black/90 md:border md:border-white/10' : 'bg-white/90 md:border md:border-black/10'} backdrop-blur-md md:rounded-xl`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Main flex container - Smart Token Button on left, all rows on right */}
          <div className="flex">
            {/* Smart Token Button - Always shows $BOASE */}
            <SmartTokenButton
              isDark={isDark}
              boaseTokens={boaseTokens}
              staticMode={true}
              showBadge={false}
            />

            {/* All navbar rows container */}
            <div className="flex-1 min-w-0">
              {/* Top Bar - Social Links & Login */}
              <div className={`py-2 md:py-3 border-b ${isDark ? 'border-white/10 bg-black/80' : 'border-black/10 bg-white/80'}`}>
                <div className="flex items-center justify-between min-w-max md:min-w-0 px-4 md:px-8">
                  <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                    {/* Menu Button */}
                    <Link
                      href="/menu"
                      className={`hidden md:flex items-center justify-center w-7 h-7 rounded transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-white/60 hover:text-white' : 'bg-black/5 hover:bg-black/10 text-black/60 hover:text-black'}`}
                      title="Site Menu"
                    >
                      <FiMenu className="w-3.5 h-3.5" />
                    </Link>

                    {/* Search Bar */}
                    <div className="hidden md:flex items-center">
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`}>
                        <FiSearch className={`w-3 h-3 ${isDark ? 'text-white/30' : 'text-black/30'}`} />
                        <input
                          type="text"
                          placeholder="Search"
                          className={`bg-transparent text-[11px] w-16 focus:w-32 transition-all duration-200 outline-none ${isDark ? 'placeholder:text-white/30 text-white/70' : 'placeholder:text-black/30 text-black/70'}`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                              window.location.href = `/search?q=${encodeURIComponent(e.currentTarget.value.trim())}`;
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Music Player Controls - Compact */}
                    <div className="flex items-center gap-1 md:gap-2">
                      <button
                        onClick={prevTrack}
                        className={`p-1 rounded transition-all flex-shrink-0 ${isDark ? 'hover:bg-white/10 text-white/60 hover:text-white' : 'hover:bg-black/10 text-black/70 hover:text-black'}`}
                        title="Previous track"
                      >
                        <FiSkipBack size={12} />
                      </button>
                      <button
                        onClick={togglePlay}
                        disabled={isLoading}
                        className={`p-1 rounded-full border transition-all flex-shrink-0 ${isDark
                          ? 'border-white/20 hover:border-white/40 bg-white/5 text-white'
                          : 'border-black/20 hover:border-black/40 bg-black/5 text-black'
                          } ${isLoading ? 'opacity-50' : ''}`}
                        title={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? <FiPause size={12} /> : <FiPlay size={12} />}
                      </button>
                      <button
                        onClick={nextTrack}
                        className={`p-1 rounded transition-all flex-shrink-0 ${isDark ? 'hover:bg-white/10 text-white/60 hover:text-white' : 'hover:bg-black/10 text-black/70 hover:text-black'}`}
                        title="Next track"
                      >
                        <FiSkipForward size={12} />
                      </button>
                      <div className={`hidden md:flex items-center gap-1.5 ml-1 pl-2 border-l ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                        <span className={`text-[10px] font-mono ${isPlaying ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-white/40' : 'text-black/40')}`}>
                          {isPlaying ? '▶' : '⏸'}
                        </span>
                        <span className={`text-[10px] truncate max-w-[120px] ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                          {musicTracks[currentTrack]?.title || 'No track'}
                        </span>
                      </div>
                      {/* Audio EQ Visualizer */}
                      <div className="hidden md:block ml-2">
                        <WaveformVisualizer isDark={isDark} />
                      </div>
                    </div>

                  </div>

                  <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">


                    <a
                      href={b0aseSocialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-1 md:p-1.5 rounded transition-all hidden sm:block flex-shrink-0 ${isDark ? 'hover:bg-white/10 text-white/60 hover:text-white' : 'hover:bg-black/10 text-black/90 hover:text-black'}`}
                      title="GitHub"
                    >
                      <FiGithub size={14} />
                    </a>
                    <a
                      href={b0aseSocialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-1 md:p-1.5 rounded transition-all hidden sm:block flex-shrink-0 ${isDark ? 'hover:bg-white/10 text-white/60 hover:text-white' : 'hover:bg-black/10 text-black/90 hover:text-black'}`}
                      title="LinkedIn"
                    >
                      <FiLinkedin size={14} />
                    </a>
                    <a
                      href={b0aseSocialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-1 md:p-1.5 rounded transition-all hidden sm:block flex-shrink-0 ${isDark ? 'hover:bg-white/10 text-white/60 hover:text-white' : 'hover:bg-black/10 text-black/90 hover:text-black'}`}
                      title="X (Twitter)"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-3.5 h-3.5 md:w-3.5 md:h-3.5"
                        aria-hidden="true"
                      >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                    <a
                      href={b0aseSocialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-1 md:p-1.5 rounded transition-all hidden sm:block flex-shrink-0 ${isDark ? 'hover:bg-white/10 text-white/60 hover:text-white' : 'hover:bg-black/10 text-black/90 hover:text-black'}`}
                      title="YouTube"
                    >
                      <FaYoutube size={14} />
                    </a>
                    <Link
                      href="/contact"
                      className={`p-1 md:p-1.5 rounded transition-all flex-shrink-0 flex items-center ${isDark ? 'hover:bg-white/10 text-white/60 hover:text-white' : 'hover:bg-black/10 text-black/90 hover:text-black'}`}
                      title="Email"
                    >
                      <FiMail size={14} />
                    </Link>
                    <a
                      href="https://wa.me/447707954186"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-1 md:p-1.5 rounded transition-all flex-shrink-0 flex items-center ${isDark ? 'hover:bg-white/10 text-white/60 hover:text-white' : 'hover:bg-black/10 text-black/90 hover:text-black'}`}
                      title="WhatsApp"
                    >
                      <FaWhatsapp size={14} />
                    </a>
                    <a
                      href={b0aseSocialLinks.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-1 md:p-1.5 rounded transition-all flex-shrink-0 flex items-center ${isDark ? 'hover:bg-white/10 text-white/60 hover:text-white' : 'hover:bg-black/10 text-black/90 hover:text-black'}`}
                      title="Telegram"
                    >
                      <FaTelegramPlane size={14} />
                    </a>
                    <a
                      href={b0aseSocialLinks.discord}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-1 md:p-1.5 rounded transition-all flex-shrink-0 flex items-center ${isDark ? 'hover:bg-white/10 text-white/60 hover:text-white' : 'hover:bg-black/10 text-black/90 hover:text-black'}`}
                      title="Discord"
                    >
                      <FaDiscord size={14} />
                    </a>

                    <span className={`mx-1 md:mx-2 flex-shrink-0 ${isDark ? 'text-white/20' : 'text-black/20'}`}>|</span>

                    {/* HandCash Wallet display - shows when HandCash connected (regardless of Supabase) */}
                    {handcashHandle && (
                      <div className="flex items-center gap-1">
                        <Link
                          href="/user/account"
                          className={`p-1 md:p-1.5 rounded transition-all flex items-center gap-1.5 flex-shrink-0 ${isDark ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20' : 'bg-black/5 text-black border border-black/10 hover:bg-black/10'}`}
                          title="User Dashboard"
                        >
                          <FaWallet size={12} />
                          <span className="hidden sm:inline text-xs font-mono text-emerald-400">${handcashHandle}</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className={`px-2 py-0.5 rounded transition-all flex items-center gap-1.5 flex-shrink-0 border text-[10px] font-mono uppercase tracking-tighter ${isDark ? 'border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400' : 'border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-600'}`}
                          title="Logout"
                        >
                          <FiLogOut size={12} />
                          <span>LOGOUT</span>
                        </button>
                      </div>
                    )}

                    {/* Connect button - opens auth modal (only shows when not logged in) */}
                    {!handcashHandle && !isUserLoggedIn && (
                      <button
                        onClick={() => setIsConnectModalOpen(true)}
                        className={`px-3 py-1 rounded transition-all flex items-center gap-1.5 flex-shrink-0 border text-xs font-mono uppercase tracking-tight ${isDark ? 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400' : 'border-emerald-600/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600'}`}
                        title="Connect account"
                      >
                        <FiUser size={12} />
                        <span>CONNECT</span>
                      </button>
                    )}

                    {/* User/Admin Badge - Supabase users without HandCash */}
                    {isUserLoggedIn && !handcashHandle && (
                      <div className="flex items-center gap-2 md:gap-3">
                        {isAdmin && (
                          <Link href="/dashboard" className="flex items-center gap-1.5 text-white hover:text-gray-300 transition-colors text-xs font-mono uppercase tracking-wider">
                            <FiLayout size={12} />
                            <span className="hidden sm:inline">Dashboard</span>
                          </Link>
                        )}
                        <Link
                          href="/user/account"
                          className={`p-1 md:p-1.5 rounded transition-all flex items-center gap-1.5 flex-shrink-0 ${isDark ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20' : 'bg-black/5 text-black border border-black/10 hover:bg-black/10'}`}
                          title="My Account"
                        >
                          <FiUser size={12} />
                          <span className="hidden sm:inline text-xs font-mono">{user?.email?.split('@')[0]}</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-1.5 text-red-400/80 hover:text-red-400 transition-colors text-[10px] border border-red-400/20 px-2 py-0.5 rounded hover:bg-red-400/10 uppercase font-mono tracking-tighter"
                        >
                          <FiLogOut size={12} />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}

                    {/* Admin dashboard link for HandCash users who are also admin */}
                    {handcashHandle && isAdmin && (
                      <Link href="/dashboard" className="flex items-center gap-1.5 text-white hover:text-gray-300 transition-colors text-xs font-mono uppercase tracking-wider">
                        <FiLayout size={12} />
                        <span className="hidden sm:inline">Dashboard</span>
                      </Link>
                    )}

                    {/* Global Theme Picker - Color Swatches */}
                    <div className={`ml-2 pl-2 border-l ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                      <ThemePicker />
                    </div>
                  </div>
                </div>
              </div>
              {/* Navigation Row - Scrollable with arrows */}
              <div className={`py-2 border-t ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                {/* Desktop View - Scrollable */}
                <div className="hidden md:flex items-center px-2">
                  {/* Left scroll arrow */}
                  <button
                    onClick={() => {
                      const container = document.getElementById('nav-scroll-container');
                      if (container) container.scrollBy({ left: -200, behavior: 'smooth' });
                    }}
                    className={`p-1 rounded flex-shrink-0 transition-all ${isDark ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'hover:bg-black/10 text-black/70 hover:text-black'}`}
                  >
                    <FiChevronLeft size={14} />
                  </button>

                  {/* Scrollable nav links - seamless infinite scroll */}
                  <div
                    id="nav-scroll-container"
                    ref={(el) => {
                      navScrollElRef.current = el;
                      if (el && !el.dataset.autoScroll) {
                        el.dataset.autoScroll = 'true';
                        const scrollContent = el.firstElementChild as HTMLElement;
                        if (!scrollContent) return;

                        // Get the width of one set of items
                        const singleSetWidth = scrollContent.scrollWidth / 2;

                        // Start at the beginning
                        el.scrollLeft = 0;

                        let lastTime = 0;
                        const speed = 0.5; // pixels per frame at 60fps

                        const animate = (currentTime: number) => {
                          if (lastTime) {
                            const delta = (currentTime - lastTime) / 16.67; // normalize to 60fps
                            el.scrollLeft += speed * delta; // Scroll LEFT-TO-RIGHT (increase scrollLeft)

                            // When we've scrolled past the first set, jump back seamlessly
                            if (el.scrollLeft >= singleSetWidth) {
                              el.scrollLeft = 0;
                            }
                            // If manually scrolled before start, jump forward
                            if (el.scrollLeft < 0) {
                              el.scrollLeft = singleSetWidth - 10;
                            }
                          }
                          lastTime = currentTime;
                          navAnimationIdRef.current = requestAnimationFrame(animate);
                        };

                        navAnimationIdRef.current = requestAnimationFrame(animate);

                        // Pause on hover
                        el.addEventListener('mouseenter', () => {
                          cancelAnimationFrame(navAnimationIdRef.current);
                        });
                        el.addEventListener('mouseleave', () => {
                          lastTime = 0;
                          navAnimationIdRef.current = requestAnimationFrame(animate);
                        });
                      }
                    }}
                    className="flex-1 overflow-x-auto scrollbar-hide px-2"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    <div className="flex items-center gap-0.5">
                      {/* First set of pages */}
                      {allPages.map((page: { name: string; path: string; isHome?: boolean }) => (
                        <Link
                          key={page.path}
                          href={page.path}
                          className={`px-2.5 py-1 text-xs font-semibold rounded transition-all whitespace-nowrap flex-shrink-0 ${(page.isHome && pathname === '/') || pathname === page.path
                            ? 'bg-black text-white hover:bg-black/80'
                            : isColoredMode
                              ? 'hover:bg-black/10 text-black font-bold hover:text-black'
                              : (isDark ? 'hover:bg-white/10 text-white/80 hover:text-white' : 'hover:bg-black/10 text-black hover:text-black')
                            }`}
                        >
                          {page.name}
                        </Link>
                      ))}
                      {/* Duplicate set for seamless loop */}
                      {allPages.map((page: { name: string; path: string; isHome?: boolean }) => (
                        <Link
                          key={`${page.path}-dup`}
                          href={page.path}
                          className={`px-2.5 py-1 text-xs font-semibold rounded transition-all whitespace-nowrap flex-shrink-0 ${(page.isHome && pathname === '/') || pathname === page.path
                            ? 'bg-black text-white hover:bg-black/80'
                            : isColoredMode
                              ? 'hover:bg-black/10 text-black font-bold hover:text-black'
                              : (isDark ? 'hover:bg-white/10 text-white/80 hover:text-white' : 'hover:bg-black/10 text-black hover:text-black')
                            }`}
                        >
                          {page.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Right scroll arrow */}
                  <button
                    onClick={() => {
                      const container = document.getElementById('nav-scroll-container');
                      if (container) container.scrollBy({ left: 200, behavior: 'smooth' });
                    }}
                    className={`p-1 rounded flex-shrink-0 transition-all ${isDark ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'hover:bg-black/10 text-black/70 hover:text-black'}`}
                  >
                    <FiChevronRight size={14} />
                  </button>
                </div>

                {/* Mobile View */}
                <div className="md:hidden flex flex-col w-full">
                  <div className="flex items-center justify-between px-4 py-0.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-black'}`}>
                      {allPages.find(p => p.path === pathname)?.name || (pathname === '/' ? 'Home' : 'Menu')}
                    </span>
                    <button
                      onClick={() => setIsNavDropdownOpen(!isNavDropdownOpen)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold border ${isDark ? 'border-white/20 bg-white/5 text-white' : 'border-black/20 bg-black/5 text-black'
                        }`}
                    >
                      {isNavDropdownOpen ? 'CLOSE' : 'EXPLORE'}
                      {isNavDropdownOpen ? <FiChevronLeft className="-rotate-90" size={10} /> : <FiChevronRight className="rotate-90" size={10} />}
                    </button>
                  </div>

                  {isNavDropdownOpen && (
                    <div className={`grid grid-cols-2 gap-1.5 p-3 border-t max-h-[60vh] overflow-y-auto ${isDark ? 'border-white/10 bg-black/95' : 'border-black/10 bg-white/95'}`}>
                      {allPages.map((page) => (
                        <Link
                          key={page.path}
                          href={page.path}
                          onClick={() => setIsNavDropdownOpen(false)}
                          className={`px-3 py-2.5 text-sm font-semibold rounded-lg text-center transition-all ${(page.isHome && pathname === '/') || pathname === page.path
                            ? 'bg-white text-black'
                            : (isDark ? 'hover:bg-white/10 text-white border border-white/10' : 'hover:bg-black/10 text-black border border-black/10')
                            }`}
                        >
                          {page.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Ticker Bar */}
              <div className={`py-2 border-t ${
                ['red', 'green', 'blue', 'yellow', 'pink'].includes(colorTheme)
                  ? 'border-black/20 bg-transparent'
                  : isDark
                    ? 'border-white/20 bg-black/50'
                    : 'border-black/20 bg-white/50'
              }`}>
                <div className="px-4 md:px-8">
                  <TickerCarousel isDark={isDark} colorTheme={colorTheme} />
                </div>
              </div>
            </div>
          </div>
        </motion.header>
      )}
      {/* Audio element is now managed by context */}

      {/* Connect Modal */}
      <AnimatePresence>
        {isConnectModalOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsConnectModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-zinc-800">
                <h2 className="text-lg font-bold text-white">Connect to b0ase</h2>
                <button
                  onClick={() => setIsConnectModalOpen(false)}
                  className="text-zinc-400 hover:text-white transition-colors p-1"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Social Login */}
                <div>
                  <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Sign in with</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSocialLogin('google')}
                      className="flex items-center justify-center gap-2 p-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-red-500/50 rounded-lg transition-all group"
                    >
                      <FaGoogle className="text-red-500" size={16} />
                      <span className="text-sm text-zinc-300 group-hover:text-white">Google</span>
                    </button>
                    <button
                      onClick={() => handleSocialLogin('github')}
                      className="flex items-center justify-center gap-2 p-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-500/50 rounded-lg transition-all group"
                    >
                      <FiGithub className="text-white" size={16} />
                      <span className="text-sm text-zinc-300 group-hover:text-white">GitHub</span>
                    </button>
                    <button
                      onClick={() => handleSocialLogin('twitter')}
                      className="flex items-center justify-center gap-2 p-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-blue-500/50 rounded-lg transition-all group"
                    >
                      <FaTwitter className="text-blue-400" size={16} />
                      <span className="text-sm text-zinc-300 group-hover:text-white">Twitter</span>
                    </button>
                    <button
                      onClick={() => handleSocialLogin('discord')}
                      className="flex items-center justify-center gap-2 p-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-indigo-500/50 rounded-lg transition-all group"
                    >
                      <FaDiscord className="text-indigo-500" size={16} />
                      <span className="text-sm text-zinc-300 group-hover:text-white">Discord</span>
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-zinc-800" />
                  <span className="text-[10px] text-zinc-600 uppercase tracking-wider">or connect wallet</span>
                  <div className="flex-1 h-px bg-zinc-800" />
                </div>

                {/* Wallet Options */}
                <div className="space-y-2">
                  <a
                    href="/api/auth/handcash"
                    className="w-full flex items-center justify-between p-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-green-500/50 rounded-lg transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                        <span className="text-green-500 font-bold text-sm">H</span>
                      </div>
                      <div className="text-left">
                        <div className="text-white text-sm font-medium group-hover:text-green-400 transition-colors">HandCash</div>
                        <div className="text-[10px] text-zinc-500">Bitcoin SV (BSV)</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-500 font-mono">RECOMMENDED</span>
                  </a>

                  <button
                    onClick={() => alert('Yours Wallet coming soon!')}
                    className="w-full flex items-center justify-between p-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-blue-500/50 rounded-lg transition-all group opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <span className="text-blue-500 font-bold text-sm">Y</span>
                      </div>
                      <div className="text-left">
                        <div className="text-white text-sm font-medium group-hover:text-blue-400 transition-colors">Yours Wallet</div>
                        <div className="text-[10px] text-zinc-500">Bitcoin SV (BSV)</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-600 font-mono">SOON</span>
                  </button>
                </div>

                {/* Footer */}
                <p className="text-[10px] text-zinc-600 text-center pt-2">
                  By connecting, you agree to our Terms of Service
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}