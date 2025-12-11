import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCustomerSession } from '../../contexts/CustomerSessionContext';
import AppHeader from '../../components/AppHeader';
import './RestaurantList.css';

export default function RestaurantList() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { searchAddress, setAddressFromSearch } = useCustomerSession();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.address) {
      setAddressFromSearch(location.state.address);
    }

    async function fetchRestaurants() {
      try {
        const response = await fetch('http://localhost:8080/api/restaurants');
        if (response.ok) {
          const data = await response.json();
          setRestaurants(data);
        }
      } catch (error) {
        console.error("Network error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurants();
  }, [location.state, setAddressFromSearch]);

  function handleViewMenu(id) {
    navigate(`/restaurant/${id}`);
  }

  // HELPER: Get a random yummy image based on cuisine
  function getPlaceholderImage(cuisine) {
    const type = cuisine ? cuisine.toLowerCase() : 'food';
    return `https://source.unsplash.com/800x600/?${type},restaurant`;
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

        {loading ? (
           <div style={{padding: '60px', textAlign: 'center', opacity: 0.6}}>
             <h2>Loading neighborhood favorites...</h2>
           </div>
        ) : (
          <section className="restaurant-grid" aria-label="Restaurants">
            {restaurants.length === 0 ? (
                <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '40px'}}>
                    <h3>No restaurants found.</h3>
                    <p>Try logging in as an owner and creating one!</p>
                </div>
            ) : (
                restaurants.map((restaurant, index) => {
                  // MAPPING & DEFAULTS
                  const id = restaurant.restaurantId || restaurant.id;
                  const name = restaurant.restaurantName || restaurant.name || "Unnamed Restaurant";
                  const cuisine = restaurant.cuisineType || restaurant.cuisine || "Local Cuisine";
                  const phone = restaurant.phone || "No contact info";
                  
                  const city = restaurant.city || (restaurant.address && restaurant.address.city) || 'Local';
                  const street = restaurant.street || (restaurant.address && restaurant.address.street) || '';
                  
                  const openNow = !restaurant.forceClosed;
                  
                  // IMAGE LOGIC: Use DB image if exists, otherwise use Unsplash
                  // We add 'index' to the URL to prevent all images looking identical
                  const imageUrl = restaurant.profilePictureRef 
                    ? restaurant.profilePictureRef 
                    : `https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80`; 

                  return (
                    <article key={id} className="restaurant-card" style={{overflow: 'hidden'}}>
                      {/* NEW: VISUAL HEADER IMAGE */}
                      <div style={{
                          height: '140px', 
                          background: `#f0f0f0 url(${imageUrl}) center/cover no-repeat`
                      }}></div>

                      <div style={{padding: '1.5rem'}}>
                        <header>
                          <div>
                            <h2 style={{marginBottom: '0.25rem'}}>{name}</h2>
                            <p className="restaurant-card__cuisine" style={{color: '#666', fontSize: '0.9rem'}}>
                                {cuisine} • {city}
                            </p>
                          </div>
                          <span className={`badge ${openNow ? 'badge--open' : 'badge--closed'}`}>
                            {openNow ? 'Open' : 'Closed'}
                          </span>
                        </header>
                        
                        <dl className="restaurant-card__meta" style={{marginTop: '1rem'}}>
                          <div>
                            <dt>Status</dt>
                            <dd>{openNow ? 'Accepting orders' : 'Currently unavailable'}</dd>
                          </div>
                          <div>
                            <dt>Contact</dt>
                            <dd>{phone}</dd>
                          </div>
                        </dl>

                        <button
                          type="button"
                          className="restaurant-card__cta"
                          onClick={() => handleViewMenu(id)}
                          style={{marginTop: '1.5rem', width: '100%'}}
                          disabled={!openNow}
                        >
                          View Menu
                        </button>
                      </div>
                    </article>
                  );
                })
            )}
          </section>
        )}
      </div>
    </>
  );
}