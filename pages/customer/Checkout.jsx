import React, { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useCustomer } from '../../contexts/CustomerContext';
import './CustomerFlow.css';

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

const fieldOrder = [
  'cardNumber',
  'expiry',
  'cvv',
  'buildingNumber',
  'street',
  'city',
  'state',
];

const initialFormState = {
  cardNumber: '',
  expiry: '',
  cvv: '',
  buildingNumber: '',
  street: '',
  city: '',
  state: '',
};

function validateField(name, rawValue) {
  const trimmedValue = rawValue.trim();

  switch (name) {
    case 'cardNumber': {
      const digits = rawValue.replace(/\D/g, '');
      if (!digits) {
        return 'Card number is required.';
      }
      if (digits.length !== 16) {
        return 'Card number must contain exactly 16 digits.';
      }
      if (digits[0] === '0') {
        return 'Card number cannot start with zero.';
      }
      return '';
    }
    case 'expiry': {
      const digits = rawValue.replace(/\D/g, '');
      if (digits.length !== 4) {
        return 'Enter expiry in MM/YY format.';
      }
      const month = Number.parseInt(digits.slice(0, 2), 10);
      const yearFragment = Number.parseInt(digits.slice(2), 10);
      if (Number.isNaN(month) || month < 1 || month > 12) {
        return 'Enter a valid month between 01 and 12.';
      }
      const year = yearFragment + 2000;
      const expiryDate = new Date(year, month - 1, 1);
      if (Number.isNaN(expiryDate.getTime())) {
        return 'Enter a valid expiry date.';
      }
      const today = new Date();
      const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      if (expiryDate <= startOfCurrentMonth) {
        return 'Expiry date must be in the future.';
      }
      return '';
    }
    case 'cvv': {
      const digits = rawValue.replace(/\D/g, '');
      if (digits.length !== 3) {
        return 'CVV must be exactly three digits.';
      }
      return '';
    }
    case 'buildingNumber': {
      if (!trimmedValue) {
        return 'Building number is required.';
      }
      if (!/^\d+$/.test(trimmedValue)) {
        return 'Use digits only for the building number.';
      }
      if (Number.parseInt(trimmedValue, 10) <= 0) {
        return 'Building number must be greater than zero.';
      }
      return '';
    }
    case 'street': {
      if (!trimmedValue) {
        return 'Street is required.';
      }
      return '';
    }
    case 'city': {
      if (!trimmedValue) {
        return 'City is required.';
      }
      return '';
    }
    case 'state': {
      if (!trimmedValue) {
        return 'State is required.';
      }
      if (trimmedValue.length < 2) {
        return 'Enter a state abbreviation or full state name.';
      }
      return '';
    }
    default:
      return '';
  }
}

