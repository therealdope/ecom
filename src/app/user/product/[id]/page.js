'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import UserDashboardLayout from '@/components/user/layout/UserDashboardLayout';
import { useCart } from '@/context/CartContext';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Loader from '@/components/shared/Loader';

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
  const selectable = productData.variants.find((v) => parseInt(v.inOrder) !== 1 && v.stock > 0);
  if (selectable) {
    setSelectedVariant(selectable);
  }
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

  const handleQuantityChange = (delta) => {
    if (!product || !selectedVariant) return;
    
    const newQuantity = quantity + delta;
    if (newQuantity <= 0) {
       removeFromCart(product.id, selectedVariant.id);
    } else if (newQuantity <= selectedVariant.stock) {
       updateCartItemQuantity(product.id, selectedVariant.id, newQuantity);
    }
  };

  if (loading) {
    return (
        <Loader/>
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
      <div className="max-w-7xl mb-8 mx-auto px-4 py-10 -mt-6">
        <button
  onClick={() => router.back()}
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


<div className="bg-white rounded-2xl md:shadow-lg grid grid-cols-1 md:grid-cols-2">

{/* Product Image and Wishlist */}
<div className="relative rounded-lg p-6 bg-white flex flex-col items-center justify-center gap-6 md:border-r border-gray-200">
  <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-md transition-transform hover:scale-[1.005]">
    <Image
      src={product.imageUrl || '/placeholder.jpg'}
      alt={product.name}
      fill
      className="object-contain"
      priority
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

  {quantity > 0 ? (
    <div className="flex items-center justify-center gap-4 bg-indigo-100 px-4 py-2 rounded-full shadow-md">
      <button
        className="text-2xl font-bold text-gray-600 hover:text-indigo-600 transition"
        onClick={() => handleQuantityChange(-1)}
      >
        −
      </button>
      <span className="text-lg font-medium text-gray-800">{quantity}</span>
      <button
        className="text-2xl font-bold text-gray-600 hover:text-indigo-600 transition"
        onClick={() => handleQuantityChange(1)}
        disabled={quantity >= selectedVariant.stock}
      >
        +
      </button>
    </div>
  ) : (
    <button
      onClick={handleAddToCart}
      className="w-full max-w-md py-3 bg-indigo-600 text-white rounded-full text-lg font-semibold hover:bg-indigo-700 transition shadow-md"
    >
      Add to Cart
    </button>
  )}
</div>

{/* Product Details */}
<div className="p-6 mt-2 rounded-2xl space-y-4 backdrop-blur-sm border-gray-400">
  <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase">Category</p>
      <p className="text-base text-gray-800">{product.category.name}</p>
    </div>

    <div>
      <p className="text-xs font-medium text-gray-500 uppercase">Sold By</p>
      <p className="text-base text-gray-800">{product.shop.name}</p>
    </div>

    <div>
      <p className="text-xs font-medium text-gray-500 uppercase">Rating</p>
      <p className="text-base text-gray-800">
        {product.averageRating.toFixed(1)} ★ ({product.reviews.length} reviews)
      </p>
    </div>

    <div>
      <p className="text-xs font-medium text-gray-500 uppercase">Price</p>
      <p className="text-2xl font-bold text-indigo-600">
        ₹{selectedVariant?.price?.toFixed(2) || 'N/A'}
      </p>
    </div>
  </div>

  <div>
    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Description</p>
    <p className="text-gray-700 leading-relaxed">{product.description}</p>
  </div>

  <div className="rounded-2xl">
    <p className="text-xs font-medium text-gray-500 uppercase mb-2">Variants</p>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  {Array.isArray(product.variants) &&
  product.variants
    .filter(
      (variant) => variant.stock > 0 && parseInt(variant.inOrder) !== 1
    )
    .map((variant) => (
      <button
        key={variant.id}
        onClick={() => setSelectedVariant(variant)}
        className={`p-4 rounded-2xl border border-gray-200 hover:bg-gray-50 transition text-left shadow-sm space-y-1 ${
          selectedVariant?.id === variant.id
            ? 'bg-indigo-100 border-indigo-500'
            : 'bg-white hover:border-gray-300'
        }`}
      >
        <p className="text-sm text-gray-700">
          <span className="font-medium text-gray-900">SKU:</span> {variant.sku}
        </p>

        {(variant.size || variant.color) && (
          <p className="text-sm text-gray-700">
            {variant.size && (
              <span>
                <span className="font-medium text-gray-900">Size:</span> {variant.size}
              </span>
            )}
            {variant.size && variant.color && ' • '}
            {variant.color && (
              <span className="flex items-center gap-2">
                <span className="font-medium text-gray-900">Color:</span>
                <span className="capitalize text-gray-700">{variant.color}</span>
                <span
                  className="w-5 h-5 rounded-full border border-gray-300"
                  style={{ backgroundColor: variant.color.toLowerCase() }}
                />
              </span>
            )}
          </p>
        )}

        <p className="text-sm text-indigo-600 font-semibold">
          ₹{variant.price.toFixed(2)}
        </p>
        <p className="text-sm text-gray-500">{variant.stock} in stock</p>
      </button>
    ))}
  
</div>

  </div>
</div>

</div>

{/* Reviews Section */}
<div className="mt-12 bg-white p-8 rounded-2xl md:shadow-md">
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
