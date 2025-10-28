import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../contexts/OrderContext';
import { formatCurrency } from '../../utils/orderTotals';
import AppHeader from '../../components/AppHeader';
import './OrderConfirmation.css';

function formatAddress(address) {
  if (!address) return '';
  return `${address.building} ${address.street}, ${address.city}, ${address.state}`;
}

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const { latestOrder, clearLatestOrder } = useOrders();

  useEffect(() => {
    if (!latestOrder) {
      navigate('/restaurants', { replace: true });
    }
  }, [latestOrder, navigate]);

  useEffect(
    () => () => {
      clearLatestOrder();
    },
    [clearLatestOrder]
  );

  if (!latestOrder) {
    return null;
  }

  const totalItems = latestOrder.items.reduce((sum, item) => sum + item.quantity, 0);
  const maskedCard = `•••• •••• •••• ${latestOrder.payment.last4}`;

  return (
    <>
      <AppHeader />
      <div className="confirmation-page">
        <div className="confirmation-card">
          <header>
            <div className="confirmation-icon" aria-hidden="true">✔</div>
            <h1>Order placed!</h1>
          <p>
            We sent your receipt to <strong>{latestOrder.customer.email}</strong>. You will receive delivery updates as your
            order progresses.
          </p>
        </header>

        <section className="confirmation-section">
          <h2>Order summary</h2>
          <p className="confirmation-meta">
            {latestOrder.restaurantName} • {totalItems} item{totalItems === 1 ? '' : 's'}
          </p>
          <ul className="confirmation-items">
            {latestOrder.items.map((item) => (
              <li key={item.id}>
                <span>
                  {item.quantity} × {item.name}
                </span>
                <span>{formatCurrency(item.quantity * item.price)}</span>
              </li>
            ))}
          </ul>
          <dl className="confirmation-totals">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatCurrency(latestOrder.charges.subtotal)}</dd>
            </div>
            <div>
              <dt>Tax</dt>
              <dd>{formatCurrency(latestOrder.charges.tax)}</dd>
            </div>
            <div>
              <dt>Delivery & fees</dt>
              <dd>{formatCurrency(latestOrder.charges.fees)}</dd>
            </div>
            <div className="total">
              <dt>Total charged</dt>
              <dd>{formatCurrency(latestOrder.charges.total)}</dd>
            </div>
          </dl>
        </section>

        <section className="confirmation-section">
          <h2>Payment</h2>
          <p>{maskedCard}</p>
        </section>

        <section className="confirmation-section">
          <h2>Delivery address</h2>
          <p>{formatAddress(latestOrder.delivery)}</p>
          {latestOrder.delivery.note ? <p className="note">Instructions: {latestOrder.delivery.note}</p> : null}
        </section>

          <div className="confirmation-actions">
            <button type="button" className="primary" onClick={() => navigate('/order/track')}>
              Track order
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                clearLatestOrder();
                navigate('/restaurants');
              }}
            >
              Back to restaurants
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
