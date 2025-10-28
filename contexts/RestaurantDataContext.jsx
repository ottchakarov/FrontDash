import React, { createContext, useContext, useMemo } from 'react';

const RestaurantDataContext = createContext(undefined);

const WEEKDAY_KEYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

function createHours(open, close) {
  if (!open || !close) {
    return { closed: true, open: null, close: null };
  }
  return { closed: false, open, close };
}

const restaurantCatalog = [
  {
    id: 'bella-trattoria',
    name: 'Bella Trattoria',
    cuisine: 'Italian',
    phone: '3125550112',
    email: 'bella@frontdash.example',
    address: {
      building: '1846',
      street: 'W Maple St',
      city: 'Chicago',
      state: 'IL',
    },
    hours: {
      sunday: createHours('11:00', '21:00'),
      monday: createHours('11:00', '22:00'),
      tuesday: createHours('11:00', '22:00'),
      wednesday: createHours('11:00', '22:00'),
      thursday: createHours('11:00', '22:30'),
      friday: createHours('11:00', '23:00'),
      saturday: createHours('10:00', '23:00'),
    },
  },
  {
    id: 'sunrise-diner',
    name: 'Sunrise Diner',
    cuisine: 'Breakfast & Brunch',
    forceClosed: true,
    phone: '3125550175',
    email: 'sunrise@frontdash.example',
    address: {
      building: '920',
      street: 'Cedar Ave',
      city: 'Chicago',
      state: 'IL',
    },
    hours: {
      sunday: createHours('07:00', '13:00'),
      monday: createHours('06:30', '14:30'),
      tuesday: createHours('06:30', '14:30'),
      wednesday: createHours('06:30', '14:30'),
      thursday: createHours('06:30', '14:30'),
      friday: createHours('06:30', '14:30'),
      saturday: createHours('07:00', '14:00'),
    },
  },
  {
    id: 'green-garden-bowls',
    name: 'Green Garden Bowls',
    cuisine: 'Healthy Bowls',
    phone: '3125550218',
    email: 'greengarden@frontdash.example',
    address: {
      building: '510',
      street: 'Eastwood Blvd',
      city: 'Chicago',
      state: 'IL',
    },
    hours: {
      sunday: createHours('11:00', '20:00'),
      monday: createHours('10:30', '20:30'),
      tuesday: createHours('10:30', '20:30'),
      wednesday: createHours('10:30', '20:30'),
      thursday: createHours('10:30', '20:30'),
      friday: createHours('10:30', '21:30'),
      saturday: createHours('10:30', '21:30'),
    },
  },
  {
    id: 'spice-route',
    name: 'Spice Route Express',
    cuisine: 'Indian Street Food',
    phone: '3125550291',
    email: 'spiceroute@frontdash.example',
    address: {
      building: '77',
      street: 'Wacker Dr',
      city: 'Chicago',
      state: 'IL',
    },
    hours: {
      sunday: createHours('12:00', '20:00'),
      monday: createHours('11:30', '21:30'),
      tuesday: createHours('11:30', '21:30'),
      wednesday: createHours('11:30', '21:30'),
      thursday: createHours('11:30', '22:00'),
      friday: createHours('11:30', '22:30'),
      saturday: createHours('11:30', '22:30'),
    },
  },
];

