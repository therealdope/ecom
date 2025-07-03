'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaStore, FaMapMarkerAlt, FaPhone, FaInfoCircle, FaTimes } from 'react-icons/fa';

export default function AddShopForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: ''
  });

  const handleClose = () => {
    router.back();
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const validationErrors = {};
    if (!formData.name) validationErrors.name = 'Shop name is required';
    if (!formData.description) validationErrors.description = 'Description is required';
    if (!formData.address) validationErrors.address = 'Address is required';
    if (!formData.phone) validationErrors.phone = 'Phone number is required';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/vendor/shops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to create shop');
      }

      router.push('/vendor/dashboard');
    } catch (error) {
      console.error('Error creating shop:', error);
      setErrors({ submit: 'Failed to create shop. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative max-w-3xl mx-auto md:mt-12 p-6 sm:p-6 lg:p-8 rounded-lg md:border md:shadow-sm md:border-gray-200">
      {/* Close Icon */}
      <button
        onClick={handleClose}
        className="absolute top-8 right-8 text-gray-400 hover:text-gray-500"
        aria-label="Close"
      >
        <FaTimes size={20} />
      </button>
      

      <h1 className="text-2xl font-bold text-gray-800 mb-8 text-left">Create New Shop</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Shop Name */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <FaStore /> Shop Name
          </label>
          <input
            type="text"
            placeholder="Enter shop name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-4 py-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
        </div>

        {/* Description */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <FaInfoCircle /> Description
          </label>
          <textarea
            rows={3}
            placeholder="Describe your shop and offerings"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className={`w-full px-4 py-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
        </div>

        {/* Address */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <FaMapMarkerAlt /> Address
          </label>
          <textarea
            rows={2}
            placeholder="Enter shop address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className={`w-full px-4 py-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address}</p>}
        </div>

        {/* Phone Number */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <FaPhone /> Phone Number
          </label>
          <input
            type="tel"
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className={`w-full px-4 py-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
        </div>

        {/* Submit error */}
        {errors.submit && <p className="text-sm text-red-600">{errors.submit}</p>}

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-indigo-500 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Shop'}
          </button>
        </div>
      </form>
    </div>
  );
}
