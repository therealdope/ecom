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

    const { orderId } = await res.json();

    await clearCart();

    router.push(`/order/confirmation/${orderId}`);
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
                  ${isCompleted ? 'bg-green-500' : isActive ? 'bg-indigo-600' : 'bg-gray-300'}`}
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
                      step > number ? 'bg-green-500' : 'bg-gray-300'
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
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-indigo-700">Order Summary</h3>

      <div className="bg-white shadow-sm border rounded-lg p-6 space-y-4">
        <div className="space-y-1">
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

        <div className="border-t pt-4 space-y-1">
          <h4 className="text-sm font-medium text-gray-700">Promo Code</h4>
          {checkoutData.promoCode ? (
            <p className="text-sm text-green-600">{checkoutData.promoCode}</p>
          ) : (
            <p className="text-sm text-gray-400">No promo code applied</p>
          )}
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Total</h4>
          <p className="text-xl font-bold text-indigo-600">₹{getCartTotal().toFixed(2)}</p>
        </div>

        <div className="border-t pt-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Select Payment Method</label>
            <div className="flex gap-4">
              <button
                className={`w-full py-2 px-4 rounded-lg border transition ${
                  checkoutData.paymentMethod === 'razorpay'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
                onClick={() =>
                  setCheckoutData((prev) => ({ ...prev, paymentMethod: 'razorpay' }))
                }
              >
                Razorpay
              </button>
              <button
                className={`w-full py-2 px-4 rounded-lg border transition ${
                  checkoutData.paymentMethod === 'cod'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
                onClick={() =>
                  setCheckoutData((prev) => ({ ...prev, paymentMethod: 'cod' }))
                }
              >
                Pay on Delivery
              </button>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <button onClick={() => setStep(2)} className="text-sm text-indigo-600 hover:underline">
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg transition"
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        {renderStepIndicator()}
        <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
          {step === 1 && <AddressForm onSubmit={handleAddressSubmit} />}
          {step === 2 && <PromoCode onSubmit={handlePromoSubmit} onBack={() => setStep(1)} />}
          {step === 3 && renderSummary()}
          {step === 4 && (
            <>
              {checkoutData.paymentMethod === 'razorpay' && (
                <RazorpayForm
                  checkoutData={{
                    ...checkoutData,
                    items:cartItems,
                    total: getCartTotal(),
                  }}
                  onBack={() => setStep(3)}
                />
              )}
              {checkoutData.paymentMethod === 'cod' && (
                <PayOnDeliveryForm
                  checkoutData={{
                    ...checkoutData,
                    items:cartItems,
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
    </UserDashboardLayout>
  );
};

export default CheckoutPage;
