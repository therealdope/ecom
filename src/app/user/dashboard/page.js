'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import UserDashboardLayout from '@/components/user/layout/UserDashboardLayout';
import { useCart } from '@/context/CartContext';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

export default function DashboardPage() {
  const router = useRouter();
  const swiperRef = useRef(null);
  const {toggleWishlist, isInWishlist } = useCart();
  const [products, setProducts] = useState({
    newArrivals: [],
    trending: [],
    topRated: [],
    random: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize swiper
    const timer = setTimeout(() => {
      if (swiperRef.current && window.Swiper) {
        new window.Swiper(swiperRef.current, {
          spaceBetween: 30,
          pagination: {
            el: '.swiper-pagination',
            clickable: true,
          },
          autoplay: {
            delay: 8000,
          },
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/user/products');
        const data = await response.json();
        if (response.ok) {
          setProducts(data);
        } else {
          console.error('Failed to fetch products:', data.error);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = ['Home', 'Categories', "Men's", "Women's", 'Sport', 'Hot Offers'];
  const categoryButtons = [
    { name: "Men's", image: '/mens.jpg' },
    { name: "Women's", image: '/womens.jpg' },
    { name: 'Sport', image: '/sport.jpg' },
    { name: 'Hot Offers', image: '/offers.jpg' },
  ];

  const renderProduct = (product) => (
    <div
      key={product.id}
      className="flex gap-4 items-center bg-white p-2 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => router.push(`/user/product/${product.id}`)}
    >
      <div className="relative z-0 w-20 h-20">
        <Image
          src={product.imageUrl || '/placeholder.jpg'}
          alt={product.name}
          fill
          className="object-cover rounded-lg"
          loading="lazy"
          sizes="(max-width: 80px) 100vw, 80px"
        />
      </div>
      <div className="flex-1">
        <h4 className="font-medium truncate">{product.name}</h4>
        <p className="text-sm text-gray-600">{product.category.name}</p>
        <p className="text-xs text-gray-500"><span className="font-bold">sold by: </span>{product.shop.name}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="font-bold text-indigo-600">₹{product.variants[0]?.price || 'N/A'}</span>

        </div>
      </div>
    </div>
  );

  const renderDetailedProduct = (product) => (
    <div
      key={product.id}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
    >
      <div className="relative h-64 w-full">
        <Image
          src={product.imageUrl || '/placeholder.jpg'}
          alt={product.name}
          fill
          className="object-cover"
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="absolute top-4 right-4 p-1 rounded-full transition bg-indigo-100/50 hover:bg-indigo-100/80"
        >
          {isInWishlist(product.id) ? (
            <HeartSolidIcon className="w-7 h-7 text-indigo-600" />
          ) : (
            <HeartIcon className="w-7 h-7 text-indigo-600" />
          )}
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold truncate flex-1">{product.name}</h3>
          <span className="text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
            {product.category.name}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-2">{product.shop.name}</p>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{product.description}</p>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <span className="text-yellow-400 text-lg">★</span>
            <span className="text-sm ml-1">{product.averageRating.toFixed(1)}</span>
            <span className="text-sm text-gray-500 ml-1">({product.reviews.length} reviews)</span>
          </div>
          <span className="font-bold text-lg text-indigo-600">
            ₹{product.variants[0]?.price || 'N/A'}
          </span>
        </div>
        <button
        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
        onClick={() => router.push(`/user/product/${product.id}`)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
          </svg>
          Add to Cart
        </button>
      </div>
    </div>
  );

  return (
    <UserDashboardLayout>
      <div className="p-3 space-y-6 mt-12 md:mt-0">
        {/* Top nav buttons */}
        <div className="flex overflow-x-auto gap-4 whitespace-nowrap">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm whitespace-nowrap hover:bg-indigo-200"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Swiper carousel */}
        <div ref={swiperRef} className="swiper rounded-xl overflow-hidden">
          <div className="swiper-wrapper">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="swiper-slide">
                {/* Mobile */}
                <img
                  src={`/mobile-banner${i + 1}.jpg`}
                  alt={`Slide ${i + 1}`}
                  className="block sm:hidden w-full h-112 object-cover"
                />

                {/* Tablet */}
                <img
                  src={`/tablet-banner${i + 1}.jpg`}
                  alt={`Slide ${i + 1}`}
                  className="hidden sm:block md:hidden w-full h-118 object-cover"
                />

                {/* Desktop */}
                <img
                  src={`/banner${i + 1}.jpg`}
                  alt={`Slide ${i + 1}`}
                  className="hidden md:block w-full h-128 object-center"
                />
              </div>
            ))}
          </div>


          <div className="swiper-pagination"></div>
        </div>

        {/* Marquee */}
        <div className="overflow-hidden whitespace-nowrap bg-indigo-50 py-2 rounded-xl">
          <div className="inline-block animate-marquee text-indigo-700 font-medium text-sm">
            Hot Offers Available Now! | New Arrivals Just In | Up to 50% OFF on Sports Gear | Trending Now — Don’t Miss Out!
          </div>
        </div>

        {/* Category buttons with image */}
        <div className="relative flex items-start">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-opacity-10 rounded-xl z-0" />

          {/* Grid container */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-3 flex-grow">
            {categoryButtons.map((cat, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center bg-white p-4 rounded-2xl shadow-md"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-20 h-20 object-cover p-2"
                />
                <span className="mt-2 font-medium text-sm text-center">{cat.name}</span>
              </div>
            ))}
          </div>

          {/* Rotated Show All button */}
          <div className="relative z-10 flex items-center justify-center ">
            <div className="bg-indigo-100 rounded-xl shadow-md hover:bg-indigo-200 transition duration-300 py-5 mt-3 cursor-pointer animate-shine">
              <span className="text-indigo-600 font-semibold transform rotate-90 origin-bottom-left block ml-10 mb-19">
                Show All
              </span>
            </div>
          </div>
        </div>


        {/* Product Sections */}
        {loading ? (
          <div className="text-center py-8">Loading products...</div>
        ) : (
          <div className="space-y-12">
            {/* Compact product sections in grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h3 className="text-lg font-bold mb-2">New Arrivals</h3>
                <div className="space-y-4">
                  {products.newArrivals.map(renderProduct)}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Trending</h3>
                <div className="space-y-4">
                  {products.trending.map(renderProduct)}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Top Rated</h3>
                <div className="space-y-4">
                  {products.topRated.map(renderProduct)}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">You May Like</h3>
                <div className="space-y-4">
                  {products.random.map(renderProduct)}
                </div>
              </div>
            </div>

            {/* Detailed product cards */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Discover More Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.all.slice(0, 6).map(renderDetailedProduct)}
              </div>
            </div>
          </div>
        )}
      </div>
    </UserDashboardLayout>
  );
}
