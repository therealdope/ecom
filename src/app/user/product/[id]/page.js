'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import UserDashboardLayout from '@/components/user/layout/UserDashboardLayout';
import { useCart } from '@/context/CartContext';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

export default function ProductPage({ params }) {
  const { addToCart, removeFromCart, updateCartItemQuantity, cartItems, toggleWishlist, isInWishlist } = useCart();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const unwrappedParams = use(params);

  const quantity = selectedVariant
    ? cartItems.find(item => item.productId === product?.id && item.variantId === selectedVariant.id)?.quantity || 0
    : 0;

 useEffect(() => {
  const fetchProductAndReviews = async () => {
    try {
      const productRes = await fetch(`/api/user/products/${unwrappedParams.id}`);
      const productData = await productRes.json();

      if (productRes.ok) {
        setProduct(productData);
        if (productData?.variants?.length > 0) {
          setSelectedVariant(productData.variants[0]);
        }
      } else {
        console.error('Failed to fetch product:', productData.error);
      }

      const reviewsRes = await fetch(`/api/user/products/${unwrappedParams.id}/reviews`);
      const reviewData = await reviewsRes.json();
      if (reviewsRes.ok) {
        setReviews(reviewData);
      } else {
        console.error('Failed to fetch reviews:', reviewData.error);
      }
    } catch (error) {
      console.error('Error fetching product or reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  if (unwrappedParams.id) {
    fetchProductAndReviews();
  }
}, [unwrappedParams.id]);


  const handleAddToCart = () => {
    if (selectedVariant && product) {
      addToCart(product, selectedVariant);
    }
  };

  const handleQuantityChange = async (delta) => {
    if (!product || !selectedVariant) return;
    
    const newQuantity = quantity + delta;
    if (newQuantity <= 0) {
      await removeFromCart(product.id, selectedVariant.id);
    } else if (newQuantity <= selectedVariant.stock) {
      await updateCartItemQuantity(product.id, selectedVariant.id, newQuantity);
    }
  };

  if (loading) {
    return (
      <UserDashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-indigo-500" />
        </div>
      </UserDashboardLayout>
    );
  }

  if (!product) {
    return (
      <UserDashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Product not found</h1>
          <button
            onClick={() => router.back()}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            ← Go Back
          </button>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <button
  onClick={() => router.back()}
  className="group mb-6 inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-indigo-600 border border-indigo-200 rounded-full px-4 py-2 shadow-sm hover:shadow-md hover:bg-indigo-50 transition-all duration-200"
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


        <div className="bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Product Image and Wishlist */}
<div className="relative flex flex-col items-center p-6 bg-indigo-50">
  <div className="relative w-full max-w-md h-96 rounded-xl overflow-hidden shadow">
    <Image
      src={product.imageUrl || '/placeholder.jpg'}
      alt={product.name}
      fill
      className="object-cover"
      priority
    />
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleWishlist(product.id);
      }}
      className="absolute top-4 right-4 p-2 bg-white/80 rounded-full shadow hover:bg-white"
    >
      {isInWishlist(product.id) ? (
        <HeartSolidIcon className="w-6 h-6 text-red-500" />
      ) : (
        <HeartIcon className="w-6 h-6 text-gray-600" />
      )}
    </button>
  </div>

  {/* Quantity Controls */}
  {quantity > 0 && (
    <div className="mt-6 flex justify-center">
      <div className="flex items-center border rounded-lg overflow-hidden bg-white shadow-sm">
        <button
          className="px-4 py-2 text-lg font-bold text-gray-600 hover:text-gray-800"
          onClick={() => handleQuantityChange(-1)}
        >
          −
        </button>
        <span className="px-6 py-2">{quantity}</span>
        <button
          className="px-4 py-2 text-lg font-bold text-gray-600 hover:text-gray-800"
          onClick={() => handleQuantityChange(1)}
          disabled={quantity >= selectedVariant.stock}
        >
          +
        </button>
      </div>
    </div>
  )}
  {quantity === 0 && (
    <button
      onClick={handleAddToCart}
      className="w-full max-w-md mt-6 py-3 bg-indigo-600 text-white rounded-xl text-lg font-semibold hover:bg-indigo-700 transition"
    >
      Add to Cart
    </button>
  )}
</div>


          {/* Product Details */}
          <div className="p-8 bg-white">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-sm text-gray-500 mb-1">{product.category.name}</p>
            <p className="text-sm text-gray-600 mb-4">Sold by: {product.shop.name}</p>

            <div className="flex items-center mb-4">
              <span className="text-yellow-400 text-xl">★</span>
              <span className="ml-1 text-gray-800 font-medium">{product.averageRating.toFixed(1)}</span>
              <span className="mx-2 text-gray-400">•</span>
              <span className="text-gray-600">{product.reviews.length} reviews</span>
            </div>

            <p className="text-2xl text-indigo-600 font-bold mb-6">
              ${selectedVariant?.price?.toFixed(2) || 'N/A'}
            </p>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Variants</h2>
              <div className="grid grid-cols-2 gap-3">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`p-4 border rounded-xl text-left transition ${
                      selectedVariant?.id === variant.id
                        ? 'bg-indigo-100 border-indigo-500'
                        : 'hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium">
                      {variant.size && `Size: ${variant.size}`}
                      {variant.size && variant.color && ' • '}
                      {variant.color && `Color: ${variant.color}`}
                    </p>
                    <p className="text-indigo-600 font-semibold">${variant.price}</p>
                    <p className="text-sm text-gray-500">{variant.stock} in stock</p>
                  </button>
                ))}
              </div>
            </div>
            
          </div>
        </div>

{/* Reviews Section */}
<div className="mt-12 bg-white p-8 rounded-2xl shadow-md">
  <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

  {reviews.length > 0 ? (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="flex items-start gap-4 border-b border-gray-300 pb-6">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            <Image
              src={review.user?.profile?.avatar || '/default-avatar.png'}
              alt={`${review.user?.name || 'User'}'s Avatar`}
              width={48}
              height={48}
              className="object-cover w-full h-full"
            />
          </div>

          {/* Review content */}
          <div className="flex-1">
            <div className="flex items-center justify-between flex-wrap">
              <div className="flex items-center gap-2 text-sm sm:text-base">
                <span className="font-semibold text-gray-800">
                  {review.user?.name || 'Anonymous'}
                </span>
                <span className="text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Star Rating */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-sm ${
                      i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <p className="mt-2 text-gray-700 leading-relaxed break-words">
              {review.comment}
            </p>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-500">No reviews yet.</p>
  )}
</div>




      </div>
    </UserDashboardLayout>
  );
}
