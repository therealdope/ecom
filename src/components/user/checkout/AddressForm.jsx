'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const AddressForm = ({ onSubmit }) => {
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: ''
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await fetch('/api/user/address');
        const data = await res.json();
        setAddresses(data);

        // Auto-select default address
        const defaultAddr = data.find(addr => addr.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        }
      } catch (err) {
        console.error('Error fetching addresses:', err);
      }
    };

    if (session?.user?.id) fetchAddresses();
  }, [session]);

  const handleSelect = (id) => {
    setSelectedAddressId(id);
    setShowNewForm(false);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (selectedAddressId) {
    const address = addresses.find(a => a.id === selectedAddressId);
    onSubmit(address);
    return;
  }

  if (!showNewForm) {
    alert("Please select an address or add a new one.");
    return;
  }

  const isEmpty = Object.values(newAddress).some(val => !val.trim());
  if (isEmpty) {
    alert("Please fill in all fields for the new address.");
    return;
  }

  try {
    const res = await fetch('/api/user/address', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newAddress }),
    });

    const saved = await res.json();
    onSubmit(saved);
  } catch (error) {
    console.error('Address save failed:', error);
  }
};


  return (
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
        {addresses.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Saved Addresses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`border rounded-md p-4 cursor-pointer transition ${
                    selectedAddressId === address.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'hover:border-indigo-300'
                  }`}
                  onClick={() => handleSelect(address.id)}
                >
                  <p className="text-sm">{address.street}</p>
                  <p className="text-sm">{address.city}, {address.state}</p>
                  <p className="text-sm">{address.country} - {address.zipCode}</p>
                  {address.isDefault && <span className="text-xs text-green-600">Default</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setSelectedAddressId(null);
              setShowNewForm(prev => !prev);
            }}
            className="text-indigo-600 hover:underline"
          >
            {showNewForm ? 'Cancel New Address' : 'Add New Address'}
          </button>
        </div>

        {showNewForm && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Add New Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Street"
                value={newAddress.street}
                onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                className="p-2 border rounded"
              />
              <input
                type="text"
                placeholder="City"
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                className="p-2 border rounded"
              />
              <input
                type="text"
                placeholder="State"
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                className="p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Country"
                value={newAddress.country}
                onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                className="p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Zip Code"
                value={newAddress.zipCode}
                onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                className="p-2 border rounded"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          Continue to Promotions
        </button>
      </form>
  );
};

export default AddressForm;
