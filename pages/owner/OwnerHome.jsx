import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Statistics from '../../components/Statistics';
import DatabaseInterface from '../../db/DatabaseInterface';

export default function OwnerHome() {
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    DatabaseInterface.getRestaurantInfo().then((info) => setRestaurantInfo(info));
    DatabaseInterface.getStatistics().then((data) => setStats(data));
  }, []);

  return (
    <div className="app-root">
      <h1 className="page-title">
        {restaurantInfo?.name
          ? `Welcome to Your Home Page for ${restaurantInfo.name}!`
          : 'Welcome To Your Account Page!'}
      </h1>

      <div className="content">
        <Sidebar restaurantName={restaurantInfo?.name ?? 'Loading...'} status={restaurantInfo?.status} />
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
          </div>
        </main>
      </div>
    </div>
  );
}
