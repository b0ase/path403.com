'use client';

import React, { useState, useEffect } from 'react';
import { FaWallet, FaPlus, FaMinus } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface WalletPanelProps {
  isDark: boolean;
}

export const WalletPanel: React.FC<WalletPanelProps> = ({ isDark }) => {
  const [balanceSats, setBalanceSats] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState('5');

  const fetchBalance = async () => {
    try {
      const res = await fetch('/api/wallet/balance');
      const data = await res.json();
      if (data.balanceSats) setBalanceSats(data.balanceSats);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const handleDeposit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(depositAmount), currency: 'USD' })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setBalanceSats(data.balance);
      setShowDeposit(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exchangeRate = 0.000045; // Approx BSV price placeholder
  const balanceUSD = (Number(balanceSats) / 100_000_000 * 50).toFixed(2); // Example rate 50 USD/BSV

  return (
    <div className={`${isDark ? 'bg-black border-white/10' : 'bg-gray-50 border-gray-200'} border rounded-xl p-4 mb-4`}>
       <div className="flex items-center justify-between mb-4">
         <h3 className="font-bold flex items-center gap-2">
           <FaWallet className="text-yellow-500" />
           My Clearing Balance
         </h3>
         <button onClick={fetchBalance} className="text-xs hover:text-yellow-500">Refresh</button>
       </div>

       <div className="mb-6">
         <div className="text-3xl font-mono font-bold">{parseInt(balanceSats).toLocaleString()} <span className="text-sm text-gray-500">SATS</span></div>
         <div className="text-sm text-gray-500">≈ ${balanceUSD} USD</div>
       </div>

       <div className="flex gap-2">
         <button 
            onClick={() => setShowDeposit(!showDeposit)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm"
         >
           <FaPlus /> Deposit
         </button>
         <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm">
           <FaMinus /> Withdraw
         </button>
       </div>

       <AnimatePresence>
         {showDeposit && (
           <motion.div 
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: 'auto', opacity: 1 }}
             exit={{ height: 0, opacity: 0 }}
             className="mt-4 pt-4 border-t border-white/10 overflow-hidden"
           >
             <label className="text-xs text-gray-400 mb-1 block">Quick Deposit (USD)</label>
             <div className="flex gap-2">
               {[1, 5, 10, 20].map(amt => (
                 <button 
                   key={amt}
                   onClick={() => setDepositAmount(amt.toString())}
                   className={`flex-1 py-1 rounded border text-xs ${depositAmount === amt.toString() ? 'border-yellow-500 text-yellow-500' : 'border-white/10 text-gray-400'}`}
                 >
                   ${amt}
                 </button>
               ))}
             </div>
             <button 
                onClick={handleDeposit}
                disabled={loading}
                className="w-full mt-3 bg-white text-black font-bold py-2 rounded hover:bg-gray-200 disabled:opacity-50"
             >
               {loading ? 'Processing...' : `Pay $${depositAmount} with HandCash`}
             </button>
             {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
           </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
};
