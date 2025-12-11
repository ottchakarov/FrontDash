import React, { useEffect, useMemo, useState } from 'react';
import AppHeader from '../../components/AppHeader';
import Sidebar from '../../components/Sidebar';
import Statistics from '../../components/Statistics';
import DatabaseInterface from '../../db/DatabaseInterface';
import { useOrders } from '../../contexts/OrderContext';

export default function OwnerHome() {
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const { orders, orderStatuses } = useOrders();

  const activeOrders = useMemo(
    () => orders.filter((order) => order.status !== orderStatuses.COMPLETED).length,
    [orders, orderStatuses]
  );

  useEffect(() => {
    DatabaseInterface.getRestaurantInfo().then(setRestaurantInfo);
    DatabaseInterface.getStatistics().then(setStats);
  }, []);

  return (
    <>
      <AppHeader />
      <div className="app-root">
        <h1 className="page-title">
          {restaurantInfo?.name
            ? `Welcome to Your Home Page for ${restaurantInfo.name}!`
            : 'Welcome To Your Account Page!'}
        </h1>

        <div className="content">
          <Sidebar
            restaurantName={restaurantInfo?.name ?? 'Loading...'}
            status={restaurantInfo?.status}
          />
          <main className="main-panel" aria-live="polite">
            <div className="panel-inner">
              <div className="page-subtitle">Home Page</div>
              <div className="stats-area">
                {!stats ? (
                  <div className="loading">Loading statistics...</div>
                ) : (
                  <Statistics data={stats} />
                )}
              </div>
              <div className="owner-orders-callout" role="status">
                Active orders in queue: <strong>{activeOrders}</strong>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
