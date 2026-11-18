const HttpError = require('../utils/httpError');

const notFound = (_req, res) => res.status(404).json({ detail: 'Not Found' });
const methodNotAllowed = (_req, res) => res.status(405).json({ detail: 'Method Not Allowed' });

// Express identifies error handlers by their four-argument signature.
function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) return res.status(err.status).json({ detail: err.message });
  if (err.type === 'entity.parse.failed')
    return res.status(422).json({
      detail: [
        { type: 'json_invalid', loc: ['body', 0], msg: 'JSON decode error', input: {}, ctx: { error: err.message } },
      ],
    });
  if (err.type === 'entity.too.large') return res.status(413).json({ detail: 'Request Entity Too Large' });
  console.error(err);
  res.status(500).json({ detail: 'Internal Server Error' });
}

module.exports = { notFound, methodNotAllowed, errorHandler };
