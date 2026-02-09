'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
// Image components removed for no-images version
import { portfolioData, Project } from '@/lib/data';
import { generateTempPrice, generateTempChange } from '@/lib/token-pricing';


import { FaExternalLinkAlt, FaGithub, FaInfoCircle, FaArrowRight, FaLinkedin, FaLock, FaUnlock, FaLaptopCode, FaPencilRuler, FaVideo, FaBullhorn, FaHandsHelping, FaCog, FaComments, FaTools, FaTwitter, FaTelegramPlane, FaDiscord, FaBrain, FaRocket, FaChevronDown, FaChevronRight, FaReact, FaShoppingCart, FaRobot, FaCreditCard, FaMobile, FaNodeJs, FaDatabase, FaUser, FaEdit, FaChartLine, FaSearch, FaBell, FaFileAlt, FaNewspaper, FaHashtag, FaEnvelope, FaChartPie, FaCamera, FaMusic, FaVolumeUp, FaMicrophone, FaWordpress, FaBuilding } from 'react-icons/fa';
import { BsCurrencyBitcoin } from "react-icons/bs";
import SmartNotionLink from '@/components/SmartNotionLink';

import WireframeAnimation from '@/components/landing/WireframeAnimation';

// Uncomment icons
const GitHubIcon = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" /></svg>;
const XIcon = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
const NotionIcon = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>;
const TokenIcon = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm0-1.143A6.857 6.857 0 1 1 8 1.143a6.857 6.857 0 0 1 0 13.714z" /><path d="M6.29 8.51H4.844V6.66h.33L6.29 8.51zm2.47-1.615c0-.58-.4-1.047-1.063-1.047H6.42v4.33h1.374c.68 0 1.086-.467 1.086-1.08V6.895zm-1.22 1.857H6.81V6.24h.74c.39 0 .625.246.625.6v1.867c0 .348-.248.602-.64.602zM11.156 8.51h-1.45v-1.85h.33l1.12 1.85z" /></svg>;

const services = [
  {
    id: 'ai-agents',
    slug: 'ai-agents',
    title: 'AI Agents',
    description: 'Autonomous AI workers',
    Icon: FaRobot,
    color: 'from-pink-500 via-pink-600 to-fuchsia-600',
    iconColor: 'text-pink-200'
  },
  {
    id: 'ai-influencer',
    slug: 'ai-influencer',
    title: 'AI Influencer',
    description: 'Complete AI social presence',
    Icon: FaRobot,
    color: 'from-fuchsia-600 via-purple-700 to-violet-700',
    iconColor: 'text-fuchsia-200'
  },
  {
    id: 'ai-integration',
    slug: 'ai-integration',
    title: 'AI Integration',
    description: 'AI solutions & automation',
    Icon: FaBrain,
    color: 'from-violet-700 via-indigo-700 to-blue-700',
    iconColor: 'text-violet-200'
  },
  {
    id: 'app-development',
    slug: 'app-development',
    title: 'App Development',
    description: 'App development & tech support',
    Icon: FaCog,
    color: 'from-blue-700 via-sky-600 to-cyan-500',
    iconColor: 'text-sky-200'
  },
  {
    id: 'blockchain-integration',
    slug: 'blockchain-integration',
    title: 'Blockchain Integration',
    description: 'Smart contracts & dApps',
    Icon: BsCurrencyBitcoin,
    color: 'from-cyan-500 via-teal-500 to-emerald-500',
    iconColor: 'text-cyan-200'
  },
  {
    id: 'branding',
    slug: 'logo-branding',
    title: 'Branding',
    description: 'Logos & visual identity',
    Icon: FaPencilRuler,
    color: 'from-emerald-500 via-green-500 to-lime-400',
    iconColor: 'text-emerald-200'
  },
  {
    id: 'consulting',
    slug: 'technical-consulting',
    title: 'Consulting',
    description: 'Expert technical advice',
    Icon: FaTools,
    color: 'from-lime-400 via-yellow-400 to-amber-400',
    iconColor: 'text-lime-200'
  },
  {
    id: 'copywriting',
    slug: 'content-copywriting',
    title: 'Copywriting',
    description: 'Content & website copy',
    Icon: FaPencilRuler,
    color: 'from-yellow-400 via-amber-400 to-orange-400',
    iconColor: 'text-yellow-200'
  },
  {
    id: 'seo-marketing',
    slug: 'seo-marketing',
    title: 'SEO & Marketing',
    description: 'Online presence optimization',
    Icon: FaBullhorn,
    color: 'from-orange-400 via-orange-500 to-red-400',
    iconColor: 'text-orange-200'
  },
  {
    id: 'social-media',
    slug: 'social-media-management',
    title: 'Social Media',
    description: 'Content & management',
    Icon: FaComments,
    color: 'from-red-400 via-rose-400 to-pink-400',
    iconColor: 'text-red-200'
  },
  {
    id: 'support',
    slug: 'support-maintenance',
    title: 'Support',
    description: 'Ongoing maintenance',
    Icon: FaHandsHelping,
    color: 'from-rose-400 via-pink-400 to-fuchsia-400',
    iconColor: 'text-rose-200'
  },
  {
    id: 'video-photo',
    slug: 'video-production',
    title: 'Video & Photo',
    description: 'Production & photography',
    Icon: FaVideo,
    color: 'from-fuchsia-400 via-pink-500 to-pink-600',
    iconColor: 'text-fuchsia-200'
  },
  {
    id: 'wordpress-development',
    slug: 'wordpress-development',
    title: 'WordPress Development',
    description: 'WordPress & Elementor Pro',
    Icon: FaWordpress,
    color: 'from-blue-600 via-indigo-600 to-purple-700',
    iconColor: 'text-blue-200'
  },
  {
    id: 'web-development',
    slug: 'web-development',
    title: 'Web Development',
    description: 'Responsive websites & apps',
    Icon: FaLaptopCode,
    color: 'from-pink-600 via-fuchsia-600 to-purple-700',
    iconColor: 'text-pink-200'
  },
];

// Add mock assets (same as exchange page)
const mockAssets = [
  { symbol: 'BOASE', name: 'B0ase Token', price: 1.23, volume: 12000, change: '+2.1%' },
  { symbol: 'USDT', name: 'Tether USD', price: 1.00, volume: 50000, change: '0.0%' },
  { symbol: 'ETH', name: 'Ethereum', price: 3200, volume: 8000, change: '-1.2%' },
  { symbol: 'BTC', name: 'Bitcoin', price: 67000, volume: 3000, change: '+0.5%' },
];


