import React, { useMemo, useState } from 'react';
import AppHeader from '../../components/AppHeader';
import './CustomerDashboard.css';

const timelineStops = [
  {
    id: 'order-placed',
    title: 'Order placed',
    time: '4:05 PM',
    description: 'FrontDash confirmed payment and shared your contactless instructions with the restaurant.',
  },
  {
    id: 'prepping',
    title: 'Restaurant is prepping',
    time: '4:12 PM',
    description: 'Bella Trattoria is preparing your meal. We will alert you when your driver is on the way.',
  },
  {
    id: 'driver-assigned',
    title: 'Driver assigned',
    time: '4:26 PM',
    description: 'Marcus picked up the delivery. You can track the trip in real time and chat if anything changes.',
  },
  {
    id: 'arriving',
    title: 'Arriving soon',
    time: '4:38 PM',
    description: 'Marcus is 0.5 miles away. We will send a push notification when they reach the door.',
  },
];

const recommendedAddOns = [
  { id: 'tiramisu', name: 'Tiramisu slice', price: '$6.50', description: 'A sweet treat you can add for your next order.' },
  { id: 'garlic-bread', name: 'Garlic bread', price: '$5.00', description: 'Warm, buttery garlic bread from Bella Trattoria.' },
  { id: 'sparkling', name: 'Sparkling water', price: '$3.25', description: 'Add a refreshing San Pellegrino to your cart.' },
];

const checkoutRestaurants = [
  { id: 'bella', name: 'Bella Trattoria', open: true },
  { id: 'sunrise', name: 'Sunrise Diner', open: false, reopenAt: '5:00 PM' },
  { id: 'green-garden', name: 'Green Garden Bowls', open: true },
];

const checkoutMenuItems = [
  { id: 'margherita', name: 'Margherita Pizza' },
  { id: 'garlic-knots', name: 'Garlic Knots' },
  { id: 'house-salad', name: 'House Salad' },
  { id: 'tiramisu', name: 'Tiramisu Slice' },
];

const monthOptions = Array.from({ length: 12 }, (_, index) => {
  const value = String(index + 1).padStart(2, '0');
  const label = new Date(2000, index).toLocaleString('en', { month: 'long' });
  return { value, label: `${value} – ${label}` };
});

const yearOptions = (() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 8 }, (_, index) => String(currentYear + index));
})();

function createEmptyAddress() {
  return {
    building: '',
    street: '',
    city: '',
    state: '',
  };
}

function createInitialCheckoutState() {
  return {
    restaurantId: '',
    selectedItems: {},
    deliveryAddress: createEmptyAddress(),
    billingAddress: createEmptyAddress(),
    cardName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  };
}

