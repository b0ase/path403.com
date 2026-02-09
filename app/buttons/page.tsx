'use client';

import { motion, useAnimationFrame, useMotionValue } from 'framer-motion';
import { portfolioData } from '@/lib/data';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useNavbar } from '@/components/NavbarProvider';
import Link from 'next/link';
import BWriterPurchaseModal from '@/components/BWriterPurchaseModal';
import { FiGrid } from 'react-icons/fi';

// Physics constants - responsive values set in component
const BOUNCE_DAMPING = 0.95; // Energy loss on wall bounce
const CLICK_SQUARE_DURATION = 1000; // ms

interface PhysicsButtonProps {
    project: any;
    index: number;
    x: any;
    y: any;
    playProjectSound: (project: any, index: number) => void;
    onNavigate: (slug: string) => void;
    isDark: boolean;
    isMobile: boolean;
}

const PhysicsButton = ({ project, index, x, y, playProjectSound, onNavigate, isDark, isMobile }: PhysicsButtonProps) => {

    const handleClick = () => {
        playProjectSound(project, index); // Play sound on tap for mobile
        onNavigate(project.slug);
    };

    const handleHover = () => {
        if (!isMobile) {
            playProjectSound(project, index);
        }
    };

    const imageUrl = project.cardImageUrls?.[0];

    // Mobile: use CSS grid positioning (no motion values)
    if (isMobile) {
        return (
            <motion.div
                className="pointer-events-auto"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
            >
                <motion.button
                    onClick={handleClick}
                    className={`group relative w-16 h-16 overflow-hidden rounded-full border-2 cursor-pointer shadow-md active:scale-95 transition-transform ${
                        isDark
                            ? 'border-white/30 active:border-white/60 bg-black'
                            : 'border-black/30 active:border-black/60 bg-white'
                    }`}
                    whileTap={{ scale: 0.9 }}
                >
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${imageUrl})` }}
                    />
                    <div className={`absolute inset-0 ${
                        isDark ? 'bg-black/20' : 'bg-white/20'
                    }`} />

                    {/* Always show title on mobile for discoverability */}
                    <div className={`absolute inset-x-0 bottom-0 py-1 backdrop-blur-sm ${
                        isDark ? 'bg-black/70' : 'bg-white/70'
                    }`}>
                        <span className={`text-[8px] font-bold text-center block truncate px-1 ${
                            isDark ? 'text-white' : 'text-black'
                        }`}>
                            {project.title}
                        </span>
                    </div>
                </motion.button>
            </motion.div>
        );
    }

    // Desktop: physics-based positioning
    return (
        <motion.div
            className="absolute pointer-events-auto"
            style={{ x, y }}
        >
            <motion.button
                onClick={handleClick}
                onMouseEnter={handleHover}
                className={`group relative w-20 h-20 md:w-28 md:h-28 overflow-hidden rounded-full border-4 cursor-pointer shadow-lg ${
                    isDark
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
                <div className={`absolute inset-0 transition-colors ${
                    isDark ? 'bg-black/20 group-hover:bg-black/0' : 'bg-white/20 group-hover:bg-white/0'
                }`} />

                {/* Project name on hover */}
                <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm ${
                    isDark ? 'bg-black/60' : 'bg-white/60'
                }`}>
                    <span className={`text-xs font-bold text-center px-1 ${
                        isDark ? 'text-white' : 'text-black'
                    }`}>
                        {project.title}
                    </span>
                </div>
            </motion.button>
        </motion.div>
    );
};

export default function ButtonsPage() {
    const router = useRouter();
    const { isDark } = useNavbar();
    const [showBWriterModal, setShowBWriterModal] = useState(false);

    // Filter projects to only those with images
    const projectsWithImages = portfolioData.projects.filter(p =>
        p.cardImageUrls && p.cardImageUrls.length > 0
    ).sort((a, b) => a.title.localeCompare(b.title));

    // Get bitcoin-writer project data for modal
    const bwriterProject = portfolioData.projects.find(p => p.slug === 'bitcoin-writer');

    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [isClient, setIsClient] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleNavigate = (slug: string) => {
        // Open modal for bitcoin-writer instead of navigating
        if (slug === 'bitcoin-writer') {
            setShowBWriterModal(true);
            return;
        }
        router.push(`/portfolio/${slug}`);
    };

    // Responsive physics values
    const getPhysicsConfig = (width: number) => {
        if (width < 640) {
            // Mobile: smaller buttons (56px), slower movement
            return { buttonSize: 56, collisionRadius: 35, maxVelocity: 0.4 };
        } else if (width < 768) {
            // Small tablet: medium buttons (80px)
            return { buttonSize: 80, collisionRadius: 45, maxVelocity: 0.6 };
        } else {
            // Desktop: larger buttons (112px)
            return { buttonSize: 112, collisionRadius: 60, maxVelocity: 0.8 };
        }
    };

    const physicsConfigRef = useRef(getPhysicsConfig(800));

    // Physics state refs
    const buttonsRef = useRef(projectsWithImages.map(() => ({
        x: 0,
        y: 0,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
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
                buttonsRef.current.forEach((b, i) => {
                    const col = i % cols;
                    const row = Math.floor(i / cols);
                    b.x = col * (config.buttonSize + 20) + 10;
                    b.y = row * (config.buttonSize + 20) + 10;
                    b.vx = 0;
                    b.vy = 0;
                });
            } else {
                // Desktop: random positions with physics
                buttonsRef.current.forEach((b) => {
                    b.x = Math.random() * (dims.width - config.buttonSize - 20);
                    b.y = Math.random() * (dims.height - config.buttonSize - 20);
                    b.vx = (Math.random() - 0.5) * config.maxVelocity;
                    b.vy = (Math.random() - 0.5) * config.maxVelocity;
                });
            }

            setIsClient(true);

            window.addEventListener('resize', updateDimensions);
            return () => window.removeEventListener('resize', updateDimensions);
        }
    }, []);

    const playProjectSound = async (project: any, index: number) => {
        if (!audioContext) return;

        // Resume AudioContext if suspended (required by modern browsers)
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

    useAnimationFrame((t, delta) => {
        if (!isClient || dimensions.width === 0) return;

        const buttons = buttonsRef.current;
        const count = buttons.length;
        const config = physicsConfigRef.current;
        const { buttonSize, collisionRadius, maxVelocity } = config;

        // Disable physics on mobile - use static positions
        if (isMobile) {
            return;
        }

        // Update positions & check wall collisions
        for (let i = 0; i < count; i++) {
            const b = buttons[i];

            b.x += b.vx;
            b.y += b.vy;

            // Wall collisions with damping
            if (b.x <= 0) { b.x = 0; b.vx *= -1; }
            if (b.x >= dimensions.width - buttonSize) { b.x = dimensions.width - buttonSize; b.vx *= -1; }
            if (b.y <= 0) { b.y = 0; b.vy *= -1; }
            if (b.y >= dimensions.height - buttonSize) { b.y = dimensions.height - buttonSize; b.vy *= -1; }

            // Apply slight random push to keep things moving if they slow down too much
            const minVel = maxVelocity * 0.15;
            if (Math.abs(b.vx) < minVel) b.vx += (Math.random() - 0.5) * maxVelocity * 0.1;
            if (Math.abs(b.vy) < minVel) b.vy += (Math.random() - 0.5) * maxVelocity * 0.1;

            // Clamp velocity to max
            const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
            if (speed > maxVelocity) {
                b.vx = (b.vx / speed) * maxVelocity;
                b.vy = (b.vy / speed) * maxVelocity;
            }
        }

        // Check object collisions
        for (let i = 0; i < count; i++) {
            for (let j = i + 1; j < count; j++) {
                const b1 = buttons[i];
                const b2 = buttons[j];

                const dx = b2.x - b1.x;
                const dy = b2.y - b1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < collisionRadius * 2) {
                    // Collision detected!

                    // Resolve overlap
                    const overlap = collisionRadius * 2 - distance;
                    const nx = dx / distance || 1; // avoid divide by zero
                    const ny = dy / distance || 0;

                    b1.x -= nx * overlap * 0.5;
                    b1.y -= ny * overlap * 0.5;
                    b2.x += nx * overlap * 0.5;
                    b2.y += ny * overlap * 0.5;

                    // Exchange velocities (simple elastic collision)
                    // Normal velocity components
                    const v1n = b1.vx * nx + b1.vy * ny;
                    const v2n = b2.vx * nx + b2.vy * ny;

                    // Tangent velocity components (unchanged)
                    const tx = -ny;
                    const ty = nx;
                    const v1t = b1.vx * tx + b1.vy * ty;
                    const v2t = b2.vx * tx + b2.vy * ty;

                    // Swap normal velocities
                    const v1nFinal = v2n;
                    const v2nFinal = v1n;

                    // Convert back to x/y
                    b1.vx = v1nFinal * nx + v1t * tx;
                    b1.vy = v1nFinal * ny + v1t * ty;
                    b2.vx = v2nFinal * nx + v2t * tx;
                    b2.vy = v2nFinal * ny + v2t * ty;
                }
            }
        }

        // Update MotionValues
        for (let i = 0; i < count; i++) {
            motionValues[i].x.set(buttons[i].x);
            motionValues[i].y.set(buttons[i].y);
        }
    });

    return (
        <motion.div
            className={`min-h-screen relative overflow-hidden ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <motion.section
                className="px-3 sm:px-4 md:px-8 pt-4 sm:pt-8 md:pt-16 pb-4 sm:pb-8 relative z-10 h-screen flex flex-col"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
            >
                {/* Standardized Header */}
                <motion.div
                    className={`mb-4 sm:mb-8 border-b pb-4 sm:pb-8 flex-shrink-0 ${isDark ? 'border-zinc-900' : 'border-zinc-200'}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                >
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4">
                      <div className="flex items-end gap-3 sm:gap-6">
                        <div className={`p-3 sm:p-4 md:p-6 border self-start ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-100 border-zinc-200'}`}>
                          <FiGrid className={`text-2xl sm:text-4xl md:text-6xl ${isDark ? 'text-white' : 'text-black'}`} />
                        </div>
                        <div className="flex items-end gap-2 sm:gap-4">
                          <h1 className={`text-3xl sm:text-4xl md:text-6xl font-bold leading-none tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>
                            BUTTONS
                          </h1>
                          <div className={`text-[10px] sm:text-xs mb-1 sm:mb-2 font-mono uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            INTERACTIVE
                          </div>
                        </div>
                      </div>
                      {/* Sub-page Navigation */}
                      <div className="flex items-center gap-3 sm:gap-4 sm:mb-2 overflow-x-auto pb-1 -mb-1">
                        <Link
                          href="/buttons/themes"
                          className={`text-[10px] sm:text-xs font-mono uppercase tracking-wider hover:underline transition-colors whitespace-nowrap ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-black'}`}
                        >
                          Themes
                        </Link>
                        <Link
                          href="/buttons/themes/tech"
                          className={`text-[10px] sm:text-xs font-mono uppercase tracking-wider hover:underline transition-colors whitespace-nowrap ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-black'}`}
                        >
                          Tech
                        </Link>
                        <Link
                          href="/buttons/handles"
                          className={`text-[10px] sm:text-xs font-mono uppercase tracking-wider hover:underline transition-colors whitespace-nowrap ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-black'}`}
                        >
                          Handles
                        </Link>
                      </div>
                    </div>
                </motion.div>

                {/* Physics Container */}
                <div
                    ref={containerRef}
                    className={`relative flex-grow w-full border rounded-xl overflow-hidden ${
                        isDark ? 'border-zinc-900/50 bg-zinc-900/20' : 'border-zinc-200 bg-zinc-100/50'
                    } ${isMobile ? 'overflow-y-auto' : ''}`}
                >
                    {/* Mobile: CSS Grid layout */}
                    {isClient && isMobile && (
                        <div className="grid grid-cols-4 gap-2 p-3 content-start min-h-full">
                            {projectsWithImages.map((project, index) => (
                                <PhysicsButton
                                    key={project.slug}
                                    project={project}
                                    index={index}
                                    x={motionValues[index].x}
                                    y={motionValues[index].y}
                                    playProjectSound={playProjectSound}
                                    onNavigate={handleNavigate}
                                    isDark={isDark}
                                    isMobile={isMobile}
                                />
                            ))}
                        </div>
                    )}

                    {/* Desktop: Physics-based positioning */}
                    {isClient && !isMobile && projectsWithImages.map((project, index) => (
                        <PhysicsButton
                            key={project.slug}
                            project={project}
                            index={index}
                            x={motionValues[index].x}
                            y={motionValues[index].y}
                            playProjectSound={playProjectSound}
                            onNavigate={handleNavigate}
                            isDark={isDark}
                            isMobile={isMobile}
                        />
                    ))}
                </div>
            </motion.section>

            {/* $bWriter Purchase Modal */}
            <BWriterPurchaseModal
                isOpen={showBWriterModal}
                onClose={() => setShowBWriterModal(false)}
                totalValuation={bwriterProject?.price}
                totalRaised={bwriterProject?.totalRaised}
            />
        </motion.div>
    );
}
