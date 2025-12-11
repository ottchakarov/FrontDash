// src/components/Sidebar.js
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DatabaseInterface from '../db/DatabaseInterface';

/**
 * Sidebar:
 * - If parent passes restaurantName/status props, prefer them.
 * - Otherwise fetch restaurant info via DatabaseInterface once.
 * - Map internal status values to friendly label + CSS class:
 *     approved  -> "Approved" (green)
 *     anything else -> "Waiting for Approval" (red)
 */
export default function Sidebar({ restaurantName: propName, status: propStatus }) {
  const { logout } = useAuth();

  // Local state: prefer prop values if provided; otherwise we'll populate from DB.
  const [restaurantName, setRestaurantName] = useState(propName ?? 'RESTAURANT NAME');
  const [statusKey, setStatusKey] = useState((propStatus ?? 'pending').toString().toLowerCase());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If parent provided a prop, use it and skip fetching.
    if (propName) {
      setRestaurantName(propName);
      setStatusKey((propStatus ?? 'pending').toString().toLowerCase());
      return;
    }

    let mounted = true;
    setLoading(true);
    DatabaseInterface.getRestaurantInfo()
      .then((info) => {
        if (!mounted || !info) return;
        setRestaurantName(info.name ?? 'RESTAURANT NAME');
        setStatusKey((info.status ?? 'pending').toString().toLowerCase());
      })
      .catch((err) => {
        // for demo we silently fallback; in prod log/report appropriately
        // console.error(err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [propName, propStatus]);

  // derive friendly label and class from statusKey
  const isApproved = statusKey === 'approved' || statusKey === 'active';
  const statusLabel = isApproved ? 'Approved' : 'Waiting for Approval';
  const statusClass = isApproved ? 'approved' : 'waiting';

  const linkClass = ({ isActive }) => `nav-item ${isActive ? 'active-link' : ''}`;

  return (
    <aside className="sidebar" role="navigation" aria-label="Restaurant navigation">
      <div className="sidebar-card">
        <div className="restaurant-pill">
          <span className="rest-name">{loading ? 'Loading...' : restaurantName}</span>
          
        </div>

        <nav className="nav-list" aria-label="Sidebar links">
          <NavLink to="/owner" className={linkClass}>Restaurant Home Page</NavLink>
          <NavLink to="/owner/update-menu" className={linkClass}>Update Food Menu</NavLink>
          <NavLink to="/owner/account-settings" className={linkClass}>Account Settings</NavLink>
          <NavLink to="/owner/withdraw" className={linkClass}>Withdraw From FrontDash</NavLink>
        </nav>

        <div className="logout-wrap">
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </div>
    </aside>
  );
}
