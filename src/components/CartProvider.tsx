// E:\guide-digitali\src\components\CartProvider.tsx
// Context provider per il carrello guide

'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { GuideProduct, CartItem } from '@/lib/guide-types';

interface CartContextType {
  items: CartItem[];
  coupon: { code: string; discount_percent: number } | null;
  isOpen: boolean;
  addItem: (product: GuideProduct) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  setCoupon: (coupon: { code: string; discount_percent: number } | null) => void;
  toggleCart: () => void;
  setIsOpen: (open: boolean) => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<{ code: string; discount_percent: number } | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((product: GuideProduct) => {
    setItems(prev => {
      if (prev.some(item => item.product.id === product.id)) return prev;
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCoupon(null);
  }, []);

  const toggleCart = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const itemCount = items.length;
  const subtotal = items.reduce((sum, item) => sum + item.product.price, 0);

  return (
    <CartContext.Provider value={{
      items, coupon, isOpen, addItem, removeItem, clearCart,
      setCoupon, toggleCart, setIsOpen, itemCount, subtotal,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart deve essere usato dentro CartProvider');
  return ctx;
}
