import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const API_BASE = 'http://localhost:8080/api';

const RegistrationContext = createContext(undefined);

export function RegistrationProvider({ children }) {
  const [registrations, setRegistrations] = useState([]);

  const registerOwner = useCallback(async (payload) => {
    const entry = {
      ...payload,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${API_BASE}/restaurants/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const saved = await response.json();
        const normalized = {
          ...entry,
          approvalStatus: saved.approvalStatus || payload.approvalStatus || 'pending',
          operatingHours: payload.operatingHours || [],
          id: saved.restaurantId || entry.id,
          restaurantName: saved.restaurantName || entry.restaurantName,
          contactEmail: saved.email || entry.contactEmail,
          contactPhone: saved.phone || entry.contactPhone,
          contactName: saved.humanContactName || entry.contactName,
        };
        setRegistrations((prev) => [...prev, normalized]);
        return normalized;
      }
    } catch (err) {
      // fall back to local session storage below
      // console.error('Register owner failed, falling back to local list', err);
    }

    setRegistrations((prev) => [...prev, entry]);
    return entry;
  }, []);

  const value = useMemo(
    () => ({
      registrations,
      registerOwner,
    }),
    [registerOwner, registrations]
  );

  return <RegistrationContext.Provider value={value}>{children}</RegistrationContext.Provider>;
}

export function useRegistration() {
  const context = useContext(RegistrationContext);

  if (!context) {
    throw new Error('useRegistration must be used within a RegistrationProvider');
  }

  return context;
}
