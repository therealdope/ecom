'use client'

import { Open_Sans, Roboto_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ShopProvider } from '@/context/ShopContext';
import { CartProvider } from '@/context/CartContext';
import Script from 'next/script';
import "@styles/globals.css";
import { ToastProvider } from '@/context/ToastContext';

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
        <title>Ecom | Modern E-commerce Platform</title>
        <meta name="description" content="Ecom is a powerful e-commerce website built with Next.js, Prisma, and PostgreSQL — optimized for speed, security, and scalability." />

        {/* Open Graph */}
        <meta property="og:title" content="Ecom | Modern E-commerce Platform" />
        <meta property="og:description" content="Ecom is a powerful e-commerce website built with Next.js, Prisma, and PostgreSQL — optimized for speed, security, and scalability." />
        <meta property="og:image" content="https://res.cloudinary.com/db52gpmt7/image/upload/v1752600203/logo-white_idfbvv.png" />
        <meta property="og:url" content="https://ecom-skheni.vercel.app" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Ecom" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ecom | Modern E-commerce Platform" />
        <meta name="twitter:description" content="A fast, secure, and scalable e-commerce platform built with Next.js, Prisma, and PostgreSQL." />
        <meta name="twitter:image" content="https://res.cloudinary.com/db52gpmt7/image/upload/v1752600203/logo-white_idfbvv.png" />
        <meta name="twitter:creator" content="@shwetkheni" />
        {/* Swiper CSS */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"
        />
      </head>
      <body className="antialiased">
        <SessionProvider>
          <ToastProvider>
          <CartProvider>
          <ShopProvider>
            {children}
          </ShopProvider>
          </CartProvider>
          </ToastProvider>
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
