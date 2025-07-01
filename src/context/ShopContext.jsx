import React, { createContext, useContext, useEffect, useState } from 'react';

const ShopContext = createContext(null);

export function ShopProvider({ children }) {
  const [selectedShop, setSelectedShop] = useState(null); //save details of shop selected
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  useEffect(() => {
    const fetchUnreadNotificationCount = async () => {
      try {
        const response = await fetch('/api/vendor/notifications/unread-count');
        const data = await response.json();
        setUnreadNotificationCount(data.count);
      } catch (error) {
        console.error('Failed to fetch unread notification count:', error);
      }
    };

    fetchUnreadNotificationCount();
  }, []);

  const setUnreadNotification = (count) => {
    setUnreadNotificationCount(count);
  };

  return (
    <ShopContext.Provider value={{ selectedShop, setSelectedShop, unreadNotificationCount, setUnreadNotification }}>
      {children}
    </ShopContext.Provider>
  );
}

export const useShop = () => useContext(ShopContext);