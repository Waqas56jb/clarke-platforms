const multer = require('multer');
const env = require('../config/env');
const HttpError = require('../utils/httpError');
const { TYPE_ERROR } = require('./upload');

// Express identifies error handlers by their four-argument signature.
function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  console.error(err.message);
  if (err instanceof multer.MulterError) {
    return res
      .status(400)
      .json({ error: err.code === 'LIMIT_FILE_SIZE' ? `File exceeds ${env.maxUploadMb} MB.` : 'Upload failed.' });
  }
  if (err.message === TYPE_ERROR) return res.status(400).json({ error: err.message });
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
}

module.exports = errorHandler;
