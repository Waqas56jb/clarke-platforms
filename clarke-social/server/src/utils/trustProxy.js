// Parses the Express "trust proxy" setting: unset/"false" = off, a number = proxy hops, "true" or a
// subnet list passed through. On Railway the client IP is two hops away (client, Railway edge).
module.exports = (value) => {
  if (!value || value === 'false') return false;
  if (value === 'true') return true;
  return /^\d+$/.test(value) ? Number(value) : value;
};
