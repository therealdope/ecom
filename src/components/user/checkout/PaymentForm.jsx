import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

const PaymentForm = ({ checkoutData, onBack }) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { cartItems, getCartTotal } = useCart();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      // Create order first
      const orderResponse = await fetch('/api/user/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          address: checkoutData.address,
          promoCode: checkoutData.promoCode,
          giftCard: checkoutData.giftCard,
          total: getCartTotal()
        })
      });

      const { orderId } = await orderResponse.json();

      // Create payment intent
      const { clientSecret } = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      }).then(res => res.json());

      // Confirm payment
      const { error: paymentError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/order/confirmation/${orderId}`,
        },
      });

      if (paymentError) {
        setError(paymentError.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <PaymentElement />

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 bg-gray-200 py-2 rounded-lg"
            disabled={processing}
          >
            Back
          </button>
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg disabled:bg-gray-400"
            disabled={!stripe || processing}
          >
            {processing ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;