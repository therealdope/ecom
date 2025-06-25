'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AddressForm from '@/components/user/checkout/AddressForm';
import PromoCode from '@/components/user/checkout/PromoCode';
import UserDashboardLayout from '@/components/user/layout/UserDashboardLayout';
import { useCart } from '@/context/CartContext';
import RazorpayForm from '@/components/user/checkout/RazorpayForm';
import PayOnDeliveryForm from '@/components/user/checkout/PayOnDeliveryForm';
import {
  MapPinIcon,
  TagIcon,
  CurrencyRupeeIcon,
  CreditCardIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

const CheckoutPage = () => {
  const { cartItems, getCartTotal, clearCart} = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [checkoutData, setCheckoutData] = useState({
    address: null,
    promoCode: null,
    giftCard: null,
    paymentMethod: '',
  });

  const handleAddressSubmit = (addressData) => {
    setCheckoutData((prev) => ({ ...prev, address: addressData }));
    setStep(2);
  };

  const handlePromoSubmit = (promoData) => {
    setCheckoutData((prev) => ({ ...prev, ...promoData }));
    setStep(3);
  };


  const handlePlaceCodOrder = async () => {
  try {
    const res = await fetch('/api/user/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cartItems,
        address: checkoutData.address,
        promoCode: checkoutData.promoCode,
        giftCard: checkoutData.giftCard,
        total: getCartTotal(),
        paymentMethod: 'COD',
      }),
    });

    await clearCart();
    const data = await res.json();
    if(res.ok) {
    const { orderId, vendorId } = data;
    await fetch('/api/user/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vendorId,
      type: 'ORDER_PLACED',
      content: `order ${orderId} has been placed.`,
    }),
  });
      router.push(`/order/confirmation/${orderId}`);
    }
    else {alert('Something went wrong while placing the order.');}
  } catch (err) {
    console.error('Order placement failed:', err);
    alert('Something went wrong while placing the order.');
  }
};


  const renderStepIndicator = () => {
    const steps = ['Address', 'Promo', 'Summary', 'Payment'];

    return (
      <div className="flex justify-between items-center relative mb-10">
        {steps.map((label, idx) => {
          const number = idx + 1;
          const isActive = step === number;
          const isCompleted = step > number;

          return (
            <div key={idx} className="flex-1 flex flex-col items-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300
                  ${isCompleted ? 'bg-indigo-600' : isActive ? 'bg-indigo-400' : 'bg-gray-300'}`}
              >
                {number}
              </div>
              <span className={`mt-2 text-sm font-medium ${isActive ? 'text-indigo-700' : 'text-gray-500'}`}>
                {label}
              </span>
              {idx < steps.length - 1 && (
                <div className="absolute top-5 w-full h-1 -z-1">
                  <div
                    className={`absolute left-1/2 transform -translate-x-0.5 h-1 w-full ${
                      step > number ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderSummary = () => (
  <div className="space-y-6 ">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-indigo-700">Order Summary</h2>
      <button
        onClick={() => {
          setCheckoutData((prev) => ({ ...prev, promoCode: '', giftCard: '' }));
        }}
        className="text-sm font-medium text-indigo-600 bg-indigo-100 px-3 py-1 rounded hover:bg-indigo-200 transition"
      >
        Skip Promo
      </button>
    </div>

    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 space-y-6">
      {/* Address */}
      <div className="flex items-start gap-3">
        <MapPinIcon className="w-5 h-5 text-indigo-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-700">Shipping Address</h4>
          {checkoutData.address ? (
            <div className="text-sm text-gray-600 leading-5">
              <p>{checkoutData.address.street}</p>
              <p>{checkoutData.address.city}, {checkoutData.address.state}</p>
              <p>{checkoutData.address.country} - {checkoutData.address.zipCode}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No address selected</p>
          )}
        </div>
      </div>

      {/* Promo Code */}
      <div className="flex items-start gap-3 border-t border-gray-500 pt-6">
        <TagIcon className="w-5 h-5 text-indigo-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-700">Promo Code</h4>
          {checkoutData.promoCode ? (
            <p className="text-sm text-green-600">{checkoutData.promoCode}</p>
          ) : (
            <p className="text-sm text-gray-400">No promo code applied</p>
          )}
        </div>
      </div>

      {/* Total */}
      <div className="flex items-start gap-3 border-t border-gray-500 pt-4">
        <CurrencyRupeeIcon className="w-5 h-5 text-indigo-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Total</h4>
          <p className="text-xl font-bold text-indigo-600">
            ₹{getCartTotal().toFixed(2)}
          </p>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="border-t border-gray-500 pt-6 space-y-4">
        <label className="text-sm font-medium text-gray-700 block mb-1">
          Select Payment Method
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Razorpay */}
          <button
            type="button"
            onClick={() =>
              setCheckoutData((prev) => ({ ...prev, paymentMethod: 'razorpay' }))
            }
            className={`w-full p-4 rounded-lg border transition flex items-start gap-4 text-left ${
              checkoutData.paymentMethod === 'razorpay'
                ? 'bg-indigo-50 border-indigo-500'
                : 'bg-white border-gray-300'
            }`}
          >
            <CreditCardIcon className="w-6 h-6 text-indigo-600 mt-1" />
            <div>
              <p className="font-semibold text-gray-800">Razorpay</p>
              <p className="text-sm text-gray-500">
                Pay using UPI, Cards, Net Banking, and more.
              </p>
            </div>
          </button>

          {/* COD */}
          <button
            type="button"
            onClick={() =>
              setCheckoutData((prev) => ({ ...prev, paymentMethod: 'cod' }))
            }
            className={`w-full p-4 rounded-lg border transition flex items-start gap-4 text-left ${
              checkoutData.paymentMethod === 'cod'
                ? 'bg-indigo-50 border-indigo-500'
                : 'bg-white border-gray-300'
            }`}
          >
            <TruckIcon className="w-6 h-6 text-indigo-600 mt-1" />
            <div>
              <p className="font-semibold text-gray-800">Pay on Delivery</p>
              <p className="text-sm text-gray-500">
                Pay in cash or online when your order arrives.
              </p>
            </div>
          </button>
        </div>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row justify-between gap-4 pt-6">
          <button
            onClick={() => setStep(2)}
            className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg transition"
          >
            ← Back
          </button>
          <button
            onClick={() => {
              if (!checkoutData.paymentMethod) {
                alert('Please select a payment method');
                return;
              }
              setStep(4);
            }}
            className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg transition"
          >
            Proceed to Payment →
          </button>
        </div>
      </div>
    </div>
  </div>
);


  return (
  <UserDashboardLayout>
    <div className="max-w-7xl mx-auto px-4 py-8">
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

      {/* Grid layout for left product preview and right step content */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: Cart Item Preview */}
        <div className="hidden md:block bg-white shadow rounded-lg p-4 space-y-4 h-fit">
          <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-500 pb-2">Your Items</h2>
          {cartItems.map((item) => (
            <div key={`${item.productId}-${item.variantId}`} className="flex items-center gap-3">
              <div className="relative w-16 h-16 rounded overflow-hidden border">
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">{item.product.name}</p>
                <p className="text-xs text-gray-500">x{item.quantity} • ₹{item.variant.price}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Checkout Steps */}
        <div className="md:col-span-2 md:bg-white md:shadow-md rounded-lg p-6 space-y-6">
          {renderStepIndicator()}
          {step === 1 && <AddressForm onSubmit={handleAddressSubmit} />}
          {step === 2 && <PromoCode onSubmit={handlePromoSubmit} onBack={() => setStep(1)} />}
          {step === 3 && renderSummary()}
          {step === 4 && (
            <>
              {checkoutData.paymentMethod === 'razorpay' && (
                <RazorpayForm
                  checkoutData={{
                    ...checkoutData,
                    items: cartItems,
                    total: getCartTotal(),
                  }}
                  onBack={() => setStep(3)}
                />
              )}
              {checkoutData.paymentMethod === 'cod' && (
                <PayOnDeliveryForm
                  checkoutData={{
                    ...checkoutData,
                    items: cartItems,
                    total: getCartTotal(),
                  }}
                  onBack={() => setStep(3)}
                  onConfirm={handlePlaceCodOrder}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  </UserDashboardLayout>
);

};

export default CheckoutPage;
