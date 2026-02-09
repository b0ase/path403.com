'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { TrendingUp, Users, DollarSign, Target, Zap, ArrowRight, Settings, Rocket, Activity, BarChart3, Info } from 'lucide-react';
import { BondingCurve, BondingCurveConfig, CurveType, formatPrice, formatNumber, CURVE_PRESETS } from '@/lib/tokenomics/bonding-curve';

const CURVE_OPTIONS: Array<{
  id: CurveType;
  name: string;
  description: string;
  icon: typeof TrendingUp;
  color: string;
}> = [
  {
    id: 'exponential',
    name: 'Exponential',
    description: 'Massive early advantage, premium for late buyers (Pump.fun style)',
    icon: Rocket,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Predictable, steady price increase',
    icon: TrendingUp,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'sigmoid',
    name: 'Sigmoid',
    description: 'S-curve: slow start, rapid middle, plateau at end',
    icon: BarChart3,
    color: 'from-orange-500 to-yellow-500',
  },
];

const PRESET_OPTIONS = [
  { id: 'pumpFun', name: 'Pump.fun Style', description: '13 orders of magnitude' },
  { id: 'conservative', name: 'Conservative', description: '6 orders of magnitude' },
  { id: 'linear', name: 'Linear', description: 'Predictable pricing' },
  { id: 'sigmoid', name: 'S-Curve', description: 'Adoption lifecycle' },
];

