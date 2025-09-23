import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const mockRestaurants = [
  {
    id: 'pasta-palace',
    name: 'Pasta Palace',
    cuisine: 'Italian',
    description: 'Handmade pasta dishes and fresh-baked focaccia crafted daily.',
    address: '123 Market Street, Springfield',
    contact: '(555) 212-8876',
    averagePrepTime: '20-30 minutes',
    hours: {
      mon: { open: '10:30', close: '21:30' },
      tue: { open: '10:30', close: '21:30' },
      wed: { open: '10:30', close: '21:30' },
      thu: { open: '10:30', close: '22:00' },
      fri: { open: '10:30', close: '22:00' },
      sat: { open: '11:00', close: '22:00' },
      sun: { open: '11:00', close: '20:30' },
    },
    menu: [
      {
        id: 'rigatoni-bolognese',
        name: 'Rigatoni Bolognese',
        description: 'Slow-simmered beef ragù tossed with al dente rigatoni and parmesan.',
        price: 16.5,
        category: 'Pasta',
      },
      {
        id: 'lemon-burrata',
        name: 'Lemon Burrata Salad',
        description: 'Creamy burrata with charred lemon, arugula, and toasted pine nuts.',
        price: 12,
        category: 'Starters',
      },
      {
        id: 'truffle-gnocchi',
        name: 'Truffle Gnocchi',
        description: 'Potato gnocchi finished in a black-truffle butter sauce.',
        price: 18.25,
        category: 'Pasta',
      },
      {
        id: 'tiramisu',
        name: 'Tiramisu',
        description: 'Classic espresso-soaked ladyfingers layered with mascarpone cream.',
        price: 8.75,
        category: 'Dessert',
      },
    ],
  },
  {
    id: 'sunset-sushi',
    name: 'Sunset Sushi Bar',
    cuisine: 'Japanese',
    description: 'Seasonal nigiri, maki, and robata skewers featuring local seafood.',
    address: '88 Riverside Drive, Springfield',
    contact: '(555) 415-0099',
    averagePrepTime: '25-35 minutes',
    hours: {
      mon: { open: '16:00', close: '22:00' },
      tue: { open: '16:00', close: '22:00' },
      wed: { open: '16:00', close: '22:00' },
      thu: { open: '16:00', close: '23:00' },
      fri: { open: '16:00', close: '23:00' },
      sat: { open: '15:00', close: '23:00' },
      // Closed on Sundays
    },
    menu: [
      {
        id: 'sunset-platter',
        name: 'Sunset Platter',
        description: 'Chef-selected assortment of eight seasonal nigiri.',
        price: 24,
        category: 'Chef Specials',
      },
      {
        id: 'firecracker-roll',
        name: 'Firecracker Roll',
        description: 'Spicy tuna, avocado, crispy shallots, and tobiko.',
        price: 14.5,
        category: 'Rolls',
      },
      {
        id: 'miso-cod',
        name: 'Miso Glazed Cod',
        description: 'Oven-roasted black cod with sweet miso glaze and pickled daikon.',
        price: 19.75,
        category: 'Hot Dishes',
      },
      {
        id: 'matcha-cheesecake',
        name: 'Matcha Cheesecake',
        description: 'Silky matcha cheesecake with sesame crumble crust.',
        price: 7.25,
        category: 'Dessert',
      },
    ],
  },
  {
    id: 'green-garden',
    name: 'Green Garden Kitchen',
    cuisine: 'Plant-Based',
    description: 'Seasonally-inspired plant-based meals and cold-pressed juices.',
    address: '420 Elm Avenue, Springfield',
    contact: '(555) 677-3322',
    averagePrepTime: '15-25 minutes',
    hours: {
      mon: { open: '09:00', close: '20:00' },
      tue: { open: '09:00', close: '20:00' },
      wed: { open: '09:00', close: '20:00' },
      thu: { open: '09:00', close: '21:00' },
      fri: { open: '09:00', close: '21:00' },
      sat: { open: '09:00', close: '21:00' },
      sun: { open: '10:00', close: '18:00' },
    },
    menu: [
      {
        id: 'harvest-bowl',
        name: 'Autumn Harvest Bowl',
        description: 'Roasted squash, quinoa, greens, maple tahini dressing.',
        price: 13.5,
        category: 'Bowls',
      },
      {
        id: 'greenhouse-wrap',
        name: 'Greenhouse Wrap',
        description: 'Spinach tortilla with hummus, charred vegetables, and sprouts.',
        price: 11,
        category: 'Sandwiches',
      },
      {
        id: 'sunrise-juice',
        name: 'Sunrise Citrus Juice',
        description: 'Orange, grapefruit, turmeric, and ginger.',
        price: 6.25,
        category: 'Beverages',
      },
      {
        id: 'chocolate-chia',
        name: 'Chocolate Chia Pot',
        description: 'Coconut chia pudding layered with dark cocoa and berries.',
        price: 5.75,
        category: 'Dessert',
      },
    ],
  },
];

