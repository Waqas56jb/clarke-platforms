const DAY_MS = 86400000;
const startOfDay = (value) => new Date(value).setHours(0, 0, 0, 0);

export const clockTime = (value) =>
  new Date(value).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

// Conversation list: time today, weekday this week, otherwise a short date.
export function shortTime(value) {
  const days = Math.round((startOfDay(Date.now()) - startOfDay(value)) / DAY_MS);
  if (days <= 0) return clockTime(value);
  if (days === 1) return 'Yesterday';
  if (days < 7) return new Date(value).toLocaleDateString(undefined, { weekday: 'short' });
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Day separators inside a thread.
export function dayLabel(value) {
  const days = Math.round((startOfDay(Date.now()) - startOfDay(value)) / DAY_MS);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return new Date(value).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

export const dayKey = (value) => new Date(value).toDateString();
