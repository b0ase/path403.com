'use client';

import React, { useState } from 'react';
import { FaShoppingCart, FaPlus, FaCheck, FaSignInAlt } from 'react-icons/fa';
import { useCart, CartItem } from './SimpleCartProvider';
import { useAuth } from './Providers';
import { useRouter } from 'next/navigation';

interface AddToCartButtonProps {
  item: Omit<CartItem, 'id'>;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  customOptions?: Record<string, any>;
}

export default function AddToCartButton({
  item,
  className = '',
  variant = 'primary',
  size = 'md',
  showIcon = true,
  customOptions = {}
}: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const { session } = useAuth();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    // If user is not authenticated, redirect to login
    if (!session) {
      const currentPath = window.location.pathname;
      router.push(`/login?redirectedFrom=${encodeURIComponent(currentPath)}`);
      return;
    }

    setIsAdding(true);
    
    try {
      addToCart({
        ...item,
        custom_options: { ...item.custom_options, ...customOptions }
      });
      
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      // You could add a toast notification here
    } finally {
      setIsAdding(false);
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-white text-black hover:bg-zinc-200 border-white';
      case 'secondary':
        return 'bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-700';
      case 'outline':
        return 'bg-transparent hover:bg-white text-white hover:text-black border-zinc-700 hover:border-white';
      default:
        return 'bg-white text-black hover:bg-zinc-200 border-white';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2 text-base';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  const textColor = variant === 'primary' || variant === undefined ? '#000' : undefined;

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding || isAdded}
      style={{ color: textColor }}
      className={`
        inline-flex items-center justify-center
        font-bold border uppercase tracking-wider
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${className}
      `}
    >
      {isAdding ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          Adding...
        </>
      ) : isAdded ? (
        <>
          <FaCheck className={`${showIcon ? 'mr-2' : ''}`} />
          Added!
        </>
      ) : !session ? (
        <>
          {showIcon && <FaSignInAlt className="mr-2" />}
          Login to Add
        </>
      ) : (
        <>
          {showIcon && <FaShoppingCart className="mr-2" />}
          Add to Cart
        </>
      )}
    </button>
  );
} 