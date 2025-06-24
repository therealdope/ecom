'use client';

import { useCart } from '@/context/CartContext';
import UserDashboardLayout from '@/components/user/layout/UserDashboardLayout';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { TrashIcon } from '@heroicons/react/24/outline';

export default function CartPage() {
  const {
    cartItems,
    removeFromCart,
    updateCartItemQuantity,
    getCartTotal,
    clearCart,
  } = useCart();
  const router = useRouter();

  const handleQuantityChange = async (item, delta) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      await removeFromCart(item.productId, item.variantId);
    } else if (newQuantity <= item.variant.stock) {
      await updateCartItemQuantity(item.productId, item.variantId, newQuantity);
    }
  };

  if (cartItems.length === 0) {
    return (
      <UserDashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <Image
            src="/empty-cart.png"
            alt="Empty Cart"
            width={200}
            height={200}
            className="mb-6 opacity-50 rounded-full"
          />
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven&apos;t added anything to your cart yet.</p>
          <button
            onClick={() => router.push('/user/dashboard')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
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

        {/* Title and Clear Cart */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
          <button
            onClick={clearCart}
            className="flex items-center gap-1 text-sm text-red-600 hover:underline"
          >
            <TrashIcon className="w-4 h-4" />
            Clear Cart
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="md:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div
                key={`${item.productId}-${item.variantId}`}
                className="bg-white rounded-xl shadow p-4 grid grid-cols-[auto_1fr] gap-4"
              >
                {/* Left: Image + Quantity */}
                <div className="flex flex-col items-center w-full max-w-[7rem]">
                  <div className="relative w-28 h-28 rounded-lg overflow-hidden">
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Quantity Controls */}
                  <div className="mt-3 flex items-center justify-center gap-3 bg-indigo-100 px-4 py-1 rounded-full shadow-md w-full">
                    <button
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-gray-700 cursor-pointer"
                      onClick={() => handleQuantityChange(item, -1)}
                    >
                      −
                    </button>
                    <span className="text-md font-medium text-gray-800">{item.quantity}</span>
                    <button
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-gray-700  disabled:opacity-50 cursor-pointer"
                      onClick={() => handleQuantityChange(item, 1)}
                      disabled={item.quantity >= item.variant.stock}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Right: Product Details */}
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start">
                    <h3
                      onClick={() => router.push(`/user/product/${item.product.id}`)}
                      className="font-semibold text-lg text-gray-800 hover:text-indigo-600 cursor-pointer"
                    >
                      {item.product.name}
                    </h3>

                    <button
                      onClick={() => removeFromCart(item.productId, item.variantId)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-sm text-gray-500 mt-1">
                    <span className="font-medium">Size:</span> {item.variant.size || '—'}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <span className="font-medium">Color:</span>
                    {item.variant.color ? (
                      <span
                        className="inline-block w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: item.variant.color }}
                      ></span>
                    ) : (
                      <span>—</span>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 mt-1">
                    <span className="font-medium">Vendor:</span> {item.product.vendor?.name || 'Vendor'}
                  </p>

                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Shop:</span> {item.product.shop?.name || 'Shop'}
                  </p>

                  <p className="text-indigo-600 font-semibold text-xl mt-2">
                    ₹{item.variant.price}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow p-6 h-fit">
  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

  {/* Line Items */}
  <div className="mb-4 space-y-2 text-sm text-gray-700">
    {cartItems.map((item) => (
      <div key={`${item.productId}-${item.variantId}`} className="flex justify-between">
        <span>
          {item.product.name} ({item.quantity} × ₹{item.variant.price})
        </span>
        <span>₹{(item.quantity * item.variant.price).toFixed(2)}</span>
      </div>
    ))}
  </div>
  <hr className='text-gray-600'/>

  {/* Totals */}
  <div className="space-y-3 mb-6 mt-4 text-gray-700">
    <div className="flex justify-between">
      <span>Subtotal</span>
      <span>₹{getCartTotal().toFixed(2)}</span>
    </div>
    <div className="flex justify-between">
      <span>Shipping</span>
      <span>Free</span>
    </div>
    <div className="border-t border-gray-600 pt-3 font-semibold flex justify-between">
      <span>Total</span>
      <span>₹{getCartTotal().toFixed(2)}</span>
    </div>
  </div>

  <button
    onClick={() => router.push('/user/checkout')}
    className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
  >
    Proceed to Checkout
  </button>
</div>

        </div>
      </div>
    </UserDashboardLayout>
  );
}
