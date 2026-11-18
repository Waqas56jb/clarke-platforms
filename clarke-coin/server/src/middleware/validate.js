const { validateBody } = require('../utils/requestValidation');
const { numberSourcesOf } = require('../utils/jsonNumberSources');

// Rejects the request with FastAPI's 422 shape when headers or the JSON body are invalid.
// `extraChecks` (e.g. header rules) run first and are reported together with body errors.
// Express leaves req.body as {} when no JSON was sent, so an empty body counts as missing.
const validate =
  (schema, extraChecks = []) =>
  (req, res, next) => {
    const hasBody = Number(req.get('content-length') || 0) > 0 || req.get('transfer-encoding');
    const body = hasBody ? req.body : undefined;
    const errors = [
      ...extraChecks.map((check) => check(req)).filter(Boolean),
      ...validateBody(body, schema, numberSourcesOf(body)),
    ];
    if (errors.length) return res.status(422).json({ detail: errors });
    next();
  };

module.exports = validate;
