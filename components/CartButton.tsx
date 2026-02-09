'use client';

import React, { useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from './SimpleCartProvider';
import ShoppingCart from './ShoppingCart';

interface CartButtonProps {
  className?: string;
}

export default function CartButton({ className = '' }: CartButtonProps) {
  const { itemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsCartOpen(true)}
        className={`relative inline-flex items-center p-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-600 transition-colors ${className}`}
        title="Shopping Cart"
      >
        <FaShoppingCart className="text-cyan-400" size={20} />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold animate-pulse">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </button>

      <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
} 