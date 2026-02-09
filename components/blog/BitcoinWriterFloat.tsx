'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import BitcoinWriterButton from '@/components/BitcoinWriterButton';

export default function BitcoinWriterFloat() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const floatButton = (
    <motion.div
      style={{
        position: 'fixed',
        bottom: '40px',
        right: '48px',
        zIndex: 9999,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.3 }}
    >
      <BitcoinWriterButton size={90} showGlow />
    </motion.div>
  );

  // Use portal to render outside ContentCard's backdrop-blur container
  if (!mounted) return null;
  return createPortal(floatButton, document.body);
}
