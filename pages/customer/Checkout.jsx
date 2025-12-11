import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCustomerSession } from '../../contexts/CustomerSessionContext';
import { useOrders } from '../../contexts/OrderContext';
import { calculateCharges, formatCurrency } from '../../utils/orderTotals';
import AppHeader from '../../components/AppHeader';
import './Checkout.css';

const monthOptions = Array.from({ length: 12 }, (_, index) => {
  const value = String(index + 1).padStart(2, '0');
  return { value, label: value };
});

const yearOptions = (() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 10 }, (_, index) => String(currentYear + index));
})();

function normalizeAddress(address) {
  return {
    building: (address.building ?? '').trim(),
    street: (address.street ?? '').trim(),
    city: (address.city ?? '').trim(),
    state: (address.state ?? '').trim().toUpperCase(),
  };
}

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { restaurantId: sessionRestaurantId, cartEntries, subtotal, clearCart } = useCustomerSession();
  const { createCustomerOrder } = useOrders();
  const {
    restaurantId: routeRestaurantId,
    restaurantName: routeRestaurantName,
    cartItems: routeCartItems,
    totals: routeTotals,
  } = location.state || {};

  const selectedRestaurantId = routeRestaurantId || sessionRestaurantId;

  // 1. STATE FOR REAL RESTAURANT DATA
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tip, setTip] = useState(0);

  // 2. FETCH RESTAURANT FROM BACKEND
  useEffect(() => {
    async function fetchRestaurant() {
      if (!selectedRestaurantId) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`http://localhost:8080/api/restaurants/${selectedRestaurantId}`);
        if (response.ok) {
          const data = await response.json();
          // Map backend fields if necessary (usually matches automatically)
          const mapped = {
            id: data.restaurantId || data.id,
            name: data.restaurantName || data.name,
            ...data
          };
          setRestaurant(mapped);
        }
      } catch (error) {
        console.error("Error fetching restaurant details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurant();
  }, [selectedRestaurantId]);

  const charges = useMemo(() => {
    if (routeTotals) return routeTotals;
    const computed = calculateCharges(subtotal);
    if (!subtotal) {
      return { subtotal: 29, tax: 2.61, fees: 3.5, total: 35.11 };
    }
    return computed;
  }, [routeTotals, subtotal]);

  const finalCharges = useMemo(() => {
    const base = charges || { subtotal: 0, tax: 0, fees: 0, total: 0 };
    const tipValue = Number(tip) || 0;
    return {
      ...base,
      tip: tipValue,
      total: (base.total || 0) + tipValue,
    };
  }, [charges, tip]);

  const checkoutItems = cartEntries.length ? cartEntries : routeCartItems || [];
  const defaultItems = [
    { id: 'margherita-pizza', name: 'Margherita Pizza', quantity: 1, price: 16 },
    { id: 'tiramisu', name: 'Tiramisu slice', quantity: 1, price: 7 },
    { id: 'garlic-knots', name: 'Garlic knots', quantity: 1, price: 6 },
  ];
  const summaryItems = checkoutItems.length ? checkoutItems : defaultItems;
  const hasOrderSummary = summaryItems.length > 0;
  const displayRestaurantName = restaurant?.name || routeRestaurantName || 'Bella Trattoria';
  const [contact, setContact] = useState({ name: '', email: '', phone: '' });
  const [payment, setPayment] = useState({ name: '', cardNumber: '', expiryMonth: '', expiryYear: '', cvv: '' });
  const [billing, setBilling] = useState({ building: '', street: '', city: '', state: '' });
  const [delivery, setDelivery] = useState({ building: '', street: '', city: '', state: '' });
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleTouch(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function handleContactChange(field, formatter) {
    return (event) => {
      const raw = event.target.value;
      const value = formatter ? formatter(raw) : raw;
      setContact((prev) => ({ ...prev, [field]: value }));
      handleTouch(`contact.${field}`);
    };
  }

  function handlePaymentChange(field, formatter) {
    return (event) => {
      const raw = event.target.value;
      const value = formatter ? formatter(raw) : raw;
      setPayment((prev) => ({ ...prev, [field]: value }));
      handleTouch(`payment.${field}`);
    };
  }

  function handleAddressChange(section, field, formatter) {
    return (event) => {
      const raw = event.target.value;
      const value = formatter ? formatter(raw) : raw;
      if (section === 'billing') {
        setBilling((prev) => ({ ...prev, [field]: value }));
        handleTouch(`billing.${field}`);
        if (sameAsBilling) {
          setDelivery((prev) => ({ ...prev, [field]: value }));
          handleTouch(`delivery.${field}`);
        }
      } else {
        setDelivery((prev) => ({ ...prev, [field]: value }));
        handleTouch(`delivery.${field}`);
      }
    };
  }

  function formatDigits(limit) {
    return (value) => value.replace(/[^0-9]/g, '').slice(0, limit);
  }

  function formatState(value) {
    return value.replace(/[^a-z]/gi, '').slice(0, 2).toUpperCase();
  }

  if (loading) {
    return <div className="checkout-page"><p style={{padding:'40px', textAlign:'center'}}>Loading checkout details...</p></div>;
  }

  async function handleConfirmOrder(event) {
    event.preventDefault();
    setSubmitError('');
    setErrors({});
    setIsSubmitting(true);

    try {
      const normalizedBilling = normalizeAddress(billing);
      const normalizedDelivery = normalizeAddress(sameAsBilling ? billing : delivery);
      const cardDigits = payment.cardNumber.replace(/[^0-9]/g, '');
      const restaurantIdentifier = normalizeRestaurantId(restaurant?.id || selectedRestaurantId);
      const restaurantLabel = restaurant?.name || routeRestaurantName || 'Bella Trattoria';

      const order = await createCustomerOrder({
        restaurantId: restaurantIdentifier,
        restaurantName: restaurantLabel,
        contact: {
          name: contact.name.trim() || 'Malik Johnson',
          phone: contact.phone.replace(/[^0-9]/g, '') || '3125552098',
          email: contact.email.trim() || 'malik.johnson@example.com',
        },
        delivery:
          normalizedDelivery.building || normalizedDelivery.street || normalizedDelivery.city || normalizedDelivery.state
            ? normalizedDelivery
            : {
                building: '1846',
                street: 'W Maple St Apt 302',
                city: 'Chicago',
                state: 'IL',
                note: 'Leave at the door. Gate code #4402.',
              },
        billing:
          normalizedBilling.building || normalizedBilling.street || normalizedBilling.city || normalizedBilling.state
            ? normalizedBilling
            : {
                building: '1846',
                street: 'W Maple St Apt 302',
                city: 'Chicago',
                state: 'IL',
              },
        items: (checkoutItems.length ? checkoutItems : defaultItems).map((entry) => ({
          id: entry.itemId || entry.id,
          name: entry.name,
          quantity: entry.quantity ?? 1,
          price: entry.price ?? 0,
        })),
        financials: {
          subtotal: finalCharges.subtotal,
          tax: finalCharges.tax,
          fees: finalCharges.fees,
          tip: finalCharges.tip ?? 0,
          total: finalCharges.total,
        },
        payment: {
          last4: cardDigits.slice(-4) || '4242',
        },
      });

      if (!order) {
        throw new Error('Unable to create order');
      }

      clearCart();
      navigate('/order/track', { state: { orderId: order.id } });
    } catch (error) {
      setSubmitError('Something went wrong while placing the order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSameAsBillingToggle(event) {
    const checked = event.target.checked;
    setSameAsBilling(checked);
    if (checked) {
      setDelivery((prev) => ({ ...prev, ...billing }));
    }
  }

  return (
    <>
      <AppHeader />
      <div className="checkout-page">
        <div className="checkout-layout">
          <section className="checkout-main">
            <header className="checkout-header">
            <div>
              <p className="eyebrow">Checkout</p>
              <h1>Secure your order</h1>
              <p>Provide contact, payment, and delivery details to complete your order.</p>
            </div>
            <div className="checkout-header__restaurant">
              <p>Ordering from</p>
              <strong>{displayRestaurantName}</strong>
            </div>
          </header>

          <form className="checkout-form" onSubmit={handleConfirmOrder} noValidate>
            <fieldset>
              <legend>Tip</legend>
              <div className="tip-options">
                {[0, 2, 4, 6].map((val) => (
                  <button
                    key={val}
                    type="button"
                    className={tip === val ? 'tip-btn active' : 'tip-btn'}
                    onClick={() => setTip(val)}
                  >
                    {val === 0 ? 'No tip' : `$${val.toFixed(2)}`}
                  </button>
                ))}
              </div>
              <label className="tip-custom">
                Custom tip
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={tip}
                  onChange={(e) => setTip(Number(e.target.value) || 0)}
                />
              </label>
            </fieldset>
            <fieldset>
              <legend>Contact</legend>
              <label htmlFor="contact-name">Full name</label>
              <input
                id="contact-name"
                type="text"
                value={contact.name}
                onChange={handleContactChange('name')}
                onBlur={() => handleTouch('contact.name')}
              />
              {touched['contact.name'] && errors['contact.name'] ? (
                <p className="field-error">{errors['contact.name']}</p>
              ) : null}

              <label htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                type="email"
                value={contact.email}
                onChange={handleContactChange('email')}
                onBlur={() => handleTouch('contact.email')}
              />
              {touched['contact.email'] && errors['contact.email'] ? (
                <p className="field-error">{errors['contact.email']}</p>
              ) : null}

              <label htmlFor="contact-phone">Phone</label>
              <input
                id="contact-phone"
                type="tel"
                inputMode="numeric"
                value={contact.phone}
                onChange={handleContactChange('phone', formatDigits(10))}
                onBlur={() => handleTouch('contact.phone')}
              />
              {touched['contact.phone'] && errors['contact.phone'] ? (
                <p className="field-error">{errors['contact.phone']}</p>
              ) : null}
            </fieldset>

            <fieldset>
              <legend>Payment</legend>
              <label htmlFor="payment-name">Name on card</label>
              <input
                id="payment-name"
                type="text"
                value={payment.name}
                onChange={handlePaymentChange('name')}
                onBlur={() => handleTouch('payment.name')}
              />
              {touched['payment.name'] && errors['payment.name'] ? (
                <p className="field-error">{errors['payment.name']}</p>
              ) : null}

              <label htmlFor="payment-number">Card number</label>
              <input
                id="payment-number"
                type="text"
                inputMode="numeric"
                value={payment.cardNumber}
                onChange={handlePaymentChange('cardNumber', formatDigits(16))}
                onBlur={() => handleTouch('payment.cardNumber')}
              />
              {touched['payment.cardNumber'] && errors['payment.cardNumber'] ? (
                <p className="field-error">{errors['payment.cardNumber']}</p>
              ) : null}

              <div className="field-row">
                <div>
                  <label htmlFor="payment-expiry-month">Expiry month</label>
                  <select
                    id="payment-expiry-month"
                    value={payment.expiryMonth}
                    onChange={handlePaymentChange('expiryMonth')}
                    onBlur={() => handleTouch('payment.expiry')}
                  >
                    <option value="">MM</option>
                    {monthOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="payment-expiry-year">Expiry year</label>
                  <select
                    id="payment-expiry-year"
                    value={payment.expiryYear}
                    onChange={handlePaymentChange('expiryYear')}
                    onBlur={() => handleTouch('payment.expiry')}
                  >
                    <option value="">YYYY</option>
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="payment-cvv">Security code</label>
                  <input
                    id="payment-cvv"
                    type="text"
                    inputMode="numeric"
                    value={payment.cvv}
                    onChange={handlePaymentChange('cvv', formatDigits(3))}
                    onBlur={() => handleTouch('payment.cvv')}
                  />
                </div>
              </div>
              {touched['payment.expiry'] && errors['payment.expiry'] ? (
                <p className="field-error">{errors['payment.expiry']}</p>
              ) : null}
              {touched['payment.cvv'] && errors['payment.cvv'] ? (
                <p className="field-error">{errors['payment.cvv']}</p>
              ) : null}
            </fieldset>

            <fieldset>
              <legend>Billing address</legend>
              <div className="field-row">
                <div>
                  <label htmlFor="billing-building">Building #</label>
                  <input
                    id="billing-building"
                    type="text"
                    value={billing.building}
                    onChange={handleAddressChange('billing', 'building', formatDigits(6))}
                    onBlur={() => handleTouch('billing.building')}
                  />
                  {touched['billing.building'] && errors['billing.building'] ? (
                    <p className="field-error">{errors['billing.building']}</p>
                  ) : null}
                </div>
                <div className="field-row__wide">
                  <label htmlFor="billing-street">Street</label>
                  <input
                    id="billing-street"
                    type="text"
                    value={billing.street}
                    onChange={handleAddressChange('billing', 'street')}
                    onBlur={() => handleTouch('billing.street')}
                  />
                  {touched['billing.street'] && errors['billing.street'] ? (
                    <p className="field-error">{errors['billing.street']}</p>
                  ) : null}
                </div>
              </div>
              <div className="field-row">
                <div>
                  <label htmlFor="billing-city">City</label>
                  <input
                    id="billing-city"
                    type="text"
                    value={billing.city}
                    onChange={handleAddressChange('billing', 'city')}
                    onBlur={() => handleTouch('billing.city')}
                  />
                  {touched['billing.city'] && errors['billing.city'] ? (
                    <p className="field-error">{errors['billing.city']}</p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="billing-state">State</label>
                  <input
                    id="billing-state"
                    type="text"
                    value={billing.state}
                    onChange={handleAddressChange('billing', 'state', formatState)}
                    onBlur={() => handleTouch('billing.state')}
                  />
                  {touched['billing.state'] && errors['billing.state'] ? (
                    <p className="field-error">{errors['billing.state']}</p>
                  ) : null}
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend>Delivery address</legend>
              <label className="checkbox-inline">
                <input type="checkbox" checked={sameAsBilling} onChange={handleSameAsBillingToggle} />
                Same as billing address
              </label>

              <div className="field-row">
                <div>
                  <label htmlFor="delivery-building">Building #</label>
                  <input
                    id="delivery-building"
                    type="text"
                    value={delivery.building}
                    onChange={handleAddressChange('delivery', 'building', formatDigits(6))}
                    onBlur={() => handleTouch('delivery.building')}
                    disabled={sameAsBilling}
                  />
                  {touched['delivery.building'] && errors['delivery.building'] ? (
                    <p className="field-error">{errors['delivery.building']}</p>
                  ) : null}
                </div>
                <div className="field-row__wide">
                  <label htmlFor="delivery-street">Street</label>
                  <input
                    id="delivery-street"
                    type="text"
                    value={delivery.street}
                    onChange={handleAddressChange('delivery', 'street')}
                    onBlur={() => handleTouch('delivery.street')}
                    disabled={sameAsBilling}
                  />
                  {touched['delivery.street'] && errors['delivery.street'] ? (
                    <p className="field-error">{errors['delivery.street']}</p>
                  ) : null}
                </div>
              </div>

              <div className="field-row">
                <div>
                  <label htmlFor="delivery-city">City</label>
                  <input
                    id="delivery-city"
                    type="text"
                    value={delivery.city}
                    onChange={handleAddressChange('delivery', 'city')}
                    onBlur={() => handleTouch('delivery.city')}
                    disabled={sameAsBilling}
                  />
                  {touched['delivery.city'] && errors['delivery.city'] ? (
                    <p className="field-error">{errors['delivery.city']}</p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="delivery-state">State</label>
                  <input
                    id="delivery-state"
                    type="text"
                    value={delivery.state}
                    onChange={handleAddressChange('delivery', 'state', formatState)}
                    onBlur={() => handleTouch('delivery.state')}
                    disabled={sameAsBilling}
                  />
                  {touched['delivery.state'] && errors['delivery.state'] ? (
                    <p className="field-error">{errors['delivery.state']}</p>
                  ) : null}
                </div>
              </div>
            </fieldset>

            {submitError ? <p className="submit-error">{submitError}</p> : null}

            <button type="submit" className="checkout-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Place order'}
            </button>
          </form>
        </section>

        {hasOrderSummary ? (
          <aside className="checkout-summary" aria-label="Order summary">
            <div className="checkout-summary__inner">
              <h2>Order summary</h2>
              <ul>
                {summaryItems.map((entry) => {
                  const qty = entry.quantity ?? 1;
                  const price = entry.price ?? 0;
                  return (
                    <li key={entry.itemId || entry.id}>
                      <span>
                        {qty} × {entry.name}
                      </span>
                      <span>{formatCurrency(qty * price)}</span>
                    </li>
                  );
                })}
              </ul>
              <dl>
                <div>
                  <dt>Subtotal</dt>
                  <dd>{formatCurrency(charges.subtotal)}</dd>
                </div>
                <div>
                  <dt>Estimated tax</dt>
                  <dd>{formatCurrency(finalCharges.tax)}</dd>
                </div>
                <div>
                  <dt>Delivery & fees</dt>
                  <dd>{formatCurrency(finalCharges.fees)}</dd>
                </div>
                <div>
                  <dt>Tip</dt>
                  <dd>{formatCurrency(finalCharges.tip ?? 0)}</dd>
                </div>
                <div className="total">
                  <dt>Total due</dt>
                  <dd>{formatCurrency(finalCharges.total)}</dd>
                </div>
              </dl>
            </div>
          </aside>
        ) : null}
        </div>
      </div>
    </>
  );
}
  function normalizeRestaurantId(raw) {
    if (!raw) return 'REST-ACM'; // default to a seeded restaurant so orders save
    return String(raw).trim().toUpperCase();
  }
