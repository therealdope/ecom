'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import UserDashboardLayout from '@/components/user/layout/UserDashboardLayout';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { StarIcon } from '@heroicons/react/24/solid';

export default function WishlistPage() {
  const { wishlistItems: globalWishlistItems, toggleWishlist } = useCart();
  const [wishlistItems, setWishlistItems] = useState(globalWishlistItems);
  const router = useRouter();

  useEffect(() => {
    setWishlistItems(globalWishlistItems);
  }, [globalWishlistItems]);

  const removeFromWishlist = async (productId) => {
    try {

      toggleWishlist(productId);
      const updatedWishlist = wishlistItems.filter(item => item.product.id !== productId);
      setWishlistItems(updatedWishlist);
    
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
      <div className="max-w-7xl mx-auto px-4 py-10 md:py-8">
        {/* Back button */}
        <button
          onClick={() => router.push('/user/dashboard')}
          className="group mb-8 hidden md:inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-indigo-600 border border-indigo-200 rounded-full px-4 py-2 shadow-sm hover:shadow-md hover:bg-indigo-50 transition-all duration-200"
        >
          <svg
            className="w-4 h-4 text-indigo-600 group-hover:-translate-x-0.5 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium text-sm">Go Back</span>
        </button>
        <h1 className="text-2xl font-bold mb-8 text-indigo-700">My Wishlist</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => {
            const product = item.product;
            const variant = product.variants[0];
            const stock = variant?.stock ?? 0;
            const price = variant?.price ?? 'N/A';

            return (
              <div key={item.id} className="bg-white rounded-xl shadow p-4 flex flex-col">
                <div className="relative h-48 w-full rounded-md overflow-hidden">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="mt-4 flex flex-col flex-1">
                  <h3
                    onClick={() => router.push(`/user/product/${item.productId}`)}
                    className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-indigo-600"
                  >
                    {product.name}
                  </h3>

                  <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>

                  <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                    <span className="font-medium text-indigo-600">₹{price}</span>
                    <span>{stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                  </div>

                  <div className="mt-1 text-sm text-gray-500">
                    <span className="font-semibold">Seller:</span> {product.vendor?.name || 'Vendor'}
                  </div>

                  <div className="text-sm text-gray-500">
                    <span className="font-semibold">Shop:</span> {product.shop?.name || 'Unknown Shop'}
                  </div>

                  <p className="text-xs text-gray-400 mt-1">
                    Wishlisted on: {new Date(item.createdAt).toLocaleDateString()}
                  </p>

                  <div className="mt-auto pt-4 flex gap-2">
                    <button
                      onClick={() => router.push(`/user/product/${product.id}`)}
                      className="flex-1 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
                    >
                      View Product
                    </button>

                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </UserDashboardLayout>
  );
}