const menuSectionsByRestaurant = {
  'bella-trattoria': [
    {
      id: 'starters',
      title: 'Starters',
      items: [
        {
          id: 'bruschetta',
          name: 'Heirloom Tomato Bruschetta',
          description: 'Grilled country bread topped with basil pesto, heirloom tomatoes, and balsamic glaze.',
          price: 8.5,
          available: true,
        },
        {
          id: 'arancini',
          name: 'Truffle Arancini',
          description: 'Crispy risotto croquettes filled with mozzarella, served with roasted garlic aioli.',
          price: 10,
          available: true,
        },
      ],
    },
    {
      id: 'pastas',
      title: 'Pastas',
      items: [
        {
          id: 'margherita-pizza',
          name: 'Margherita Pizza',
          description: 'San Marzano tomatoes, buffalo mozzarella, and garden basil on a blistered crust.',
          price: 16,
          available: true,
        },
        {
          id: 'carbonara',
          name: 'Spaghetti Carbonara',
          description: 'Guanciale, egg yolk, pecorino Romano, and cracked pepper tossed with fresh pasta.',
          price: 18,
          available: true,
        },
        {
          id: 'mushroom-pappardelle',
          name: 'Wild Mushroom Pappardelle',
          description: 'Porcini cream sauce with sautéed wild mushrooms and shaved Parmesan.',
          price: 19.5,
          available: true,
        },
      ],
    },
    {
      id: 'desserts',
      title: 'Desserts',
      items: [
        {
          id: 'tiramisu',
          name: 'Classic Tiramisu',
          description: 'Layers of espresso-soaked ladyfingers and mascarpone cream dusted with cocoa.',
          price: 7,
          available: true,
        },
        {
          id: 'cannoli',
          name: 'Pistachio Cannoli',
          description: 'Crisp shells filled with ricotta cream and candied pistachios.',
          price: 6.5,
          available: true,
        },
      ],
    },
  ],
  'sunrise-diner': [
    {
      id: 'all-day-breakfast',
      title: 'All-day Breakfast',
      items: [
        {
          id: 'buttermilk-pancakes',
          name: 'Buttermilk Pancakes',
          description: 'Stack of three fluffy pancakes with maple syrup and whipped butter.',
          price: 11,
          available: true,
        },
        {
          id: 'sunrise-skillet',
          name: 'Sunrise Skillet',
          description: 'Sautéed potatoes, peppers, caramelized onions, cheddar, and two eggs your way.',
          price: 13,
          available: true,
        },
      ],
    },
    {
      id: 'lunch-favorites',
      title: 'Lunch Favorites',
      items: [
        {
          id: 'club-sandwich',
          name: 'Triple Decker Club',
          description: 'Roasted turkey, bacon, lettuce, tomato, and mayo on toasted sourdough.',
          price: 12,
          available: true,
        },
        {
          id: 'soup-salad',
          name: 'Soup & Salad Combo',
          description: 'Daily soup selection served with a garden salad and house dressing.',
          price: 11,
          available: true,
        },
      ],
    },
  ],
  'green-garden-bowls': [
    {
      id: 'build-your-own',
      title: 'Build-Your-Own Bowls',
      items: [
        {
          id: 'harvest-bowl',
          name: 'Autumn Harvest Bowl',
          description: 'Quinoa, roasted sweet potatoes, kale, pepitas, cranberries, tahini dressing.',
          price: 13.5,
          available: true,
        },
        {
          id: 'citrus-bowl',
          name: 'Citrus Glow Bowl',
          description: 'Mixed greens, grapefruit, avocado, pickled fennel, toasted almonds, citrus vinaigrette.',
          price: 12.75,
          available: true,
        },
      ],
    },
    {
      id: 'broths',
      title: 'Broths & Warm Bowls',
      items: [
        {
          id: 'miso-soba',
          name: 'Miso Soba Bowl',
          description: 'Brown rice miso broth, soba noodles, shiitake mushrooms, bok choy, poached egg.',
          price: 14,
          available: true,
        },
        {
          id: 'spiced-lentil',
          name: 'Spiced Lentil Bowl',
          description: 'Smoky tomato broth, red lentils, roasted cauliflower, yogurt drizzle, cilantro.',
          price: 13,
          available: false,
        },
      ],
    },
  ],
  'spice-route': [
    {
      id: 'street-snacks',
      title: 'Street Snacks',
      items: [
        {
          id: 'samosa-duo',
          name: 'Samosa Duo',
          description: 'Crispy potato and pea samosas served with tamarind chutney.',
          price: 6,
          available: true,
        },
        {
          id: 'chaat',
          name: 'Delhi Chaat Bowl',
          description: 'Crispy chickpeas, puffed rice, yogurt, mint, tamarind, and sev.',
          price: 7.5,
          available: true,
        },
      ],
    },
    {
      id: 'mains',
      title: 'Mains',
      items: [
        {
          id: 'butter-chicken',
          name: 'Butter Chicken',
          description: 'Tomato fenugreek cream sauce with charred chicken, served with basmati rice.',
          price: 17,
          available: true,
        },
        {
          id: 'veggie-biryani',
          name: 'Vegetable Biryani',
          description: 'Fragrant basmati rice with vegetables, saffron, cashews, and raita.',
          price: 15,
          available: true,
        },
        {
          id: 'paneer-tikka',
          name: 'Paneer Tikka Roll',
          description: 'Grilled paneer wrapped with pickled onions, peppers, and mint chutney.',
          price: 13.5,
          available: true,
        },
      ],
    },
  ],
};

