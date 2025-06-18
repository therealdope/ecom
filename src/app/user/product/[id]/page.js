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
  
  // Unwrap params using React.use()
  const unwrappedParams = use(params);

  const quantity = selectedVariant
    ? cartItems.find(item => item.productId === product?.id && item.variantId === selectedVariant.id)?.quantity || 0
    : 0;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/user/products/${unwrappedParams.id}`);
        const data = await response.json();
        if (response.ok) {
          setProduct(data);
          if (data?.variants?.length > 0) {
            setSelectedVariant(data.variants[0]);
          }
        } else {
          console.error('Failed to fetch product:', data.error);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (unwrappedParams.id) {
      fetchProduct();
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
    } else {
      updateCartItemQuantity(product.id, selectedVariant.id, newQuantity);
    }
  };

  if (loading) {
    return (
      <UserDashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-indigo-500" />
        </div>
      </UserDashboardLayout>
    );
  }

  if (!product) {
    return (
      <UserDashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <span className="mr-2">←</span>Go Back
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Left Side */}
            <div className="md:w-1/2 relative">
              <div className="relative h-96 w-full">
                <Image
                  src={product.imageUrl || '/placeholder.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
                <button
                  onClick={() => toggleWishlist(product)}
                  className="absolute top-4 right-4 p-1 rounded-full transition bg-indigo-100/50 hover:bg-indigo-100/80"
                >
                  {isInWishlist(product.id) ? (
                    <HeartSolidIcon className="w-7 h-7 text-indigo-600" />
                  ) : (
                    <HeartIcon className="w-7 h-7 text-indigo-600" />
                  )}
                </button>
              </div>

              {/* Quantity selector under image */}
              {quantity > 0 && (
                <div className="mt-4 flex justify-center items-center gap-4">
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button
                      className="p-2 px-4 text-gray-600 hover:text-gray-800"
                      onClick={() => handleQuantityChange(-1)}
                    >
                      -
                    </button>
                    <span className="px-4 py-2">{quantity}</span>
                    <button
                      className="p-2 px-4 text-gray-600 hover:text-gray-800"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= (selectedVariant?.stock || 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side */}
            <div className="md:w-1/2 p-8">
              <div className="mb-4">
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <p className="text-gray-600 mb-2">{product.category.name}</p>
                <p className="text-indigo-600 font-medium">Sold by: {product.shop.name}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <span className="text-yellow-400 text-xl">★</span>
                  <span className="ml-1 font-medium">{product.averageRating.toFixed(1)}</span>
                  <span className="mx-2">•</span>
                  <span className="text-gray-600">{product.reviews.length} reviews</span>
                </div>
                <p className="text-2xl font-bold text-indigo-600">
                  ${selectedVariant?.price?.toFixed(2) || 'N/A'}
                </p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-700">{product.description}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Available Variants</h2>
                <div className="grid grid-cols-2 gap-4">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      className={`border rounded-lg p-4 transition-colors ${
                        selectedVariant?.id === variant.id
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'hover:border-gray-400'
                      }`}
                      onClick={() => setSelectedVariant(variant)}
                    >
                      <p className="font-medium">
                        {variant.size && `Size: ${variant.size}`}
                        {variant.color && variant.size && ' - '}
                        {variant.color && `Color: ${variant.color}`}
                      </p>
                      <p className="text-indigo-600 font-bold">${variant.price}</p>
                      <p className="text-gray-600">{variant.stock} in stock</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Add to Cart Button (only show when not added yet) */}
              {quantity === 0 && (
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add to Cart
                </button>
              )}
            </div>
          </div>

          <div className="p-8 border-t">
            <h2 className="text-2xl font-bold mb-4">Reviews</h2>
            {product.reviews.length > 0 ? (
              <div className="space-y-4">
                {product.reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4">
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <span key={i} className="text-yellow-400">★</span>
                        ))}
                      </div>
                      <span className="mx-2">•</span>
                      <span className="text-gray-600">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No reviews yet</p>
            )}
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  );
}
