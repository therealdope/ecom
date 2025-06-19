'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import UserDashboardLayout from '@/components/user/layout/UserDashboardLayout';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function WishlistPage() {
  const { wishlistItems: globalWishlistItems, toggleWishlist, addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState(globalWishlistItems);
  const router = useRouter();

  useEffect(() => {
    // Keep local state in sync with global context
    setWishlistItems(globalWishlistItems);
  }, [globalWishlistItems]);

  const removeFromWishlist = async (productId) => {
    try {
      const response = await fetch(`/api/user/wishlist/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Call toggleWishlist to update global state
        toggleWishlist(productId);
        // Filter out removed item from local state
        const updatedWishlist = wishlistItems.filter(item => item.product.id !== productId);
        setWishlistItems(updatedWishlist);
      } else {
        console.error('Failed to remove item from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  if (wishlistItems.length === 0) {
    return (
      <UserDashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <Image
            src="/empty-wishlist.png"
            alt="Empty Wishlist"
            width={200}
            height={200}
            className="mb-6 rounded-b-full opacity-45"
          />
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-8">Save items you like to your wishlist and review them anytime.</p>
          <button
            onClick={() => router.push('/user/dashboard')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Explore Products
          </button>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">My Wishlist</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="relative h-48 w-full">
                <Image
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-4">
                <h3
                  onClick={() => router.push(`/user/product/${item.productId}`)}
                  className="font-semibold text-lg mb-2 cursor-pointer hover:text-indigo-600 transition-colors"
                >
                  {item.product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-2">{item.product.category}</p>
                <p className="text-indigo-600 font-medium mb-4">
                  ${item.product.variants[0]?.price || 'N/A'}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/user/product/${item.productId}`)}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors"
                  >
                    View Product
                  </button>
                  <button
                    onClick={() => removeFromWishlist(item.product.id)}
                    className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </UserDashboardLayout>
  );
}
