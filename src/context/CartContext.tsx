import React, { createContext, useContext } from 'react';

// Mock Cart Context to prevent breakage
const CartContext = createContext<any>(null);
export const CartProvider = ({ children }: { children: React.ReactNode }) => (
  <CartContext.Provider value={{ items: [], addItem: () => {}, removeItem: () => {}, clearCart: () => {}, total: 0 }}>
    {children}
  </CartContext.Provider>
);
export const useCart = () => useContext(CartContext) || { items: [], addItem: () => {} };
export type CartItem = any;
