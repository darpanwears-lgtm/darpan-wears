'use client';

import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import type { CartItem, Product } from './types';

type CartState = {
  items: CartItem[];
};

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product, size: string } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_STATE'; payload: CartState };

interface CartContextType {
  state: CartState;
  addItem: (product: Product, size: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, size } = action.payload;
      const cartId = product.id + (size ? `-${size}`: '');
      const existingItem = state.items.find(item => item.id === cartId);

      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === cartId ? { ...item, quantity: item.quantity + 1 } : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...product, id: cartId, quantity: 1, size: size }],
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload.id),
        };
      }
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        ),
      };
    }
    case 'CLEAR_CART':
      return { items: [] };
    case 'SET_STATE':
        return action.payload;
    default:
      return state;
  }
};

const initializer = (initialValue: CartState = { items: [] }) => {
    if (typeof window !== 'undefined') {
        try {
            const storedCart = localStorage.getItem('cart');
            if (storedCart) {
                return JSON.parse(storedCart);
            }
        } catch (error) {
            console.error("Failed to parse cart from localStorage", error);
        }
    }
    return initialValue;
};


export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] }, initializer);

  useEffect(() => {
    try {
        localStorage.setItem('cart', JSON.stringify(state));
    } catch (error) {
        console.error("Failed to save cart to localStorage", error);
    }
  }, [state]);

  const addItem = (product: Product, size: string) => dispatch({ type: 'ADD_ITEM', payload: { product, size } });
  const removeItem = (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const updateQuantity = (id: string, quantity: number) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + item.price * item.quantity, 0);
  };
  
  const getCartItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  }

  return (
    <CartContext.Provider value={{ state, addItem, removeItem, updateQuantity, clearCart, getCartTotal, getCartItemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
