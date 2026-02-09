"use client";

import React from 'react';

const TextPanel = () => {
  return (
    <div className="p-4 bg-[#050505] rounded-lg border border-white/5">
      <div className="text-white text-xs font-bold uppercase tracking-wider mb-2.5">Text</div>
      
      <button className="w-full mb-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded text-xs transition-colors border border-white/5">
        + Add Text Chunk
      </button>
      
      <div className="space-y-2.5">
        <div className="bg-black/40 border border-white/5 rounded-md p-4">
          <div className="space-y-2">
            <input 
              type="text" 
              defaultValue="AIVJ" 
              className="w-full bg-[#0a0a0a] text-white border border-white/5 p-1.5 text-xs rounded focus:border-cyan-900 outline-none transition-colors"
              aria-label="Text content"
            />
            <select className="w-full bg-[#0a0a0a] text-white border border-white/5 p-1 text-[11px] rounded focus:border-cyan-900 outline-none transition-colors" aria-label="Font family">
              <option>Arial</option>
              <option>Impact</option>
              <option>Times</option>
            </select>
            <div className="flex gap-1.5 mt-1.5 items-center">
              <input type="color" defaultValue="#FFFFFF" className="w-10 h-10 border-0 rounded p-0 bg-transparent cursor-pointer" aria-label="Text color" />
              <input type="range" min="10" max="200" defaultValue="48" className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-600" aria-label="Text size" />
              <span className="text-[10px] text-zinc-400 min-w-[30px] text-right">48px</span>
            </div>
            <div className="flex gap-1.5 mt-1.5">
              <div className="flex-1">
                <label className="text-[10px] text-zinc-500 block mb-0.5" htmlFor="x-pos">X Position</label>
                <input id="x-pos" type="range" min="0" max="1080" defaultValue="540" className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-600" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-zinc-500 block mb-0.5" htmlFor="y-pos">Y Position</label>
                <input id="y-pos" type="range" min="0" max="1920" defaultValue="960" className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-600" />
              </div>
            </div>
            <div className="flex justify-between items-center gap-1.5 mt-1.5 pt-2 border-t border-white/5">
              <label className="text-[10px] text-zinc-400 flex items-center gap-1 cursor-pointer">
                <input type="checkbox" className="rounded bg-zinc-900 border-zinc-700 accent-cyan-600" /> 
                Vertical
              </label>
              <button className="px-2 py-0.5 bg-zinc-900 hover:bg-red-950/50 hover:text-red-400 text-zinc-400 text-[10px] rounded transition-colors border border-white/5">✕</button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-white/5">
        <h4 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2.5">Text Effects</h4>
        
        <div className="mb-4">
          <label className="block text-[10px] text-zinc-500 mb-1.5" htmlFor="strobe-speed">Strobe Speed</label>
          <input id="strobe-speed" type="range" min="50" max="1000" defaultValue="850" className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-600" />
          <span className="text-[10px] text-zinc-500 block mt-1.5">Strobe: 200ms</span>
        </div>
        
        <div className="mb-4">
          <label className="block text-[10px] text-zinc-500 mb-1.5" htmlFor="text-speed">Text Speed</label>
          <input id="text-speed" type="range" min="100" max="2000" defaultValue="1600" className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-600" />
          <span className="text-[10px] text-zinc-500 block mt-1.5">Speed: 500ms</span>
        </div>
        
        <div className="mb-4">
          <label className="block text-[10px] text-zinc-500 mb-1.5" htmlFor="move-range">Move Range</label>
          <input id="move-range" type="range" min="10" max="500" defaultValue="100" className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-600" />
          <span className="text-[10px] text-zinc-500 block mt-1.5">Range: 100px</span>
        </div>
      </div>
    </div>
  );
};

export default TextPanel;
