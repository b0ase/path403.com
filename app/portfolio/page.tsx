'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

function formatSats(sats: number): string {
  if (Math.abs(sats) >= 1000000) return `${(sats / 1000000).toFixed(2)}M`;
  if (Math.abs(sats) >= 1000) return `${(sats / 1000).toFixed(1)}K`;
  return sats.toLocaleString();
}

const DEMO_HOLDINGS = [
  { token_id: '402_BONES', name: 'ALEX BONES', balance: 420, total_spent_sats: 8400, total_revenue_sats: 12600, pnl_sats: 4200 },
  { token_id: '402_CARLSBERG', name: 'FUCKER CARLSBERG', balance: 69, total_spent_sats: 4761, total_revenue_sats: 3200, pnl_sats: -1561 },
  { token_id: '402_KWEG', name: 'KWEG WONG ESQ.', balance: 1000, total_spent_sats: 21000, total_revenue_sats: 34500, pnl_sats: 13500 },
  { token_id: '402_HOENS', name: 'CANDY HOENS', balance: 88, total_spent_sats: 7744, total_revenue_sats: 9680, pnl_sats: 1936 },
  { token_id: '402_FLUENZA', name: 'DICK FLUENZA', balance: 500, total_spent_sats: 7000, total_revenue_sats: 5500, pnl_sats: -1500 },
  { token_id: '402_FAYLOOR', name: 'MICHAEL FAYLOOR', balance: 21, total_spent_sats: 441000, total_revenue_sats: 500000, pnl_sats: 59000 },
];

export default function PortfolioPage() {
  const totalValue = DEMO_HOLDINGS.reduce((sum, h) => sum + h.total_revenue_sats, 0);
  const totalCost = DEMO_HOLDINGS.reduce((sum, h) => sum + h.total_spent_sats, 0);
  const totalPnL = DEMO_HOLDINGS.reduce((sum, h) => sum + h.pnl_sats, 0);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-mono">
      <main className="w-full px-4 md:px-8 py-16 max-w-[1920px] mx-auto">
        {/* PageHeader */}
        <header className="mb-8 border-b border-zinc-200 dark:border-zinc-900 pb-6 flex items-end justify-between overflow-hidden relative">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 mb-4 text-zinc-500 text-xs tracking-widest uppercase"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Main Ledger / Holdings
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl md:text-6xl font-black tracking-tighter mb-2"
            >
              PORTFOLIO<span className="text-zinc-300 dark:text-zinc-800">.SYS</span>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-zinc-500 max-w-lg"
            >
              <b>Asset Performance.</b> Real-time valuation of acquired content tokens.
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 0.1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "backOut" }}
            className="hidden md:block text-6xl"
          >
            📊
          </motion.div>
        </header>

        {/* Demo Banner */}
        <div className="mb-8 border border-amber-500/30 bg-amber-500/5 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-amber-500 rounded-full" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Demo Data — Download the desktop client for live portfolio tracking
            </span>
          </div>
          <Link href="/download" className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 hover:text-black dark:hover:text-white transition-colors">
            Download →
          </Link>
        </div>

        {/* Portfolio Summary - Sharp Grid */}
        <section className="mb-12">
          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 border-b border-zinc-200 dark:border-zinc-900 pb-2">
            Ledger Summary
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
            <div className="border-r border-b md:border-b-0 border-zinc-200 dark:border-zinc-800 p-8">
              <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mb-2">Total Value</div>
              <div className="text-3xl md:text-4xl font-black tracking-tighter">{formatSats(totalValue)} <span className="text-base text-zinc-500 font-normal">SAT</span></div>
            </div>
            <div className="border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 p-8">
              <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mb-2">Total Cost</div>
              <div className="text-3xl md:text-4xl font-black tracking-tighter text-zinc-400">{formatSats(totalCost)} <span className="text-base text-zinc-500 font-normal">SAT</span></div>
            </div>
            <div className="border-r border-zinc-200 dark:border-zinc-800 p-8">
              <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mb-2">Net P&L</div>
              <div className={`text-3xl md:text-4xl font-black tracking-tighter ${totalPnL >= 0 ? 'text-black dark:text-white' : 'text-red-500'}`}>
                {totalPnL >= 0 ? '+' : ''}{formatSats(totalPnL)} <span className="text-base text-zinc-500 font-normal">SAT</span>
              </div>
            </div>
            <div className="p-8">
              <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mb-2">Asset Count</div>
              <div className="text-3xl md:text-4xl font-black tracking-tighter">{DEMO_HOLDINGS.length}</div>
            </div>
          </div>
        </section>

        {/* Holdings Table */}
        <section>
          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 border-b border-zinc-200 dark:border-zinc-900 pb-2">
            Asset Inventory
          </div>
          <div className="border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="py-4 px-6 text-[9px] uppercase tracking-widest font-bold text-zinc-500">Token ID</th>
                  <th className="py-4 px-6 text-[9px] uppercase tracking-widest font-bold text-zinc-500 text-right">Balance</th>
                  <th className="py-4 px-6 text-[9px] uppercase tracking-widest font-bold text-zinc-500 text-right">Cost Basis</th>
                  <th className="py-4 px-6 text-[9px] uppercase tracking-widest font-bold text-zinc-500 text-right">Revenue</th>
                  <th className="py-4 px-6 text-[9px] uppercase tracking-widest font-bold text-zinc-500 text-right">P&L</th>
                  <th className="py-4 px-6 text-[9px] uppercase tracking-widest font-bold text-zinc-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {DEMO_HOLDINGS.map((holding) => (
                  <tr key={holding.token_id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-sm tracking-tight">{holding.name}</div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{holding.token_id}</div>
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-sm">{holding.balance.toLocaleString()}</td>
                    <td className="py-4 px-6 text-right font-mono text-sm text-zinc-500">{formatSats(holding.total_spent_sats)}</td>
                    <td className="py-4 px-6 text-right font-mono text-sm text-zinc-500">{formatSats(holding.total_revenue_sats)}</td>
                    <td className={`py-4 px-6 text-right font-mono text-sm font-bold ${holding.pnl_sats >= 0 ? 'text-black dark:text-white' : 'text-red-500'}`}>
                      {holding.pnl_sats >= 0 ? '+' : ''}{formatSats(holding.pnl_sats)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link href="/download" className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                        MANAGE
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
