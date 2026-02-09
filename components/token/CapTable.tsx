'use client';

import React, { useMemo } from 'react';

interface CapTableEntry {
  holder: string;
  displayName?: string;
  tokens: number;
  percentage: number;
  category: 'treasury' | 'founder' | 'investor' | 'team' | 'public';
}

interface CapTableProps {
  entries: CapTableEntry[];
  tokenSymbol: string;
  totalSupply: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  treasury: '#10b981', // green
  founder: '#6366f1',  // indigo
  investor: '#f59e0b', // amber
  team: '#8b5cf6',     // violet
  public: '#06b6d4',   // cyan
};

const CATEGORY_LABELS: Record<string, string> = {
  treasury: 'TREASURY',
  founder: 'FOUNDER',
  investor: 'INVESTORS',
  team: 'TEAM',
  public: 'PUBLIC',
};

export default function CapTable({ entries, tokenSymbol, totalSupply }: CapTableProps) {
  // Sort entries by percentage descending
  const sortedEntries = useMemo(() =>
    [...entries].sort((a, b) => b.percentage - a.percentage),
    [entries]
  );

  // Calculate pie chart segments
  const pieSegments = useMemo(() => {
    let currentAngle = 0;
    return sortedEntries.map(entry => {
      const angle = (entry.percentage / 100) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;
      return {
        ...entry,
        startAngle,
        endAngle: currentAngle,
        color: CATEGORY_COLORS[entry.category] || '#64748b'
      };
    });
  }, [sortedEntries]);

  // Generate SVG path for pie segment
  const createPieSegment = (
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number
  ): string => {
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  const formatNumber = (n: number): string => {
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <div className="bg-black border border-white/20">
      {/* Header */}
      <div className="border-b border-white/20 p-4">
        <h3 className="text-lg font-bold uppercase tracking-wider">
          ${tokenSymbol} CAP TABLE
        </h3>
        <p className="text-sm text-white/60 mt-1">
          Total Supply: {formatNumber(totalSupply)} tokens
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-0">
        {/* Pie Chart */}
        <div className="p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/20">
          <svg viewBox="0 0 200 200" className="w-full max-w-[250px]">
            {pieSegments.map((segment, i) => (
              <path
                key={i}
                d={createPieSegment(100, 100, 80, segment.startAngle, segment.endAngle)}
                fill={segment.color}
                stroke="black"
                strokeWidth="2"
                className="hover:opacity-80 transition-opacity cursor-pointer"
              >
                <title>
                  {segment.displayName || segment.holder}: {segment.percentage.toFixed(1)}%
                </title>
              </path>
            ))}
            {/* Center circle for donut effect */}
            <circle cx="100" cy="100" r="40" fill="black" />
            <text
              x="100"
              y="95"
              textAnchor="middle"
              fill="white"
              className="text-xs font-bold"
            >
              ${tokenSymbol}
            </text>
            <text
              x="100"
              y="110"
              textAnchor="middle"
              fill="white"
              className="text-[10px]"
            >
              {formatNumber(totalSupply)}
            </text>
          </svg>
        </div>

        {/* Legend & Table */}
        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-white/60 uppercase">
                <th className="pb-2">Holder</th>
                <th className="pb-2 text-right">Tokens</th>
                <th className="pb-2 text-right">%</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {sortedEntries.map((entry, i) => (
                <tr
                  key={i}
                  className="border-t border-white/10 hover:bg-white/5"
                >
                  <td className="py-2 flex items-center gap-2">
                    <span
                      className="w-3 h-3 inline-block"
                      style={{ backgroundColor: CATEGORY_COLORS[entry.category] }}
                    />
                    <span className="truncate max-w-[120px]">
                      {entry.displayName || CATEGORY_LABELS[entry.category] || entry.holder.slice(0, 8)}
                    </span>
                  </td>
                  <td className="py-2 text-right font-mono">
                    {formatNumber(entry.tokens)}
                  </td>
                  <td className="py-2 text-right font-mono">
                    {entry.percentage.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Legend */}
      <div className="border-t border-white/20 p-4">
        <div className="flex flex-wrap gap-4 text-xs">
          {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
            <div key={category} className="flex items-center gap-1">
              <span
                className="w-2 h-2"
                style={{ backgroundColor: color }}
              />
              <span className="uppercase text-white/60">
                {CATEGORY_LABELS[category]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
