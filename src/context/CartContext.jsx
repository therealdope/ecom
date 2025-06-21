import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.productId === productId);
  };

  const toggleWishlist = async (productId) => {
    if (!session?.user?.id) return;

    try {
      const method = isInWishlist(productId) ? 'DELETE' : 'POST';
      const response = await fetch(`/api/user/wishlist/${productId}`, {
        method,
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to update wishlist');
      }

      const data = await response.json();
      setWishlistItems(data);
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
};

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

      const data = await response.json();
      
      if (response.ok) {
        setCartItems(data);
      } else {
        console.error('Failed to add to cart:', data.error);
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

      const data = await response.json();
      
      if (response.ok) {
        setCartItems(data);
      } else {
        console.error('Failed to remove from cart:', data.error);
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

      const data = await response.json();
      
      if (response.ok) {
        setCartItems(data);
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
    const response = await fetch('/api/user/cart/clear', {
      method: 'DELETE'
    });

    if (response.ok) {
      setCartItems([]);
    } else {
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
      clearCart
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
    clearCart: context.clearCart

  };
}