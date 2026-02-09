'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useRef, useCallback } from 'react';

interface FNewsToken {
  token_id: string;
  name: string;
  description: string;
  base_price_sats: number;
  image: string;
  video: string;
}

const R2 = 'https://pub-fee9eb6b685a48f2aa263c104838ce5e.r2.dev';
const R2_VIDEOS = `${R2}/videos`;
const R2_IMAGES = `${R2}/images`;

const SAMPLE_SATIRE_TOKENS: FNewsToken[] = [
  {
    token_id: '402_BONES',
    name: 'ALEX BONES',
    description: 'THE JEPSTEIN FILES: GLOBALIST PLOT REVEALED. "THEY ARE TURNING THE FRIGGIN\' FROGS GAY!" EXCLUSIVE REVEAL OF INTERDIMENSIONAL VAMPIRE SECRETS.',
    base_price_sats: 420,
    image: `${R2_IMAGES}/alex_bones.png`,
    video: `${R2_VIDEOS}/alex_bones.mp4`
  },
  {
    token_id: '402_CARLSBERG',
    name: 'FUCKER CARLSBERG',
    description: 'CONFUSION GRIPS THE NATION. WHY IS THE GREEN M&M NO LONGER SEXY? JUST ASKING QUESTIONS. THE WOKE MOB DOESN\'T WANT YOU TO KNOW.',
    base_price_sats: 69,
    image: `${R2_IMAGES}/fucker_carlsberg.png`,
    video: `${R2_VIDEOS}/fucker_carlsberg.mp4`
  },
  {
    token_id: '402_HOENS',
    name: 'CANDY HOENS',
    description: 'THE TRUTH HURTS. FACTS DON\'T CARE ABOUT YOUR FEELINGS, BUT I DO CARE ABOUT EXPOSING THE LIES OF THE MAINSTREAM NARRATIVE. DEBATE ME.',
    base_price_sats: 88,
    image: `${R2_IMAGES}/candy_hoens.png`,
    video: `${R2_VIDEOS}/candy_hoens.mp4`
  },
  {
    token_id: '402_FLUENZA',
    name: 'DICK FLUENZA',
    description: 'AMERICA FIRST... TO THE BASEMENT. CATCH THE FLU. YEAH, WE\'RE GOING THERE. UNFILTERED, UNHINGED, AND UNDERGROUND.',
    base_price_sats: 14,
    image: `${R2_IMAGES}/dick_fluenza.png`,
    video: `${R2_VIDEOS}/dick_fluenza.mp4`
  },
  {
    token_id: '402_SMIRK',
    name: 'CHARLIE SMIRK',
    description: 'PROVE ME WRONG. IF SOCIALISM IS SO GOOD, WHY IS MY FACE SO SMALL? TURNING POINT USA? MORE LIKE TURNING POINT WHO CARES.',
    base_price_sats: 10,
    image: `${R2_IMAGES}/charlie_smirk.png`,
    video: `${R2_VIDEOS}/charlie_smirk.mp4`
  },
  {
    token_id: '402_KWEG',
    name: 'THE ADVENTURES OF KWEG WONG ESQ.',
    description: 'He\'s always trying to pretend to be Satoshi, and going to conferences to give lectures on "scientific" papers he just made up.',
    base_price_sats: 21,
    image: `${R2_IMAGES}/kweg_adventures.png`,
    video: `${R2_VIDEOS}/kweg-wong-2.mp4`
  },
  {
    token_id: '402_FAYLOOR',
    name: 'MICHAEL FAYLOOR',
    description: 'THE SELF-PROCLAIMED GENIUS WHO LEVERAGED HIS ENTIRE NET WORTH INTO BITCOIN AT THE TOP. "I AM NEVER WRONG." NARRATOR: HE WAS WRONG.',
    base_price_sats: 42,
    image: `${R2_IMAGES}/alex_bones.png`,
    video: `${R2_VIDEOS}/michael-fayloor.mp4`
  },
];

