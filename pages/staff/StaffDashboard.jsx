import React, { useEffect, useMemo, useState } from 'react';
import AppHeader from '../../components/AppHeader';
import { useOrders } from '../../contexts/OrderContext';
import { formatCurrency } from '../../utils/orderTotals';
import './StaffDashboard.css';

const STATUS_ORDER = ['new', 'inProgress', 'completed'];

function formatTime(isoString) {
  try {
    return new Intl.DateTimeFormat('en', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(isoString));
  } catch (error) {
    return '';
  }
}

export default function StaffDashboard() {
  const { orders, orderStatuses, orderStatusLabels, updateOrderStatus } = useOrders();
  const [acknowledged, setAcknowledged] = useState({});

  const columns = useMemo(
    () =>
      STATUS_ORDER.map((status) => ({
        status,
        label: orderStatusLabels[status],
        items: orders.filter((order) => order.status === status),
      })),
    [orders, orderStatusLabels]
  );

  useEffect(() => {
    setAcknowledged((prev) => {
      const next = {};
      orders.forEach((order) => {
        if (order.status === orderStatuses.NEW && prev[order.id]) {
          next[order.id] = true;
        }
      });
      return next;
    });
  }, [orders, orderStatuses.NEW]);

  function handleAcknowledge(orderId) {
    setAcknowledged((prev) => ({ ...prev, [orderId]: true }));
  }

  function handleMarkInProgress(orderId) {
    updateOrderStatus(orderId, orderStatuses.IN_PROGRESS);
    setAcknowledged((prev) => {
      if (!(orderId in prev)) return prev;
      const { [orderId]: _removed, ...rest } = prev;
      return rest;
    });
  }

  function handleComplete(orderId) {
    updateOrderStatus(orderId, orderStatuses.COMPLETED);
  }

  return (
    <>
      <AppHeader />
      <div className="staff-dashboard">
        <header className="staff-dashboard__header">
          <div>
            <p className="eyebrow">Operations</p>
            <h1>Staff Order Command Center</h1>
            <p>Monitor incoming orders, confirm hand-offs, and mark meals complete in real time.</p>
          </div>
        </header>

        <div className="staff-columns">
          {columns.map((column) => (
            <section key={column.status} className="staff-column" aria-label={column.label}>
              <header>
                <h2>{column.label}</h2>
                <span className="count">{column.items.length}</span>
              </header>
              <div className="staff-column__body">
                {column.items.length === 0 ? (
                  <p className="empty">No orders in this state yet.</p>
                ) : (
                  column.items.map((order) => {
                    const isAcknowledged = Boolean(acknowledged[order.id]);
                    return (
                      <article key={order.id} className="staff-card">
                        <header className="staff-card__header">
                          <div>
                            <h3>{order.id}</h3>
                            <p>{order.restaurantName}</p>
                          </div>
                          <span className="badge">{formatTime(order.placedAt)}</span>
                        </header>

                        <dl className="staff-card__details">
                          <div>
                            <dt>Customer</dt>
                            <dd>
                              {order.customer.name}
                              <br />
                              <span className="muted">{order.customer.phone}</span>
                            </dd>
                          </div>
                          <div>
                            <dt>Delivery</dt>
                            <dd>
                              {order.delivery.building} {order.delivery.street}
                              <br />
                              {order.delivery.city}, {order.delivery.state}
                            </dd>
                          </div>
                          <div>
                            <dt>Total</dt>
                            <dd>{formatCurrency(order.charges.total)}</dd>
                          </div>
                        </dl>

                        <ul className="staff-card__items">
                          {order.items.map((item) => (
                            <li key={item.id}>
                              <span>{item.name}</span>
                              <span>×{item.quantity}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="staff-card__actions">
                          <button
                            type="button"
                            className="ghost"
                            onClick={() => handleAcknowledge(order.id)}
                            disabled={order.status !== orderStatuses.NEW}
                          >
                            {isAcknowledged ? 'Acknowledged' : 'Acknowledge'}
                          </button>
                          <button
                            type="button"
                            className="primary"
                            onClick={() => handleMarkInProgress(order.id)}
                            disabled={order.status !== orderStatuses.NEW || !isAcknowledged}
                          >
                            Mark In-Progress
                          </button>
                          <button
                            type="button"
                            className="success"
                            onClick={() => handleComplete(order.id)}
                            disabled={order.status !== orderStatuses.IN_PROGRESS}
                          >
                            Complete
                          </button>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
