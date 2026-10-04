const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
export const money = (n) => inr.format(Number(n) || 0);

export const fmtDate = (d, withTime = false) =>
  new Date(d).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });

export const discountPct = (p) => (p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0);

// Keep these in sync with server/src/routes/orders.js (the server is authoritative)
export const FREE_SHIPPING_ABOVE = 999;
export const SHIPPING_FEE = 49;
export const TAX_RATE = 0.18;

export const calcTotals = (itemsPrice) => {
  const shipping = itemsPrice === 0 || itemsPrice >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;
  const tax = Math.round(itemsPrice * TAX_RATE * 100) / 100;
  return { shipping, tax, total: Math.round((itemsPrice + shipping + tax) * 100) / 100 };
};

export const STEPS = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
export const ALL_STATUSES = [...STEPS, 'Cancelled'];

export const statusTone = (s) => (s === 'Delivered' ? 'success' : s === 'Cancelled' ? 'danger' : s === 'Placed' ? '' : 'warn');
