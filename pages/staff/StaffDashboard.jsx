import React, { useEffect, useId, useMemo, useState } from 'react';
import './StaffDashboard.css';
import '../../styles/personaModals.css';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

const initialOrders = [
  {
    id: 'FD-2451',
    customer: 'Malik Johnson',
    placedAt: '4:12 PM',
    deliveryWindow: '45-55 minutes',
    status: 'Awaiting prep',
    address: '1846 W. Maple St, Apt 302',
    notes: 'Gate code #4402',
    items: [
      { name: 'Margherita Pizza', quantity: 1 },
      { name: 'Tiramisu Slice', quantity: 1 },
      { name: 'Garlic knots', quantity: 1 },
    ],
  },
  {
    id: 'FD-2448',
    customer: 'Jamie Ortiz',
    placedAt: '4:06 PM',
    deliveryWindow: '30-40 minutes',
    status: 'Cooking',
    address: '920 Cedar Ave, Suite 210',
    notes: 'Allergic to peanuts',
    items: [
      { name: 'Chicken Alfredo', quantity: 2 },
      { name: 'House Salad', quantity: 2 },
    ],
  },
  {
    id: 'FD-2445',
    customer: 'Lina Torres',
    placedAt: '3:55 PM',
    deliveryWindow: 'Ready for driver',
    status: 'Ready for driver',
    address: '510 Eastwood Blvd',
    notes: 'Meet at front desk',
    items: [
      { name: 'Caprese Panini', quantity: 2 },
      { name: 'Sparkling water', quantity: 2 },
    ],
  },
];

function ModalShell({ title, description, onClose, children, actions }) {
  const titleId = useId();

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div className="persona-modal__overlay" role="presentation" onClick={handleOverlayClick}>
      <div className="persona-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header>
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">
            ×
          </button>
        </header>
        {description ? <p className="persona-modal__description">{description}</p> : null}
        <div className="persona-modal__body">{children}</div>
        <div className="persona-modal__actions">{actions}</div>
      </div>
    </div>
  );
}

