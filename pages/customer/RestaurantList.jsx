import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRestaurantData } from '../../contexts/RestaurantDataContext';
import { useCustomerSession } from '../../contexts/CustomerSessionContext';
import AppHeader from '../../components/AppHeader';
import './RestaurantList.css';

export default function RestaurantList() {
  const { restaurants, isRestaurantOpen, describeTodaysHours } = useRestaurantData();
  const { selectRestaurant, searchAddress, setAddressFromSearch } = useCustomerSession();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.address) {
      setAddressFromSearch(location.state.address);
    }
  }, [location.state, setAddressFromSearch]);

  function handleViewMenu(restaurant) {
    selectRestaurant(restaurant.id);
    navigate(`/restaurant/${restaurant.id}`);
  }

  return (
    <>
      <AppHeader />
      <div className="restaurant-page">
        <header className="restaurant-page__hero">
          <div>
            <p className="eyebrow">Browse and order</p>
            <h1>Restaurants partnering with FrontDash</h1>
            <p>
              {searchAddress
                ? `Showing options delivering to ${searchAddress}.`
                : 'Choose a restaurant to explore menus and start an order.'}
            </p>
          </div>
        </header>

        <section className="restaurant-grid" aria-label="Restaurants">
          {restaurants.map((restaurant) => {
            const openNow = isRestaurantOpen(restaurant);
            const today = describeTodaysHours(restaurant);
            return (
              <article key={restaurant.id} className="restaurant-card">
                <header>
                  <div>
                    <h2>{restaurant.name}</h2>
                    <p className="restaurant-card__cuisine">{restaurant.cuisine}</p>
                  </div>
                  <span className={`badge ${openNow ? 'badge--open' : 'badge--closed'}`}>
                    {openNow ? 'Open now' : 'Closed'}
                  </span>
                </header>
                <dl className="restaurant-card__meta">
                  <div>
                    <dt>Hours today</dt>
                    <dd>{today.closed ? 'Closed today' : today.label}</dd>
                  </div>
                  <div>
                    <dt>Contact</dt>
                    <dd>{restaurant.phone}</dd>
                  </div>
                  <div>
                    <dt>Address</dt>
                    <dd>
                      {restaurant.address.building} {restaurant.address.street}, {restaurant.address.city},{' '}
                      {restaurant.address.state}
                    </dd>
                  </div>
                </dl>
                <button
                  type="button"
                  className="restaurant-card__cta"
                  onClick={() => handleViewMenu(restaurant)}
                  disabled={!openNow}
                >
                  View menu
                </button>
                {!openNow ? (
                  <p className="restaurant-card__helper" role="note">
                    Ordering will reopen when the restaurant is operating.
                  </p>
                ) : null}
              </article>
            );
          })}
        </section>
      </div>
    </>
  );
}
