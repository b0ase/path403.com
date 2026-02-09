'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaWallet, FaCheck, FaTimes, FaDownload } from 'react-icons/fa';

interface WalletStatus {
  phantom: boolean;
  metamask: boolean;
  handcash: boolean;
}

export default function WalletDetection() {
  const [walletStatus, setWalletStatus] = useState<WalletStatus>({
    phantom: false,
    metamask: false,
    handcash: false
  });

  useEffect(() => {
    // Check wallet availability
    setWalletStatus({
      phantom: !!window.solana?.isPhantom,
      metamask: !!window.ethereum?.isMetaMask,
      handcash: !!window.handcash
    });
  }, []);

  const wallets = [
    {
      name: 'Phantom',
      description: 'Solana Wallet',
      available: walletStatus.phantom,
      installUrl: 'https://phantom.app/',
      color: 'purple'
    },
    {
      name: 'MetaMask',
      description: 'Ethereum Wallet',
      available: walletStatus.metamask,
      installUrl: 'https://metamask.io/',
      color: 'orange'
    },
    {
      name: 'HandCash',
      description: 'Bitcoin SV Wallet',
      available: walletStatus.handcash,
      installUrl: 'https://handcash.io/',
      color: 'green'
    }
  ];

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <FaWallet className="mr-2" />
        Available Wallets
      </h3>
      
      <div className="space-y-3">
        {wallets.map((wallet) => (
          <motion.div
            key={wallet.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              wallet.available 
                ? `border-${wallet.color}-500 bg-${wallet.color}-900/20` 
                : 'border-gray-600 bg-gray-800'
            }`}
          >
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                wallet.available ? `bg-${wallet.color}-500` : 'bg-gray-500'
              }`} />
              <div>
                <div className="font-medium text-white">{wallet.name}</div>
                <div className="text-sm text-gray-400">{wallet.description}</div>
              </div>
            </div>
            
            <div className="flex items-center">
              {wallet.available ? (
                <div className="flex items-center text-green-400">
                  <FaCheck className="mr-1" />
                  <span className="text-sm">Available</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="flex items-center text-gray-400 mr-2">
                    <FaTimes className="mr-1" />
                    <span className="text-sm">Not installed</span>
                  </div>
                  <a
                    href={wallet.installUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-400 hover:text-blue-300 text-sm"
                  >
                    <FaDownload className="mr-1" />
                    Install
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500 rounded-lg">
        <p className="text-sm text-blue-200">
          <strong>Tip:</strong> Install the wallets you want to use for seamless authentication and asset management.
        </p>
      </div>
    </div>
  );
} 