import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { cartAPI } from '../services/api';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load cart from localStorage if guest
  useEffect(() => {
    if (!user) {
      const savedCart = localStorage.getItem('guestCart');
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart));
        } catch (err) {
          console.error('Error loading guest cart:', err);
        }
      }
    }
  }, []);

  // Fetch cart from server if user is logged in
  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  // Save guest cart to localStorage
  useEffect(() => {
    if (!user) {
      localStorage.setItem('guestCart', JSON.stringify(items));
    }
  }, [items, user]);

  const fetchCart = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await cartAPI.get();
      setItems(response.data.cart.items || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addToCart = useCallback(async (productId, size, quantity = 1) => {
    try {
      setError(null);
      if (user) {
        // Add to server cart
        const response = await cartAPI.add({ productId, size, quantity });
        setItems(response.data.cart.items || []);
      } else {
        // Add to local cart
        const newItem = {
          product: productId,
          size,
          quantity,
          _id: `${productId}-${size}`
        };
        setItems(prev => {
          const existing = prev.find(
            item => item.product === productId && item.size === size
          );
          if (existing) {
            return prev.map(item =>
              item.product === productId && item.size === size
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          }
          return [...prev, newItem];
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add to cart');
      throw err;
    }
  }, [user]);

  const updateCart = useCallback(async (productId, size, quantity) => {
    try {
      setError(null);
      if (user) {
        const response = await cartAPI.update({ productId, size, quantity });
        setItems(response.data.cart.items || []);
      } else {
        setItems(prev =>
          prev.map(item =>
            item.product === productId && item.size === size
              ? { ...item, quantity }
              : item
          )
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update cart');
      throw err;
    }
  }, [user]);

  const removeFromCart = useCallback(async (productId, size) => {
    try {
      setError(null);
      if (user) {
        const response = await cartAPI.remove({ productId, size });
        setItems(response.data.cart.items || []);
      } else {
        setItems(prev =>
          prev.filter(item => !(item.product === productId && item.size === size))
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove item');
      throw err;
    }
  }, [user]);

  const clearCart = useCallback(async () => {
    try {
      setError(null);
      if (user) {
        await cartAPI.clear();
      }
      setItems([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to clear cart');
      throw err;
    }
  }, [user]);

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    items,
    loading,
    error,
    addToCart,
    updateCart,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getCartCount,
    fetchCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};