const STYLE_TAG_ID = 'fd-landing-styles';

const landingStyles = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;700;800&display=swap');

body.fd-landing-active {
  margin: 0;
  padding: 0;
  background: #000;
  overflow-x: hidden;
}

.fd-heroPage,
.fd-heroPage * {
  box-sizing: border-box;
}

.fd-heroPage {
  position: relative;
  min-height: 100vh;
  width: 100vw;
  font-family: 'Poppins', system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background: url('/assets/LandingPage.png') center/cover no-repeat;
  color: #111;
  --header-h: 88px;
  --logo-h: 82px;
}

.fd-heroPage::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  z-index: 0;
}

.fd-heroPage > * {
  position: relative;
  z-index: 2;
}

.fd-heroPage {
  --pink-200: #f3c4c4;
  --pink-300: #eea7a7;
  --pink-400: #e68c8c;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.fd-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-h);
  padding: 6px 32px;
  background: #f3c4c4;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  overflow: visible;
}

.fd-logo img {
  height: calc(var(--header-h) + 120px);
  width: auto;
  display: block;
}

.fd-nav {
  display: flex;
  gap: 16px;
}

.fd-hero {
  max-width: 1240px;
  margin: 0 auto;
  padding: calc(var(--header-h) + 56px) 24px 64px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--header-h));
  gap: 28px;
}

.fd-title {
  margin: 0 0 16px;
  color: #fff;
  font-weight: 800;
  font-size: 64px;
  line-height: 1.1;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
}

.fd-searchRow {
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 12px;
  flex-wrap: wrap;
}

.fd-inputWrap {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-radius: 9999px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
  height: 64px;
  padding: 0 18px;
  width: 820px;
  max-width: 92vw;
  min-width: 320px;
}

.fd-inputWrap input {
  border: 0;
  outline: 0;
  background: transparent;
  width: 100%;
  font-size: 20px;
  color: #111;
}

.fd-inputWrap input::placeholder {
  color: var(--gray-400);
}

.fd-pin,
.fd-arrow {
  width: 28px;
  height: 28px;
}

.fd-pin {
  flex-shrink: 0;
}

.fd-register {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.fd-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 9999px;
  padding: 0 28px;
  background: var(--pink-400);
  color: #fff;
  font-weight: 700;
  font-size: 20px;
  letter-spacing: 0.2px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  cursor: pointer;
  transition: 0.15s background, 0.15s transform;
  height: 56px;
}

#fd-search.fd-btn {
  font-weight: 800;
  padding: 0 26px;
}

#fd-register-owner.fd-btn {
  height: 52px;
  padding: 0 24px;
}

.fd-btn:hover {
  background: #de7e7e;
}

.fd-btn:active {
  transform: scale(0.98);
}

.fd-btn[disabled] {
  background: var(--pink-200);
  color: rgba(255, 255, 255, 0.6);
  cursor: not-allowed;
}

.fd-btn--pale {
  background: var(--pink-300);
}

.fd-btn--pale:hover {
  background: var(--pink-400);
}

.fd-btn--primary {
  background: var(--pink-400);
}

.fd-btn--primary[disabled] {
  background: var(--pink-200);
}

.fd-btn span {
  line-height: 1;
}

.fd-btn img {
  display: block;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 1279px) {
  .fd-inputWrap {
    width: min(700px, 92vw);
  }
}

@media (max-width: 900px) {
  .fd-title {
    font-size: 44px;
  }

  .fd-inputWrap {
    height: 58px;
  }

  #fd-search.fd-btn {
    height: 54px;
  }
}

@media (max-width: 768px) {
  .fd-heroPage {
    --header-h: 72px;
    --logo-h: 58px;
  }

  .fd-title {
    font-size: 36px;
    line-height: 44px;
  }

  .fd-searchRow {
    flex-direction: column;
    align-items: center;
  }

  .fd-btn {
    width: 100%;
    max-width: 360px;
  }

  .fd-searchRow .fd-inputWrap {
    width: min(100%, 480px);
  }
}

@media (max-width: 480px) {
  .fd-heroPage {
    --header-h: 64px;
    --logo-h: 50px;
  }

  .fd-title {
    font-size: 28px;
    line-height: 34px;
  }

  .fd-inputWrap {
    min-width: 280px;
    height: 58px;
  }
}
`;

function ensureStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_TAG_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_TAG_ID;
  style.textContent = landingStyles;
  document.head.appendChild(style);
}

const landingMarkup = `
  <header class="fd-header">
    <div class="fd-logo"><img src="/assets/frontdash-logo.png" alt="FrontDash"></div>
    <nav class="fd-nav">
      <button class="fd-btn" type="button" data-action="restaurant-login">Restaurant Login</button>
      <button class="fd-btn" type="button" data-action="staff-login">Login as staff</button>
    </nav>
  </header>

  <main class="fd-hero">
    <h1 class="fd-title">Get delivery fast with FrontDash</h1>

    <form class="fd-searchRow" id="fd-search-form" novalidate>
      <label class="sr-only" for="fd-address">Delivery address</label>
      <div class="fd-inputWrap">
        <img src="/assets/pin.svg" alt="" aria-hidden="true" class="fd-pin">
        <input id="fd-address" type="text" placeholder="Enter your delivery address" autocomplete="street-address">
      </div>
      <button id="fd-search" class="fd-btn fd-btn--primary" type="submit" disabled>
        <span>Search Nearby</span>
        <img src="/assets/arrow-circle.svg" alt="" aria-hidden="true" class="fd-arrow">
      </button>
    </form>

    <div class="fd-register">
      <button class="fd-btn fd-btn--pale" id="fd-register-owner" type="button">REGISTER AS A RESTAURANT</button>
    </div>
  </main>
`;

export function mountLanding(root, handlers = {}) {
  if (!root) {
    throw new Error('mountLanding: root element is required');
  }

  ensureStyles();

  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--fd-base', '16px');
    document.body.style.fontSize = 'var(--fd-base)';
    document.body.classList.add('fd-landing-active');
  }

  root.classList.add('fd-heroPage');
  root.innerHTML = landingMarkup;

  const form = root.querySelector('#fd-search-form');
  const input = root.querySelector('#fd-address');
  const searchButton = root.querySelector('#fd-search');
  const registerButton = root.querySelector('#fd-register-owner');
  const restaurantButton = root.querySelector('[data-action="restaurant-login"]');
  const staffButton = root.querySelector('[data-action="staff-login"]');

  const enableSearchIfValid = () => {
    if (!searchButton || !input) return;
    searchButton.disabled = input.value.trim().length < 4;
  };

  enableSearchIfValid();

  input?.addEventListener('input', enableSearchIfValid);

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    enableSearchIfValid();
    if (searchButton?.disabled) return;
    const value = input?.value.trim();
    if (!value) return;
    handlers.onSearch?.(value);
  });

  restaurantButton?.addEventListener('click', () => {
    handlers.onRestaurantLogin?.();
  });

  staffButton?.addEventListener('click', () => {
    handlers.onStaffLogin?.();
  });

  registerButton?.addEventListener('click', () => {
    handlers.onOwnerRegister?.();
  });

  return {
    updateAddress(value) {
      if (!input) return;
      input.value = value ?? '';
      enableSearchIfValid();
    },
    destroy() {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('fd-landing-active');
        document.body.style.removeProperty('font-size');
      }
      root.classList.remove('fd-heroPage');
      root.innerHTML = '';
    },
  };
}

export default mountLanding;
