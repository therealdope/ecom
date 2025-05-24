'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ selectedShop, isSidebarOpen, setIsSidebarOpen }) {
  const pathname = usePathname();

  // Navigation items with icons
  const navigation = [
    {
      name: 'Overview',
      href: '/vendor/dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'Products',
      href: '/vendor/products',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      name: 'Orders',
      href: '/vendor/orders',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      name: 'Payments',
      href: '/vendor/payments',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      name: 'Customers',
      href: '/vendor/customers',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      name: 'Shop Settings',
      href: '/vendor/settings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:sticky top-0 left-0 h-screen md:h-[calc(100vh-4rem)] z-40 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out`}>
      {/* Mobile close button */}
      <div className="md:hidden absolute top-0 right-0 p-4">
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
        >
          <span className="sr-only">Close sidebar</span>
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Shop info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
            {selectedShop ? selectedShop.name.charAt(0) : 'S'}
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900 truncate">
              {selectedShop ? selectedShop.name : 'Select a Shop'}
            </h2>
            <p className="text-sm text-gray-500">Vendor Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4 px-2 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`${isActive
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors duration-150 ease-in-out`}
            >
              <div className={`${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'} mr-3`}>
                {item.icon}
              </div>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Shop stats */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Products</span>
            <span className="text-sm font-medium text-gray-900">24</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Orders</span>
            <span className="text-sm font-medium text-gray-900">12</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Revenue</span>
            <span className="text-sm font-medium text-gray-900">$1,234.56</span>
          </div>
        </div>
      </div>
    </div>
  );
}