'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiImage, FiType, FiDownload, FiLayout, FiMaximize2,
    FiMinimize2, FiLayers, FiZap, FiRefreshCw, FiCheck, FiPlus
} from 'react-icons/fi';
import Link from 'next/link';

const PRESET_IMAGES = [
    { id: 'kintsugi-1', url: '/kintsugi-1.jpg', label: 'Kintsugi Bowl' },
    { id: 'og-fallback', url: '/og-fallback.jpg', label: 'B0ASE Default' },
    { id: 'bitcoin-os', url: '/bitcoin-os.png', label: 'Bitcoin OS' },
    { id: 'bapps', url: '/bapps.png', label: 'Bitcoin Apps' },
    { id: 'boase-icon', url: '/boase_icon.png', label: 'B0ASE Icon' },
];

const PRESET_FONTS = [
    { id: 'inter', name: 'Inter', class: 'font-sans' },
    { id: 'grotesk', name: 'Space Grotesk', class: 'font-display' },
    { id: 'mono', name: 'JetBrains Mono', class: 'font-mono' },
    { id: 'orbitron', name: 'Orbitron', class: 'font-orbitron' },
];

const PRESET_LAYOUTS = [
    { id: 'centered', name: 'Centered', icon: <FiMaximize2 /> },
    { id: 'bottom-left', name: 'Bottom Left', icon: <FiMaximize2 className="rotate-180" /> },
    { id: 'split', name: 'Split Screen', icon: <FiLayers /> },
];

