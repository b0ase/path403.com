'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

const CLICK_FREQUENCIES = {
    calm: [200, 250, 300],
    warming: [300, 400, 500],
    weird: [500, 600, 700, 800],
    chaos: [600, 800, 1000, 1200, 1500],
    transcendence: [1000, 1200, 1500, 2000, 2500, 3000],
};

// $BOASE themed words for different chaos levels
const CALM_WORDS = ['$BOASE', 'MINT', 'BUILD', 'CREATE'];
const WARMING_WORDS = ['$BOASE', 'FORGE', 'STACK', 'HODL'];
const WEIRD_WORDS = ['$BOASE', 'PUMP', 'MOON', 'WAGMI'];
const CHAOS_WORDS = ['$BOASE', 'ALPHA', 'DEGEN', '100X'];
const TRANSCEND_WORDS = ['$BOASE', '∞', 'APEX', 'OMEGA'];

// Font options for the scramble animation - techy fonts only
const FONT_OPTIONS = [
    'JetBrains Mono, Monaco, Consolas, monospace',
    'SF Mono, Menlo, Monaco, monospace',
    'Fira Code, Consolas, monospace',
    'Source Code Pro, monospace',
    'IBM Plex Mono, monospace',
    'Roboto Mono, monospace',
    'Space Mono, monospace',
    'Inconsolata, monospace',
];

type ChaosLevel = 'calm' | 'warming' | 'weird' | 'chaos' | 'transcendence';

interface Particle {
    id: number;
    x: number;
    y: number;
    angle: number;
    speed: number;
    size: number;
    opacity: number;
}

