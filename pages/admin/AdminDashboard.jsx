// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './AdminDashboard.css';

const API_BASE = 'http://localhost:8080/api';
const ADMIN_ID = 'admin-001'; // or whatever your backend expects

async function apiJson(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const opts = { ...options };

  if (opts.body && typeof opts.body !== 'string') {
    opts.headers = { ...(opts.headers || {}), 'Content-Type': 'application/json' };
    opts.body = JSON.stringify(opts.body);
  }

  const res = await fetch(url, opts);
  const text = await res.text();

  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const json = JSON.parse(text);
      msg = json.message || json.error || msg;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getOrderId(o) {
  return o.orderId || o.order_id || o.id;
}
function getDriverId(d) {
  return d.driver_id || d.driverId || d.id;
}
function getPersonName(obj) {
  return `${obj.first_name || obj.firstName || ''} ${obj.last_name || obj.lastName || ''}`.trim();
}

export default function AdminStaffDashboard({ initialMode = 'admin' }) {
  const { logout } = useAuth();
  // 'admin' or 'staff'
  const [mode, setMode] = useState(initialMode);

  // which subsection is shown
  const [adminPage, setAdminPage] = useState('home'); // 'home' | 'approvals' | 'staff' | 'drivers'
  const [staffPage, setStaffPage] = useState('staffHome'); // 'staffHome' | 'staffOrders'

  // counts
  const [approvalCount, setApprovalCount] = useState(0);
  const [withdrawCount, setWithdrawCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);

  // data lists
  const [approvals, setApprovals] = useState([]);
  const [withdraws, setWithdraws] = useState([]);
  const [withdrawReasons, setWithdrawReasons] = useState({});
  const [staff, setStaff] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [orderQueue, setOrderQueue] = useState([]);

  // order details
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrderText, setSelectedOrderText] = useState('');

  // popups & actions
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('Are you sure you want to continue?');
  const [pendingAction, setPendingAction] = useState(null);

  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [addDriverOpen, setAddDriverOpen] = useState(false);
  const [customTimeOpen, setCustomTimeOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  // forms
  const [staffFirstName, setStaffFirstName] = useState('');
  const [staffLastName, setStaffLastName] = useState('');
  const [driverFirstName, setDriverFirstName] = useState('');
  const [driverLastName, setDriverLastName] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');

  const [customHours, setCustomHours] = useState('');
  const [customMinutes, setCustomMinutes] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ----- DATA LOADERS -----
  async function refreshAdminCounts() {
    try {
      const approvalsRes = await apiJson('/approval/pending', { method: 'GET' });
      setApprovalCount(Array.isArray(approvalsRes) ? approvalsRes.length : 0);
    } catch {
      setApprovalCount(0);
    }

    try {
      const withdrawRes = await apiJson('/withdrawals/pending', { method: 'GET' });
      setWithdrawCount(Array.isArray(withdrawRes) ? withdrawRes.length : 0);
    } catch {
      setWithdrawCount(0);
    }
  }

  async function refreshApprovals() {
    try {
      const res = await apiJson('/approval/pending', { method: 'GET' });
      setApprovals(Array.isArray(res) ? res : []);
    } catch {
      setApprovals([]);
    }
  }

  async function refreshWithdrawals() {
    try {
      const res = await apiJson('/withdrawals/pending', { method: 'GET' });
      setWithdraws(Array.isArray(res) ? res : []);
    } catch {
      setWithdraws([]);
    }
  }

  async function refreshStaff() {
    try {
      const res = await apiJson('/staff', { method: 'GET' });
      setStaff(Array.isArray(res) ? res : []);
    } catch {
      setStaff([]);
    }
  }

  async function refreshDrivers() {
    try {
      const res = await apiJson('/drivers', { method: 'GET' });
      setDrivers(Array.isArray(res) ? res : []);
    } catch {
      setDrivers([]);
    }
  }

  async function refreshOrderQueue() {
    try {
      const res = await apiJson('/orders/queue', { method: 'GET' });
      const list = Array.isArray(res) ? res : [];
      setOrderQueue(list);
      setOrdersCount(list.length);
    } catch {
      setOrderQueue([]);
      setOrdersCount(0);
    }
  }

  // initial load & when switching modes
  useEffect(() => {
    if (mode === 'admin') {
      refreshAdminCounts();
      refreshApprovals();
      refreshWithdrawals();
      refreshStaff();
      refreshDrivers();
    } else {
      refreshOrderQueue();
      refreshDrivers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // ----- MODE & NAVIGATION -----
  const handleToggleMode = () => {
    setMode((prev) => (prev === 'admin' ? 'staff' : 'admin'));
    setAdminPage('home');
    setStaffPage('staffHome');
    setSelectedOrderId(null);
    setSelectedOrderText('');
  };

  const handleAdminNav = (target) => {
    setAdminPage(target);
    if (target === 'home') refreshAdminCounts();
    if (target === 'approvals') {
      refreshApprovals();
      refreshWithdrawals();
    }
    if (target === 'staff') refreshStaff();
    if (target === 'drivers') refreshDrivers();
  };

  const handleStaffNav = (target) => {
    setStaffPage(target);
    if (target === 'staffHome') refreshOrderQueue();
    if (target === 'staffOrders') {
      refreshOrderQueue();
      refreshDrivers();
    }
  };

  // ----- CONFIRM POPUP -----
  const openConfirm = (action, text) => {
    setPendingAction(action);
    setConfirmText(text || 'Are you sure you want to continue?');
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setPendingAction(null);
  };

  const handleConfirm = async () => {
    if (!pendingAction) {
      closeConfirm();
      return;
    }
    try {
      if (pendingAction.type === 'driver-inactivate') {
        await apiJson('/drivers/inactivate', {
          method: 'POST',
          body: { id: pendingAction.id },
        });
        await refreshDrivers();
        await refreshAdminCounts();
      } else if (pendingAction.type === 'staff-delete') {
        await apiJson(`/staff/${encodeURIComponent(pendingAction.id)}`, {
          method: 'DELETE',
        });
        await refreshStaff();
        await refreshAdminCounts();
      } else if (pendingAction.type === 'approval-decision') {
        await apiJson('/approval/decide', {
          method: 'POST',
          body: {
            restaurantId: pendingAction.restaurantId,
            status: pendingAction.decision, // 'approved' or 'rejected'
            adminId: ADMIN_ID,
          },
        });
        await refreshApprovals();
        await refreshAdminCounts();
      } else if (pendingAction.type === 'withdraw-decision') {
        if (pendingAction.decision === 'approve') {
          await apiJson(`/withdrawals/${encodeURIComponent(pendingAction.restaurantId)}/approve`, {
            method: 'PUT',
          });
        } else {
          await apiJson(`/withdrawals/${encodeURIComponent(pendingAction.restaurantId)}/deny`, {
            method: 'PUT',
            body: { reason: pendingAction.reason || 'Denied' },
          });
        }
        await refreshWithdrawals();
        await refreshAdminCounts();
      } else if (pendingAction.type === 'assign-driver') {
        await apiJson('/orders/assign-driver', {
          method: 'POST',
          body: { orderId: pendingAction.orderId, driverId: pendingAction.driverId },
        });
        await refreshOrderQueue();
        await refreshDrivers();
      } else if (pendingAction.type === 'order-deliver-remove') {
        await apiJson('/orders/deliver', {
          method: 'POST',
          body: { orderId: pendingAction.orderId, deliveredAt: '' },
        });
        setSelectedOrderId(null);
        setSelectedOrderText('');
        await refreshOrderQueue();
        await refreshDrivers();
      }
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    } finally {
      closeConfirm();
    }
  };

  // ----- STAFF / DRIVERS ADD -----
  function generatePassword(length = 10) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$';
    let out = '';
    for (let i = 0; i < length; i += 1) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
  }

  const handleAutoGeneratePassword = () => {
    const pwd = generatePassword();
    setGeneratedPassword(pwd);
    alert(`Generated password:\n\n${pwd}\n\nWrite this down for the staff member.`);
  };

  const handleAddStaff = async () => {
    if (!staffFirstName.trim() || !staffLastName.trim()) {
      alert('Please enter both first and last name for the staff member.');
      return;
    }
    const pwd = generatedPassword || generatePassword();
    try {
      await apiJson('/staff', {
        method: 'POST',
        body: { firstName: staffFirstName.trim(), lastName: staffLastName.trim(), password: pwd },
      });
      alert(`Staff created.\nTemporary password: ${pwd}`);
      setStaffFirstName('');
      setStaffLastName('');
      setGeneratedPassword('');
      setAddStaffOpen(false);
      await refreshStaff();
      await refreshAdminCounts();
    } catch (err) {
      alert(`Add staff failed: ${err.message}`);
    }
  };

  const handleAddDriver = async () => {
    if (!driverFirstName.trim() || !driverLastName.trim()) {
      alert('Please enter both first and last name for the driver.');
      return;
    }
    try {
      await apiJson('/drivers', {
        method: 'POST',
        body: { firstName: driverFirstName.trim(), lastName: driverLastName.trim() },
      });
      setDriverFirstName('');
      setDriverLastName('');
      setAddDriverOpen(false);
      await refreshDrivers();
      await refreshAdminCounts();
    } catch (err) {
      alert(`Add driver failed: ${err.message}`);
    }
  };

  // ----- ORDERS / STAFF SIDE -----
  async function handleSelectOrder(orderId) {
    setSelectedOrderId(orderId);
    setSelectedOrderText('Loading order summary...');
    try {
      const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderId)}/summary`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      let text = await res.text();
      if (text.startsWith('"') && text.endsWith('"')) {
        text = text.slice(1, -1).replaceAll('\\n', '\n');
      }
      setSelectedOrderText(text);
    } catch (err) {
      setSelectedOrderText(`Could not load summary: ${err.message}`);
    }
    await refreshDrivers();
  }

  const handlePromptRemoveOrder = () => {
    if (!selectedOrderId) {
      alert('Select an order first.');
      return;
    }
    openConfirm(
      { type: 'order-deliver-remove', orderId: selectedOrderId },
      `Remove order "${selectedOrderId}" from queue?`,
    );
  };

  const handleOpenCustomTime = () => {
    if (!selectedOrderId) {
      alert('Select an order first.');
      return;
    }
    setCustomHours('');
    setCustomMinutes('');
    setCustomTimeOpen(true);
  };

  const handleSubmitCustomTime = async () => {
    if (!selectedOrderId) {
      setCustomTimeOpen(false);
      return;
    }
    const hours = parseInt(customHours || '0', 10);
    const minutes = parseInt(customMinutes || '0', 10);

    if (!Number.isInteger(hours) || hours < 0 || hours > 23) {
      alert('Hours must be an integer from 0 to 23.');
      return;
    }
    if (!Number.isInteger(minutes) || minutes < 0 || minutes > 59) {
      alert('Minutes must be an integer from 0 to 59.');
      return;
    }

    const totalMinutes = hours * 60 + minutes;
    try {
      await apiJson(`/orders/${encodeURIComponent(selectedOrderId)}/eta`, {
        method: 'POST',
        body: { minutes: totalMinutes },
      });
      await handleSelectOrder(selectedOrderId);
    } catch (err) {
      alert(`Failed to set ETA: ${err.message}`);
    } finally {
      setCustomTimeOpen(false);
    }
  };

  // ----- PASSWORD CHANGE (simple demo) -----
  const handleSubmitPasswordChange = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    // TODO: call backend endpoint to actually change password
    alert('Password changed (demo; wire to backend).');
    setNewPassword('');
    setConfirmPassword('');
    setChangePasswordOpen(false);
  };

  // ----- RECOMMENDED DRIVERS -----
  const selectedOrder = orderQueue.find((o) => getOrderId(o) === selectedOrderId) || null;
  const assignedDriverId = selectedOrder ? (selectedOrder.driver_id || selectedOrder.driverId || null) : null;

  const activeDrivers = drivers.filter((d) => {
    const active = d.is_active ?? d.isActive ?? 1;
    return Number(active) === 1;
  });

  let recommendedDrivers = [];

  if (assignedDriverId) {
    const assigned = activeDrivers.find((d) => String(getDriverId(d)) === String(assignedDriverId));
    const label =
      assigned && getPersonName(assigned)
        ? getPersonName(assigned)
        : `Driver ${assignedDriverId}`;
    recommendedDrivers = [{ id: assignedDriverId, label, locked: true }];
  } else {
    const lockedIds = new Set(
      orderQueue.map((o) => o.driver_id || o.driverId).filter(Boolean).map(String),
    );
    const available = activeDrivers.filter((d) => !lockedIds.has(String(getDriverId(d))));
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    recommendedDrivers = shuffled.slice(0, 3).map((d) => ({
      id: getDriverId(d),
      label: getPersonName(d) || `Driver ${getDriverId(d)}`,
      locked: false,
    }));
  }

  const handleClickRecommendedDriver = (driver) => {
    if (!selectedOrderId) {
      alert('Select an order first.');
      return;
    }
    if (driver.locked) return;
    openConfirm(
      {
        type: 'assign-driver',
        orderId: selectedOrderId,
        driverId: driver.id,
      },
      `Assign driver "${driver.label}" to order "${selectedOrderId}"?`,
    );
  };

  // ----- RENDER -----
  return (
    <div className="container">
      {/* Sidebar */}
      <aside className="sidebar" id="sidebar">
        <div className="profile">
          <h3 id="sidebarName">{mode === 'admin' ? 'Admin' : 'Staff'}</h3>
        </div>
        <div className="menu-card">
          <nav className="menu" id="sidebarMenu">
            {/* Admin menu */}
            <ul className={`admin-menu ${mode !== 'admin' ? 'hidden' : ''}`}>
              <li>
                <a
                  href="#admin-home"
                  data-admin-target="home"
                  className={adminPage === 'home' ? 'active' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    handleAdminNav('home');
                  }}
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#admin-approvals"
                  data-admin-target="approvals"
                  className={adminPage === 'approvals' ? 'active' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    handleAdminNav('approvals');
                  }}
                >
                  Approvals/Withdraws
                </a>
              </li>
              <li>
                <a
                  href="#admin-staff"
                  data-admin-target="staff"
                  className={adminPage === 'staff' ? 'active' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    handleAdminNav('staff');
                  }}
                >
                  Staff
                </a>
              </li>
              <li>
                <a
                  href="#admin-drivers"
                  data-admin-target="drivers"
                  className={adminPage === 'drivers' ? 'active' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    handleAdminNav('drivers');
                  }}
                >
                  Drivers
                </a>
              </li>
            </ul>

            {/* Staff menu */}
            <ul className={`staff-menu ${mode !== 'staff' ? 'hidden' : ''}`}>
              <li>
                <a
                  href="#staff-home"
                  data-staff-target="staffHome"
                  className={staffPage === 'staffHome' ? 'active' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    handleStaffNav('staffHome');
                  }}
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#staff-orders"
                  data-staff-target="staffOrders"
                  className={staffPage === 'staffOrders' ? 'active' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    handleStaffNav('staffOrders');
                  }}
                >
                  Orders
                </a>
              </li>
            </ul>
          </nav>

          <button
            className="logout-btn"
            type="button"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <h1 id="headerTitle" className="floating-title">
          {mode === 'admin' ? 'Administrator' : 'Staff'}
        </h1>
        <header>
          <button className="switch-btn" type="button" onClick={handleToggleMode}>
            Switch to {mode === 'admin' ? 'Staff' : 'Admin'}
          </button>
          <button
            id="changePasswordMainBtn"
            className="change-password-btn"
            type="button"
            onClick={() => setChangePasswordOpen(true)}
          >
            Change Password
          </button>
        </header>

        {/* ===== ADMIN PAGES ===== */}
        <section
          id="home"
          className={`page ${mode === 'admin' && adminPage === 'home' ? 'active' : ''}`}
        >
          <h2>Home Page</h2>

          <div className="status-card">
            <p>You Have Approvals</p>
            <span id="approvalCount" className="notification">
              {approvalCount}
            </span>
          </div>

          <div className="status-card">
            <p>You Have Withdraws</p>
            <span id="withdrawCount" className="notification">
              {withdrawCount}
            </span>
          </div>
        </section>

        <section
          id="approvals"
          className={`page ${mode === 'admin' && adminPage === 'approvals' ? 'active' : ''}`}
        >
          <h2>Approvals</h2>
          <div id="approvalList">
            {approvals.length === 0 && (
              <div className="list-item">
                <span>No pending approvals.</span>
              </div>
            )}
            {approvals.map((a) => {
              const restaurantId = a.restaurant_id || a.restaurantId || a.id;
              const name =
                a.name || a.restaurant_name || a.restaurantName || `Restaurant #${restaurantId}`;
              return (
                <div key={restaurantId} className="approval-item">
                  <span className="restaurant-name">{name}</span>
                  <div className="buttons">
                    <button
                      type="button"
                      className="approve"
                      onClick={() =>
                        openConfirm(
                          {
                            type: 'approval-decision',
                            restaurantId,
                            decision: 'approved',
                          },
                          'Approve this restaurant?',
                        )
                      }
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="deny"
                      onClick={() =>
                        openConfirm(
                          {
                            type: 'approval-decision',
                            restaurantId,
                            decision: 'rejected',
                          },
                          'Deny this restaurant?',
                        )
                      }
                    >
                      Deny
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <h2 className="section-header" style={{ marginTop: '24px' }}>
            Withdraws
          </h2>
          <div id="withdrawList">
            {withdraws.length === 0 && (
              <div className="list-item">
                <span>No pending withdraw requests.</span>
              </div>
            )}
            {withdraws.map((w) => {
              const restaurantId = w.restaurantId || w.restaurant_id || w.id;
              const title =
                w.restaurantName ||
                w.restaurant_name ||
                w.name ||
                `Restaurant #${restaurantId}`;
              const message =
                w.withdrawDescription || w.withdraw_description || w.description || '';
              const reasonValue = withdrawReasons[restaurantId] || '';
              return (
                <div key={restaurantId} className="withdraw-item">
                  <div className="withdraw-header">
                    <span className="restaurant-name">{title}</span>
                  </div>
                  <div className="withdraw-content open">
                    <div className="withdraw-message" style={{ marginBottom: 10 }}>
                      <strong>Withdraw request:</strong>
                      <div style={{ marginTop: 6 }}>
                        {message || '(no message provided)'}
                      </div>
                    </div>

                    <textarea
                      className="deny-reason"
                      placeholder="Reason for denial (only if denying)"
                      value={reasonValue}
                      onChange={(e) =>
                        setWithdrawReasons((prev) => ({
                          ...prev,
                          [restaurantId]: e.target.value,
                        }))
                      }
                    />

                    <div className="buttons">
                      <button
                        type="button"
                        className="approve"
                        onClick={() =>
                          openConfirm(
                            {
                              type: 'withdraw-decision',
                              restaurantId,
                              decision: 'approve',
                              reason: '',
                            },
                            'Approve this withdrawal?',
                          )
                        }
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="deny"
                        onClick={() =>
                          openConfirm(
                            {
                              type: 'withdraw-decision',
                              restaurantId,
                              decision: 'deny',
                              reason: reasonValue,
                            },
                            'Deny this withdrawal?',
                          )
                        }
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section
          id="staff"
          className={`page ${mode === 'admin' && adminPage === 'staff' ? 'active' : ''}`}
        >
          <h2>Staff</h2>
          <div id="staffList">
            {staff.length === 0 && (
              <div className="list-item">
                <span>No staff members yet.</span>
              </div>
            )}
            {staff.map((s) => {
              const id = s.staff_id || s.staffId || s.id;
              const name = getPersonName(s) || id;
              return (
                <div key={id} className="list-item">
                  <span>{name}</span>
                  <div className="buttons">
                    <button
                      type="button"
                      className="remove"
                      onClick={() =>
                        openConfirm(
                          { type: 'staff-delete', id },
                          `Remove staff member "${name}"?`,
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="add-bottom"
            onClick={() => {
              setAddStaffOpen(true);
              setGeneratedPassword('');
            }}
          >
            Add Staff
          </button>
        </section>

        <section
          id="drivers"
          className={`page ${mode === 'admin' && adminPage === 'drivers' ? 'active' : ''}`}
        >
          <h2>Drivers</h2>
          <div id="driverList">
            {drivers.length === 0 && (
              <div className="driver-item">
                <span>No drivers yet.</span>
              </div>
            )}
            {drivers.map((d) => {
              const id = getDriverId(d);
              const name = getPersonName(d) || id;
              return (
                <div key={id} className="driver-item">
                  <span>{name}</span>
                  <div className="buttons">
                    <button
                      type="button"
                      className="remove"
                      onClick={() =>
                        openConfirm(
                          { type: 'driver-inactivate', id },
                          `Remove driver "${name}"?`,
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="add-bottom"
            onClick={() => setAddDriverOpen(true)}
          >
            Add Driver
          </button>
        </section>

        {/* ===== STAFF PAGES ===== */}
        <section
          id="staffHome"
          className={`staff-page ${
            mode === 'staff' && staffPage === 'staffHome' ? 'active' : ''
          }`}
        >
          <h2>Staff Dashboard</h2>
          <div className="status-card">
            <p>You Have Orders That Need Drivers</p>
            <span id="ordersDashboardCount" className="notification">
              {ordersCount}
            </span>
          </div>
        </section>

        <section
          id="staffOrders"
          className={`staff-page ${
            mode === 'staff' && staffPage === 'staffOrders' ? 'active' : ''
          }`}
        >
          <h2>
            Orders{' '}
            <span id="ordersHeaderCount" className="notification small">
              {ordersCount}
            </span>
          </h2>

          {/* ORDER QUEUE */}
          <div className="order-queue">
            <div id="orderQueueList" className="order-queue-list">
              {orderQueue.length === 0 && (
                <div className="order-card">No orders in queue.</div>
              )}
              {orderQueue.slice(0, 5).map((o) => {
                const oid = getOrderId(o);
                return (
                  <div
                    key={oid}
                    className={`order-card ${
                      selectedOrderId === oid ? 'selected' : ''
                    }`}
                    onClick={() => handleSelectOrder(oid)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleSelectOrder(oid);
                    }}
                  >
                    {`Order #${String(oid).slice(0, 8)}`}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ORDER DETAILS */}
          {selectedOrderId && (
            <div id="orderDetails" className="order-details">
              <div className="order-details-main">
                <div className="order-summary">
                  <h3 id="selectedOrderTitle">{`Order #${selectedOrderId}`}</h3>
                  <div className="order-summary-box">
                    <pre
                      id="selectedOrderDescription"
                      style={{ whiteSpace: 'pre-wrap', margin: 0 }}
                    >
                      {selectedOrderText}
                    </pre>
                  </div>
                </div>

                <div className="recommended-drivers">
                  <h4>Recommended Drivers</h4>
                  <div id="recommendedDriverList">
                    {recommendedDrivers.length === 0 && (
                      <p>No active drivers.</p>
                    )}
                    {recommendedDrivers.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        className="driver-btn"
                        disabled={d.locked}
                        onClick={() => handleClickRecommendedDriver(d)}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="order-actions">
                <button
                  type="button"
                  className="custom-btn"
                  onClick={handleOpenCustomTime}
                >
                  Custom
                </button>

                <div className="order-timeline">
                  <div className="timeline-step">
                    <img
                      src="/assets/frontDashIcon.png"
                      alt="Order Sent"
                      className="timeline-icon"
                    />
                    <span className="timeline-label">Order Sent</span>
                  </div>
                  <div className="timeline-line" />
                  <div className="timeline-step">
                    <img
                      src="/assets/shopIcon.png"
                      alt="Order Received"
                      className="timeline-icon"
                    />
                    <span className="timeline-label">Order Received</span>
                  </div>
                  <div className="timeline-line" />
                  <div className="timeline-step">
                    <img
                      src="/assets/vehicleIcon.png"
                      alt="In Route"
                      className="timeline-icon"
                    />
                    <span className="timeline-label">In Route</span>
                  </div>
                  <div className="timeline-line" />
                  <div className="timeline-step">
                    <img
                      src="/assets/homeIcon.png"
                      alt="Delivered"
                      className="timeline-icon"
                    />
                    <span className="timeline-label">Delivered</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="remove-btn"
                  onClick={handlePromptRemoveOrder}
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* ===== POPUPS ===== */}
      {/* Confirm */}
      {confirmOpen && (
        <div
          className="popup-overlay"
          onClick={() => {
            closeConfirm();
          }}
        >
          <div
            className="popup"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <button
              className="close-btn"
              type="button"
              onClick={closeConfirm}
              aria-label="Close"
            >
              &times;
            </button>
            <p>{confirmText}</p>
            <div className="popup-buttons">
              <button type="button" onClick={closeConfirm}>
                Cancel
              </button>
              <button type="button" onClick={handleConfirm}>
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff */}
      {addStaffOpen && (
        <div
          className="popup-overlay"
          onClick={() => {
            setAddStaffOpen(false);
          }}
        >
          <div
            className="popup"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <button
              className="close-btn"
              type="button"
              onClick={() => setAddStaffOpen(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3>Add Staff</h3>

            <label htmlFor="staffFirstName">
              First Name:
            </label>
            <input
              id="staffFirstName"
              type="text"
              value={staffFirstName}
              onChange={(e) => setStaffFirstName(e.target.value)}
              placeholder="Enter first name"
            />

            <label htmlFor="staffLastName">
              Last Name:
            </label>
            <input
              id="staffLastName"
              type="text"
              value={staffLastName}
              onChange={(e) => setStaffLastName(e.target.value)}
              placeholder="Enter last name"
            />

            <div className="popup-buttons">
              <button
                type="button"
                className="auto-generate"
                onClick={handleAutoGeneratePassword}
              >
                Auto-Generate
              </button>
              <button
                type="button"
                className="approve"
                onClick={handleAddStaff}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Driver */}
      {addDriverOpen && (
        <div
          className="popup-overlay"
          onClick={() => {
            setAddDriverOpen(false);
          }}
        >
          <div
            className="popup"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <button
              className="close-btn"
              type="button"
              onClick={() => setAddDriverOpen(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3>Add Driver</h3>

            <label htmlFor="driverFirstName">First Name:</label>
            <input
              id="driverFirstName"
              type="text"
              value={driverFirstName}
              onChange={(e) => setDriverFirstName(e.target.value)}
              placeholder="Enter first name"
            />

            <label htmlFor="driverLastName">Last Name:</label>
            <input
              id="driverLastName"
              type="text"
              value={driverLastName}
              onChange={(e) => setDriverLastName(e.target.value)}
              placeholder="Enter last name"
            />

            <div className="popup-buttons popup-buttons--single">
              <button
                type="button"
                className="approve"
                onClick={handleAddDriver}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom time */}
      {customTimeOpen && (
        <div
          className="popup-overlay"
          onClick={() => {
            setCustomTimeOpen(false);
          }}
        >
          <div
            className="popup"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <button
              className="close-btn"
              type="button"
              onClick={() => setCustomTimeOpen(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3>Custom Delivery Time</h3>
            <label htmlFor="customHours">Hours:</label>
            <input
              id="customHours"
              type="number"
              min="0"
              value={customHours}
              onChange={(e) => setCustomHours(e.target.value)}
            />
            <label htmlFor="customMinutes">Minutes:</label>
            <input
              id="customMinutes"
              type="number"
              min="0"
              max="59"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
            />

            <div className="popup-buttons">
              <button type="button" onClick={handleSubmitCustomTime}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change password */}
      {changePasswordOpen && (
        <div
          className="popup-overlay"
          onClick={() => {
            setChangePasswordOpen(false);
          }}
        >
          <div
            className="popup"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <button
              className="close-btn"
              type="button"
              onClick={() => setChangePasswordOpen(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3>Change Password</h3>

            <label htmlFor="mainNewPassword">New Password:</label>
            <input
              id="mainNewPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />

            <label htmlFor="mainConfirmPassword">Confirm Password:</label>
            <input
              id="mainConfirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
            />

            <div className="password-requirements">
              <ul>
                <li>Minimum of <strong>six characters</strong></li>
                <li>At least <strong>one uppercase</strong></li>
                <li>At least <strong>one lowercase</strong></li>
                <li>At least <strong>one number</strong></li>
              </ul>
            </div>

            <div className="popup-buttons">
              <button
                type="button"
                className="approve"
                onClick={handleSubmitPasswordChange}
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
