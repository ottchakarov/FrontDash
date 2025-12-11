import React, { useEffect, useMemo, useState } from 'react';
import './Landing.css';

const MIN_ADDRESS_LENGTH = 4;

export default function Landing({
  onSearch,
  onRestaurantLogin,
  onStaffLogin,
  onOwnerRegister,
}) {
  const [address, setAddress] = useState('');

  const isAddressValid = useMemo(
    () => address.trim().length >= MIN_ADDRESS_LENGTH,
    [address]
  );

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const previousFontSize = document.body.style.fontSize;
    document.documentElement.style.setProperty('--fd-base', '16px');
    document.body.style.fontSize = 'var(--fd-base)';
    document.body.classList.add('fd-landing-active');

    return () => {
      document.body.classList.remove('fd-landing-active');
      if (previousFontSize) {
        document.body.style.fontSize = previousFontSize;
      } else {
        document.body.style.removeProperty('font-size');
      }
      document.documentElement.style.removeProperty('--fd-base');
    };
  }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (!isAddressValid) return;
    onSearch?.(address.trim());
  };

  const handleInputChange = (event) => {
    setAddress(event.target.value);
  };

  return (
    <div className="fd-heroPage">
      <header className="fd-header">
        <div className="fd-logo">
          <img src="/assets/frontdash-logo.png" alt="FrontDash" />
        </div>
        <nav className="fd-nav">
          <button
            className="fd-btn fd-btn--light"
            type="button"
            onClick={onRestaurantLogin}
          >
            Restaurant Login
          </button>
          <button
            className="fd-btn fd-btn--light"
            type="button"
            onClick={onStaffLogin}
          >
            Login as staff
          </button>
        </nav>
      </header>

      <main className="fd-hero">
        <h1 className="fd-title">Get delivery fast with FrontDash</h1>
        <p>
          Discover restaurants that partner with FrontDash for fast delivery. Enter your
          address to see who delivers to you.
        </p>

        <form className="fd-searchRow" id="fd-search-form" onSubmit={handleSearchSubmit} noValidate>
          <label className="sr-only" htmlFor="fd-address">
            Delivery address
          </label>
          <div className="fd-inputWrap">
            <img src="/assets/pin.svg" alt="" aria-hidden="true" className="fd-pin" />
            <input
              id="fd-address"
              type="text"
              placeholder="Enter your delivery address"
              autoComplete="street-address"
              value={address}
              onChange={handleInputChange}
            />
          </div>
          <button
            id="fd-search"
            className="fd-btn fd-btn--primary"
            type="submit"
            disabled={!isAddressValid}
          >
            <span>Search Nearby</span>
            <img src="/assets/arrow-circle.svg" alt="" aria-hidden="true" className="fd-arrow" />
          </button>
        </form>

        <div className="fd-register">
          <button
            className="fd-btn fd-btn--pale"
            id="fd-register-owner"
            type="button"
            onClick={onOwnerRegister}
          >
            REGISTER AS A RESTAURANT
          </button>
        </div>
      </main>
    </div>
  );
}
