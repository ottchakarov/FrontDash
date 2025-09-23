import React, { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useCustomer } from '../../contexts/CustomerContext';
import './CustomerFlow.css';

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

export default function Menu() {
  const navigate = useNavigate();
  const {
    selectedRestaurant,
    cart,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    cartTotal,
    getRestaurantStatus,
    formatOperatingWindow,
  } = useCustomer();
  const [cartError, setCartError] = useState('');

  if (!selectedRestaurant) {
    return <Navigate to="/customer/select" replace />;
  }

  const status = getRestaurantStatus(selectedRestaurant);
  const isOpen = status.isOpen;

  const groupedMenu = useMemo(() => {
    return selectedRestaurant.menu.reduce((accumulator, item) => {
      const key = item.category ?? 'Menu';
      if (!accumulator[key]) {
        accumulator[key] = [];
      }
      accumulator[key].push(item);
      return accumulator;
    }, {});
  }, [selectedRestaurant]);

  const handleAddItem = (item) => {
    setCartError('');
    addItemToCart(item);
  };

  const handleProceedToCheckout = () => {
    if (!cart.length) {
      setCartError('Add at least one item to your cart before continuing to checkout.');
      return;
    }

    setCartError('');
    navigate('/customer/checkout');
  };

  const handleBack = () => {
    navigate('/customer/select');
  };

  return (
    <div className="customer-flow">
      <header className="customer-flow__header">
        <h1 className="customer-flow__title">{selectedRestaurant.name}</h1>
        <p className="customer-flow__subtitle">
          {selectedRestaurant.description}
        </p>
        <p className="customer-flow__subtitle">
          {isOpen ? 'Accepting orders now.' : 'This location is currently closed. Ordering is disabled until they reopen.'}
          {' '}
          {status.todaysHours
            ? `Today's hours: ${formatOperatingWindow(status.todaysHours)}.`
            : 'Closed today.'}
        </p>
      </header>

      <div className="customer-flow__layout">
        <section className="customer-flow__section">
          <h2>Menu</h2>
          <div className="customer-flow__menuList">
            {Object.entries(groupedMenu).map(([category, items]) => (
              <div key={category} className="customer-flow__menuCategory">
                <div className="customer-flow__menuHeader">
                  <h3 className="customer-flow__menuCategoryTitle">{category}</h3>
                </div>
                <div className="customer-flow__menuList">
                  {items.map((menuItem) => (
                    <div key={menuItem.id} className="customer-flow__menuItem">
                      <div className="customer-flow__menuHeader">
                        <div>
                          <h4>{menuItem.name}</h4>
                          <p>{menuItem.description}</p>
                        </div>
                        <div className="customer-flow__menuActions">
                          <span className="customer-flow__menuPrice">{currencyFormatter.format(menuItem.price)}</span>
                          <button
                            type="button"
                            className="customer-flow__menuAddButton"
                            onClick={() => handleAddItem(menuItem)}
                            disabled={!isOpen}
                          >
                            Add to cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="customer-flow__section">
          <h2>Your cart</h2>
          <div className="customer-flow__cartList">
            {cart.length === 0 ? (
              <p>Your cart is empty. Add a menu item to get started.</p>
            ) : (
              cart.map(({ item, quantity }) => (
                <div key={item.id} className="customer-flow__cartItem">
                  <div>
                    <div className="customer-flow__cartItemTitle">{item.name}</div>
                    <div>{currencyFormatter.format(item.price)} each</div>
                  </div>
                  <div className="customer-flow__cartControls">
                    <button
                      type="button"
                      className="customer-flow__quantityButton"
                      onClick={() => updateItemQuantity(item.id, quantity - 1)}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      −
                    </button>
                    <span>{quantity}</span>
                    <button
                      type="button"
                      className="customer-flow__quantityButton"
                      onClick={() => updateItemQuantity(item.id, quantity + 1)}
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="customer-flow__removeButton"
                      onClick={() => removeItemFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="customer-flow__summary">
            <span>Total</span>
            <span>{currencyFormatter.format(cartTotal)}</span>
          </div>

          {cartError ? <p className="customer-flow__errorText">{cartError}</p> : null}

          <div className="customer-flow__actions">
            <button type="button" className="customer-flow__secondaryButton" onClick={handleBack}>
              Choose another restaurant
            </button>
            <button
              type="button"
              className="customer-flow__button"
              onClick={handleProceedToCheckout}
              disabled={!isOpen}
            >
              Proceed to checkout
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
