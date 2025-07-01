import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.productId === productId);
  };

  const toggleWishlist = async (productId) => {
    if (!session?.user?.id) return;

    const alreadyInWishlist = isInWishlist(productId);

    // 1. Optimistically update wishlist
    setWishlistItems((prev) =>
      alreadyInWishlist
        ? prev.filter(item => item.productId !== productId)
        : [...prev, { productId }]
    );

    // 2. Sync with backend
    try {
      const method = alreadyInWishlist ? 'DELETE' : 'POST';
      const response = await fetch(`/api/user/wishlist/${productId}`, {
        method,
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      if (response.ok) {
        setWishlistItems(data); // resync from backend
      } else {
        console.error('Failed to update wishlist:', data.error);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  useEffect(() => {
  const fetchUserData = async () => {
    if (session?.user?.id) {
      try {
        const cartResponse = await fetch(`/api/user/cart`);
        const cartData = await cartResponse.json();
        if (cartResponse.ok) setCartItems(cartData);

        const wishlistResponse = await fetch(`/api/user/wishlist`);
        const wishlistData = await wishlistResponse.json();
        if (wishlistResponse.ok) setWishlistItems(wishlistData);

        // 🔔 Fetch unread notifications
        const notificationResponse = await fetch(`/api/user/notifications/unread-count`);
        const { count } = await notificationResponse.json();
        if (notificationResponse.ok) setUnreadNotificationCount(count);

      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    } else {
      setCartItems([]);
      setWishlistItems([]);
      setUnreadNotificationCount(0);
    }
  };

  fetchUserData();
}, [session]);


  const addToCart = async (product, variant) => {
    if (!session?.user?.id) return;

    // Optimistically update cart
    setCartItems(prev => {
      const exists = prev.find(item => item.productId === product.id && item.variantId === variant.id);
      if (exists) {
        return prev.map(item =>
          item.productId === product.id && item.variantId === variant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId: product.id, variantId: variant.id, quantity: 1, product, variant }];
    });

    // Sync with backend
    try {
      const response = await fetch('/api/user/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          variantId: variant.id,
          quantity: 1
        })
      });

      const data = await response.json();
      if (response.ok) {
        setCartItems(data); // Resync
      } else {
        console.error('Failed to add to cart:', data.error);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const setUnreadNotification = (count) => {
    setUnreadNotificationCount(count);
  };

  const removeFromCart = async (productId, variantId) => {
    if (!session?.user?.id) return;

    // Optimistically remove item
    setCartItems(prev =>
      prev.filter(item => !(item.productId === productId && item.variantId === variantId))
    );

    // Sync with backend
    try {
      const response = await fetch(`/api/user/cart/${productId}/${variantId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (response.ok) {
        setCartItems(data); // Resync
      } else {
        console.error('Failed to remove from cart:', data.error);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateCartItemQuantity = async (productId, variantId, newQuantity) => {
    if (!session?.user?.id) return;

    if (newQuantity < 1) {
      setCartItems(prev =>
        prev.filter(item => !(item.productId === productId && item.variantId === variantId))
      );
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }

    try {
      const response = await fetch(`/api/user/cart/${productId}/${variantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity })
      });

      const data = await response.json();
      if (response.ok) {
        setCartItems(data); // Resync
      } else {
        console.error('Failed to update cart:', data.error);
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.variant.price * item.quantity);
    }, 0);
  };

  const clearCart = async () => {
    try {
      setCartItems([]); // Optimistically clear
      const response = await fetch('/api/user/cart/clear', {
        method: 'DELETE'
      });

      if (!response.ok) {
        console.error('Failed to clear cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      wishlistItems,
      setCartItems,
      setWishlistItems,
      addToCart,
      removeFromCart,
      updateCartItemQuantity,
      toggleWishlist,
      isInWishlist,
      getCartTotal,
      clearCart,
      unreadNotificationCount,
      setUnreadNotification,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return {
    cartItems: context.cartItems,
    wishlistItems: context.wishlistItems,
    addToCart: context.addToCart,
    removeFromCart: context.removeFromCart,
    updateCartItemQuantity: context.updateCartItemQuantity,
    toggleWishlist: context.toggleWishlist,
    isInWishlist: context.isInWishlist,
    getCartTotal: context.getCartTotal,
    clearCart: context.clearCart,
    unreadNotificationCount: context.unreadNotificationCount,
    setUnreadNotification: context.setUnreadNotification,
  };
}
