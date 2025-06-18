import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);

  // Fetch cart and wishlist items when user logs in
  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.id) {
        try {
          // Fetch cart items
          const cartResponse = await fetch(`/api/user/cart`);
          const cartData = await cartResponse.json();
          if (cartResponse.ok) {
            setCartItems(cartData);
          }

          // Fetch wishlist items
          const wishlistResponse = await fetch(`/api/user/wishlist`);
          const wishlistData = await wishlistResponse.json();
          if (wishlistResponse.ok) {
            setWishlistItems(wishlistData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        // Clear items when user logs out
        setCartItems([]);
        setWishlistItems([]);
      }
    };

    fetchUserData();
  }, [session]);

  // Add to cart with database integration
  const addToCart = async (product, variant) => {
    if (!session?.user?.id) return;

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

      if (response.ok) {
        const updatedCart = await response.json();
        setCartItems(updatedCart);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  // Remove from cart with database integration
  const removeFromCart = async (productId, variantId) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/user/cart/${productId}/${variantId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCartItems(updatedCart);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  // Update cart item quantity with database integration
  const updateCartItemQuantity = async (productId, variantId, newQuantity) => {
    if (!session?.user?.id) return;

    if (newQuantity < 1) {
      await removeFromCart(productId, variantId);
      return;
    }

    try {
      const response = await fetch(`/api/user/cart/${productId}/${variantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCartItems(updatedCart);
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  // Toggle wishlist with database integration
  const toggleWishlist = async (product) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id })
      });

      if (response.ok) {
        const updatedWishlist = await response.json();
        setWishlistItems(updatedWishlist);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.productId === productId);
  };

  // Get cart total
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      wishlistItems,
      addToCart,
      removeFromCart,
      updateCartItemQuantity,
      toggleWishlist,
      isInWishlist,
      getCartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);