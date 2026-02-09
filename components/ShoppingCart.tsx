'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from './SimpleCartProvider';
import { 
  FaShoppingCart, 
  FaTimes, 
  FaPlus, 
  FaMinus, 
  FaTrash, 
  FaCreditCard,
  FaBitcoin,
  FaPaypal
} from 'react-icons/fa';

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShoppingCart({ isOpen, onClose }: ShoppingCartProps) {
  const { items, total, itemCount, loading, updateCartItem, removeFromCart, clearCart } = useCart();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      await updateCartItem(itemId, { quantity: newQuantity });
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    onClose();
    router.push('/checkout');
  };

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'service': return 'Service';
      case 'module': return 'Module';
      case 'template': return 'Template';
      default: return 'Item';
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Cart Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-96 bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center">
              <FaShoppingCart className="text-cyan-400 mr-2" />
              <h2 className="text-xl font-semibold text-white">
                Shopping Cart ({itemCount})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-8">
                <FaShoppingCart className="text-6xl text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-4">Your cart is empty</p>
                <p className="text-gray-500 text-sm mb-6">
                  Add some modules or services to get started building your crypto project!
                </p>
                <Link
                  href="/modules"
                  onClick={onClose}
                  className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Browse Modules
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-black border border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span className="text-xs bg-cyan-600 text-white px-2 py-1 rounded">
                            {getItemTypeLabel(item.item_type)}
                          </span>
                        </div>
                        <h3 className="text-white font-medium text-sm mb-1">{item.item_name}</h3>
                        {item.item_description && (
                          <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                            {item.item_description}
                          </p>
                        )}
                        <div className="text-cyan-400 font-semibold">
                          ${item.price} {item.currency}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id!)}
                        className="text-red-400 hover:text-red-300 ml-2"
                        title="Remove item"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-gray-800 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(item.id!, item.quantity - 1)}
                          className="p-2 text-gray-400 hover:text-white transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <FaMinus size={12} />
                        </button>
                        <span className="px-3 py-2 text-white font-medium min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id!, item.quantity + 1)}
                          className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                          <FaPlus size={12} />
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Custom Options */}
                    {item.custom_options && Object.keys(item.custom_options).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <p className="text-xs text-gray-400 mb-2">Custom Options:</p>
                        <div className="space-y-1">
                          {Object.entries(item.custom_options).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-xs">
                              <span className="text-gray-400">{key}:</span>
                              <span className="text-gray-300">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-700 p-4 space-y-4">
              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-white">Total:</span>
                <span className="text-xl font-bold text-cyan-400">${total.toFixed(2)} USD</span>
              </div>

              {/* Payment Methods */}
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-3">We accept:</p>
                <div className="flex justify-center space-x-4 mb-4">
                  <FaCreditCard className="text-2xl text-gray-400" title="Credit Card" />
                  <FaBitcoin className="text-2xl text-orange-400" title="Bitcoin" />
                  <FaPaypal className="text-2xl text-blue-400" title="PayPal" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCheckingOut ? 'Redirecting...' : 'Proceed to Checkout'}
                </button>
                
                <div className="flex space-x-2">
                  <button
                    onClick={onClose}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={clearCart}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  🔒 Secure checkout • 💰 Crypto payments accepted • ⚡ Instant delivery
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 