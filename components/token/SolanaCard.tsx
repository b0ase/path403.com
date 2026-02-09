import React from 'react';
import { SiSolana } from 'react-icons/si';

const SolanaCard = () => {
  return (
    <div className="bg-black border border-gray-700 rounded-lg shadow-xl p-6 flex flex-col items-center">
      <div className="text-5xl mb-4 text-purple-400">
        <SiSolana />
      </div>
      <h3 className="text-xl font-semibold mb-2">Solana</h3>
      <span className="bg-yellow-500 text-yellow-900 text-xs font-semibold px-3 py-1 rounded-full mb-3">Planned</span>
      <p className="text-gray-400 text-sm text-center mb-4">
        Integration with the Solana network is in development to leverage its high throughput and low transaction fees.
      </p>
      {/* You can add a button or link here later if needed */}
    </div>
  );
};

export default SolanaCard; 