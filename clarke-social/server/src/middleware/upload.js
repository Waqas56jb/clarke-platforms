// Multipart uploads with size limits per kind and a content check: after multer saves a file, its first
// bytes are inspected and anything that is not really an allowed type is deleted and rejected.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const env = require('../config/env');
const HttpError = require('../utils/httpError');
const { sniffFile } = require('../utils/fileTypes');
const { publicPath, privatePath } = require('../utils/storage');

const IMAGES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const VIDEOS = ['video/mp4', 'video/webm', 'video/quicktime'];
const AUDIO = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg', 'audio/mp4'];
const DOCUMENTS = ['application/pdf', 'application/msword', 'application/zip', ...IMAGES];

const EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav',
  'audio/flac': '.flac',
  'audio/aac': '.aac',
  'audio/ogg': '.ogg',
  'audio/mp4': '.m4a',
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/zip': '.docx',
};

const MEDIA_MESSAGE = 'Only JPG, PNG, WEBP, GIF, MP4, WEBM and MOV files are accepted.';

// field name -> { types, message, private? }
const KINDS = {
  post: { maxMb: () => env.maxUploadMb, fields: { media: { types: [...IMAGES, ...VIDEOS], message: MEDIA_MESSAGE } } },
  story: { maxMb: () => env.maxUploadMb, fields: { media: { types: [...IMAGES, ...VIDEOS], message: MEDIA_MESSAGE } } },
  avatar: { maxMb: () => 5, fields: { avatar: { types: IMAGES, message: 'Choose a JPG, PNG, WEBP or GIF image.' } } },
  track: {
    maxMb: () => env.maxUploadMb,
    fields: {
      audio: { types: AUDIO, message: 'Choose an MP3, WAV, FLAC, AAC, OGG or M4A audio file.' },
      proof: { types: DOCUMENTS, message: 'Evidence must be a PDF, Word document or image.', private: true },
    },
  },
  movie: {
    maxMb: () => env.maxMovieUploadMb,
    fields: {
      poster: { types: IMAGES, message: 'The poster must be a JPG, PNG, WEBP or GIF image.' },
      trailer: { types: VIDEOS, message: 'The trailer must be an MP4, WEBM or MOV video.' },
      video: { types: VIDEOS, message: 'The film must be an MP4, WEBM or MOV video.', private: true },
    },
  },
};

const tempName = () => `${Date.now()}-${crypto.randomBytes(12).toString('hex')}.upload`;

function uploader(kind) {
  const spec = KINDS[kind];
  const storage = multer.diskStorage({
    destination: (_req, file, cb) => cb(null, spec.fields[file.fieldname]?.private ? env.privateDir : env.uploadDir),
    filename: (_req, _file, cb) => cb(null, tempName()),
  });
  const parse = multer({
    storage,
    limits: { fileSize: spec.maxMb() * 1024 * 1024, files: Object.keys(spec.fields).length },
    fileFilter: (_req, file, cb) => {
      if (!spec.fields[file.fieldname]) return cb(new HttpError(400, `Unexpected file field "${file.fieldname}".`));
      cb(null, true);
    },
  }).fields(Object.keys(spec.fields).map((name) => ({ name, maxCount: 1 })));

  const verify = async (req) => {
    const files = Object.values(req.files || {}).flat();
    const onDisk = files.map((f) => f.path);
    req.uploads = {};
    try {
      for (const [i, file] of files.entries()) {
        const rule = spec.fields[file.fieldname];
        const detected = await sniffFile(file.path);
        if (!detected || !rule.types.includes(detected)) throw new HttpError(400, rule.message);
        const finalName = file.filename.replace(/\.upload$/, EXTENSIONS[detected]);
        onDisk[i] = path.join(path.dirname(file.path), finalName);
        await fs.promises.rename(file.path, onDisk[i]);
        req.uploads[file.fieldname] = {
          stored: rule.private ? privatePath(finalName) : publicPath(finalName),
          type: detected,
          size: file.size,
        };
      }
    } catch (err) {
      await Promise.all(onDisk.map((p) => fs.promises.unlink(p).catch(() => {})));
      throw err;
    }
  };

  return (req, res, next) =>
    parse(req, res, (err) => {
      if (err) return next(err);
      verify(req).then(() => next(), next);
    });
}

module.exports = { uploader };
