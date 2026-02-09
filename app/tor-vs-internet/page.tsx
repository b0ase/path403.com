'use client';

import React from 'react';
import Link from 'next/link';

export default function TorVsInternetPage() {
  const data = [
    { name: 'Open Internet Use', value: 99.93, color: '#3B82F6' },
    { name: 'TOR Network Use', value: 0.0708, color: '#EF4444' }
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate angles for the pie chart
  let currentAngle = -90; // Start from top
  const segments = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;
    
    return {
      ...item,
      percentage,
      startAngle,
      endAngle,
      angle
    };
  });

  // Convert polar coordinates to cartesian for SVG path
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };

  // Create SVG path for a pie segment
  const createPath = (centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(centerX, centerY, radius, startAngle);
    const end = polarToCartesian(centerX, centerY, radius, endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    
    // For very small segments, ensure they're visible
    if (endAngle - startAngle < 1) {
      // Draw a thin line for visibility
      const extendedEnd = polarToCartesian(centerX, centerY, radius, startAngle + 2);
      return [
        'M', centerX, centerY,
        'L', start.x, start.y,
        'A', radius, radius, 0, '0', 1, extendedEnd.x, extendedEnd.y,
        'Z'
      ].join(' ');
    }
    
    return [
      'M', centerX, centerY,
      'L', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 1, end.x, end.y,
      'Z'
    ].join(' ');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-white hover:text-gray-400 transition">
              b0ase
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 pt-24 pb-12 max-w-6xl">
        <header className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            TOR vs Internet Usage
          </h1>
          <p className="text-xl text-gray-400">
            A lens into privacy-focused technology adoption patterns
          </p>
        </header>

        {/* Chart Container */}
        <div className="bg-gray-900 border-2 border-white p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
            {/* SVG Pie Chart */}
            <div className="relative">
              <svg width="400" height="400" viewBox="0 0 400 400" className="w-full max-w-md">
                {/* Pie segments */}
                {segments.map((segment, index) => (
                  <g key={index}>
                    <path
                      d={createPath(200, 200, 150, segment.startAngle, segment.endAngle)}
                      fill={segment.color}
                      stroke="black"
                      strokeWidth="2"
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                    {/* Add a pointer line for the TOR segment since it's so small */}
                    {segment.name === 'TOR Network Use' && (
                      <>
                        <line
                          x1="200"
                          y1="200"
                          x2="350"
                          y2="100"
                          stroke="white"
                          strokeWidth="1"
                          strokeDasharray="2,2"
                        />
                        <text
                          x="355"
                          y="95"
                          fill="white"
                          fontSize="14"
                          fontWeight="bold"
                        >
                          TOR: {segment.value}%
                        </text>
                      </>
                    )}
                  </g>
                ))}
                
                {/* Center circle for donut effect */}
                <circle cx="200" cy="200" r="75" fill="black" stroke="white" strokeWidth="2" />
                
                {/* Center text */}
                <text x="200" y="195" textAnchor="middle" fontSize="18" fontWeight="bold" fill="white">
                  Network Usage
                </text>
                <text x="200" y="215" textAnchor="middle" fontSize="14" fill="#9CA3AF">
                  Distribution
                </text>
              </svg>
            </div>

            {/* Legend */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-6">Distribution Breakdown</h2>
              {data.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-black border border-gray-600">
                  <div 
                    className="w-6 h-6 border border-white"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{item.name}</div>
                    <div className="text-gray-400">
                      {item.value}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-600 p-6">
            <h3 className="text-xl font-bold mb-3">Open Internet</h3>
            <p className="text-gray-300 mb-4">
              The transparent, scalable backbone of global digital communication - like BitcoinSV's public ledger.
            </p>
            <div className="text-3xl font-bold text-blue-600">99.93%</div>
            <div className="text-sm text-gray-400 mt-1">of total network usage</div>
          </div>
          
          <div className="bg-gray-900 border border-gray-600 p-6">
            <h3 className="text-xl font-bold mb-3">TOR Network</h3>
            <p className="text-gray-300 mb-4">
              Privacy-focused routing - similar to ZCash's shielded transactions in the crypto space.
            </p>
            <div className="text-3xl font-bold text-red-600">0.0708%</div>
            <div className="text-sm text-gray-400 mt-1">of total network usage</div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-black border-2 border-white p-8">
          <h3 className="text-2xl font-bold mb-6">Key Insights: The Privacy Paradox</h3>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-white mt-1">•</span>
              <span>TOR network usage represents less than 0.1% of total internet traffic</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-white mt-1">•</span>
              <span>For every 1 TOR user, there are approximately 1,411 regular internet users</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-white mt-1">•</span>
              <span>Privacy-focused networks remain a niche segment - just like ZCash in cryptocurrency</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-white mt-1">•</span>
              <span><strong>The Analogy:</strong> TOR is to the Internet what ZCash is to BitcoinSV - a privacy layer that sacrifices scale and adoption for anonymity</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-white mt-1">•</span>
              <span>Both pairs demonstrate that transparency and scalability win over privacy in real-world adoption</span>
            </li>
          </ul>
        </div>

        {/* The Broader Pattern */}
        <div className="bg-gray-900 border border-gray-600 p-8 mt-8 mb-8">
          <h3 className="text-2xl font-bold mb-6">The Pattern Across Technologies</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-bold mb-3 text-blue-400">Networking Layer</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-gray-500">→</span>
                  <span><strong>Internet:</strong> Public, transparent, scalable</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-500">→</span>
                  <span><strong>TOR:</strong> Private, anonymous, limited</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-500">→</span>
                  <span><strong>Result:</strong> 99.93% choose transparency</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-3 text-green-400">Blockchain Layer</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-gray-500">→</span>
                  <span><strong>BitcoinSV:</strong> Public ledger, unlimited scale</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-500">→</span>
                  <span><strong>ZCash:</strong> Shielded transactions, privacy focus</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-500">→</span>
                  <span><strong>Result:</strong> Privacy coins remain niche</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-black border border-gray-700">
            <p className="text-center text-gray-300">
              <strong className="text-white">The Universal Truth:</strong> When given the choice between privacy and utility, 
              markets consistently choose transparent, scalable solutions over privacy-focused alternatives.
            </p>
          </div>
        </div>

        {/* Data Source */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>Data visualization illustrating the adoption patterns of privacy-focused vs transparent technologies</p>
          <p className="mt-1">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}