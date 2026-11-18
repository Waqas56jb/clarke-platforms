// Shapes database rows for API responses.
const iso = (v) => (v ? new Date(v).toISOString() : null);
const dollars = (cents) => Number(cents) / 100;

const roles = (u) => ['investor', 'issuer', 'reviewer'].filter((r) => u[`is_${r}`]);

const toAccount = (u) =>
  u && {
    id: u.id,
    username: u.username,
    displayName: u.display_name,
    email: u.email,
    emailVerified: u.email_verified,
    roles: roles(u),
    balance: dollars(u.balance_cents),
    createdAt: iso(u.created_at),
  };

module.exports = { iso, dollars, toAccount };
