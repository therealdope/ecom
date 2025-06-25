'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import MobileBottomNav from './MobileBottomNav';
import RightNav from './RightNav';
import { useRouter } from 'next/navigation';
import UserFooter from './UserFooter';
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
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
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
      if (searchRef.current && !searchRef.current.contains(event.target) && 
          !event.target.closest('.search-result-item')) {
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
    <div className='bg-gray-50 min-h-screen'>
      <div className="hidden md:block">
        {/* Top Header */}
        <header className="bg-white shadow-md shadow-indigo-50 sticky z-50">
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
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-300 mx-auto"></div>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {searchResults.map((result) => (
                          <div
                            key={result.id}
                            className="p-4 hover:bg-gray-50 cursor-pointer search-result-item"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/user/product/${result.id}`);
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
                                <p className="text-sm text-gray-500"><span className='font-medium text-gray-600'>sold by: </span>{result.shop.name}</p>
                              </div>
                              <div className="ml-auto">
                                <p className="font-medium text-indigo-600">
                                  ${result.variants[0]?.price}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="p-4 text-center flex justify-center search-result-item">
                    <button
                      onClick={(e) => {
                          e.stopPropagation();
                          setIsSearchOpen(false)
                          router.push(`/user/product/show-all?searchquery=${searchQuery}`);
                        }}
                      className="bg-indigo-600 text-white block px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                      View All Results
                    </button>
                  </div>
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
                <UserIcon className="h-7 w-7 text-gray-600 hover:text-indigo-600" />
                  
                </button>

                {isProfileMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white border border-gray-300 rounded-lg shadow-lg z-50"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <Link href="/user/profile">
                      <button
                        className="flex w-full items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-sm"
                        role="menuitem"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <UserIcon className="h-4 w-4" /> Profile
                      </button>
                    </Link>
                    <Link href="/user/messages">
                      <button
                        className="flex w-full items-center gap-2 rounded-lg px-4 py-2 hover:bg-gray-100 text-sm"
                        role="menuitem"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <EnvelopeIcon className="h-4 w-4" /> Messages
                      </button>
                    </Link>
                    <Link href="/user/notifications">
                      <button
                        className="flex w-full items-center gap-2 rounded-lg px-4 py-2 hover:bg-gray-100 text-sm"
                        role="menuitem"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <BellIcon className="h-4 w-4" /> Notifications
                      </button>
                    </Link>
                    <Link href="/user/shoppers">
                      <button
                        className="flex w-full items-center gap-2 rounded-lg px-4 py-2 hover:bg-gray-100 text-sm"
                        role="menuitem"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <BuildingStorefrontIcon className="h-4 w-4" /> shoppers
                      </button>
                    </Link>
                    <Link href="/user/settings">
                      <button
                        className="flex w-full items-center gap-2 rounded-lg px-4 py-2 hover:bg-gray-100 text-sm"
                        role="menuitem"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <Cog6ToothIcon className="h-4 w-4" /> Settings
                      </button>
                    </Link>
                    <hr className=" text-gray-300" />
                    <Link href="/user/orders">
                      <button
                        className="flex w-full items-center gap-2 rounded-lg px-4 py-2 hover:bg-gray-100 text-sm"
                        role="menuitem"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <CubeIcon className="h-4 w-4" /> Orders
                      </button>
                    </Link>
                    <Link href="/user/payments">
                      <button
                        className="flex w-full items-center gap-2 rounded-lg px-4 py-2 hover:bg-gray-100 text-sm"
                        role="menuitem"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <CreditCardIcon className="h-4 w-4" /> Payments
                      </button>
                    </Link>
                    <hr className=" text-gray-300" />
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="flex items-center gap-2 rounded-lg px-4 py-2 text-red-600 hover:bg-gray-100 text-sm w-full text-left"
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
        <div className="fixed top-0 left-0 w-full z-50 flex justify-center pointer-events-none">
          <Link href="#" className="inline-block p-2">
            <Image
              src="/logo.png"
              alt="Your Brand"
              width={100}
              height={50}
              className="h-12 w-auto"
              priority
            />
          </Link>
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
        
            <div className="overflow-y-auto h-[calc(100vh-100px)]">
              {isLoading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="p-4 active:bg-gray-50 search-result-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/user/product/${result.id}`);
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
                    <div className="p-4 text-center flex justify-center search-result-item">
                      <div
                        onClick={(e) => {
                        e.stopPropagation();
                        setIsSearchOpen(false)
                        router.push(`/user/product/show-all?searchquery=${searchQuery}`);
                      }}
                        className="bg-indigo-600 text-white block px-4 py-2 rounded-md hover:bg-indigo-700"
                      >
                        View All Results
                      </div>
                    </div>
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

        {isMobileProfileOpen && (
          <div className="fixed inset-0 bg-white z-50">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
              <button
                onClick={() => setIsMobileProfileOpen(false)}
                className="p-1 -ml-1 hover:bg-gray-100 rounded-full"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
              <h2 className="text-lg font-semibold">Account</h2>
            </div>

            <div className="divide-y divide-gray-200">
              <MenuLink href="/user/profile" icon={UserIcon} text="Profile" />
              <MenuLink href="/user/messages" icon={EnvelopeIcon} text="Messages" />
              <MenuLink href="/user/notifications" icon={BellIcon} text="Notifications" />
              <MenuLink href="/user/shoppers" icon={BuildingStorefrontIcon} text="Shoppers" />
              <MenuLink href="/user/settings" icon={Cog6ToothIcon} text="Settings" />
              <MenuLink href="/user/orders" icon={CubeIcon} text="Orders" />
              <MenuLink href="/user/payments" icon={CreditCardIcon} text="Payments" />
              <button
                type="button"
                onClick={() => {
                  setIsMobileProfileOpen(false);
                  signOut({ callbackUrl: '/' });
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-gray-100 text-left"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        )}       

        <MobileBottomNav
          onSearchClick={() => {
            setIsMobileProfileOpen(false); // close profile
            setIsSearchOpen(true);         // open search
          }}
          onMenuClick={() => {
            setIsSearchOpen(false);        // close search
            setIsMobileProfileOpen(true);  // open profile
          }}
        />

      </div>
      
      
      {/* Main content */}
      <main className="p-4 max-w-7xl mx-auto min-h-[calc(100vh-395px)]">{children}</main>

      <RightNav/>
      <UserFooter/>
    </div>
  );
}

const MenuLink = ({ href, icon: Icon, text }) => (
  <Link href={href}>
    <button
      onClick={() => setIsMobileProfileOpen(false)}
      className="flex w-full items-center gap-3 px-4 py-3 hover:bg-gray-100 text-gray-700"
    >
      <Icon className="h-5 w-5" />
      {text}
    </button>
  </Link>
);