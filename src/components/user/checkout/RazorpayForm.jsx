'use client';

import { useEffect } from 'react';
import { useCart } from '@/context/CartContext';

const RazorpayForm = ({ checkoutData, onBack }) => {
  const { cartItems, getCartTotal } = useCart();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handlePayment = async () => {
    const orderRes = await fetch('/api/payment/razorpay-order', {
      method: 'POST',
      body: JSON.stringify({
        items: cartItems,
        address: checkoutData.address,
        promoCode: checkoutData.promoCode,
        giftCard: checkoutData.giftCard,
        total: getCartTotal(),
      }),
    });

    const order = await orderRes.json();

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,
      name: 'Your Store',
      description: 'Complete your purchase',
      handler: function (response) {
        // You can verify the payment here or redirect
        console.log('Payment success:', response);
        window.location.href = `/order/confirmation/${order.receipt}`;
      },
      prefill: {
        name: checkoutData.address.name || 'Guest',
        email: 'customer@example.com',
      },
      theme: {
        color: '#6366f1',
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-indigo-700">Secure Payment</h2>
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg"
        >
          ← Back
        </button>
        <button
          onClick={handlePayment}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg"
        >
          Pay ₹{getCartTotal().toFixed(2)}
        </button>
      </div>
    </div>
  );
};

export default RazorpayForm;
