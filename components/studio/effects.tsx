"use client";

import React, { useState } from 'react';
import TripleSlider from './triple-slider';
import { useStudio } from './studio-context';

// Panel backgrounds for each color theme
const panelBackgrounds: Record<string, string> = {
  black: 'bg-[#050505] border-white/5',
  white: 'bg-gray-100 border-black/10',
  yellow: 'bg-amber-200/80 border-amber-600/20',
  red: 'bg-red-300/80 border-red-700/20',
  green: 'bg-green-300/80 border-green-700/20',
  blue: 'bg-blue-300/80 border-blue-700/20',
};

// Inner section backgrounds
const innerBackgrounds: Record<string, string> = {
  black: 'bg-black/40 border-white/5',
  white: 'bg-white border-black/10',
  yellow: 'bg-amber-100/60 border-amber-600/20',
  red: 'bg-red-200/60 border-red-700/20',
  green: 'bg-green-200/60 border-green-700/20',
  blue: 'bg-blue-200/60 border-blue-700/20',
};

const Effects = () => {
  const { effects, setEffects, toggleEffect, colorTheme, isDark, randomSeekEnabled, setRandomSeekEnabled, randomSeekSpeed, setRandomSeekSpeed, randomSeekRange, setRandomSeekRange } = useStudio();

  const [randomSpeedEnabled, setRandomSpeedEnabled] = useState(false);
  const [randomRangeEnabled, setRandomRangeEnabled] = useState(false);
  const [randomGlitchSpeedEnabled, setRandomGlitchSpeedEnabled] = useState(false);
  const [randomWavelengthXEnabled, setRandomWavelengthXEnabled] = useState(false);
  const [randomWavelengthYEnabled, setRandomWavelengthYEnabled] = useState(false);
  const [randomBrightnessEnabled, setRandomBrightnessEnabled] = useState(false);
  const [randomContrastEnabled, setRandomContrastEnabled] = useState(false);
  const [randomSaturationEnabled, setRandomSaturationEnabled] = useState(false);
  const [randomBlurEnabled, setRandomBlurEnabled] = useState(false);

  const [expandedEffects, setExpandedEffects] = useState<Record<string, boolean>>({
    randomSeek: false,
    glitch: false,
    filters: true,
    text: false
  });

  const toggleExpand = (effectName: string) => {
    setExpandedEffects(prev => ({
      ...prev,
      [effectName]: !prev[effectName]
    }));
  };

  const EffectItem = ({ name, enabled, onToggle, children, expandKey }: { name: string, enabled: boolean, onToggle: () => void, children: React.ReactNode, expandKey: string }) => (
    <div className={`p-2 rounded-lg mb-2 border ${panelBackgrounds[colorTheme] || panelBackgrounds.black}`}>
      <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(expandKey)}>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] transition-transform duration-200 ${isDark ? 'text-zinc-500' : 'text-gray-500'} ${expandedEffects[expandKey] ? 'rotate-90' : ''}`}>▶</span>
          <label className={`text-xs font-bold cursor-pointer select-none transition-colors ${isDark ? 'text-zinc-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}>{name}</label>
        </div>
        <div
          className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${enabled ? (isDark ? 'bg-white/30' : 'bg-black/30') : (isDark ? 'bg-black border border-zinc-800' : 'bg-white border border-gray-300')}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform duration-200 shadow-sm ${enabled ? `left-[22px] ${isDark ? 'bg-white' : 'bg-black'}` : `left-0.5 ${isDark ? 'bg-zinc-400' : 'bg-gray-400'}`}`}></div>
        </div>
      </div>
      <div className={`mt-2 overflow-hidden transition-all duration-300 ${expandedEffects[expandKey] ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );

  return (
    <div>
      <div className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${isDark ? 'text-white' : 'text-black'}`}>Effects</div>

      <EffectItem
        name="Random Seek"
        enabled={randomSeekEnabled}
        onToggle={() => setRandomSeekEnabled(!randomSeekEnabled)}
        expandKey="randomSeek"
      >
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] text-zinc-500">Speed</label>
            <div
              className={`w-6 h-3 rounded-full relative cursor-pointer transition-colors border border-white/5 ${randomSpeedEnabled ? 'bg-cyan-900' : 'bg-black'}`}
              onClick={() => setRandomSpeedEnabled(!randomSpeedEnabled)}
              title="Random"
            >
              <div className={`absolute top-0.5 w-2 h-2 rounded-full transition-all ${randomSpeedEnabled ? 'left-[14px] bg-white' : 'left-0.5 bg-zinc-600'}`}></div>
            </div>
          </div>
          <TripleSlider
            min={0}
            max={100}
            mainValue={randomSeekSpeed}
            minValue={0}
            maxValue={100}
            autoRandom={randomSpeedEnabled}
            onChange={(main) => {
              setRandomSeekSpeed(main);
            }}
          />
        </div>

        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] text-zinc-400">Range</label>
            <div
              className={`w-6 h-3 rounded-full relative cursor-pointer transition-colors ${randomRangeEnabled ? 'bg-cyan-600' : 'bg-zinc-700'}`}
              onClick={() => setRandomRangeEnabled(!randomRangeEnabled)}
              title="Random"
            >
              <div className={`absolute top-0.5 w-2 h-2 bg-white rounded-full transition-all ${randomRangeEnabled ? 'left-[14px]' : 'left-0.5'}`}></div>
            </div>
          </div>
          <TripleSlider
            min={0}
            max={100}
            mainValue={randomSeekRange}
            minValue={0}
            maxValue={100}
            autoRandom={randomRangeEnabled}
            onChange={(main) => {
              setRandomSeekRange(main);
            }}
          />
        </div>
      </EffectItem>

      <EffectItem
        name="Glitch Effect"
        enabled={effects.glitchEnabled}
        onToggle={() => toggleEffect('glitchEnabled')}
        expandKey="glitch"
      >
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] text-zinc-400">Speed</label>
            <div
              className={`w-6 h-3 rounded-full relative cursor-pointer transition-colors ${randomGlitchSpeedEnabled ? 'bg-cyan-600' : 'bg-zinc-700'}`}
              onClick={() => setRandomGlitchSpeedEnabled(!randomGlitchSpeedEnabled)}
              title="Random"
            >
              <div className={`absolute top-0.5 w-2 h-2 bg-white rounded-full transition-all ${randomGlitchSpeedEnabled ? 'left-[14px]' : 'left-0.5'}`}></div>
            </div>
          </div>
          <TripleSlider
            min={0}
            max={100}
            mainValue={20}
            minValue={0}
            maxValue={100}
            autoRandom={randomGlitchSpeedEnabled}
            onChange={(main, min, max) => {
              console.log(`Glitch speed: ${main}% (range: ${min}-${max}%)`);
            }}
          />
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] text-zinc-400">Wave X</label>
            <div
              className={`w-6 h-3 rounded-full relative cursor-pointer transition-colors ${randomWavelengthXEnabled ? 'bg-cyan-600' : 'bg-zinc-700'}`}
              onClick={() => setRandomWavelengthXEnabled(!randomWavelengthXEnabled)}
              title="Random"
            >
              <div className={`absolute top-0.5 w-2 h-2 bg-white rounded-full transition-all ${randomWavelengthXEnabled ? 'left-[14px]' : 'left-0.5'}`}></div>
            </div>
          </div>
          <TripleSlider
            min={0}
            max={100}
            mainValue={30}
            minValue={0}
            maxValue={100}
            autoRandom={randomWavelengthXEnabled}
            onChange={(main, min, max) => {
              console.log(`Glitch wavelength X: ${main}% (range: ${min}-${max}%)`);
            }}
          />
        </div>

        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] text-zinc-400">Wave Y</label>
            <div
              className={`w-6 h-3 rounded-full relative cursor-pointer transition-colors ${randomWavelengthYEnabled ? 'bg-cyan-600' : 'bg-zinc-700'}`}
              onClick={() => setRandomWavelengthYEnabled(!randomWavelengthYEnabled)}
              title="Random"
            >
              <div className={`absolute top-0.5 w-2 h-2 bg-white rounded-full transition-all ${randomWavelengthYEnabled ? 'left-[14px]' : 'left-0.5'}`}></div>
            </div>
          </div>
          <TripleSlider
            min={0}
            max={100}
            mainValue={30}
            minValue={0}
            maxValue={100}
            autoRandom={randomWavelengthYEnabled}
            onChange={(main, min, max) => {
              console.log(`Glitch wavelength Y: ${main}% (range: ${min}-${max}%)`);
            }}
          />
        </div>
      </EffectItem>

      {/* Filters Section - Collapsible */}
      <div className={`p-2 rounded-lg mb-2 border ${panelBackgrounds[colorTheme] || panelBackgrounds.black}`}>
        <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleExpand('filters')}>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] transition-transform duration-200 ${isDark ? 'text-zinc-500' : 'text-gray-500'} ${expandedEffects['filters'] ? 'rotate-90' : ''}`}>▶</span>
            <label className={`text-xs font-bold cursor-pointer select-none transition-colors ${isDark ? 'text-zinc-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}>Filters</label>
          </div>
        </div>
        <div className={`mt-2 overflow-hidden transition-all duration-300 ${expandedEffects['filters'] ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="flex flex-col gap-4">
            <div>
              <h4 className={`text-[10px] font-bold uppercase tracking-wider mb-2 border-b pb-1 ${isDark ? 'text-zinc-500 border-white/5' : 'text-gray-500 border-black/10'}`}>Active Filters</h4>
              <div className="flex flex-col gap-1.5 mt-2">
                {[
                  { key: 'sepia', label: 'Sepia' },
                  { key: 'vintage', label: 'Vintage' },
                  { key: 'noir', label: 'Noir' },
                  { key: 'vibrant', label: 'Vibrant' },
                  { key: 'cool', label: 'Cool' },
                  { key: 'warm', label: 'Warm' },
                ].map((filter) => (
                  <label key={filter.key} className={`text-[11px] flex items-center gap-2 cursor-pointer transition-colors ${isDark ? 'text-zinc-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}>
                    <input
                      type="checkbox"
                      checked={effects[filter.key as keyof typeof effects] as boolean}
                      onChange={() => toggleEffect(filter.key as keyof typeof effects)}
                      className={`w-3 h-3 rounded cursor-pointer ${isDark ? 'accent-white bg-zinc-900 border-zinc-700' : 'accent-black bg-white border-gray-300'}`}
                    />
                    {filter.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Adjustment Sliders */}
            <div>
              <h4 className={`text-[10px] font-bold uppercase tracking-wider mb-2 border-b pb-1 ${isDark ? 'text-zinc-500 border-white/5' : 'text-gray-500 border-black/10'}`}>Adjustments</h4>
              <div className="flex flex-col gap-3 mt-2">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>Brightness <span>{effects.brightness}%</span></label>
                    <div
                      className={`w-6 h-3 rounded-full relative cursor-pointer transition-colors border border-white/5 ${randomBrightnessEnabled ? 'bg-cyan-900' : 'bg-black'}`}
                      onClick={() => setRandomBrightnessEnabled(!randomBrightnessEnabled)}
                      title="Random"
                    >
                      <div className={`absolute top-0.5 w-2 h-2 rounded-full transition-all ${randomBrightnessEnabled ? 'left-[14px] bg-white' : 'left-0.5 bg-zinc-600'}`}></div>
                    </div>
                  </div>
                  <TripleSlider
                    min={0}
                    max={200}
                    mainValue={effects.brightness}
                    minValue={0}
                    maxValue={200}
                    autoRandom={randomBrightnessEnabled}
                    onChange={(main) => setEffects(prev => ({ ...prev, brightness: main }))}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>Contrast <span>{effects.contrast}%</span></label>
                    <div
                      className={`w-6 h-3 rounded-full relative cursor-pointer transition-colors border border-white/5 ${randomContrastEnabled ? 'bg-cyan-900' : 'bg-black'}`}
                      onClick={() => setRandomContrastEnabled(!randomContrastEnabled)}
                      title="Random"
                    >
                      <div className={`absolute top-0.5 w-2 h-2 rounded-full transition-all ${randomContrastEnabled ? 'left-[14px] bg-white' : 'left-0.5 bg-zinc-600'}`}></div>
                    </div>
                  </div>
                  <TripleSlider
                    min={0}
                    max={200}
                    mainValue={effects.contrast}
                    minValue={0}
                    maxValue={200}
                    autoRandom={randomContrastEnabled}
                    onChange={(main) => setEffects(prev => ({ ...prev, contrast: main }))}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>Saturation <span>{effects.saturation}%</span></label>
                    <div
                      className={`w-6 h-3 rounded-full relative cursor-pointer transition-colors border border-white/5 ${randomSaturationEnabled ? 'bg-cyan-900' : 'bg-black'}`}
                      onClick={() => setRandomSaturationEnabled(!randomSaturationEnabled)}
                      title="Random"
                    >
                      <div className={`absolute top-0.5 w-2 h-2 rounded-full transition-all ${randomSaturationEnabled ? 'left-[14px] bg-white' : 'left-0.5 bg-zinc-600'}`}></div>
                    </div>
                  </div>
                  <TripleSlider
                    min={0}
                    max={200}
                    mainValue={effects.saturation}
                    minValue={0}
                    maxValue={200}
                    autoRandom={randomSaturationEnabled}
                    onChange={(main) => setEffects(prev => ({ ...prev, saturation: main }))}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>Blur <span>{effects.blur}px</span></label>
                    <div
                      className={`w-6 h-3 rounded-full relative cursor-pointer transition-colors border border-white/5 ${randomBlurEnabled ? 'bg-cyan-900' : 'bg-black'}`}
                      onClick={() => setRandomBlurEnabled(!randomBlurEnabled)}
                      title="Random"
                    >
                      <div className={`absolute top-0.5 w-2 h-2 rounded-full transition-all ${randomBlurEnabled ? 'left-[14px] bg-white' : 'left-0.5 bg-zinc-600'}`}></div>
                    </div>
                  </div>
                  <TripleSlider
                    min={0}
                    max={20}
                    mainValue={effects.blur}
                    minValue={0}
                    maxValue={20}
                    autoRandom={randomBlurEnabled}
                    onChange={(main) => setEffects(prev => ({ ...prev, blur: main }))}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className={`text-[10px] font-bold uppercase tracking-wider mb-2 border-b pb-1 ${isDark ? 'text-zinc-500 border-white/5' : 'text-gray-500 border-black/10'}`}>Cycle</h4>
              <div className="flex flex-col gap-1.5 mt-2">
                {['Vignette', 'Temporal Filter', 'Random', 'Mirror'].map((filter) => (
                  <label key={filter} className={`text-[11px] flex items-center gap-2 cursor-pointer transition-colors ${isDark ? 'text-zinc-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}>
                    <input type="checkbox" className={`w-3 h-3 rounded cursor-pointer ${isDark ? 'accent-white bg-zinc-900 border-zinc-700' : 'accent-black bg-white border-gray-300'}`} />
                    {filter}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className={`text-[10px] font-bold uppercase tracking-wider mb-2 border-b pb-1 ${isDark ? 'text-zinc-500 border-white/5' : 'text-gray-500 border-black/10'}`}>Transition</h4>
              <div className="flex flex-col gap-1.5 mt-2">
                <select className={`w-full p-1.5 border rounded text-[11px] outline-none transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800 text-white focus:border-white/50' : 'bg-white border-gray-300 text-black focus:border-black/50'}`} aria-label="Wipe Transition">
                  <option value="none">No Wipe</option>
                  <option value="fade">Fade</option>
                  <option value="slide">Slide</option>
                  <option value="zoom">Zoom</option>
                </select>
                <span className={`text-[10px] ${isDark ? 'text-zinc-600' : 'text-gray-500'}`}>Auto-trigger on clip switch</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Text Section - Collapsible */}
      <div className={`p-2 rounded-lg mb-2 border ${panelBackgrounds[colorTheme] || panelBackgrounds.black}`}>
        <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleExpand('text')}>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] transition-transform duration-200 ${isDark ? 'text-zinc-500' : 'text-gray-500'} ${expandedEffects['text'] ? 'rotate-90' : ''}`}>▶</span>
            <label className={`text-xs font-bold cursor-pointer select-none transition-colors ${isDark ? 'text-zinc-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}>Text</label>
          </div>
        </div>
        <div className={`mt-2 overflow-hidden transition-all duration-300 ${expandedEffects['text'] ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <button className={`w-full mb-3 py-1.5 rounded text-xs transition-colors border ${isDark ? 'bg-zinc-900 hover:bg-zinc-800 text-white border-white/5' : 'bg-gray-200 hover:bg-gray-300 text-black border-black/10'}`}>
            + Add Text Chunk
          </button>

          <div className="space-y-2.5">
            <div className={`border rounded-md p-3 ${innerBackgrounds[colorTheme] || innerBackgrounds.black}`}>
              <div className="space-y-2">
                <input
                  type="text"
                  defaultValue="AIVJ"
                  className={`w-full border p-1.5 text-xs rounded outline-none transition-colors ${isDark ? 'bg-[#0a0a0a] text-white border-white/5 focus:border-white/30' : 'bg-white text-black border-black/10 focus:border-black/30'}`}
                  aria-label="Text content"
                />
                <select className={`w-full border p-1 text-[11px] rounded outline-none transition-colors ${isDark ? 'bg-[#0a0a0a] text-white border-white/5 focus:border-white/30' : 'bg-white text-black border-black/10 focus:border-black/30'}`} aria-label="Font family">
                  <option>Arial</option>
                  <option>Impact</option>
                  <option>Times</option>
                </select>
                <div className="flex gap-1.5 mt-1.5 items-center">
                  <input type="color" defaultValue="#FFFFFF" className="w-8 h-8 border-0 rounded p-0 bg-transparent cursor-pointer" aria-label="Text color" />
                  <input type="range" min="10" max="200" defaultValue="48" className={`flex-1 h-1 rounded-lg appearance-none cursor-pointer ${isDark ? 'bg-zinc-800 accent-white' : 'bg-gray-300 accent-black'}`} aria-label="Text size" />
                  <span className={`text-[10px] min-w-[30px] text-right ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>48px</span>
                </div>
                <div className="flex gap-1.5 mt-1.5">
                  <div className="flex-1">
                    <label className={`text-[10px] block mb-0.5 ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>X</label>
                    <input type="range" min="0" max="1080" defaultValue="540" className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${isDark ? 'bg-zinc-800 accent-white' : 'bg-gray-300 accent-black'}`} />
                  </div>
                  <div className="flex-1">
                    <label className={`text-[10px] block mb-0.5 ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>Y</label>
                    <input type="range" min="0" max="1920" defaultValue="960" className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${isDark ? 'bg-zinc-800 accent-white' : 'bg-gray-300 accent-black'}`} />
                  </div>
                </div>
                <div className={`flex justify-between items-center gap-1.5 mt-1.5 pt-2 border-t ${isDark ? 'border-white/5' : 'border-black/10'}`}>
                  <label className={`text-[10px] flex items-center gap-1 cursor-pointer ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>
                    <input type="checkbox" className={`rounded ${isDark ? 'bg-zinc-900 border-zinc-700 accent-white' : 'bg-white border-gray-300 accent-black'}`} />
                    Vertical
                  </label>
                  <button className={`px-2 py-0.5 text-[10px] rounded transition-colors border ${isDark ? 'bg-zinc-900 hover:bg-red-950/50 hover:text-red-400 text-zinc-400 border-white/5' : 'bg-gray-200 hover:bg-red-100 hover:text-red-600 text-gray-500 border-black/10'}`}>✕</button>
                </div>
              </div>
            </div>
          </div>

          <div className={`mt-4 pt-3 border-t ${isDark ? 'border-white/5' : 'border-black/10'}`}>
            <h4 className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>Text Effects</h4>

            <div className="mb-3">
              <label className={`block text-[10px] mb-1 ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>Strobe Speed</label>
              <input type="range" min="50" max="1000" defaultValue="850" className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${isDark ? 'bg-zinc-800 accent-white' : 'bg-gray-300 accent-black'}`} />
              <span className={`text-[10px] block mt-1 ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>200ms</span>
            </div>

            <div className="mb-3">
              <label className={`block text-[10px] mb-1 ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>Text Speed</label>
              <input type="range" min="100" max="2000" defaultValue="1600" className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${isDark ? 'bg-zinc-800 accent-white' : 'bg-gray-300 accent-black'}`} />
              <span className={`text-[10px] block mt-1 ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>500ms</span>
            </div>

            <div className="mb-2">
              <label className={`block text-[10px] mb-1 ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>Move Range</label>
              <input type="range" min="10" max="500" defaultValue="100" className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${isDark ? 'bg-zinc-800 accent-white' : 'bg-gray-300 accent-black'}`} />
              <span className={`text-[10px] block mt-1 ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>100px</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Effects;
