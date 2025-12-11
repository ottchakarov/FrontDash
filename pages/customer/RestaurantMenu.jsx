import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCustomerSession } from '../../contexts/CustomerSessionContext'; // Keep this for Cart
import { calculateCharges, formatCurrency } from '../../utils/orderTotals';
import AppHeader from '../../components/AppHeader';
import './RestaurantMenu.css';

export default function RestaurantMenu() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  // 1. REPLACED FAKE CONTEXT WITH LOCAL STATE
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    restaurantId: selectedRestaurantId,
    selectRestaurant,
    cartEntries,
    incrementItem,
    decrementItem,
    hasItems,
    subtotal,
  } = useCustomerSession();

  const [cartError, setCartError] = useState('');

  // 2. NEW: FETCH REAL DATA FROM BACKEND
  useEffect(() => {
    async function fetchRealData() {
      try {
        // A. Fetch Restaurant Details (Name, Address, etc.)
        // Ensure your Backend has a RestaurantController with @GetMapping("/{id}")
        const resResp = await fetch(`http://localhost:8080/api/restaurants/${restaurantId}`);
        
        if (!resResp.ok) throw new Error("Restaurant not found");
        const resData = await resResp.json();

        // B. Fetch Menu Items (The ones you just saved!)
        const menuResp = await fetch(`http://localhost:8080/api/menu/restaurant/${restaurantId}`);
        const menuData = await menuResp.json();

        // C. Update State
        setRestaurant(resData);
        setMenuItems(menuData);
        setLoading(false);

      } catch (err) {
        console.error("Error loading restaurant:", err);
        setLoading(false);
      }
    }

    if (restaurantId) {
      fetchRealData();
    }
  }, [restaurantId]);

  // 3. NEW: GROUP FLAT MENU ITEMS INTO SECTIONS (Categories)
  const menuSections = useMemo(() => {
    const groups = {};
    
    menuItems.forEach((item) => {
      // Use 'Main' if category is null
      const categoryName = item.category || 'Main Menu'; 
      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }
      groups[categoryName].push(item);
    });

    return Object.keys(groups).map((key, index) => ({
      id: index,
      title: key,
      items: groups[key]
    }));
  }, [menuItems]);

  // 4. SIMPLE OPEN/CLOSE CHECK (Assume open if no data provided)
  const openNow = useMemo(() => {
    if (!restaurant) return false;
    // Check if backend sent 'forceClosed' or similar. Default to true for Demo.
    return restaurant.forceClosed !== true;
  }, [restaurant]);

  const charges = useMemo(() => calculateCharges(subtotal), [subtotal]);

  // Sync Cart Context
  useEffect(() => {
    if (!restaurant) return;
    // Note: Backend uses 'restaurantId', frontend might expect 'id'
    // We handle the mismatch by checking both
    const id = restaurant.restaurantId || restaurant.id;
    if (selectedRestaurantId !== id) {
      selectRestaurant(id);
    }
  }, [restaurant, selectedRestaurantId, selectRestaurant]);

  useEffect(() => {
    if (hasItems && cartError) {
      setCartError('');
    }
  }, [hasItems, cartError]);

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Menu...</div>;
  }

  if (!restaurant) {
    return (
      <>
        <AppHeader />
        <div className="menu-page">
          <div className="menu-page__empty">
            <h1>Restaurant not found</h1>
            <button type="button" onClick={() => navigate('/restaurants')}>
              Back to restaurant list
            </button>
          </div>
        </div>
      </>
    );
  }

  // Helper to safely get address fields (Backend vs Frontend naming)
  const city = restaurant.city || (restaurant.address && restaurant.address.city) || '';
  const state = restaurant.state || (restaurant.address && restaurant.address.state) || '';
  const cuisine = restaurant.cuisineType || restaurant.cuisine || 'Good Food';
  const name = restaurant.restaurantName || restaurant.name;

  function handleCheckoutClick() {
    if (!hasItems) {
      setCartError('Add at least one menu item before checking out.');
      return;
    }
    if (!openNow) {
      setCartError('Ordering is unavailable while the restaurant is closed.');
      return;
    }
    navigate('/checkout');
  }

  return (
    <>
      <AppHeader />
      <div className="menu-page">
        <div className="menu-page__content">
          <section className="menu-page__details">
            <header className="menu-header">
              <div>
                <p className="eyebrow">Menu preview</p>
                <h1>{name}</h1>
                <p className="menu-header__meta">
                  {cuisine} • {city}, {state}
                </p>
                <p className="menu-header__hours">
                   Hours: Open Today
                </p>
              </div>
              <span className={`badge ${openNow ? 'badge--open' : 'badge--closed'}`}>
                {openNow ? 'Open now' : 'Closed'}
              </span>
            </header>

            {!openNow ? (
              <div className="menu-closed" role="alert">
                <p>Ordering is paused while the restaurant is closed.</p>
              </div>
            ) : null}

            <div className="menu-sections">
              {menuSections.length === 0 ? (
                 <p style={{marginTop: '20px'}}>No menu items found. Owner needs to add items!</p>
              ) : (
                menuSections.map((section) => (
                  <section key={section.id} className="menu-section">
                    <h2>{section.title}</h2>
                    <ul>
                      {section.items.map((item) => {
                        // Map Backend fields (id) to Cart expectations
                        const itemId = item.id || item.menuItemId; 
                        
                        const cartEntry = cartEntries.find((entry) => entry.itemId === itemId);
                        const quantity = cartEntry?.quantity ?? 0;
                        
                        // Check availability (Backend uses 'isAvailable' or 'available')
                        const isAvailable = item.isAvailable !== undefined ? item.isAvailable : item.available;
                        const soldOut = isAvailable === false;
                        
                        const disableActions = soldOut || !openNow;
                        
                        // Prepare item for cart (normalize fields)
                        const cartItem = {
                            id: itemId,
                            name: item.name || item.foodName,
                            price: item.price,
                            available: isAvailable
                        };

                        return (
                          <li key={itemId} className={`menu-item ${soldOut ? 'menu-item--sold-out' : ''}`}>
                            <div>
                              <h3>{cartItem.name}</h3>
                              <p>{item.description || item.foodDescription}</p>
                            </div>
                            <div className="menu-item__actions">
                              <span className="menu-item__price">{formatCurrency(item.price)}</span>
                              {quantity === 0 ? (
                                <button
                                  type="button"
                                  className="menu-item__add"
                                  onClick={() => incrementItem(cartItem)}
                                  disabled={disableActions}
                                >
                                  {soldOut ? 'Sold out' : 'Add'}
                                </button>
                              ) : (
                                <div className="quantity-control">
                                  <button
                                    type="button"
                                    onClick={() => decrementItem(itemId)}
                                  >
                                    −
                                  </button>
                                  <span>{quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => incrementItem(cartItem)}
                                    disabled={disableActions}
                                  >
                                    +
                                  </button>
                                </div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))
              )}
            </div>
          </section>

          <aside className="menu-cart" aria-label="Cart summary">
            <div className="menu-cart__inner">
            <header>
              <h2>Your cart</h2>
              <p>{hasItems ? `${cartEntries.length} item types` : 'No items yet'}</p>
            </header>
            <ul className="menu-cart__list">
              {cartEntries.map((entry) => {
                const disableIncrease = !openNow || entry.available === false;
                return (
                  <li key={entry.itemId}>
                    <div>
                      <span className="item-name">{entry.name}</span>
                      <span className="item-meta">{formatCurrency(entry.price)} each</span>
                    </div>
                    <div className="quantity-control">
                      <button type="button" onClick={() => decrementItem(entry.itemId)}>
                        −
                      </button>
                      <span>{entry.quantity}</span>
                      <button
                        type="button"
                        onClick={() => incrementItem({
                          id: entry.itemId,
                          name: entry.name,
                          price: entry.price,
                          available: entry.available,
                        })}
                        disabled={disableIncrease}
                      >
                        +
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <dl className="menu-cart__totals">
              <div>
                <dt>Subtotal</dt>
                <dd>{formatCurrency(charges.subtotal)}</dd>
              </div>
              <div>
                <dt>Estimated tax</dt>
                <dd>{formatCurrency(charges.tax)}</dd>
              </div>
              <div>
                <dt>Delivery & fees</dt>
                <dd>{formatCurrency(charges.fees)}</dd>
              </div>
              <div className="menu-cart__total">
                <dt>Total due</dt>
                <dd>{formatCurrency(charges.total)}</dd>
              </div>
            </dl>

            {cartError ? (
              <p className="menu-cart__error" role="alert">
                {cartError}
              </p>
            ) : null}

            <button type="button" className="menu-cart__checkout" onClick={handleCheckoutClick}>
              Proceed to checkout
            </button>
          </div>
        </aside>
        </div>
      </div>
    </>
  );
}