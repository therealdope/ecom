'use client';

import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { TruckIcon } from '@heroicons/react/24/outline';
import { useToast } from '@/context/ToastContext';
import Loader from '@/components/shared/Loader';
import { useState } from 'react';

const PayOnDeliveryForm = ({ checkoutData, onBack }) => {
  const { clearCart } = useCart();
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...checkoutData,
          paymentMethod: 'cod',
        }),
      });

    await clearCart();
    const data = await res.json();
    if(res.ok) {
      const { orders } = data;

      await Promise.all(
        orders.map(({ vendorId, orderId }) =>
          fetch('/api/user/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              vendorId,
              type: 'ORDER_PLACED',
              content: `Order ${orderId} has been placed.`,
            }),
          })
        )
      );
      router.push(`/user/dashboard`);
      showToast({
        title: 'Order Placed',
        description: 'Your order has been placed successfully.',
      });
    }
    } catch (err) {
      alert('Something went wrong while placing your order.');
    }
  };

  if(loading) {
    return <Loader/>
  }


  return (
    <div className="space-y-6 bg-white border border-gray-200 shadow-sm rounded-lg p-6">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-indigo-700">Pay on Delivery</h2>
      </div>

      <p className="text-gray-600 text-sm leading-relaxed">
        You’ll pay in cash or online when the order is delivered to your shipping address.
      </p>

      <div className="flex flex-col md:flex-row justify-between gap-4 pt-6">
        <button
          onClick={onBack}
          className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg transition"
        >
          ← Back
        </button>
        <button
          onClick={handleConfirm}
          className="flex gap-2 text-sm bg-indigo-600 hover:bg-indigo-700 justify-center text-white px-5 py-2 rounded-lg transition"
        >
          Confirm Order <TruckIcon className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
};

export default PayOnDeliveryForm;
