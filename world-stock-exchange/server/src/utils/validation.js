const HttpError = require('./httpError');

const text = (value, field, { max, required = true } = {}) => {
  const v = typeof value === 'string' ? value.trim() : '';
  if (required && !v) throw new HttpError(400, `${field} is required.`);
  if (max && v.length > max) throw new HttpError(400, `${field} must be ${max} characters or fewer.`);
  return v;
};

const oneOf = (value, field, allowed) => {
  if (!allowed.includes(value)) throw new HttpError(400, `${field} is not a valid option.`);
  return value;
};

const isHttpUrl = (v) => {
  try {
    return ['http:', 'https:'].includes(new URL(v).protocol);
  } catch {
    return false;
  }
};

module.exports = { text, oneOf, isHttpUrl };
