'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import BWriterPurchaseModal from './BWriterPurchaseModal';

const BWRITER_IMAGE = '/images/clientprojects/bitcoin-writer/bitcoin-writer-button.png';

interface BitcoinWriterButtonProps {
  size?: number;
  showGlow?: boolean;
  className?: string;
  initialAmount?: number;
  totalValuation?: number;
  totalRaised?: number;
}

export default function BitcoinWriterButton({
  size = 90,
  showGlow = true,
  className = '',
  initialAmount = 100,
  totalValuation = 10000000,
  totalRaised = 1000,
}: BitcoinWriterButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* Button */}
      <motion.div
        className={`cursor-pointer inline-block ${className}`}
        style={{
          width: size,
          height: size,
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowModal(true)}
      >
        <div
          className="w-full h-full rounded-full flex items-center justify-center relative overflow-hidden"
          style={showGlow ? {
            boxShadow: '0 0 20px rgba(247, 147, 26, 0.5), 0 0 40px rgba(247, 147, 26, 0.3)',
          } : undefined}
        >
          <Image
            src={BWRITER_IMAGE}
            alt="$bWriter Token"
            fill
            className="object-cover rounded-full"
          />
        </div>
      </motion.div>

      {/* Unified Purchase Modal */}
      <BWriterPurchaseModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        initialAmount={initialAmount}
        tokenTicker="$bWriter"
        totalValuation={totalValuation}
        totalRaised={totalRaised}
      />
    </>
  );
}
