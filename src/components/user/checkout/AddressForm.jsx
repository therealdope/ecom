'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const AddressForm = ({ onSubmit }) => {
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
  });

  useEffect(() => {
    setLoading(true);
    const fetchAddresses = async () => {
      try {
        const res = await fetch('/api/user/address');
        const data = await res.json();
        setAddresses(data);
        const defaultAddr = data.find((addr) => addr.isDefault);
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      } catch (err) {
        console.error('Error fetching addresses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, [session]);

  const handleSelect = (id) => {
    setSelectedAddressId(id);
    setShowNewForm(false);
  };

  const handleSaveNewAddress = async () => {
    setLoading(true);
    const isEmpty = Object.values(newAddress).some((val) => !val.trim());
    if (isEmpty) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const res = await fetch('/api/user/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAddress }),
      });

      const saved = await res.json();
      setAddresses((prev) => [...prev, saved]);
      setSelectedAddressId(saved.id);
      setShowNewForm(false);
      setNewAddress({ street: '', city: '', state: '', country: '', zipCode: '' });
    } catch (error) {
      console.error('Address save failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const selected = addresses.find((a) => a.id === selectedAddressId);
    if (!selected) {
      alert('Please select or save an address.');
      return;
    }
    onSubmit(selected);
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white border border-gray-200 shadow-sm rounded-lg p-6"
    >
      <div className="flex flex-col gap-4 md:flex-row items-center justify-between">
        <h2 className="text-2xl font-bold text-indigo-700">Shipping Address</h2>
        <button
          type="button"
          onClick={() => {
            setSelectedAddressId(null);
            setShowNewForm((prev) => !prev);
          }}
          className="text-sm font-medium text-indigo-600 bg-indigo-100 px-3 py-1 rounded hover:bg-indigo-200 transition"
        >
          {showNewForm ? 'Cancel' : 'Add Address'}
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-gray-50 border border-gray-300 rounded p-4 cursor-pointer transition ${
                selectedAddressId === address.id
                  ? 'bg-indigo-100 border-indigo-500'
                  : 'hover:bg-indigo-50'
              }`}
              onClick={() => handleSelect(address.id)}
            >
              <p className="text-sm text-gray-700">{address.street}</p>
              <p className="text-sm text-gray-700">
                {address.city}, {address.state}
              </p>
              <p className="text-sm text-gray-700">
                {address.country} - {address.zipCode}{' '}
                {address.isDefault && <span className="text-indigo-600 font-semibold">Default</span>}
              </p>
            </div>
          ))}
        </div>
      )}

      {showNewForm && (
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Add New Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Street"
              value={newAddress.street}
              onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
              className="p-3 border border-gray-300 rounded bg-indigo-50"
            />
            <input
              type="text"
              placeholder="City"
              value={newAddress.city}
              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
              className="p-3 border border-gray-300 rounded bg-indigo-50"
            />
            <input
              type="text"
              placeholder="State"
              value={newAddress.state}
              onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
              className="p-3 border border-gray-300 rounded bg-indigo-50"
            />
            <input
              type="text"
              placeholder="Country"
              value={newAddress.country}
              onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
              className="p-3 border border-gray-300 rounded bg-indigo-50"
            />
            <input
              type="text"
              placeholder="Zip Code"
              value={newAddress.zipCode}
              onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
              className="p-3 border border-gray-300 rounded bg-indigo-50"
            />
          </div>

          <div className="mt-4 text-right">
            <button
              type="button"
              onClick={handleSaveNewAddress}
              className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
            >
              Save Address
            </button>
          </div>
        </div>
      )}

      {selectedAddressId && (
        <div className="pt-4 text-right mt-4">
          <button
            type="submit"
            className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg transition"
          >
            Continue to Promotions →
          </button>
        </div>
      )}
    </form>
  );
};

export default AddressForm;
