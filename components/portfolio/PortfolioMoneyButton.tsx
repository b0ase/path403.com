'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Project } from '@/lib/data';

interface PortfolioMoneyButtonProps {
    project: Project;
    index: number;
    isDark?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export default function PortfolioMoneyButton({
    project,
    index,
    isDark = true,
    size = 'sm'
}: PortfolioMoneyButtonProps) {
    const router = useRouter();
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

    // Initialize AudioContext lazily on interaction or mount
    useEffect(() => {
        if (typeof window !== 'undefined' && !audioContext) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                setAudioContext(new AudioContextClass());
            }
        }
    }, []);

    const playProjectSound = async () => {
        if (!audioContext) return;

        // Resume AudioContext if suspended
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        const now = audioContext.currentTime;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        // Pentatonic scale frequencies based on index
        const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
        const freq = scale[index % scale.length] * (1 + (Math.floor(index / 6) * 0.5));

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, now);
        oscillator.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.4);

        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start(now);
        oscillator.stop(now + 0.5);
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row click
        playProjectSound();
        router.push(`/portfolio/${project.slug}`);
    };

    const handleHover = () => {
        playProjectSound();
    };

    // Determine effective style mode (b0ase button is always black/dark style)
    const isEffectiveDark = project.slug === 'boase-index' ? true : isDark;

    let imageUrl = project.cardImageUrls?.[0] || '/images/defaults/project-placeholder.png';

    // Special case for b0ase-index to use provided logos
    if (project.slug === 'boase-index') {
        imageUrl = '/b0ase_logo_white.png'; // Always white logo on black background
    }

    // Size classes
    const sizeClasses = {
        sm: 'w-10 h-10 border-2',
        md: 'w-14 h-14 border-2',
        lg: 'w-20 h-20 border-4'
    };

    const currentSizeClass = sizeClasses[size];

    return (
        <motion.button
            onClick={handleClick}
            onMouseEnter={handleHover}
            className={`group relative ${currentSizeClass} overflow-hidden rounded-full cursor-pointer shadow-lg flex-shrink-0 ${isEffectiveDark
                    ? 'border-white/20 hover:border-white/60 hover:shadow-white/20 bg-black'
                    : 'border-black/20 hover:border-black/60 hover:shadow-black/20 bg-white'
                }`}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
        >
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${imageUrl})` }}
            />
            <div className={`absolute inset-0 transition-colors ${isEffectiveDark ? 'bg-black/20 group-hover:bg-black/0' : 'bg-white/20 group-hover:bg-white/0'
                }`} />

            {/* Project name on hover - Optional, maybe too small for 'sm' size */}
            {/* <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm ${
                isEffectiveDark ? 'bg-black/60' : 'bg-white/60'
            }`}>
                <span className={`text-[8px] font-bold text-center px-1 leading-tight ${
                    isEffectiveDark ? 'text-white' : 'text-black'
                }`}>
                    {project.title}
                </span>
            </div> */}
        </motion.button>
    );
}
