'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlay, FiPause, FiExternalLink, FiMaximize, FiHome, FiEdit3, FiVideo, FiGrid, FiFilm } from 'react-icons/fi';
import Link from 'next/link';
import { usePersistentMusic } from '@/hooks/usePersistentMusic';

const videos = [
  // YouTube videos
  {
    id: 1,
    title: 'B0ASE Featured Stream',
    embedId: 'TgVM9VS2CHU',
    url: 'https://www.youtube.com/watch?v=TgVM9VS2CHU&t=3201s',
    duration: '1:45:00',
    category: 'Live',
    startTime: 3201,
    type: 'youtube'
  },
  {
    id: 2,
    title: 'Zero Dice - Game Overview',
    embedId: 'RW590aU0Ce4',
    url: 'https://www.youtube.com/watch?v=RW590aU0Ce4&t=5s',
    duration: '10:15',
    category: 'Gaming',
    type: 'youtube',
    startTime: 5,
    description: 'Complete overview of Zero Dice gaming platform'
  },
  {
    id: 3,
    title: 'Zero Dice - Store Demo',
    embedId: 'ivMmSzLrtu4',
    url: 'https://www.youtube.com/watch?v=ivMmSzLrtu4',
    duration: '8:30',
    category: 'Gaming',
    type: 'youtube',
    description: 'Demonstration of Zero Dice store features'
  },
  {
    id: 4,
    title: 'Zero Dice - Player Guide',
    embedId: 'hBuxggRIW8k',
    url: 'https://www.youtube.com/watch?v=hBuxggRIW8k',
    duration: '15:45',
    category: 'Tutorial',
    type: 'youtube',
    description: 'Complete player guide for Zero Dice platform'
  },
  {
    id: 5,
    title: 'Zero Dice - Behind the Scenes',
    embedId: 'FdclpOBNOEE',
    url: 'https://www.youtube.com/watch?v=FdclpOBNOEE&t=338s',
    duration: '12:20',
    category: 'Behind the Scenes',
    type: 'youtube',
    startTime: 338,
    description: 'Development insights and behind the scenes content'
  },

  // Project videos (verified to exist)
  {
    id: 10,
    title: 'Cashboard Dashboard',
    src: '/videos/cashboard.mp4',
    poster: '/videos/cashboard.mp4',
    duration: '0:40',
    category: 'Finance',
    type: 'mp4',
    description: 'Financial dashboard and analytics tool'
  },
  {
    id: 11,
    title: 'AI Girlfriends Platform',
    src: '/images/clientprojects/aigirlfriends-website/AIGF.mp4',
    poster: '/images/clientprojects/aigirlfriends-website/AIGF.mp4',
    duration: '0:45',
    category: 'AI',
    type: 'mp4',
    description: 'AI-powered virtual companion platform'
  },
  {
    id: 12,
    title: 'Audex Audio Platform',
    src: '/images/clientprojects/audex-website/AUDEX.mp4',
    poster: '/images/clientprojects/audex-website/AUDEX.mp4',
    duration: '0:40',
    category: 'Audio',
    type: 'mp4',
    description: 'Professional audio streaming and editing platform'
  },
  {
    id: 13,
    title: 'Beauty Queen AI',
    src: '/images/clientprojects/beauty-queen-ai-com/BEAUTY-QUEEN.mp4',
    poster: '/images/clientprojects/beauty-queen-ai-com/BEAUTY-QUEEN.mp4',
    duration: '0:30',
    category: 'AI',
    type: 'mp4',
    description: 'AI-powered beauty consultation platform'
  },
  {
    id: 14,
    title: 'BSV API Platform',
    src: '/images/clientprojects/bsvapi-com/BSV_API.mp4',
    poster: '/images/clientprojects/bsvapi-com/BSV_API.mp4',
    duration: '0:45',
    category: 'API',
    type: 'mp4',
    description: 'Bitcoin SV blockchain API service'
  },
  {
    id: 15,
    title: 'CherryX',
    src: '/images/clientprojects/cherry-x/cherry-video-landscape-3.mp4',
    poster: '/images/clientprojects/cherry-x/cherry-video-landscape-3.mp4',
    duration: '0:35',
    category: 'NFT',
    type: 'mp4',
    description: 'CherryX collection showcase'
  },
  {
    id: 16,
    title: 'Course Kings Education',
    src: '/images/clientprojects/coursekings-website/COURSE-KINGS.mp4',
    poster: '/images/clientprojects/coursekings-website/COURSE-KINGS.mp4',
    duration: '0:40',
    category: 'Education',
    type: 'mp4',
    description: 'Premium online education platform'
  },
  {
    id: 17,
    title: 'Divvy Platform',
    src: '/images/clientprojects/divvy/divvy-video-1.mp4',
    poster: '/images/clientprojects/divvy/divvy-video-1.mp4',
    duration: '0:35',
    category: 'Finance',
    type: 'mp4',
    description: 'Divvy financial platform demo'
  },
  {
    id: 19,
    title: 'Metagraph App',
    src: '/images/clientprojects/metagraph-app/METAGRAPH.mp4',
    poster: '/images/clientprojects/metagraph-app/METAGRAPH.mp4',
    duration: '0:50',
    category: 'Analytics',
    type: 'mp4',
    description: 'Advanced data visualization platform'
  },
  {
    id: 20,
    title: 'Minecraft Party Website',
    src: '/images/clientprojects/minecraftparty-website/MINECRAFTPARTY.mp4',
    poster: '/images/clientprojects/minecraftparty-website/MINECRAFTPARTY.mp4',
    duration: '0:30',
    category: 'Website',
    type: 'mp4',
    description: 'Interactive Minecraft-themed party planning website'
  },
  {
    id: 21,
    title: 'Ninja Punk Girls Website',
    src: '/images/clientprojects/ninjapunkgirls-website/npg-website-slug-video.mp4',
    poster: '/images/clientprojects/ninjapunkgirls-website/npg-website-slug-video.mp4',
    duration: '0:45',
    category: 'NFT',
    type: 'mp4',
    description: 'NFT collection showcase website'
  },
  {
    id: 22,
    title: 'NPGX Token (Alternative)',
    src: '/images/clientprojects/npgx-website/NPGX.mp4',
    poster: '/images/clientprojects/npgx-website/NPGX.mp4',
    duration: '0:25',
    category: 'Crypto',
    type: 'mp4',
    description: 'NPGX token website showcase'
  },
  {
    id: 23,
    title: 'One Shot Comics',
    src: '/images/clientprojects/one-shot-comics/oneshotcomics.mp4',
    poster: '/images/clientprojects/one-shot-comics/oneshotcomics.mp4',
    duration: '0:35',
    category: 'Creative',
    type: 'mp4',
    description: 'Digital comics publishing platform'
  },
  {
    id: 24,
    title: 'Osinka Kalaso Art',
    src: '/images/clientprojects/osinka-kalaso/osinka-kalaso.mp4',
    poster: '/images/clientprojects/osinka-kalaso/osinka-kalaso.mp4',
    duration: '0:30',
    category: 'Art',
    type: 'mp4',
    description: 'Contemporary art gallery website'
  },
  {
    id: 25,
    title: 'VexVoid Creative Studio',
    src: '/images/clientprojects/vexvoid-com/VEXVOID.mp4',
    poster: '/images/clientprojects/vexvoid-com/VEXVOID.mp4',
    duration: '0:35',
    category: 'Creative',
    type: 'mp4',
    description: 'Dark artistic digital studio website'
  },
  {
    id: 26,
    title: 'NPGX Token Launch',
    src: '/videos/NPGX.mp4',
    poster: '/videos/NPGX.mp4',
    duration: '0:25',
    category: 'Crypto',
    type: 'mp4',
    description: 'Ninja Punk Girls token launch showcase'
  },
  {
    id: 27,
    title: 'Zero Dice Store - Demo 1',
    src: '/videos/zero-dice-02.mp4',
    poster: '/videos/zero-dice-02.mp4',
    duration: '0:30',
    category: 'Ecommerce',
    type: 'mp4',
    description: 'Zero Dice gaming store platform demo'
  },
  {
    id: 28,
    title: 'Zero Dice Store - Demo 2',
    src: '/videos/zero-dice-03.mp4',
    poster: '/videos/zero-dice-03.mp4',
    duration: '0:30',
    category: 'Ecommerce',
    type: 'mp4',
    description: 'Zero Dice store features showcase'
  },
  {
    id: 29,
    title: 'Zero Dice Store - Demo 3',
    src: '/videos/zero-dice-04.mp4',
    poster: '/videos/zero-dice-04.mp4',
    duration: '0:30',
    category: 'Ecommerce',
    type: 'mp4',
    description: 'Zero Dice interactive elements demo'
  },
  {
    id: 30,
    title: 'Zero Dice Store - Product Demo',
    src: '/videos/zero-dice-slug-video-01.mp4',
    poster: '/videos/zero-dice-slug-video-01.mp4',
    duration: '0:40',
    category: 'Ecommerce',
    type: 'mp4',
    description: 'Zero Dice product page showcase'
  },

  // Additional project videos
  {
    id: 31,
    title: 'AIVJ Platform',
    src: '/images/clientprojects/aivj/AIVJ-video.mp4',
    poster: '/images/clientprojects/aivj/AIVJ-video.mp4',
    duration: '0:30',
    category: 'AI',
    type: 'mp4',
    description: 'AI VJ visual performance platform'
  },
  {
    id: 32,
    title: 'Minecraft Party - AI Generated',
    src: '/images/clientprojects/minecraftparty-website/Standard_Mode_Generated_Video.mp4',
    poster: '/images/clientprojects/minecraftparty-website/Standard_Mode_Generated_Video.mp4',
    duration: '0:20',
    category: 'AI Generated',
    type: 'mp4',
    description: 'AI-generated Minecraft party video'
  },
  {
    id: 33,
    title: 'The Hustle Never Sleeps',
    src: '/music/The Hustle Never Sleeps.mp4',
    poster: '/music/The Hustle Never Sleeps.mp4',
    duration: '3:00',
    category: 'Music',
    type: 'mp4',
    description: 'Music video - The Hustle Never Sleeps'
  },
  {
    id: 34,
    title: 'Urban Train Scene',
    src: '/videos/A_train_rushes_past_while_urban_.mp4',
    poster: '/videos/A_train_rushes_past_while_urban_.mp4',
    duration: '0:15',
    category: 'AI Generated',
    type: 'mp4',
    description: 'AI-generated urban train scene'
  },
  {
    id: 35,
    title: 'Extended Video',
    src: '/videos/Extended_Video.mp4',
    poster: '/videos/Extended_Video.mp4',
    duration: '0:30',
    category: 'AI Generated',
    type: 'mp4',
    description: 'Extended AI-generated video'
  },
  {
    id: 36,
    title: 'Professional Mode - Generated',
    src: '/videos/Professional_Mode_Generated_Video (2).mp4',
    poster: '/videos/Professional_Mode_Generated_Video (2).mp4',
    duration: '0:20',
    category: 'AI Generated',
    type: 'mp4',
    description: 'AI-generated professional mode video'
  },
  {
    id: 37,
    title: 'Zoom & Flip Letters 1',
    src: '/videos/Professional_Mode_zoom_and_flip_the_letters____go_ (1).mp4',
    poster: '/videos/Professional_Mode_zoom_and_flip_the_letters____go_ (1).mp4',
    duration: '0:15',
    category: 'AI Generated',
    type: 'mp4',
    description: 'AI-generated zoom and flip letters animation'
  },
  {
    id: 38,
    title: 'Zoom & Flip Letters 2',
    src: '/videos/Professional_Mode_zoom_and_flip_the_letters____go_ (2).mp4',
    poster: '/videos/Professional_Mode_zoom_and_flip_the_letters____go_ (2).mp4',
    duration: '0:15',
    category: 'AI Generated',
    type: 'mp4',
    description: 'AI-generated zoom and flip letters animation variant'
  },
  {
    id: 39,
    title: 'Standard Mode - Generated',
    src: '/videos/Standard_Mode_Generated_Video.mp4',
    poster: '/videos/Standard_Mode_Generated_Video.mp4',
    duration: '0:20',
    category: 'AI Generated',
    type: 'mp4',
    description: 'AI-generated standard mode video'
  },
  {
    id: 40,
    title: 'Fade Letters Animation',
    src: '/videos/fade_the_letters_so_see_the_sing.mp4',
    poster: '/videos/fade_the_letters_so_see_the_sing.mp4',
    duration: '0:15',
    category: 'AI Generated',
    type: 'mp4',
    description: 'AI-generated fading letters animation'
  },
  {
    id: 41,
    title: 'NPG Red Slug',
    src: '/videos/npg-red-slug.mp4',
    poster: '/videos/npg-red-slug.mp4',
    duration: '0:25',
    category: 'NFT',
    type: 'mp4',
    description: 'Ninja Punk Girls red themed showcase'
  },
  {
    id: 42,
    title: 'Osinka Kalaso - Alternative',
    src: '/videos/osinka-kalaso-video.mp4',
    poster: '/videos/osinka-kalaso-video.mp4',
    duration: '0:30',
    category: 'Art',
    type: 'mp4',
    description: 'Osinka Kalaso alternative art video'
  },
  {
    id: 43,
    title: 'Zoom Party Picnic',
    src: '/videos/zoom_around_the_party_picnic_and.mp4',
    poster: '/videos/zoom_around_the_party_picnic_and.mp4',
    duration: '0:20',
    category: 'AI Generated',
    type: 'mp4',
    description: 'AI-generated party picnic zoom animation'
  },

  // Hyperflix AI-Generated Videos
  {
    id: 44,
    title: 'Hyperflix AI Video 1',
    src: '/videos/hyperflix/grok-video-05a31896-d339-4f5d-aa88-568a6277f380.mp4',
    poster: '/videos/hyperflix/grok-video-05a31896-d339-4f5d-aa88-568a6277f380.mp4',
    duration: '0:10',
    category: 'Hyperflix',
    type: 'mp4',
    description: 'AI-generated Hyperflix video'
  },
  {
    id: 45,
    title: 'Hyperflix AI Video 2',
    src: '/videos/hyperflix/grok-video-0ef81ad6-d2e3-4fbc-b30e-0013aeb2e543.mp4',
    poster: '/videos/hyperflix/grok-video-0ef81ad6-d2e3-4fbc-b30e-0013aeb2e543.mp4',
    duration: '0:10',
    category: 'Hyperflix',
    type: 'mp4',
    description: 'AI-generated Hyperflix video'
  },
  {
    id: 46,
    title: 'Hyperflix AI Video 3',
    src: '/videos/hyperflix/grok-video-254101d4-e7aa-4d4e-8f73-492a738c874c.mp4',
    poster: '/videos/hyperflix/grok-video-254101d4-e7aa-4d4e-8f73-492a738c874c.mp4',
    duration: '0:10',
    category: 'Hyperflix',
    type: 'mp4',
    description: 'AI-generated Hyperflix video'
  },
  {
    id: 47,
    title: 'Hyperflix AI Video 4',
    src: '/videos/hyperflix/grok-video-340447a1-f2b1-4bcb-9859-bdcff11ad6f6.mp4',
    poster: '/videos/hyperflix/grok-video-340447a1-f2b1-4bcb-9859-bdcff11ad6f6.mp4',
    duration: '0:10',
    category: 'Hyperflix',
    type: 'mp4',
    description: 'AI-generated Hyperflix video'
  },
  {
    id: 48,
    title: 'Hyperflix AI Video 5',
    src: '/videos/hyperflix/grok-video-465b2077-f3ea-46dc-afa3-323972697d45.mp4',
    poster: '/videos/hyperflix/grok-video-465b2077-f3ea-46dc-afa3-323972697d45.mp4',
    duration: '0:10',
    category: 'Hyperflix',
    type: 'mp4',
    description: 'AI-generated Hyperflix video'
  },
  {
    id: 49,
    title: 'Hyperflix AI Video 6',
    src: '/videos/hyperflix/grok-video-8fa11fd0-282b-4c84-bdbb-0b8408ab8686.mp4',
    poster: '/videos/hyperflix/grok-video-8fa11fd0-282b-4c84-bdbb-0b8408ab8686.mp4',
    duration: '0:10',
    category: 'Hyperflix',
    type: 'mp4',
    description: 'AI-generated Hyperflix video'
  },
  {
    id: 50,
    title: 'Hyperflix AI Video 7',
    src: '/videos/hyperflix/grok-video-9a5c1521-ae7b-470c-a078-f3b748a7f955.mp4',
    poster: '/videos/hyperflix/grok-video-9a5c1521-ae7b-470c-a078-f3b748a7f955.mp4',
    duration: '0:10',
    category: 'Hyperflix',
    type: 'mp4',
    description: 'AI-generated Hyperflix video'
  },
  {
    id: 51,
    title: 'Hyperflix AI Video 8',
    src: '/videos/hyperflix/grok-video-a8aafe46-effa-49b3-b7da-225ef9de4f74.mp4',
    poster: '/videos/hyperflix/grok-video-a8aafe46-effa-49b3-b7da-225ef9de4f74.mp4',
    duration: '0:10',
    category: 'Hyperflix',
    type: 'mp4',
    description: 'AI-generated Hyperflix video'
  },
  {
    id: 52,
    title: 'Hyperflix AI Video 9',
    src: '/videos/hyperflix/grok-video-cc1d1599-8b8c-40ea-91ca-a215a462402d.mp4',
    poster: '/videos/hyperflix/grok-video-cc1d1599-8b8c-40ea-91ca-a215a462402d.mp4',
    duration: '0:10',
    category: 'Hyperflix',
    type: 'mp4',
    description: 'AI-generated Hyperflix video'
  },
  {
    id: 53,
    title: 'Hyperflix AI Video 10',
    src: '/videos/hyperflix/grok-video-d24819c0-4542-4229-b606-3522c98cad23.mp4',
    poster: '/videos/hyperflix/grok-video-d24819c0-4542-4229-b606-3522c98cad23.mp4',
    duration: '0:10',
    category: 'Hyperflix',
    type: 'mp4',
    description: 'AI-generated Hyperflix video'
  }
];