function parseTimeToMinutes(value) {
  if (!value) return null;
  const [hoursStr, minutesStr] = value.split(':');
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }
  return hours * 60 + minutes;
}

function formatAsClock(timeString) {
  if (!timeString) return '';
  const [hoursStr, minutesStr] = timeString.split(':');
  let hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const paddedMinutes = minutes.toString().padStart(2, '0');
  return `${hours}:${paddedMinutes} ${suffix}`;
}

function isOpenDuring(restaurant, referenceDate = new Date()) {
  if (!restaurant) return false;
  if (restaurant.forceClosed) {
    return false;
  }
  const dayKey = WEEKDAY_KEYS[referenceDate.getDay()];
  const schedule = restaurant.hours?.[dayKey];
  if (!schedule || schedule.closed) {
    return false;
  }
  const nowMinutes = referenceDate.getHours() * 60 + referenceDate.getMinutes();
  const openMinutes = parseTimeToMinutes(schedule.open);
  const closeMinutes = parseTimeToMinutes(schedule.close);
  if (openMinutes == null || closeMinutes == null) {
    return false;
  }
  return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
}

function describeTodaysHours(restaurant, referenceDate = new Date()) {
  if (!restaurant) {
    return { label: 'No hours available', closed: true };
  }
  if (restaurant.forceClosed) {
    return { label: 'Temporarily closed', closed: true };
  }
  const dayKey = WEEKDAY_KEYS[referenceDate.getDay()];
  const schedule = restaurant.hours?.[dayKey];
  if (!schedule || schedule.closed) {
    return { label: 'Closed today', closed: true };
  }
  const label = `${formatAsClock(schedule.open)} – ${formatAsClock(schedule.close)}`;
  return { label, closed: false, open: schedule.open, close: schedule.close };
}

export function RestaurantDataProvider({ children }) {
  const restaurants = useMemo(
    () => restaurantCatalog.map((restaurant) => ({ ...restaurant })),
    []
  );

  const value = useMemo(
    () => ({
      restaurants,
      getRestaurantById: (id) => restaurants.find((entry) => entry.id === id) ?? null,
      getMenuSections: (restaurantId) => menuSectionsByRestaurant[restaurantId] ?? [],
      isRestaurantOpen: (idOrRestaurant, referenceDate) => {
        const restaurant =
          typeof idOrRestaurant === 'string'
            ? restaurants.find((entry) => entry.id === idOrRestaurant)
            : idOrRestaurant;
        return isOpenDuring(restaurant ?? null, referenceDate);
      },
      describeTodaysHours: (idOrRestaurant, referenceDate) => {
        const restaurant =
          typeof idOrRestaurant === 'string'
            ? restaurants.find((entry) => entry.id === idOrRestaurant)
            : idOrRestaurant;
        return describeTodaysHours(restaurant ?? null, referenceDate);
      },
      listWeekdays: () => [...WEEKDAY_KEYS],
      formatClockTime: formatAsClock,
    }),
    [restaurants]
  );

  return <RestaurantDataContext.Provider value={value}>{children}</RestaurantDataContext.Provider>;
}

export function useRestaurantData() {
  const context = useContext(RestaurantDataContext);
  if (!context) {
    throw new Error('useRestaurantData must be used within a RestaurantDataProvider');
  }
  return context;
}
