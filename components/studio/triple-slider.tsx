"use client";

import React, { useState, useEffect, useRef } from 'react';

interface TripleSliderProps {
  min?: number;
  max?: number;
  mainValue?: number;
  minValue?: number;
  maxValue?: number;
  autoRandom?: boolean;
  randomSpeed?: number; // Time in MS between random moves
  onChange?: (main: number, min: number, max: number) => void;
  className?: string;
}

const TripleSlider: React.FC<TripleSliderProps> = ({
  min = 0,
  max = 100,
  mainValue = 50,
  minValue = 25,
  maxValue = 75,
  autoRandom = false,
  randomSpeed = 500,
  onChange,
  className = ""
}) => {
  const [values, setValues] = useState({
    min: minValue,
    max: maxValue,
    main: mainValue
  });
  const [isDragging, setIsDragging] = useState<'min' | 'max' | 'main' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);

  // Keep onChange ref up to date
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Sync internal state with prop changes (for controlled component behavior)
  useEffect(() => {
    setValues(prev => ({
      min: minValue !== undefined ? minValue : prev.min,
      max: maxValue !== undefined ? maxValue : prev.max,
      main: mainValue !== undefined ? mainValue : prev.main
    }));
  }, [mainValue, minValue, maxValue]);

  // Handle Auto Random movement
  useEffect(() => {
    if (!autoRandom || isDragging) return;

    const interval = setInterval(() => {
      setValues(prev => {
        // Random drift within the current min/max bounds
        const range = prev.max - prev.min;
        if (range <= 0) return prev;

        // Jump to a random point in range instead of small drift for more "vibe"
        const newMain = Math.round(prev.min + Math.random() * range);

        const nextValues = { ...prev, main: newMain };

        // Notify parent if movement occurred
        if (newMain !== prev.main && onChangeRef.current) {
          onChangeRef.current(nextValues.main, nextValues.min, nextValues.max);
        }

        return nextValues;
      });
    }, randomSpeed);

    return () => clearInterval(interval);
  }, [autoRandom, isDragging, randomSpeed]);

  const getPercent = (value: number) => {
    return Math.round(((value - min) / (max - min)) * 100);
  };

  const getValueFromPosition = (clientX: number) => {
    if (!containerRef.current) return values.main;
    const rect = containerRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    return Math.round(min + (percent / 100) * (max - min));
  };

  const handleMouseDown = (e: React.MouseEvent, handleType: 'min' | 'max' | 'main') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(handleType);
  };

  // Click on track to move main handle
  const handleTrackClick = (e: React.MouseEvent) => {
    if (isDragging) return;
    const value = getValueFromPosition(e.clientX);
    const clampedValue = Math.max(values.min, Math.min(values.max, value));
    const newValues = { ...values, main: clampedValue };
    setValues(newValues);
    if (onChangeRef.current) {
      onChangeRef.current(newValues.main, newValues.min, newValues.max);
    }
  };

  // Move event listeners to window to capture drag outside
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const value = getValueFromPosition(e.clientX);
      let newValues = { ...values };

      if (isDragging === 'min') {
        newValues.min = Math.min(value, values.max - 1);
      } else if (isDragging === 'max') {
        newValues.max = Math.max(value, values.min + 1);
      } else if (isDragging === 'main') {
        newValues.main = Math.max(values.min, Math.min(values.max, value));
      }

      setValues(newValues);

      // Call onChange via ref to avoid stale closure issues
      if (onChangeRef.current) {
        onChangeRef.current(newValues.main, newValues.min, newValues.max);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, min, max, values]);

  return (
    <div className={`my-2.5 ${className}`}>
      <div
        className="relative h-8 bg-[#111] border border-white/5 rounded cursor-pointer select-none group"
        ref={containerRef}
        onClick={handleTrackClick}
      >
        {/* Track Line */}
        <div className="absolute top-1/2 left-2 right-2 h-1 bg-[#333] -translate-y-1/2 rounded"></div>

        {/* Active Range */}
        <div
          className="absolute top-1/2 h-1 bg-cyan-800/60 rounded pointer-events-none -translate-y-1/2 z-0"
          style={{
            left: `calc(${getPercent(values.min)}% + 8px)`,
            width: `calc(${getPercent(values.max) - getPercent(values.min)}% - 16px)`
          }}
        ></div>

        {/* Min Handle */}
        <div
          className="absolute top-1/2 w-5 h-5 bg-zinc-400 rounded-full -translate-y-1/2 -translate-x-1/2 cursor-grab z-10 shadow-md hover:scale-125 hover:bg-white transition-all border-2 border-black/30 active:cursor-grabbing active:scale-110"
          style={{ left: `${getPercent(values.min)}%` }}
          onMouseDown={(e) => handleMouseDown(e, 'min')}
        ></div>

        {/* Main Handle - Larger and more prominent */}
        <div
          className="absolute top-1/2 w-7 h-7 bg-cyan-500 rounded-full -translate-y-1/2 -translate-x-1/2 cursor-grab z-20 shadow-lg hover:scale-125 hover:bg-cyan-400 transition-all border-2 border-black/30 active:cursor-grabbing active:scale-110"
          style={{ left: `${getPercent(values.main)}%` }}
          onMouseDown={(e) => handleMouseDown(e, 'main')}
        ></div>

        {/* Max Handle */}
        <div
          className="absolute top-1/2 w-5 h-5 bg-zinc-400 rounded-full -translate-y-1/2 -translate-x-1/2 cursor-grab z-10 shadow-md hover:scale-125 hover:bg-white transition-all border-2 border-black/30 active:cursor-grabbing active:scale-110"
          style={{ left: `${getPercent(values.max)}%` }}
          onMouseDown={(e) => handleMouseDown(e, 'max')}
        ></div>
      </div>

      <div className="flex justify-between mt-1.5 text-[11px] text-zinc-500 font-mono">
        <span>Min: <span className="text-yellow-500">{values.min}</span></span>
        <span>Main: <span className="text-cyan-500 font-bold">{values.main}</span></span>
        <span>Max: <span className="text-yellow-500">{values.max}</span></span>
      </div>
    </div>
  );
};

export default TripleSlider;