export default function GraphicDesignerPage() {
    const [title, setTitle] = useState('New Project Title');
    const [subtitle, setSubtitle] = useState('A brief description of something amazing built at b0ase.com');
    const [selectedImage, setSelectedImage] = useState(PRESET_IMAGES[0].url);
    const [selectedFont, setSelectedFont] = useState(PRESET_FONTS[1]);
    const [selectedLayout, setSelectedLayout] = useState('centered');
    const [isCopied, setIsCopied] = useState(false);
    const [customImageUrl, setCustomImageUrl] = useState('');
    const [brandText, setBrandText] = useState('B0ASE / LABS');
    const [overlayOpacity, setOverlayOpacity] = useState(0.5);
    const [tagText, setTagText] = useState('#REPAIR #GOLDEN #STARTUP');

    const canvasRef = useRef<HTMLDivElement>(null);

    const handleCustomImageSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (customImageUrl) setSelectedImage(customImageUrl);
    };

    return (
        <div className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black">
            <div className="max-w-[1400px] mx-auto px-4 py-12">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-zinc-900 pb-8 uppercase tracking-tighter">
                    <div className="flex items-end gap-6">
                        <div className="bg-zinc-900 p-4 border border-zinc-800">
                            <FiImage className="text-4xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-8xl font-black leading-none tracking-tighter">
                                DESIGNER<span className="text-zinc-800">.SYS</span>
                            </h1>
                            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-2">Visual Logic Compiler / V1.0</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/tools" className="px-6 py-2 border border-zinc-900 text-[10px] font-bold uppercase tracking-widest hover:border-white transition-all rounded-pillar">
                            &larr; PROTOCOL_HOME
                        </Link>
                    </div>
                </div>

                <div className="grid lg:grid-cols-[1fr_400px] gap-12">

                    {/* Preview Area */}
                    <div className="space-y-8">
                        <div className="aspect-[1200/630] w-full bg-zinc-900 border border-zinc-800 relative overflow-hidden shadow-2xl" id="og-preview-canvas" ref={canvasRef}>

                            {/* Background */}
                            <motion.div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundImage: `url(${selectedImage})` }}
                                initial={false}
                                animate={{ opacity: 1 }}
                                key={selectedImage}
                            />

                            {/* Overlay */}
                            <div
                                className="absolute inset-0"
                                style={{ background: `linear-gradient(to bottom, rgba(0,0,0,${overlayOpacity * 0.6}), rgba(0,0,0,${overlayOpacity}))` }}
                            />

                            {/* Layout Container */}
                            <div className={`absolute inset-0 flex p-12 lg:p-16 ${selectedLayout === 'centered' ? 'items-center justify-center text-center' :
                                selectedLayout === 'bottom-left' ? 'items-end justify-start text-left' :
                                    'items-center justify-start text-left'
                                }`}>

                                <div className={`relative z-10 max-w-4xl ${selectedLayout === 'split' ? 'lg:w-2/3' : ''}`}>

                                    {/* Brand Tag */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-8 absolute top-[-60px] left-0"
                                    >
                                        <span className="text-xs font-mono font-bold tracking-[0.3em] text-white/70 border-l-2 border-white pl-3 uppercase">
                                            {brandText}
                                        </span>
                                    </motion.div>

                                    {/* Title */}
                                    <motion.h2
                                        className={`text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-[1.05] tracking-tight ${selectedFont.class}`}
                                        style={{ textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={title}
                                    >
                                        {title}
                                    </motion.h2>

                                    {/* Subtitle */}
                                    <motion.p
                                        className="text-xl md:text-2xl text-zinc-300 font-medium leading-relaxed max-w-2xl"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        key={subtitle}
                                        style={{ margin: selectedLayout === 'centered' ? '0 auto' : '0' }}
                                    >
                                        {subtitle}
                                    </motion.p>

                                    {/* Footer Stats / Tags */}
                                    <motion.div
                                        className={`mt-12 flex gap-4 ${selectedLayout === 'centered' ? 'justify-center' : 'justify-start'}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <div className="px-4 py-2 bg-white text-black font-black text-[10px] tracking-[0.2em] uppercase rounded-pillar">
                                            {tagText}
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Corner Accents */}
                                <div className="absolute top-8 right-8 flex flex-col items-end gap-1 opacity-30 font-mono text-[10px]">
                                    <span>REF: 01-B0-26</span>
                                    <span>LOC: LONDON // HQ</span>
                                </div>
                            </div>

                            {/* Border Grid Accent */}
                            <div className="absolute inset-0 border border-white/5 pointer-events-none" />
                            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/5" />
                            <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-white/5" />
                        </div>

                        <div className="flex flex-wrap gap-4 items-center justify-between text-zinc-500 font-mono text-xs">
                            <div className="flex gap-4">
                                <span>W: 1200PX</span>
                                <span>H: 630PX</span>
                                <span>RATIO: 1.91:1</span>
                            </div>
                            <div className="flex gap-4 italic">
                                * Styled for WhatsApp, Twitter, and LinkedIn embedding
                            </div>
                        </div>
                    </div>

                    {/* Controls Sidebar */}
                    <div className="space-y-10 bg-zinc-950 p-6 md:p-8 border border-zinc-900 overflow-y-auto max-h-[85vh] sticky top-8">

                        {/* Content Section */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2 mb-6 border-b border-zinc-900 pb-2">
                                <FiType className="text-white" /> TEXT_LAYERS
                            </h3>

                            <div className="space-y-4">
                                <div className="grid gap-1.5">
                                    <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-600">Main Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-800 p-2 text-sm focus:border-white transition-colors outline-none font-bold"
                                    />
                                </div>

                                <div className="grid gap-1.5">
                                    <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-600">Subtitle / Description</label>
                                    <textarea
                                        value={subtitle}
                                        onChange={(e) => setSubtitle(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-800 p-2 text-sm h-24 focus:border-white transition-colors outline-none resize-none leading-relaxed"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-1.5">
                                        <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-600">Brand Tag</label>
                                        <input
                                            type="text"
                                            value={brandText}
                                            onChange={(e) => setBrandText(e.target.value)}
                                            className="w-full bg-zinc-900 border border-zinc-800 p-2 text-[10px] focus:border-white transition-colors outline-none font-mono"
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-600">Tags / Pledges</label>
                                        <input
                                            type="text"
                                            value={tagText}
                                            onChange={(e) => setTagText(e.target.value)}
                                            className="w-full bg-zinc-900 border border-zinc-800 p-2 text-[10px] focus:border-white transition-colors outline-none font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Layout & Style */}
                        <div className="space-y-6 pt-6 border-t border-zinc-900">
                            <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2 mb-6 border-b border-zinc-900 pb-2">
                                <FiLayout className="text-white" /> SYSTEM_CONFIG
                            </h3>

                            <div className="space-y-6">
                                <div className="grid gap-3">
                                    <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-600">Typography</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {PRESET_FONTS.map(font => (
                                            <button
                                                key={font.id}
                                                onClick={() => setSelectedFont(font)}
                                                className={`text-[10px] py-3 px-3 border transition-all duration-200 rounded-pillar font-bold tracking-widest uppercase ${selectedFont.id === font.id ? 'bg-white text-black border-white' : 'bg-black border-zinc-900 text-zinc-600 hover:border-zinc-500'
                                                    } ${font.class}`}
                                            >
                                                {font.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid gap-3">
                                    <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-600">Composition</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {PRESET_LAYOUTS.map(layout => (
                                            <button
                                                key={layout.id}
                                                onClick={() => setSelectedLayout(layout.id)}
                                                className={`flex flex-col items-center justify-center gap-2 p-3 border transition-all duration-200 rounded-pillar ${selectedLayout === layout.id ? 'bg-white text-black border-white' : 'bg-black border-zinc-900 text-zinc-600 hover:border-zinc-500'
                                                    }`}
                                            >
                                                <span className="text-lg">{layout.icon}</span>
                                                <span className="text-[9px] font-bold uppercase tracking-tighter">{layout.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid gap-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-600">Overlay Depth</label>
                                        <span className="text-[10px] text-zinc-400">{Math.round(overlayOpacity * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={overlayOpacity}
                                        onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                                        className="w-full accent-white h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Background Image Selection */}
                        <div className="space-y-6 pt-6 border-t border-zinc-900">
                            <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2 mb-6 border-b border-zinc-900 pb-2">
                                <FiImage className="text-white" /> IMAGE_REGISTRY
                            </h3>

                            <div className="space-y-4">
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {PRESET_IMAGES.map(img => (
                                        <button
                                            key={img.id}
                                            onClick={() => setSelectedImage(img.url)}
                                            className={`flex-shrink-0 w-16 h-16 border-2 transition-all ${selectedImage === img.url ? 'border-white scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                                                }`}
                                        >
                                            <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCustomImageUrl('https://')}
                                        className="flex-shrink-0 w-16 h-16 bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition-colors"
                                    >
                                        <FiPlus className="text-zinc-500" />
                                    </button>
                                </div>

                                <form onSubmit={handleCustomImageSubmit} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Custom Image URL..."
                                        value={customImageUrl}
                                        onChange={(e) => setCustomImageUrl(e.target.value)}
                                        className="flex-1 bg-zinc-900 border border-zinc-800 p-2 text-[10px] focus:border-white transition-colors outline-none font-mono"
                                    />
                                    <button type="submit" className="bg-zinc-800 px-3 hover:bg-white hover:text-black transition-colors">
                                        <FiZap size={14} />
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-8 space-y-3">
                            <button
                                onClick={() => {
                                    setIsCopied(true);
                                    setTimeout(() => setIsCopied(false), 2000);
                                }}
                                className="w-full bg-white text-black py-5 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all rounded-pillar"
                            >
                                {isCopied ? (
                                    <><FiCheck /> COMPILATION_COMPLETE</>
                                ) : (
                                    <><FiDownload /> EXPORT_EXECUTABLE</>
                                )}
                            </button>
                            <div className="text-[10px] text-zinc-600 text-center uppercase tracking-widest">
                                Direct export to Next/OG component ready
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
