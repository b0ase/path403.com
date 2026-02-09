import React from 'react';
import { SiBitcoinsv } from 'react-icons/si';

const BitcoinSvCard = () => {
  return (
    <div className="bg-black border border-gray-700 rounded-lg shadow-xl p-6 flex flex-col items-center">
      <div className="text-5xl mb-4 text-blue-400">
        <SiBitcoinsv />
      </div>
      <h3 className="text-xl font-semibold mb-2">Bitcoin SV (BSV21)</h3>
      <span className="bg-green-500 text-green-900 text-xs font-semibold px-3 py-1 rounded-full mb-3">Live</span>
      <p className="text-gray-400 text-sm text-center mb-4">
        Currently active and tradable as a BSV21 standard token.
      </p>
      <a 
        href="#" // Replace with actual 1Sat Market link
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-auto w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
      >
        Trade on 1Sat Market
      </a>
    </div>
  );
};

export default BitcoinSvCard; 