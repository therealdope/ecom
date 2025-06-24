'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import {
  Bars3Icon,
  ShoppingBagIcon,
  HomeIcon,
  HeartIcon,
  Squares2X2Icon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

export default function MobileBottomNav({ onSearchClick, onMenuClick }) {
  const { cartItems, wishlistItems } = useCart();

  return (
    <nav className="fixed z-50 bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgb(224,231,255)] md:hidden flex justify-around items-center py-2">
      <NavLink href="/user/dashboard" icon={HomeIcon} />
      <NavLink href="/user/wishlist" icon={HeartIcon} badge={wishlistItems.length} />
      
      {/* Search */}
      <button onClick={onSearchClick} className="p-2">
        <MagnifyingGlassIcon className="w-6 h-6 text-gray-600" />
      </button>

      <NavLink href="/user/cart" icon={ShoppingBagIcon} badge={cartItems.length} />

      {/* Menu */}
      <button onClick={onMenuClick} className="p-2">
        <Bars3Icon className="w-6 h-6 text-gray-600" />
      </button>
    </nav>
  );
}


function NavLink({ href, icon: Icon, badge }) {
  return (
    <Link href={href} className="relative p-2">
      <Icon className="w-6 h-6 text-gray-600" />
      {badge > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {badge}
        </span>
      )}
    </Link>
  );
}
