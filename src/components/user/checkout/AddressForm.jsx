import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const AddressForm = ({ onSubmit }) => {
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: ''
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      const response = await fetch('/api/user/addresses');
      const data = await response.json();
      setAddresses(data);
    };

    if (session?.user?.id) {
      fetchAddresses();
    }
  }, [session]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(selectedAddress || newAddress);
  };

  return (
    <div className="space-y-6">
      {addresses.length > 0 && (
        <div className="saved-addresses space-y-4">
          <h3 className="text-lg font-semibold">Saved Addresses</h3>
          {addresses.map(address => (
            <div 
              key={address.id}
              className={`p-4 border rounded-lg cursor-pointer ${
                selectedAddress?.id === address.id ? 'border-blue-500' : ''
              }`}
              onClick={() => setSelectedAddress(address)}
            >
              <p>{address.street}</p>
              <p>{address.city}, {address.state}</p>
              <p>{address.country} - {address.zipCode}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-lg font-semibold">Add New Address</h3>
        <input
          type="text"
          placeholder="Street Address"
          value={newAddress.street}
          onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
          className="w-full p-2 border rounded"
        />
        {/* Add other address fields similarly */}
        <button 
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg"
        >
          Continue to Promotions
        </button>
      </form>
    </div>
  );
};

export default AddressForm;