'use client';

import { useRef, useEffect, useCallback } from 'react';

interface VideoPreviewProps {
  src: string;
  isPlaying: boolean;
  className?: string;
}

export function VideoPreview({ src, isPlaying, className = '' }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const directionRef = useRef<1 | -1>(1);
  const rafRef = useRef<number>(0);
  const lastTsRef = useRef<number>(0);

  const stepBackward = useCallback((timestamp: number) => {
    const video = videoRef.current;
    if (!video || directionRef.current !== -1) return;

    if (lastTsRef.current > 0) {
      const delta = (timestamp - lastTsRef.current) / 1000;
      video.currentTime = Math.max(0, video.currentTime - delta);
    }
    lastTsRef.current = timestamp;

    if (video.currentTime <= 0.05) {
      directionRef.current = 1;
      lastTsRef.current = 0;
      video.currentTime = 0;
      video.play().catch(() => {});
      return;
    }
    rafRef.current = requestAnimationFrame(stepBackward);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onEnded = () => {
      directionRef.current = -1;
      video.pause();
      lastTsRef.current = 0;
      rafRef.current = requestAnimationFrame(stepBackward);
    };

    video.addEventListener('ended', onEnded);
    return () => {
      video.removeEventListener('ended', onEnded);
      cancelAnimationFrame(rafRef.current);
    };
  }, [stepBackward]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      directionRef.current = 1;
      cancelAnimationFrame(rafRef.current);
      lastTsRef.current = 0;
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
      directionRef.current = 1;
      cancelAnimationFrame(rafRef.current);
      lastTsRef.current = 0;
    }
  }, [isPlaying]);

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      playsInline
      preload="metadata"
      className={className}
    />
  );
}
