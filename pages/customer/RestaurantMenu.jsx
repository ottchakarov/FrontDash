import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRestaurantData } from '../../contexts/RestaurantDataContext';
import { useCustomerSession } from '../../contexts/CustomerSessionContext';
import { calculateCharges, formatCurrency } from '../../utils/orderTotals';
import AppHeader from '../../components/AppHeader';
import './RestaurantMenu.css';

export default function RestaurantMenu() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { getRestaurantById, getMenuSections, isRestaurantOpen, describeTodaysHours } = useRestaurantData();
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

  const restaurant = useMemo(() => getRestaurantById(restaurantId), [getRestaurantById, restaurantId]);
  const menuSections = useMemo(() => getMenuSections(restaurantId), [getMenuSections, restaurantId]);
  const openNow = useMemo(() => isRestaurantOpen(restaurant), [isRestaurantOpen, restaurant]);
  const todaysHours = useMemo(() => describeTodaysHours(restaurant), [describeTodaysHours, restaurant]);
  const charges = useMemo(() => calculateCharges(subtotal), [subtotal]);

  useEffect(() => {
    if (!restaurant) return;
    if (selectedRestaurantId !== restaurant.id) {
      selectRestaurant(restaurant.id);
    }
  }, [restaurant, selectedRestaurantId, selectRestaurant]);

  useEffect(() => {
    if (hasItems && cartError) {
      setCartError('');
    }
  }, [hasItems, cartError]);

  if (!restaurant) {
    return (
      <>
        <AppHeader />
        <div className="menu-page">
          <div className="menu-page__empty">
            <h1>Restaurant not found</h1>
            <p>The restaurant you selected is no longer available.</p>
            <button type="button" onClick={() => navigate('/restaurants')}>
              Back to restaurant list
            </button>
          </div>
        </div>
      </>
    );
  }

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
                <h1>{restaurant.name}</h1>
                <p className="menu-header__meta">
                  {restaurant.cuisine} • {restaurant.address.city}, {restaurant.address.state}
                </p>
                <p className="menu-header__hours">
                  {todaysHours.closed ? 'Closed today' : `Hours today: ${todaysHours.label}`}
                </p>
              </div>
              <span className={`badge ${openNow ? 'badge--open' : 'badge--closed'}`}>
                {openNow ? 'Open now' : 'Closed'}
              </span>
            </header>

            {!openNow ? (
              <div className="menu-closed" role="alert">
                <p>
                  Ordering is paused while the restaurant is closed. Browse the menu and come back when they reopen.
                </p>
              </div>
            ) : null}

            <div className="menu-sections">
              {menuSections.map((section) => (
                <section key={section.id} className="menu-section" aria-labelledby={`section-${section.id}`}>
                  <h2 id={`section-${section.id}`}>{section.title}</h2>
                  <ul>
                    {section.items.map((item) => {
                      const cartEntry = cartEntries.find((entry) => entry.itemId === item.id);
                      const quantity = cartEntry?.quantity ?? 0;
                      const soldOut = !item.available;
                      const disableActions = soldOut || !openNow;
                      return (
                        <li key={item.id} className={`menu-item ${soldOut ? 'menu-item--sold-out' : ''}`}>
                          <div>
                            <h3>{item.name}</h3>
                            <p>{item.description}</p>
                          </div>
                          <div className="menu-item__actions">
                            <span className="menu-item__price">{formatCurrency(item.price)}</span>
                            {quantity === 0 ? (
                              <button
                                type="button"
                                className="menu-item__add"
                                onClick={() => incrementItem(item)}
                                disabled={disableActions}
                              >
                                {soldOut ? 'Sold out' : 'Add'}
                              </button>
                            ) : (
                              <div className="quantity-control" aria-label={`Quantity for ${item.name}`}>
                                <button
                                  type="button"
                                  onClick={() => decrementItem(item.id)}
                                  aria-label={`Remove one ${item.name}`}
                                >
                                  −
                                </button>
                                <span>{quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => incrementItem(item)}
                                  aria-label={`Add one ${item.name}`}
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
              ))}
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
                    <div className="quantity-control" aria-label={`Quantity for ${entry.name}`}>
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
