import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCustomer } from '../../contexts/CustomerContext';
import './CustomerFlow.css';

export default function SelectRestaurant() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    restaurants,
    selectRestaurant,
    getRestaurantStatus,
    formatOperatingWindow,
    selectedRestaurant,
  } = useCustomer();
  const [alertMessage, setAlertMessage] = useState('');

  const addressFromSearch = location.state?.address ?? '';

  const statuses = useMemo(() => {
    const now = new Date();
    return restaurants.reduce((accumulator, restaurant) => {
      accumulator[restaurant.id] = getRestaurantStatus(restaurant, now);
      return accumulator;
    }, {});
  }, [restaurants, getRestaurantStatus]);

  const handleSelect = (restaurant) => {
    selectRestaurant(restaurant.id);
    const status = getRestaurantStatus(restaurant);
    if (!status.isOpen) {
      const closedCopy = status.todaysHours
        ? `${restaurant.name} is currently closed. Today's hours are ${formatOperatingWindow(status.todaysHours)}.`
        : `${restaurant.name} is closed today. Please choose a different time or restaurant.`;
      setAlertMessage(closedCopy);
      return;
    }

    setAlertMessage('');
    navigate('/customer/menu');
  };

  return (
    <div className="customer-flow">
      <header className="customer-flow__header">
        <h1 className="customer-flow__title">Choose a restaurant</h1>
        <p className="customer-flow__subtitle">
          {addressFromSearch
            ? `Showing locations near ${addressFromSearch}. Select a restaurant to view its menu and place an order.`
            : 'Select a restaurant to view its menu and place an order.'}
        </p>
      </header>

      <div className="customer-flow__grid">
        {restaurants.map((restaurant) => {
          const status = statuses[restaurant.id];
          const isSelected = selectedRestaurant?.id === restaurant.id;
          const isOpen = status?.isOpen;
          return (
            <article key={restaurant.id} className="customer-flow__card">
              <div>
                <h3>{restaurant.name}</h3>
                <p>{restaurant.description}</p>
              </div>

              <div className="customer-flow__meta">
                <span>{restaurant.cuisine}</span>
                <span>{restaurant.averagePrepTime}</span>
              </div>

              <div className="customer-flow__meta">
                <span className={`customer-flow__status ${isOpen ? 'customer-flow__status--open' : 'customer-flow__status--closed'}`}>
                  {isOpen ? 'Open now' : 'Closed'}
                </span>
                <span className="customer-flow__hours">
                  Hours today:{' '}
                  {status?.todaysHours
                    ? formatOperatingWindow(status.todaysHours)
                    : 'Closed'}
                </span>
              </div>

              <p>{restaurant.address}</p>
              <p>{restaurant.contact}</p>

              <button
                type="button"
                className="customer-flow__button"
                onClick={() => handleSelect(restaurant)}
                aria-pressed={isSelected}
              >
                {isOpen ? 'View menu' : 'View details'}
              </button>
            </article>
          );
        })}
      </div>

      {alertMessage ? <div className="customer-flow__alert">{alertMessage}</div> : null}
    </div>
  );
}
