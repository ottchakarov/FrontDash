// src/db/DatabaseInterface.js
const BASE_URL = 'http://localhost:8080/api';

// Pull the restaurant id saved during login; require it for owner data
function getRestaurantId() {
  const id = localStorage.getItem('myRestaurantId');
  if (!id) {
    throw new Error('No restaurant id found in session. Log in as owner with a restaurant id.');
  }
  return id;
}

const DatabaseInterface = {
  async getRestaurantInfo() {
    const restaurantId = getRestaurantId();
    try {
      const response = await fetch(`${BASE_URL}/restaurants/${restaurantId}`);
      if (!response.ok) {
        throw new Error(`Failed to load restaurant ${restaurantId}: ${response.status}`);
      }
      const data = await response.json();
      return {
        id: data.restaurantId ?? restaurantId,
        name: data.restaurantName ?? data.name ?? 'Restaurant',
        status: data.forceClosed ? 'pending' : 'approved',
        phone: data.phone ?? '',
      };
    } catch (err) {
      console.error('Error fetching restaurant info:', err);
      throw err;
    }
  },

  async getStatistics() {
    const restaurantId = getRestaurantId();
    try {
      const response = await fetch(`${BASE_URL}/statistics/restaurant/${restaurantId}`);
      if (!response.ok) {
        throw new Error(`Failed to load statistics for ${restaurantId}`);
      }
      const data = await response.json();
      return {
        totalOrders: Number(data.totalOrders ?? 0),
        meanOrderSize: Number(data.averageOrderSize ?? data.meanOrderSize ?? 0),
        meanOrderCost: Number(data.averageOrderValue ?? data.meanOrderCost ?? 0),
        totalRevenue: Number(data.revenue ?? data.totalRevenue ?? 0),
        topItems: Array.isArray(data.topItems)
          ? data.topItems.map((item) => ({
              name: item.name ?? 'Unknown',
              count: Number(item.count ?? 0),
              percentage: item.percentage,
            }))
          : [],
      };
    } catch (err) {
      console.error('Error fetching statistics:', err);
      throw err;
    }
  },
};

export default DatabaseInterface;
