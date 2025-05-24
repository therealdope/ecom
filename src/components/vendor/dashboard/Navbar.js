'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function Navbar({ selectedShop, setSelectedShop }) {
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  
  const shopDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const messagesRef = useRef(null);

  // Sample shops data
  const shops = [
    { id: 1, name: 'Fashion Store' },
    { id: 2, name: 'Electronics Hub' },
    { id: 3, name: 'Home Decor' },
  ];

  // Handle clicks outside dropdowns to close them
  useEffect(() => {
    function handleClickOutside(event) {
      if (shopDropdownRef.current && !shopDropdownRef.current.contains(event.target)) {
        setIsShopDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(event.target)) {
        setIsMessagesOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/auth/signin' });
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/vendor/dashboard" className="flex items-center">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                width={40} 
                height={40} 
                className="h-8 w-auto" 
              />
              <span className="ml-2 text-xl font-bold text-gray-800">Vendor Portal</span>
            </Link>
          </div>

          {/* Center - Shop Selector */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="relative" ref={shopDropdownRef}>
              <button
                onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span>{selectedShop ? selectedShop.name : 'Select Shop'}</span>
                <svg className="ml-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {isShopDropdownOpen && (
                <div className="absolute mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none">
                  <div className="py-1">
                    {shops.map((shop) => (
                      <button
                        key={shop.id}
                        onClick={() => {
                          setSelectedShop(shop);
                          setIsShopDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {shop.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="sr-only">View notifications</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
              </button>

              {isNotificationsOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      <a href="#" className="block px-4 py-3 hover:bg-gray-50">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">N</div>
                          </div>
                          <div className="ml-3 w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">New order received</p>
                            <p className="text-sm text-gray-500">Order #12345 from John Doe</p>
                            <p className="mt-1 text-xs text-gray-500">2 minutes ago</p>
                          </div>
                        </div>
                      </a>
                      <a href="#" className="block px-4 py-3 hover:bg-gray-50">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">P</div>
                          </div>
                          <div className="ml-3 w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">Payment received</p>
                            <p className="text-sm text-gray-500">$250.00 for order #12340</p>
                            <p className="mt-1 text-xs text-gray-500">1 hour ago</p>
                          </div>
                        </div>
                      </a>
                    </div>
                    <div className="border-t border-gray-200">
                      <a href="#" className="block text-center px-4 py-2 text-sm text-indigo-600 font-medium hover:bg-gray-50">
                        View all notifications
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="relative" ref={messagesRef}>
              <button
                onClick={() => setIsMessagesOpen(!isMessagesOpen)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="sr-only">View messages</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
              </button>

              {isMessagesOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900">Messages</h3>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      <a href="#" className="block px-4 py-3 hover:bg-gray-50">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">C</div>
                          </div>
                          <div className="ml-3 w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">Customer Support</p>
                            <p className="text-sm text-gray-500 truncate">I have a question about my order...</p>
                            <p className="mt-1 text-xs text-gray-500">10 minutes ago</p>
                          </div>
                        </div>
                      </a>
                      <a href="#" className="block px-4 py-3 hover:bg-gray-50">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">S</div>
                          </div>
                          <div className="ml-3 w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">System Notification</p>
                            <p className="text-sm text-gray-500 truncate">Your shop has been approved!</p>
                            <p className="mt-1 text-xs text-gray-500">1 day ago</p>
                          </div>
                        </div>
                      </a>
                    </div>
                    <div className="border-t border-gray-200">
                      <a href="#" className="block text-center px-4 py-2 text-sm text-indigo-600 font-medium hover:bg-gray-50">
                        View all messages
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-full"
              >
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                  V
                </div>
                <span className="hidden md:block font-medium text-gray-700">Vendor</span>
                <svg className="hidden md:block h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {isProfileDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none">
                  <div className="py-1">
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      View Profile
                    </a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Settings
                    </a>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Shop Selector - Only visible on mobile */}
        <div className="md:hidden py-2 border-t border-gray-200">
          <div className="relative">
            <button
              onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
              className="flex items-center justify-between w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span>{selectedShop ? selectedShop.name : 'Select Shop'}</span>
              <svg className="ml-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {isShopDropdownOpen && (
              <div className="absolute mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-10">
                <div className="py-1">
                  {shops.map((shop) => (
                    <button
                      key={shop.id}
                      onClick={() => {
                        setSelectedShop(shop);
                        setIsShopDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {shop.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}