function sanitizeValue(name, value) {
  switch (name) {
    case 'cardNumber': {
      const digits = value.replace(/\D/g, '').slice(0, 16);
      return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    case 'expiry': {
      const digits = value.replace(/\D/g, '').slice(0, 4);
      if (digits.length <= 2) {
        return digits;
      }
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    case 'cvv':
      return value.replace(/\D/g, '').slice(0, 3);
    case 'buildingNumber':
      return value.replace(/[^0-9]/g, '');
    case 'state':
      return value.toUpperCase().replace(/[^A-Z\s]/g, '');
    default:
      return value;
  }
}

export default function Checkout() {
  const navigate = useNavigate();
  const {
    selectedRestaurant,
    cart,
    cartTotal,
    clearCart,
  } = useCustomer();

  const [form, setForm] = useState(initialFormState);
  const [touched, setTouched] = useState({});
  const [confirmation, setConfirmation] = useState(null);

  if (!selectedRestaurant) {
    return <Navigate to="/customer/select" replace />;
  }

  if (cart.length === 0 && !confirmation) {
    return <Navigate to="/customer/menu" replace />;
  }

  const fieldErrors = useMemo(() => {
    const errors = {};
    fieldOrder.forEach((field) => {
      const message = validateField(field, form[field]);
      if (message) {
        errors[field] = message;
      }
    });
    return errors;
  }, [form]);

  const canSubmit = fieldOrder.every((field) => !validateField(field, form[field]));

  const orderItems = confirmation
    ? confirmation.items
    : cart.map(({ item, quantity }) => ({
        id: item.id,
        name: item.name,
        quantity,
        price: item.price,
      }));

  const orderTotal = confirmation ? confirmation.total : cartTotal;

  const handleChange = (event) => {
    const { name, value } = event.target;
    const sanitizedValue = sanitizeValue(name, value);
    setForm((previous) => ({ ...previous, [name]: sanitizedValue }));
    setTouched((previous) => ({ ...previous, [name]: true }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setTouched(
      fieldOrder.reduce(
        (accumulator, field) => ({ ...accumulator, [field]: true }),
        {},
      ),
    );

    if (!canSubmit) {
      setConfirmation(null);
      return;
    }

    const snapshot = cart.map(({ item, quantity }) => ({
      id: item.id,
      name: item.name,
      quantity,
      price: item.price,
    }));

    setConfirmation({
      restaurantName: selectedRestaurant.name,
      items: snapshot,
      total: cartTotal,
    });

    setForm(initialFormState);
    setTouched({});
    clearCart();
  };

  const handleStartNewOrder = () => {
    navigate('/customer/select');
  };

  return (
    <div className="customer-flow">
      <header className="customer-flow__header">
        <h1 className="customer-flow__title">Checkout</h1>
        <p className="customer-flow__subtitle">
          {confirmation
            ? 'Your payment details have been received. Review your order summary below.'
            : `Complete your payment for ${selectedRestaurant.name}. All fields are required.`}
        </p>
      </header>

      <div className="customer-flow__layout">
        {confirmation ? (
          <section className="customer-flow__section">
            <h2>Payment received</h2>
            <p>
              Thank you! Your order for {confirmation.restaurantName} is confirmed. You will receive an
              email confirmation shortly.
            </p>
            <div className="customer-flow__orderSummary">
              {confirmation.items.map((line) => (
                <div key={line.id} className="customer-flow__orderLine">
                  <span>
                    <strong>{line.name}</strong> × {line.quantity}
                  </span>
                  <span>{currencyFormatter.format(line.price * line.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="customer-flow__summary">
              <span>Total paid</span>
              <span>{currencyFormatter.format(confirmation.total)}</span>
            </div>
            <div className="customer-flow__actions">
              <button type="button" className="customer-flow__button" onClick={handleStartNewOrder}>
                Start a new order
              </button>
            </div>
          </section>
        ) : (
          <form className="customer-flow__section" onSubmit={handleSubmit} noValidate>
            <h2>Payment details</h2>
            <div className="customer-flow__formGrid">
              <div className="customer-flow__field">
                <label htmlFor="cardNumber">Card number</label>
                <input
                  id="cardNumber"
                  name="cardNumber"
                  value={form.cardNumber}
                  onChange={handleChange}
                  aria-invalid={touched.cardNumber && Boolean(fieldErrors.cardNumber)}
                  placeholder="1234 5678 9012 3456"
                  autoComplete="cc-number"
                />
                {touched.cardNumber && fieldErrors.cardNumber ? (
                  <p className="customer-flow__helper">{fieldErrors.cardNumber}</p>
                ) : null}
              </div>

              <div className="customer-flow__field">
                <label htmlFor="expiry">Expiry (MM/YY)</label>
                <input
                  id="expiry"
                  name="expiry"
                  value={form.expiry}
                  onChange={handleChange}
                  aria-invalid={touched.expiry && Boolean(fieldErrors.expiry)}
                  placeholder="08/29"
                  autoComplete="cc-exp"
                />
                {touched.expiry && fieldErrors.expiry ? (
                  <p className="customer-flow__helper">{fieldErrors.expiry}</p>
                ) : null}
              </div>

              <div className="customer-flow__field">
                <label htmlFor="cvv">CVV</label>
                <input
                  id="cvv"
                  name="cvv"
                  value={form.cvv}
                  onChange={handleChange}
                  aria-invalid={touched.cvv && Boolean(fieldErrors.cvv)}
                  placeholder="123"
                  autoComplete="cc-csc"
                />
                {touched.cvv && fieldErrors.cvv ? (
                  <p className="customer-flow__helper">{fieldErrors.cvv}</p>
                ) : null}
              </div>

              <div className="customer-flow__field">
                <label htmlFor="buildingNumber">Building number</label>
                <input
                  id="buildingNumber"
                  name="buildingNumber"
                  value={form.buildingNumber}
                  onChange={handleChange}
                  aria-invalid={touched.buildingNumber && Boolean(fieldErrors.buildingNumber)}
                  placeholder="123"
                  autoComplete="shipping street-address"
                />
                {touched.buildingNumber && fieldErrors.buildingNumber ? (
                  <p className="customer-flow__helper">{fieldErrors.buildingNumber}</p>
                ) : null}
              </div>

              <div className="customer-flow__field">
                <label htmlFor="street">Street</label>
                <input
                  id="street"
                  name="street"
                  value={form.street}
                  onChange={handleChange}
                  aria-invalid={touched.street && Boolean(fieldErrors.street)}
                  placeholder="Main Street"
                  autoComplete="shipping address-line1"
                />
                {touched.street && fieldErrors.street ? (
                  <p className="customer-flow__helper">{fieldErrors.street}</p>
                ) : null}
              </div>

              <div className="customer-flow__field">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  aria-invalid={touched.city && Boolean(fieldErrors.city)}
                  placeholder="Springfield"
                  autoComplete="shipping address-level2"
                />
                {touched.city && fieldErrors.city ? (
                  <p className="customer-flow__helper">{fieldErrors.city}</p>
                ) : null}
              </div>

              <div className="customer-flow__field">
                <label htmlFor="state">State</label>
                <input
                  id="state"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  aria-invalid={touched.state && Boolean(fieldErrors.state)}
                  placeholder="CA"
                  autoComplete="shipping address-level1"
                />
                {touched.state && fieldErrors.state ? (
                  <p className="customer-flow__helper">{fieldErrors.state}</p>
                ) : null}
              </div>
            </div>

            <button type="submit" className="customer-flow__button" disabled={!canSubmit}>
              Pay {currencyFormatter.format(cartTotal)}
            </button>
          </form>
        )}

        <aside className="customer-flow__section">
          <h2>Order summary</h2>
          {orderItems.length === 0 ? (
            <p>No items in your order.</p>
          ) : (
            <div className="customer-flow__orderSummary">
              {orderItems.map((line) => (
                <div key={line.id} className="customer-flow__orderLine">
                  <span>
                    <strong>{line.name}</strong> × {line.quantity}
                  </span>
                  <span>{currencyFormatter.format(line.price * line.quantity)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="customer-flow__summary">
            <span>{confirmation ? 'Total paid' : 'Total due'}</span>
            <span>{currencyFormatter.format(orderTotal)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