export default function PortfolioPage() {
  const projects: Project[] = portfolioData.projects as Project[];
  const [isAboutVisible, setIsAboutVisible] = useState(false);



  // Admin state
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');

  // Traffic lights state
  const [trafficLights, setTrafficLights] = useState<{ [key: number]: { 0: 'red' | 'orange' | 'green', 1: 'red' | 'orange' | 'green', 2: 'red' | 'orange' | 'green' } }>({});
  const [loadingTrafficLights, setLoadingTrafficLights] = useState(false);

  // Video refs
  const videoRefs = useRef<{ [key: string]: React.RefObject<HTMLVideoElement> }>({});
  const el = useRef<HTMLHeadingElement>(null);

  // Video loading states
  const [videoLoadingStates, setVideoLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [loadedVideos, setLoadedVideos] = useState<Set<string>>(new Set());

  // Navbar state
  const [isDark, setIsDark] = useState(true);
  const [activeCategory, setActiveCategory] = useState('projects');
  const [selectedFont, setSelectedFont] = useState(0);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [colorIntense, setColorIntense] = useState(false);
  const [globeStructured, setGlobeStructured] = useState(false);
  const [animationExpanded, setAnimationExpanded] = useState(true);
  const [resetView, setResetView] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [autoCycle, setAutoCycle] = useState(false);
  const [mouseHover, setMouseHover] = useState(false);
  const [modelType, setModelType] = useState<'wireframe' | 'gundam' | 'both'>('wireframe');
  const [shadeLevel, setShadeLevel] = useState(2);

  const cycleShadeLevel = () => {
    setShadeLevel(prev => (prev + 1) % 5);
  };

  const fontOptions = [
    {
      name: 'Swiss Design',
      fonts: {
        primary: 'Helvetica Neue, Helvetica, sans-serif',
        secondary: 'Helvetica Neue, Helvetica, sans-serif',
        mono: 'IBM Plex Mono, monospace',
        display: 'Helvetica Neue, Helvetica, sans-serif'
      },
      weights: { regular: 400, bold: 700, black: 900 }
    }
  ];

  // Zero Dice video cycling state
  const [zeroDiceVideoIndex, setZeroDiceVideoIndex] = useState(0);

  // Zero Dice video cycling effect
  useEffect(() => {
    const interval = setInterval(() => {
      setZeroDiceVideoIndex((prevIndex) => {
        const videos = projectVideos['zerodice-store']?.videos;
        if (videos && videos.length > 0) {
          return (prevIndex + 1) % videos.length;
        }
        return prevIndex;
      });
    }, 5000); // Change video every 5 seconds

    return () => clearInterval(interval);
  }, []);




  // State for single collapsible skills section
  const [allSkillsExpanded, setAllSkillsExpanded] = useState(false);

  // Sorted projects for display (alphabetically by title, with specific projects at bottom)
  const sortedProjects = [...projects].sort((a, b) => {
    const bottomProjects = ['BSV API', 'BSVEX', 'BitCDN', 'BitDNS', 'Weight', 'Penshun', 'YourCash'];
    const aIsBottom = bottomProjects.includes(a.title);
    const bIsBottom = bottomProjects.includes(b.title);

    // If one is a bottom project and the other isn't, bottom project goes last
    if (aIsBottom && !bIsBottom) return 1;
    if (!aIsBottom && bIsBottom) return -1;

    // If both are bottom projects, sort them in the specified order
    if (aIsBottom && bIsBottom) {
      return bottomProjects.indexOf(a.title) - bottomProjects.indexOf(b.title);
    }

    // Otherwise, sort alphabetically
    return a.title.localeCompare(b.title);
  });

  // OAuth redirect state
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Handle OAuth callback if code is present in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      setIsRedirecting(true);

      // Create the callback URL
      const callbackUrl = `/auth/callback?code=${code}&next=${encodeURIComponent('/auth/profile')}`;

      // Redirect immediately
      window.location.replace(callbackUrl);
    }
  }, []);



  // Project video mapping - add more projects here as needed
  const projectVideos: { [key: string]: { video?: string; videos?: string[]; poster: string } } = {
    'minecraftparty-website': {
      video: '/images/clientprojects/minecraftparty-website/MINECRAFTPARTY.mp4',
      poster: '/images/slugs/minecraftparty-website.jpg'
    },
    'aigirlfriends-website': {
      video: '/images/clientprojects/aigirlfriends-website/AIGF.mp4',
      poster: '/images/slugs/aigirlfriends-website.jpg'
    },
    'vexvoid-com': {
      video: '/images/clientprojects/vexvoid-com/VEXVOID.mp4',
      poster: '/images/slugs/vexvoid.png'
    },
    'audex-website': {
      video: '/images/clientprojects/audex-website/AUDEX.mp4',
      poster: '/images/slugs/audex-website.png'
    },
    'npgx-website': {
      video: '/videos/NPG.mp4',
      poster: '/images/slugs/npgx-website.jpg'
    },
    'zerodice-store': {
      videos: ['/videos/zero-dice-02.mp4', '/videos/zero-dice-03.mp4', '/videos/zero-dice-04.mp4', '/videos/zero-dice-slug-video-01.mp4'],
      poster: '/images/slugs/zerodice-store.png'
    },
    'libertascoffee-store': {
      video: '/images/clientprojects/libertascoffee-store/LIBERTAS.mp4',
      poster: '/images/slugs/libertascoffee-store.jpg'
    },
    'beauty-queen-ai-com': {
      video: '/images/clientprojects/beauty-queen-ai-com/BEAUTY-QUEEN.mp4',
      poster: '/images/slugs/beauty-queen-ai-com.jpg'
    },
    'bsvapi-com': {
      video: '/images/clientprojects/bsvapi-com/BSV_API.mp4',
      poster: '/images/slugs/bsvapi-com.jpg'
    },
    'coursekings-website': {
      video: '/images/clientprojects/coursekings-website/COURSE-KINGS.mp4',
      poster: '/images/slugs/coursekings-website.png'
    },
    'metagraph-app': {
      video: '/images/clientprojects/metagraph-app/METAGRAPH.mp4',
      poster: '/images/slugs/metagraph-app.jpg'
    },
    'oneshotcomics': {
      video: '/images/clientprojects/one-shot-comics/oneshotcomics.mp4',
      poster: '/images/slugs/oneshotcomics.png'
    },
    'osinka-kalaso': {
      video: '/videos/osinka-kalaso-video.mp4',
      poster: '/images/slugs/osinka-kalaso.png'
    },
    'cashboard-website': {
      video: '/videos/cashboard.mp4',
      poster: '/images/slugs/cashboard--2.png'
    },
    'ninja-punk-girls-website': {
      video: '/images/clientprojects/ninjapunkgirls-website/npg-website-slug-video.mp4',
      poster: '/images/slugs/ninja-punk-girls-website.png'
    }
  };

  // Preload critical videos for better performance
  useEffect(() => {
    // Preload first few videos that are likely to be viewed
    const criticalVideos = ['minecraftparty-website', 'aigirlfriends-website', 'vexvoid-com', 'ninja-punk-girls-website'];

    criticalVideos.forEach(slug => {
      if (projectVideos[slug]) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'fetch';
        // Handle both single video and multiple videos
        const videoSrc = projectVideos[slug]?.videos
          ? projectVideos[slug]?.videos?.[0]
          : projectVideos[slug]?.video;
        if (videoSrc) {
          link.href = videoSrc;
          document.head.appendChild(link);
        }
      }
    });
  }, []);

  // Function to handle video playback - loop to first frame then stop
  const handleVideoPlayback = useCallback((videoRef: React.RefObject<HTMLVideoElement>, projectSlug: string) => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    // Check if we've already set up this video to prevent infinite loops
    if (video.dataset.setup === 'true') return;

    // Set loading state
    setVideoLoadingStates(prev => ({ ...prev, [projectSlug]: true }));

    // When video ends, all videos loop continuously
    video.addEventListener('ended', () => {
      video.currentTime = 0;
      video.play();
    });

    // Start playing when video is ready - but don't autoplay immediately
    video.addEventListener('loadeddata', () => {
      setVideoLoadingStates(prev => ({ ...prev, [projectSlug]: false }));
      setLoadedVideos(prev => new Set([...prev, projectSlug]));

      // Only play if user is hovering or if it's a critical video
      if (video.dataset.preloaded === 'true') {
        video.play();
      }
    });

    // Mark as preloaded for performance tracking
    video.dataset.preloaded = 'true';
    // Mark as setup to prevent infinite loops
    video.dataset.setup = 'true';
  }, []);

  // Function to restart video on hover
  const handleVideoHover = useCallback((projectSlug: string) => {
    const videoRef = videoRefs.current[projectSlug];
    if (videoRef?.current && loadedVideos.has(projectSlug)) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  }, [loadedVideos]);

  // Function to stop video on mouse leave
  const handleVideoLeave = useCallback((projectSlug: string) => {
    const videoRef = videoRefs.current[projectSlug];
    if (videoRef?.current) {
      videoRef.current.pause();
    }
  }, []);

  const toggleAllSkills = () => {
    setAllSkillsExpanded(prev => !prev);
  };

  // Traffic light status mapping
  const getStatusColor = (status: string): 'red' | 'orange' | 'green' => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('live') || lowerStatus.includes('active') || lowerStatus.includes('finished') || lowerStatus.includes('complete')) {
      return 'green';
    } else if (lowerStatus.includes('development') || lowerStatus.includes('paused') || lowerStatus.includes('progress') || lowerStatus.includes('concept')) {
      return 'orange';
    } else {
      return 'red';
    }
  };

  // Initialize project statuses based on current status
  React.useEffect(() => {
    // Load traffic light data from API
    const loadTrafficLights = async () => {
      try {
        const response = await fetch('/api/traffic-lights');
        if (response.ok) {
          const { trafficLights } = await response.json();
          setTrafficLights(trafficLights);
          setLoadingTrafficLights(false);
        } else {
          // Fallback to default initialization if API fails
          const initialStatuses: { [key: number]: { 0: 'red' | 'orange' | 'green', 1: 'red' | 'orange' | 'green', 2: 'red' | 'orange' | 'green' } } = {};
          projects.forEach(project => {
            initialStatuses[project.id] = {
              0: getStatusColor(project.status),
              1: getStatusColor(project.status),
              2: getStatusColor(project.status)
            };
          });
          setTrafficLights(initialStatuses);
          setLoadingTrafficLights(false);
        }
      } catch (error) {
        console.error('Failed to load traffic lights:', error);
        // Fallback to default initialization
        const initialStatuses: { [key: number]: { 0: 'red' | 'orange' | 'green', 1: 'red' | 'orange' | 'green', 2: 'red' | 'orange' | 'green' } } = {};
        projects.forEach(project => {
          initialStatuses[project.id] = {
            0: getStatusColor(project.status),
            1: getStatusColor(project.status),
            2: getStatusColor(project.status)
          };
        });
        setTrafficLights(initialStatuses);
        setLoadingTrafficLights(false);
        setError('Failed to load traffic lights');
      }
    };

    loadTrafficLights();
  }, [projects]);

  const handlePasswordSubmit = () => {
    if (adminPassword === 'traffic') {
      setIsAdminMode(true);
      setShowPasswordModal(false);
      setAdminPassword('');
    } else {
      alert('Incorrect password');
      setAdminPassword('');
    }
  };

  const toggleProjectStatus = async (projectId: number, lightIndex: 0 | 1 | 2) => {
    if (!isAdminMode) return;

    const currentStatuses = trafficLights[projectId] || { 0: 'red', 1: 'red', 2: 'red' };
    const newStatuses = { ...currentStatuses };
    const current = newStatuses[lightIndex];
    const nextStatus = current === 'red' ? 'orange' : current === 'orange' ? 'green' : 'red';
    newStatuses[lightIndex] = nextStatus;

    // Update local state immediately for responsive UI
    setTrafficLights(prev => ({ ...prev, [projectId]: newStatuses }));

    // Save to API
    try {
      const response = await fetch('/api/traffic-lights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          lightIndex,
          status: nextStatus
        })
      });

      if (!response.ok) {
        console.error('Failed to save traffic light status');
        // Optionally revert the change or show an error message
      }
    } catch (error) {
      console.error('Error saving traffic light status:', error);
      // Optionally revert the change or show an error message
    }
  };

  const getTrafficLightStyle = (status: 'red' | 'orange' | 'green') => {
    switch (status) {
      case 'green':
        return 'bg-white border-gray-300 shadow-white/20';
      case 'orange':
        return 'bg-gray-500 border-gray-400 shadow-gray-500/20';
      case 'red':
      default:
        return 'bg-gray-900 border-gray-700 shadow-gray-900/20';
    }
  };

  const getTrafficLightTooltip = (lightIndex: 0 | 1 | 2, status: 'red' | 'orange' | 'green', isAdminMode: boolean) => {
    if (isAdminMode) {
      return `Click to change ${lightIndex === 0 ? 'website status' : lightIndex === 1 ? 'features status' : 'functionality status'}`;
    }

    switch (lightIndex) {
      case 0: // Left light - Website live status
        return status === 'green' ? 'Website live' : 'Website not live';
      case 1: // Middle light - Features attention
        return status === 'orange' ? 'Features need attention/updating' : status === 'green' ? 'Features up to date' : 'Features need work';
      case 2: // Right light - Deep functionality/database
        return status === 'red' ? 'Deep features not built or database not connected' : status === 'orange' ? 'Some functionality incomplete' : 'Full functionality available';
      default:
        return '';
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAboutVisible(true);
    }, 100);
    // Force dark theme
    document.documentElement.classList.add('dark');
    return () => {
      clearTimeout(timer);
      // Optionally remove the dark class on component unmount if needed elsewhere
      // document.documentElement.classList.remove('dark'); 
    };
  }, []);

  console.log("Name prop for CharacterCycle:", portfolioData.about.name);

  // Main component return 
  return (
    <div className="flex flex-col bg-black min-h-screen overflow-x-hidden">
      {/* OAuth Redirect Loading Overlay */}
      {isRedirecting && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Completing authentication...</p>
            <p className="text-gray-400 text-sm mt-2">Redirecting to your profile</p>
          </div>
        </div>
      )}

      {/* Background Animation */}
      <div className="fixed inset-0 w-full h-full z-0">
        <WireframeAnimation
          isDark={isDark}
          structured={globeStructured}
          colorIntense={colorIntense}
          isHovered={mouseHover}
          zoomLevel={zoomLevel}
          modelType={modelType}
          shadeLevel={shadeLevel}
          onZoomChange={(newZoom) => {
            if (mouseHover) {
              setZoomLevel(newZoom);
            }
          }}
        />
      </div>

      {/* Header removed as it is now provided by NavbarProvider */}

      {/* <ClientForm /> */}
      <main className="relative z-10 px-4 md:px-6 pb-12 md:pb-16 flex-grow text-foreground max-w-full">
        {/* Hero Section */}
        <section className="min-h-[60vh] flex flex-col justify-center items-center text-center py-20 mb-16">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-thin text-white mb-8 tracking-wider animate-fade-in">
              WELCOME
            </h1>
            <div className="w-32 h-px bg-white/30 mx-auto mb-8"></div>
            <p className="text-xl md:text-2xl font-extralight text-white/90 mb-6 tracking-wide">
              Web Design Studio & Digital Atelier
            </p>
            <p className="text-lg md:text-xl font-thin text-white/70 leading-relaxed max-w-3xl mx-auto mb-8">
              Crafting bespoke digital experiences where elegant design meets blockchain innovation.
              We architect sophisticated web applications, integrate Web3 technologies,
              and build autonomous AI systems that push the boundaries of what's possible online.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm font-light text-white/60">
              <span className="px-4 py-2 border border-white/20 rounded-full hover:border-white/40 transition-colors">
                Full-Stack Development
              </span>
              <span className="px-4 py-2 border border-white/20 rounded-full hover:border-white/40 transition-colors">
                Smart Contract Integration
              </span>
              <span className="px-4 py-2 border border-white/20 rounded-full hover:border-white/40 transition-colors">
                AI Agent Architecture
              </span>
              <span className="px-4 py-2 border border-white/20 rounded-full hover:border-white/40 transition-colors">
                Decentralized Applications
              </span>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="mb-8 mt-6">
          <div className="text-left">
            <div className="mb-4">
              <p className="text-base md:text-lg text-white leading-tight">
                {portfolioData.about.tagline}
              </p>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {portfolioData.about.bio}
            </p>
          </div>
        </section>



        {/* Projects Section */}
        <section id="projects" className="mb-16 md:mb-24 scroll-mt-20">
          <div className={`flex items-center justify-between mb-6 border-b pb-2 ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <h2 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
              &lt;Websites&gt;
            </h2>
            {/* Discreet admin padlock */}
            <button
              onClick={() => setShowPasswordModal(true)}
              className="text-gray-500 hover:text-gray-300 transition-colors opacity-50 hover:opacity-100"
              title="Admin Panel"
            >
              {isAdminMode ? <FaUnlock size={16} /> : <FaLock size={16} />}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 text-foreground">
            {/* Bitcoin Corporation - First (Top Left) */}
            <div
              className="relative bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900 text-white shadow-xl flex flex-col overflow-hidden h-40 rounded-lg group hover:shadow-lg hover:from-yellow-800 hover:to-red-800 transition-all duration-200 border-2 border-transparent bg-clip-padding cursor-pointer"
              style={{
                backgroundImage: 'linear-gradient(to bottom right, #f59e0b, #dc2626)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                borderImage: 'linear-gradient(to bottom right, #f59e0b, #dc2626) 1',
                boxShadow: `
                  inset 2px 2px 3px rgba(255,255,255,0.25),
                  inset -2px -2px 3px rgba(0,0,0,0.3),
                  inset 0 0 0 1px rgba(255,255,255,0.1),
                  0 1px 2px rgba(0,0,0,0.3),
                  0 0 0 1px rgba(0,0,0,0.2)
                `
              }}
              onClick={() => window.open('https://www.thebitcoincorporation.website', '_blank')}
            >
              {/* Background removed for no-images version */}

              {/* Content */}
              <div className="relative z-10 flex flex-col h-full p-3 overflow-hidden">
                {/* Token ticker - top left */}
                <div className="absolute top-3 left-3">
                  <span className="bg-yellow-900/80 text-yellow-100 text-xs font-medium px-2 py-1 rounded shadow-sm border border-yellow-700/30">
                    $BCORP
                  </span>
                </div>
                {/* Price info - top left below ticker */}
                <div className="absolute top-12 left-3">
                  <div className="bg-black/60 text-white text-xs px-2 py-1 rounded shadow-sm">
                    <div className="font-bold">${generateTempPrice('$BCORP')}</div>
                    <div className={`text-xs ${generateTempChange('$BCORP').startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {generateTempChange('$BCORP')}
                    </div>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="bg-gradient-to-r from-gray-600 to-gray-700 text-white text-xs font-semibold px-1.5 py-0.5 rounded text-center border border-gray-500/30">
                    LTD
                  </span>
                </div>


                {/* Spacer to push content to bottom */}
                <div className="flex-1"></div>

                {/* Bottom section with name/URL on left and buttons on right */}
                <div className="flex items-end justify-between">
                  <div className="flex-1 min-w-0 mr-2">
                    <h3 className="text-sm font-bold text-white leading-tight mb-1">Bitcoin Corp</h3>
                    <a
                      href="https://www.thebitcoincorporation.website/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-400 hover:text-orange-300 text-xs font-mono transition-colors block truncate"
                      title="www.thebitcoincorporation.website"
                      onClick={(e) => e.stopPropagation()}
                    >
                      www.thebitcoincorporation.website
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-1">
                    <a
                      href="https://www.thebitcoincorporation.website/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View
                    </a>
                    <a
                      href="https://x.com/bitcoincorp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaTwitter size={10} />
                      X
                    </a>
                    <a
                      href="https://www.thebitcoincorporation.website/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Demo
                    </a>
                    <a
                      href="https://github.com/b0ase/bitcoin-corp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      GitHub
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Bitcoin OS - Second (Top Middle) */}
            <div
              className="relative bg-gradient-to-br from-orange-900 via-amber-900 to-yellow-900 text-white shadow-xl flex flex-col overflow-hidden h-40 rounded-lg group hover:shadow-lg hover:from-orange-800 hover:to-amber-800 transition-all duration-200 border-2 border-transparent bg-clip-padding cursor-pointer"
              style={{
                backgroundImage: 'linear-gradient(to bottom right, #f97316, #fbbf24)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                borderImage: 'linear-gradient(to bottom right, #f97316, #fbbf24) 1',
                boxShadow: `
                  inset 2px 2px 3px rgba(255,255,255,0.25),
                  inset -2px -2px 3px rgba(0,0,0,0.3),
                  inset 0 0 0 1px rgba(255,255,255,0.1),
                  0 1px 2px rgba(0,0,0,0.3),
                  0 0 0 1px rgba(0,0,0,0.2)
                `
              }}
              onClick={() => window.open('https://bitcoin-os.vercel.app', '_blank')}
            >
              {/* Background removed for no-images version */}

              {/* Content */}
              <div className="relative z-10 flex flex-col h-full p-3 overflow-hidden">
                {/* Token ticker - top left */}
                <div className="absolute top-3 left-3">
                  <span className="bg-orange-900/80 text-orange-100 text-xs font-medium px-2 py-1 rounded shadow-sm border border-orange-700/30">
                    $BOS
                  </span>
                </div>
                {/* Price info - top left below ticker */}
                <div className="absolute top-12 left-3">
                  <div className="bg-black/60 text-white text-xs px-2 py-1 rounded shadow-sm">
                    <div className="font-bold">${generateTempPrice('$BOS')}</div>
                    <div className={`text-xs ${generateTempChange('$BOS').startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {generateTempChange('$BOS')}
                    </div>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded text-center border border-purple-400/30">
                    PoC
                  </span>
                </div>


                {/* Spacer to push content to bottom */}
                <div className="flex-1"></div>

                {/* Bottom section with name/URL on left and buttons on right */}
                <div className="flex items-end justify-between">
                  <div className="flex-1 min-w-0 mr-2">
                    <h3 className="text-sm font-bold text-white leading-tight mb-1">Bitcoin OS</h3>
                    <a
                      href="https://bitcoin-os.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-400 hover:text-yellow-300 text-xs font-mono transition-colors block truncate"
                      title="bitcoin-os.vercel.app"
                      onClick={(e) => e.stopPropagation()}
                    >
                      bitcoin-os.vercel.app
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-1">
                    <a
                      href="https://bitcoin-os.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View
                    </a>
                    <a
                      href="https://x.com/bitcoinos"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaTwitter size={10} />
                      X
                    </a>
                    <a
                      href="https://bitcoin-os.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Demo
                    </a>
                    <a
                      href="https://github.com/b0ase/bitcoin-os"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      GitHub
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* BAPPS - Third (Top Right) */}
            <div
              className="relative bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 text-white shadow-xl flex flex-col overflow-hidden h-40 rounded-lg group hover:shadow-lg hover:from-purple-800 hover:to-pink-800 transition-all duration-200 border-2 border-transparent bg-clip-padding cursor-pointer"
              style={{
                backgroundImage: 'linear-gradient(to bottom right, #9333ea, #ec4899)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                borderImage: 'linear-gradient(to bottom right, #9333ea, #ec4899) 1',
                boxShadow: `
                  inset 2px 2px 3px rgba(255,255,255,0.25),
                  inset -2px -2px 3px rgba(0,0,0,0.3),
                  inset 0 0 0 1px rgba(255,255,255,0.1),
                  0 1px 2px rgba(0,0,0,0.3),
                  0 0 0 1px rgba(0,0,0,0.2)
                `
              }}
              onClick={() => window.open('https://www.bitcoinapps.store', '_blank')}
            >
              {/* Background removed for no-images version */}

              {/* Content */}
              <div className="relative z-10 flex flex-col h-full p-3 overflow-hidden">
                {/* Token ticker - top left */}
                <div className="absolute top-3 left-3">
                  <span className="bg-purple-900/80 text-purple-100 text-xs font-medium px-2 py-1 rounded shadow-sm border border-purple-700/30">
                    $BAPPS
                  </span>
                </div>
                {/* Price info - top left below ticker */}
                <div className="absolute top-12 left-3">
                  <div className="bg-black/60 text-white text-xs px-2 py-1 rounded shadow-sm">
                    <div className="font-bold">${generateTempPrice('$BAPPS')}</div>
                    <div className={`text-xs ${generateTempChange('$BAPPS').startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {generateTempChange('$BAPPS')}
                    </div>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded text-center border border-purple-400/30">
                    PoC
                  </span>
                </div>


                {/* Spacer to push content to bottom */}
                <div className="flex-1"></div>

                {/* Bottom section with name/URL on left and buttons on right */}
                <div className="flex items-end justify-between">
                  <div className="flex-1 min-w-0 mr-2">
                    <h3 className="text-sm font-bold text-white leading-tight mb-1">Bitcoin Apps</h3>
                    <a
                      href="https://www.bitcoinapps.store/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 text-xs font-mono transition-colors block truncate"
                      title="bitcoinapps.store"
                      onClick={(e) => e.stopPropagation()}
                    >
                      bitcoinapps.store
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-1">
                    <a
                      href="https://www.bitcoinapps.store/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View
                    </a>
                    <a
                      href="https://x.com/bapps"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaTwitter size={10} />
                      X
                    </a>
                    <a
                      href="https://www.bitcoinapps.store/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Demo
                    </a>
                    <a
                      href="https://github.com/b0ase/bapps"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      GitHub
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Bitcoin Email - Fourth (Second Row Left) */}
            <div
              className="relative bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 text-white shadow-xl flex flex-col overflow-hidden h-40 rounded-lg group hover:shadow-lg hover:from-red-800 hover:to-orange-800 transition-all duration-200 border-2 border-transparent bg-clip-padding cursor-pointer"
              style={{
                backgroundImage: 'linear-gradient(to bottom right, #ef4444, #f59e0b)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                borderImage: 'linear-gradient(to bottom right, #ef4444, #f59e0b) 1',
                boxShadow: `
                  inset 2px 2px 3px rgba(255,255,255,0.25),
                  inset -2px -2px 3px rgba(0,0,0,0.3),
                  inset 0 0 0 1px rgba(255,255,255,0.1),
                  0 1px 2px rgba(0,0,0,0.3),
                  0 0 0 1px rgba(0,0,0,0.2)
                `
              }}
              onClick={() => {
                const bitcoinEmailProject = projects.find(p => p.slug === 'bitcoin-email');
                if (bitcoinEmailProject) {
                  window.open(bitcoinEmailProject.liveUrl, '_blank');
                }
              }}
            >
              {/* Background removed for no-images version */}

              {/* Content */}
              <div className="relative z-10 flex flex-col h-full p-3 overflow-hidden">
                {/* Token ticker - top left */}
                <div className="absolute top-3 left-3">
                  <span className="bg-blue-900/80 text-blue-100 text-xs font-medium px-2 py-1 rounded shadow-sm border border-blue-700/30">
                    $BMAIL
                  </span>
                </div>
                {/* Price info - top left below ticker */}
                <div className="absolute top-12 left-3">
                  <div className="bg-black/60 text-white text-xs px-2 py-1 rounded shadow-sm">
                    <div className="font-bold">${generateTempPrice('$BMAIL')}</div>
                    <div className={`text-xs ${generateTempChange('$BMAIL').startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {generateTempChange('$BMAIL')}
                    </div>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded text-center border border-green-400/30">
                    DEMO
                  </span>
                </div>


                {/* Spacer to push content to bottom */}
                <div className="flex-1"></div>

                {/* Bottom section with name/URL on left and buttons on right */}
                <div className="flex items-end justify-between">
                  <div className="flex-1 min-w-0 mr-2">
                    <h3 className="text-sm font-bold text-white leading-tight mb-1">Bitcoin Email</h3>
                    <a
                      href="https://bitcoin-email.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-400 hover:text-orange-300 text-xs font-mono transition-colors block truncate"
                      title="bitcoin-email.vercel.app"
                      onClick={(e) => e.stopPropagation()}
                    >
                      bitcoin-email.vercel.app
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-1">
                    <a
                      href="https://bitcoin-email.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View
                    </a>
                    <a
                      href="https://x.com/bitcoin-email"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaTwitter size={10} />
                      X
                    </a>
                    <a
                      href="https://notion.so/bitcoin-email"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Vision
                    </a>
                    <a
                      href="https://github.com/b0ase/bitcoin-email"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      GitHub
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Bitcoin Drive - Second */}
            <div
              className="relative bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 text-white shadow-xl flex flex-col overflow-hidden h-40 rounded-lg group hover:shadow-lg hover:from-green-800 hover:to-emerald-800 transition-all duration-200 border-2 border-transparent bg-clip-padding cursor-pointer"
              style={{
                backgroundImage: 'linear-gradient(to bottom right, #10b981, #06b6d4)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                borderImage: 'linear-gradient(to bottom right, #10b981, #06b6d4) 1',
                boxShadow: `
                  inset 2px 2px 3px rgba(255,255,255,0.25),
                  inset -2px -2px 3px rgba(0,0,0,0.3),
                  inset 0 0 0 1px rgba(255,255,255,0.1),
                  0 1px 2px rgba(0,0,0,0.3),
                  0 0 0 1px rgba(0,0,0,0.2)
                `
              }}
              onClick={() => {
                const bitcoinDriveProject = projects.find(p => p.slug === 'bitcoin-drive');
                if (bitcoinDriveProject) {
                  window.open(bitcoinDriveProject.liveUrl, '_blank');
                }
              }}
            >
              {/* Background removed for no-images version */}

              {/* Content */}
              <div className="relative z-10 flex flex-col h-full p-3 overflow-hidden">
                {/* Token ticker - top left */}
                <div className="absolute top-3 left-3">
                  <span className="bg-blue-900/80 text-blue-100 text-xs font-medium px-2 py-1 rounded shadow-sm border border-blue-700/30">
                    $BDRIVE
                  </span>
                </div>
                {/* Price info - top left below ticker */}
                <div className="absolute top-12 left-3">
                  <div className="bg-black/60 text-white text-xs px-2 py-1 rounded shadow-sm">
                    <div className="font-bold">${generateTempPrice('$BDRIVE')}</div>
                    <div className={`text-xs ${generateTempChange('$BDRIVE').startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {generateTempChange('$BDRIVE')}
                    </div>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded text-center border border-green-400/30">
                    DEMO
                  </span>
                </div>


                {/* Spacer to push content to bottom */}
                <div className="flex-1"></div>

                {/* Bottom section with name/URL on left and buttons on right */}
                <div className="flex items-end justify-between">
                  <div className="flex-1 min-w-0 mr-2">
                    <h3 className="text-sm font-bold text-white leading-tight mb-1">Bitcoin Drive</h3>
                    <a
                      href="https://bitcoin-drive.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 text-xs font-mono transition-colors block truncate"
                      title="bitcoin-drive.vercel.app"
                      onClick={(e) => e.stopPropagation()}
                    >
                      bitcoin-drive.vercel.app
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-1">
                    <a
                      href="https://bitcoin-drive.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View
                    </a>
                    <a
                      href="https://x.com/BitcoinDrive"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                    <a
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                      href="/portfolio/bitcoin-drive"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Vision
                    </a>
                    <a
                      href="https://github.com/b0ase/bitcoin-drive"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      GitHub
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Bitcoin Spreadsheet Card - Second (hardcoded) */}
            <div
              className="relative bg-black text-white shadow-xl flex flex-col overflow-hidden h-40 rounded-lg group hover:shadow-lg hover:bg-gray-900 transition-all duration-200 border-2 border-transparent bg-clip-padding cursor-pointer"
              style={{
                backgroundImage: 'linear-gradient(to bottom right, #3b82f6, #8b5cf6)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                borderImage: 'linear-gradient(to bottom right, #3b82f6, #8b5cf6) 1',
                boxShadow: `
                  inset 2px 2px 3px rgba(255,255,255,0.25),
                  inset -2px -2px 3px rgba(0,0,0,0.3),
                  inset 0 0 0 1px rgba(255,255,255,0.1),
                  0 1px 2px rgba(0,0,0,0.3),
                  0 0 0 1px rgba(0,0,0,0.2)
                `
              }}
              onClick={() => window.open('https://bitcoin-spreadsheet.vercel.app/', '_blank')}
            >
              {/* Background removed for no-images version */}

              {/* Content */}
              <div className="relative z-10 flex flex-col h-full p-3 overflow-hidden">
                {/* Token ticker - top left */}
                <div className="absolute top-3 left-3">
                  <span className="bg-blue-900/80 text-blue-100 text-xs font-medium px-2 py-1 rounded shadow-sm border border-blue-700/30">
                    $BSHEETS
                  </span>
                </div>
                {/* Price info - top left below ticker */}
                <div className="absolute top-12 left-3">
                  <div className="bg-black/60 text-white text-xs px-2 py-1 rounded shadow-sm">
                    <div className="font-bold">${generateTempPrice('$BSHEETS')}</div>
                    <div className={`text-xs ${generateTempChange('$BSHEETS').startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {generateTempChange('$BSHEETS')}
                    </div>
                  </div>
                </div>
                {/* DEMO badge */}
                <div className="absolute top-3 right-3">
                  <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded text-center border border-green-400/30">
                    DEMO
                  </span>
                </div>


                {/* Spacer to push content to bottom */}
                <div className="flex-1"></div>

                {/* Bottom section with name/URL on left and buttons on right */}
                <div className="flex items-end justify-between">
                  {/* Project title and URL - bottom left */}
                  <div className="flex-1 min-w-0 mr-2">
                    <h3 className="text-sm font-bold text-white leading-tight mb-1">
                      Bitcoin Spreadsheet
                    </h3>
                    <a
                      href="https://bitcoin-spreadsheet.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs font-mono transition-colors block truncate"
                      title="bitcoin-spreadsheet.vercel.app"
                    >
                      bitcoin-spreadsheet.vercel.app
                    </a>
                  </div>

                  {/* Action buttons - bottom right - 2x2 grid */}
                  <div className="grid grid-cols-2 gap-1">
                    <a
                      href="https://bitcoin-spreadsheet.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View
                    </a>
                    <a
                      href="https://x.com/BitcoinSheets"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaTwitter size={10} />
                      X
                    </a>
                    <Link
                      href="/portfolio/bitcoin-spreadsheet"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Vision
                    </Link>
                    <a
                      href="https://github.com/b0ase/bitcoin-spreadsheet"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      GitHub
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Bitcoin Music - Sixth (Second Row Middle) */}
            <div
              className="relative bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white shadow-xl flex flex-col overflow-hidden h-40 rounded-lg group hover:shadow-lg hover:from-purple-800 hover:to-blue-800 transition-all duration-200 border-2 border-transparent bg-clip-padding cursor-pointer"
              style={{
                backgroundImage: 'linear-gradient(to bottom right, #7c3aed, #2563eb)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                borderImage: 'linear-gradient(to bottom right, #7c3aed, #2563eb) 1',
                boxShadow: `
                  inset 2px 2px 3px rgba(255,255,255,0.25),
                  inset -2px -2px 3px rgba(0,0,0,0.3),
                  inset 0 0 0 1px rgba(255,255,255,0.1),
                  0 1px 2px rgba(0,0,0,0.3),
                  0 0 0 1px rgba(0,0,0,0.2)
                `
              }}
              onClick={() => window.open('https://bitcoin-music.vercel.app', '_blank')}
            >
              {/* Background removed for no-images version */}

              {/* Content */}
              <div className="relative z-10 flex flex-col h-full p-3 overflow-hidden">
                {/* Token ticker - top left */}
                <div className="absolute top-3 left-3">
                  <span className="bg-purple-900/80 text-purple-100 text-xs font-medium px-2 py-1 rounded shadow-sm border border-purple-700/30">
                    $BMUSIC
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded text-center border border-blue-400/30">
                    CLIENT
                  </span>
                </div>


                {/* Spacer to push content to bottom */}
                <div className="flex-1"></div>

                {/* Bottom section with name/URL on left and buttons on right */}
                <div className="flex items-end justify-between">
                  <div className="flex-1 min-w-0 mr-2">
                    <h3 className="text-sm font-bold text-white leading-tight mb-1">Bitcoin Music</h3>
                    <a
                      href="https://bitcoin-music.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs font-mono transition-colors block truncate"
                      title="bitcoin-music.vercel.app"
                      onClick={(e) => e.stopPropagation()}
                    >
                      bitcoin-music.vercel.app
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-1">
                    <a
                      href="https://bitcoin-music.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View
                    </a>
                    <a
                      href="https://x.com/bitcoinmusic"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaTwitter size={10} />
                      X
                    </a>
                    <a
                      href="https://bitcoin-music.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Demo
                    </a>
                    <a
                      href="https://github.com/b0ase/bitcoin-music"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      GitHub
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Bitcoin Writer Card - Seventh (Second Row Right) */}
            <div
              className="relative bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 text-white shadow-xl flex flex-col overflow-hidden h-40 rounded-lg group hover:shadow-lg hover:from-purple-800 hover:to-pink-800 transition-all duration-200 border-2 border-transparent bg-clip-padding cursor-pointer"
              style={{
                backgroundImage: 'linear-gradient(to bottom right, #f97316, #ef4444)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                borderImage: 'linear-gradient(to bottom right, #f97316, #ef4444) 1',
                boxShadow: `
                  inset 2px 2px 3px rgba(255,255,255,0.25),
                  inset -2px -2px 3px rgba(0,0,0,0.3),
                  inset 0 0 0 1px rgba(255,255,255,0.1),
                  0 1px 2px rgba(0,0,0,0.3),
                  0 0 0 1px rgba(0,0,0,0.2)
                `
              }}
              onClick={() => window.open('https://bitcoin-writer.vercel.app/', '_blank')}
            >
              {/* Background removed for no-images version */}

              {/* Content */}
              <div className="relative z-10 flex flex-col h-full p-3 overflow-hidden">
                {/* Token ticker - top left */}
                <div className="absolute top-3 left-3">
                  <span className="bg-blue-900/80 text-blue-100 text-xs font-medium px-2 py-1 rounded shadow-sm border border-blue-700/30">
                    $BWRITER
                  </span>
                </div>
                {/* Price info - top left below ticker */}
                <div className="absolute top-12 left-3">
                  <div className="bg-black/60 text-white text-xs px-2 py-1 rounded shadow-sm">
                    <div className="font-bold">${generateTempPrice('$BWRITER')}</div>
                    <div className={`text-xs ${generateTempChange('$BWRITER').startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {generateTempChange('$BWRITER')}
                    </div>
                  </div>
                </div>
                {/* DEMO badge */}
                <div className="absolute top-3 right-3">
                  <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded text-center border border-green-400/30">
                    DEMO
                  </span>
                </div>


                {/* Spacer to push content to bottom */}
                <div className="flex-1"></div>

                {/* Bottom section with name/URL on left and buttons on right */}
                <div className="flex items-end justify-between">
                  {/* Project title and URL - bottom left */}
                  <div className="flex-1 min-w-0 mr-2">
                    <h3 className="text-sm font-bold text-white leading-tight mb-1">
                      Bitcoin Writer
                    </h3>
                    <a
                      href="https://bitcoin-writer.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 text-xs font-mono transition-colors block truncate"
                      title="bitcoin-writer.vercel.app"
                    >
                      bitcoin-writer.vercel.app
                    </a>
                  </div>

                  {/* Action buttons - bottom right - 2x2 grid */}
                  <div className="grid grid-cols-2 gap-1">
                    <a
                      href="https://bitcoin-writer.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View
                    </a>
                    <a
                      href="https://x.com/bitcoin_writer"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaTwitter size={10} />
                      X
                    </a>
                    <Link
                      href="/portfolio/bitcoin-writer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Vision
                    </Link>
                    <a
                      href="https://github.com/b0ase/bitcoin-writer"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      GitHub
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Repository Tokenizer - Hardcoded */}
            <div
              className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white shadow-xl flex flex-col overflow-hidden h-40 rounded-lg group hover:shadow-lg hover:from-blue-800 hover:to-purple-800 transition-all duration-200 border-2 border-transparent bg-clip-padding cursor-pointer"
              style={{
                backgroundImage: 'linear-gradient(to bottom right, #8b5cf6, #ec4899)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                borderImage: 'linear-gradient(to bottom right, #8b5cf6, #ec4899) 1',
                boxShadow: `
                  inset 2px 2px 3px rgba(255,255,255,0.25),
                  inset -2px -2px 3px rgba(0,0,0,0.3),
                  inset 0 0 0 1px rgba(255,255,255,0.1),
                  0 1px 2px rgba(0,0,0,0.3),
                  0 0 0 1px rgba(0,0,0,0.2)
                `
              }}
              onClick={() => window.open('https://tokeniser.vercel.app/github-repo-mockup.html', '_blank')}
            >
              <div className="absolute inset-0">
                {/* Background removed for no-images version */}
              </div>
              <div className="relative z-10 flex flex-col h-full p-3 overflow-hidden">
                {/* Token ticker - top left */}
                <div className="absolute top-3 left-3">
                  <span className="bg-blue-900/80 text-blue-100 text-xs font-medium px-2 py-1 rounded shadow-sm border border-blue-700/30">
                    $REPO
                  </span>
                </div>
                {/* Price info - top left below ticker */}
                <div className="absolute top-12 left-3">
                  <div className="bg-black/60 text-white text-xs px-2 py-1 rounded shadow-sm">
                    <div className="font-bold">${generateTempPrice('$REPO')}</div>
                    <div className={`text-xs ${generateTempChange('$REPO').startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {generateTempChange('$REPO')}
                    </div>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded shadow-lg border border-yellow-400/50">
                    CONCEPT
                  </span>
                </div>
                <div className="flex-1"></div>
                <div className="flex items-end justify-between">
                  <div className="flex-1 min-w-0 mr-2">
                    <h3 className="text-sm font-bold text-white leading-tight mb-1">
                      Repository Tokenizer
                    </h3>
                    <a
                      href="https://tokeniser.vercel.app/github-repo-mockup.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs font-mono transition-colors block truncate"
                      title="tokeniser.vercel.app"
                    >
                      tokeniser.vercel.app
                    </a>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <a
                      href="https://tokeniser.vercel.app/github-repo-mockup.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View
                    </a>
                    <a
                      href="https://x.com/BitcoinDrive"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                    <a
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                      href="/portfolio/bitcoin-drive"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Vision
                    </a>
                    <a
                      href="https://github.com/b0ase/bitcoin-drive"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      GitHub
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {sortedProjects.filter(project => project.slug !== 'bitcoin-email' && project.slug !== 'bitcoin-spreadsheet' && project.slug !== 'bitcoin-writer' && project.slug !== 'bitcoin-drive' && project.slug !== 'repository-tokenizer' && project.slug !== 'bitcoin-os').map((project, index) => {
              const slugStr = String(project.slug);
              return (
                <div
                  key={project.id}
                  className="relative bg-gradient-to-br from-gray-900 to-black text-white shadow-xl flex flex-col overflow-hidden h-40 rounded-lg group hover:shadow-lg hover:from-gray-800 hover:to-gray-900 transition-all duration-200 border-2 cursor-pointer"
                  style={{
                    borderImage: `linear-gradient(135deg, 
                      ${(() => {
                        // More subtle, professional color variations
                        const colors = [
                          '#06b6d4, #0ea5e9', // Cyan to sky
                          '#6366f1, #818cf8', // Indigo variations
                          '#8b5cf6, #a78bfa', // Purple variations
                          '#64748b, #94a3b8', // Slate variations
                          '#10b981, #34d399', // Emerald variations
                          '#f59e0b, #fbbf24', // Amber variations
                          '#ef4444, #f87171', // Red variations
                          '#3b82f6, #60a5fa', // Blue variations
                        ];
                        return colors[index % colors.length];
                      })()}) 1`,
                    borderImageSlice: 1,
                    boxShadow: `
                      inset 2px 2px 3px rgba(255,255,255,0.25),
                      inset -2px -2px 3px rgba(0,0,0,0.3),
                      inset 0 0 0 1px rgba(255,255,255,0.1),
                      0 1px 2px rgba(0,0,0,0.3),
                      0 0 0 1px rgba(0,0,0,0.2)
                    `
                  }}
                  onClick={() => {
                    if (project.liveUrl) {
                      window.open(project.liveUrl, '_blank');
                    }
                  }}
                  onMouseEnter={() => {
                    if (projectVideos[project.slug]) {
                      handleVideoHover(project.slug);
                    }
                  }}
                  onMouseLeave={() => {
                    if (projectVideos[project.slug]) {
                      handleVideoLeave(project.slug);
                    }
                  }}
                >
                  {/* Rollover Image/Video Background */}
                  {(project.slug === 'minecraftparty-website' || project.slug === 'aigirlfriends-website' || project.slug === 'vexvoid-com' || project.slug === 'audex-website' || project.slug === 'npgx-website' || project.slug === 'libertascoffee-store' || project.slug === 'beauty-queen-ai-com' || project.slug === 'bsvapi-com' || project.slug === 'coursekings-website' || project.slug === 'metagraph-app' || project.slug === 'oneshotcomics' || project.slug === 'osinka-kalaso' || project.slug === 'cashboard-website' || project.slug === 'ninja-punk-girls-website' || project.slug === 'zerodice-store') && projectVideos[project.slug] ? (
                    <video
                      ref={(el) => {
                        if (el) {
                          videoRefs.current[project.slug] = { current: el };
                          handleVideoPlayback({ current: el }, project.slug);
                        }
                      }}
                      src={project.slug === 'zerodice-store' && projectVideos[project.slug]?.videos
                        ? projectVideos[project.slug]?.videos?.[zeroDiceVideoIndex] || ''
                        : projectVideos[project.slug]?.video || ''}
                      poster={projectVideos[project.slug]?.poster || ''}
                      autoPlay
                      muted
                      playsInline
                      className={`absolute inset-0 w-full h-full opacity-50 group-hover:opacity-90 transition-all duration-300 ${project.slug === 'coursekings-website' || project.slug === 'libertascoffee-store'
                        ? 'object-cover object-top'
                        : project.slug === 'cashboard-website'
                          ? 'object-cover object-center'
                          : project.slug === 'zerodice-store'
                            ? 'object-cover object-top'
                            : project.slug === 'ninja-punk-girls-website'
                              ? 'object-cover'
                              : 'object-cover'
                        }`}
                      style={{
                        transition: 'opacity 0.5s ease-in-out',
                        ...(project.slug === 'coursekings-website' || project.slug === 'libertascoffee-store'
                          ? { objectPosition: 'center 70%' }
                          : project.slug === 'cashboard-website'
                            ? { objectPosition: 'center center' }
                            : project.slug === 'zerodice-store'
                              ? { objectPosition: 'center 20%' }
                              : project.slug === 'ninja-punk-girls-website'
                                ? { objectPosition: 'center 38%' }
                                : {})
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                      <svg width="100%" height="100%" viewBox="0 0 300 192" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        <rect width="300" height="192" rx="24" fill="#222" />
                        <text x="50%" y="50%" textAnchor="middle" dy=".35em" fontSize="64" fill="#fff" fontWeight="bold">{project.title.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()}</text>
                      </svg>
                    </div>
                  )}

                  <div className="relative z-10 flex flex-col h-full p-3 overflow-hidden">
                    {/* Token badge at top left */}
                    {project.tokenName && (
                      <div className="absolute top-3 left-3 z-20">
                        <span className="bg-blue-900/80 text-blue-100 text-xs font-medium px-2 py-1 rounded shadow-sm border border-blue-700/30">
                          {project.tokenName}
                        </span>
                      </div>
                    )}

                    {/* Price info below token badge */}
                    {project.tokenName && (
                      <div className="absolute top-12 left-3 z-20">
                        <div className="bg-black/60 text-white text-xs px-2 py-1 rounded shadow-sm">
                          <div className="font-bold">${generateTempPrice(project.tokenName)}</div>
                          <div className={`text-xs ${generateTempChange(project.tokenName).startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                            {generateTempChange(project.tokenName)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Badge at top right */}
                    <div className="absolute top-3 right-3 z-20">
                      {(() => {
                        // Priority: LIVE > CLIENT > DEMO > CONCEPT > DEV > LTD > CHARITY > PITCH
                        if ((project.id === 103 || project.id === 31 || project.id === 33)) {
                          return <span className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded text-center border border-green-500/30">LIVE</span>;
                        }
                        if ((project.id === 45 || project.id === 36 || project.id === 18 || project.id === 22 || project.id === 42 || project.id === 24 || project.id === 12 || project.id === 48 || project.id === 21 || project.id === 43 || project.id === 105)) {
                          return <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded text-center border border-blue-400/30">CLIENT</span>;
                        }
                        if (project.liveUrl === 'https://ninjapunkgirls.website' || project.id === 40 || project.id === 16 || project.id === 10 || project.id === 8 || project.id === 11 || project.id === 41 || project.id === 15 || project.id === 9 || project.slug === 'audex-website' || project.slug === 'cashboard-website' || project.slug === 'cashhandletoken-store' || project.liveUrl === 'https://overnerd.website') {
                          return <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded text-center border border-green-400/30">DEMO</span>;
                        }
                        if ((project.id === 44 || project.id === 46 || project.id === 14 || project.id === 13 || project.id === 5 || project.id === 4 || project.id === 6 || project.id === 26 || project.id === 25 || project.id === 19)) {
                          return <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-semibold px-1.5 py-0.5 rounded text-center border border-yellow-400/30">CONCEPT</span>;
                        }
                        if (project.id === 34) {
                          return <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded text-center border border-red-400/30">DEV</span>;
                        }
                        if (project.liveUrl === 'https://ninjapunkgirls.com') {
                          return <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded text-center border border-purple-400/30">LTD</span>;
                        }
                        if (project.id === 100) {
                          return <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded text-center border border-purple-500/30">CHARITY</span>;
                        }
                        if ((project.id === 30 || project.id === 47 || project.id === 17 || project.id === 27 || project.id === 23)) {
                          return <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded text-center border border-indigo-400/30">PITCH</span>;
                        }
                        return null;
                      })()}
                    </div>

                    {/* Spacer to push content to bottom */}
                    <div className="flex-1"></div>

                    {/* Bottom section with name/URL on left and buttons on right */}
                    <div className="flex items-end justify-between">
                      {/* Project title and URL - bottom left */}
                      <div className="flex-1 min-w-0 mr-2">
                        <h3 className="text-sm font-bold text-white leading-tight mb-1">
                          {project.title}
                        </h3>
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-xs font-mono transition-colors block truncate"
                            title={project.liveUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                          >
                            {project.liveUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                          </a>
                        )}
                      </div>

                      {/* Bottom right - four equal buttons in 2x2 grid */}
                      <div className="grid grid-cols-2 gap-1">
                        <a
                          href={project.liveUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View
                        </a>
                        <a
                          href={project.xUrl && project.xUrl !== '#' ? project.xUrl : portfolioData.about.socials.x}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FaTwitter size={10} />
                          X
                        </a>
                        <Link
                          href={`/portfolio/${project.slug}`}
                          className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Vision
                        </Link>
                        <a
                          href={project.githubUrl || `https://github.com/b0ase/${project.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-black text-white text-xs font-medium px-2 py-1 text-center border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          GitHub
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="scroll-mt-20">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Get In Touch
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Ready to start your next project? Let's discuss how we can bring your vision to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`mailto:${portfolioData.contact.email}`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Email Me
              </a>
              <Link
                href="/mint"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Mint
              </Link>
              <Link
                href="/taas"
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Tokens
              </Link>
              <Link
                href="/exchange"
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Exchange
              </Link>
              <Link
                href="/login"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Start Project
              </Link>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}


