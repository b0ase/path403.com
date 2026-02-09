"use client";

import React from 'react';

const Filters = () => {
  return (
    <div className="flex flex-col h-full w-full bg-[#050505] rounded-lg border border-white/5 overflow-hidden relative">
      <div className="p-4 overflow-y-auto h-full">
        <div className="text-white text-xs font-bold uppercase tracking-wider mb-4 sticky top-0 bg-[#050505] z-10 pb-2 border-b border-white/5 flex justify-between items-center">
            <span>Filters</span>
        </div>
        
        <div className="flex flex-col gap-6">
          <div>
            <h4 className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-2 border-b border-white/5 pb-1">Active</h4>
            <div className="flex flex-col gap-2 mt-2">
              {['Sepia', 'Vintage', 'Washed Out', 'Drama', 'Cool', 'Warm', 'Noir', 'Vibrant', 'Faded'].map((filter) => (
                <label key={filter} className="text-zinc-400 text-[11px] flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                  <input type="checkbox" className="w-3.5 h-3.5 accent-cyan-600 bg-zinc-900 border-zinc-700 rounded cursor-pointer" />
                  {filter}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-2 border-b border-white/5 pb-1">Cycle</h4>
            <div className="flex flex-col gap-2 mt-2">
              {['Vignette', 'Temporal Filter', 'Random', 'Mirror'].map((filter) => (
                <label key={filter} className="text-zinc-400 text-[11px] flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                  <input type="checkbox" className="w-3.5 h-3.5 accent-cyan-600 bg-zinc-900 border-zinc-700 rounded cursor-pointer" />
                  {filter}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-2 border-b border-white/5 pb-1">Transition</h4>
            <div className="flex flex-col gap-2 mt-2">
              <select className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded text-white text-[11px] outline-none focus:border-cyan-500 transition-colors" aria-label="Wipe Transition">
                <option value="none">No Wipe</option>
                <option value="fade">Fade</option>
                <option value="slide">Slide</option>
                <option value="zoom">Zoom</option>
              </select>
              <span className="text-zinc-600 text-[10px]">Auto-trigger on clip switch</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
