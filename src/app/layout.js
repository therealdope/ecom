'use client'

import { Open_Sans, Roboto_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ShopProvider } from '@/context/ShopContext';
import { CartProvider } from '@/context/CartContext';
import Script from 'next/script';
import "@styles/globals.css";

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"]
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${robotoMono.variable} ${openSans.variable}`}>
      <head>
        {/* Swiper CSS */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"
        />
      </head>
      <body className="antialiased">
        <SessionProvider>
          <CartProvider>
          <ShopProvider>
            {children}
          </ShopProvider>
          </CartProvider>
        </SessionProvider>

        {/* Swiper JS */}
        <Script
          src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"
          strategy="afterInteractive"
        />

      </body>
    </html>
  );
}
