import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { RegistrationProvider } from './contexts/RegistrationContext';
import { RestaurantDataProvider } from './contexts/RestaurantDataContext';
import { OrderProvider } from './contexts/OrderContext';
import { CustomerSessionProvider } from './contexts/CustomerSessionContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <AuthProvider>
      <RestaurantDataProvider>
        <OrderProvider>
          <CustomerSessionProvider>
            <RegistrationProvider>
              <App />
            </RegistrationProvider>
          </CustomerSessionProvider>
        </OrderProvider>
      </RestaurantDataProvider>
    </AuthProvider>
  </BrowserRouter>
);
