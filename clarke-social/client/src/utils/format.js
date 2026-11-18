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

// SQLite CURRENT_TIMESTAMP values are UTC without a zone suffix.
export const formatUtcTimestamp = (value) => new Date(`${value}Z`).toLocaleString();

export const formatSeconds = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
