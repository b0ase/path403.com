'use client';

import { useState } from 'react';
import Link from 'next/link';
import SmartTokenButton from '@/components/SmartTokenButton';
import { getMintedTokens, getConceptTokens } from '@/lib/token-registry';

export default function TestMoneyButtonPage() {
  const [idleTimeout, setIdleTimeout] = useState(100); // Near-instant start
  const [cycleInterval, setCycleInterval] = useState(2000);

  const mintedTokens = getMintedTokens();
  const conceptTokens = getConceptTokens().slice(0, 10);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">SmartTokenButton Test Page</h1>
            <p className="text-sm text-white/50">Testing the actual navbar MoneyButton with instant cycling</p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 border border-white/20 rounded hover:bg-white/10 text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="px-8 py-16">
        <div className="max-w-4xl mx-auto">

          {/* The Actual SmartTokenButton */}
          <div className="mb-16">
            <h2 className="text-sm uppercase tracking-widest text-white/50 mb-8 text-center">
              Actual SmartTokenButton Component (from Navbar)
            </h2>

            {/* Simulated Navbar Context */}
            <div className="flex justify-center mb-8">
              <div className="bg-zinc-900 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                <div className="text-xs text-white/40 uppercase tracking-wider">Navbar Preview:</div>

                {/* The actual SmartTokenButton - same as in NavbarWithMusic but standalone */}
                <SmartTokenButton
                  isDark={true}
                  boaseTokens={1000000}
                  idleTimeout={idleTimeout}
                  cycleInterval={cycleInterval}
                  standalone={true}
                  disableActivityReset={true}
                />
              </div>
            </div>

            {/* Speed controls */}
            <div className="flex flex-col items-center gap-6">
              <div>
                <div className="text-xs text-white/50 mb-2 text-center">Idle Timeout (ms before cycling starts)</div>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setIdleTimeout(100)}
                    className={`px-3 py-1.5 rounded text-xs ${
                      idleTimeout === 100 ? 'bg-white text-black' : 'border border-white/20 hover:bg-white/10'
                    }`}
                  >
                    100ms (instant)
                  </button>
                  <button
                    onClick={() => setIdleTimeout(5000)}
                    className={`px-3 py-1.5 rounded text-xs ${
                      idleTimeout === 5000 ? 'bg-white text-black' : 'border border-white/20 hover:bg-white/10'
                    }`}
                  >
                    5s
                  </button>
                  <button
                    onClick={() => setIdleTimeout(15000)}
                    className={`px-3 py-1.5 rounded text-xs ${
                      idleTimeout === 15000 ? 'bg-white text-black' : 'border border-white/20 hover:bg-white/10'
                    }`}
                  >
                    15s (default)
                  </button>
                </div>
              </div>

              <div>
                <div className="text-xs text-white/50 mb-2 text-center">Cycle Interval (ms between token changes)</div>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setCycleInterval(1000)}
                    className={`px-3 py-1.5 rounded text-xs ${
                      cycleInterval === 1000 ? 'bg-white text-black' : 'border border-white/20 hover:bg-white/10'
                    }`}
                  >
                    1s (fast)
                  </button>
                  <button
                    onClick={() => setCycleInterval(2000)}
                    className={`px-3 py-1.5 rounded text-xs ${
                      cycleInterval === 2000 ? 'bg-white text-black' : 'border border-white/20 hover:bg-white/10'
                    }`}
                  >
                    2s
                  </button>
                  <button
                    onClick={() => setCycleInterval(4000)}
                    className={`px-3 py-1.5 rounded text-xs ${
                      cycleInterval === 4000 ? 'bg-white text-black' : 'border border-white/20 hover:bg-white/10'
                    }`}
                  >
                    4s (default)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Multiple Buttons Side by Side */}
          <div className="border-t border-white/10 pt-12 mb-12">
            <h2 className="text-sm uppercase tracking-widest text-white/50 mb-6">
              Multiple Buttons - Different Speeds
            </h2>

            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-xs text-white/50 mb-4">Fast (1s cycle)</div>
                <div className="flex justify-center">
                  <div className="bg-zinc-900 border border-white/10 rounded-xl p-4">
                    <SmartTokenButton
                      isDark={true}
                      idleTimeout={100}
                      cycleInterval={1000}
                      standalone={true}
                      disableActivityReset={true}
                    />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-xs text-white/50 mb-4">Medium (2s cycle)</div>
                <div className="flex justify-center">
                  <div className="bg-zinc-900 border border-white/10 rounded-xl p-4">
                    <SmartTokenButton
                      isDark={true}
                      idleTimeout={100}
                      cycleInterval={2000}
                      standalone={true}
                      disableActivityReset={true}
                    />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-xs text-white/50 mb-4">Slow (4s cycle)</div>
                <div className="flex justify-center">
                  <div className="bg-zinc-900 border border-white/10 rounded-xl p-4">
                    <SmartTokenButton
                      isDark={true}
                      idleTimeout={100}
                      cycleInterval={4000}
                      standalone={true}
                      disableActivityReset={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Token Registry */}
          <div className="border-t border-white/10 pt-12">
            <h2 className="text-sm uppercase tracking-widest text-white/50 mb-6">
              Tokens in Rotation
            </h2>

            <div className="grid grid-cols-2 gap-8">
              {/* Minted Tokens */}
              <div>
                <h3 className="text-xs font-bold text-green-400 mb-3">Minted ({mintedTokens.length})</h3>
                <div className="space-y-2">
                  {mintedTokens.map(token => (
                    <Link
                      key={token.symbol}
                      href={token.projectSlug ? `/portfolio/${token.projectSlug}` : (token.marketUrl || '/exchange')}
                      className="block p-3 border border-green-900/30 bg-green-900/10 rounded hover:bg-green-900/20 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-sm">{token.symbol}</span>
                          <span className="text-white/50 text-xs ml-2">{token.name}</span>
                        </div>
                        {token.pricing?.marketCap && (
                          <span className="text-xs text-green-400">
                            ${(token.pricing.marketCap / 1000000).toFixed(1)}M
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Concept Tokens */}
              <div>
                <h3 className="text-xs font-bold text-amber-400 mb-3">Concept ({conceptTokens.length})</h3>
                <div className="space-y-2">
                  {conceptTokens.map(token => (
                    <Link
                      key={token.symbol}
                      href={token.projectSlug ? `/portfolio/${token.projectSlug}` : '/exchange'}
                      className="block p-3 border border-amber-900/30 bg-amber-900/10 rounded hover:bg-amber-900/20 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-sm">{token.symbol}</span>
                          <span className="text-white/50 text-xs ml-2">{token.name}</span>
                        </div>
                        <span className="text-xs text-amber-400/50">concept</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="mt-12 p-6 border border-white/10 rounded-lg bg-white/5">
            <h3 className="font-bold mb-3">How SmartTokenButton Works</h3>
            <ul className="text-sm text-white/70 space-y-2">
              <li>• <strong>Default:</strong> Shows $BOASE, clicking navigates home</li>
              <li>• <strong>After idle timeout:</strong> Starts cycling through all tokens</li>
              <li>• <strong>While cycling:</strong> Clicking navigates to that token's project</li>
              <li>• <strong>User activity:</strong> Resets back to $BOASE</li>
              <li>• <strong>Rainbow ring:</strong> Appears when cycling is active</li>
              <li>• <strong>Green dot:</strong> Indicates cycling mode</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
