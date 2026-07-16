// Format naira currency
export const formatNaira = (amount) =>
  '₦' + Number(amount).toLocaleString('en-NG');

// Format date for receipts and reports
export const formatDate = (isoString) => {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-NG', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

export const formatTime = (isoString) => {
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
};

export const formatDateTime = (isoString) =>
  `${formatDate(isoString)}, ${formatTime(isoString)}`;

// Generate a unique product ID
export const genId = (prefix = 'p') =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

// Stock status helper
export const stockStatus = (product) => {
  if (product.stock === 0)                             return 'out';
  if (product.stock <= product.lowStockThreshold)      return 'low';
  return 'ok';
};

// Group sales by day for charts
export const groupSalesByDay = (sales, days = 7) => {
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('en-NG', { weekday: 'short' });
    const dateStr = d.toDateString();
    const daySales = sales.filter(s => new Date(s.date).toDateString() === dateStr);
    result.push({
      label,
      total: daySales.reduce((s, sale) => s + sale.total, 0),
      count: daySales.length,
    });
  }
  return result;
};
