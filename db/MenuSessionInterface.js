const BASE_URL = 'http://localhost:8080/api';

// Read the current restaurant id from session storage.
function getRestaurantId() {
  const id = localStorage.getItem('restaurantId') || localStorage.getItem('restaurant_id');
  if (!id) {
    console.error('No restaurant id found. Log in as owner.');
    return null;
  }
  return id;
}

const MenuSessionInterface = {

  // Load all menu items for the active restaurant.
  async getMenuItems() {
    const restaurantId = getRestaurantId();
    if (!restaurantId) return [];

    try {
      const response = await fetch(`${BASE_URL}/menu/restaurant/${restaurantId}`);
      if (!response.ok) {
        console.warn('Could not load menu items. Backend responded with error.');
        return [];
      }
      return await response.json();
    } catch (err) {
      console.error('Network error loading menu:', err);
      return [];
    }
  },

  // Create a new item with default placeholder content.
  async createMenuItem() {
    const restaurantId = getRestaurantId();
    if (!restaurantId) throw new Error('Not logged in');

    const data = {
      name: 'New Menu Item',
      description: 'Description goes here',
      available: true,
      price: '0.00', // backend expects string for BigDecimal
      category: 'Uncategorized',
      allergens: '',
      itemPictureRef: null,
    };

    const response = await fetch(`${BASE_URL}/menu/restaurant/${restaurantId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Backend rejected creation: ' + errorText);
    }

    return await response.json();
  },

  // Update an existing item.
  async updateMenuItem(id, data) {
    const payload = {
      menuItemId: id,
      restaurantId: getRestaurantId(),
      category: 'Main',
      foodName: data.name, // UI uses 'name', backend expects 'foodName'
      description: data.description,
      price: parseFloat(data.price),
      available: data.available,
    };

    const response = await fetch(`${BASE_URL}/menu/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error('Backend rejected update');

    return { ...data, id }; 
  },

  // Delete an item.
  async deleteMenuItem(id) {
    const response = await fetch(`${BASE_URL}/menu/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Backend rejected delete');
    return true; 
  }
};

export default MenuSessionInterface;
