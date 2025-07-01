'use client';

import { useEffect, useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import VendorLayout from '@/components/vendor/layout/VendorLayout';
import Image from 'next/image';

export default function VendorReviewsPage() {
  const [view, setView] = useState('vendor'); // 'vendor' or 'product'
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/vendor/reviews?type=${view}`)
      .then(res => res.json())
      .then(setReviews)
      .finally(() => setLoading(false));
  }, [view]);

  return (
    <VendorLayout>
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">
          {view === 'vendor' ? 'Vendor Reviews' : 'Product Reviews'}
        </h2>
        <div className="space-x-2">
          <button
            onClick={() => setView('vendor')}
            className={`px-4 py-2 rounded-md ${view === 'vendor' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Vendor Reviews
          </button>
          <button
            onClick={() => setView('product')}
            className={`px-4 py-2 rounded-md ${view === 'product' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Product Reviews
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto bg-white shadow-md rounded-xl">
        <table className="w-full table-auto">
          <thead className="bg-indigo-100 text-indigo-900">
            <tr className="text-left text-sm font-semibold">
              <th className="px-6 py-4">Customer</th>
              {view === 'product' && <th className="px-6 py-4">Product</th>}
              <th className="px-6 py-4">Rating</th>
              <th className="px-6 py-4">Comment</th>
              <th className="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800">
            {reviews.map((review, idx) => (
              <tr key={idx} className="border-t hover:bg-indigo-50 transition-colors duration-200">
                <td className="px-6 py-4 flex items-center gap-3">
                  <Image
                    src={review.user?.profile?.avatar || '/default-avatar.png'}
                    alt="avatar"
                    width={32}
                    height={32}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="font-medium">{review.user?.name}</span>
                </td>

                {view === 'product' && (
                  <td className="px-6 py-4">{review.product?.name || '—'}</td>
                )}

                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </td>

                <td className="px-6 py-4 max-w-xl break-words">{review.comment}</td>

                <td className="px-6 py-4 text-gray-500 text-sm">
                  {new Date(review.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={view === 'product' ? 5 : 4} className="text-center py-6 text-gray-500">
                  {loading ? 'Loading...' : 'No reviews found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
    </VendorLayout>
  );
}
