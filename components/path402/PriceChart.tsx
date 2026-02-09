'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { TokenWithPrice, PriceSchedule } from '@/lib/path402/types';

interface PriceChartProps {
  token: TokenWithPrice;
  schedule?: PriceSchedule[];
  height?: number;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  token,
  schedule,
  height = 200
}) => {
  // Generate default schedule if not provided
  const priceSchedule = useMemo(() => {
    if (schedule) return schedule;

    // Generate points for visualization
    const points: PriceSchedule[] = [];
    const supplies = [0, 1, 5, 10, 25, 50, 100, 250, 500, 1000];

    for (const supply of supplies) {
      const price = Math.ceil(token.base_price_sats / Math.sqrt(supply + 1));
      points.push({
        supply,
        unit_price_sats: price,
        cumulative_cost_sats: 0 // Not needed for display
      });
    }

    return points;
  }, [token, schedule]);

  // Calculate chart dimensions
  const maxPrice = priceSchedule[0]?.unit_price_sats || token.base_price_sats;
  const maxSupply = priceSchedule[priceSchedule.length - 1]?.supply || 1000;

  // SVG path for the curve
  const pathD = useMemo(() => {
    if (priceSchedule.length < 2) return '';

    const chartWidth = 100; // Percentage
    const chartHeight = 100;

    const points = priceSchedule.map((point, i) => {
      const x = (point.supply / maxSupply) * chartWidth;
      const y = chartHeight - (point.unit_price_sats / maxPrice) * chartHeight;
      return { x, y };
    });

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }

    return d;
  }, [priceSchedule, maxPrice, maxSupply]);

  // Current position on curve
  const currentX = (token.total_supply / maxSupply) * 100;
  const currentY = 100 - (token.current_price_sats / maxPrice) * 100;

  return (
    <div className="border border-white/10 rounded-xl p-6 bg-gray-900/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white">Price Curve</h3>
        <div className="text-xs text-gray-500">
          sqrt_decay: price = {token.base_price_sats} / sqrt(supply + 1)
        </div>
      </div>

      {/* Chart */}
      <div className="relative" style={{ height }}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Price curve */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="url(#curveGradient)"
            strokeWidth="0.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />

          {/* Gradient for curve */}
          <defs>
            <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
          </defs>

          {/* Fill under curve */}
          <motion.path
            d={pathD + ` L 100 100 L 0 100 Z`}
            fill="url(#fillGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ delay: 0.5 }}
          />
          <defs>
            <linearGradient id="fillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>

          {/* Current position marker */}
          <motion.circle
            cx={currentX}
            cy={currentY}
            r="2"
            fill="#22c55e"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1 }}
          />

          {/* Current position crosshairs */}
          <line
            x1={currentX}
            y1="0"
            x2={currentX}
            y2="100"
            stroke="rgba(34, 197, 94, 0.3)"
            strokeWidth="0.3"
            strokeDasharray="2 2"
          />
          <line
            x1="0"
            y1={currentY}
            x2="100"
            y2={currentY}
            stroke="rgba(34, 197, 94, 0.3)"
            strokeWidth="0.3"
            strokeDasharray="2 2"
          />
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-[10px] text-gray-500 font-mono">
          <span>{maxPrice}</span>
          <span>{Math.round(maxPrice / 2)}</span>
          <span>0</span>
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-12 right-0 flex justify-between text-[10px] text-gray-500 font-mono">
          <span>0</span>
          <span>{Math.round(maxSupply / 2)}</span>
          <span>{maxSupply}</span>
        </div>

        {/* Current position tooltip */}
        <motion.div
          className="absolute px-2 py-1 bg-green-500/20 border border-green-500/50 rounded text-xs text-green-400 font-mono pointer-events-none"
          style={{
            left: `calc(${currentX}% + 12px)`,
            top: `calc(${currentY}% - 12px)`,
            transform: 'translateX(-50%)'
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          {token.current_price_sats} sats @ supply {token.total_supply}
        </motion.div>
      </div>

      {/* Price schedule table */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-xs text-gray-500 uppercase mb-2">Price Schedule</div>
        <div className="grid grid-cols-5 gap-2 text-xs">
          {priceSchedule.slice(0, 5).map((point) => (
            <div
              key={point.supply}
              className={`p-2 rounded bg-black/30 text-center ${
                point.supply === token.total_supply
                  ? 'ring-1 ring-green-500'
                  : ''
              }`}
            >
              <div className="text-gray-500">Supply {point.supply}</div>
              <div className="font-mono text-white">{point.unit_price_sats}</div>
              <div className="text-gray-600">sats</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
