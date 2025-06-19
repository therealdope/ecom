'use client';

import { useCart } from '@/context/CartContext';
import UserDashboardLayout from '@/components/user/layout/UserDashboardLayout';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cartItems, removeFromCart, updateCartItemQuantity, getCartTotal } = useCart();
  const router = useRouter();

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
          <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
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
        <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="md:col-span-2 space-y-4">
            {cartItems.map((item) => (
              // Inside the cartItems.map() function
              <div key={`${item.productId}-${item.variantId}`} className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
                <div className="relative w-24 h-24">
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.product.name}</h3>
                  <p className="text-gray-600">
                    {item.variant.size && `Size: ${item.variant.size}`}
                    {item.variant.color && item.variant.size && ' - '}
                    {item.variant.color && `Color: ${item.variant.color}`}
                  </p>
                  <p className="font-medium text-indigo-600">${item.variant.price}</p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border rounded-lg overflow-hidden">
                      <button
                        className="px-3 py-1 hover:bg-gray-100"
                        onClick={() => updateCartItemQuantity(item.productId, item.variantId, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="px-4 py-1 border-x">{item.quantity}</span>
                      <button
                        className="px-3 py-1 hover:bg-gray-100"
                        onClick={() => updateCartItemQuantity(item.productId, item.variantId, item.quantity + 1)}
                        disabled={item.quantity >= item.variant.stock}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6 h-fit">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t pt-3 font-semibold flex justify-between">
                <span>Total</span>
                <span>${getCartTotal().toFixed(2)}</span>
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