import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const CustomerSessionContext = createContext(undefined);

function cloneCart(cart) {
  return Object.entries(cart).reduce((acc, [itemId, entry]) => {
    acc[itemId] = { ...entry };
    return acc;
  }, {});
}

export function CustomerSessionProvider({ children }) {
  const [restaurantId, setRestaurantId] = useState(null);
  const [cart, setCart] = useState({});
  const [searchAddress, setSearchAddress] = useState('');

  const selectRestaurant = useCallback((nextRestaurantId) => {
    setRestaurantId((previous) => {
      if (previous === nextRestaurantId) {
        return previous;
      }
      setCart({});
      return nextRestaurantId;
    });
  }, []);

  const clearSession = useCallback(() => {
    setRestaurantId(null);
    setCart({});
    setSearchAddress('');
  }, []);

  const setAddressFromSearch = useCallback((address) => {
    setSearchAddress(address);
  }, []);

  const incrementItem = useCallback((item) => {
    setCart((prev) => {
      const next = cloneCart(prev);
      const available = item.available !== false;
      if (!next[item.id]) {
        next[item.id] = {
          itemId: item.id,
          name: item.name,
          price: item.price,
          available,
          quantity: 0,
        };
      }
      next[item.id].available = available;
      next[item.id].quantity += 1;
      return next;
    });
  }, []);

  const decrementItem = useCallback((itemId) => {
    setCart((prev) => {
      if (!prev[itemId]) return prev;
      const next = cloneCart(prev);
      next[itemId].quantity -= 1;
      if (next[itemId].quantity <= 0) {
        delete next[itemId];
      }
      return next;
    });
  }, []);

  const setItemQuantity = useCallback((item, quantity) => {
    setCart((prev) => {
      const next = cloneCart(prev);
      if (quantity <= 0) {
        delete next[item.id];
        return next;
      }
      next[item.id] = {
        itemId: item.id,
        name: item.name,
        price: item.price,
        available: item.available !== false,
        quantity,
      };
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({});
  }, []);

  const cartEntries = useMemo(() => Object.values(cart), [cart]);

  const itemCount = useMemo(
    () => cartEntries.reduce((count, entry) => count + entry.quantity, 0),
    [cartEntries]
  );

  const subtotal = useMemo(
    () => cartEntries.reduce((sum, entry) => sum + entry.quantity * entry.price, 0),
    [cartEntries]
  );

  const hasItems = itemCount > 0;

  const value = useMemo(
    () => ({
      restaurantId,
      selectRestaurant,
      cartEntries,
      itemCount,
      subtotal,
      incrementItem,
      decrementItem,
      setItemQuantity,
      clearCart,
      clearSession,
      searchAddress,
      setAddressFromSearch,
      hasItems,
    }),
    [
      cartEntries,
      clearCart,
      clearSession,
      decrementItem,
      incrementItem,
      itemCount,
      restaurantId,
      selectRestaurant,
      setItemQuantity,
      subtotal,
      searchAddress,
      setAddressFromSearch,
      hasItems,
    ]
  );

  return <CustomerSessionContext.Provider value={value}>{children}</CustomerSessionContext.Provider>;
}

export function useCustomerSession() {
  const context = useContext(CustomerSessionContext);
  if (!context) {
    throw new Error('useCustomerSession must be used within a CustomerSessionProvider');
  }
  return context;
}
