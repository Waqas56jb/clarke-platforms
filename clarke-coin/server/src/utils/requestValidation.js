// Builds FastAPI-style 422 errors: {"detail": [{type, loc, msg, input, ctx?}, ...]}.
const { decimalText, validateDecimal } = require('./decimal');

const EMAIL_LOCAL = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;
const EMAIL_DOMAIN = /^(?=.{1,253}$)([A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/;

const issue = (type, loc, msg, input, ctx) => ({ type, loc, msg, input, ...(ctx ? { ctx } : {}) });

function emailProblem(value) {
  if (!value.includes('@')) return 'An email address must have an @-sign.';
  const at = value.lastIndexOf('@');
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  if (!local || local.length > 64 || !EMAIL_LOCAL.test(local)) return 'The email address is not valid.';
  if (!domain.includes('.')) return 'The part after the @-sign is not valid. It should have a period.';
  if (!EMAIL_DOMAIN.test(domain) || value.length > 254) return 'The email address is not valid.';
  return null;
}

const checkers = {
  string(value, loc, rule) {
    if (typeof value !== 'string') return issue('string_type', loc, 'Input should be a valid string', value);
    if (rule.minLength !== undefined && value.length < rule.minLength)
      return issue(
        'string_too_short',
        loc,
        `String should have at least ${rule.minLength} character${rule.minLength === 1 ? '' : 's'}`,
        value,
        { min_length: rule.minLength }
      );
    if (rule.maxLength !== undefined && value.length > rule.maxLength)
      return issue('string_too_long', loc, `String should have at most ${rule.maxLength} characters`, value, {
        max_length: rule.maxLength,
      });
    return null;
  },
  email(value, loc) {
    if (typeof value !== 'string') return issue('string_type', loc, 'Input should be a valid string', value);
    const problem = emailProblem(value);
    return problem
      ? issue('value_error', loc, `value is not a valid email address: ${problem}`, value, { reason: problem })
      : null;
  },
  decimal(value, loc, rule, source) {
    const text = decimalText(value, source);
    const result = text === null ? { error: 'decimal_type' } : validateDecimal(text, rule);
    const messages = {
      decimal_type: 'Decimal input should be an integer, float, string or Decimal object',
      decimal_parsing: 'Input should be a valid decimal',
      greater_than: 'Input should be greater than 0',
      decimal_max_digits: `Decimal input should have no more than ${rule.maxDigits} digits in total`,
      decimal_max_places: `Decimal input should have no more than ${rule.decimalPlaces} decimal places`,
    };
    if (!result.error) return null;
    const ctx =
      result.error === 'greater_than'
        ? { gt: 0 }
        : result.error === 'decimal_max_digits'
          ? { max_digits: rule.maxDigits }
          : result.error === 'decimal_max_places'
            ? { decimal_places: rule.decimalPlaces }
            : undefined;
    return issue(result.error, loc, messages[result.error], value, ctx);
  },
};

// Validates a JSON body against { field: { type, required?, nullable?, ...limits } }.
function validateBody(body, schema, sources = {}) {
  if (body === undefined) return [issue('missing', ['body'], 'Field required', null)];
  if (body === null || typeof body !== 'object' || Array.isArray(body))
    return [
      issue(
        'model_attributes_type',
        ['body'],
        'Input should be a valid dictionary or object to extract fields from',
        body
      ),
    ];
  const errors = [];
  for (const [field, rule] of Object.entries(schema)) {
    const loc = ['body', field];
    const value = body[field];
    if (value === undefined) {
      if (rule.required) errors.push(issue('missing', loc, 'Field required', body));
      continue;
    }
    if (value === null && rule.nullable) continue;
    const problem = checkers[rule.type](value, loc, rule, sources[field]);
    if (problem) errors.push(problem);
  }
  return errors;
}

function validateInt(value, loc, fallback) {
  if (value === undefined) return { value: fallback };
  if (!/^\s*[+-]?\d+\s*$/.test(String(value)))
    return {
      error: issue('int_parsing', loc, 'Input should be a valid integer, unable to parse string as an integer', value),
    };
  return { value: Number(value) };
}

function validateRequiredString(value, loc, rule = {}) {
  if (value === undefined) return issue('missing', loc, 'Field required', null);
  return checkers.string(value, loc, rule);
}

module.exports = { validateBody, validateInt, validateRequiredString };
