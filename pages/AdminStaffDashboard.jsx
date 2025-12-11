import React, { useState, useEffect, useCallback } from 'react';
import AppHeader from '../components/AppHeader';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = 'http://localhost:8080/api';

export default function AdminStaffDashboard() {
  const { logout } = useAuth();
  const [mode, setMode] = useState('staff'); // 'staff' | 'admin'
  const [orders, setOrders] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [message, setMessage] = useState('');

  const showMessage = useCallback((text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
  }, []);

  useEffect(() => {
    if (mode === 'staff') {
      fetchOrders();
      const interval = setInterval(fetchOrders, 5000);
      return () => clearInterval(interval);
    }
    if (mode === 'admin') {
      fetchApprovals();
      fetchWithdrawals();
    }
  }, [mode]);

  async function fetchOrders() {
    try {
      const response = await fetch(`${API_BASE}/orders/queue`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  }

  async function updateStatus(orderId, status) {
    setOrders((prev) => prev.map((o) => (o.orderId === orderId ? { ...o, orderStatus: status } : o)));
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status?status=${status}`, { method: 'PUT' });
      if (res.ok) showMessage(`Order ${orderId} marked ${status}`);
    } catch (err) {
      console.error('Failed to update status', err);
    }
  }

  async function fetchApprovals() {
    try {
      const res = await fetch(`${API_BASE}/approval/pending`);
      if (res.ok) {
        const data = await res.json();
        setApprovals(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load approvals', err);
    }
  }

  async function decideApproval(restaurantId, decision) {
    try {
      const res = await fetch(`${API_BASE}/approval/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId, status: decision, adminId: 'admin-001' }),
      });
      if (res.ok) {
        showMessage(`Restaurant ${restaurantId} ${decision}`);
        fetchApprovals();
      }
    } catch (err) {
      console.error('Failed to decide approval', err);
    }
  }

  async function fetchWithdrawals() {
    try {
      const res = await fetch(`${API_BASE}/withdrawals/pending`);
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load withdrawals', err);
    }
  }

  async function decideWithdrawal(restaurantId, decision, reason = '') {
    try {
      const path =
        decision === 'approve'
          ? `${API_BASE}/withdrawals/${encodeURIComponent(restaurantId)}/approve`
          : `${API_BASE}/withdrawals/${encodeURIComponent(restaurantId)}/deny`;
      const opts =
        decision === 'approve'
          ? { method: 'PUT' }
          : { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }) };

      const res = await fetch(path, opts);
      if (res.ok) {
        showMessage(`Withdrawal ${decision}d for ${restaurantId}`);
        fetchWithdrawals();
      }
    } catch (err) {
      console.error('Failed to process withdrawal', err);
    }
  }

  return (
    <>
      <AppHeader />
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>{mode === 'admin' ? 'Admin Portal' : 'Kitchen Order Queue'}</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setMode(mode === 'admin' ? 'staff' : 'admin')} style={{ padding: '10px' }}>
              Switch to {mode === 'admin' ? 'Kitchen' : 'Admin'}
            </button>
            <button onClick={logout} style={{ padding: '10px' }}>
              Logout
            </button>
          </div>
        </div>

        {message && <div style={{ marginBottom: '15px', color: 'green' }}>{message}</div>}

        {mode === 'staff' && (
          <div style={{ display: 'grid', gap: '15px' }}>
            {orders.length === 0 ? (
              <p>No active orders.</p>
            ) : (
              orders.map((order) => (
                <div key={order.orderId} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
                  <h3>
                    Order #{String(order.orderId).slice(0, 8)} <small>({order.orderStatus})</small>
                  </h3>
                  <ul>
                    {order.items &&
                      order.items.map((item, i) => (
                        <li key={i}>
                          {item.quantity}x {item.foodName || item.name}
                        </li>
                      ))}
                  </ul>
                  <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                    {order.orderStatus?.toLowerCase() === 'placed' && (
                      <button onClick={() => updateStatus(order.orderId, 'preparing')}>Start Cooking</button>
                    )}
                    {order.orderStatus?.toLowerCase() === 'preparing' && (
                      <button onClick={() => updateStatus(order.orderId, 'delivered')}>Mark Ready/Picked Up</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {mode === 'admin' && (
          <div style={{ display: 'grid', gap: '20px' }}>
            <section>
              <h2>Pending Approvals</h2>
              {approvals.length === 0 ? (
                <p>No pending restaurant approvals.</p>
              ) : (
                approvals.map((a) => (
                  <div key={a.restaurantId || a.id} style={{ border: '1px solid #ccc', padding: '12px', borderRadius: '8px', marginBottom: '10px' }}>
                    <div>
                      <strong>{a.name || a.restaurantName || a.restaurant_id}</strong> ({a.restaurantId || a.id})
                    </div>
                    <div style={{ marginTop: '8px', display: 'flex', gap: '10px' }}>
                      <button onClick={() => decideApproval(a.restaurantId || a.id, 'approved')}>Approve</button>
                      <button onClick={() => decideApproval(a.restaurantId || a.id, 'rejected')}>Deny</button>
                    </div>
                  </div>
                ))
              )}
            </section>

            <section>
              <h2>Withdrawal Requests</h2>
              {withdrawals.length === 0 ? (
                <p>No pending withdrawals.</p>
              ) : (
                withdrawals.map((w) => (
                  <div key={w.restaurantId || w.id} style={{ border: '1px solid #ccc', padding: '12px', borderRadius: '8px', marginBottom: '10px' }}>
                    <div>
                      <strong>{w.restaurantName || w.restaurant_id || w.id}</strong>
                    </div>
                    <textarea
                      placeholder="Reason if denying"
                      style={{ width: '100%', marginTop: '8px' }}
                      onChange={(e) => (w._reason = e.target.value)}
                    />
                    <div style={{ marginTop: '8px', display: 'flex', gap: '10px' }}>
                      <button onClick={() => decideWithdrawal(w.restaurantId || w.id, 'approve')}>Approve</button>
                      <button onClick={() => decideWithdrawal(w.restaurantId || w.id, 'deny', w._reason || '')}>Deny</button>
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>
        )}
      </div>
    </>
  );
}
