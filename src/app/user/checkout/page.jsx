'use client'

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import AddressForm from '@/components/user/checkout/AddressForm';
import PromoCode from '@/components/user/checkout/PromoCode';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from '@/components/user/checkout/PaymentForm';

// Initialize Stripe (place this outside the component)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const CheckoutPage = () => {
  const { data: session } = useSession();
  const [step, setStep] = useState('address'); // address, promo, payment
  const [checkoutData, setCheckoutData] = useState({
    address: null,
    promoCode: null,
    giftCard: null
  });

  const handleAddressSubmit = (addressData) => {
    setCheckoutData(prev => ({ ...prev, address: addressData }));
    setStep('promo');
  };

  const handlePromoSubmit = (promoData) => {
    setCheckoutData(prev => ({ ...prev, ...promoData }));
    setStep('payment');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="steps mb-8">
        <div className={`step ${step === 'address' ? 'active' : ''}`}>Address</div>
        <div className={`step ${step === 'promo' ? 'active' : ''}`}>Promotions</div>
        <div className={`step ${step === 'payment' ? 'active' : ''}`}>Payment</div>
      </div>

      {step === 'address' && (
        <AddressForm onSubmit={handleAddressSubmit} />
      )}

      {step === 'promo' && (
        <PromoCode 
          onSubmit={handlePromoSubmit}
          onBack={() => setStep('address')}
        />
      )}

      {step === 'payment' && (
        <Elements stripe={stripePromise}>
          <PaymentForm />
        </Elements>
      )}
    </div>
  );
};

export default CheckoutPage;