"use client";

import React, { useState } from 'react';
import { useStudio } from './studio-context';
import TripleSlider from './triple-slider';

// Panel backgrounds for each color theme
const panelBackgrounds: Record<string, string> = {
  black: 'bg-[#050505] border-white/5',
  white: 'bg-gray-100 border-black/10',
  yellow: 'bg-amber-200/80 border-amber-600/20',
  red: 'bg-red-300/80 border-red-700/20',
  green: 'bg-green-300/80 border-green-700/20',
  blue: 'bg-blue-300/80 border-blue-700/20',
};

const SuperEffects = () => {
  const { colorTheme, isDark } = useStudio();
  const [ultraGlitchEnabled, setUltraGlitchEnabled] = useState(false);
  const [timeWarpEnabled, setTimeWarpEnabled] = useState(false);
  const [realityBreakEnabled, setRealityBreakEnabled] = useState(false);
  const [dimensionShiftEnabled, setDimensionShiftEnabled] = useState(false);
  const [kaleidoscopeEnabled, setKaleidoscopeEnabled] = useState(false);

  const [ultraGlitchValue, setUltraGlitchValue] = useState(30);
  const [timeWarpValue, setTimeWarpValue] = useState(1);
  const [realityBreakValue, setRealityBreakValue] = useState(50);
  const [dimensionShiftValue, setDimensionShiftValue] = useState(50);
  const [kaleidoscopeValue, setKaleidoscopeValue] = useState(6);

  const EffectItem = ({ name, enabled, onToggle, children }: { name: string, enabled: boolean, onToggle: () => void, children?: React.ReactNode }) => (
    <div className={`p-2 rounded-lg mb-2 border ${panelBackgrounds[colorTheme] || panelBackgrounds.black}`}>
      <div className="flex items-center justify-between mb-2">
        <label className={`text-xs font-bold ${isDark ? 'text-zinc-300' : 'text-gray-700'}`}>{name}</label>
        <div
          className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 border ${enabled ? (isDark ? 'bg-white/30 border-white/20' : 'bg-black/30 border-black/20') : (isDark ? 'bg-black border-white/5' : 'bg-white border-gray-300')}`}
          onClick={onToggle}
        >
          <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform duration-200 shadow-sm ${enabled ? `left-[22px] ${isDark ? 'bg-white' : 'bg-black'}` : `left-0.5 ${isDark ? 'bg-zinc-400' : 'bg-gray-400'}`}`}></div>
        </div>
      </div>
      {children && (
        <div className={`pt-2 border-t ${isDark ? 'border-white/5' : 'border-black/10'}`}>
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${isDark ? 'text-white' : 'text-black'}`}>Super Effects</div>

      <EffectItem
        name="Ultra Glitch"
        enabled={ultraGlitchEnabled}
        onToggle={() => setUltraGlitchEnabled(!ultraGlitchEnabled)}
      >
        <TripleSlider
          min={1}
          max={100}
          mainValue={ultraGlitchValue}
          minValue={1}
          maxValue={100}
          autoRandom={ultraGlitchEnabled}
          onChange={(main) => setUltraGlitchValue(main)}
        />
      </EffectItem>

      <EffectItem
        name="Time Warp"
        enabled={timeWarpEnabled}
        onToggle={() => setTimeWarpEnabled(!timeWarpEnabled)}
      >
        <TripleSlider
          min={0.1}
          max={10}
          mainValue={timeWarpValue}
          minValue={0.1}
          maxValue={10}
          autoRandom={timeWarpEnabled}
          onChange={(main) => setTimeWarpValue(main)}
        />
      </EffectItem>

      <EffectItem
        name="Reality Break"
        enabled={realityBreakEnabled}
        onToggle={() => setRealityBreakEnabled(!realityBreakEnabled)}
      >
        <TripleSlider
          min={1}
          max={100}
          mainValue={realityBreakValue}
          minValue={1}
          maxValue={100}
          autoRandom={realityBreakEnabled}
          onChange={(main) => setRealityBreakValue(main)}
        />
      </EffectItem>

      <EffectItem
        name="Dimension Shift"
        enabled={dimensionShiftEnabled}
        onToggle={() => setDimensionShiftEnabled(!dimensionShiftEnabled)}
      >
        <TripleSlider
          min={1}
          max={100}
          mainValue={dimensionShiftValue}
          minValue={1}
          maxValue={100}
          autoRandom={dimensionShiftEnabled}
          onChange={(main) => setDimensionShiftValue(main)}
        />
      </EffectItem>

      <EffectItem
        name="Kaleidoscope"
        enabled={kaleidoscopeEnabled}
        onToggle={() => setKaleidoscopeEnabled(!kaleidoscopeEnabled)}
      >
        <TripleSlider
          min={2}
          max={16}
          mainValue={kaleidoscopeValue}
          minValue={2}
          maxValue={16}
          autoRandom={kaleidoscopeEnabled}
          onChange={(main) => setKaleidoscopeValue(main)}
        />
      </EffectItem>
    </div>
  );
};

export default SuperEffects;
