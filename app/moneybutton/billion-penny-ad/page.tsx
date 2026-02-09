'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDollarSign } from 'react-icons/fa';
import {
  FiGrid,
  FiDollarSign,
  FiImage,
  FiLink,
  FiZoomIn,
  FiZoomOut,
  FiMove,
  FiCheck,
  FiX,
  FiShoppingCart,
  FiInfo,
} from 'react-icons/fi';

const GRID_SIZE = 1000; // 1000x1000 = 1 million pixels
const PRICE_PER_PIXEL = 0.01; // $0.01 per pixel
const MIN_BLOCK_SIZE = 1; // Minimum 1x1 (single pixel)
const CANVAS_DISPLAY_SIZE = 800; // Display size in pixels

interface PixelBlock {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  imageUrl?: string;
  link?: string;
  owner: string;
  title?: string;
}

// Demo blocks to show the concept
const DEMO_BLOCKS: PixelBlock[] = [
  { id: '1', x: 50, y: 50, width: 100, height: 50, color: '#ef4444', owner: 'demo', title: 'First Ad!', link: 'https://example.com' },
  { id: '2', x: 200, y: 100, width: 80, height: 80, color: '#3b82f6', owner: 'demo', title: 'Blue Block' },
  { id: '3', x: 350, y: 50, width: 120, height: 60, color: '#22c55e', owner: 'demo', title: 'Green Zone', link: 'https://example.com' },
  { id: '4', x: 100, y: 200, width: 150, height: 100, color: '#a855f7', owner: 'demo', title: 'Purple Power' },
  { id: '5', x: 300, y: 180, width: 100, height: 100, color: '#f59e0b', owner: 'demo', title: 'Gold Rush' },
  { id: '6', x: 450, y: 120, width: 60, height: 120, color: '#ec4899', owner: 'demo', title: 'Pink Tower' },
  { id: '7', x: 550, y: 50, width: 200, height: 80, color: '#06b6d4', owner: 'demo', title: 'Cyan Billboard' },
  { id: '8', x: 500, y: 200, width: 100, height: 60, color: '#84cc16', owner: 'demo', title: 'Lime Ad' },
];