export default function PriceCurvePage() {
  // Config state
  const [curveType, setCurveType] = useState<CurveType>('exponential');
  const [minPrice, setMinPrice] = useState(0.0000001);
  const [maxPrice, setMaxPrice] = useState(1_000_000);
  const [totalSupply, setTotalSupply] = useState(BigInt(1_000_000_000));
  const [showConfig, setShowConfig] = useState(false);

  // Interactive state
  const [selectedMilestone, setSelectedMilestone] = useState(500_000_000);

  // Create bonding curve instance
  const curve = useMemo(() => {
    return new BondingCurve({
      totalSupply,
      minPrice,
      maxPrice,
      curveType,
    });
  }, [totalSupply, minPrice, maxPrice, curveType]);

  // Generate curve points for SVG
  const curvePoints = useMemo(() => {
    const points = curve.getCurvePoints(100);
    const logMin = Math.log10(minPrice);
    const logMax = Math.log10(maxPrice);
    const logRange = logMax - logMin;

    return points.map((p, i) => {
      const logPrice = Math.log10(p.price);
      const x = 5 + (i / 100) * 90;
      const y = 95 - ((logPrice - logMin) / logRange) * 90;
      return { x, y, ...p };
    });
  }, [curve, minPrice, maxPrice]);

  const curvePath = curvePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Selected point calculations
  const selectedPrice = curve.getPriceAtToken(selectedMilestone);
  const logMin = Math.log10(minPrice);
  const logMax = Math.log10(maxPrice);
  const logRange = logMax - logMin;
  const selectedX = 5 + (selectedMilestone / (Number(totalSupply) - 1)) * 90;
  const selectedY = 95 - ((Math.log10(selectedPrice) - logMin) / logRange) * 90;

  // Milestones
  const milestones = curve.getMilestones();

  // Apply preset
  const applyPreset = (presetId: string) => {
    const preset = CURVE_PRESETS[presetId as keyof typeof CURVE_PRESETS];
    if (preset) {
      setMinPrice(preset.minPrice);
      setMaxPrice(preset.maxPrice);
      setCurveType(preset.curveType);
      if (preset.totalSupply) {
        setTotalSupply(preset.totalSupply);
      }
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-500/10 via-transparent to-transparent" />
        <div className="max-w-5xl mx-auto px-6 py-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-black mb-4 font-mono uppercase tracking-tighter">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-500">
                Bonding Curve
              </span>
              <br />
              <span className="text-white">Visualizer</span>
            </h1>
            <p className="text-xl text-gray-400 mb-4 font-mono">
              From <span className="text-green-400">{formatPrice(minPrice)}</span> to{' '}
              <span className="text-red-400">{formatPrice(maxPrice)}</span>
            </p>
            <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
              Explore different bonding curve types for fair launch tokenomics.
              The earlier you buy, the cheaper the tokens. Configurable for any token launch.
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500/20 border border-sky-500/30 rounded-full text-sky-400">
              <Zap className="w-5 h-5" />
              <span className="font-bold font-mono">
                {formatNumber(totalSupply)} Tokens. {Math.round(logRange)} Orders of Magnitude.
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Curve Type Selector */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {CURVE_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => setCurveType(option.id)}
              className={`p-4 border text-left transition-all ${
                curveType === option.id
                  ? `border-white bg-gradient-to-br ${option.color} bg-opacity-20`
                  : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <option.icon className="w-5 h-5" />
                <span className="font-bold font-mono uppercase">{option.name}</span>
              </div>
              <p className="text-xs text-gray-400">{option.description}</p>
            </button>
          ))}
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <span className="text-xs text-gray-500 uppercase tracking-widest mr-2 self-center">Presets:</span>
          {PRESET_OPTIONS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className="px-4 py-2 text-xs font-mono uppercase border border-gray-800 hover:border-gray-600 bg-gray-900/50 transition-all"
            >
              {preset.name}
            </button>
          ))}
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-4 py-2 text-xs font-mono uppercase border border-gray-800 hover:border-gray-600 bg-gray-900/50 transition-all flex items-center gap-2"
          >
            <Settings className="w-3 h-3" />
            Custom
          </button>
        </div>

        {/* Custom Config Panel */}
        {showConfig && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="border border-gray-800 bg-gray-900/50 p-6 mb-8"
          >
            <h3 className="text-sm font-bold font-mono uppercase text-gray-500 mb-4">Custom Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase block mb-2">Min Price (USD)</label>
                <input
                  type="number"
                  step="any"
                  value={minPrice}
                  onChange={(e) => setMinPrice(parseFloat(e.target.value) || 0.0000001)}
                  className="w-full bg-black border border-gray-700 px-4 py-2 font-mono text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase block mb-2">Max Price (USD)</label>
                <input
                  type="number"
                  step="any"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseFloat(e.target.value) || 1000000)}
                  className="w-full bg-black border border-gray-700 px-4 py-2 font-mono text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase block mb-2">Total Supply</label>
                <input
                  type="number"
                  value={Number(totalSupply)}
                  onChange={(e) => setTotalSupply(BigInt(e.target.value || 1000000000))}
                  className="w-full bg-black border border-gray-700 px-4 py-2 font-mono text-sm"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Interactive Chart */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 md:p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 font-mono uppercase">
            <TrendingUp className="w-5 h-5 text-sky-500" />
            {curveType.charAt(0).toUpperCase() + curveType.slice(1)} Curve
          </h2>

          {/* SVG Chart */}
          <div className="relative aspect-[2/1] mb-6">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map(pct => (
                <line
                  key={`h-${pct}`}
                  x1="5"
                  y1={5 + (pct / 100) * 90}
                  x2="95"
                  y2={5 + (pct / 100) * 90}
                  stroke="#222"
                  strokeWidth="0.3"
                />
              ))}
              {[0, 25, 50, 75, 100].map(pct => (
                <line
                  key={`v-${pct}`}
                  x1={5 + (pct / 100) * 90}
                  y1="5"
                  x2={5 + (pct / 100) * 90}
                  y2="95"
                  stroke="#222"
                  strokeWidth="0.3"
                />
              ))}

              {/* Curve */}
              <defs>
                <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="50%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              <path
                d={curvePath}
                fill="none"
                stroke="url(#curveGradient)"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Selected point */}
              <circle
                cx={selectedX}
                cy={selectedY}
                r="3"
                fill="#fff"
                stroke="#000"
                strokeWidth="1"
              />

              {/* Vertical line to selected point */}
              <line
                x1={selectedX}
                y1={selectedY}
                x2={selectedX}
                y2="95"
                stroke="#fff"
                strokeWidth="0.5"
                strokeDasharray="2,2"
                opacity="0.5"
              />
            </svg>

            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] font-mono text-gray-500 py-[5%]">
              <span className="text-red-400">{formatPrice(maxPrice)}</span>
              <span>{formatPrice(Math.pow(10, logMin + logRange * 0.75))}</span>
              <span>{formatPrice(Math.pow(10, logMin + logRange * 0.5))}</span>
              <span>{formatPrice(Math.pow(10, logMin + logRange * 0.25))}</span>
              <span className="text-green-400">{formatPrice(minPrice)}</span>
            </div>

            {/* X-axis labels */}
            <div className="absolute bottom-0 left-[5%] right-[5%] flex justify-between text-[10px] font-mono text-gray-500">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Milestone Selector */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max={Number(totalSupply) - 1}
              value={selectedMilestone}
              onChange={(e) => setSelectedMilestone(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>

          {/* Selected Point Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-black/30 rounded-xl p-4">
              <div className="text-2xl font-bold text-white font-mono">{formatNumber(selectedMilestone + 1)}</div>
              <div className="text-xs text-gray-500 uppercase">Token #</div>
            </div>
            <div className="bg-black/30 rounded-xl p-4">
              <div className="text-2xl font-bold text-sky-400 font-mono">{formatPrice(selectedPrice)}</div>
              <div className="text-xs text-gray-500 uppercase">Price</div>
            </div>
            <div className="bg-black/30 rounded-xl p-4">
              <div className="text-2xl font-bold text-cyan-400 font-mono">{((selectedMilestone / Number(totalSupply)) * 100).toFixed(2)}%</div>
              <div className="text-xs text-gray-500 uppercase">Supply Sold</div>
            </div>
            <div className="bg-black/30 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-400 font-mono">{formatNumber(Number(totalSupply) - selectedMilestone)}</div>
              <div className="text-xs text-gray-500 uppercase">Remaining</div>
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Table */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 md:p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 font-mono uppercase">
            <Target className="w-5 h-5 text-sky-500" />
            Price Milestones
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-800">
                  <th className="pb-3 pr-4">Milestone</th>
                  <th className="pb-3 pr-4">Token #</th>
                  <th className="pb-3 pr-4">Price</th>
                  <th className="pb-3">Multiplier from Start</th>
                </tr>
              </thead>
              <tbody>
                {milestones.map((m, i) => {
                  const multiplier = m.price / minPrice;
                  const isSelected = Math.abs(selectedMilestone - m.tokenIndex) < Number(totalSupply) / 100;
                  return (
                    <tr
                      key={i}
                      className={`border-b border-gray-800/50 cursor-pointer transition-colors ${isSelected ? 'bg-sky-500/10' : 'hover:bg-gray-800/30'}`}
                      onClick={() => setSelectedMilestone(m.tokenIndex)}
                    >
                      <td className="py-3 pr-4 text-gray-400">{m.label}</td>
                      <td className="py-3 pr-4 font-mono text-white">{formatNumber(m.tokenIndex + 1)}</td>
                      <td className="py-3 pr-4 font-mono font-bold" style={{
                        color: i === 0 ? '#22c55e' : i === milestones.length - 1 ? '#ef4444' : '#0ea5e9'
                      }}>
                        {formatPrice(m.price)}
                      </td>
                      <td className="py-3 font-mono text-cyan-400">
                        {multiplier >= 1_000_000_000 ? `${(multiplier / 1_000_000_000).toFixed(0)}B` :
                          multiplier >= 1_000_000 ? `${(multiplier / 1_000_000).toFixed(0)}M` :
                            multiplier >= 1_000 ? `${(multiplier / 1_000).toFixed(0)}K` :
                              `${multiplier.toFixed(0)}`}x
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* The Math */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 md:p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 font-mono uppercase">
            <DollarSign className="w-5 h-5 text-sky-500" />
            The Math
          </h2>

          <div className="bg-black/50 rounded-xl p-6 font-mono text-sm overflow-x-auto">
            <div className="text-gray-500 mb-2">// Price formula ({curveType} bonding curve)</div>
            {curveType === 'exponential' && (
              <>
                <div className="text-green-400 mb-4">
                  P(n) = 10<sup>(log<sub>10</sub>(minPrice) + logRange * n / (supply - 1))</sup>
                </div>
                <div className="text-gray-500 mb-2">// Where logRange = log<sub>10</sub>(maxPrice) - log<sub>10</sub>(minPrice)</div>
              </>
            )}
            {curveType === 'linear' && (
              <div className="text-green-400 mb-4">
                P(n) = minPrice + (maxPrice - minPrice) * n / (supply - 1)
              </div>
            )}
            {curveType === 'sigmoid' && (
              <>
                <div className="text-green-400 mb-4">
                  P(n) = minPrice + (maxPrice - minPrice) / (1 + e<sup>-k * (n - supply/2)</sup>)
                </div>
                <div className="text-gray-500 mb-2">// Where k controls the steepness of the S-curve</div>
              </>
            )}

            <div className="text-gray-500 mb-2 mt-4">// Examples:</div>
            <div className="text-gray-300 space-y-1">
              <div>Token #1 = {formatPrice(curve.getPriceAtToken(0))} (first token)</div>
              <div>Token #{formatNumber(Math.floor(Number(totalSupply) / 2))} = {formatPrice(curve.getPriceAtToken(Math.floor(Number(totalSupply) / 2)))} (halfway)</div>
              <div>Token #{formatNumber(totalSupply)} = {formatPrice(curve.getPriceAtToken(Number(totalSupply) - 1))} (last token)</div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-800 text-gray-500">
              // This spans {Math.round(logRange)} orders of magnitude<br />
              // A {formatNumber(Math.pow(10, logRange))}x increase from first to last
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-br from-sky-500/10 to-purple-500/10 border border-sky-500/30 rounded-3xl p-6 md:p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 font-mono uppercase">
            <Info className="w-5 h-5 text-sky-500" />
            Use Cases
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-bold text-white">Repository Tokenization</h3>
              <p className="text-sm text-gray-400">
                Turn open-source repos into tradeable tokens. Early supporters get massive
                token allocations at minimal cost.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-white">Developer Tokens</h3>
              <p className="text-sm text-gray-400">
                Developers can tokenize their skills and future earnings. Investors share
                in their success through bonding curve mechanics.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-white">Project Launches</h3>
              <p className="text-sm text-gray-400">
                Fair launch mechanism for any project. No pre-mine, no insider allocation.
                Price discovery through the curve.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-5xl mx-auto px-6 py-16 text-center">
        <Link
          href="/mint"
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-black text-lg uppercase tracking-tight hover:bg-gray-200 transition-all font-mono"
        >
          Launch Your Token
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </main>
  );
}
