import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerSession } from '../../contexts/CustomerSessionContext';
import { useRestaurantData } from '../../contexts/RestaurantDataContext';
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
  const { restaurantId, cartEntries, subtotal, hasItems, clearCart } = useCustomerSession();
  const { getRestaurantById } = useRestaurantData();
  const { createCustomerOrder } = useOrders();

  const restaurant = useMemo(() => getRestaurantById(restaurantId), [getRestaurantById, restaurantId]);
  const charges = useMemo(() => calculateCharges(subtotal), [subtotal]);

  const [contact, setContact] = useState({ name: '', email: '', phone: '' });
  const [payment, setPayment] = useState({ name: '', cardNumber: '', expiryMonth: '', expiryYear: '', cvv: '' });
  const [billing, setBilling] = useState({ building: '', street: '', city: '', state: '' });
  const [delivery, setDelivery] = useState({ building: '', street: '', city: '', state: '' });
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasOrderSummary = cartEntries.length > 0 && restaurant;

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

  function validateAddress(address, prefix) {
    const issues = {};
    if (!address.building) issues[`${prefix}.building`] = 'Building number is required.';
    if (!address.street) issues[`${prefix}.street`] = 'Street is required.';
    if (!address.city) issues[`${prefix}.city`] = 'City is required.';
    if (!address.state) {
      issues[`${prefix}.state`] = 'State is required.';
    } else if (address.state.length !== 2) {
      issues[`${prefix}.state`] = 'Use the two-letter state abbreviation.';
    }
    return issues;
  }

  function validateForm() {
    const issues = {};
    const trimmedName = contact.name.trim();
    const email = contact.email.trim();
    const digitsPhone = contact.phone.replace(/[^0-9]/g, '');

    if (!trimmedName) {
      issues['contact.name'] = 'Name is required.';
    }

    if (!email) {
      issues['contact.email'] = 'Email address is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      issues['contact.email'] = 'Enter a valid email address.';
    }

    if (!digitsPhone) {
      issues['contact.phone'] = 'Phone number is required.';
    } else if (digitsPhone.length !== 10) {
      issues['contact.phone'] = 'Phone number must be 10 digits.';
    }

    if (!payment.name.trim()) {
      issues['payment.name'] = 'Name on card is required.';
    }

    const digitsCard = payment.cardNumber.replace(/[^0-9]/g, '');
    if (!digitsCard) {
      issues['payment.cardNumber'] = 'Card number is required.';
    } else if (digitsCard.length !== 16) {
      issues['payment.cardNumber'] = 'Card number must be 16 digits.';
    } else if (digitsCard.startsWith('0')) {
      issues['payment.cardNumber'] = 'Card number cannot start with 0.';
    }

    const month = Number(payment.expiryMonth);
    const year = Number(payment.expiryYear);
    if (!month || !year) {
      issues['payment.expiry'] = 'Select an expiration month and year.';
    } else {
      const now = new Date();
      const expiry = new Date(year, month - 1, 1);
      const comparison = new Date(now.getFullYear(), now.getMonth(), 1);
      if (expiry <= comparison) {
        issues['payment.expiry'] = 'Expiration date must be in the future.';
      }
    }

    const digitsCvv = payment.cvv.replace(/[^0-9]/g, '');
    if (digitsCvv.length !== 3) {
      issues['payment.cvv'] = 'Security code must be 3 digits.';
    }

    const finalBilling = normalizeAddress(billing);
    const finalDelivery = normalizeAddress(sameAsBilling ? billing : delivery);

    Object.assign(issues, validateAddress(finalBilling, 'billing'));
    Object.assign(issues, validateAddress(finalDelivery, 'delivery'));

    return { issues, finalBilling, finalDelivery, cardDigits: digitsCard, cvvDigits: digitsCvv };
  }

  function markAllTouched() {
    const fields = [
      'contact.name',
      'contact.email',
      'contact.phone',
      'payment.name',
      'payment.cardNumber',
      'payment.expiry',
      'payment.cvv',
      'billing.building',
      'billing.street',
      'billing.city',
      'billing.state',
      'delivery.building',
      'delivery.street',
      'delivery.city',
      'delivery.state',
    ];
    const map = fields.reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(map);
  }

  if (!hasItems) {
    return (
      <>
        <AppHeader />
        <div className="checkout-page">
          <div className="checkout-empty">
            <h1>Your cart is empty</h1>
            <p>Add items from a restaurant before checking out.</p>
            <button type="button" onClick={() => navigate('/restaurants')}>
              Back to restaurants
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!restaurant) {
    return (
      <>
        <AppHeader />
        <div className="checkout-page">
          <div className="checkout-empty">
            <h1>No restaurant selected</h1>
            <p>Choose a restaurant to continue with your order.</p>
            <button type="button" onClick={() => navigate('/restaurants')}>
              Select restaurant
            </button>
          </div>
        </div>
      </>
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    markAllTouched();
    setSubmitError('');

    const { issues, finalBilling, finalDelivery, cardDigits } = validateForm();
    if (Object.keys(issues).length > 0) {
      setErrors(issues);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const order = createCustomerOrder({
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        items: cartEntries.map((entry) => ({
          id: entry.itemId,
          name: entry.name,
          quantity: entry.quantity,
          price: entry.price,
        })),
        financials: charges,
        contact: {
          name: contact.name.trim(),
          email: contact.email.trim(),
          phone: contact.phone.replace(/[^0-9]/g, ''),
        },
        billing: finalBilling,
        delivery: finalDelivery,
        payment: {
          last4: cardDigits.slice(-4),
        },
      });

      if (!order) {
        throw new Error('Unable to create order');
      }

      clearCart();
      navigate('/order/confirm');
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
              <strong>{restaurant.name}</strong>
            </div>
          </header>

          <form className="checkout-form" onSubmit={handleSubmit} noValidate>
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
                {cartEntries.map((entry) => (
                  <li key={entry.itemId}>
                    <span>
                      {entry.quantity} × {entry.name}
                    </span>
                    <span>{formatCurrency(entry.quantity * entry.price)}</span>
                  </li>
                ))}
              </ul>
              <dl>
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
                <div className="total">
                  <dt>Total due</dt>
                  <dd>{formatCurrency(charges.total)}</dd>
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
