// src/pages/customer/CustomerDashboard.jsx
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import AppHeader from '../../components/AppHeader';
import { useOrders } from '../../contexts/OrderContext';
import './CustomerDashboard.css';

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

function formatTime(date) {
  if (!date) return '—';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function CustomerDashboard() {
  const location = useLocation();
  const { orders, latestOrder } = useOrders();

  const orderIdFromState = location.state?.orderId;
  const order =
    orderIdFromState
      ? orders.find((o) => o.id === orderIdFromState)
      : latestOrder || orders[0] || null;

  if (!order) {
    return (
      <>
        <AppHeader />
        <main className="track-root">
          <h1>Dinner in progress</h1>
          <p>You don&apos;t have an active order yet.</p>
          <p>
            <Link to="/">Place a sample order</Link>
          </p>
        </main>
      </>
    );
  }

  const placedAt = new Date(order.placedAt);
  const etaStart = addMinutes(placedAt, 40);
  const etaEnd = addMinutes(placedAt, 50);

  // we don’t actually track real drivers yet;
  // later you can wire order.driverName from backend/staff assignment
  const hasDriverAssigned = Boolean(order.driverName);
  const driverLine = hasDriverAssigned
    ? `${order.driverName} is on the way`
    : 'A driver will be assigned soon by FrontDash staff.';

  const timeline = [
    { key: 'placed', label: 'Order placed', time: placedAt },
    { key: 'prepping', label: 'Restaurant is prepping', time: addMinutes(placedAt, 7) },
    {
      key: 'driver',
      label: hasDriverAssigned ? 'Driver assigned' : 'Waiting for driver assignment',
      time: hasDriverAssigned ? addMinutes(placedAt, 21) : null,
    },
    { key: 'arriving', label: 'Arriving soon', time: addMinutes(placedAt, 33) },
  ];

  return (
    <>
      <AppHeader />
      <main className="track-root">
        <h1>Dinner in progress</h1>

        <section className="track-hero">
          <p>
            <strong>{order.restaurantName}</strong> is preparing your order
          </p>
          <p>
            We will keep you updated as the kitchen finishes cooking and your
            driver approaches. Tap a status to see more details or share updated
            delivery instructions.
          </p>

          <div className="track-eta">
            <div className="track-eta-label">Estimated arrival</div>
            <div className="track-eta-time">
              {formatTime(etaStart)} - {formatTime(etaEnd)}
            </div>
            <div className="track-driver">
              {driverLine}
            </div>
          </div>
        </section>

        <section className="track-timeline">
          <h2>Order timeline</h2>
          <ul>
            {timeline.map((step) => (
              <li key={step.key} className="track-step">
                <div className="track-step-title">{step.label}</div>
                <div className="track-step-time">{formatTime(step.time)}</div>
              </li>
            ))}
          </ul>
        </section>

        <section className="track-order">
          <h2>Tonight&apos;s order</h2>
          <p>{order.customer.name}</p>
          <p>
            {order.delivery.building} {order.delivery.street}
          </p>
          <p>
            {order.delivery.city}, {order.delivery.state}
          </p>
          {order.delivery.note && <p>{order.delivery.note}</p>}

          <div className="track-items">
            {order.items.map((item) => (
              <div key={item.id} className="track-item">
                <span>{item.name}</span>
                <span>×{item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="track-total">
            Total <strong>${order.charges.total.toFixed(2)}</strong>
          </div>
        </section>
      </main>
    </>
  );
}
