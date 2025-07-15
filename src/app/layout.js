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

export const metadata = {
  title: "Ecom | Modern E-commerce Platform",
  description:
    "Ecom is a powerful e-commerce website built with Next.js, Prisma, and PostgreSQL — optimized for speed, security, and scalability.",
  openGraph: {
    title: "Ecom | Modern E-commerce Platform",
    description:
      "Ecom is a powerful e-commerce website built with Next.js, Prisma, and PostgreSQL — optimized for speed, security, and scalability.",
    url: "https://ecom-skheni.vercel.app",
    siteName: "Ecom",
    images: [
      {
        url: "https://res.cloudinary.com/db52gpmt7/image/upload/v1752600203/logo-white_idfbvv.png",
        width: 1200,
        height: 630,
        alt: "Ecom Platform Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ecom | Modern E-commerce Platform",
    description:
      "A fast, secure, and scalable e-commerce platform built with Next.js, Prisma, and PostgreSQL.",
    images: [
      "https://res.cloudinary.com/db52gpmt7/image/upload/v1752600203/logo-white_idfbvv.png",
    ],
    creator: "@shwetkheni",
  },
};


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
