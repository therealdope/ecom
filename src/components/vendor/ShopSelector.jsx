import { useEffect, useState } from 'react';
import { useShop } from '@/context/ShopContext';

export default function ShopSelector() {
  const [shops, setShops] = useState([]);
  const { selectedShop, setSelectedShop } = useShop();
  const defaultSet = useRef(false);
  useEffect(() => {
    // Fetch vendor's shops
    fetch('/api/vendor/shops')
      .then(res => res.json())
      .then(data => {
        const allShopsOption = { id: 'all', name: 'All Shops' };
        const updatedShops = [allShopsOption, ...data];
        setShops(updatedShops);
  
        // Set default selected shop only if not set
        if (!selectedShop && !defaultSet.current) {
          setSelectedShop(allShopsOption); // ensure it's set
          defaultSet.current = true;
        }
      });
  }, []);
  

  return (
    <select 
      value={selectedShop?.id || ''}
      onChange={(e) => {
        const shop = shops.find(s => s.id === e.target.value);
        setSelectedShop(shop);
      }}
      className="border rounded px-2 py-1"
    >
      {shops.map(shop => (
        <option key={shop.id} value={shop.id}>
          {shop.name}
        </option>
      ))}
    </select>
  );
}