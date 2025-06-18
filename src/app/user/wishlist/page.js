'use client';

import { useCart } from '@/context/CartContext';
import UserDashboardLayout from '@/components/user/layout/UserDashboardLayout';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function WishlistPage() {
  const { wishlistItems, toggleWishlist } = useCart();
  const router = useRouter();

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
            <div key={item.productId} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="relative h-48 w-full">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                <p className="text-indigo-600 font-medium mb-4">${item.price}</p>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/user/product/${item.productId}`)}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => toggleWishlist({ id: item.productId })}
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