function FNewsCard({ token }: { token: FNewsToken }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const PREVIEW_LIMIT = 5;

  const handlePreview = useCallback(() => {
    setShowVideo(true);
    setIsPlaying(true);
    setPreviewTime(0);
  }, []);

  const handleVideoTimeUpdate = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    setPreviewTime(vid.currentTime);
    if (!isUnlocked && vid.currentTime >= PREVIEW_LIMIT) {
      vid.pause();
      setIsPlaying(false);
    }
  }, [isUnlocked]);

  const handleVideoLoaded = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.currentTime = 0;
    vid.muted = !isUnlocked;
    vid.play().catch(() => {});
  }, [isUnlocked]);

  const handleUnlock = useCallback(() => {
    setStatus('DOWNLOADING...');
    setTimeout(() => {
      setIsUnlocked(true);
      setShowVideo(true);
      setStatus('SEEDING (RATIO 0.0)');
      const vid = videoRef.current;
      if (vid) {
        vid.muted = false;
        vid.currentTime = 0;
        vid.play().catch(() => {});
        setIsPlaying(true);
      }
    }, 2000);
  }, []);

  const handlePlayFull = useCallback(() => {
    setShowVideo(true);
    setIsPlaying(true);
    const vid = videoRef.current;
    if (vid) {
      vid.muted = false;
      vid.currentTime = 0;
      vid.play().catch(() => {});
    }
  }, []);

  const previewPct = isUnlocked
    ? (videoRef.current ? (previewTime / (videoRef.current.duration || 1)) * 100 : 0)
    : (previewTime / PREVIEW_LIMIT) * 100;

  return (
    <div className="group border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-black dark:hover:border-white transition-colors relative">
      {status && (
        <div className="absolute top-0 left-0 z-20 bg-green-500 text-black px-2 py-0.5 text-[10px] font-bold font-mono uppercase tracking-widest">
          {status}
        </div>
      )}

      <div className="aspect-video bg-zinc-100 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-center relative overflow-hidden">
        {token.image && !showVideo && (
          <img
            src={token.image}
            alt={token.name}
            className={`w-full h-full object-cover transition-all duration-500 ${isUnlocked ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`}
          />
        )}

        {showVideo && (
          <video
            ref={videoRef}
            src={token.video}
            poster={token.image}
            className="w-full h-full object-cover"
            playsInline
            onTimeUpdate={handleVideoTimeUpdate}
            onLoadedData={handleVideoLoaded}
            onEnded={() => setIsPlaying(false)}
          />
        )}

        {!token.image && !showVideo && (
          <span className="text-zinc-300 dark:text-zinc-800 font-mono text-4xl font-bold">?</span>
        )}

        {isPlaying && showVideo && (
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <div className="h-1 bg-zinc-800/50">
              <div className="h-full bg-red-500 transition-all duration-100 ease-linear" style={{ width: `${Math.min(previewPct, 100)}%` }} />
            </div>
            {!isUnlocked && (
              <div className="absolute bottom-2 left-0 right-0 text-center">
                <span className="bg-black/70 text-red-500 font-mono text-[9px] font-bold px-2 py-0.5">
                  PREVIEW {previewTime.toFixed(1)}s / {PREVIEW_LIMIT}s
                </span>
              </div>
            )}
          </div>
        )}

        {!isPlaying && showVideo && !isUnlocked && previewTime >= PREVIEW_LIMIT && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10">
            <div className="text-red-500 font-mono text-[10px] font-bold uppercase tracking-widest mb-2">Preview ended</div>
            <div className="text-zinc-500 font-mono text-[9px]">Buy ticket to watch full clip</div>
          </div>
        )}

        {!isUnlocked && !showVideo && (
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
        )}

        <div className="absolute top-0 right-0 bg-black dark:bg-white text-white dark:text-black px-3 py-1 font-mono text-xs font-bold z-20">
          {token.base_price_sats} SAT
        </div>

        <div className="absolute bottom-0 left-0 bg-red-600 text-white px-2 py-0.5 text-[8px] font-bold font-mono uppercase tracking-widest z-20">
          F.NEWS
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h3 className="font-bold text-lg tracking-tight uppercase">{token.name}</h3>
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{token.token_id}</div>
        </div>
        <p className="text-xs text-zinc-500 font-mono h-12 leading-relaxed line-clamp-3">
          {token.description}
        </p>
        <div className="pt-4 flex items-center gap-0 border-t border-zinc-100 dark:border-zinc-900">
          {!isUnlocked ? (
            <>
              <button
                onClick={handlePreview}
                disabled={isPlaying}
                className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white text-[10px] font-bold uppercase tracking-widest transition-all border-r border-zinc-200 dark:border-zinc-800 disabled:opacity-50"
              >
                {isPlaying ? 'WATCHING...' : previewTime >= PREVIEW_LIMIT ? 'PREVIEW ENDED' : 'WATCH PREVIEW'}
              </button>
              <button
                onClick={handleUnlock}
                className="flex-1 py-3 bg-black text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                BUY TICKET
              </button>
            </>
          ) : (
            <button
              onClick={handlePlayFull}
              className="w-full py-3 bg-green-500 text-black font-bold uppercase tracking-widest text-[10px]"
            >
              {isPlaying ? 'NOW PLAYING' : 'PLAY FULL CLIP'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MarketPage() {
  const [activeTab, setActiveTab] = useState('All Assets');
  const isFNews = activeTab === 'F.NEWS';
  const isAllAssets = activeTab === 'All Assets';
  const showFNews = isFNews || isAllAssets;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-mono">
      <main className="w-full px-4 md:px-8 py-16 max-w-[1920px] mx-auto">
        {/* PageHeader */}
        <header className="mb-8 border-b border-zinc-200 dark:border-zinc-900 pb-6 flex items-end justify-between overflow-hidden relative">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 mb-4 text-zinc-500 text-xs tracking-widest uppercase"
            >
              <span className={`w-2 h-2 ${isFNews ? 'bg-red-600' : 'bg-green-500'} rounded-full animate-pulse`} />
              {isFNews ? 'Unverified / Synthetic / Satire' : 'Global Index / Gossip Network'}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl md:text-6xl font-black tracking-tighter mb-2"
            >
              {isFNews ? 'F.NEWS' : 'MARKET'}<span className="text-zinc-300 dark:text-zinc-800">{isFNews ? '.ONLINE' : '.SYS'}</span>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-zinc-500 max-w-lg"
            >
              {isFNews
                ? <><b>Synthetic Media Marketplace.</b> User-generated satirical deepfakes. Preview for free, buy ticket to unlock &amp; seed.</>
                : <><b>Global Content Index.</b> Discover and acquire access tokens propagated through the gossip protocol.</>
              }
            </motion.div>
          </div>
          {isFNews && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden md:flex relative w-48 h-48 border-4 border-red-600/50 rounded-full items-center justify-center -rotate-12"
            >
              <div className="absolute inset-0 rounded-full border border-red-600/20 m-1" />
              <div className="text-center p-2">
                <div className="text-red-600 font-bold uppercase tracking-widest text-xs mb-1">Content Warning</div>
                <div className="text-red-800/60 dark:text-red-200/60 text-[8px] font-mono leading-tight px-4 uppercase">
                  All content in F.NEWS is AI-generated satire. No humans were harmed (or interviewed).
                </div>
                <div className="text-red-600 font-bold uppercase tracking-widest text-[8px] mt-2">Reality Check Required</div>
              </div>
            </motion.div>
          )}
          {!isFNews && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 0.1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "backOut" }}
              className="hidden md:block text-6xl"
            >
              📡
            </motion.div>
          )}
        </header>

        {/* Categories - Industrial Tabs */}
        <section className="mb-12">
          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 border-b border-zinc-200 dark:border-zinc-900 pb-2">
            Asset Class
          </div>
          <div className="flex flex-wrap gap-0 bg-zinc-100 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800">
            {['All Assets', 'F.NEWS', 'Video Streams', 'API Endpoints', 'Knowledge Bases', 'Scientific Data'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-6 py-3 text-[10px] uppercase tracking-[0.2em] font-mono font-bold transition-all border-r border-zinc-200 dark:border-zinc-800 last:border-r-0 hover:bg-white dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white ${activeTab === cat
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'text-zinc-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Results Grid */}
        <section>
          {showFNews && (
            <>
              {isAllAssets && (
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                  F.NEWS — {SAMPLE_SATIRE_TOKENS.length} clips
                </div>
              )}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {SAMPLE_SATIRE_TOKENS.map((token) => (
                  <FNewsCard key={token.token_id} token={token} />
                ))}
              </div>
            </>
          )}

          {!isFNews && !isAllAssets && (
            <div className="border border-dashed border-zinc-300 dark:border-zinc-800 py-24 text-center bg-zinc-50 dark:bg-zinc-900/20">
              <div className="text-4xl mb-6 opacity-20">📡</div>
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-2">No Tokens Indexed</h3>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto font-mono mb-6">
                Connect to more peers or wait for gossip announcements to populate the index.
              </p>
              <Link
                href="/download"
                className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-xs hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
              >
                Download Client to Connect
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
