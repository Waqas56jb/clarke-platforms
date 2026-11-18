const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const env = require('../config/env');

fs.mkdirSync(env.uploadDir, { recursive: true });

const ALLOWED_TYPES = /^(image\/(jpeg|png|webp|gif)|video\/(mp4|webm|quicktime))$/;
const TYPE_ERROR = 'Only JPG, PNG, WEBP, GIF, MP4, WEBM and MOV files are accepted.';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.uploadDir),
  filename: (_req, file, cb) =>
    cb(null, `${Date.now()}-${crypto.randomBytes(12).toString('hex')}${path.extname(file.originalname).toLowerCase()}`),
});

const upload = multer({
  storage,
  limits: { fileSize: env.maxUploadMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_TYPES.test(file.mimetype)) return cb(new Error(TYPE_ERROR));
    cb(null, true);
  },
});

module.exports = { upload, TYPE_ERROR };