export default function VideoPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedVideo, setSelectedVideo] = useState(videos[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [verifiedVideos, setVerifiedVideos] = useState<Set<number>>(new Set());
  const [isVerifying, setIsVerifying] = useState(true);

  // Auto-stop music when video page loads
  const { setIsPlaying: setMusicPlaying, audioRef } = usePersistentMusic();

  useEffect(() => {
    // Stop music when video page loads
    setMusicPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [setMusicPlaying, audioRef]);

  // Verify which videos actually exist/load
  useEffect(() => {
    const verifyVideos = async () => {
      const verified = new Set<number>();

      // YouTube videos are always verified (they use external thumbnails)
      videos.forEach(video => {
        if (video.type === 'youtube') {
          verified.add(video.id);
        }
      });

      // Check MP4 videos by attempting to fetch headers
      const mp4Videos = videos.filter(v => v.type === 'mp4');

      await Promise.all(
        mp4Videos.map(async (video) => {
          try {
            const response = await fetch(encodeURI(video.src || ""), { method: 'HEAD' });
            if (response.ok) {
              verified.add(video.id);
            }
          } catch {
            // Video doesn't exist or can't be loaded
            console.log(`Video not found: ${video.title}`);
          }
        })
      );

      setVerifiedVideos(verified);
      setIsVerifying(false);

      // Update selected video if current one isn't verified
      if (!verified.has(selectedVideo.id)) {
        const firstVerified = videos.find(v => verified.has(v.id));
        if (firstVerified) {
          setSelectedVideo(firstVerified);
        }
      }
    };

    verifyVideos();
  }, []);

  const categories = ['All', ...new Set(videos.filter(v => verifiedVideos.has(v.id)).map(v => v.category))];
  const filteredVideos = (selectedCategory === 'All'
    ? videos
    : videos.filter(v => v.category === selectedCategory)
  ).filter(v => verifiedVideos.has(v.id));

  return (
    <motion.div
      className="min-h-screen bg-black text-white selection:bg-white selection:text-black relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Main Content */}
      <motion.section
        className="px-4 md:px-8 py-16 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="w-full">
          {/* Page Title */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
              <div className="bg-gray-900/50 p-4 md:p-6 border border-gray-800 self-start">
                <FiVideo className="text-4xl md:text-6xl text-white" />
              </div>
              <div className="flex items-end gap-4">
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">VIDEO</h1>
                <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                  CONTENT
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-4 mt-8 flex-wrap">
              <Link
                href="/video"
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
              >
                <FiVideo size={20} className="group-hover:scale-110 transition-transform" />
                <span className="font-medium">Video Hub</span>
              </Link>
              <span className="text-zinc-600">/</span>
              <div className="flex items-center gap-2 text-white">
                <FiGrid size={20} />
                <span className="font-medium">Library</span>
              </div>
              <span className="text-zinc-600">/</span>
              <Link
                href="/video/editor"
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
              >
                <FiEdit3 size={20} className="group-hover:scale-110 transition-transform" />
                <span className="font-medium">Chaos Mixer</span>
              </Link>
              <span className="text-zinc-600">/</span>
              <Link
                href="/video/editor/studio"
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
              >
                <FiFilm size={20} className="group-hover:scale-110 transition-transform" />
                <span className="font-medium">Studio</span>
              </Link>
            </div>
          </motion.div>

          {/* Video Services CTA */}
          <div className="mb-12 border border-zinc-800 p-6 bg-zinc-900/30">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-2 uppercase tracking-tight">Video Production Services</h2>
                <p className="text-zinc-400 max-w-xl">
                  Professional video editing, motion graphics, and AI-generated video content.
                  Promo videos, social clips, explainers, and more.
                </p>
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">£200</span>
                    <span className="text-zinc-500 text-sm">per video</span>
                  </div>
                  <div className="text-zinc-600">|</div>
                  <div className="text-zinc-400 text-sm">
                    60s promo • Motion graphics • Color grading • Music
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <Link
                  href="/offers/video"
                  className="px-6 py-3 border border-zinc-700 text-zinc-300 text-xs font-bold uppercase tracking-widest hover:border-white hover:text-white transition-colors whitespace-nowrap"
                >
                  View Offer
                </Link>
                <Link
                  href="/contact"
                  className="px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors whitespace-nowrap"
                >
                  Get Quote
                </Link>
              </div>
            </div>
          </div>

          {/* Main Video Player - Constrained Width to prevent pixellation */}
          <div className="mb-16">
            <div className="max-w-5xl mx-auto">
              <div className="bg-zinc-900 overflow-hidden shadow-2xl border border-zinc-800">
                <div className="aspect-video relative bg-black">
                  {selectedVideo.type === 'youtube' ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${selectedVideo.embedId}${selectedVideo.startTime ? `?start=${selectedVideo.startTime}` : ''}${isPlaying ? '&autoplay=1' : ''}`}
                      title={selectedVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                      onLoad={() => setIsPlaying(true)}
                    />
                  ) : (
                    <video
                      key={selectedVideo.id}
                      className="absolute inset-0 w-full h-full object-contain"
                      controls
                      autoPlay={isPlaying}
                      loop
                      muted
                      poster={selectedVideo.poster ? encodeURI(selectedVideo.poster) : undefined}
                      preload="metadata"
                      onError={() => console.error('Error loading video:', selectedVideo.src)}
                      onLoadStart={() => console.log('Loading video:', selectedVideo.src)}
                    >
                      <source src={encodeURI(selectedVideo.src || '')} type="video/mp4" />
                      <p className="text-white p-4">
                        Your browser does not support the video tag or the video failed to load.
                        <br />
                        <a href={selectedVideo.src} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                          Try opening the video directly
                        </a>
                      </p>
                    </video>
                  )}
                </div>

                {/* Video Info */}
                <div className="p-6 bg-zinc-950">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2 text-white">{selectedVideo.title}</h2>
                      {selectedVideo.description && (
                        <p className="text-zinc-400 mb-3">{selectedVideo.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-zinc-500">
                        <span className="px-3 py-1 bg-zinc-900 border border-zinc-800">
                          {selectedVideo.category}
                        </span>
                        <span>{selectedVideo.duration}</span>
                        <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-xs">
                          {selectedVideo.type?.toUpperCase()}
                        </span>
                        {selectedVideo.url && (
                          <a
                            href={selectedVideo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-white transition-colors"
                          >
                            Watch on YouTube <FiExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const elem = document.querySelector('.aspect-video');
                        if (elem?.requestFullscreen) {
                          elem.requestFullscreen();
                        }
                      }}
                      className="p-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
                      title="Fullscreen"
                    >
                      <FiMaximize size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs uppercase tracking-wider font-bold border transition-all ${selectedCategory === cat
                  ? 'bg-white text-black border-white'
                  : 'bg-black text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-white'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Video Count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">
              {isVerifying ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border border-zinc-500 border-t-white rounded-full animate-spin"></span>
                  Checking videos...
                </span>
              ) : (
                `${filteredVideos.length} videos`
              )}
            </p>
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map(video => (
              <button
                key={video.id}
                onClick={() => {
                  setSelectedVideo(video);
                  setIsPlaying(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`group text-left block w-full transition-all duration-300 ${selectedVideo.id === video.id ? 'opacity-50' : 'hover:-translate-y-1'
                  }`}
              >
                <div className="relative bg-zinc-900 overflow-hidden aspect-video border border-zinc-800 group-hover:border-zinc-600">
                  {/* Video Thumbnail */}
                  {video.type === 'youtube' ? (
                    <img
                      src={`https://img.youtube.com/vi/${video.embedId}/mqdefault.jpg`}
                      alt={video.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <video
                      src={encodeURI(video.src || "")}
                      className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      muted
                      playsInline
                      preload="metadata"
                      onLoadedData={(e) => {
                        // Seek to 1 second to get a better thumbnail frame
                        const vid = e.currentTarget;
                        if (vid.duration > 1) {
                          vid.currentTime = 1;
                        }
                      }}
                      onError={(e) => {
                        // Show fallback on error
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          e.currentTarget.style.display = 'none';
                        }
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                  {/* Play Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/10 backdrop-blur-sm rounded-full p-3 border border-white/20">
                      <FiPlay size={20} className="text-white" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 bg-black/80 border border-white/10 px-2 py-0.5 rounded text-[10px] font-mono">
                    {video.duration}
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm border border-white/10 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                    {video.category}
                  </div>

                  {/* Selected Indicator */}
                  {selectedVideo.id === video.id && (
                    <div className="absolute top-2 right-2 bg-white text-black px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider">
                      Playing
                    </div>
                  )}
                </div>

                <h3 className="mt-3 font-bold text-sm text-zinc-300 group-hover:text-white transition-colors line-clamp-1">
                  {video.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">{video.category}</span>
                </div>
              </button>
            ))}
          </div>

          {filteredVideos.length === 0 && (
            <div className="text-center py-20 border border-dashed border-zinc-900">
              {isVerifying ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin"></div>
                  <p className="text-zinc-500">Loading videos...</p>
                </div>
              ) : (
                <p className="text-zinc-500">No videos in this category</p>
              )}
            </div>
          )}
        </div>
      </motion.section>
    </motion.div>
  );
}