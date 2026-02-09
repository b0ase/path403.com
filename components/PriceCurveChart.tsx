'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  TooltipContentProps,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import { motion } from 'framer-motion';

interface PriceCurveChartProps {
  treasuryRemaining: number;
  currentPrice: number;
  tokensToBuy: number;
  bsvUsdPrice: number;
  showUsd: boolean;
}

const BASE_PRICE_SATS = 223_610; // ~10 sats/token at 500M treasury, 1 BSV = 1% of supply
const TOTAL_TREASURY = 500_000_000;

type ChartPoint = {
  remaining: number;
  price: number;
  priceUsd: number;
  isPurchaseZone: boolean;
  label: string;
};

function calculatePrice(remaining: number): number {
  return Math.ceil(BASE_PRICE_SATS / Math.sqrt(remaining + 1));
}

export default function PriceCurveChart({
  treasuryRemaining,
  currentPrice,
  tokensToBuy,
  bsvUsdPrice,
  showUsd,
}: PriceCurveChartProps) {
  const [zoomLevel, setZoomLevel] = useState<'full' | 'medium' | 'close'>('medium');

  // Generate curve data points based on zoom level
  const chartData = useMemo(() => {
    const data: ChartPoint[] = [];

    let start: number, end: number, step: number;

    switch (zoomLevel) {
      case 'full':
        // Show entire curve from 500M to 1
        start = TOTAL_TREASURY;
        end = 1000;
        step = Math.floor(TOTAL_TREASURY / 100);
        break;
      case 'medium':
        // Show from current position to ~50% depleted
        start = Math.min(treasuryRemaining + 50_000_000, TOTAL_TREASURY);
        end = Math.max(treasuryRemaining - 100_000_000, 1000);
        step = Math.floor((start - end) / 80);
        break;
      case 'close':
        // Show just around the purchase zone
        start = Math.min(treasuryRemaining + 10_000_000, TOTAL_TREASURY);
        end = Math.max(treasuryRemaining - tokensToBuy - 5_000_000, 1000);
        step = Math.max(Math.floor((start - end) / 80), 1000);
        break;
    }

    for (let remaining = start; remaining >= end; remaining -= step) {
      const price = calculatePrice(remaining);
      const priceInBsv = price / 100_000_000;
      const priceUsd = priceInBsv * bsvUsdPrice;

      // Check if this point is in the purchase zone
      const isPurchaseZone =
        remaining <= treasuryRemaining &&
        remaining > treasuryRemaining - tokensToBuy;

      data.push({
        remaining,
        price,
        priceUsd,
        isPurchaseZone,
        label: formatNumber(remaining),
      });
    }

    return data;
  }, [treasuryRemaining, tokensToBuy, zoomLevel, bsvUsdPrice]);

  // Calculate purchase zone bounds
  const purchaseStart = treasuryRemaining;
  const purchaseEnd = Math.max(treasuryRemaining - tokensToBuy, 0);
  const startPrice = calculatePrice(purchaseStart);
  const endPrice = calculatePrice(purchaseEnd);

  // Format helpers
  function formatNumber(n: number): string {
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  }

  function formatPrice(sats: number): string {
    if (showUsd) {
      const bsv = sats / 100_000_000;
      const usd = bsv * bsvUsdPrice;
      if (usd < 0.01) return `$${usd.toFixed(4)}`;
      if (usd < 1) return `$${usd.toFixed(3)}`;
      return `$${usd.toFixed(2)}`;
    }
    if (sats >= 100_000_000) return `${(sats / 100_000_000).toFixed(2)} BSV`;
    if (sats >= 1_000_000) return `${(sats / 1_000_000).toFixed(2)}M sats`;
    if (sats >= 1_000) return `${(sats / 1_000).toFixed(1)}K sats`;
    return `${sats} sats`;
  }

  const CustomTooltip = ({ active, payload }: TooltipContentProps<number, string>) => {
    const data = payload?.[0]?.payload as ChartPoint | undefined;
    if (!active || !data) return null;
    return (
      <div className="bg-black/90 border border-gray-700 rounded-lg p-3 shadow-xl">
        <div className="text-gray-400 text-xs mb-1">Treasury Remaining</div>
        <div className="text-white font-bold">{formatNumber(data.remaining)} tokens</div>
        <div className="text-gray-400 text-xs mt-2 mb-1">Price per Token</div>
        <div className="text-green-400 font-bold">{formatPrice(data.price)}</div>
        {data.isPurchaseZone && (
          <div className="mt-2 text-xs text-yellow-400 border-t border-gray-700 pt-2">
            In your purchase range
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-sm rounded-xl border border-gray-800 p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">Price Curve</h3>
        <div className="flex gap-2">
          {(['full', 'medium', 'close'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setZoomLevel(level)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                zoomLevel === level
                  ? 'bg-white text-black'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {level === 'full' ? 'Full Curve' : level === 'medium' ? 'Current Zone' : 'Purchase View'}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-400 rounded" />
          <span className="text-gray-400">Price curve</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500/60 rounded" />
          <span className="text-gray-400">Your purchase zone</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-white rounded-full" />
          <span className="text-gray-400">Current position</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="purchaseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#eab308" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#eab308" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="remaining"
              tickFormatter={formatNumber}
              stroke="#6b7280"
              fontSize={10}
              reversed
              axisLine={{ stroke: '#374151' }}
              tickLine={{ stroke: '#374151' }}
            />
            <YAxis
              tickFormatter={(v) => formatPrice(v)}
              stroke="#6b7280"
              fontSize={10}
              axisLine={{ stroke: '#374151' }}
              tickLine={{ stroke: '#374151' }}
              width={70}
            />
            <Tooltip content={CustomTooltip} />

            {/* Main price curve */}
            <Area
              type="monotone"
              dataKey="price"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#priceGradient)"
            />

            {/* Current position marker */}
            <ReferenceLine
              x={treasuryRemaining}
              stroke="#ffffff"
              strokeDasharray="5 5"
              strokeWidth={1}
            />

            {/* Purchase zone start */}
            {tokensToBuy > 0 && (
              <>
                <ReferenceLine
                  x={purchaseEnd}
                  stroke="#eab308"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
                <ReferenceDot
                  x={treasuryRemaining}
                  y={currentPrice}
                  r={6}
                  fill="#ffffff"
                  stroke="#22c55e"
                  strokeWidth={2}
                />
                <ReferenceDot
                  x={purchaseEnd}
                  y={endPrice}
                  r={5}
                  fill="#eab308"
                  stroke="#eab308"
                  strokeWidth={2}
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Purchase summary */}
      {tokensToBuy > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">Entry Price</div>
            <div className="text-green-400 font-bold">{formatPrice(startPrice)}</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">Exit Price</div>
            <div className="text-yellow-400 font-bold">{formatPrice(endPrice)}</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">Price Impact</div>
            <div className="text-white font-bold">
              +{(((endPrice - startPrice) / startPrice) * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      )}

      {/* Curve explanation */}
      <div className="mt-4 text-xs text-gray-500 border-t border-gray-800 pt-4">
        <strong className="text-gray-400">sqrt_decay pricing:</strong> price = 223,610 / sqrt(remaining + 1).
        At 500M treasury: ~10 sats/token. 1 BSV buys ~1% of supply. Early buyers win.
      </div>
    </motion.div>
  );
}
