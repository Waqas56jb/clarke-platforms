export function initials(name = 'C') {
  return (
    String(name)
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((x) => x[0])
      .join('')
      .toUpperCase() || 'C'
  );
}

export const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : '');

export function timeAgo(value) {
  const seconds = Math.max(0, (Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`;
  return new Date(value).toLocaleDateString();
}

export const formatSeconds = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

export const money = (cents, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);

export const PLAN_NAMES = {
  supporter_monthly: 'Clarke Supporter',
  creator_monthly: 'Clarke Creator Plus',
  dating_plus_monthly: 'Clarke Dating Plus',
  dating_vip_monthly: 'Clarke Dating VIP',
};
