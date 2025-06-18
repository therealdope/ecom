'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import MobileBottomNav from './MobileBottomNav';
import {
  MagnifyingGlassIcon,
  HeartIcon,
  ShoppingCartIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  BellIcon,
  EnvelopeIcon,
  UserIcon,
  CreditCardIcon,
  CubeIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { useCart } from '@/context/CartContext';

export default function UserDashboardLayout({ children }) {
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const profileRef = useRef(null);
  const { cartItems, wishlistItems } = useCart();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className="hidden md:block">
        {/* Top Header */}
        <header className="bg-white shadow-md shadow-indigo-50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                  {/* Left: Logo or Brand */}
                  <div>
                    <Link href="/user/dashboard">
                        <Image
                          src="/logo.png"
                          alt="Your Brand"
                          width={100}
                          height={50}
                          className="h-10 w-auto"
                          priority
                        />
                    </Link>
                  </div>

                  {/* Middle: Search bar */}
                  <div className="flex-1 mx-4 max-w-md md:flex">
                    <div className="relative w-full">
                      <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full border border-gray-300 rounded-lg py-2 pl-5 pr-10 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 hover:text-indigo-500 absolute top-2.5 right-4" />
                    </div>
                  </div>

                  {/* Right: Icons and profile */}
                  <div className="flex items-center gap-5">
                    {/* Profile dropdown */}
                    <div className="relative" ref={profileRef}>
                      <button
                        type="button"
                        onClick={() => setProfileMenuOpen((prev) => !prev)}
                        className="flex items-center text-gray-600 hover:text-indigo-600 focus:outline-none"
                        aria-haspopup="true"
                        aria-expanded={isProfileMenuOpen}
                        aria-label="User menu"
                      >
                        {imageError ? (
                          <UserIcon className="h-7 w-7 text-gray-600 hover:text-indigo-600" />
                        ) : (
                          <Image
                            src="/avatar.png"
                            alt="User Avatar"
                            width={36}
                            height={36}
                            className="rounded-full object-cover border"
                            onError={() => setImageError(true)}
                          />
                        )}
                      </button>

                      {isProfileMenuOpen && (
                        <div
                          className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50 py-2"
                          role="menu"
                          aria-orientation="vertical"
                          aria-labelledby="user-menu"
                        >
                          <Link href="/profile">
                            <button
                              className="flex w-full items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm"
                              role="menuitem"
                              onClick={() => setProfileMenuOpen(false)}
                            >
                              <UserIcon className="h-4 w-4" /> Profile
                            </button>
                          </Link>
                          <Link href="/messages">
                            <button
                              className="flex w-full items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm"
                              role="menuitem"
                              onClick={() => setProfileMenuOpen(false)}
                            >
                              <EnvelopeIcon className="h-4 w-4" /> Messages
                            </button>
                          </Link>
                          <Link href="/notifications">
                            <button
                              className="flex w-full items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm"
                              role="menuitem"
                              onClick={() => setProfileMenuOpen(false)}
                            >
                              <BellIcon className="h-4 w-4" /> Notifications
                            </button>
                          </Link>
                          <Link href="/settings">
                            <button
                              className="flex w-full items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm"
                              role="menuitem"
                              onClick={() => setProfileMenuOpen(false)}
                            >
                              <Cog6ToothIcon className="h-4 w-4" /> Settings
                            </button>
                          </Link>
                          <hr className="my-1" />
                          <Link href="/orders">
                            <button
                              className="flex w-full items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm"
                              role="menuitem"
                              onClick={() => setProfileMenuOpen(false)}
                            >
                              <CubeIcon className="h-4 w-4" /> Orders
                            </button>
                          </Link>
                          <Link href="/payments">
                            <button
                              className="flex w-full items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm"
                              role="menuitem"
                              onClick={() => setProfileMenuOpen(false)}
                            >
                              <CreditCardIcon className="h-4 w-4" /> Payments
                            </button>
                          </Link>
                          <hr className="my-1" />
                          <button
                            type="button"
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 text-sm w-full text-left"
                            role="menuitem"
                          >
                            <ArrowRightOnRectangleIcon className="h-4 w-4" /> Logout
                          </button>
                        </div>
                      )}
                    </div>
                    {/* Icons */}
                    <Link href="/user/wishlist">
                    <button
                      type="button"
                      aria-label="Wishlist"
                      className="relative text-gray-600 hover:text-indigo-600"
                    >
                      <HeartIcon className="h-7 w-7" />
                      {wishlistItems.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {wishlistItems.length}
                        </span>
                      )}
                    </button>
                    </Link>
                    <Link href="/user/cart">
                    <button
                      type="button"   
                      aria-label="Shopping Cart"
                      className="relative text-gray-600 hover:text-indigo-600"
                    >
                      <ShoppingBagIcon className="h-7 w-7" />
                      {cartItems.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {cartItems.length}
                        </span>
                      )}
                    </button>
                    </Link>

                  </div>
                </div>
        </header>
      </div>

      <div className="sm:block md:hidden">
        {/*bottom header for small screens*/}
        <div className='flex justify-center p-4'>
          <Link href="/user/dashboard">
              <Image
                src="/logo.png"
                alt="Your Brand"
                width={100}
                height={50}
                className="h-12 w-full"
                priority
              />
          </Link>
        </div>
        <div className="flex-1 mx-auto max-w-[90vw]">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full border border-gray-300 rounded-lg py-2 pl-5 pr-10 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 hover:text-indigo-500 absolute top-2.5 right-4" />
          </div>
        </div>
        <MobileBottomNav />
        <hr className='mt-6 text-gray-300'/>
      </div>
      
      
      {/* Main content */}
      <main className="p-4 max-w-7xl mx-auto">{children}</main>
    </div>
  );
}
