import React, { useMemo, useState } from 'react';
import './CustomerDashboard.css';

const timelineStops = [
  {
    id: 'order-placed',
    title: 'Order placed',
    time: '4:05 PM',
    description: 'FrontDash confirmed payment and shared your contactless instructions with the restaurant.',
  },
  {
    id: 'prepping',
    title: 'Restaurant is prepping',
    time: '4:12 PM',
    description: 'Bella Trattoria is preparing your meal. We will alert you when your driver is on the way.',
  },
  {
    id: 'driver-assigned',
    title: 'Driver assigned',
    time: '4:26 PM',
    description: 'Marcus picked up the delivery. You can track the trip in real time and chat if anything changes.',
  },
  {
    id: 'arriving',
    title: 'Arriving soon',
    time: '4:38 PM',
    description: 'Marcus is 0.5 miles away. We will send a push notification when they reach the door.',
  },
];

const recommendedAddOns = [
  { id: 'tiramisu', name: 'Tiramisu slice', price: '$6.50', description: 'A sweet treat you can add for your next order.' },
  { id: 'garlic-bread', name: 'Garlic bread', price: '$5.00', description: 'Warm, buttery garlic bread from Bella Trattoria.' },
  { id: 'sparkling', name: 'Sparkling water', price: '$3.25', description: 'Add a refreshing San Pellegrino to your cart.' },
];

export default function CustomerDashboard() {
  const [activeStopId, setActiveStopId] = useState('prepping');
  const activeStop = useMemo(() => timelineStops.find((stop) => stop.id === activeStopId) ?? timelineStops[0], [
    activeStopId,
  ]);

  return (
    <div className="customer-dashboard">
      <header className="customer-hero">
        <div>
          <p className="customer-eyebrow">Dinner in progress</p>
          <h1>Bella Trattoria is preparing your order</h1>
          <p className="customer-subtitle">
            We will keep you updated as the kitchen finishes cooking and your driver approaches. Tap a status to see more
            details or share updated delivery instructions.
          </p>
        </div>
        <div className="customer-eta" role="status" aria-live="polite">
          <span className="label">Estimated arrival</span>
          <strong>4:45 &ndash; 4:55 PM</strong>
          <span className="driver">Marcus (white Prius) • 2.4 mi away</span>
        </div>
      </header>

      <main className="customer-content">
        <section className="customer-timeline" aria-labelledby="customer-timeline-heading">
          <h2 id="customer-timeline-heading">Order timeline</h2>
          <ol>
            {timelineStops.map((stop) => (
              <li key={stop.id}>
                <button
                  type="button"
                  className={`timeline-step ${stop.id === activeStopId ? 'active' : ''}`}
                  onClick={() => setActiveStopId(stop.id)}
                >
                  <span className="step-dot" aria-hidden="true" />
                  <span>
                    <strong>{stop.title}</strong>
                    <small>{stop.time}</small>
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <aside className="timeline-details">
            <h3>{activeStop.title}</h3>
            <p>{activeStop.description}</p>
            <button type="button" className="customer-secondary">Share delivery instructions</button>
          </aside>
        </section>

        <section className="customer-order" aria-labelledby="customer-order-heading">
          <h2 id="customer-order-heading">Tonight&apos;s order</h2>
          <div className="customer-order-card">
            <div>
              <h3>Malik Johnson</h3>
              <p className="customer-order-address">1846 W. Maple St, Apt 302</p>
              <p className="customer-order-notes">Leave at the door. Gate code #4402.</p>
            </div>
            <ul>
              <li>
                <span>Margherita Pizza</span>
                <span>×1</span>
              </li>
              <li>
                <span>Tiramisu slice</span>
                <span>×1</span>
              </li>
              <li>
                <span>Garlic knots</span>
                <span>×1</span>
              </li>
            </ul>
            <footer>
              <span>Total</span>
              <strong>$42.80</strong>
            </footer>
          </div>
        </section>

        <section className="customer-recommendations" aria-labelledby="customer-recommendations-heading">
          <h2 id="customer-recommendations-heading">Add something for next time</h2>
          <div className="customer-recommendation-grid">
            {recommendedAddOns.map((item) => (
              <article key={item.id} className="recommendation-card">
                <header>
                  <h3>{item.name}</h3>
                  <span>{item.price}</span>
                </header>
                <p>{item.description}</p>
                <button type="button" className="customer-primary">
                  Save to favorites
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
