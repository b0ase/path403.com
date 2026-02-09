'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from './WalletProvider';

export function Sticky402Button() {
  const pathname = usePathname();
  const { wallet } = useWallet();

  // Hide when connected (user is already on the client) or on download page
  if (wallet.connected || pathname === '/download') {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link
        href="/download"
        className="w-20 h-20 rounded-full text-black transition-all duration-300 hover:scale-110 active:scale-95 flex flex-col items-center justify-center relative"
        style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f0f0f0 50%, #d4d4d4 100%)',
          boxShadow: `
            0 10px 40px -10px rgba(0, 0, 0, 0.5),
            0 8px 20px -10px rgba(0, 0, 0, 0.3),
            inset 0 -4px 12px rgba(0, 0, 0, 0.12),
            inset 0 4px 12px rgba(255, 255, 255, 0.9)
          `,
        }}
        title="Download the $402 Client"
      >
        {/* Inner highlight */}
        <span
          className="absolute inset-2 rounded-full pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 50%)',
          }}
        />

        {/* Content */}
        <span className="relative z-10 flex flex-col items-center">
          <span className="text-lg font-bold">$402</span>
          <span className="text-[8px] text-gray-500 uppercase tracking-wider">
            Download
          </span>
        </span>
      </Link>
    </div>
  );
}
