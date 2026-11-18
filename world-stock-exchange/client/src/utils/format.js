const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const eur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' });

// Practice balances and instrument prices are in US dollars.
export const money = (n) => usd.format(Number(n) || 0);

export const euros = (n) => eur.format(Number(n) || 0);

export const signedMoney = (n) => `${n > 0 ? '+' : ''}${money(n)}`;

// Company-share prices keep the listing currency and four decimals, as on the original page.
export const sharePrice = (currency, price) => `${currency} ${Number(price).toFixed(4)}`;

export const currencyAmount = (currency, amount) => `${currency} ${Number(amount).toFixed(2)}`;

export const count = (n) => Number(n).toLocaleString('en-US');

export const percent = (n) => `${n > 0 ? '+' : ''}${Number(n).toFixed(2)}%`;

export const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : '');

export const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '');

export function initials(name = 'W') {
  return (
    String(name)
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((x) => x[0])
      .join('')
      .toUpperCase() || 'W'
  );
}

export const fileSize = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
