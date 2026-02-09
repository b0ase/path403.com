'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowRight, FiDownload, FiRefreshCw, FiCircle, FiSquare, FiHexagon } from 'react-icons/fi';

// Preset button styles
const BUTTON_PRESETS = [
  { name: 'Classic', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: '#ffffff33', shadow: true },
  { name: 'Neon Green', bg: 'linear-gradient(135deg, #00ff87 0%, #60efff 100%)', border: '#00ff8755', shadow: true },
  { name: 'Fire', bg: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)', border: '#f1271133', shadow: true },
  { name: 'Ocean', bg: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)', border: '#2193b033', shadow: true },
  { name: 'Sunset', bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', border: '#fa709a33', shadow: true },
  { name: 'Midnight', bg: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', border: '#ffffff22', shadow: true },
  { name: 'Gold', bg: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)', border: '#f7971e55', shadow: true },
  { name: 'Silver', bg: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)', border: '#bdc3c755', shadow: true },
];

const SHAPES = [
  { name: 'Circle', icon: FiCircle, borderRadius: '50%' },
  { name: 'Rounded', icon: FiSquare, borderRadius: '16px' },
  { name: 'Pill', icon: FiSquare, borderRadius: '9999px' },
  { name: 'Hexagon', icon: FiHexagon, borderRadius: '0' },
];

export default function ButtonGraphicCreatorPage() {
  const [buttonText, setButtonText] = useState('$TOKEN');
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [selectedShape, setSelectedShape] = useState(0);
  const [buttonSize, setButtonSize] = useState(120);
  const [fontSize, setFontSize] = useState(16);
  const [showGlow, setShowGlow] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const preset = BUTTON_PRESETS[selectedPreset];
  const shape = SHAPES[selectedShape];

  const generateButtonStyle = () => {
    return {
      width: `${buttonSize}px`,
      height: `${buttonSize}px`,
      background: preset.bg,
      border: `3px solid ${preset.border}`,
      borderRadius: shape.borderRadius,
      boxShadow: showGlow ? `0 0 30px ${preset.border}, 0 4px 20px rgba(0,0,0,0.5)` : '0 4px 20px rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${fontSize}px`,
      fontWeight: 'bold',
      color: 'white',
      textShadow: '0 2px 4px rgba(0,0,0,0.5)',
      cursor: 'pointer',
    };
  };

  const downloadButton = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = buttonSize * 2; // 2x for high resolution
    canvas.width = size;
    canvas.height = size;

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    if (preset.bg.includes('linear-gradient')) {
      // Parse gradient colors (simplified)
      const colors = preset.bg.match(/#[a-fA-F0-9]{6}/g) || ['#667eea', '#764ba2'];
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(1, colors[colors.length - 1]);
    }

    // Draw shape
    ctx.fillStyle = gradient;
    if (shape.borderRadius === '50%') {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const radius = shape.borderRadius === '9999px' ? size / 2 : parseInt(shape.borderRadius) * 2 || 0;
      ctx.beginPath();
      ctx.roundRect(6, 6, size - 12, size - 12, radius);
      ctx.fill();
    }

    // Draw text
    ctx.fillStyle = 'white';
    ctx.font = `bold ${fontSize * 2}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText(buttonText, size / 2, size / 2);

    // Download
    const link = document.createElement('a');
    link.download = `button-${buttonText.replace(/[^a-zA-Z0-9]/g, '')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <motion.div
      className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="px-4 md:px-8 py-16">
        {/* Header */}
        <motion.div
          className="mb-12 border-b border-gray-800 pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
            <div className="bg-zinc-950/50 p-4 md:p-6 border border-zinc-900 rounded-pillar self-start">
              <FiCircle className="text-4xl md:text-6xl text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-8xl font-black uppercase tracking-tighter mb-2">
                ASSET<span className="text-zinc-800">.VIS</span>
              </h1>
              <p className="text-zinc-500 uppercase text-xs tracking-widest">Visual Component Assembly Unit</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-gray-400 max-w-2xl">
              Create custom button graphics for your tokens, products, or MoneyButtons. Download as PNG for use anywhere.
            </p>
            <div className="flex gap-3">
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-zinc-900 text-zinc-500 hover:text-white hover:border-zinc-700 transition-all rounded-pillar"
              >
                &larr; PROTOCOL_HOME
              </Link>
              <Link
                href="/moneybuttons"
                className="inline-flex items-center gap-2 px-6 py-2 text-[10px] font-bold uppercase tracking-widest bg-white text-black hover:bg-zinc-200 transition-all rounded-pillar"
              >
                EXECUTE_PAYMENT <FiArrowRight size={14} />
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Preview */}
          <motion.div
            className="border border-zinc-900 p-8 bg-zinc-950/40 rounded-pillar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Preview</h2>

            <div className="flex items-center justify-center min-h-[300px] bg-zinc-950 border border-zinc-800 rounded-lg">
              <motion.div
                style={generateButtonStyle()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {buttonText}
              </motion.div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={downloadButton}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-white text-black font-bold hover:bg-zinc-200 transition-colors"
              >
                <FiDownload size={16} /> Download PNG
              </button>
              <button
                onClick={() => {
                  setSelectedPreset(Math.floor(Math.random() * BUTTON_PRESETS.length));
                  setSelectedShape(Math.floor(Math.random() * SHAPES.length));
                }}
                className="px-4 py-3 border border-zinc-700 text-zinc-300 hover:text-white hover:border-white transition-colors"
              >
                <FiRefreshCw size={16} />
              </button>
            </div>

            {/* Hidden canvas for download */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </motion.div>

          {/* Controls */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Text Input */}
            <div className="border border-gray-800 p-6 bg-gray-900/20">
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Button Text</h3>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="Enter text..."
                className="w-full px-4 py-3 bg-black border border-zinc-700 text-white placeholder-zinc-500 focus:border-white focus:outline-none"
                maxLength={12}
              />
              <p className="text-xs text-zinc-500 mt-2">Max 12 characters</p>
            </div>

            {/* Style Presets */}
            <div className="border border-gray-800 p-6 bg-gray-900/20">
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Style Preset</h3>
              <div className="grid grid-cols-4 gap-2">
                {BUTTON_PRESETS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedPreset(i)}
                    className={`h-12 rounded transition-all ${selectedPreset === i ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`}
                    style={{ background: p.bg }}
                    title={p.name}
                  />
                ))}
              </div>
            </div>

            {/* Shape */}
            <div className="border border-gray-800 p-6 bg-gray-900/20">
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Shape</h3>
              <div className="grid grid-cols-4 gap-2">
                {SHAPES.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedShape(i)}
                    className={`h-12 border flex items-center justify-center transition-all ${selectedShape === i
                        ? 'border-white bg-white text-black'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                      }`}
                  >
                    <s.icon size={20} />
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="border border-gray-800 p-6 bg-gray-900/20">
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Size</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-500 mb-2 block">Button Size: {buttonSize}px</label>
                  <input
                    type="range"
                    min="60"
                    max="200"
                    value={buttonSize}
                    onChange={(e) => setButtonSize(Number(e.target.value))}
                    className="w-full accent-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-2 block">Font Size: {fontSize}px</label>
                  <input
                    type="range"
                    min="10"
                    max="32"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-white"
                  />
                </div>
              </div>
            </div>

            {/* Glow Toggle */}
            <div className="border border-gray-800 p-6 bg-gray-900/20">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Glow Effect</h3>
                <button
                  onClick={() => setShowGlow(!showGlow)}
                  className={`w-12 h-6 rounded-full transition-colors ${showGlow ? 'bg-green-500' : 'bg-zinc-700'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${showGlow ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Use Cases */}
        <motion.div
          className="mt-12 border border-gray-800 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-xl font-bold mb-6">Use Your Button Graphics For</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { title: 'MoneyButtons', desc: 'Custom tokens and micropayment buttons' },
              { title: 'Social Media', desc: 'Profile pictures and post graphics' },
              { title: 'Websites', desc: 'CTAs and interactive elements' },
              { title: 'Marketing', desc: 'Promotional materials and ads' },
            ].map((item, i) => (
              <div key={i} className="p-4 bg-zinc-900/50 border border-zinc-800">
                <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-zinc-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
