export function formatNumber(value, decimals = 0) {
  if (value == null || isNaN(value)) return '-';
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value, decimals = 1) {
  if (value == null || isNaN(value)) return '-';
  return `${formatNumber(value, decimals)} %`;
}

export function formatCurrency(value, unit = 'EUR') {
  if (value == null || isNaN(value)) return '-';
  return `${formatNumber(value, 2)} ${unit}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('de-DE');
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleString('de-DE');
  } catch {
    return dateStr;
  }
}