export default function TechButtonEmbed() {
    const [isClient, setIsClient] = useState(false);
    const [displayText, setDisplayText] = useState('$BOASE');
    const [currentFont, setCurrentFont] = useState(FONT_OPTIONS[0]);
    const [sessionPresses, setSessionPresses] = useState(0);
    const [glitchActive, setGlitchActive] = useState(false);
    const [particles, setParticles] = useState<Particle[]>([]);

    const audioContextRef = useRef<AudioContext | null>(null);
    const buttonControls = useAnimation();
    const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$';

    const getChaosLevel = useCallback((): ChaosLevel => {
        if (sessionPresses <= 3) return 'calm';
        if (sessionPresses <= 8) return 'warming';
        if (sessionPresses <= 15) return 'weird';
        if (sessionPresses <= 30) return 'chaos';
        return 'transcendence';
    }, [sessionPresses]);

    const chaosLevel = getChaosLevel();

    useEffect(() => {
        setIsClient(true);
        if (typeof window !== 'undefined') {
            audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        }
    }, []);

    // Auto-scramble animation effect - runs periodically like the original $BOASE title
    useEffect(() => {
        if (!isClient) return;

        const titleTarget = '$BOASE';
        let isAnimating = false;

        const animateTitle = () => {
            if (isAnimating) return;
            isAnimating = true;

            let titleDisplay = titleTarget.split('');

            // Pick a new random font
            const newFont = FONT_OPTIONS[Math.floor(Math.random() * FONT_OPTIONS.length)];

            // Scramble phase
            let scrambleFrames = 0;
            const maxScrambleFrames = 6;

            const scramblePhase = setInterval(() => {
                titleDisplay = titleTarget.split('').map(char =>
                    char === ' ' ? ' ' : scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
                );
                setDisplayText(titleDisplay.join(''));
                scrambleFrames++;

                if (scrambleFrames >= maxScrambleFrames) {
                    clearInterval(scramblePhase);

                    // Change font after scramble
                    setCurrentFont(newFont);

                    // Resolve phase
                    const resolvePhase = setInterval(() => {
                        let allResolved = true;
                        titleDisplay = titleTarget.split('').map((char, i) => {
                            if (titleDisplay[i] === char) return char;
                            if (Math.random() < 0.3) return char;
                            allResolved = false;
                            return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
                        });
                        setDisplayText(titleDisplay.join(''));

                        if (allResolved) {
                            clearInterval(resolvePhase);
                            isAnimating = false;
                        }
                    }, 40);
                }
            }, 40);
        };

        // Start animation on load and repeat every 8 seconds
        const initialDelay = setTimeout(() => {
            animateTitle();
        }, 500);

        const interval = setInterval(animateTitle, 8000);

        return () => {
            clearTimeout(initialDelay);
            clearInterval(interval);
        };
    }, [isClient, scrambleChars]);

    const playClickSound = useCallback(() => {
        if (!audioContextRef.current) return;

        const ctx = audioContextRef.current;
        const frequencies = CLICK_FREQUENCIES[chaosLevel] || CLICK_FREQUENCIES.calm;
        const freq = frequencies[Math.floor(Math.random() * frequencies.length)];

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = chaosLevel === 'transcendence' ? 'sawtooth' :
                         chaosLevel === 'chaos' ? 'square' : 'sine';
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

        if (chaosLevel !== 'calm') {
            oscillator.frequency.exponentialRampToValueAtTime(
                freq * (1 + Math.random() * 0.5),
                ctx.currentTime + 0.1
            );
        }

        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
    }, [chaosLevel]);

    const spawnParticles = useCallback(() => {
        const count = Math.min(5 + sessionPresses, 15);
        const newParticles: Particle[] = [];

        for (let i = 0; i < count; i++) {
            newParticles.push({
                id: Date.now() + i,
                x: 0,
                y: 0,
                angle: (Math.PI * 2 / count) * i + Math.random() * 0.5,
                speed: 2 + Math.random() * 4,
                size: 2 + Math.random() * 3,
                opacity: 1,
            });
        }

        setParticles(prev => [...prev, ...newParticles]);

        setTimeout(() => {
            setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
        }, 1000);
    }, [sessionPresses]);

    const scrambleText = (finalText: string, duration = 400) => {
        let iteration = 0;
        const interval = setInterval(() => {
            setDisplayText(
                finalText
                    .split('')
                    .map((char, index) => {
                        if (index < iteration) return finalText[index];
                        if (char === ' ') return char;
                        return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
                    })
                    .join('')
            );
            iteration += 0.5;
            if (iteration >= finalText.length) {
                clearInterval(interval);
                setDisplayText(finalText);
            }
        }, duration / (finalText.length * 2));
    };

    const triggerGlitch = () => {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 150);
    };

    const getWordForChaosLevel = useCallback(() => {
        switch (chaosLevel) {
            case 'calm': return CALM_WORDS[Math.floor(Math.random() * CALM_WORDS.length)];
            case 'warming': return WARMING_WORDS[Math.floor(Math.random() * WARMING_WORDS.length)];
            case 'weird': return WEIRD_WORDS[Math.floor(Math.random() * WEIRD_WORDS.length)];
            case 'chaos': return CHAOS_WORDS[Math.floor(Math.random() * CHAOS_WORDS.length)];
            case 'transcendence': return TRANSCEND_WORDS[Math.floor(Math.random() * TRANSCEND_WORDS.length)];
            default: return '$BOASE';
        }
    }, [chaosLevel]);

    const handlePress = () => {
        playClickSound();
        triggerGlitch();
        spawnParticles();

        buttonControls.start({
            scale: [1, 1.05, 0.95, 1],
            transition: { duration: 0.3 }
        });

        const newPresses = sessionPresses + 1;
        setSessionPresses(newPresses);

        // Scramble to a random word then back to $BOASE
        scrambleText(getWordForChaosLevel());
        setTimeout(() => scrambleText('$BOASE'), 1500);
    };

    if (!isClient) {
        return <div className="w-[200px] h-[200px]" />;
    }

    const getBorderColor = () => {
        switch (chaosLevel) {
            case 'calm': return 'border-white/20';
            case 'warming': return 'border-white/30';
            case 'weird': return 'border-white/50';
            case 'chaos': return 'border-white/70';
            case 'transcendence': return 'border-white';
            default: return 'border-white/20';
        }
    };

    const getGlowStyle = () => {
        if (chaosLevel === 'calm') return {};
        if (chaosLevel === 'warming') return { boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)' };
        if (chaosLevel === 'weird') return { boxShadow: '0 0 40px rgba(255, 255, 255, 0.2)' };
        if (chaosLevel === 'chaos') return { boxShadow: '0 0 60px rgba(255, 255, 255, 0.4), 0 0 120px rgba(255, 255, 255, 0.1)' };
        return { boxShadow: '0 0 80px rgba(255, 255, 255, 0.6), 0 0 160px rgba(255, 255, 255, 0.3)' };
    };


    return (
        <div className={`relative ${glitchActive ? 'animate-pulse' : ''}`}>
            {/* Particle effects */}
            {particles.map(particle => (
                <motion.div
                    key={particle.id}
                    className="absolute left-1/2 top-1/2 rounded-full bg-white"
                    initial={{ x: 0, y: 0, opacity: 1 }}
                    animate={{
                        x: Math.cos(particle.angle) * particle.speed * 40,
                        y: Math.sin(particle.angle) * particle.speed * 40,
                        opacity: 0,
                    }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ width: particle.size, height: particle.size }}
                />
            ))}

            {/* Main Button */}
            <motion.button
                onClick={handlePress}
                animate={buttonControls}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className={`relative w-[220px] h-[220px] md:w-[260px] md:h-[260px] lg:w-[300px] lg:h-[300px] rounded-full
                           bg-black dark:bg-black border ${getBorderColor()}
                           flex flex-col items-center justify-center
                           transition-all duration-300 cursor-pointer`}
                style={getGlowStyle()}
            >
                {/* Corner markers */}
                <div className={`absolute top-6 left-6 w-2 h-2 border-l border-t ${getBorderColor()}`} />
                <div className={`absolute top-6 right-6 w-2 h-2 border-r border-t ${getBorderColor()}`} />
                <div className={`absolute bottom-6 left-6 w-2 h-2 border-l border-b ${getBorderColor()}`} />
                <div className={`absolute bottom-6 right-6 w-2 h-2 border-r border-b ${getBorderColor()}`} />

                {/* Dynamic text content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${sessionPresses}-${currentFont}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="text-center"
                    >
                        <div
                            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-wider text-white dark:text-white"
                            style={{ fontFamily: currentFont }}
                        >
                            {displayText}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </motion.button>
        </div>
    );
}
