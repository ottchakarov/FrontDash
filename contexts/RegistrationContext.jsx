import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const RegistrationContext = createContext(undefined);

export function RegistrationProvider({ children }) {
  const [registrations, setRegistrations] = useState([]);

  const registerOwner = useCallback(async (payload) => {
    const entry = {
      ...payload,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    await new Promise((resolve) => {
      setTimeout(resolve, 600);
    });

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