export default function CustomerDashboard() {
  const [activeStopId, setActiveStopId] = useState('prepping');
  const activeStop = useMemo(() => timelineStops.find((stop) => stop.id === activeStopId) ?? timelineStops[0], [
    activeStopId,
  ]);

  const [checkoutForm, setCheckoutForm] = useState(() => createInitialCheckoutState());
  const [checkoutErrors, setCheckoutErrors] = useState({});
  const [checkoutStatus, setCheckoutStatus] = useState(null);

  const selectedRestaurant = useMemo(
    () => checkoutRestaurants.find((entry) => entry.id === checkoutForm.restaurantId) ?? null,
    [checkoutForm.restaurantId]
  );

  const selectedMenuItems = useMemo(
    () => checkoutMenuItems.filter((item) => checkoutForm.selectedItems[item.id]),
    [checkoutForm.selectedItems]
  );

  function clearError(key) {
    setCheckoutErrors((prev) => {
      if (!(key in prev)) return prev;
      const { [key]: _removed, ...rest } = prev;
      return rest;
    });
  }

  function handleRestaurantChange(event) {
    const value = event.target.value;
    setCheckoutForm((prev) => ({ ...prev, restaurantId: value }));
    clearError('restaurantId');
  }

  function toggleMenuItem(itemId) {
    setCheckoutForm((prev) => {
      const nextSelected = { ...prev.selectedItems };
      if (nextSelected[itemId]) {
        delete nextSelected[itemId];
      } else {
        nextSelected[itemId] = true;
      }
      return { ...prev, selectedItems: nextSelected };
    });
    clearError('items');
  }

  function handleAddressChange(section, field) {
    return (event) => {
      const raw = event.target.value;
      let value = raw;
      if (field === 'building') {
        value = raw.replace(/[^0-9]/g, '').slice(0, 6);
      } else if (field === 'state') {
        value = raw.replace(/[^a-z]/gi, '').slice(0, 2).toUpperCase();
      }
      setCheckoutForm((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
      clearError(`${section}.${field}`);
    };
  }

  function handleCardFieldChange(field) {
    return (event) => {
      let value = event.target.value;
      if (field === 'cardNumber') {
        value = value.replace(/[^0-9]/g, '').slice(0, 16);
      }
      if (field === 'cvv') {
        value = value.replace(/[^0-9]/g, '').slice(0, 3);
      }
      setCheckoutForm((prev) => ({ ...prev, [field]: value }));
      clearError(field);
    };
  }

  function handleExpiryChange(field) {
    return (event) => {
      setCheckoutForm((prev) => ({ ...prev, [field]: event.target.value }));
      clearError(field);
      clearError(field === 'expiryMonth' ? 'expiryYear' : 'expiryMonth');
    };
  }

  function validateCheckout(form) {
    const errors = {};
    const restaurant = checkoutRestaurants.find((entry) => entry.id === form.restaurantId) ?? null;

    if (!form.restaurantId) {
      errors.restaurantId = 'Select an open restaurant before placing the order.';
    } else if (!restaurant?.open) {
      errors.restaurantId = `${restaurant?.name ?? 'This restaurant'} is currently closed. Choose an open restaurant.`;
    }

    if (Object.keys(form.selectedItems ?? {}).length === 0) {
      errors.items = 'Select at least one menu item before confirming the order.';
    }

    const addressSections = [
      { key: 'deliveryAddress', label: 'Delivery address' },
      { key: 'billingAddress', label: 'Billing address' },
    ];

    addressSections.forEach(({ key, label }) => {
      const address = form[key] ?? createEmptyAddress();
      const building = String(address.building ?? '').trim();
      const street = String(address.street ?? '').trim();
      const city = String(address.city ?? '').trim();
      const state = String(address.state ?? '').trim();

      if (!building) {
        errors[`${key}.building`] = `${label} requires a building number.`;
      }
      if (!street) {
        errors[`${key}.street`] = `${label} requires a street name.`;
      }
      if (!city) {
        errors[`${key}.city`] = `${label} requires a city.`;
      }
      if (!state) {
        errors[`${key}.state`] = `${label} requires a state abbreviation.`;
      } else if (state.length !== 2) {
        errors[`${key}.state`] = `${label} state should use the two-letter abbreviation.`;
      }
    });

    if (!form.cardName.trim()) {
      errors.cardName = 'Name on card is required.';
    }

    const cardDigits = form.cardNumber.replace(/[^0-9]/g, '');
    if (!cardDigits) {
      errors.cardNumber = 'Credit card number is required.';
    } else if (cardDigits.length !== 16) {
      errors.cardNumber = 'Credit card number must be 16 digits long.';
    } else if (cardDigits.startsWith('0')) {
      errors.cardNumber = 'Credit card number cannot start with zero.';
    }

    const month = parseInt(form.expiryMonth, 10);
    const year = parseInt(form.expiryYear, 10);
    if (!month || !year) {
      errors.expiryMonth = 'Select an expiration month and year.';
      errors.expiryYear = 'Select an expiration month and year.';
    } else {
      const now = new Date();
      const comparison = new Date(now.getFullYear(), now.getMonth(), 1);
      const expiryDate = new Date(year, month - 1, 1);
      if (expiryDate <= comparison) {
        errors.expiryMonth = 'Expiration date must be in the future.';
        errors.expiryYear = 'Expiration date must be in the future.';
      }
    }

    const cvvDigits = form.cvv.replace(/[^0-9]/g, '');
    if (cvvDigits.length !== 3) {
      errors.cvv = 'Security code must be exactly 3 digits.';
    }

    return errors;
  }

  function handleCheckoutSubmit(event) {
    event.preventDefault();
    const validation = validateCheckout(checkoutForm);
    if (Object.keys(validation).length > 0) {
      setCheckoutErrors(validation);
      setCheckoutStatus(null);
      return;
    }

    setCheckoutErrors({});
    setCheckoutStatus({
      type: 'success',
      restaurant:
        checkoutRestaurants.find((entry) => entry.id === checkoutForm.restaurantId)?.name ?? 'Your restaurant',
      items: selectedMenuItems.map((item) => item.name),
    });
    setCheckoutForm(createInitialCheckoutState());
  }

  const visibleErrorMessages = useMemo(() => {
    const unique = new Set(Object.values(checkoutErrors));
    return Array.from(unique).filter(Boolean);
  }, [checkoutErrors]);

  return (
    <>
      <AppHeader />
      <div className="customer-dashboard">
        <header className="customer-hero">
          <div>
            <p className="customer-eyebrow">Dinner in progress</p>
          <h1>Bella Trattoria is preparing your order</h1>
          <p className="customer-subtitle">
            We will keep you updated as the kitchen finishes cooking and your driver approaches. Tap a status to see more
            details or share updated delivery instructions.
          </p>
        </div>
        <div className="customer-eta" role="status" aria-live="polite">
          <span className="label">Estimated arrival</span>
          <strong>4:45 &ndash; 4:55 PM</strong>
          <span className="driver">Marcus (white Prius) • 2.4 mi away</span>
        </div>
      </header>

      <main className="customer-content">
        <section className="customer-timeline" aria-labelledby="customer-timeline-heading">
          <h2 id="customer-timeline-heading">Order timeline</h2>
          <ol>
            {timelineStops.map((stop) => (
              <li key={stop.id}>
                <button
                  type="button"
                  className={`timeline-step ${stop.id === activeStopId ? 'active' : ''}`}
                  onClick={() => setActiveStopId(stop.id)}
                >
                  <span className="step-dot" aria-hidden="true" />
                  <span>
                    <strong>{stop.title}</strong>
                    <small>{stop.time}</small>
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <aside className="timeline-details">
            <h3>{activeStop.title}</h3>
            <p>{activeStop.description}</p>
            <button type="button" className="customer-secondary">Share delivery instructions</button>
          </aside>
        </section>

        <section className="customer-order" aria-labelledby="customer-order-heading">
          <h2 id="customer-order-heading">Tonight&apos;s order</h2>
          <div className="customer-order-card">
            <div>
              <h3>Malik Johnson</h3>
              <p className="customer-order-address">1846 W. Maple St, Apt 302</p>
              <p className="customer-order-notes">Leave at the door. Gate code #4402.</p>
            </div>
            <ul>
              <li>
                <span>Margherita Pizza</span>
                <span>×1</span>
              </li>
              <li>
                <span>Tiramisu slice</span>
                <span>×1</span>
              </li>
              <li>
                <span>Garlic knots</span>
                <span>×1</span>
              </li>
            </ul>
            <footer>
              <span>Total</span>
              <strong>$42.80</strong>
            </footer>
          </div>
        </section>

        <section className="customer-recommendations" aria-labelledby="customer-recommendations-heading">
          <h2 id="customer-recommendations-heading">Add something for next time</h2>
          <div className="customer-recommendation-grid">
            {recommendedAddOns.map((item) => (
              <article key={item.id} className="recommendation-card">
                <header>
                  <h3>{item.name}</h3>
                  <span>{item.price}</span>
                </header>
                <p>{item.description}</p>
                <button type="button" className="customer-primary">
                  Save to favorites
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="customer-checkout" aria-labelledby="customer-checkout-heading">
          <h2 id="customer-checkout-heading">Place a sample order</h2>
          <div className="checkout-card">
            {checkoutStatus?.type === 'success' ? (
              <div className="checkout-success" role="status" aria-live="polite">
                <strong>Order ready for processing.</strong>
                <p>
                  {checkoutStatus.restaurant} is preparing{' '}
                  {checkoutStatus.items.length > 0 ? checkoutStatus.items.join(', ') : 'your order'}.
                </p>
              </div>
            ) : null}

            {visibleErrorMessages.length > 0 ? (
              <div className="checkout-alert" role="alert">
                <p>Fix the following before confirming your order:</p>
                <ul>
                  {visibleErrorMessages.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <form className="checkout-form" onSubmit={handleCheckoutSubmit} noValidate>
              <fieldset className="checkout-fieldset">
                <legend>Restaurant</legend>
                <label htmlFor="checkout-restaurant">Choose a restaurant</label>
                <select
                  id="checkout-restaurant"
                  value={checkoutForm.restaurantId}
                  onChange={handleRestaurantChange}
                  aria-invalid={Boolean(checkoutErrors.restaurantId)}
                >
                  <option value="">Select a restaurant</option>
                  {checkoutRestaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name} {restaurant.open ? '' : '(Closed)'}
                    </option>
                  ))}
                </select>
                {selectedRestaurant && !selectedRestaurant.open ? (
                  <p className="checkout-warning" role="alert">
                    {selectedRestaurant.name} is closed right now. Reopens {selectedRestaurant.reopenAt ?? 'later today'}.
                  </p>
                ) : null}
                {checkoutErrors.restaurantId ? (
                  <p className="checkout-error" role="alert">{checkoutErrors.restaurantId}</p>
                ) : null}
              </fieldset>

              <fieldset className="checkout-fieldset">
                <legend>Menu items</legend>
                <div className="checkout-options">
                  {checkoutMenuItems.map((item) => (
                    <label key={item.id} className="checkout-checkbox">
                      <input
                        type="checkbox"
                        checked={Boolean(checkoutForm.selectedItems[item.id])}
                        onChange={() => toggleMenuItem(item.id)}
                      />
                      <span>{item.name}</span>
                    </label>
                  ))}
                </div>
                {checkoutErrors.items ? (
                  <p className="checkout-error" role="alert">{checkoutErrors.items}</p>
                ) : null}
              </fieldset>

              <div className="checkout-grid">
                <fieldset className="checkout-fieldset">
                  <legend>Delivery address</legend>
                  <label htmlFor="delivery-building">Building number</label>
                  <input
                    id="delivery-building"
                    value={checkoutForm.deliveryAddress.building}
                    onChange={handleAddressChange('deliveryAddress', 'building')}
                    inputMode="numeric"
                    aria-invalid={Boolean(checkoutErrors['deliveryAddress.building'])}
                  />
                  {checkoutErrors['deliveryAddress.building'] ? (
                    <p className="checkout-error" role="alert">{checkoutErrors['deliveryAddress.building']}</p>
                  ) : null}

                  <label htmlFor="delivery-street">Street name</label>
                  <input
                    id="delivery-street"
                    value={checkoutForm.deliveryAddress.street}
                    onChange={handleAddressChange('deliveryAddress', 'street')}
                    aria-invalid={Boolean(checkoutErrors['deliveryAddress.street'])}
                  />
                  {checkoutErrors['deliveryAddress.street'] ? (
                    <p className="checkout-error" role="alert">{checkoutErrors['deliveryAddress.street']}</p>
                  ) : null}

                  <label htmlFor="delivery-city">City</label>
                  <input
                    id="delivery-city"
                    value={checkoutForm.deliveryAddress.city}
                    onChange={handleAddressChange('deliveryAddress', 'city')}
                    aria-invalid={Boolean(checkoutErrors['deliveryAddress.city'])}
                  />
                  {checkoutErrors['deliveryAddress.city'] ? (
                    <p className="checkout-error" role="alert">{checkoutErrors['deliveryAddress.city']}</p>
                  ) : null}

                  <label htmlFor="delivery-state">State</label>
                  <input
                    id="delivery-state"
                    value={checkoutForm.deliveryAddress.state}
                    onChange={handleAddressChange('deliveryAddress', 'state')}
                    aria-invalid={Boolean(checkoutErrors['deliveryAddress.state'])}
                    placeholder="TX"
                  />
                  {checkoutErrors['deliveryAddress.state'] ? (
                    <p className="checkout-error" role="alert">{checkoutErrors['deliveryAddress.state']}</p>
                  ) : null}
                </fieldset>

                <fieldset className="checkout-fieldset">
                  <legend>Billing address</legend>
                  <label htmlFor="billing-building">Building number</label>
                  <input
                    id="billing-building"
                    value={checkoutForm.billingAddress.building}
                    onChange={handleAddressChange('billingAddress', 'building')}
                    inputMode="numeric"
                    aria-invalid={Boolean(checkoutErrors['billingAddress.building'])}
                  />
                  {checkoutErrors['billingAddress.building'] ? (
                    <p className="checkout-error" role="alert">{checkoutErrors['billingAddress.building']}</p>
                  ) : null}

                  <label htmlFor="billing-street">Street name</label>
                  <input
                    id="billing-street"
                    value={checkoutForm.billingAddress.street}
                    onChange={handleAddressChange('billingAddress', 'street')}
                    aria-invalid={Boolean(checkoutErrors['billingAddress.street'])}
                  />
                  {checkoutErrors['billingAddress.street'] ? (
                    <p className="checkout-error" role="alert">{checkoutErrors['billingAddress.street']}</p>
                  ) : null}

                  <label htmlFor="billing-city">City</label>
                  <input
                    id="billing-city"
                    value={checkoutForm.billingAddress.city}
                    onChange={handleAddressChange('billingAddress', 'city')}
                    aria-invalid={Boolean(checkoutErrors['billingAddress.city'])}
                  />
                  {checkoutErrors['billingAddress.city'] ? (
                    <p className="checkout-error" role="alert">{checkoutErrors['billingAddress.city']}</p>
                  ) : null}

                  <label htmlFor="billing-state">State</label>
                  <input
                    id="billing-state"
                    value={checkoutForm.billingAddress.state}
                    onChange={handleAddressChange('billingAddress', 'state')}
                    aria-invalid={Boolean(checkoutErrors['billingAddress.state'])}
                    placeholder="TX"
                  />
                  {checkoutErrors['billingAddress.state'] ? (
                    <p className="checkout-error" role="alert">{checkoutErrors['billingAddress.state']}</p>
                  ) : null}
                </fieldset>
              </div>

              <fieldset className="checkout-fieldset">
                <legend>Payment</legend>
                <label htmlFor="card-name">Name on card</label>
                <input
                  id="card-name"
                  value={checkoutForm.cardName}
                  onChange={handleCardFieldChange('cardName')}
                  aria-invalid={Boolean(checkoutErrors.cardName)}
                />
                {checkoutErrors.cardName ? (
                  <p className="checkout-error" role="alert">{checkoutErrors.cardName}</p>
                ) : null}

                <label htmlFor="card-number">Card number</label>
                <input
                  id="card-number"
                  value={checkoutForm.cardNumber}
                  onChange={handleCardFieldChange('cardNumber')}
                  inputMode="numeric"
                  maxLength={16}
                  aria-invalid={Boolean(checkoutErrors.cardNumber)}
                  placeholder="16 digits"
                />
                {checkoutErrors.cardNumber ? (
                  <p className="checkout-error" role="alert">{checkoutErrors.cardNumber}</p>
                ) : null}

                <div className="checkout-row">
                  <div>
                    <label htmlFor="expiry-month">Expiry month</label>
                    <select
                      id="expiry-month"
                      value={checkoutForm.expiryMonth}
                      onChange={handleExpiryChange('expiryMonth')}
                      aria-invalid={Boolean(checkoutErrors.expiryMonth)}
                    >
                      <option value="">Month</option>
                      {monthOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="expiry-year">Expiry year</label>
                    <select
                      id="expiry-year"
                      value={checkoutForm.expiryYear}
                      onChange={handleExpiryChange('expiryYear')}
                      aria-invalid={Boolean(checkoutErrors.expiryYear)}
                    >
                      <option value="">Year</option>
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="card-cvv">Security code</label>
                    <input
                      id="card-cvv"
                      value={checkoutForm.cvv}
                      onChange={handleCardFieldChange('cvv')}
                      inputMode="numeric"
                      maxLength={3}
                      aria-invalid={Boolean(checkoutErrors.cvv)}
                      placeholder="123"
                    />
                  </div>
                </div>
                {checkoutErrors.expiryMonth || checkoutErrors.expiryYear ? (
                  <p className="checkout-error" role="alert">
                    {checkoutErrors.expiryMonth || checkoutErrors.expiryYear}
                  </p>
                ) : null}
                {checkoutErrors.cvv ? (
                  <p className="checkout-error" role="alert">{checkoutErrors.cvv}</p>
                ) : null}
              </fieldset>

              <div className="checkout-actions">
                <button type="submit" className="customer-primary checkout-submit">
                  Confirm order
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
    </>
  );
}
