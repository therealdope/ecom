'use client';

import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

const PayOnDeliveryForm = ({ checkoutData, onBack }) => {
  const { clearCart } = useCart();
  const router = useRouter();

  const handleConfirm = async () => {
    try {
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

      if (!res.ok) {
        alert('Failed to place order. Try again.');
        return;
      }

      const { orderId } = await res.json();
      await clearCart();
      router.push(`/user/order/confirmation/${orderId}`);
    } catch (err) {
      alert('Something went wrong while placing your order.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-indigo-700">Pay on Delivery</h2>
      <p className="text-gray-600">You’ll pay when the order is delivered to your address.</p>

      <div className="flex flex-col md:flex-row justify-between gap-4 pt-4">
        <button
          onClick={onBack}
          className="w-full md:w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg"
        >
          ← Back
        </button>
        <button
          onClick={handleConfirm}
          className="w-full md:w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg"
        >
          Confirm Order
        </button>
      </div>
    </div>
  );
};

export default PayOnDeliveryForm;
