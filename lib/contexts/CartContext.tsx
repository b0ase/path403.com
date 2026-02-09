'use client';

import React, { createContext, useContext, useEffect, useReducer, ReactNode, useState, useCallback } from 'react';
import getSupabaseBrowserClient from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export interface CartItem {
  id?: string;
  item_type: 'service' | 'module' | 'template';
  item_id: string;
  item_name: string;
  item_description?: string;
  price: number;
  currency: string;
  quantity: number;
  custom_options?: Record<string, any>;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: { id: string; updates: Partial<CartItem> } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
  loading: false,
  total: 0,
  itemCount: 0,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ITEMS':
      const total = action.payload.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = action.payload.reduce((sum, item) => sum + item.quantity, 0);
      return { 
        ...state, 
        items: action.payload, 
        total: Math.round(total * 100) / 100,
        itemCount 
      };
    
    case 'ADD_ITEM':
      const existingItemIndex = state.items.findIndex(
        item => item.item_id === action.payload.item_id && item.item_type === action.payload.item_type
      );
      
      let newItems;
      if (existingItemIndex >= 0) {
        newItems = [...state.items];
        newItems[existingItemIndex].quantity += action.payload.quantity;
      } else {
        newItems = [...state.items, action.payload];
      }
      
      const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return { 
        ...state, 
        items: newItems, 
        total: Math.round(newTotal * 100) / 100,
        itemCount: newItemCount 
      };
    
    case 'UPDATE_ITEM':
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id ? { ...item, ...action.payload.updates } : item
      );
      const updatedTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const updatedItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return { 
        ...state, 
        items: updatedItems, 
        total: Math.round(updatedTotal * 100) / 100,
        itemCount: updatedItemCount 
      };
    
    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      const filteredTotal = filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const filteredItemCount = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return { 
        ...state, 
        items: filteredItems, 
        total: Math.round(filteredTotal * 100) / 100,
        itemCount: filteredItemCount 
      };
    
    case 'CLEAR_CART':
      return { ...state, items: [], total: 0, itemCount: 0 };
    
    default:
      return state;
  }
}

interface CartContextType extends CartState {
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  updateCartItem: (id: string, updates: Partial<CartItem>) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [user, setUser] = useState<User | null>(null);
  const supabase = getSupabaseBrowserClient();

  // Get user on mount and listen for auth changes
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const refreshCart = useCallback(async () => {
    if (!user) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      dispatch({ type: 'SET_ITEMS', payload: data || [] });
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user, supabase]);

  // Load cart items on user change
  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [user, refreshCart]);

  const addToCart = async (item: Omit<CartItem, 'id'>) => {
    if (!user) {
      throw new Error('User must be logged in to add items to cart');
    }

    try {
      // Check if item already exists in cart
      const { data: existingItems, error: fetchError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('item_id', item.item_id)
        .eq('item_type', item.item_type);

      if (fetchError) throw fetchError;

      if (existingItems && existingItems.length > 0) {
        // Update existing item quantity
        const existingItem = existingItems[0];
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ 
            quantity: existingItem.quantity + item.quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id);

        if (updateError) throw updateError;
      } else {
        // Insert new item
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            ...item
          });

        if (insertError) throw insertError;
      }

      // Refresh cart to get updated data
      await refreshCart();
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  };

  const updateCartItem = async (id: string, updates: Partial<CartItem>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      dispatch({ type: 'UPDATE_ITEM', payload: { id, updates } });
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  };

  const removeFromCart = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      dispatch({ type: 'REMOVE_ITEM', payload: id });
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const value: CartContextType = {
    ...state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 