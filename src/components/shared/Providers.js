'use client';

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from '@/context/ToastContext';
import { CartProvider } from '@/context/CartContext';
import { ShopProvider } from '@/context/ShopContext';

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <CartProvider>
          <ShopProvider>
            {children}
          </ShopProvider>
        </CartProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
