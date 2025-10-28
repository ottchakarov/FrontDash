export const SALES_TAX_RATE = 0.0825;
export const SERVICE_FEE = 3.5;

export function formatCurrency(amount) {
  const value = Number.isFinite(amount) ? amount : 0;
  return `$${value.toFixed(2)}`;
}

export function calculateCharges(subtotal) {
  const safeSubtotal = Number.isFinite(subtotal) ? subtotal : 0;
  const tax = Number((safeSubtotal * SALES_TAX_RATE).toFixed(2));
  const fees = safeSubtotal > 0 ? SERVICE_FEE : 0;
  const total = Number((safeSubtotal + tax + fees).toFixed(2));
  return { subtotal: Number(safeSubtotal.toFixed(2)), tax, fees, total };
}
