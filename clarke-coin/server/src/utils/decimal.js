// Decimal handling that mirrors Pydantic's Decimal(max_digits, decimal_places, gt=0) validation,
// without converting through binary floating point.

const DECIMAL_PATTERN = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/;

// Python turns a JSON float into float and then Decimal(repr(float)), e.g. 10.0 -> "10.0".
function pythonFloatRepr(x) {
  if (Number.isInteger(x) && Math.abs(x) < 1e16) return x.toFixed(1);
  return String(x);
}

// `source` is the literal JSON text of a number when the runtime exposes it (Node 21+).
function decimalText(value, source) {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) {
    const literal = source || String(value);
    return /[.eE]/.test(literal) ? pythonFloatRepr(value) : literal;
  }
  return null;
}

// Splits into sign, digit string and base-10 exponent, like Decimal.as_tuple().
function parseDecimal(text) {
  if (!DECIMAL_PATTERN.test(text)) return null;
  const negative = text.startsWith('-');
  const unsigned = text.replace(/^[+-]/, '');
  const [mantissa, expPart] = unsigned.split(/[eE]/);
  const [intPart, fracPart = ''] = mantissa.split('.');
  const digits = `${intPart}${fracPart}`.replace(/^0+(?=\d)/, '');
  return { negative, digits, exponent: Number(expPart || 0) - fracPart.length };
}

function validateDecimal(text, { maxDigits, decimalPlaces }) {
  const d = parseDecimal(text);
  if (!d) return { error: 'decimal_parsing' };
  const isZero = /^0*$/.test(d.digits);
  if (d.negative || isZero) return { error: 'greater_than' };
  // Trailing zeros after the decimal point do not count, as with Decimal.normalize().
  const trimmed = d.digits.replace(/0+$/, '');
  const stripped = d.digits.length - trimmed.length;
  const exponent = d.exponent + stripped;
  const places = exponent < 0 ? -exponent : 0;
  const total = exponent >= 0 ? trimmed.length + exponent : Math.max(trimmed.length, places);
  if (total > maxDigits) return { error: 'decimal_max_digits' };
  if (places > decimalPlaces) return { error: 'decimal_max_places' };
  return { value: text };
}

module.exports = { decimalText, validateDecimal };
