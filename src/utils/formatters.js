export function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return 'Not disclosed';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function formatPercent(value) {
  if (value === null || value === undefined || value === '') return 'N/A';
  return `${Number(value)}%`;
}

export function safeText(value, fallback = 'Information pending') {
  return value || fallback;
}
