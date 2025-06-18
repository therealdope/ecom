'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import {
  Bars3Icon,
  ShoppingBagIcon,
  HomeIcon,
  HeartIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';

export default function MobileBottomNav() {
  const { cartItems, wishlistItems } = useCart();

  return (
    <nav className="fixed z-50 bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgb(224,231,255)] md:hidden flex justify-around items-center py-2">
      <NavLink href="#" icon={Bars3Icon} />
      <NavLink href="/user/cart" icon={ShoppingBagIcon} badge={cartItems.length} />
      <NavLink href="/" icon={HomeIcon} />
      <NavLink href="/user/wishlist" icon={HeartIcon} badge={wishlistItems.length} />
      <NavLink href="/menu" icon={Squares2X2Icon} />
    </nav>
  );
}

function NavLink({ href, icon: Icon, badge }) {
  return (
    <Link href={href} className="relative p-2">
      <Icon className="w-6 h-6 text-gray-600" />
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {badge}
        </span>
      )}
    </Link>
  );
}
