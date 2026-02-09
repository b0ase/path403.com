import React from 'react';
import { FaEthereum } from 'react-icons/fa';

const EthereumCard = () => {
  return (
    <div className="bg-black border border-gray-700 rounded-lg shadow-xl p-6 flex flex-col items-center">
      <div className="text-5xl mb-4 text-gray-400">
        <FaEthereum />
      </div>
      <h3 className="text-xl font-semibold mb-2">Ethereum</h3>
      <span className="bg-yellow-500 text-yellow-900 text-xs font-semibold px-3 py-1 rounded-full mb-3">Planned</span>
      <p className="text-gray-400 text-sm text-center mb-4">
        Deployment on the Ethereum network is planned to tap into its vast DeFi ecosystem and user base.
      </p>
      {/* You can add a button or link here later if needed */}
    </div>
  );
};

export default EthereumCard; 