export default function StaffDashboard() {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrderId, setSelectedOrderId] = useState(initialOrders[0]?.id ?? null);
  const [modalState, setModalState] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
    showRequirements: true,
  });
  const [customTimeForm, setCustomTimeForm] = useState({ hours: '0', minutes: '15' });
  const [hasChangedPassword, setHasChangedPassword] = useState(false);
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    openPasswordModal('first-password');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const queueCount = orders.length;
  const selectedOrder = useMemo(() => orders.find((order) => order.id === selectedOrderId) ?? null, [
    orders,
    selectedOrderId,
  ]);

  const passwordValid = passwordRegex.test(passwordForm.newPassword);
  const passwordMismatch =
    passwordForm.confirmPassword.length > 0 && passwordForm.newPassword !== passwordForm.confirmPassword;

  function announce(message) {
    setBanner({ id: Date.now(), message });
  }

  function updateOrder(id, patch) {
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, ...patch } : order)));
  }

  function handleMarkReady() {
    if (!selectedOrder) return;
    updateOrder(selectedOrder.id, { status: 'Ready for driver', deliveryWindow: 'Ready for pickup' });
    announce(`Order ${selectedOrder.id} marked ready for pickup.`);
  }

  function openCustomTimeModal() {
    setCustomTimeForm({ hours: '0', minutes: '15' });
    setModalState({ type: 'custom-time' });
  }

  function submitCustomTime() {
    if (!selectedOrder) return;
    const hours = Number(customTimeForm.hours);
    const minutes = Number(customTimeForm.minutes);
    const formatted = `${hours > 0 ? `${hours} hr ` : ''}${minutes} min`.trim();
    updateOrder(selectedOrder.id, { deliveryWindow: `Custom: ${formatted}` });
    setModalState(null);
    announce(`Updated delivery estimate for order ${selectedOrder.id}.`);
  }

  function openRemovalConfirm() {
    if (!selectedOrder) return;
    setModalState({ type: 'confirm-removal' });
  }

  function handleRemoveOrder() {
    if (!selectedOrder) return;
    setOrders((prev) => prev.filter((order) => order.id !== selectedOrder.id));
    setModalState(null);
    announce(`Order ${selectedOrder.id} removed from the queue.`);
    setSelectedOrderId((prev) => {
      if (prev !== selectedOrder.id) return prev;
      const next = orders.find((order) => order.id !== selectedOrder.id);
      return next?.id ?? null;
    });
  }

  function openPasswordModal(type) {
    const shouldShowRequirements = type === 'first-password' || !hasChangedPassword;
    setPasswordForm({ newPassword: '', confirmPassword: '', showRequirements: shouldShowRequirements });
    setModalState({ type });
  }

  function handlePasswordSubmit() {
    if (!passwordValid || passwordMismatch) return;
    setHasChangedPassword(true);
    setModalState(null);
    announce('Staff password updated successfully.');
  }

  function addSampleOrder() {
    const nextId = `FD-${Math.floor(Math.random() * 9000 + 2000)}`;
    const newOrder = {
      id: nextId,
      customer: 'Sample Customer',
      placedAt: new Intl.DateTimeFormat('en', {
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date()),
      deliveryWindow: '50-60 minutes',
      status: 'Awaiting prep',
      address: '201 Demo Drive',
      notes: 'Call when outside',
      items: [
        { name: 'Demo Pasta', quantity: 1 },
        { name: 'Side salad', quantity: 1 },
      ],
    };
    setOrders((prev) => [newOrder, ...prev]);
    setSelectedOrderId(newOrder.id);
    announce(`New order ${nextId} added to the queue.`);
  }

  return (
    <div className="staff-dashboard">
      <header className="staff-header">
        <div>
          <p className="staff-eyebrow">Kitchen operations</p>
          <h1>Staff Order Command Center</h1>
          <p className="staff-subtitle">
            Track active orders, update delivery estimates, and coordinate with drivers as meals move through the kitchen.
          </p>
        </div>
        <div className="staff-header__actions">
          <button type="button" className="staff-secondary" onClick={() => addSampleOrder()}>
            Add sample order
          </button>
          <button type="button" className="staff-primary" onClick={() => openPasswordModal('password')}>
            Change password
          </button>
        </div>
      </header>

      {banner ? (
        <div className="staff-banner" role="status" aria-live="polite">
          {banner.message}
          <button type="button" className="text-button" onClick={() => setBanner(null)}>
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="staff-layout">
        <section className="staff-queue" aria-labelledby="staff-queue-heading">
          <header className="staff-queue__header">
            <h2 id="staff-queue-heading">Active orders</h2>
            <span className="staff-queue__count">{queueCount}</span>
          </header>
          <div className="staff-order-list" role="list">
            {orders.map((order) => (
              <button
                type="button"
                key={order.id}
                className={`staff-order-card ${order.id === selectedOrderId ? 'active' : ''}`}
                onClick={() => setSelectedOrderId(order.id)}
              >
                <div className="staff-order-card__meta">
                  <h3>Order {order.id}</h3>
                  <p>{order.customer}</p>
                  <p className="staff-order-card__time">Placed {order.placedAt}</p>
                </div>
                <span className="staff-order-card__status">{order.status}</span>
              </button>
            ))}
          </div>
          <footer className="staff-queue__footer">
            <button type="button" className="text-button" onClick={openRemovalConfirm} disabled={!selectedOrder}>
              Remove selected order
            </button>
          </footer>
        </section>

        <section className="staff-details" aria-labelledby="staff-details-heading">
          <h2 id="staff-details-heading">Order details</h2>
          {!selectedOrder ? (
            <div className="staff-empty">Select an order to view the prep checklist.</div>
          ) : (
            <div className="staff-details__content">
              <div className="staff-details__summary">
                <div>
                  <h3>{selectedOrder.customer}</h3>
                  <p className="staff-details__address">{selectedOrder.address}</p>
                  <p className="staff-details__notes">{selectedOrder.notes}</p>
                </div>
                <div className="staff-details__eta">
                  <span className="label">Delivery window</span>
                  <strong>{selectedOrder.deliveryWindow}</strong>
                </div>
              </div>

              <div className="staff-items">
                <h4>Items</h4>
                <ul>
                  {selectedOrder.items.map((item, index) => (
                    <li key={`${selectedOrder.id}-${index}`}>
                      <span>{item.name}</span>
                      <span className="qty">×{item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="staff-actions">
                <button type="button" className="staff-secondary" onClick={openCustomTimeModal}>
                  Set custom ready time
                </button>
                <button type="button" className="staff-primary" onClick={handleMarkReady}>
                  Mark ready for driver
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {modalState?.type === 'confirm-removal' ? (
        <ModalShell
          title="Remove order"
          description="Removing the order takes it out of the kitchen queue. Confirm this order has been handled elsewhere before deleting."
          onClose={() => setModalState(null)}
          actions={
            <>
              <button type="button" className="modal-button secondary" onClick={() => setModalState(null)}>
                Keep order
              </button>
              <button type="button" className="modal-button destructive" onClick={handleRemoveOrder}>
                Remove order
              </button>
            </>
          }
        />
      ) : null}

      {modalState?.type === 'custom-time' && selectedOrder ? (
        <ModalShell
          title="Custom delivery estimate"
          description={`Override the current delivery window for order ${selectedOrder.id}.`}
          onClose={() => setModalState(null)}
          actions={
            <>
              <button type="button" className="modal-button secondary" onClick={() => setModalState(null)}>
                Cancel
              </button>
              <button type="button" className="modal-button primary" onClick={submitCustomTime}>
                Save estimate
              </button>
            </>
          }
        >
          <div className="modal-field">
            <label htmlFor="custom-hours">Hours</label>
            <select
              id="custom-hours"
              value={customTimeForm.hours}
              onChange={(event) => setCustomTimeForm((prev) => ({ ...prev, hours: event.target.value }))}
            >
              {['0', '1', '2', '3', '4'].map((hour) => (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              ))}
            </select>
          </div>
          <div className="modal-field">
            <label htmlFor="custom-minutes">Minutes</label>
            <select
              id="custom-minutes"
              value={customTimeForm.minutes}
              onChange={(event) => setCustomTimeForm((prev) => ({ ...prev, minutes: event.target.value }))}
            >
              {['0', '10', '15', '20', '30', '40', '45', '50', '55'].map((minute) => (
                <option key={minute} value={minute}>
                  {minute}
                </option>
              ))}
            </select>
          </div>
        </ModalShell>
      ) : null}

      {modalState?.type === 'first-password' || modalState?.type === 'password' ? (
        <ModalShell
          title={modalState.type === 'first-password' ? 'Welcome! Update your password' : 'Change staff password'}
          description={
            modalState.type === 'first-password'
              ? 'For security, change the temporary password provided by your administrator before continuing.'
              : 'Choose a new password that meets the platform security requirements.'
          }
          onClose={() => setModalState(null)}
          actions={
            <>
              <button type="button" className="modal-button secondary" onClick={() => setModalState(null)}>
                Not now
              </button>
              <button
                type="button"
                className="modal-button primary"
                onClick={handlePasswordSubmit}
                disabled={!passwordValid || passwordMismatch}
              >
                Save password
              </button>
            </>
          }
        >
          <div className="modal-field">
            <label htmlFor="staff-new-password">New password</label>
            <input
              id="staff-new-password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
              autoComplete="new-password"
            />
          </div>
          <div className="modal-field">
            <label htmlFor="staff-confirm-password">Confirm password</label>
            <input
              id="staff-confirm-password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })}
              autoComplete="new-password"
            />
          </div>
          <button
            type="button"
            className="modal-inline-toggle"
            onClick={() =>
              setPasswordForm((prev) => ({ ...prev, showRequirements: !prev.showRequirements }))
            }
          >
            {passwordForm.showRequirements ? 'Hide requirements' : 'Show requirements'}
          </button>
          {passwordForm.showRequirements ? (
            <p className="modal-password-requirements">
              Passwords must be at least six characters long and include an uppercase letter, lowercase letter, and number.
            </p>
          ) : null}
          {!passwordValid && passwordForm.newPassword.length > 0 ? (
            <p className="modal-helper">Password does not meet complexity requirements.</p>
          ) : null}
          {passwordMismatch ? <p className="modal-helper">Passwords must match.</p> : null}
        </ModalShell>
      ) : null}
    </div>
  );
}
