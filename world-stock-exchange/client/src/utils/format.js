export const money = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const euros = (n) => '€' + n.toFixed(2);

export const formatDateTime = (iso) => new Date(iso).toLocaleString();

export const remainingOf = (app) => Number(app.remainingShares ?? app.shares);
