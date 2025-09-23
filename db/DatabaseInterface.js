// src/db/DatabaseInterface.js
const DatabaseInterface = {
  getRestaurantInfo() {
    // simulating an async call that returns restaurant metadata
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: 'rest-001',
          name: 'Mike\'s Italian Joint', //provided option is 'Bella Trattoria', which also works
          // Use 'approved' to demo approved (green).
          // Use 'pending' (or anything else) to demo waiting (red).
          status: 'approved', // <-- change to 'approved' to demo approved state
          phone: '2145551234',
        });
      }, 250);
    });
  },

  getStatistics() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalOrders: 128,
          meanOrderSize: 2.6,
          meanOrderCost: 24.37,
          totalRevenue: 128 * 24.37,
          topItems: [
            { name: 'Margherita Pizza', count: 42 },
            { name: 'Spaghetti Carbonara', count: 30 },
            { name: 'Caesar Salad', count: 18 },
            { name: 'Garlic Bread', count: 12 },
            { name: 'Tiramisu', count: 8 },
          ],
        });
      }, 350);
    });
  },
};

export default DatabaseInterface;
