'use client';

interface ChaosControlsProps {
  jumpCutMode: boolean;
  setJumpCutMode: (value: boolean) => void;
  jumpCutSpeed: number;
  setJumpCutSpeed: (value: number) => void;
  glitchMode: boolean;
  setGlitchMode: (value: boolean) => void;
  glitchIntensity: number;
  setGlitchIntensity: (value: number) => void;
  reverseMode: boolean;
  setReverseMode: (value: boolean) => void;
  speedMultiplier: number;
  setSpeedMultiplier: (value: number) => void;
  randomSeek: boolean;
  setRandomSeek: (value: boolean) => void;
  strobeMode: boolean;
  setStrobeMode: (value: boolean) => void;
  rgbShift: boolean;
  setRgbShift: (value: boolean) => void;
  autoChaos: boolean;
  setAutoChaos: (value: boolean) => void;
  randomZoom: boolean;
  setRandomZoom: (value: boolean) => void;
  zoomSpeed: number;
  setZoomSpeed: (value: number) => void;
  zoomLevel: number;
  setZoomLevel: (value: number) => void;
}

export default function ChaosControls(props: ChaosControlsProps) {
  const {
    jumpCutMode, setJumpCutMode,
    jumpCutSpeed, setJumpCutSpeed,
    glitchMode, setGlitchMode,
    glitchIntensity, setGlitchIntensity,
    reverseMode, setReverseMode,
    speedMultiplier, setSpeedMultiplier,
    randomSeek, setRandomSeek,
    strobeMode, setStrobeMode,
    rgbShift, setRgbShift,
    autoChaos, setAutoChaos,
    randomZoom, setRandomZoom,
    zoomSpeed, setZoomSpeed,
    zoomLevel, setZoomLevel
  } = props;

  const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onChange(!value);
      }}
      onMouseDown={(e) => e.preventDefault()} // Prevent text selection
      className="flex items-center justify-between py-1.5 px-2 cursor-pointer group select-none hover:bg-zinc-900 border-b border-zinc-900 transition-all"
    >
      <span className="text-[11px] font-mono text-white/60 group-hover:text-white transition-colors">
        {label}
      </span>
      <div className={`
        w-10 h-4 transition-all relative
        ${value ? 'bg-white' : 'bg-zinc-800'}
      `}>
        <div className={`
          absolute top-0.5 w-3 h-3 transition-all
          ${value ? 'left-6 bg-black' : 'left-0.5 bg-zinc-500'}
        `} />
      </div>
    </div>
  );

  return (
    <div className="space-y-3 p-3 bg-black border border-zinc-800">
      {/* Title */}
      <div className="text-center pb-2 border-b border-white/5">
        <p className="text-[10px] font-mono text-white/40 tracking-wider">CHAOS CONTROLS</p>
      </div>

      {/* Auto Chaos - Special */}
      <div
        onClick={() => setAutoChaos(!autoChaos)}
        className={`
          p-3 transition-all text-left border relative
          ${autoChaos ? 'bg-white text-black border-white' : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-500'}
        `}
      >
        <p className="text-[10px] font-mono font-black tracking-widest uppercase">
          {autoChaos ? 'CHAOS_ENGAGED' : 'MANUAL_OVERRIDE'}
        </p>
      </div>

      {/* Temporal Effects Card */}
      <div className="p-3 bg-zinc-950 border border-zinc-900">
        <p className="text-[10px] font-black font-mono text-zinc-600 mb-3 tracking-widest">SUB_TEMPORAL</p>
        <div className="space-y-1">
          <Toggle label="JUMP CUT" value={jumpCutMode} onChange={setJumpCutMode} />
          <Toggle label="RANDOM SEEK" value={randomSeek} onChange={setRandomSeek} />
          <Toggle label="MIRROR" value={reverseMode} onChange={setReverseMode} />
        </div>
      </div>

      {/* Visual Effects Card */}
      <div className="p-3 bg-zinc-950 border border-zinc-900">
        <p className="text-[10px] font-black font-mono text-zinc-600 mb-3 tracking-widest">SUB_VISUAL</p>
        <div className="space-y-1">
          <Toggle label="GLITCH" value={glitchMode} onChange={setGlitchMode} />
          <Toggle label="STROBE" value={strobeMode} onChange={setStrobeMode} />
          <Toggle label="RGB SHIFT" value={rgbShift} onChange={setRgbShift} />
        </div>
      </div>

      {/* Speed Control Card */}
      <div className="p-3 bg-zinc-950 border border-zinc-900">
        <p className="text-[10px] font-black font-mono text-zinc-600 mb-3 tracking-widest">SUB_PLAYBACK</p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-mono text-zinc-500">SPD_MULT</span>
          <span className="text-[10px] font-mono text-white font-bold">{speedMultiplier.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min="0.25"
          max="4"
          step="0.25"
          value={speedMultiplier}
          onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
          className="w-full h-1 appearance-none bg-zinc-800 outline-none slider"
          style={{
            background: `linear-gradient(to right, #fff ${((speedMultiplier - 0.25) / 3.75) * 100}%, #18181b ${((speedMultiplier - 0.25) / 3.75) * 100}%)`
          }}
        />
      </div>

      {/* Zoom Effect Card */}
      <div className="p-3 bg-zinc-950 border border-zinc-900">
        <p className="text-[10px] font-black font-mono text-zinc-600 mb-3 tracking-widest">SUB_ZOOM</p>
        <Toggle label="OSC_ZOOM" value={randomZoom} onChange={setRandomZoom} />
        <div className="mt-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-mono text-zinc-500">FRQ_MOD</span>
            <span className="text-[10px] font-mono text-white font-bold">{(zoomSpeed * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.005"
            max="0.1"
            step="0.005"
            value={zoomSpeed}
            onChange={(e) => setZoomSpeed(Number(e.target.value))}
            className="w-full h-1 appearance-none bg-zinc-800 outline-none slider"
            style={{
              background: `linear-gradient(to right, #fff ${((zoomSpeed - 0.005) / 0.095) * 100}%, #18181b ${((zoomSpeed - 0.005) / 0.095) * 100}%)`
            }}
          />
          {!randomZoom && (
            <div className="mt-4 border-t border-zinc-900 pt-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono text-zinc-500">AMP_FIX</span>
                <span className="text-[10px] font-mono text-white font-bold">{zoomLevel.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(Number(e.target.value))}
                className="w-full h-1 appearance-none bg-zinc-800 outline-none slider"
                style={{
                  background: `linear-gradient(to right, #fff ${((zoomLevel - 0.5) / 2.5) * 100}%, #18181b ${((zoomLevel - 0.5) / 2.5) * 100}%)`
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Hidden sliders for jump cut speed and glitch intensity - they still work via auto-chaos */}
      {jumpCutMode && (
        <input
          type="range"
          min="100"
          max="2000"
          value={jumpCutSpeed}
          onChange={(e) => setJumpCutSpeed(Number(e.target.value))}
          className="hidden"
        />
      )}
      {glitchMode && (
        <input
          type="range"
          min="1"
          max="100"
          value={glitchIntensity}
          onChange={(e) => setGlitchIntensity(Number(e.target.value))}
          className="hidden"
        />
      )}
    </div>
  );
}