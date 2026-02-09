'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Howl } from 'howler';
import { Volume2, VolumeX, Zap, Trophy, Flame } from 'lucide-react';
import { useTokenSupply } from '@/hooks/useTokenSupply';
import { useUserHandle } from '@/hooks/useUserHandle';

const TECH_MUSIC = [
    '/music/tech/Echoes in the Machine.mp3',
    '/music/tech/Echoes in the Rust.mp3',
    '/music/tech/Shattered Echoes.mp3',
    '/music/tech/Shattered Kintsugi.mp3',
];

// Click sounds that escalate (we'll use web audio)
const CLICK_FREQUENCIES = {
    calm: [200, 250, 300],
    warming: [300, 400, 500],
    weird: [500, 600, 700, 800],
    chaos: [600, 800, 1000, 1200, 1500],
    transcendence: [1000, 1200, 1500, 2000, 2500, 3000],
};

// Words for different chaos levels
const CALM_WORDS = ['EXECUTE', 'DEPLOY', 'CONFIRM', 'PROCEED'];
const WARMING_WORDS = ['HACK', 'SUDO', 'ROOT', 'ACCESS'];
const WEIRD_WORDS = ['BREACH', 'INJECT', 'EXPLOIT', 'PWNED'];
const CHAOS_WORDS = ['OVERRIDE', 'GODMODE', 'KERNEL', '0xDEAD'];
const TRANSCEND_WORDS = ['∞', 'VOID', 'NULL', 'APEX', 'OMEGA'];

// Achievements
const ACHIEVEMENTS = [
    { presses: 5, title: 'INITIALIZED', icon: '⚡' },
    { presses: 10, title: 'COMPILING', icon: '🔧' },
    { presses: 25, title: 'EXECUTING', icon: '▶️' },
    { presses: 50, title: 'OVERCLOCKED', icon: '🔥' },
    { presses: 100, title: 'GODMODE', icon: '👁️' },
    { presses: 200, title: 'ASCENDED', icon: '✨' },
    { presses: 500, title: 'SINGULARITY', icon: '🌌' },
];

const TECH_SYMBOLS = ['>', '$', '#', '//', '{}', '[]', '<>', '&&', '||', '**', '!=', '==', '=>', '::'];

type LayoutType = 'standard' | 'command' | 'function' | 'binary' | 'symbol' | 'glitch' | 'minimal' | 'hacker';

interface Particle {
    id: number;
    x: number;
    y: number;
    angle: number;
    speed: number;
    size: number;
    opacity: number;
}

