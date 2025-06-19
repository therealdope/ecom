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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Promo Code</label>
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter promo code"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Gift Card</label>
          <input
            type="text"
            value={giftCard}
            onChange={(e) => setGiftCard(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter gift card number"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 bg-gray-200 py-2 rounded-lg"
          >
            Back
          </button>
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
          >
            Continue to Payment
          </button>
        </div>
      </form>
    </div>
  );
};

export default PromoCode;