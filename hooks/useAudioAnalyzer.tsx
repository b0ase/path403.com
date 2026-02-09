'use client';

import { useEffect, useRef, useCallback } from 'react';

export interface AudioData {
  bass: number;        // 0-255, low frequencies (bass/kick drums)
  mids: number;        // 0-255, mid frequencies (vocals/instruments)
  highs: number;       // 0-255, high frequencies (cymbals/effects)
  overall: number;     // 0-255, overall volume
  bassNorm: number;    // 0-1, normalized bass
  midsNorm: number;    // 0-1, normalized mids
  rightsNorm: number;  // 0-1, normalized highs
  overallNorm: number; // 0-1, normalized overall
}

const DEFAULT_AUDIO_DATA: AudioData = {
  bass: 0, mids: 0, highs: 0, overall: 0,
  bassNorm: 0, midsNorm: 0, rightsNorm: 0, overallNorm: 0,
};

// Singleton AudioContext and source to avoid re-creating per render cycle
let sharedAudioContext: AudioContext | null = null;
let sharedSource: MediaElementAudioSourceNode | null = null;
let sharedSourceElement: HTMLAudioElement | null = null;

export function useAudioAnalyzer(audioElement: HTMLAudioElement | null, isEnabled: boolean = true) {
  // Use a mutable ref for audio data instead of state to avoid re-render cascade.
  // Consumers read this via ref (WaveformVisualizer uses audioDataRef).
  const audioDataRef = useRef<AudioData>(DEFAULT_AUDIO_DATA);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isAnalyzingRef = useRef(false);

  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    isAnalyzingRef.current = false;
    analyzerRef.current = null;
    dataArrayRef.current = null;
  }, []);

  // Initialize audio context and analyzer
  useEffect(() => {
    if (!audioElement || !isEnabled) {
      cleanup();
      return;
    }

    const initializeAudio = async () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;

        // Reuse or create AudioContext
        if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
          sharedAudioContext = new AudioContextClass();
        }

        const audioContext = sharedAudioContext;

        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        // Create analyzer
        const analyzer = audioContext.createAnalyser();
        analyzer.fftSize = 256;
        analyzer.smoothingTimeConstant = 0.8;
        analyzerRef.current = analyzer;

        // Create source only once per audio element
        if (!sharedSource || sharedSourceElement !== audioElement) {
          try {
            sharedSource = audioContext.createMediaElementSource(audioElement);
            sharedSourceElement = audioElement;
          } catch {
            // Already connected - reuse existing source
          }
        }

        if (sharedSource) {
          sharedSource.connect(analyzer);
          analyzer.connect(audioContext.destination);
        }

        const bufferLength = analyzer.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);

        // Start analysis loop
        isAnalyzingRef.current = true;

        const analyze = () => {
          if (!analyzerRef.current || !dataArrayRef.current) return;

          analyzerRef.current.getByteFrequencyData(dataArrayRef.current as Uint8Array<ArrayBuffer>);

          const dataArray = dataArrayRef.current;
          const length = dataArray.length;

          const bassEnd = Math.floor(length * 0.1);
          const midsEnd = Math.floor(length * 0.4);

          let bassSum = 0, midsSum = 0, rightsSum = 0, totalSum = 0;

          for (let i = 0; i < length; i++) {
            const value = dataArray[i];
            totalSum += value;
            if (i < bassEnd) bassSum += value;
            else if (i < midsEnd) midsSum += value;
            else rightsSum += value;
          }

          const bass = bassSum / bassEnd;
          const mids = midsSum / (midsEnd - bassEnd);
          const highs = rightsSum / (length - midsEnd);
          const overall = totalSum / length;

          // Update ref directly - no setState, no re-render cascade
          audioDataRef.current = {
            bass, mids, highs, overall,
            bassNorm: bass / 255,
            midsNorm: mids / 255,
            rightsNorm: highs / 255,
            overallNorm: overall / 255,
          };

          animationFrameRef.current = requestAnimationFrame(analyze);
        };

        analyze();
      } catch (error) {
        console.error('Audio analyzer initialization failed:', error);
      }
    };

    initializeAudio();

    return () => {
      cleanup();
    };
  }, [audioElement, isEnabled, cleanup]);

  return { audioData: audioDataRef.current, isAnalyzing: isAnalyzingRef.current };
}