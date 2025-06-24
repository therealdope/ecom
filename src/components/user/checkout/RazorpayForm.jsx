'use client';

import { useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { CreditCardIcon } from '@heroicons/react/24/outline';

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
      headers: {
        'Content-Type': 'application/json',
      },
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
      description: 'Complete your purchase securely with Razorpay',
      handler: function (response) {
        window.location.href = `/user/orders/confirmation/${order.receipt}`;
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
      <div className="flex items-center gap-3">
        
        <h2 className="text-2xl font-bold text-indigo-700">Secure Payment</h2>
      </div>

      <p className="text-gray-600 text-sm leading-relaxed">
        You’ll be redirected to Razorpay to complete your payment securely.
      </p>

      <div className="flex flex-col md:flex-row justify-between gap-4 pt-6">
        <button
          onClick={onBack}
          className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg transition"
        >
          ← Back
        </button>
        <button
          onClick={handlePayment}
          className="flex gap-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg transition"
        >
          <CreditCardIcon className="w-5 h-5 text-white" />
          Pay ₹{getCartTotal().toFixed(2)}
        </button>
      </div>
    </div>
  );
};

export default RazorpayForm;
