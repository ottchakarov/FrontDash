import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const OrderContext = createContext(undefined);

const ORDER_STATUS = {
  NEW: 'new',
  IN_PROGRESS: 'inProgress',
  COMPLETED: 'completed',
};

const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.NEW]: 'New',
  [ORDER_STATUS.IN_PROGRESS]: 'In-Progress',
  [ORDER_STATUS.COMPLETED]: 'Completed',
};

function generateOrderId(existingIds) {
  let attempt = 0;
  while (attempt < 12) {
    const candidate = `FD-${Math.floor(Math.random() * 9000 + 1000)}`;
    if (!existingIds.has(candidate)) {
      return candidate;
    }
    attempt += 1;
  }
  return `FD-${Date.now()}`;
}

function buildInitialOrder({
  id,
  status,
  restaurantId,
  restaurantName,
  placedAt,
  customer,
  delivery,
  billing,
  items,
  subtotal,
  tax,
  fees,
  total,
  last4,
}) {
  return {
    id,
    status,
    restaurantId,
    restaurantName,
    placedAt,
    customer,
    delivery,
    billing,
    items,
    charges: {
      subtotal,
      tax,
      fees,
      total,
    },
    payment: {
      last4,
    },
    statusHistory: {
      [status]: placedAt,
    },
  };
}

const initialOrders = [
  buildInitialOrder({
    id: 'FD-2451',
    status: ORDER_STATUS.NEW,
    restaurantId: 'bella-trattoria',
    restaurantName: 'Bella Trattoria',
    placedAt: new Date('2024-04-17T21:12:00Z').toISOString(),
    customer: { name: 'Malik Johnson', phone: '3125552098', email: 'malik.johnson@example.com' },
    delivery: {
      building: '1846',
      street: 'W Maple St Apt 302',
      city: 'Chicago',
      state: 'IL',
      note: 'Gate code #4402',
    },
    billing: {
      building: '1846',
      street: 'W Maple St Apt 302',
      city: 'Chicago',
      state: 'IL',
    },
    items: [
      { id: 'margherita-pizza', name: 'Margherita Pizza', quantity: 1, price: 16 },
      { id: 'tiramisu', name: 'Classic Tiramisu', quantity: 1, price: 7 },
      { id: 'garlic-knots', name: 'Garlic Knots', quantity: 1, price: 6 },
    ],
    subtotal: 29,
    tax: 2.61,
    fees: 3.5,
    total: 35.11,
    last4: '4242',
  }),
  buildInitialOrder({
    id: 'FD-2448',
    status: ORDER_STATUS.IN_PROGRESS,
    restaurantId: 'bella-trattoria',
    restaurantName: 'Bella Trattoria',
    placedAt: new Date('2024-04-17T20:06:00Z').toISOString(),
    customer: { name: 'Jamie Ortiz', phone: '3125555521', email: 'jamie.ortiz@example.com' },
    delivery: {
      building: '920',
      street: 'Cedar Ave Suite 210',
      city: 'Chicago',
      state: 'IL',
      note: 'Allergic to peanuts',
    },
    billing: {
      building: '920',
      street: 'Cedar Ave Suite 210',
      city: 'Chicago',
      state: 'IL',
    },
    items: [
      { id: 'chicken-alfredo', name: 'Chicken Alfredo', quantity: 2, price: 18 },
      { id: 'house-salad', name: 'House Salad', quantity: 2, price: 9 },
    ],
    subtotal: 54,
    tax: 4.86,
    fees: 3.5,
    total: 62.36,
    last4: '1881',
  }),
  buildInitialOrder({
    id: 'FD-2445',
    status: ORDER_STATUS.COMPLETED,
    restaurantId: 'green-garden-bowls',
    restaurantName: 'Green Garden Bowls',
    placedAt: new Date('2024-04-17T19:55:00Z').toISOString(),
    customer: { name: 'Lina Torres', phone: '3125558284', email: 'lina.torres@example.com' },
    delivery: {
      building: '510',
      street: 'Eastwood Blvd',
      city: 'Chicago',
      state: 'IL',
      note: 'Meet at front desk',
    },
    billing: {
      building: '510',
      street: 'Eastwood Blvd',
      city: 'Chicago',
      state: 'IL',
    },
    items: [
      { id: 'caprese-panini', name: 'Caprese Panini', quantity: 2, price: 11.5 },
      { id: 'sparkling-water', name: 'Sparkling Water', quantity: 2, price: 3.25 },
    ],
    subtotal: 29.5,
    tax: 2.47,
    fees: 3.5,
    total: 35.47,
    last4: '3005',
  }),
];

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(initialOrders);
  const [latestOrderId, setLatestOrderId] = useState(null);

  const createCustomerOrder = useCallback((payload) => {
    let createdOrder = null;
    setOrders((prev) => {
      const existingIds = new Set(prev.map((order) => order.id));
      const orderId = generateOrderId(existingIds);
      const now = new Date().toISOString();
      const order = {
        id: orderId,
        status: ORDER_STATUS.NEW,
        restaurantId: payload.restaurantId,
        restaurantName: payload.restaurantName,
        placedAt: now,
        customer: {
          name: payload.contact.name,
          phone: payload.contact.phone,
          email: payload.contact.email,
        },
        delivery: { ...payload.delivery },
        billing: { ...payload.billing },
        items: payload.items.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        charges: {
          subtotal: payload.financials.subtotal,
          tax: payload.financials.tax,
          fees: payload.financials.fees,
          total: payload.financials.total,
        },
        payment: {
          last4: payload.payment.last4,
        },
        statusHistory: {
          [ORDER_STATUS.NEW]: now,
        },
      };
      createdOrder = order;
      setLatestOrderId(orderId);
      return [order, ...prev];
    });
    return createdOrder;
  }, []);

  const updateOrderStatus = useCallback((orderId, nextStatus) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        if (order.status === nextStatus) return order;
        return {
          ...order,
          status: nextStatus,
          statusHistory: {
            ...order.statusHistory,
            [nextStatus]: new Date().toISOString(),
          },
        };
      })
    );
  }, []);

  const recordOrderProgression = useCallback((orderId) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const nextStatus =
          order.status === ORDER_STATUS.NEW
            ? ORDER_STATUS.IN_PROGRESS
            : ORDER_STATUS.COMPLETED;
        if (order.status === ORDER_STATUS.COMPLETED) {
          return order;
        }
        return {
          ...order,
          status: nextStatus,
          statusHistory: {
            ...order.statusHistory,
            [nextStatus]: new Date().toISOString(),
          },
        };
      })
    );
  }, []);

  const latestOrder = useMemo(
    () => orders.find((order) => order.id === latestOrderId) ?? null,
    [latestOrderId, orders]
  );

  const clearLatestOrder = useCallback(() => {
    setLatestOrderId(null);
  }, []);

  const getOrdersByStatus = useCallback(
    (status) => orders.filter((order) => order.status === status),
    [orders]
  );

  const value = useMemo(
    () => ({
      orders,
      orderStatuses: ORDER_STATUS,
      orderStatusLabels: ORDER_STATUS_LABELS,
      createCustomerOrder,
      updateOrderStatus,
      recordOrderProgression,
      getOrdersByStatus,
      latestOrder,
      clearLatestOrder,
    }),
    [orders, createCustomerOrder, updateOrderStatus, recordOrderProgression, getOrdersByStatus, latestOrder, clearLatestOrder]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
