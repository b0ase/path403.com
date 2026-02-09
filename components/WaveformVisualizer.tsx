'use client';

import { useEffect, useRef } from 'react';
import { usePersistentMusic } from '@/hooks/usePersistentMusic';

export default function WaveformVisualizer({ isDark }: { isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { audioData, isAnalyzing } = usePersistentMusic();
  const animationRef = useRef<number>();
  // Use ref to read audioData in animation loop without causing effect churn
  const audioDataRef = useRef(audioData);
  const isDarkRef = useRef(isDark);
  audioDataRef.current = audioData;
  isDarkRef.current = isDark;

  useEffect(() => {
    if (!canvasRef.current || !isAnalyzing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 120;
    canvas.height = 40;

    const bars = 20;
    const barWidth = canvas.width / bars;
    const barSpacing = 1;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Read from ref to avoid stale closures without needing dep array
      const data = audioDataRef.current;
      const dark = isDarkRef.current;

      // Get frequency data if available
      const bassInfluence = data?.bassNorm || 0;
      const midsInfluence = data?.midsNorm || 0;
      const highsInfluence = data?.rightsNorm || 0;

      // Draw waveform bars
      for (let i = 0; i < bars; i++) {
        // Different frequency ranges for each bar
        let audioLevel = 0;
        const position = i / bars;

        if (position < 0.3) {
          audioLevel = bassInfluence * (1 - position * 2) + Math.random() * 0.1;
        } else if (position < 0.7) {
          audioLevel = midsInfluence * (1 - Math.abs(position - 0.5) * 4) + Math.random() * 0.1;
        } else {
          audioLevel = highsInfluence * ((position - 0.7) * 3) + Math.random() * 0.1;
        }

        const timeWave = Math.sin(Date.now() * 0.001 + i * 0.5) * 0.1 + 0.9;
        audioLevel = audioLevel * timeWave;

        const barHeight = Math.max(4, Math.min(canvas.height - 4, audioLevel * canvas.height * 0.8));

        const x = i * barWidth + barSpacing;
        const y = (canvas.height - barHeight) / 2;

        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        if (dark) {
          gradient.addColorStop(0, `rgba(74, 222, 128, ${0.4 + audioLevel * 0.6})`);
          gradient.addColorStop(1, `rgba(34, 197, 94, ${0.4 + audioLevel * 0.6})`);
        } else {
          gradient.addColorStop(0, `rgba(34, 197, 94, ${0.4 + audioLevel * 0.6})`);
          gradient.addColorStop(1, `rgba(21, 128, 61, ${0.4 + audioLevel * 0.6})`);
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth - barSpacing * 2, barHeight);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnalyzing]); // Only restart loop when analyzing starts/stops

  if (!isAnalyzing) return null;

  return (
    <canvas
      ref={canvasRef}
      className="h-10 w-30"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}