const CustomerContext = createContext();

function parseTimeToMinutes(value) {
  if (!value) return null;
  const [hour, minute] = value.split(':').map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }
  return hour * 60 + minute;
}

function formatTimeDisplay(value) {
  if (!value) return '';
  const [hour, minute] = value.split(':').map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return value;
  }
  const reference = new Date();
  reference.setHours(hour, minute, 0, 0);
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(reference);
}

export function CustomerProvider({ children }) {
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [cart, setCart] = useState([]);

  const restaurants = useMemo(() => mockRestaurants, []);

  const selectedRestaurant = useMemo(
    () => restaurants.find((restaurant) => restaurant.id === selectedRestaurantId) ?? null,
    [restaurants, selectedRestaurantId],
  );

  const selectRestaurant = useCallback((restaurantId) => {
    setSelectedRestaurantId(restaurantId);
    setCart([]);
  }, []);

  const addItemToCart = useCallback((menuItem) => {
    setCart((previous) => {
      const existing = previous.find((entry) => entry.item.id === menuItem.id);
      if (existing) {
        return previous.map((entry) =>
          entry.item.id === menuItem.id
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry,
        );
      }
      return [...previous, { item: menuItem, quantity: 1 }];
    });
  }, []);

  const updateItemQuantity = useCallback((menuItemId, nextQuantity) => {
    setCart((previous) => {
      if (nextQuantity <= 0) {
        return previous.filter((entry) => entry.item.id !== menuItemId);
      }
      return previous.map((entry) =>
        entry.item.id === menuItemId ? { ...entry, quantity: nextQuantity } : entry,
      );
    });
  }, []);

  const removeItemFromCart = useCallback((menuItemId) => {
    setCart((previous) => previous.filter((entry) => entry.item.id !== menuItemId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getRestaurantStatus = useCallback((restaurant, referenceDate = new Date()) => {
    if (!restaurant) {
      return { isOpen: false, todaysHours: null, closesInMinutes: null };
    }

    const dayKey = dayKeys[referenceDate.getDay()];
    const todaysHours = restaurant.hours?.[dayKey] ?? null;

    if (!todaysHours?.open || !todaysHours?.close) {
      return { isOpen: false, todaysHours: null, closesInMinutes: null };
    }

    const openMinutes = parseTimeToMinutes(todaysHours.open);
    const closeMinutes = parseTimeToMinutes(todaysHours.close);
    if (openMinutes == null || closeMinutes == null) {
      return { isOpen: false, todaysHours: null, closesInMinutes: null };
    }

    const currentMinutes = referenceDate.getHours() * 60 + referenceDate.getMinutes();
    const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    const closesInMinutes = isOpen ? closeMinutes - currentMinutes : null;

    return { isOpen, todaysHours, closesInMinutes };
  }, []);

  const formatOperatingWindow = useCallback((hoursWindow) => {
    if (!hoursWindow?.open || !hoursWindow?.close) {
      return 'Closed';
    }
    return `${formatTimeDisplay(hoursWindow.open)} – ${formatTimeDisplay(hoursWindow.close)}`;
  }, []);

  const cartTotal = useMemo(
    () =>
      cart.reduce((total, entry) => total + entry.item.price * entry.quantity, 0),
    [cart],
  );

  const cartItemCount = useMemo(
    () => cart.reduce((total, entry) => total + entry.quantity, 0),
    [cart],
  );

  const value = useMemo(
    () => ({
      restaurants,
      selectedRestaurant,
      selectRestaurant,
      cart,
      addItemToCart,
      updateItemQuantity,
      removeItemFromCart,
      clearCart,
      cartTotal,
      cartItemCount,
      getRestaurantStatus,
      formatOperatingWindow,
    }),
    [
      restaurants,
      selectedRestaurant,
      selectRestaurant,
      cart,
      addItemToCart,
      updateItemQuantity,
      removeItemFromCart,
      clearCart,
      cartTotal,
      cartItemCount,
      getRestaurantStatus,
      formatOperatingWindow,
    ],
  );

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
}

export function useRestaurantStatus(restaurant, referenceDate) {
  const { getRestaurantStatus } = useCustomer();
  return useMemo(() => getRestaurantStatus(restaurant, referenceDate), [
    getRestaurantStatus,
    restaurant,
    referenceDate,
  ]);
}
