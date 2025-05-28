'use client'

import { Open_Sans, Roboto_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ShopProvider } from '@/context/ShopContext';
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
      <body className="antialiased">
        <SessionProvider>
          <ShopProvider>
            {children}
          </ShopProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
