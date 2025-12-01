import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { cartAPI } from '../services/api';
import { productAPI } from '../services/api';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasLoadedInitialCart, setHasLoadedInitialCart] = useState(false);

  // Load guest cart from localStorage on mount (only once)
  useEffect(() => {
    if (!user && !hasLoadedInitialCart) {
      console.log('📦 Loading guest cart from localStorage');
      const savedCart = localStorage.getItem('guestCart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          console.log('✅ Guest cart loaded:', parsedCart);
          setItems(parsedCart);
        } catch (err) {
          console.error('❌ Error loading guest cart:', err);
          localStorage.removeItem('guestCart'); // Clear corrupted data
        }
      }
      setHasLoadedInitialCart(true);
    }
  }, [user, hasLoadedInitialCart]);

  // Save guest cart to localStorage whenever it changes
  useEffect(() => {
    if (!user && hasLoadedInitialCart) {
      console.log('💾 Saving guest cart to localStorage:', items);
      localStorage.setItem('guestCart', JSON.stringify(items));
    }
  }, [items, user, hasLoadedInitialCart]);

  // Handle user login - merge guest cart with server cart
  useEffect(() => {
    if (user && hasLoadedInitialCart) {
      console.log('👤 User logged in - merging carts');
      mergeGuestCartWithUserCart();
    }
  }, [user, hasLoadedInitialCart]);

  // Merge guest cart with user's server cart
  const mergeGuestCartWithUserCart = async () => {
    try {
      setLoading(true);
      
      // Get guest cart from localStorage
      const guestCartJSON = localStorage.getItem('guestCart');
      const guestCartItems = guestCartJSON ? JSON.parse(guestCartJSON) : [];
      
      console.log('🔄 Guest cart items to merge:', guestCartItems);

      if (guestCartItems.length === 0) {
        // No guest items, just fetch server cart
        console.log('📥 No guest items - fetching server cart only');
        await fetchCart();
        return;
      }

      // Add each guest cart item to server cart
      console.log('🔄 Merging guest cart items to server...');
      for (const item of guestCartItems) {
        try {
          await cartAPI.add({
            productId: item.product,
            size: item.size,
            quantity: item.quantity
          });
          console.log(`✅ Added ${item.name} (${item.size}) x${item.quantity} to server cart`);
        } catch (err) {
          console.error(`❌ Failed to add ${item.name}:`, err.response?.data?.message || err.message);
        }
      }

      // Clear guest cart from localStorage
      console.log('🗑️ Clearing guest cart from localStorage');
      localStorage.removeItem('guestCart');

      // Fetch merged cart from server
      console.log('📥 Fetching merged cart from server');
      await fetchCart();

      console.log('✅ Cart merge complete!');

    } catch (err) {
      console.error('❌ Error merging carts:', err);
      setError('Failed to merge cart');
      // Even if merge fails, try to fetch server cart
      await fetchCart();
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart from server
  const fetchCart = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('📥 Fetching cart from server...');
      const response = await cartAPI.get();
      const serverItems = response.data.cart.items || [];
      console.log('✅ Server cart loaded:', serverItems);
      setItems(serverItems);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching cart:', err);
      setError('Failed to load cart');
      setItems([]); // Clear items on error
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Add item to cart
  const addToCart = useCallback(async (productId, size, quantity = 1) => {
    try {
      setError(null);
      console.log(`➕ Adding to cart: Product ${productId}, Size ${size}, Qty ${quantity}`);

      if (user) {
        // User is logged in - add to server cart
        console.log('👤 User logged in - adding to server cart');
        const response = await cartAPI.add({ productId, size, quantity });
        setItems(response.data.cart.items || []);
        console.log('✅ Added to server cart');
      } else {
        // Guest user - add to local cart
        console.log('👻 Guest user - adding to local cart');
        
        // Fetch product details
        const productResponse = await productAPI.getById(productId);
        const product = productResponse.data.product;
        
        const newItem = {
          product: productId,
          size,
          quantity,
          name: product.name,
          price: product.price,
          image: product.image,
          _id: `${productId}-${size}`
        };

        setItems(prev => {
          const existingIndex = prev.findIndex(
            item => item.product === productId && item.size === size
          );

          if (existingIndex > -1) {
            // Item exists - update quantity
            const updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + quantity
            };
            console.log(`✅ Updated quantity in local cart: ${updated[existingIndex].name}`);
            return updated;
          } else {
            // New item - add to cart
            console.log(`✅ Added to local cart: ${newItem.name}`);
            return [...prev, newItem];
          }
        });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add to cart';
      console.error('❌ Add to cart error:', errorMsg);
      setError(errorMsg);
      throw err;
    }
  }, [user]);

  // Update cart item quantity
  const updateCart = useCallback(async (productId, size, quantity) => {
    try {
      setError(null);
      console.log(`🔄 Updating cart: Product ${productId}, Size ${size}, New Qty ${quantity}`);

      if (quantity < 1) {
        console.warn('⚠️ Quantity must be at least 1');
        return;
      }

      if (user) {
        // Update server cart
        const response = await cartAPI.update({ productId, size, quantity });
        setItems(response.data.cart.items || []);
        console.log('✅ Updated server cart');
      } else {
        // Update local cart
        setItems(prev =>
          prev.map(item =>
            item.product === productId && item.size === size
              ? { ...item, quantity }
              : item
          )
        );
        console.log('✅ Updated local cart');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update cart';
      console.error('❌ Update cart error:', errorMsg);
      setError(errorMsg);
      throw err;
    }
  }, [user]);

  // Remove item from cart
  const removeFromCart = useCallback(async (productId, size) => {
    try {
      setError(null);
      console.log(`🗑️ Removing from cart: Product ${productId}, Size ${size}`);

      if (user) {
        // Remove from server cart
        const response = await cartAPI.remove({ productId, size });
        setItems(response.data.cart.items || []);
        console.log('✅ Removed from server cart');
      } else {
        // Remove from local cart
        setItems(prev =>
          prev.filter(item => !(item.product === productId && item.size === size))
        );
        console.log('✅ Removed from local cart');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to remove item';
      console.error('❌ Remove from cart error:', errorMsg);
      setError(errorMsg);
      throw err;
    }
  }, [user]);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    try {
      setError(null);
      console.log('🗑️ Clearing cart');

      if (user) {
        // Clear server cart
        await cartAPI.clear();
        console.log('✅ Server cart cleared');
      } else {
        // Clear local storage
        localStorage.removeItem('guestCart');
        console.log('✅ Local cart cleared');
      }
      
      setItems([]);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to clear cart';
      console.error('❌ Clear cart error:', errorMsg);
      setError(errorMsg);
      throw err;
    }
  }, [user]);

  // Get total price of cart
  const getTotalPrice = () => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return Math.round(total * 100) / 100; // Round to 2 decimal places
  };

  // Get total item count
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

