'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface KintsugiHeroProps {
  imageSrc?: string;
  videoSrc?: string;
  alt?: string;
}

export function KintsugiHero({
  imageSrc = '/images/blog/kintsugi-bowl.jpg',
  videoSrc = '/videos/kintsugi-bowl.mp4',
  alt = 'Kintsugi bowl - broken pottery repaired with gold',
}: KintsugiHeroProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Load and play video when in view
  useEffect(() => {
    if (isInView && videoRef.current) {
      videoRef.current.load();
    }
  }, [isInView]);

  const handleVideoLoaded = () => {
    setIsVideoLoaded(true);
    // Start playing after a brief delay to show the image first
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().then(() => {
          setIsVideoPlaying(true);
        }).catch(() => {
          // Autoplay might be blocked, that's okay
        });
      }
    }, 500);
  };

  return (
    <div
      ref={containerRef}
      className="w-full mb-6 md:float-right md:ml-6 md:mb-4 md:w-80"
    >
      {/* Image/Video Container */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
        {/* Static Image (shows first, fades out when video plays) */}
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            isVideoPlaying ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <Image
            src={imageSrc}
            alt={alt}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 448px"
          />
        </div>

        {/* Video (lazy loaded, fades in when ready) */}
        {isInView && (
          <video
            ref={videoRef}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              isVideoPlaying ? 'opacity-100' : 'opacity-0'
            }`}
            loop
            muted
            playsInline
            onLoadedData={handleVideoLoaded}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        )}

        {/* Subtle overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Caption - below image */}
      <p className="text-zinc-400 text-sm font-light tracking-wide text-center mt-3">
        金継ぎ — The art of precious scars
      </p>
    </div>
  );
}

export default KintsugiHero;
