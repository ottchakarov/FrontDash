import React, { useEffect, useRef } from 'react';
import mountLanding from '../landing';

export default function Landing({
  onSearch,
  onRestaurantLogin,
  onStaffLogin,
  onOwnerRegister,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const handlers = {
      onSearch,
      onRestaurantLogin,
      onStaffLogin,
      onOwnerRegister,
    };

    const controller = mountLanding(root, handlers);

    return () => {
      controller?.destroy?.();
    };
  }, [onSearch, onRestaurantLogin, onStaffLogin, onOwnerRegister]);

  return <div ref={containerRef} />;
}
