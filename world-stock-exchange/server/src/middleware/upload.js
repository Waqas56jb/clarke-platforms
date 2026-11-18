// Listing document uploads: one file per request, size-limited, checked by its content (first bytes),
// renamed to a random name with the detected extension and stored in the private folder.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const env = require('../config/env');
const HttpError = require('../utils/httpError');
const { sniffFile } = require('../utils/fileTypes');
const { privatePath } = require('../utils/storage');

// PDF, Word (.doc and .docx, which is a zip container) and scanned images.
const EXTENSIONS = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/zip': '.docx',
  'image/jpeg': '.jpg',
  'image/png': '.png',
};

const storage = multer.diskStorage({
  destination: env.privateDir,
  filename: (_req, _file, cb) => cb(null, `upload-${crypto.randomBytes(16).toString('hex')}`),
});

const receive = multer({ storage, limits: { fileSize: env.maxDocumentMb * 1024 * 1024, files: 1 } }).single('file');

function uploadDocument(req, res, next) {
  receive(req, res, async (err) => {
    if (err) return next(err);
    if (!req.file) return next(new HttpError(400, 'Choose a document to upload.'));
    const temp = req.file.path;
    try {
      const type = await sniffFile(temp);
      if (!EXTENSIONS[type]) {
        await fs.promises.unlink(temp).catch(() => {});
        return next(new HttpError(400, 'Documents must be PDF, Word (.doc/.docx), JPEG or PNG files.'));
      }
      const name = `doc-${crypto.randomBytes(16).toString('hex')}${EXTENSIONS[type]}`;
      await fs.promises.rename(temp, path.join(env.privateDir, name));
      req.upload = {
        stored: privatePath(name),
        type,
        size: req.file.size,
        originalName: path.basename(String(req.file.originalname || 'document')).slice(0, 200),
      };
      next();
    } catch (e) {
      await fs.promises.unlink(temp).catch(() => {});
      next(e);
    }
  });
}

module.exports = { uploadDocument };
