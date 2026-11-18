// The single place errors become HTTP responses. Known errors return their message; anything
// unexpected is logged on the server and the client only sees a generic message (never a stack trace).
const multer = require('multer');
const env = require('../config/env');
const HttpError = require('../utils/httpError');

function notFound(_req, res) {
  res.status(404).json({ error: 'Not found.' });
}

const MULTER_MESSAGES = {
  LIMIT_FILE_SIZE: () => `That file is too large. Documents can be up to ${env.maxDocumentMb} MB.`,
  LIMIT_FILE_COUNT: () => 'Too many files in one upload.',
  LIMIT_UNEXPECTED_FILE: () => 'Unexpected file in the upload.',
};

// Express identifies error handlers by their four-argument signature.
function errorHandler(err, _req, res, _next) {
  if (res.headersSent) return;
  if (err instanceof HttpError)
    return res.status(err.status).json({ error: err.message, ...(err.code ? { code: err.code } : {}) });
  if (err instanceof multer.MulterError)
    return res.status(400).json({ error: (MULTER_MESSAGES[err.code] || (() => 'Upload failed.'))() });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'The request body is not valid JSON.' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'The request is too large.' });
  if (err.status === 404 || err.statusCode === 404) return res.status(404).json({ error: 'Not found.' });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
}

module.exports = { notFound, errorHandler };
