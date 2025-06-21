'use client';

import { useState } from 'react';

const PromoCode = ({ onSubmit, onBack }) => {
  const [promoCode, setPromoCode] = useState('');
  const [giftCard, setGiftCard] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ promoCode, giftCard });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-indigo-700">Apply Offers</h2>
        <button
          type="button"
          onClick={() => onSubmit({ promoCode: '', giftCard: '' })}
          className="text-sm text-gray-500 hover:underline"
        >
          Skip this step
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Promo Code
            </label>
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter promo code"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gift Card
            </label>
            <input
              type="text"
              value={giftCard}
              onChange={(e) => setGiftCard(e.target.value)}
              placeholder="Enter gift card number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="w-full md:w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition"
          >
            ← Back
          </button>
          <button
            type="submit"
            className="w-full md:w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition"
          >
            Continue to Summary →
          </button>
        </div>
      </form>
    </div>
  );
};

export default PromoCode;
