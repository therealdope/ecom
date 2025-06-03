'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useShop } from '@/context/ShopContext';

// Updated Icons import for v1
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  ShoppingCartIcon, 
  CreditCardIcon, 
  UsersIcon, 
  CogIcon,
  MenuIcon,
  XIcon,
  BellIcon,
  ChatIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
} from '@heroicons/react/outline';

// Add this import at the top with other imports
import { signOut } from 'next-auth/react';

export default function DashboardLayout({ children }) {
  // Remove the local selectedShop state
  const [shops, setShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Use the shop context
  const { selectedShop, setSelectedShop } = useShop();
  const defaultSet = useRef(false);

  // Fetch shops from API
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await fetch('/api/vendor/shops');
        if (!response.ok) throw new Error('Failed to fetch shops');
        const data = await response.json();
        const allShopsOption = { id: 'all', name: 'All Shops' };
        const updatedShops = [allShopsOption, ...data];
        setShops(updatedShops);
        // Set first shop as default if available and no shop is selected
        if (!selectedShop && !defaultSet.current) {
          setSelectedShop(allShopsOption); // ensure it's set
          defaultSet.current = true;
        }
      } catch (error) {
        console.error('Error fetching shops:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShops();
  }, []);

  // Handle shop selection
  const selectShop = (shop) => {
    setSelectedShop(shop);
    setIsShopDropdownOpen(false);
  };
  
  // Create refs for dropdown containers
  const shopDropdownRefDesktop = useRef(null);
  const shopDropdownRefMobile = useRef(null);  
  const profileDropdownRef = useRef(null);
  
  // Get current path for active link highlighting
  const pathname = usePathname();
  
  // Example shops
  
  // Navigation links with icons
  const navLinks = [
    { name: 'Overview', href: '/vendor/dashboard', icon: HomeIcon },
    { name: 'Products', href: '/vendor/products', icon: ShoppingBagIcon },
    { name: 'Orders', href: '/vendor/orders', icon: ShoppingCartIcon },
    { name: 'Payments', href: '/vendor/payments', icon: CreditCardIcon },
    { name: 'Customers', href: '/vendor/customers', icon: UsersIcon },
    { name: 'Shop Settings', href: '/vendor/settings', icon: CogIcon },
  ];
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (shopDropdownRefDesktop.current && !shopDropdownRefDesktop.current.contains(event.target)) &&
        (shopDropdownRefMobile.current && !shopDropdownRefMobile.current.contains(event.target))
      ) {
        setIsShopDropdownOpen(false);
      }
  
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Toggle dropdown handlers
  const toggleShopDropdown = (e) => {
    e.stopPropagation(); // Changed back to stopPropagation
    setIsShopDropdownOpen(!isShopDropdownOpen);
    setIsProfileDropdownOpen(false);
  };
  
  const toggleProfileDropdown = (e) => {
    e.stopPropagation();
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
    setIsShopDropdownOpen(false);
  };
  
  // Toggle sidebar for desktop view
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left section: Logo and mobile menu button */}
            <div className="flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center md:hidden p-2 mr-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <XIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
              <div className="flex-shrink-0 flex items-center">
                <Link href="/vendor/dashboard" className="flex items-center">
                  <Image 
                    src="/logo.png" 
                    alt="Logo" 
                    width={40} 
                    height={40} 
                    className="h-8 w-auto" 
                  />
                  <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">Vendor Portal</span>
                </Link>
              </div>
            </div>
            
            {/* Center section: Shop selector */}
            <div className="hidden md:flex items-center justify-center flex-1">
              <div className="relative" ref={shopDropdownRefDesktop}>
                <button
                  onClick={toggleShopDropdown}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span>Loading shops...</span>
                  ) : selectedShop ? (
                    <span>{selectedShop.name}</span>
                  ) : (
                    <span>Select a shop</span>
                  )}
                  <ChevronDownIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
                </button>
                
                {isShopDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-gray-300 ring-opacity-5 focus:outline-none z-20">
                    <div className="py-1 max-h-60 overflow-y-auto" role="menu" aria-orientation="vertical">
                      {shops.map((shop) => (
                        <button
                          key={shop.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectShop(shop);
                          }}
                          className={`${selectedShop?.id === shop.id ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block w-full text-left px-4 py-2 text-sm hover:bg-gray-100`}
                          role="menuitem"
                        >
                          
                          {
                            shop.id === 'all'? (
                              <span className="text-black">All Shops</span>
                            ) : shop.name
                          }
                        </button>
                      ))}
                      <Link 
                        href="/vendor/shops/new"
                        className="block px-4 py-2 text-sm text-indigo-600 hover:bg-gray-100 border-t border-gray-300"
                      >
                      Create New Shop
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right section: Notification, Messages, Profile */}
            <div className="flex items-center">
              <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                <BellIcon className="h-6 w-6" aria-hidden="true" />
              </button>
              <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                <ChatIcon className="h-6 w-6" aria-hidden="true" />
              </button>
              
              {/* Profile dropdown */}
              <div className="ml-3 relative" ref={profileDropdownRef}>
                <div>
                  <button
                    onClick={toggleProfileDropdown}
                    className="flex items-center max-w-xs rounded-full text-sm focus:outline-none"
                  >
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold">
                      VP
                    </div>
                    <ChevronDownIcon className="ml-1 h-5 w-5 text-gray-400" aria-hidden="true" />
                  </button>
                </div>
                
                {isProfileDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-gray-300 ring-opacity-5 focus:outline-none z-20">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <Link 
                        href="/vendor/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                        role="menuitem"
                      >
                        View Profile
                      </Link>
                      <Link 
                        href="/vendor/settings" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                        role="menuitem"
                      >
                        Settings
                      </Link>
                      <button 
                        onClick={() => signOut({ callbackUrl: '/' })} // Fixed from OnClick to onClick
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600" 
                        role="menuitem"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Mobile shop selector - only visible on mobile */}
          <div className="md:hidden py-2">
            <div className="relative" ref={shopDropdownRefMobile}>
              <button
                onClick={toggleShopDropdown}
                className="w-full inline-flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                {selectedShop ? selectedShop.name : 'Select a shop'}
                <ChevronDownIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
              </button>
              
              {isShopDropdownOpen && (
                <div className="fixed inset-0 z-50 bg-gray-100 flex flex-col">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-medium">Select Shop</h2>
                    <button
                      onClick={toggleShopDropdown}
                      className="p-3 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-200"
                    >
                      <XIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    {shops.map((shop) => (
                      <button
                        key={shop.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectShop(shop);
                        }}
                        className={`${selectedShop?.id === shop.id ? 'text-gray-900' : 'text-gray-700'} rounded-md border-b border-gray-200 block w-full text-left px-4 py-4 text-md hover:bg-gray-200`}
                        role="menuitem"
                      >
                        {shop.name}
                      </button>
                    ))}
                    <Link 
                        href="/vendor/shops/new"
                        className="px-4 py-4 mt-16 text-md text-center text-indigo-600 rounded-md border block bg-indigo-100 hover:bg-indigo-200 border-indigo-300"
                      >
                        Create New Shop
                      </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar for desktop */}
        <aside 
          className={`${isSidebarOpen ? 'w-64' : 'w-20'} hidden md:block transition-all duration-300 ease-in-out bg-white shadow-md fixed h-[calc(100vh-4rem)] overflow-y-auto`} 
        >
          {/* Hamburger menu at the top of sidebar */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            {isSidebarOpen && <span className="font-medium text-gray-800">Menu</span>}
            <button
              onClick={toggleSidebar}
              className={`p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none ${!isSidebarOpen ? 'mx-auto' : ''}`}
              aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isSidebarOpen ? (
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
              ) : (
                <MenuIcon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
          
          <div className="pt-5 pb-4 overflow-y-auto">
            <div className="px-2 space-y-1">
              {navLinks.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <item.icon 
                      className={`${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'} ${isSidebarOpen ? 'mr-3' : 'mx-auto'} h-6 w-6`} 
                      aria-hidden="true" 
                    />
                    {isSidebarOpen && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleMobileMenu}></div>
            <div className="relative flex-1 flex flex-col w-full max-w-full bg-white h-full"> {/* Changed max-w-xs to max-w-full for full width */}
              <div className="absolute top-0 right-0 pt-2 pr-2">
                <button
                  onClick={toggleMobileMenu}
                  className="flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                >
                  <XIcon className="h-6 w-6 text-gray-400 hover:bg-gray-100 rounded-full" aria-hidden="true" />
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <Image 
                    src="/logo.png" 
                    alt="Logo" 
                    width={40} 
                    height={40} 
                    className="h-8 w-auto" 
                  />
                  <span className="ml-2 text-xl font-bold text-gray-900">Vendor Portal</span>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {navLinks.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                        onClick={toggleMobileMenu}
                      >
                        <item.icon 
                          className={`${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'} mr-4 h-6 w-6`} 
                          aria-hidden="true" 
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}
        
        {/* Main content */}
        <main className={`flex-1 p-2 sm:p-2 md:p-4 overflow-y-auto ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>

    
  );
}