export default function TechStylePage() {
    const [isClient, setIsClient] = useState(false);
    const [displayText, setDisplayText] = useState('EXECUTE');
    const [muted, setMuted] = useState(false);
    const [musicStarted, setMusicStarted] = useState(false);
    const [userTokens, setUserTokens] = useState(0);
    const [loading, setLoading] = useState(false);
    const [sessionPresses, setSessionPresses] = useState(0);
    const [currentLayout, setCurrentLayout] = useState<LayoutType>('standard');
    const [currentSymbol, setCurrentSymbol] = useState('>');
    const [glitchActive, setGlitchActive] = useState(false);
    const [combo, setCombo] = useState(0);
    const [lastPressTime, setLastPressTime] = useState(0);
    const [showAchievement, setShowAchievement] = useState<typeof ACHIEVEMENTS[0] | null>(null);
    const [particles, setParticles] = useState<Particle[]>([]);
    const [screenShake, setScreenShake] = useState(0);
    const [scanlineIntensity, setScanlineIntensity] = useState(0);
    
    const musicRef = useRef<Howl | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonControls = useAnimation();
    const scrambleChars = '0123456789ABCDEF!@#$%^&*<>[]{}';
    
    const tokenSupply = useTokenSupply();
    const { handle } = useUserHandle();

    // Chaos level based on session presses
    const getChaosLevel = useCallback(() => {
        if (sessionPresses <= 3) return 'calm';
        if (sessionPresses <= 8) return 'warming';
        if (sessionPresses <= 15) return 'weird';
        if (sessionPresses <= 30) return 'chaos';
        return 'transcendence';
    }, [sessionPresses]);

    const chaosLevel = getChaosLevel();

    // Combo decay
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            if (now - lastPressTime > 2000 && combo > 0) {
                setCombo(prev => Math.max(0, prev - 1));
            }
        }, 500);
        return () => clearInterval(interval);
    }, [lastPressTime, combo]);

    useEffect(() => {
        setIsClient(true);
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }, []);

    useEffect(() => {
        if (handle && isClient) {
            fetch('/api/buttons/account')
                .then(res => res.json())
                .then(data => {
                    if (data.user?.tokens !== undefined) {
                        setUserTokens(data.user.tokens);
                    }
                })
                .catch(err => console.log('Failed to fetch account:', err));
        }
    }, [handle, isClient]);

    // Progressive effects based on chaos level
    useEffect(() => {
        const intensity = { 
            calm: 0, 
            warming: 0.15, 
            weird: 0.3, 
            chaos: 0.5, 
            transcendence: 0.8 
        }[chaosLevel] || 0;
        
        setScanlineIntensity(intensity * 0.5);
        // Static noise removed
    }, [chaosLevel]);

    // Play synthesized click sound
    const playClickSound = useCallback(() => {
        if (muted || !audioContextRef.current) return;
        
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
        
        // Frequency slide for higher chaos
        if (chaosLevel !== 'calm') {
            oscillator.frequency.exponentialRampToValueAtTime(
                freq * (1 + Math.random() * 0.5), 
                ctx.currentTime + 0.1
            );
        }
        
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
    }, [muted, chaosLevel]);

    // Spawn particles
    const spawnParticles = useCallback(() => {
        const count = Math.min(5 + sessionPresses, 20);
        const newParticles: Particle[] = [];
        
        for (let i = 0; i < count; i++) {
            newParticles.push({
                id: Date.now() + i,
                x: 0,
                y: 0,
                angle: (Math.PI * 2 / count) * i + Math.random() * 0.5,
                speed: 2 + Math.random() * 4,
                size: 2 + Math.random() * 4,
                opacity: 1,
            });
        }
        
        setParticles(prev => [...prev, ...newParticles]);
        
        // Clear particles after animation
        setTimeout(() => {
            setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
        }, 1000);
    }, [sessionPresses]);

    // Screen shake effect
    const triggerScreenShake = useCallback(() => {
        const intensity = { 
            calm: 0, 
            warming: 2, 
            weird: 5, 
            chaos: 10, 
            transcendence: 15 
        }[chaosLevel] || 0;
        
        if (intensity > 0) {
            setScreenShake(intensity);
            setTimeout(() => setScreenShake(0), 150);
        }
    }, [chaosLevel]);

    // Check for achievements
    const checkAchievements = useCallback((presses: number) => {
        const achieved = ACHIEVEMENTS.find(a => a.presses === presses);
        if (achieved) {
            setShowAchievement(achieved);
            setTimeout(() => setShowAchievement(null), 3000);
        }
    }, []);

    const startMusic = () => {
        if (musicStarted || typeof window === 'undefined') return;
        const track = TECH_MUSIC[Math.floor(Math.random() * TECH_MUSIC.length)];
        musicRef.current = new Howl({
            src: [track],
            html5: true,
            loop: true,
            volume: 0.4,
        });
        musicRef.current.play();
        setMusicStarted(true);
    };

    const toggleMute = () => {
        if (musicRef.current) {
            musicRef.current.mute(!muted);
        }
        setMuted(!muted);
    };

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
            default: return 'EXECUTE';
        }
    }, [chaosLevel]);

    const getLayoutForChaosLevel = useCallback((): LayoutType => {
        const layouts: LayoutType[] = ['standard', 'command', 'function', 'binary', 'symbol', 'glitch', 'minimal', 'hacker'];
        if (chaosLevel === 'calm') return layouts[Math.floor(Math.random() * 2)];
        if (chaosLevel === 'warming') return layouts[Math.floor(Math.random() * 4)];
        if (chaosLevel === 'weird') return layouts[Math.floor(Math.random() * 6)];
        return layouts[Math.floor(Math.random() * layouts.length)];
    }, [chaosLevel]);

    const handlePress = async () => {
        startMusic();
        playClickSound();
        triggerGlitch();
        triggerScreenShake();
        spawnParticles();

        // Update combo
        const now = Date.now();
        if (now - lastPressTime < 1500) {
            setCombo(prev => Math.min(prev + 1, 99));
        } else {
            setCombo(1);
        }
        setLastPressTime(now);

        // Button pulse animation
        buttonControls.start({
            scale: [1, 1.05, 0.95, 1],
            transition: { duration: 0.3 }
        });

        if (!handle) {
            window.location.href = '/api/auth/handcash';
            return;
        }

        if (loading) return;
        setLoading(true);

        const newPresses = sessionPresses + 1;
        setSessionPresses(newPresses);
        checkAchievements(newPresses);

        // Update visuals
        setCurrentSymbol(TECH_SYMBOLS[Math.floor(Math.random() * TECH_SYMBOLS.length)]);
        setCurrentLayout(getLayoutForChaosLevel());
        scrambleText(getWordForChaosLevel());

        try {
            const res = await fetch('/api/buttons/press', { method: 'POST' });
            const data = await res.json();

            if (data.error) {
                scrambleText('ERROR');
            } else {
                if (data.tokens !== undefined) {
                    setUserTokens(data.tokens);
                }
            }
        } catch {
            scrambleText('FATAL');
        }

        setLoading(false);
        setTimeout(() => scrambleText(getWordForChaosLevel()), 1500);
    };

    if (!isClient) {
        return <div className="min-h-screen bg-black" />;
    }

    const tokensRemaining = tokenSupply?.tokensRemaining || 1_000_000_000;

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

    const strokeStyle = {
        color: 'black',
        WebkitTextStroke: '1.5px white',
        textStroke: '1.5px white',
    } as React.CSSProperties;

    const renderLayout = () => {
        switch (currentLayout) {
            case 'command':
                return (
                    <>
                        <div className="text-xs text-white/40 tracking-widest mb-2">$ sudo</div>
                        <div className="text-3xl md:text-5xl font-bold" style={strokeStyle}>{displayText}</div>
                        <div className="text-xs text-white/30 mt-2">--force</div>
                    </>
                );
            case 'function':
                return (
                    <>
                        <div className="text-xs text-white/40 mb-1">function()</div>
                        <div className="text-3xl md:text-5xl font-bold" style={strokeStyle}>{`{${displayText}}`}</div>
                        <div className="text-xs text-white/30 mt-1">return $;</div>
                    </>
                );
            case 'binary':
                return (
                    <>
                        <div className="text-[10px] text-white/20 mb-2">01101000 01100001 01100011 01101011</div>
                        <div className="text-3xl md:text-5xl font-bold" style={strokeStyle}>{displayText}</div>
                        <div className="text-[10px] text-white/20 mt-2">11001010 10110010 01001101</div>
                    </>
                );
            case 'symbol':
                return (
                    <div className="text-6xl md:text-8xl font-bold" style={strokeStyle}>{currentSymbol}</div>
                );
            case 'glitch':
                return (
                    <div className="relative">
                        <div className="text-3xl md:text-5xl font-bold relative" style={strokeStyle}>
                            {displayText}
                            <div className="absolute inset-0 text-white/20 translate-x-[2px]" style={{ WebkitTextStroke: '0' }}>{displayText}</div>
                            <div className="absolute inset-0 text-white/20 -translate-x-[2px]" style={{ WebkitTextStroke: '0' }}>{displayText}</div>
                        </div>
                    </div>
                );
            case 'minimal':
                return (
                    <div className="text-4xl md:text-6xl font-bold" style={strokeStyle}>{currentSymbol} {displayText}</div>
                );
            case 'hacker':
                return (
                    <>
                        <div className="text-xs text-white/50 mb-1">[BREACH DETECTED]</div>
                        <div className="text-3xl md:text-5xl font-bold" style={strokeStyle}>{displayText}</div>
                        <div className="text-xs text-white/30 mt-2">ACCESS LEVEL: {sessionPresses}</div>
                    </>
                );
            default:
                return (
                    <>
                        <div className="text-sm text-white/40 tracking-[0.3em] mb-2">{currentSymbol}</div>
                        <div className="text-3xl md:text-5xl font-bold tracking-wider" style={strokeStyle}>{displayText}</div>
                        <div className="text-xs text-white/30 mt-3">$0.01 = 1 TOKEN</div>
                    </>
                );
        }
    };

    return (
        <div 
            ref={containerRef}
            className={`min-h-screen bg-black text-white flex flex-col overflow-hidden ${glitchActive ? 'animate-pulse' : ''}`} 
            style={{ 
                fontFamily: "'DarkTech', monospace",
                transform: screenShake ? `translate(${(Math.random() - 0.5) * screenShake}px, ${(Math.random() - 0.5) * screenShake}px)` : undefined,
            }}
        >
            {/* Scanlines overlay */}
            {scanlineIntensity > 0 && (
                <div 
                    className="fixed inset-0 pointer-events-none z-50"
                    style={{
                        background: `repeating-linear-gradient(
                            0deg,
                            transparent,
                            transparent 2px,
                            rgba(0,0,0,${scanlineIntensity}) 2px,
                            rgba(0,0,0,${scanlineIntensity}) 4px
                        )`,
                    }}
                />
            )}



            {/* CRT vignette */}
            <div 
                className="fixed inset-0 pointer-events-none z-30"
                style={{
                    background: `radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,${0.2 + sessionPresses * 0.01}) 100%)`,
                }}
            />

            {/* Grid background */}
            <div
                className="fixed inset-0 pointer-events-none transition-opacity duration-500"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(255,255,255,${0.02 + sessionPresses * 0.002}) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,${0.02 + sessionPresses * 0.002}) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px',
                    opacity: Math.min(0.4, 0.1 + sessionPresses * 0.01),
                }}
            />

            {/* Achievement popup */}
            <AnimatePresence>
                {showAchievement && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -30 }}
                        className="fixed top-32 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 bg-white text-black rounded-full font-bold"
                    >
                        <Trophy className="w-5 h-5" />
                        <span className="text-2xl">{showAchievement.icon}</span>
                        <span>{showAchievement.title}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Combo display */}
            <AnimatePresence>
                {combo > 1 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2"
                    >
                        <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
                        <span className="text-2xl font-black text-white">{combo}x COMBO</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Status Bar */}
            <div className="py-4 px-6 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-3 text-xs">
                    <span className="text-white/40">SYS</span>
                    <span className="text-white/70">B0ASE_TECH</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                    <span className="text-white/40">TOKENS:</span>
                    <span className="font-bold text-white">{userTokens.toString().padStart(6, '0')}</span>
                    <span className="text-white/40">STATUS:</span>
                    <span className="text-white">{handle ? 'ONLINE' : 'OFFLINE'}</span>
                    <button onClick={toggleMute} className="text-white/40 hover:text-white/70 transition-colors ml-2" aria-label="Toggle mute">
                        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center relative pt-16">
                <div className="relative">
                    {/* Particle effects */}
                    {particles.map(particle => (
                        <motion.div
                            key={particle.id}
                            className="absolute left-1/2 top-1/2 rounded-full bg-white"
                            initial={{ x: 0, y: 0, opacity: 1 }}
                            animate={{ 
                                x: Math.cos(particle.angle) * particle.speed * 50,
                                y: Math.sin(particle.angle) * particle.speed * 50,
                                opacity: 0,
                            }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            style={{ width: particle.size, height: particle.size }}
                        />
                    ))}

                    {/* Outer rings */}
                    <motion.div
                        className={`absolute -inset-8 border ${getBorderColor()} rounded-full`}
                        animate={chaosLevel !== 'calm' ? { rotate: 360 } : {}}
                        transition={{ duration: 20 - sessionPresses * 0.3, repeat: Infinity, ease: 'linear' }}
                    />
                    <motion.div
                        className={`absolute -inset-16 border ${getBorderColor()} rounded-full opacity-50`}
                        animate={chaosLevel !== 'calm' ? { rotate: -360 } : {}}
                        transition={{ duration: 30 - sessionPresses * 0.4, repeat: Infinity, ease: 'linear' }}
                    />
                    {chaosLevel !== 'calm' && chaosLevel !== 'warming' && (
                        <motion.div
                            className={`absolute -inset-24 border ${getBorderColor()} rounded-full opacity-25`}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 40 - sessionPresses * 0.5, repeat: Infinity, ease: 'linear' }}
                        />
                    )}

                    {/* EXECUTE label */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] text-white opacity-50">
                        EXECUTE
                    </div>

                    {/* Main Button */}
                    <motion.button
                        onClick={handlePress}
                        animate={buttonControls}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={loading}
                        className={`relative w-[280px] h-[280px] md:w-[340px] md:h-[340px] rounded-full
                                   bg-black border ${getBorderColor()}
                                   flex flex-col items-center justify-center
                                   transition-all duration-300 cursor-pointer
                                   disabled:opacity-50`}
                        style={getGlowStyle()}
                    >
                        {/* Corner markers */}
                        <div className={`absolute top-8 left-8 w-3 h-3 border-l border-t ${getBorderColor()}`} />
                        <div className={`absolute top-8 right-8 w-3 h-3 border-r border-t ${getBorderColor()}`} />
                        <div className={`absolute bottom-8 left-8 w-3 h-3 border-l border-b ${getBorderColor()}`} />
                        <div className={`absolute bottom-8 right-8 w-3 h-3 border-r border-b ${getBorderColor()}`} />

                        {/* Dynamic text content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${currentLayout}-${sessionPresses}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.15 }}
                                className="text-center"
                            >
                                {renderLayout()}
                            </motion.div>
                        </AnimatePresence>

                        {/* Loading indicator */}
                        {loading && (
                            <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
                                <Zap className="w-4 h-4 animate-pulse text-white/50" />
                            </div>
                        )}
                    </motion.button>

                    {/* CONFIRM label */}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] text-white opacity-50">
                        CONFIRM
                    </div>
                </div>
            </div>

            {/* Bottom Stats Bar */}
            <div className="py-4 px-6 relative z-10">
                <div className="flex justify-between items-end max-w-2xl mx-auto text-xs">
                    <div>
                        <span className="text-white/40">REMAINING</span>
                        <div className="text-base font-bold mt-0.5 text-white">{Number(tokensRemaining).toLocaleString()}</div>
                    </div>
                    <div>
                        <span className="text-white/40">PRESSES</span>
                        <div className="text-base font-bold mt-0.5">{sessionPresses}</div>
                    </div>
                    <div>
                        <span className="text-white/40">LEVEL</span>
                        <div className="text-base font-bold mt-0.5 text-white uppercase">{chaosLevel}</div>
                    </div>
                    <div className="text-right">
                        <span className="text-white/40">NETWORK</span>
                        <div className="text-sm font-bold mt-0.5 flex items-center gap-1.5 justify-end text-white">
                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${chaosLevel === 'transcendence' ? 'bg-white' : 'bg-white/70'}`} />
                            BSV MAINNET
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
