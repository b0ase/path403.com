'use client';

import { motion, useAnimationFrame, useMotionValue } from 'framer-motion';
import { portfolioData } from '@/lib/data';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowRight, FiCircle } from 'react-icons/fi';
import { Coins } from 'lucide-react';

// Physics constants - responsive values set in component
const BOUNCE_DAMPING = 0.95; // Energy loss on wall bounce

interface PhysicsTokenProps {
    project: any;
    index: number;
    x: any;
    y: any;
    playProjectSound: (project: any, index: number) => void;
    onNavigate: (slug: string) => void;
    isMobile: boolean;
}

const PhysicsToken = ({ project, index, x, y, playProjectSound, onNavigate, isMobile }: PhysicsTokenProps) => {

    const handleClick = () => {
        onNavigate(project.slug);
    };

    const handleHover = () => {
        playProjectSound(project, index);
    };

    const imageUrl = project.cardImageUrls?.[0];

    return (
        <motion.div
            className="absolute pointer-events-auto"
            style={{ x, y }}
            // Gentle floating animation only on mobile
            animate={isMobile ? {
                y: [0, -5, 0],
            } : {}}
            transition={isMobile ? {
                duration: 3 + (index % 3),
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.15,
            } : {}}
        >
            <motion.button
                onClick={handleClick}
                onMouseEnter={handleHover}
                className="group relative w-14 h-14 sm:w-20 sm:h-20 md:w-28 md:h-28 overflow-hidden rounded-full border-2 sm:border-4 border-white/20 hover:border-white/60 cursor-pointer shadow-lg hover:shadow-white/20 bg-black"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
            >
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${imageUrl})` }}
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />

                {/* Project name on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm">
                    <span className="text-[10px] sm:text-xs font-bold text-white text-center px-1">
                        {project.title}
                    </span>
                </div>
            </motion.button>
        </motion.div>
    );
};

export default function TokensPage() {
    const router = useRouter();

    // Filter projects to only those with images
    const projectsWithImages = portfolioData.projects.filter(p =>
        p.cardImageUrls && p.cardImageUrls.length > 0
    ).sort((a, b) => a.title.localeCompare(b.title));

    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [isClient, setIsClient] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleNavigate = (slug: string) => {
        router.push(`/portfolio/${slug}`);
    };

    // Responsive physics values - velocity is pixels per second (normalized by delta)
    const getPhysicsConfig = (width: number) => {
        if (width < 640) {
            // Mobile: very slow, gentle floating
            return { buttonSize: 56, collisionRadius: 35, maxVelocity: 15 };
        } else if (width < 768) {
            return { buttonSize: 80, collisionRadius: 45, maxVelocity: 25 };
        } else {
            return { buttonSize: 112, collisionRadius: 60, maxVelocity: 40 };
        }
    };

    const physicsConfigRef = useRef(getPhysicsConfig(800));

    // Physics state refs - velocity in pixels per second
    const tokensRef = useRef(projectsWithImages.map(() => ({
        x: 0,
        y: 0,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        mass: 1
    })));

    // Motion values for direct manipulation without re-renders
    const motionValues = useRef(projectsWithImages.map(() => ({
        x: useMotionValue(0),
        y: useMotionValue(0)
    }))).current;

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setAudioContext(new (window.AudioContext || (window as any).webkitAudioContext)());

            const updateDimensions = () => {
                if (containerRef.current) {
                    const width = containerRef.current.offsetWidth;
                    const height = containerRef.current.offsetHeight;
                    setDimensions({ width, height });
                    setIsMobile(width < 640);
                    physicsConfigRef.current = getPhysicsConfig(width);
                    return { width, height };
                }
                return { width: window.innerWidth, height: window.innerHeight };
            };

            const dims = updateDimensions();
            const config = getPhysicsConfig(dims.width);

            // Initialize positions - grid on mobile, random on desktop
            if (dims.width < 640) {
                // Mobile: simple grid layout
                const cols = Math.floor(dims.width / (config.buttonSize + 20));
                tokensRef.current.forEach((b, i) => {
                    const col = i % cols;
                    const row = Math.floor(i / cols);
                    b.x = col * (config.buttonSize + 20) + 10;
                    b.y = row * (config.buttonSize + 20) + 10;
                    b.vx = 0;
                    b.vy = 0;
                });
            } else {
                // Desktop: random positions with physics
                tokensRef.current.forEach((b) => {
                    b.x = Math.random() * (dims.width - config.buttonSize - 20);
                    b.y = Math.random() * (dims.height - config.buttonSize - 20);
                    // Random initial velocity (pixels per second)
                    b.vx = (Math.random() - 0.5) * config.maxVelocity * 0.8;
                    b.vy = (Math.random() - 0.5) * config.maxVelocity * 0.8;
                });
            }

            setIsClient(true);

            window.addEventListener('resize', updateDimensions);
            return () => window.removeEventListener('resize', updateDimensions);
        }
    }, []);

    const playProjectSound = async (project: any, index: number) => {
        if (!audioContext) return;

        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        const now = audioContext.currentTime;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

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

    useAnimationFrame((t, delta) => {
        if (!isClient || dimensions.width === 0) return;

        const tokens = tokensRef.current;
        const count = tokens.length;
        const config = physicsConfigRef.current;
        const { buttonSize, collisionRadius, maxVelocity } = config;

        // Disable physics on mobile - use static positions
        if (isMobile) {
            return;
        }

        // Normalize delta to seconds (delta is in ms), cap to prevent jumps on tab switch
        const dt = Math.min(delta / 1000, 0.05);

        for (let i = 0; i < count; i++) {
            const b = tokens[i];

            // Apply velocity with time normalization
            b.x += b.vx * dt;
            b.y += b.vy * dt;

            if (b.x <= 0) { b.x = 0; b.vx *= -1; }
            if (b.x >= dimensions.width - buttonSize) { b.x = dimensions.width - buttonSize; b.vx *= -1; }
            if (b.y <= 0) { b.y = 0; b.vy *= -1; }
            if (b.y >= dimensions.height - buttonSize) { b.y = dimensions.height - buttonSize; b.vy *= -1; }

            // Keep tokens moving gently
            const minVel = maxVelocity * 0.3;
            if (Math.abs(b.vx) < minVel) b.vx += (Math.random() - 0.5) * maxVelocity * 0.5;
            if (Math.abs(b.vy) < minVel) b.vy += (Math.random() - 0.5) * maxVelocity * 0.5;

            const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
            if (speed > maxVelocity) {
                b.vx = (b.vx / speed) * maxVelocity;
                b.vy = (b.vy / speed) * maxVelocity;
            }
        }

        for (let i = 0; i < count; i++) {
            for (let j = i + 1; j < count; j++) {
                const b1 = tokens[i];
                const b2 = tokens[j];

                const dx = b2.x - b1.x;
                const dy = b2.y - b1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < collisionRadius * 2) {
                    const overlap = collisionRadius * 2 - distance;
                    const nx = dx / distance || 1;
                    const ny = dy / distance || 0;

                    b1.x -= nx * overlap * 0.5;
                    b1.y -= ny * overlap * 0.5;
                    b2.x += nx * overlap * 0.5;
                    b2.y += ny * overlap * 0.5;

                    const v1n = b1.vx * nx + b1.vy * ny;
                    const v2n = b2.vx * nx + b2.vy * ny;

                    const tx = -ny;
                    const ty = nx;
                    const v1t = b1.vx * tx + b1.vy * ty;
                    const v2t = b2.vx * tx + b2.vy * ty;

                    const v1nFinal = v2n;
                    const v2nFinal = v1n;

                    b1.vx = v1nFinal * nx + v1t * tx;
                    b1.vy = v1nFinal * ny + v1t * ty;
                    b2.vx = v2nFinal * nx + v2t * tx;
                    b2.vy = v2nFinal * ny + v2t * ty;
                }
            }
        }

        for (let i = 0; i < count; i++) {
            motionValues[i].x.set(tokens[i].x);
            motionValues[i].y.set(tokens[i].y);
        }
    });

    return (
        <motion.div
            className="min-h-screen bg-black text-white relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <motion.section
                className="px-4 md:px-8 py-4 md:py-6 relative z-10 h-[calc(100vh-120px)] flex flex-col"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
            >
                {/* Standardized Header */}
                <motion.div
                    className="mb-4 border-b border-gray-800 pb-4 flex-shrink-0"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                >
                    <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
                        <div className="bg-gray-900/50 p-4 md:p-6 border border-gray-800 self-start">
                            <Coins className="text-4xl md:text-6xl text-white w-12 h-12 md:w-16 md:h-16" />
                        </div>
                        <div className="flex items-end gap-4">
                            <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                                TOKENS
                            </h1>
                            <div className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-widest">
                                TOKENIZATION
                            </div>
                        </div>
                    </div>

                    {/* Marketing Pitch */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <p className="text-gray-400 max-w-2xl">
                            Create and manage tokens for your business. Equity tokenization, loyalty points,
                            governance tokens - each one below represents a live project. Click to explore.
                        </p>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/tokens/types"
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold hover:bg-white/10 transition-colors whitespace-nowrap border border-white/20"
                            >
                                Token Types <FiArrowRight size={14} />
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold hover:opacity-80 transition-colors whitespace-nowrap"
                                style={{ backgroundColor: '#fff', color: '#000' }}
                            >
                                Get Started <FiArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* Physics Container - taller for more token space */}
                <div
                    ref={containerRef}
                    className="relative flex-grow w-full border border-gray-800 bg-gray-900/20 overflow-hidden min-h-[500px]"
                >
                    {isClient && projectsWithImages.map((project, index) => (
                        <PhysicsToken
                            key={project.slug}
                            project={project}
                            index={index}
                            x={motionValues[index].x}
                            y={motionValues[index].y}
                            playProjectSound={playProjectSound}
                            onNavigate={handleNavigate}
                            isMobile={isMobile}
                        />
                    ))}
                </div>
            </motion.section>
        </motion.div>
    );
}
