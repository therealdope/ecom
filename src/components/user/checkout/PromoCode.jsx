'use client';

import { useState } from 'react';

const PromoCode = ({ onSubmit, onBack }) => {
  const [promoCode, setPromoCode] = useState('');
  const [giftCard, setGiftCard] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Skip promo since it's not implemented
    onSubmit({ promoCode: '', giftCard: '' });
  };

  return (
    <div className="space-y-6 bg-white border border-gray-200 shadow-sm rounded-lg p-6">
      <div className="flex flex-col gap-4 md:flex-row items-center justify-between">
        <h2 className="text-2xl font-bold text-indigo-700">Apply Offers</h2>
        <button
          type="button"
          onClick={handleSubmit}
          className="text-sm font-medium text-indigo-600 bg-indigo-100 px-3 py-1 rounded hover:bg-indigo-200 transition"
        >
          Skip This Step →
        </button>
      </div>

      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-sm opacity-60 pointer-events-none">
        <p className="text-sm text-gray-500 mb-4">
          Promo code and gift card functionality is coming soon. You can skip this step.
        </p>

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
              disabled
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
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
              disabled
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4 pt-6">
        <button
          type="button"
          onClick={onBack}
          className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg transition"
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg transition"
        >
          Continue to Summary →
        </button>
      </div>
    </div>
  );
};

export default PromoCode;
