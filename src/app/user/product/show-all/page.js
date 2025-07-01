'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import UserDashboardLayout from '@/components/user/layout/UserDashboardLayout';
import { StarIcon } from '@heroicons/react/24/solid';
import { ChevronDownIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Suspense } from 'react';

export default function ShowAllProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShowAllProducts />
    </Suspense>
  );
}

function ShowAllProducts() {
  const searchParams = useSearchParams();
  const query = searchParams.get('searchquery') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const route = showAll
          ? '/api/user/products/show-all'
          : `/api/user/products/search?query=${encodeURIComponent(query)}`;

        const res = await fetch(route);
        const data = await res.json();

        let fetchedProducts = data.products || [];

        if (filter === 'lowToHigh') {
          fetchedProducts = [...fetchedProducts].sort(
            (a, b) => a.variants?.[0]?.price - b.variants?.[0]?.price
          );
        } else if (filter === 'highToLow') {
          fetchedProducts = [...fetchedProducts].sort(
            (a, b) => b.variants?.[0]?.price - a.variants?.[0]?.price
          );
        }

        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [query, showAll, filter]);

  const handleShowAllToggle = () => setShowAll(true);
  const handleBackToSearch = () => setShowAll(false);

  return (
    <UserDashboardLayout>
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <h2 className="text-xl sm:text-2xl font-semibold">
            {showAll ? 'Showing All Products' : `Results for:`}{' '}
            <span className="text-indigo-600">{!showAll && `"${query}"`}</span>
          </h2>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                className="appearance-none border border-gray-300 rounded px-3 py-1.5 text-sm pr-8 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">Sort by</option>
                <option value="lowToHigh">Price: Low to High</option>
                <option value="highToLow">Price: High to Low</option>
              </select>
              <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>

            {/* Show All / Back Button */}
            {!showAll ? (
              <button
                onClick={handleShowAllToggle}
                className="px-4 py-1.5 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                Show All
              </button>
            ) : (
              <button
                onClick={handleBackToSearch}
                className="flex items-center px-4 py-1.5 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                Back to Search
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : !products || products.length === 0 ? (
          <p className="text-red-500">No products found.</p>
        ) : (
          <div className="space-y-6">
            {products.map((product) => {
              const price = product.variants?.[0]?.price?.toFixed(2) ?? '—';
              const stock = product.variants?.[0]?.stock ?? 0;
              const stockStatus =
                stock === 0
                  ? 'Out of Stock'
                  : stock < 5
                  ? 'Low Stock'
                  : 'In Stock';

              return (
                <Link
                  key={product.id}
                  href={`/user/product/${product.id}`}
                  className="block bg-white rounded-lg shadow hover:shadow-md transition p-5 border border-gray-200"
                >
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="relative w-32 h-32 flex-shrink-0">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-contain rounded"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 space-y-2 text-sm text-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {product.name}
                      </h3>

                      <p className="line-clamp-2">
                        {product.description || 'No description available.'}
                      </p>

                      <div className="flex flex-wrap gap-x-6 gap-y-1">
                        <p>
                          <span className="font-medium">Category:</span>{' '}
                          {product.category?.name ?? 'N/A'}
                        </p>
                        <p>
                          <span className="font-medium">Vendor:</span>{' '}
                          {product.vendor?.name ?? 'N/A'}
                        </p>
                        <p>
                          <span className="font-medium">Shop:</span>{' '}
                          {product.shop?.name ?? 'N/A'}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-1">
                        <p
                          className={`font-medium ${
                            stock === 0
                              ? 'text-red-600'
                              : stock < 5
                              ? 'text-yellow-600'
                              : 'text-green-600'
                          }`}
                        >
                          {stockStatus}
                        </p>

                        <div className="flex items-center text-yellow-500">
                          <StarIcon className="w-4 h-4" />
                          <span className="ml-1 text-gray-700">4.5</span>
                        </div>
                      </div>

                      <p className="text-indigo-600 font-bold text-lg">
                        ₹{price}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </UserDashboardLayout>
  );
}
