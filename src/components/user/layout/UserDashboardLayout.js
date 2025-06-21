'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import MobileBottomNav from './MobileBottomNav';
import { useRouter } from 'next/navigation';
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
  XMarkIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';
import { useCart } from '@/context/CartContext';

export default function UserDashboardLayout({ children }) {
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const { cartItems, wishlistItems } = useCart();
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/user/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

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
            <div className="flex-1 mx-4 max-w-md md:flex" ref={searchRef}>
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full border border-gray-300 rounded-lg py-2 pl-5 pr-10 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  onClick={() => setIsSearchOpen(true)}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 hover:text-indigo-500 absolute top-2.5 right-4" />

                {/* Search Overlay */}
                {isSearchOpen && (
                  <div className="absolute top-full left-0 right-0 bg-white mt-2 rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
                    {isLoading ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {searchResults.map((result) => (
                          <div
                            key={result.id}
                            className="p-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              router.push(`/user/product/${result.id}`);
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                          >
                            <div className="flex items-center gap-4">
                              <div className="relative w-12 h-12">
                                <Image
                                  src={result.imageUrl}
                                  alt={result.name}
                                  fill
                                  className="object-cover rounded"
                                />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{result.name}</h4>
                                <p className="text-sm text-gray-500">{result.category.name}</p>
                                <p className="text-sm text-gray-500">{result.shop.name}</p>
                              </div>
                              <div className="ml-auto">
                                <p className="font-medium text-indigo-600">
                                  ${result.variants[0]?.price}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : searchQuery.trim() !== '' && (
                      <div className="p-4 text-center text-gray-500">
                        No results found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Rest of the header content */}
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
                    <Link href="/user/profile">
                      <button
                        className="flex w-full items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm"
                        role="menuitem"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <UserIcon className="h-4 w-4" /> Profile
                      </button>
                    </Link>
                    <Link href="/user/messages">
                      <button
                        className="flex w-full items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm"
                        role="menuitem"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <EnvelopeIcon className="h-4 w-4" /> Messages
                      </button>
                    </Link>
                    <Link href="/user/notifications">
                      <button
                        className="flex w-full items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm"
                        role="menuitem"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <BellIcon className="h-4 w-4" /> Notifications
                      </button>
                    </Link>
                    <Link href="/user/vendors">
                      <button
                        className="flex w-full items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm"
                        role="menuitem"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <BuildingStorefrontIcon className="h-4 w-4" /> Vendors
                      </button>
                    </Link>
                    <Link href="/user/settings">
                      <button
                        className="flex w-full items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm"
                        role="menuitem"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <Cog6ToothIcon className="h-4 w-4" /> Settings
                      </button>
                    </Link>
                    <hr className="my-1" />
                    <Link href="/user/orders">
                      <button
                        className="flex w-full items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm"
                        role="menuitem"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <CubeIcon className="h-4 w-4" /> Orders
                      </button>
                    </Link>
                    <Link href="/user/payments">
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
        <div className="flex-1 mx-auto max-w-[90vw] mb-4" ref={searchRef}>
          <div className="relative w-full">
            <div className="flex items-center bg-white rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
              <input
                type="text"
                placeholder="Search products..."
                className="flex-1 py-2.5 pl-4 pr-10 outline-none rounded-lg"
                onClick={() => setIsSearchOpen(true)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                className="p-2.5 text-gray-500 hover:text-indigo-600"
                onClick={() => {
                  if (searchQuery) {
                    setSearchQuery('');
                  } else {
                    setIsSearchOpen(true);
                  }
                }}
              >
                {searchQuery ? (
                  <XMarkIcon className="h-5 w-5" />
                ) : (
                  <MagnifyingGlassIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            
            {/* Search Results Overlay */}
            {isSearchOpen && (
              <div className="fixed inset-0 bg-white z-50">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="p-1 -ml-1 hover:bg-gray-100 rounded-full"
                  >
                    <XMarkIcon className="h-6 w-6 text-gray-500" />
                  </button>
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="flex-1 outline-none text-base"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
            
                <div className="overflow-y-auto h-[calc(100vh-60px)]">
                  {isLoading ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {searchResults.map((result) => (
                        <div
                          key={result.id}
                          className="p-4 active:bg-gray-50"
                          onClick={() => {
                            router.push(`/user/product/${result.id}`);
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 flex-shrink-0">
                              <Image
                                src={result.imageUrl}
                                alt={result.name}
                                fill
                                className="object-cover rounded-lg"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">{result.name}</h4>
                              <p className="text-sm text-gray-500 mt-0.5">{result.category.name}</p>
                              <p className="text-sm text-gray-500">{result.shop.name}</p>
                            </div>
                            <div className="flex-shrink-0">
                              <p className="font-medium text-indigo-600">
                                ${result.variants[0]?.price}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery.trim() !== '' && (
                    <div className="p-8 text-center text-gray-500">
                      <p className="text-lg">No results found</p>
                      <p className="text-sm mt-1">Try searching with different keywords</p>
                    </div>
                  )}
                </div>
              </div>
            )}
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