export default function BillionDollarAdPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [blocks, setBlocks] = useState<PixelBlock[]>(DEMO_BLOCKS);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Selection state
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);

  // Purchase form state
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [purchaseColor, setPurchaseColor] = useState('#3b82f6');
  const [purchaseLink, setPurchaseLink] = useState('');
  const [purchaseTitle, setPurchaseTitle] = useState('');
  const [purchaseHandle, setPurchaseHandle] = useState('');
  const [hoveredBlock, setHoveredBlock] = useState<PixelBlock | null>(null);

  // Stats
  const totalPixels = GRID_SIZE * GRID_SIZE;
  const soldPixels = blocks.reduce((sum, b) => sum + b.width * b.height, 0);
  const availablePixels = totalPixels - soldPixels;
  const totalValue = totalPixels * PRICE_PER_PIXEL;
  const soldValue = soldPixels * PRICE_PER_PIXEL;

  // Convert screen coordinates to grid coordinates
  const screenToGrid = useCallback((screenX: number, screenY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = (screenX - rect.left - pan.x) / zoom;
    const y = (screenY - rect.top - pan.y) / zoom;

    return {
      x: Math.floor(x / (CANVAS_DISPLAY_SIZE / GRID_SIZE)),
      y: Math.floor(y / (CANVAS_DISPLAY_SIZE / GRID_SIZE)),
    };
  }, [pan, zoom]);

  // Draw the canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = CANVAS_DISPLAY_SIZE / GRID_SIZE;

    // Clear
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines (subtle)
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i += 100) {
      ctx.beginPath();
      ctx.moveTo(i * scale, 0);
      ctx.lineTo(i * scale, CANVAS_DISPLAY_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * scale);
      ctx.lineTo(CANVAS_DISPLAY_SIZE, i * scale);
      ctx.stroke();
    }

    // Draw sold blocks
    blocks.forEach(block => {
      ctx.fillStyle = block.color;
      ctx.fillRect(
        block.x * scale,
        block.y * scale,
        block.width * scale,
        block.height * scale
      );

      // Border
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        block.x * scale,
        block.y * scale,
        block.width * scale,
        block.height * scale
      );
    });

    // Draw selection
    if (selection) {
      ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.fillRect(
        selection.x * scale,
        selection.y * scale,
        selection.width * scale,
        selection.height * scale
      );
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        selection.x * scale,
        selection.y * scale,
        selection.width * scale,
        selection.height * scale
      );
      ctx.setLineDash([]);
    }
  }, [blocks, selection]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.ctrlKey) {
      // Middle click or ctrl+click = pan
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    } else if (e.button === 0) {
      // Left click = select
      const grid = screenToGrid(e.clientX, e.clientY);
      if (grid.x >= 0 && grid.x < GRID_SIZE && grid.y >= 0 && grid.y < GRID_SIZE) {
        setIsSelecting(true);
        setSelectionStart(grid);
        setSelection({ x: grid.x, y: grid.y, width: MIN_BLOCK_SIZE, height: MIN_BLOCK_SIZE });
      }
    }
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    } else if (isSelecting && selectionStart) {
      const grid = screenToGrid(e.clientX, e.clientY);
      const x = Math.min(selectionStart.x, grid.x);
      const y = Math.min(selectionStart.y, grid.y);
      const width = Math.max(MIN_BLOCK_SIZE, Math.abs(grid.x - selectionStart.x) + 1);
      const height = Math.max(MIN_BLOCK_SIZE, Math.abs(grid.y - selectionStart.y) + 1);

      // Clamp to grid
      const clampedWidth = Math.min(width, GRID_SIZE - x);
      const clampedHeight = Math.min(height, GRID_SIZE - y);

      setSelection({ x, y, width: clampedWidth, height: clampedHeight });
    } else {
      // Check for hover
      const grid = screenToGrid(e.clientX, e.clientY);
      const hovered = blocks.find(b =>
        grid.x >= b.x && grid.x < b.x + b.width &&
        grid.y >= b.y && grid.y < b.y + b.height
      );
      setHoveredBlock(hovered || null);
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    if (isSelecting && selection) {
      setShowPurchaseForm(true);
    }
    setIsDragging(false);
    setIsSelecting(false);
    setSelectionStart(null);
  };

  // Handle zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.max(0.5, Math.min(5, z * delta)));
  };

  // Cancel selection
  const cancelSelection = () => {
    setSelection(null);
    setShowPurchaseForm(false);
    setPurchaseTitle('');
    setPurchaseLink('');
  };

  // Confirm purchase
  const confirmPurchase = () => {
    if (!selection || !purchaseHandle) return;

    const newBlock: PixelBlock = {
      id: Date.now().toString(),
      x: selection.x,
      y: selection.y,
      width: selection.width,
      height: selection.height,
      color: purchaseColor,
      link: purchaseLink || undefined,
      title: purchaseTitle || undefined,
      owner: purchaseHandle,
    };

    setBlocks(prev => [...prev, newBlock]);
    cancelSelection();
  };

  const selectionPixels = selection ? selection.width * selection.height : 0;
  const selectionCost = selectionPixels * PRICE_PER_PIXEL;

  return (
    <motion.div
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >

      <div className="px-4 md:px-8 py-16 relative z-10">
        {/* Header */}
        <motion.div
          className="mb-8 border-b border-zinc-900 pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
            <div className="bg-gradient-to-br from-amber-600 to-yellow-500 p-4 md:p-6 self-start">
              <span className="text-4xl md:text-6xl">1¢</span>
            </div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 leading-none tracking-tighter">
                BILLION PENNY AD
              </h1>
              <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                1¢ PER PIXEL
              </div>
            </div>
          </div>
          <p className="text-zinc-400 max-w-2xl">
            Own a piece of internet history. Buy pixels for a penny each.
            1 million pixels. 1 penny each. Your brand, forever on the blockchain.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left: Stats & Controls */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Stats */}
            <div className="border border-zinc-800 bg-black p-6">
              <h3 className="text-sm font-bold uppercase mb-4 text-white">Market Stats</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-zinc-500 uppercase">Total Value</p>
                  <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                    ${totalValue.toLocaleString()}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase">Sold</p>
                    <p className="text-lg font-bold text-green-400">${soldValue.toFixed(2)}</p>
                    <p className="text-xs text-zinc-600">{soldPixels.toLocaleString()} px</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase">Available</p>
                    <p className="text-lg font-bold text-blue-400">${(availablePixels * PRICE_PER_PIXEL).toFixed(2)}</p>
                    <p className="text-xs text-zinc-600">{availablePixels.toLocaleString()} px</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-zinc-800">
                  <div className="flex justify-between text-xs text-zinc-500 mb-1">
                    <span>Sold</span>
                    <span>{((soldPixels / totalPixels) * 100).toFixed(2)}%</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                      style={{ width: `${(soldPixels / totalPixels) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="border border-zinc-800 bg-black p-6">
              <h3 className="text-sm font-bold uppercase mb-4 text-white">Controls</h3>
              <div className="space-y-3 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <FiMove className="text-blue-400" />
                  <span>Click & drag to select pixels</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiZoomIn className="text-blue-400" />
                  <span>Scroll to zoom in/out</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiGrid className="text-blue-400" />
                  <span>Buy single pixels or blocks</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setZoom(z => Math.min(5, z * 1.2))}
                  className="flex-1 border border-zinc-800 py-2 text-xs hover:border-zinc-600 transition-colors flex items-center justify-center gap-1"
                >
                  <FiZoomIn /> Zoom In
                </button>
                <button
                  onClick={() => setZoom(z => Math.max(0.5, z / 1.2))}
                  className="flex-1 border border-zinc-800 py-2 text-xs hover:border-zinc-600 transition-colors flex items-center justify-center gap-1"
                >
                  <FiZoomOut /> Zoom Out
                </button>
              </div>
              <button
                onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                className="w-full border border-zinc-800 py-2 text-xs hover:border-zinc-600 transition-colors mt-2"
              >
                Reset View
              </button>
            </div>

            {/* Hovered Block Info */}
            <AnimatePresence>
              {hoveredBlock && (
                <motion.div
                  className="border border-zinc-800 bg-black p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: hoveredBlock.color }}
                    />
                    <div>
                      <p className="text-sm font-bold">{hoveredBlock.title || 'Untitled'}</p>
                      <p className="text-xs text-zinc-500">by ${hoveredBlock.owner}</p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 mt-2">
                    {hoveredBlock.width}x{hoveredBlock.height} = {hoveredBlock.width * hoveredBlock.height} pixels
                  </p>
                  {hoveredBlock.link && (
                    <a
                      href={hoveredBlock.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:underline mt-1 flex items-center gap-1"
                    >
                      <FiLink size={10} /> Visit Link
                    </a>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Center: Canvas */}
          <motion.div
            className="xl:col-span-2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div
              ref={containerRef}
              className="border border-zinc-800 bg-zinc-900 p-4 overflow-hidden"
              style={{ cursor: isDragging ? 'grabbing' : isSelecting ? 'crosshair' : 'grab' }}
            >
              <div
                style={{
                  transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                  transformOrigin: 'top left',
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={CANVAS_DISPLAY_SIZE}
                  height={CANVAS_DISPLAY_SIZE}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onWheel={handleWheel}
                  className="block"
                />
              </div>
            </div>

            {/* Grid info */}
            <div className="mt-4 flex justify-between text-xs text-zinc-500">
              <span>{GRID_SIZE}x{GRID_SIZE} grid ({totalPixels.toLocaleString()} pixels)</span>
              <span>Zoom: {(zoom * 100).toFixed(0)}%</span>
            </div>
          </motion.div>

          {/* Right: Purchase Form */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AnimatePresence mode="wait">
              {showPurchaseForm && selection ? (
                <motion.div
                  key="form"
                  className="border border-yellow-500/30 bg-yellow-900/10 p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold uppercase text-white flex items-center gap-2">
                      <FiShoppingCart className="text-yellow-400" />
                      Purchase Pixels
                    </h3>
                    <button onClick={cancelSelection} className="text-zinc-500 hover:text-white">
                      <FiX />
                    </button>
                  </div>

                  {/* Selection Info */}
                  <div className="bg-black/50 p-4 mb-4 border border-zinc-800">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-zinc-500">Position</p>
                        <p className="text-white">{selection.x}, {selection.y}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Size</p>
                        <p className="text-white">{selection.width}x{selection.height}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Pixels</p>
                        <p className="text-white">{selectionPixels.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Cost</p>
                        <p className="text-2xl font-bold text-yellow-400">${selectionCost.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Color */}
                    <div>
                      <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                        Block Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={purchaseColor}
                          onChange={(e) => setPurchaseColor(e.target.value)}
                          className="w-12 h-10 bg-black border border-zinc-800 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={purchaseColor}
                          onChange={(e) => setPurchaseColor(e.target.value)}
                          className="flex-1 bg-black border border-zinc-800 px-3 text-white text-sm"
                        />
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                        Ad Title
                      </label>
                      <input
                        type="text"
                        value={purchaseTitle}
                        onChange={(e) => setPurchaseTitle(e.target.value)}
                        placeholder="Your Brand Name"
                        className="w-full bg-black border border-zinc-800 px-4 py-2 text-white placeholder-zinc-600 text-sm"
                      />
                    </div>

                    {/* Link */}
                    <div>
                      <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                        Link URL
                      </label>
                      <input
                        type="url"
                        value={purchaseLink}
                        onChange={(e) => setPurchaseLink(e.target.value)}
                        placeholder="https://yoursite.com"
                        className="w-full bg-black border border-zinc-800 px-4 py-2 text-white placeholder-zinc-600 text-sm"
                      />
                    </div>

                    {/* HandCash Handle */}
                    <div>
                      <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                        Your HandCash Handle *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                        <input
                          type="text"
                          value={purchaseHandle}
                          onChange={(e) => setPurchaseHandle(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                          placeholder="yourhandle"
                          className="w-full bg-black border border-zinc-800 pl-7 pr-4 py-2 text-white placeholder-zinc-600 text-sm"
                        />
                      </div>
                    </div>

                    {/* Buy Button */}
                    <button
                      onClick={confirmPurchase}
                      disabled={!purchaseHandle}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black py-3 text-sm font-bold uppercase tracking-wider hover:from-yellow-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                      <FaDollarSign /> Buy for ${selectionCost.toFixed(2)}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="instructions"
                  className="border border-zinc-800 bg-black p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h3 className="text-sm font-bold uppercase mb-4 text-white flex items-center gap-2">
                    <FiInfo className="text-blue-400" />
                    How To Buy
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 bg-yellow-500 text-black text-xs font-bold flex items-center justify-center flex-shrink-0">1</div>
                      <p className="text-zinc-400">Click and drag on the grid to select your pixel area</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 bg-yellow-500 text-black text-xs font-bold flex items-center justify-center flex-shrink-0">2</div>
                      <p className="text-zinc-400">Choose your color and add your link</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 bg-yellow-500 text-black text-xs font-bold flex items-center justify-center flex-shrink-0">3</div>
                      <p className="text-zinc-400">Pay with HandCash ($0.01 per pixel)</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 bg-green-500 text-black text-xs font-bold flex items-center justify-center flex-shrink-0">
                        <FiCheck size={12} />
                      </div>
                      <p className="text-zinc-400">Your ad is live forever!</p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-zinc-900 border border-zinc-800">
                    <p className="text-xs text-zinc-500 mb-2">Example pricing:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <span className="text-zinc-400">1 pixel:</span>
                      <span className="text-white font-bold">$0.01</span>
                      <span className="text-zinc-400">10x10 block:</span>
                      <span className="text-white font-bold">$1.00</span>
                      <span className="text-zinc-400">100x100 block:</span>
                      <span className="text-white font-bold">$100.00</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Why Buy */}
            <div className="border border-zinc-800 bg-black p-6">
              <h3 className="text-sm font-bold uppercase mb-4 text-white">Why Buy Pixels?</h3>
              <div className="space-y-3 text-xs text-zinc-400">
                <p>• Your ad lives forever on the blockchain</p>
                <p>• Early buyers get the best positions</p>
                <p>• Viral potential as the grid fills up</p>
                <p>• Collectible digital real estate</p>
                <p>• Support the MoneyButton ecosystem</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Back Link */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Link
            href="/moneybutton"
            className="text-zinc-500 text-sm hover:text-white transition-colors"
          >
            ← Back to MoneyButton
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
